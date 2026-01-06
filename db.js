import 'dotenv/config'
import mysql from 'mysql2/promise'

// Create a reusable MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nfc',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  supportBigNumbers: true,
  dateStrings: true
})

export const getPool = () => pool
export { pool }

export async function initDb() {
  const conn = await pool.getConnection()
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        participant_code VARCHAR(32) NULL,
        name VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(64) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ip VARCHAR(45) NULL,
        payment_id VARCHAR(255) NULL,
        payment_status VARCHAR(64) NULL,
        payment_method VARCHAR(64) NULL,
        is_card_binding BOOLEAN DEFAULT FALSE,
        paid_at DATETIME NULL,
        canceled_at DATETIME NULL,
        raw JSON NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_created_at (created_at),
        INDEX idx_payment_id (payment_id),
        INDEX idx_payment_status (payment_status),
        INDEX idx_participant_code (participant_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  } finally {
    conn.release()
  }
}

export async function insertOrder(orderPayload) {
  const conn = await pool.getConnection()
  try {
    const participantCode = typeof orderPayload.participantCode === 'string' ? orderPayload.participantCode : null
    const name = typeof orderPayload.name === 'string' ? orderPayload.name : null
    const email = typeof orderPayload.email === 'string' ? orderPayload.email : null
    const phone = typeof orderPayload.phone === 'string' ? orderPayload.phone : null
    const ip = typeof orderPayload.ip === 'string' ? orderPayload.ip : null
    
    // Извлекаем данные о доставке
    const delivery = orderPayload.delivery || {}
    const deliveryMethod = delivery.method || null
    const deliveryMethodName = delivery.methodName || null
    const deliveryCost = delivery.cost || 0
    const deliveryMinDays = delivery.deliveryMin || null
    const deliveryMaxDays = delivery.deliveryMax || null
    const deliveryAddress = delivery.address || null
    const deliveryPostalCode = delivery.postalCode || null
    
    // Пытаемся вставить с полями доставки, если они существуют в таблице
    try {
      const [result] = await conn.query(
        `INSERT INTO orders 
        (participant_code, name, email, phone, ip, 
         delivery_method, delivery_method_name, delivery_cost, 
         delivery_min_days, delivery_max_days, delivery_address, delivery_postal_code,
         raw) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON))`,
        [
          participantCode, name, email, phone, ip,
          deliveryMethod, deliveryMethodName, deliveryCost,
          deliveryMinDays, deliveryMaxDays, deliveryAddress, deliveryPostalCode,
          JSON.stringify(orderPayload)
        ]
      )
      return result.insertId
    } catch (error) {
      // Если поля доставки ещё не добавлены в таблицу, используем старый формат
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.warn('⚠️  Delivery fields not found in table, using fallback insert')
        const [result] = await conn.query(
          'INSERT INTO orders (participant_code, name, email, phone, ip, raw) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))',
          [participantCode, name, email, phone, ip, JSON.stringify(orderPayload)]
        )
        return result.insertId
      }
      throw error
    }
  } finally {
    conn.release()
  }
}

export async function healthCheck() {
  const conn = await pool.getConnection()
  try {
    await conn.query('SELECT 1')
    return true
  } finally {
    conn.release()
  }
}

export async function updateOrderPayment(orderId, paymentData) {
  const conn = await pool.getConnection()
  try {
    const fields = []
    const values = []
    
    if (paymentData.payment_id) {
      fields.push('payment_id = ?')
      values.push(paymentData.payment_id)
    }
    if (paymentData.payment_status) {
      fields.push('payment_status = ?')
      values.push(paymentData.payment_status)
    }
    if (paymentData.payment_method) {
      fields.push('payment_method = ?')
      values.push(paymentData.payment_method)
    }
    if (paymentData.is_card_binding !== undefined) {
      fields.push('is_card_binding = ?')
      values.push(paymentData.is_card_binding ? 1 : 0)
    }
    if (paymentData.paid_at) {
      fields.push('paid_at = ?')
      values.push(paymentData.paid_at)
    }
    if (paymentData.canceled_at) {
      fields.push('canceled_at = ?')
      values.push(paymentData.canceled_at)
    }
    
    if (fields.length === 0) {
      return false
    }
    
    values.push(orderId)
    
    const [result] = await conn.query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
    
    return result.affectedRows > 0
  } finally {
    conn.release()
  }
}

