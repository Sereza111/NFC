import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DeliverySelector = ({ onDeliverySelect, initialDelivery = null }) => {
  const [deliveryMethods, setDeliveryMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [deliveryCost, setDeliveryCost] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const [postOffices, setPostOffices] = useState([])
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [loadingOffices, setLoadingOffices] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  
  // Автоподстановка адресов
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Загрузить доступные способы доставки при монтировании
  useEffect(() => {
    fetchDeliveryMethods()
  }, [])

  // Загрузить начальные данные доставки
  useEffect(() => {
    if (initialDelivery) {
      setSelectedMethod(initialDelivery.method)
      setDeliveryAddress(initialDelivery.address || '')
      setPostalCode(initialDelivery.postalCode || '')
      if (initialDelivery.cost !== undefined) {
        setDeliveryCost({
          cost: initialDelivery.cost,
          deliveryMin: initialDelivery.deliveryMin,
          deliveryMax: initialDelivery.deliveryMax
        })
      }
    }
  }, [initialDelivery])

  const fetchDeliveryMethods = async () => {
    try {
      const res = await fetch('/api/delivery/methods')
      const data = await res.json()
      
      if (data.ok && data.methods) {
        setDeliveryMethods(data.methods)
        
        // Автоматически выбрать первый метод (стандартная посылка) БЕЗ расчета стоимости
        if (data.methods.length > 0 && !selectedMethod) {
          const defaultMethod = data.methods[0]
          setSelectedMethod(defaultMethod.id)
          // НЕ вызываем calculateDelivery автоматически
        }
      }
    } catch (error) {
      console.error('Error fetching delivery methods:', error)
      
      // Fallback на случай ошибки
      const fallbackMethods = [
        {
          id: 'russian-post-parcel',
          name: 'Почта России — Посылка',
          type: 'parcel',
          description: 'Стандартная доставка посылкой',
          deliveryMin: 5,
          deliveryMax: 10,
          icon: '📦'
        }
      ]
      setDeliveryMethods(fallbackMethods)
      setSelectedMethod(fallbackMethods[0].id)
      // НЕ вызываем calculateDelivery автоматически
    }
  }

  const calculateDelivery = async (mailType) => {
    setCalculating(true)
    
    try {
      const res = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mailType,
          postalCode: postalCode || null,
          weight: 50,
          declaredValue: 1990
        })
      })
      
      const data = await res.json()
      
      if (data.ok) {
        setDeliveryCost({
          cost: data.cost || 0,
          deliveryMin: data.deliveryMin,
          deliveryMax: data.deliveryMax,
          details: data.details
        })
        
        // Уведомить родительский компонент
        notifyParent(mailType, data)
      }
    } catch (error) {
      console.error('Error calculating delivery:', error)
      
      // Fallback значения
      setDeliveryCost({
        cost: 0,
        deliveryMin: 5,
        deliveryMax: 10
      })
    } finally {
      setCalculating(false)
    }
  }

  const notifyParent = (mailType, costData) => {
    const method = deliveryMethods.find(m => m.type === mailType)
    
    if (onDeliverySelect) {
      onDeliverySelect({
        method: method?.id || 'russian-post-parcel',
        methodName: method?.name || 'Почта России',
        type: mailType,
        cost: costData.cost || 0,
        deliveryMin: costData.deliveryMin,
        deliveryMax: costData.deliveryMax,
        address: deliveryAddress,
        postalCode: postalCode
      })
    }
  }

  const handleMethodSelect = (method) => {
    setSelectedMethod(method.id)
    // Рассчитываем только если указан индекс или выбрано отделение
    if (postalCode.length === 6 || selectedOffice) {
      calculateDelivery(method.type)
    }
  }

  // Поиск отделений Почты России по индексу (РЕАЛЬНЫЙ API)
  const searchPostOffices = async (index) => {
    if (index.length !== 6) return
    
    setLoadingOffices(true)
    
    try {
      console.log(`Поиск отделений для индекса: ${index}`)
      
      // Получаем геолокацию пользователя (опционально)
      let location = null
      try {
        if (navigator.geolocation) {
          location = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }),
              () => resolve(null), // Игнорируем ошибку, продолжаем без геолокации
              { timeout: 5000 }
            )
          })
          
          if (location) {
            setUserLocation(location)
            console.log('✅ Геолокация получена:', location)
          }
        }
      } catch (geoError) {
        console.log('Геолокация недоступна, поиск без сортировки по расстоянию')
      }

      // Запрос к реальному API
      const params = new URLSearchParams()
      if (location) {
        params.append('latitude', location.latitude)
        params.append('longitude', location.longitude)
      }
      
      const url = `/api/delivery/offices/${index}${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.ok && data.offices) {
        console.log(`✅ Найдено отделений: ${data.offices.length}`, `Источник: ${data.source}`)
        setPostOffices(data.offices)
        
        if (data.offices.length > 0) {
          setShowAddressForm(true)
        }
      } else {
        console.warn('Отделения не найдены')
        setPostOffices([])
      }
    } catch (error) {
      console.error('Ошибка поиска отделений:', error)
      setPostOffices([])
    } finally {
      setLoadingOffices(false)
    }
  }

  // Выбор отделения
  const handleOfficeSelect = async (office) => {
    console.log('✅ Выбрано отделение:', office)
    setSelectedOffice(office)
    setDeliveryAddress(office.address)
    setPostalCode(office.postalCode || '')
    
    // ОБЯЗАТЕЛЬНО рассчитать стоимость доставки для выбранного отделения
    if (selectedMethod) {
      const method = deliveryMethods.find(m => m.id === selectedMethod)
      console.log(`💰 Расчет доставки для метода: ${method?.type}`)
      await calculateDelivery(method?.type || 'parcel')
    } else {
      // Если метод не выбран - выбираем первый (посылка)
      if (deliveryMethods.length > 0) {
        const defaultMethod = deliveryMethods[0]
        setSelectedMethod(defaultMethod.id)
        console.log(`🎯 Автовыбор метода: ${defaultMethod.type}`)
        await calculateDelivery(defaultMethod.type)
      }
    }
  }

  const handleAddressChange = async (e) => {
    const value = e.target.value
    setDeliveryAddress(value)
    
    // Сбрасываем стоимость доставки при изменении адреса
    setDeliveryCost(null)
    setSelectedOffice(null)
    setPostOffices([])
    
    // Подсказки адресов (автокомплит)
    if (value.length >= 3) {
      await fetchAddressSuggestions(value)
    } else {
      setAddressSuggestions([])
      setShowSuggestions(false)
    }
  }
  
  // Получить подсказки адресов (как на Озоне)
  const fetchAddressSuggestions = async (query) => {
    setLoadingSuggestions(true)
    
    try {
      const res = await fetch(`/api/delivery/address-suggestions?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      
      if (data.ok && data.suggestions) {
        setAddressSuggestions(data.suggestions)
        setShowSuggestions(data.suggestions.length > 0)
      }
    } catch (error) {
      console.error('Ошибка получения подсказок:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }
  
  // Выбор адреса из подсказок
  const handleSuggestionSelect = async (suggestion) => {
    console.log('✅ Выбран адрес:', suggestion)
    setDeliveryAddress(suggestion.value)
    setShowSuggestions(false)
    setAddressSuggestions([])
    
    // Сохраняем координаты для точного поиска
    if (suggestion.data.latitude && suggestion.data.longitude) {
      setUserLocation({
        latitude: parseFloat(suggestion.data.latitude),
        longitude: parseFloat(suggestion.data.longitude)
      })
    }
    
    // Сохраняем индекс если есть
    if (suggestion.data.postalCode) {
      setPostalCode(suggestion.data.postalCode)
    }
    
    // ВАЖНО: Ищем по ГОРОДУ, а не по индексу!
    // Индекс может быть общий для большого региона
    const searchQuery = suggestion.data.city || suggestion.data.region || suggestion.value
    
    console.log(`🔍 Поиск отделений для: "${searchQuery}"`)
    console.log(`📍 Координаты: ${suggestion.data.latitude}, ${suggestion.data.longitude}`)
    console.log(`📮 Индекс: ${suggestion.data.postalCode}`)
    
    // Ищем отделения по городу с учетом координат
    await searchOfficesByAddress(searchQuery)
  }

  // Поиск отделений по адресу (а не только по индексу)
  const searchOfficesByAddress = async (address) => {
    setLoadingOffices(true)
    
    try {
      console.log(`🔍 Поиск отделений по адресу: "${address}"`)
      
      // Получаем геолокацию
      let location = userLocation
      if (!location && navigator.geolocation) {
        console.log('Запрос геолокации...')
        location = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('✅ Геолокация получена')
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
            },
            (error) => {
              console.log('❌ Геолокация недоступна:', error.message)
              resolve(null)
            },
            { timeout: 5000 }
          )
        })
        if (location) setUserLocation(location)
      }

      // Запрос к API с адресом
      const params = new URLSearchParams({ address })
      if (location) {
        params.append('latitude', location.latitude)
        params.append('longitude', location.longitude)
      }
      
      const url = `/api/delivery/offices-by-address?${params}`
      console.log(`Запрос: ${url}`)
      
      const res = await fetch(url)
      const data = await res.json()
      
      console.log('Ответ API:', data)
      
      if (data.ok && data.offices && data.offices.length > 0) {
        console.log(`✅ Найдено отделений по адресу: ${data.offices.length}`)
        setPostOffices(data.offices)
        setShowAddressForm(true)
      } else {
        console.warn('⚠️ Отделения не найдены по адресу')
        setPostOffices([])
      }
    } catch (error) {
      console.error('❌ Ошибка поиска по адресу:', error)
      setPostOffices([])
    } finally {
      setLoadingOffices(false)
    }
  }

  const handlePostalCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPostalCode(value)
    
    // Сбрасываем стоимость при изменении индекса
    setDeliveryCost(null)
    setSelectedOffice(null)
    
    // Искать отделения если индекс заполнен
    if (value.length === 6) {
      console.log(`🔍 Поиск отделений по индексу: ${value}`)
      searchPostOffices(value)
    } else {
      setPostOffices([])
    }
  }

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-green-400">Способ доставки</h3>
        {deliveryCost !== null && (
          <div className="text-sm">
            <span className="text-gray-400">Стоимость: </span>
            {deliveryCost.cost > 0 ? (
              <span className="text-white font-semibold">{deliveryCost.cost} ₽</span>
            ) : (
              <span className="text-green-400 font-semibold">Бесплатно</span>
            )}
          </div>
        )}
      </div>

      {/* Выбор способа доставки */}
      <div className="grid gap-3">
        {deliveryMethods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleMethodSelect(method)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedMethod === method.id
                ? 'border-green-500 bg-green-500/20'
                : 'border-gray-600 hover:border-green-500/50 bg-gray-900/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{method.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-white">{method.name}</div>
                <div className="text-xs text-gray-400 mt-1">{method.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Срок доставки: {method.deliveryMin}-{method.deliveryMax} дней
                </div>
              </div>
              {selectedMethod === method.id && calculating && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
              )}
              {selectedMethod === method.id && !calculating && deliveryCost !== null && (
                <div className="text-right">
                  {deliveryCost.cost > 0 ? (
                    <div className="text-lg font-bold text-green-400">{deliveryCost.cost} ₽</div>
                  ) : (
                    <div className="text-sm font-bold text-green-400">Бесплатно</div>
                  )}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Ввод адреса с автоподстановкой */}
      <div className="space-y-3">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            📍 Адрес доставки
          </label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={handleAddressChange}
            onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Начните вводить: город, улица..."
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
            autoComplete="off"
          />
          
          {/* Подсказки адресов (как на Озоне) */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-gray-900 border border-green-500/30 rounded-lg shadow-xl max-h-64 overflow-y-auto"
            >
              {addressSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-green-500/10 transition-colors border-b border-gray-800 last:border-b-0"
                >
                  <div className="text-white text-sm">{suggestion.value}</div>
                  {suggestion.data.postalCode && (
                    <div className="text-xs text-gray-400 mt-1">
                      Индекс: {suggestion.data.postalCode}
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
          
          {loadingSuggestions && (
            <div className="absolute right-3 top-11 text-gray-400">
              <div className="animate-spin">⏳</div>
            </div>
          )}
          
          <p className="text-xs text-gray-400 mt-1">
            💡 Начните вводить - появятся подсказки адресов
          </p>
        </div>

        {/* Список отделений */}
        <AnimatePresence>
          {loadingOffices && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-sm text-gray-400 mt-2">Поиск отделений...</p>
            </motion.div>
          )}

          {!loadingOffices && postOffices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-green-400">
                  Найдено отделений: {postOffices.length}
                </p>
                {postOffices.length > 0 && postOffices[0].latitude && (
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {showMap ? 'Скрыть карту' : 'Показать на карте'}
                  </button>
                )}
              </div>

              {/* Простая карта-ссылка на Яндекс.Карты */}
              {showMap && postOffices.length > 0 && postOffices[0].latitude && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30"
                >
                  <a
                    href={`https://yandex.ru/maps/?text=Почта России ${postalCode}&ll=${postOffices[0].longitude},${postOffices[0].latitude}&z=13`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">
                      🗺️ Открыть все отделения на Яндекс.Картах
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </motion.div>
              )}
              
              {postOffices.map((office) => (
                <motion.button
                  key={office.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOfficeSelect(office)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedOffice?.id === office.id
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-gray-600 bg-gray-900/30 hover:border-green-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📮</div>
                    <div className="flex-1">
                      {office.name && (
                        <div className="font-bold text-green-400 mb-1">
                          {office.name}
                        </div>
                      )}
                      <div className="text-sm text-white">{office.address}</div>
                      {office.postalCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Индекс: {office.postalCode}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        🕒 {office.workTime}
                      </div>
                      {office.distance && (
                        <div className="text-xs text-green-400 mt-1">
                          📍 {office.distance} от вас
                        </div>
                      )}
                      {office.phone && (
                        <div className="text-xs text-gray-400 mt-1">
                          📞 {office.phone}
                        </div>
                      )}
                      {office.latitude && office.longitude && (
                        <a
                          href={`https://yandex.ru/maps/?pt=${office.longitude},${office.latitude}&z=16&l=map`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          Показать на карте
                        </a>
                      )}
                    </div>
                    {selectedOffice?.id === office.id && (
                      <div className="text-green-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {postalCode.length === 6 && !loadingOffices && postOffices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
            >
              <p className="text-sm text-yellow-400">
                ⚠️ Отделения не найдены. Проверьте правильность индекса.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Информация о доставке */}
      {deliveryCost && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💰</div>
            <div className="flex-1 text-sm">
              <p className="text-gray-300">
                <strong className="text-blue-400">Стоимость доставки:</strong>{' '}
                <span className="text-white font-semibold text-lg">{deliveryCost.cost} ₽</span>
              </p>
              <p className="text-gray-400 mt-1">
                Срок доставки: {deliveryCost.deliveryMin}-{deliveryCost.deliveryMax} рабочих дней
              </p>
              {deliveryCost.details && (
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <div>• Тариф доставки: {deliveryCost.details.weightCost} ₽</div>
                  <div>• Страхование посылки: {deliveryCost.details.insuranceCost} ₽</div>
                  <div className="text-gray-500 mt-1">Вес: 50г, объявленная стоимость: 1990₽</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DeliverySelector

