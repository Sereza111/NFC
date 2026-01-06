/**
 * Интеграция с DaData API для получения РЕАЛЬНЫХ отделений Почты России
 * 
 * Регистрация: https://dadata.ru
 * Документация: https://dadata.ru/api/suggest/postal_unit/
 */

/**
 * Класс для работы с DaData API
 */
export class DaDataPostOfficeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseUrl = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'
  }

  /**
   * Поиск отделений по индексу или адресу
   * @param {string} query - Поисковый запрос (индекс или адрес)
   * @param {number} count - Количество результатов (по умолчанию 50)
   */
  async searchPostOffices(query, count = 50) {
    try {
      // Для поиска ВСЕХ отделений в регионе нужно использовать wildcards
      const searchQuery = query.length === 6 ? query.substring(0, 3) + '*' : query
      
      const response = await fetch(`${this.baseUrl}/suggest/postal_unit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${this.apiKey}`
        },
        body: JSON.stringify({
          query: searchQuery,
          count: count,
          locations: query.length === 6 ? [{
            postal_code: query.substring(0, 3) + '*'
          }] : undefined
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DaData API error response:', errorText)
        throw new Error(`DaData API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`[DaData] Получено результатов: ${data.suggestions?.length || 0}`)
      
      return {
        success: true,
        offices: this.formatDaDataOffices(data.suggestions || [])
      }
    } catch (error) {
      console.error('DaData API error:', error)
      return {
        success: false,
        error: error.message,
        offices: []
      }
    }
  }

  /**
   * Поиск ближайших отделений по координатам
   * @param {number} lat - Широта
   * @param {number} lon - Долгота
   * @param {number} radiusKm - Радиус поиска в км
   */
  async findNearbyOffices(lat, lon, radiusKm = 5) {
    try {
      const response = await fetch(`${this.baseUrl}/suggest/postal_unit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${this.apiKey}`
        },
        body: JSON.stringify({
          locations: [{
            postal_code: '*'
          }],
          locations_boost: [{
            kladr_id: '*'
          }],
          count: 50
        })
      })

      if (!response.ok) {
        throw new Error(`DaData API error: ${response.status}`)
      }

      const data = await response.json()
      let offices = this.formatDaDataOffices(data.suggestions)
      
      // Фильтруем по расстоянию
      offices = offices.filter(office => {
        if (!office.latitude || !office.longitude) return false
        const distance = this.calculateDistance(lat, lon, office.latitude, office.longitude)
        return distance <= radiusKm
      })

      // Сортируем по расстоянию
      offices.sort((a, b) => {
        const distA = this.calculateDistance(lat, lon, a.latitude, a.longitude)
        const distB = this.calculateDistance(lat, lon, b.latitude, b.longitude)
        return distA - distB
      })

      return {
        success: true,
        offices: offices
      }
    } catch (error) {
      console.error('DaData nearby search error:', error)
      return {
        success: false,
        error: error.message,
        offices: []
      }
    }
  }

  /**
   * Форматирование данных из DaData в наш формат
   */
  formatDaDataOffices(suggestions) {
    if (!suggestions || !Array.isArray(suggestions)) {
      console.warn('[DaData] Нет данных для форматирования')
      return []
    }

    console.log(`[DaData] Форматирование ${suggestions.length} отделений`)
    
    return suggestions.map((item, index) => {
      const data = item.data || {}
      
      // Формируем полный адрес
      let fullAddress = item.value || ''
      if (!fullAddress && data.address_str) {
        fullAddress = data.address_str
      }
      
      // Формируем график работы
      let workTime = this.formatWorkSchedule(data.schedule)
      if (!workTime && data.work_time) {
        workTime = data.work_time
      }
      
      const office = {
        id: data.postal_code || `office-${index}`,
        postalCode: data.postal_code,
        address: fullAddress,
        city: data.city || data.settlement || data.region,
        street: data.street,
        house: data.house,
        
        // Время работы (реальное из DaData или null)
        workTime: workTime || 'Уточняйте по телефону',
        
        // Координаты
        latitude: data.geo_lat ? parseFloat(data.geo_lat) : null,
        longitude: data.geo_lon ? parseFloat(data.geo_lon) : null,
        
        // Контакты
        phone: data.phone || null,
        email: data.email || null,
        
        // Тип отделения
        type: data.type_code,
        typeName: data.type,
        
        // Услуги
        services: this.parseServices(data),
        
        // Дополнительно
        isMainOffice: data.is_main_office === 'true' || data.is_main_office === true,
        hasPostomat: data.has_postomat === 'true' || data.has_postomat === true,
        
        // Расстояние (будет рассчитано позже)
        distance: null,
        
        // Исходные данные
        raw: data
      }
      
      return office
    }).filter(office => office.postalCode) // Только отделения с индексом
  }

  /**
   * Форматирование расписания работы
   */
  formatWorkSchedule(schedule) {
    if (!schedule) return null
    
    // DaData может возвращать расписание в разных форматах
    if (typeof schedule === 'string') {
      return schedule
    }
    
    // Если это объект с детальным расписанием
    if (typeof schedule === 'object' && schedule.hours) {
      return schedule.hours
    }
    
    return null
  }

  /**
   * Парсинг услуг отделения
   */
  parseServices(data) {
    const services = []
    
    if (data.has_parcels === 'true') services.push('Посылки')
    if (data.has_ems === 'true') services.push('EMS')
    if (data.has_payment === 'true') services.push('Платежи')
    if (data.has_letters === 'true') services.push('Письма')
    if (data.has_postomat === 'true') services.push('Постамат')
    
    return services
  }

  /**
   * Расчет расстояния между двумя точками (формула Гаверсинуса)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Радиус Земли в км
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180)
  }
}

/**
 * Yandex Maps API для поиска отделений на карте
 */
export class YandexMapsPostOfficeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.searchUrl = 'https://search-maps.yandex.ru/v1/'
  }

  /**
   * Поиск отделений Почты России на карте
   */
  async searchOffices(latitude, longitude, radius = 5000) {
    try {
      const params = new URLSearchParams({
        apikey: this.apiKey,
        text: 'Почта России',
        ll: `${longitude},${latitude}`,
        spn: '0.1,0.1',
        type: 'biz',
        lang: 'ru_RU',
        results: 50
      })

      const response = await fetch(`${this.searchUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Yandex API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        offices: this.formatYandexOffices(data.features, latitude, longitude)
      }
    } catch (error) {
      console.error('Yandex Maps API error:', error)
      return {
        success: false,
        error: error.message,
        offices: []
      }
    }
  }

  /**
   * Форматирование данных Яндекс.Карт
   */
  formatYandexOffices(features, userLat, userLon) {
    if (!features || !Array.isArray(features)) return []

    return features.map(feature => {
      const props = feature.properties || {}
      const company = props.CompanyMetaData || {}
      const geo = feature.geometry?.coordinates || []
      
      const lon = geo[0]
      const lat = geo[1]
      
      // Рассчитываем расстояние
      let distance = null
      if (lat && lon && userLat && userLon) {
        const dist = this.calculateDistance(userLat, userLon, lat, lon)
        distance = `${dist.toFixed(1)} км`
      }
      
      return {
        id: company.id || props.name,
        address: props.description || company.address,
        name: props.name,
        
        // Координаты
        latitude: lat,
        longitude: lon,
        
        // Время работы
        workTime: company.Hours?.text || 'Уточняйте по телефону',
        
        // Контакты
        phone: company.Phones?.[0]?.formatted,
        
        // Расстояние
        distance: distance,
        
        // Ссылка на Яндекс.Карты
        url: company.url,
        
        raw: feature
      }
    })
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}

export default DaDataPostOfficeAPI

