import 'dotenv/config'
import express from 'express'
import compression from 'compression'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { initDb, insertOrder, healthCheck, updateOrderPayment, pool } from './db.js'
import FormData from 'form-data'
import https from 'https'
import { randomUUID } from 'crypto'
import RussianPostAPI, { SimpleRussianPostCalculator, PublicPostOfficeAPI } from './russianpost.js'
import { DaDataPostOfficeAPI } from './dadata-integration.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 10010

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

// YooKassa Configuration
const YOKASSA_SHOP_ID = process.env.YOKASSA_SHOP_ID
const YOKASSA_SECRET_KEY = process.env.YOKASSA_SECRET_KEY
const SITE_URL = process.env.SITE_URL || 'https://nfc-vl.ru'
const YOKASSA_API_URL = 'https://api.yookassa.ru/v3'

// Check YooKassa credentials
if (YOKASSA_SHOP_ID && YOKASSA_SECRET_KEY) {
  console.log('✅ YooKassa credentials configured')
} else {
  console.warn('⚠️ YooKassa credentials not configured')
}

// Russian Post Configuration (optional - for full API integration)
const RUSSIAN_POST_TOKEN = process.env.RUSSIAN_POST_TOKEN
const RUSSIAN_POST_LOGIN = process.env.RUSSIAN_POST_LOGIN
const RUSSIAN_POST_PASSWORD = process.env.RUSSIAN_POST_PASSWORD

let russianPostAPI = null
if (RUSSIAN_POST_TOKEN && RUSSIAN_POST_LOGIN && RUSSIAN_POST_PASSWORD) {
  russianPostAPI = new RussianPostAPI(RUSSIAN_POST_TOKEN, RUSSIAN_POST_LOGIN, RUSSIAN_POST_PASSWORD)
  console.log('✅ Russian Post API configured')
} else {
  console.log('ℹ️ Russian Post API not configured, using simple calculator')
}

// DaData Configuration (для реальных отделений)
const DADATA_API_KEY = process.env.DADATA_API_KEY

let dadataAPI = null
if (DADATA_API_KEY) {
  dadataAPI = new DaDataPostOfficeAPI(DADATA_API_KEY)
  console.log('✅ DaData API configured - REAL post offices enabled')
} else {
  console.log('ℹ️ DaData API not configured - using generated offices')
}

// Helper function to call YooKassa API
async function yookassaRequest(method, endpoint, data = null) {
  const auth = Buffer.from(`${YOKASSA_SHOP_ID}:${YOKASSA_SECRET_KEY}`).toString('base64')
  
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': randomUUID()
    }
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  const response = await fetch(`${YOKASSA_API_URL}${endpoint}`, options)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`YooKassa API error: ${response.status} ${error}`)
  }
  
  return await response.json()
}

// Транслитерация кириллицы в латиницу
function transliterate(text) {
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }
  return text.split('').map(char => ru[char] || char).join('')
}

// Генерация уникального кода участника
function generateParticipantCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'ARC-'
  
  // Генерируем 8 символов: 4 буквы/цифры - 4 буквы/цифры
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code // Формат: ARC-XXXX-XXXX
}

// Function to send message to Telegram
async function sendToTelegram(orderData, cardSlug, participantCode) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram bot credentials not configured')
    return false
  }

  const paymentTypeText = orderData.paymentType === 'cash_on_delivery' 
    ? '📦 Оплата при получении' 
    : `💳 Онлайн (${orderData.paymentMethod || 'карта'})`
  
  const statusText = orderData.paymentType === 'cash_on_delivery'
    ? '⏳ Ожидает подтверждения'
    : '💰 Ожидает оплаты'

  // Формируем информацию о доставке
  let deliveryText = '📦 <b>Доставка:</b>\n'
  if (orderData.delivery) {
    const delivery = orderData.delivery
    deliveryText += `• Способ: ${delivery.methodName || 'Почта России'}\n`
    if (delivery.cost > 0) {
      deliveryText += `• Стоимость: ${delivery.cost} ₽\n`
    } else {
      deliveryText += `• Стоимость: Бесплатно\n`
    }
    deliveryText += `• Срок: ${delivery.deliveryMin}-${delivery.deliveryMax} дней\n`
    if (delivery.address) {
      deliveryText += `• Адрес: ${delivery.address}\n`
    }
    if (delivery.postalCode) {
      deliveryText += `• Индекс: ${delivery.postalCode}\n`
    }
  } else {
    deliveryText += '• Почта России (бесплатно)\n'
  }

  const message = `
🆕 <b>Новая заявка на NFC карточку!</b>

${statusText}

🎫 <b>Код участника:</b> <code>${participantCode}</code>
(Для идентификации на других сайтах)

👤 <b>Личная информация:</b>
• Имя: ${orderData.name || 'Не указано'}
• Должность: ${orderData.title || 'Не указано'}
• Компания: ${orderData.company || 'Не указано'}

📱 <b>Контакты:</b>
• Телефон: ${orderData.phone || 'Не указано'}
• Email: ${orderData.email || 'Не указано'}
• Telegram: ${orderData.telegram || 'Не указано'}
• VK: ${orderData.vk || 'Не указано'}
• Instagram: ${orderData.instagram || 'Не указано'}
• Сайт: ${orderData.website || 'Не указано'}

🎨 <b>Дизайн:</b>
• Шаблон: ${orderData.design || 'cyber'}
• Основной цвет: ${orderData.primaryColor || '#0a0a0a'}
• Вторичный цвет: ${orderData.secondaryColor || '#00ff88'}
• Стиль фона: ${orderData.backgroundStyle || 'gradient'}

${deliveryText}

💰 <b>Оплата:</b>
• Способ: ${paymentTypeText}
• Сумма: 1 990 ₽

⏰ <b>Дата заявки:</b> ${new Date(orderData.createdAt).toLocaleString('ru-RU')}
🌐 <b>IP:</b> ${orderData.ip || 'Не определен'}

📱 <b>Для записи на NFC:</b>
Загрузите прикрепленный файл в https://nfc-vl.ru/nfc-write
`.trim()

  try {
    // Отправить сообщение
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })
    
    const result = await response.json()
    if (!result.ok) {
      console.error('Telegram API error:', result)
      return false
    }

    // Создать JSON файл для записи NFC (используем переданный cardSlug)
    const nfcData = {
      participantCode: participantCode,
      name: orderData.name || '',
      title: orderData.title || '',
      company: orderData.company || '',
      phone: orderData.phone || '',
      email: orderData.email || '',
      telegram: orderData.telegram || '',
      vk: orderData.vk || '',
      instagram: orderData.instagram || '',
      website: orderData.website || '',
      design: orderData.design || 'cyber',
      primaryColor: orderData.primaryColor || '#0a0a0a',
      secondaryColor: orderData.secondaryColor || '#00ff88',
      textColor: orderData.textColor || '#00ff88',
      backgroundStyle: orderData.backgroundStyle || 'gradient',
      backgroundImage: orderData.backgroundImage || '/templates/cyber.svg',
      nfcUrl: `https://nfc-vl.ru/card/${cardSlug}`,
      createdAt: orderData.createdAt,
      orderId: (orderData.ip?.replace(/\./g, '-') || 'order') + '-' + Date.now()
    }

    // Отправить JSON файл как документ
    const fileName = `nfc-${orderData.name?.toLowerCase().replace(/\s+/g, '-') || 'order'}-${Date.now()}.json`
    const fileContent = JSON.stringify(nfcData, null, 2)
    
    try {
      const formData = new FormData()
      formData.append('chat_id', TELEGRAM_CHAT_ID)
      formData.append('document', Buffer.from(fileContent, 'utf-8'), {
        filename: fileName,
        contentType: 'application/json',
      })
      formData.append('caption', '📄 Файл для записи NFC карточки\n\nЗагрузите на https://nfc-vl.ru/nfc-write')

      // Отправка через https вместо fetch
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`
      
      await new Promise((resolve, reject) => {
        const req = https.request(url, {
          method: 'POST',
          headers: formData.getHeaders()
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            const result = JSON.parse(data)
            if (result.ok) {
              console.log('✅ Файл отправлен в Telegram')
              resolve(result)
            } else {
              console.error('❌ Ошибка отправки файла:', result)
              reject(result)
            }
          })
        })
        
        req.on('error', (error) => {
          console.error('❌ Ошибка запроса:', error)
          reject(error)
        })
        
        formData.pipe(req)
      })
    } catch (fileError) {
      console.error('❌ Исключение при отправке файла:', fileError.message || fileError)
    }
    
    console.log('Order sent to Telegram successfully with NFC file')
    return true
  } catch (error) {
    console.error('Failed to send to Telegram:', error)
    return false
  }
}

// Middlewares
app.use(compression())
app.use(express.json({ limit: '1mb' }))

// Add CORS headers for static files (especially SVG textures for Three.js)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Minimal API for orders
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

const cardsDir = path.join(__dirname, 'data', 'cards')
if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true })
}
const ordersFile = path.join(dataDir, 'orders.ndjson')

// Initialize database on startup (non-fatal if fails)
initDb()
  .then(() => console.log('Database initialized'))
  .catch((err) => console.error('Database init error:', err))

app.post('/api/order', async (req, res) => {
  const payload = { 
    ...req.body, 
    createdAt: new Date().toISOString(), 
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
  }
  
  // Создать слаг для карточки (транслитерация русских букв)
  const username = transliterate(payload.name?.toLowerCase() || 'user').replace(/\s+/g, '-')
  const cardSlug = `${username}-${Date.now()}`
  
  // Генерировать уникальный код участника
  const participantCode = generateParticipantCode()
  
  // Добавить информацию о доставке
  if (payload.delivery) {
    console.log(`[ORDER] Способ доставки: ${payload.delivery.method}, Стоимость: ${payload.delivery.cost}₽`)
  }
  
  // Сохранить данные карточки
  const cardData = {
    participantCode: participantCode,
    name: payload.name || '',
    title: payload.title || '',
    company: payload.company || '',
    phone: payload.phone || '',
    email: payload.email || '',
    telegram: payload.telegram || '',
    vk: payload.vk || '',
    instagram: payload.instagram || '',
    website: payload.website || '',
    design: payload.design || 'cyber',
    primaryColor: payload.primaryColor || '#0a0a0a',
    secondaryColor: payload.secondaryColor || '#00ff88',
    textColor: payload.textColor || '#00ff88',
    backgroundStyle: payload.backgroundStyle || 'gradient',
    backgroundImage: payload.backgroundImage || '/templates/cyber.svg',
    slug: cardSlug,
    createdAt: payload.createdAt
  }
  
  // Сохранить в файл
  const cardFile = path.join(cardsDir, `${cardSlug}.json`)
  try {
    fs.writeFileSync(cardFile, JSON.stringify(cardData, null, 2), 'utf8')
    console.log(`[ORDER] ✅ Карточка сохранена: ${cardSlug}.json`)
    console.log(`[ORDER] Имя: ${cardData.name}, Код участника: ${participantCode}, Телефон: ${cardData.phone}`)
  } catch (err) {
    console.error('[ORDER] ⚠️ Failed to save card data:', err)
  }
  
  // Send to Telegram (non-blocking)
  sendToTelegram(payload, cardSlug, participantCode).catch(err => console.error('Telegram send error:', err))
  
  // Добавить participantCode в payload для сохранения в БД
  payload.participantCode = participantCode
  
  try {
    const id = await insertOrder(payload)
    return res.status(200).json({ ok: true, id, cardSlug, participantCode })
  } catch (e) {
    // Fallback to file append if DB is unavailable
    try {
      fs.appendFileSync(ordersFile, JSON.stringify(payload) + '\n', 'utf8')
      return res.status(200).json({ ok: true, fallback: 'fs', cardSlug, participantCode })
    } catch (err) {
      return res.status(500).json({ ok: false })
    }
  }
})

// API для получения данных карточки
app.get('/api/card/:slug', (req, res) => {
  let { slug } = req.params
  
  // Декодируем URL (на случай кириллицы)
  slug = decodeURIComponent(slug)
  
  console.log(`[API] Запрос карточки: ${slug}`)
  
  // Поиск по всем файлам в cardsDir
  try {
    const files = fs.readdirSync(cardsDir)
    console.log(`[API] Всего файлов в data/cards: ${files.length}`)
    console.log(`[API] Файлы:`, files.slice(0, 5)) // первые 5 для дебага
    
    // Поиск по полному слагу (точное совпадение)
    let cardFile = files.find(f => f === `${slug}.json`)
    
    // Если не найден, поиск по началу имени (без timestamp)
    if (!cardFile) {
      // Пробуем найти по началу (для совместимости со старыми файлами)
      cardFile = files.find(f => f.startsWith(slug) && f.endsWith('.json'))
    }
    
    // Если всё ещё не найден, попробуем транслитерировать и искать
    if (!cardFile) {
      const translitSlug = transliterate(slug)
      console.log(`[API] Транслит slug: ${translitSlug}`)
      cardFile = files.find(f => f === `${translitSlug}.json` || f.startsWith(translitSlug + '-'))
    }
    
    if (cardFile) {
      console.log(`[API] ✅ Найден файл: ${cardFile}`)
      const cardData = JSON.parse(fs.readFileSync(path.join(cardsDir, cardFile), 'utf8'))
      return res.json({ ok: true, data: cardData })
    }
    
    console.warn(`[API] ❌ Card not found for slug: ${slug}`)
    return res.status(404).json({ ok: false, message: 'Card not found' })
  } catch (err) {
    console.error('[API] ⚠️ Error reading card:', err)
    return res.status(500).json({ ok: false, message: 'Server error' })
  }
})

// Create payment with YooKassa
app.post('/api/create-payment', async (req, res) => {
  if (!YOKASSA_SHOP_ID || !YOKASSA_SECRET_KEY) {
    return res.status(500).json({ ok: false, error: 'YooKassa not configured' })
  }

  try {
    const { orderId, amount, description, email, paymentMethod } = req.body
    
    // Для тестирования - если сумма 10 рублей, это привязка карты
    const isCardBinding = amount === 10
    
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${SITE_URL}/payment-success?orderId=${orderId}`
      },
      capture: true, // Всегда true, отменяем вручную для тестовых
      description: description || (isCardBinding ? 'Привязка карты (тестовый платёж 10₽)' : 'Оплата NFC карточки'),
      metadata: {
        order_id: String(orderId || ''),
        is_card_binding: String(isCardBinding || false)
      }
    }

    // Добавляем email если есть (чек НЕ обязателен для тестов)
    if (email && !isCardBinding) {
      paymentData.receipt = {
        customer: {
          email: email
        },
        items: [{
          description: 'NFC карточка с цифровым профилем',
          quantity: '1.00',
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB'
          },
          vat_code: 1
        }]
      }
    }

    const payment = await yookassaRequest('POST', '/payments', paymentData)
    
    console.log(`[PAYMENT] Created payment ${payment.id} for order ${orderId}, amount: ${amount}₽`)
    
    return res.json({
      ok: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
      status: payment.status,
      isCardBinding
    })
  } catch (error) {
    console.error('[PAYMENT] Error creating payment:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Webhook from YooKassa
app.post('/api/yookassa-webhook', async (req, res) => {
  try {
    const notification = req.body
    
    console.log('[WEBHOOK] Received notification:', notification.event)
    
    if (notification.event === 'payment.succeeded') {
      const payment = notification.object
      const orderId = payment.metadata?.order_id
      const isCardBinding = payment.metadata?.is_card_binding === 'true' || payment.metadata?.is_card_binding === true
      
      console.log(`[WEBHOOK] Payment succeeded: ${payment.id}, Order: ${orderId}, Card binding: ${isCardBinding}`)
      
      // Если это привязка карты - делаем возврат
      if (isCardBinding && payment.amount.value === '10.00') {
        try {
          const refundData = {
            amount: {
              value: '10.00',
              currency: 'RUB'
            },
            payment_id: payment.id
          }
          await yookassaRequest('POST', '/refunds', refundData)
          console.log(`[WEBHOOK] Card binding payment ${payment.id} refunded, 10₽ will be returned`)
        } catch (refundError) {
          console.error('[WEBHOOK] Error refunding card binding payment:', refundError)
        }
      }
      
      // Обновляем статус заказа в БД
      if (orderId) {
        try {
          await updateOrderPayment(orderId, {
            payment_id: payment.id,
            payment_status: 'succeeded',
            payment_method: payment.payment_method?.type,
            is_card_binding: isCardBinding,
            paid_at: payment.paid_at || new Date().toISOString()
          })
          console.log(`[WEBHOOK] Order ${orderId} updated with payment info`)
        } catch (dbError) {
          console.error('[WEBHOOK] Error updating order:', dbError)
        }
      }
    } else if (notification.event === 'payment.canceled') {
      const payment = notification.object
      const orderId = payment.metadata?.order_id
      
      console.log(`[WEBHOOK] Payment canceled: ${payment.id}, Order: ${orderId}`)
      
      if (orderId) {
        try {
          await updateOrderPayment(orderId, {
            payment_id: payment.id,
            payment_status: 'canceled',
            canceled_at: payment.canceled_at || new Date().toISOString()
          })
        } catch (dbError) {
          console.error('[WEBHOOK] Error updating order:', dbError)
        }
      }
    }
    
    res.status(200).send('OK')
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error)
    res.status(500).send('Error')
  }
})

// Check payment status
app.get('/api/payment-status/:paymentId', async (req, res) => {
  if (!YOKASSA_SHOP_ID || !YOKASSA_SECRET_KEY) {
    return res.status(500).json({ ok: false, error: 'YooKassa not configured' })
  }

  try {
    const { paymentId } = req.params
    const payment = await yookassaRequest('GET', `/payments/${paymentId}`)
    
    return res.json({
      ok: true,
      status: payment.status,
      paid: payment.paid,
      amount: payment.amount,
      metadata: payment.metadata
    })
  } catch (error) {
    console.error('[PAYMENT] Error getting payment status:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Russian Post API Endpoints

// Get available delivery methods
app.get('/api/delivery/methods', (req, res) => {
  try {
    const methods = SimpleRussianPostCalculator.getDeliveryMethods()
    return res.json({ ok: true, methods })
  } catch (error) {
    console.error('[DELIVERY] Error getting delivery methods:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Calculate delivery cost
app.post('/api/delivery/calculate', async (req, res) => {
  try {
    const { mailType, region, weight, declaredValue, postalCode } = req.body

    let result

    // Если настроен полный API Почты России
    if (russianPostAPI && postalCode) {
      result = await russianPostAPI.calculateDelivery({
        indexTo: postalCode,
        weight: weight || 50,
        mailType: mailType?.toUpperCase() || 'POSTAL_PARCEL',
        declaredValue: declaredValue || 1990
      })
    } else {
      // Используем упрощенный калькулятор
      result = SimpleRussianPostCalculator.calculateSimple({
        region: region || 'Россия',
        weight: weight || 50,
        mailType: mailType || 'parcel',
        declaredValue: declaredValue || 1990
      })
    }

    return res.json({ ok: true, ...result })
  } catch (error) {
    console.error('[DELIVERY] Error calculating delivery:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Normalize address (if full API is configured)
app.post('/api/delivery/normalize-address', async (req, res) => {
  try {
    const { address } = req.body

    if (!russianPostAPI) {
      return res.json({ 
        ok: false, 
        error: 'Russian Post API not configured',
        message: 'Address normalization requires full API access'
      })
    }

    const result = await russianPostAPI.normalizeAddress(address)
    return res.json({ ok: true, ...result })
  } catch (error) {
    console.error('[DELIVERY] Error normalizing address:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Create delivery order (if full API is configured)
app.post('/api/delivery/create-order', async (req, res) => {
  try {
    const orderData = req.body

    if (!russianPostAPI) {
      return res.json({
        ok: false,
        error: 'Russian Post API not configured',
        message: 'Creating delivery orders requires full API access'
      })
    }

    const result = await russianPostAPI.createOrder(orderData)
    return res.json({ ok: true, ...result })
  } catch (error) {
    console.error('[DELIVERY] Error creating delivery order:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Track parcel
app.get('/api/delivery/track/:trackNumber', async (req, res) => {
  try {
    const { trackNumber } = req.params

    if (!russianPostAPI) {
      return res.json({
        ok: false,
        error: 'Russian Post API not configured',
        message: 'Tracking requires full API access'
      })
    }

    const result = await russianPostAPI.trackParcel(trackNumber)
    return res.json({ ok: true, ...result })
  } catch (error) {
    console.error('[DELIVERY] Error tracking parcel:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// ============================================
// ADMIN API
// ============================================

// Простая middleware для проверки прав (можно улучшить)
const checkAdmin = (req, res, next) => {
  // В продакшене добавить проверку токена или сессии
  next()
}

// Получить список всех заказов
app.get('/api/admin/orders', checkAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.query(
        `SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000`
      )
      
      console.log(`[ADMIN] Запрошено ${rows.length} заказов`)
      
      return res.json({
        ok: true,
        orders: rows
      })
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('[ADMIN] Error fetching orders:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Получить статистику
app.get('/api/admin/stats', checkAdmin, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    try {
      const [totalResult] = await conn.query('SELECT COUNT(*) as count FROM orders')
      const [paidResult] = await conn.query('SELECT COUNT(*) as count FROM orders WHERE payment_status = "succeeded"')
      const [pendingResult] = await conn.query('SELECT COUNT(*) as count FROM orders WHERE payment_status IN ("pending", "waiting_for_capture") OR payment_status IS NULL')
      
      const totalOrders = totalResult[0].count || 0
      
      // Примерный расчет выручки (1990₽ за карточку + доставка)
      const [revenueResult] = await conn.query('SELECT SUM(1990 + IFNULL(delivery_cost, 0)) as total FROM orders WHERE payment_status = "succeeded"')
      const revenue = revenueResult[0].total || 0
      
      console.log(`[ADMIN] Статистика: ${totalOrders} заказов, ${paidResult[0].count} оплачено`)
      
      return res.json({
        ok: true,
        stats: {
          total: totalOrders,
          paid: paidResult[0].count || 0,
          pending: pendingResult[0].count || 0,
          revenue: Math.round(revenue)
        }
      })
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('[ADMIN] Error fetching stats:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Удалить заказ
app.delete('/api/admin/orders/:id', checkAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id)
    
    const conn = await pool.getConnection()
    try {
      const [result] = await conn.query('DELETE FROM orders WHERE id = ?', [orderId])
      
      if (result.affectedRows > 0) {
        console.log(`[ADMIN] Заказ #${orderId} удален`)
        return res.json({ ok: true })
      } else {
        return res.status(404).json({ ok: false, error: 'Заказ не найден' })
      }
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('[ADMIN] Error deleting order:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// Обновить заказ
app.put('/api/admin/orders/:id', checkAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id)
    const updates = req.body
    
    // Разрешенные поля для обновления
    const allowedFields = ['name', 'email', 'phone', 'payment_status', 'delivery_address', 'delivery_postal_code']
    const updateFields = []
    const updateValues = []
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(updates[field])
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ ok: false, error: 'Нет полей для обновления' })
    }
    
    updateValues.push(orderId)
    
    const conn = await pool.getConnection()
    try {
      const [result] = await conn.query(
        `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
      
      if (result.affectedRows > 0) {
        console.log(`[ADMIN] Заказ #${orderId} обновлен`)
        return res.json({ ok: true })
      } else {
        return res.status(404).json({ ok: false, error: 'Заказ не найден' })
      }
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('[ADMIN] Error updating order:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
})

// API для промокодов
app.post('/api/promo/validate', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.json({ valid: false })
    }

    console.log(`[PROMO] Проверка промокода: ${code}`)
    
    // Здесь можно добавить проверку в БД
    // А пока используем хардкод для тестирования
    const promoCodes = {
      'WELCOME10': { discount: 10, type: 'percent', description: 'Скидка 10%' },
      'SAVE200': { discount: 200, type: 'fixed', description: 'Скидка 200₽' },
      'FIRST': { discount: 15, type: 'percent', description: 'Скидка 15% на первый заказ' },
      'NFC2025': { discount: 100, type: 'fixed', description: 'Скидка 100₽' }
    }

    const promo = promoCodes[code.toUpperCase()]
    
    if (promo) {
      console.log(`[PROMO] ✅ Промокод действителен: ${JSON.stringify(promo)}`)
      return res.json({
        valid: true,
        ...promo
      })
    }

    console.log('[PROMO] ❌ Промокод не найден')
    return res.json({ valid: false })

  } catch (error) {
    console.error('[PROMO] Error:', error)
    return res.status(500).json({ valid: false, error: error.message })
  }
})

// Подсказки адресов (автокомплит как на маркетплейсах)
app.get('/api/delivery/address-suggestions', async (req, res) => {
  try {
    const { query } = req.query

    if (!query || query.length < 3) {
      return res.json({ ok: true, suggestions: [] })
    }

    if (!dadataAPI) {
      return res.json({ ok: false, suggestions: [] })
    }

    console.log(`[DELIVERY] Подсказки для: "${query}"`)

    // DaData API для подсказок адресов
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${process.env.DADATA_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        count: 10,
        locations: [{ country: 'Россия' }]
      })
    })

    const data = await response.json()
    
    const suggestions = (data.suggestions || []).map(s => ({
      value: s.value, // Полный адрес
      data: {
        city: s.data.city || s.data.settlement,
        street: s.data.street,
        house: s.data.house,
        postalCode: s.data.postal_code,
        region: s.data.region,
        area: s.data.area,
        latitude: s.data.geo_lat,
        longitude: s.data.geo_lon
      }
    }))

    console.log(`[DELIVERY] Найдено подсказок: ${suggestions.length}`)

    return res.json({
      ok: true,
      suggestions: suggestions
    })

  } catch (error) {
    console.error('[DELIVERY] Error:', error)
    return res.json({ ok: false, suggestions: [] })
  }
})

// Get post offices by address (для поиска по адресу, а не только индексу)
app.get('/api/delivery/offices-by-address', async (req, res) => {
  try {
    const { address, latitude, longitude } = req.query

    console.log(`[DELIVERY] Поиск отделений по адресу: ${address}`)

    if (!dadataAPI) {
      return res.json({
        ok: false,
        message: 'DaData API не настроен',
        offices: []
      })
    }

    // Поиск через DaData по адресу
    const result = await dadataAPI.searchPostOffices(address, 50)
    
    if (result.success && result.offices && result.offices.length > 0) {
      let offices = result.offices

      // Если есть геолокация - сортируем
      if (latitude && longitude) {
        offices = offices.map(office => {
          if (office.latitude && office.longitude) {
            const dist = dadataAPI.calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              office.latitude,
              office.longitude
            )
            return { ...office, distance: `${dist.toFixed(1)} км` }
          }
          return office
        })
        
        offices.sort((a, b) => {
          const distA = parseFloat(a.distance) || 999
          const distB = parseFloat(b.distance) || 999
          return distA - distB
        })
      }
      
      console.log(`[DELIVERY] ✅ Найдено по адресу: ${offices.length}`)
      
      return res.json({
        ok: true,
        offices: offices,
        source: 'dadata-address'
      })
    }

    return res.json({
      ok: true,
      offices: [],
      message: 'Отделения не найдены'
    })

  } catch (error) {
    console.error('[DELIVERY] Error:', error)
    return res.status(500).json({ ok: false, error: error.message, offices: [] })
  }
})

// Get post offices by postal code (REAL DATA)
app.get('/api/delivery/offices/:postalCode', async (req, res) => {
  try {
    const { postalCode } = req.params
    const { latitude, longitude } = req.query

    console.log(`[DELIVERY] Поиск отделений для индекса: ${postalCode}`)

    let result

    // 1. ПРИОРИТЕТ: DaData API (РЕАЛЬНЫЕ данные)
    if (dadataAPI) {
      console.log('[DELIVERY] ✅ Использую DaData API - РЕАЛЬНЫЕ отделения')
      console.log(`[DELIVERY] Поиск для индекса: ${postalCode}`)
      
      result = await dadataAPI.searchPostOffices(postalCode, 50)
      
      console.log(`[DELIVERY] DaData ответ:`, {
        success: result.success,
        count: result.offices?.length || 0,
        error: result.error
      })
      
      if (result.success && result.offices && result.offices.length > 0) {
        let offices = result.offices
        
        console.log(`[DELIVERY] Первое отделение:`, offices[0])

        // Если есть геолокация - добавляем расстояние и сортируем
        if (latitude && longitude) {
          console.log(`[DELIVERY] Применяю геолокацию: ${latitude}, ${longitude}`)
          offices = offices.map(office => {
            if (office.latitude && office.longitude) {
              const dist = dadataAPI.calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                office.latitude,
                office.longitude
              )
              return {
                ...office,
                distance: `${dist.toFixed(1)} км`
              }
            }
            return office
          })
          
          // Сортируем по расстоянию
          offices.sort((a, b) => {
            const distA = parseFloat(a.distance) || 999
            const distB = parseFloat(b.distance) || 999
            return distA - distB
          })
        }
        
        console.log(`[DELIVERY] ✅ Найдено РЕАЛЬНЫХ отделений DaData: ${offices.length}`)
        
        return res.json({
          ok: true,
          offices: offices,
          source: 'dadata-real'
        })
      } else {
        console.log('[DELIVERY] ⚠️ DaData не вернул отделений, пробуем fallback')
      }
    }

    // 2. Если есть полный API Почты России
    if (russianPostAPI) {
      console.log('[DELIVERY] Использую официальный API Почты России')
      result = await russianPostAPI.getPostOffices(postalCode)
      
      if (result.success && result.data) {
        return res.json({
          ok: true,
          offices: PublicPostOfficeAPI.formatOffices(result.data),
          source: 'official-api'
        })
      }
    }

    // 3. Fallback на генерацию
    console.log('[DELIVERY] ⚠️ Использую генерацию отделений (настройте DaData для реальных данных)')
    result = await PublicPostOfficeAPI.getOfficesByPostalCode(postalCode)

    let offices = result.offices || []

    if (latitude && longitude && offices.length > 0) {
      offices = PublicPostOfficeAPI.sortByDistance(
        offices,
        parseFloat(latitude),
        parseFloat(longitude)
      )
    }

    console.log(`[DELIVERY] Найдено отделений (generated): ${offices.length}`)

    return res.json({
      ok: true,
      offices: offices,
      source: 'generated'
    })

  } catch (error) {
    console.error('[DELIVERY] Error getting post offices:', error)
    return res.status(500).json({ 
      ok: false, 
      error: error.message,
      offices: []
    })
  }
})

// Health check for DB connectivity
app.get('/api/health', async (req, res) => {
  try {
    await healthCheck()
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false })
  }
})

// Static files с агрессивным кешированием
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y', // Кешировать на 1 год
  immutable: true,
  etag: true,
  lastModified: true
}))

app.use('/templates', express.static(path.join(__dirname, 'dist/templates'), {
  maxAge: '1y',
  immutable: true,
  etag: true
}))

// Остальные статические файлы с коротким кешем
app.use(express.static(path.join(__dirname, 'dist'), { 
  index: 'index.html',
  maxAge: '1h', // HTML кешируем на 1 час
  etag: true,
  lastModified: true
}))

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`)
})

