/**
 * Миграция для добавления полей доставки в таблицу orders
 * 
 * Использование:
 * node migrations/add_delivery_fields.js
 */

import 'dotenv/config'
import { getPool } from '../db.js'

async function migrate() {
  const pool = getPool()
  const conn = await pool.getConnection()
  
  try {
    console.log('🔄 Начинаем миграцию: добавление полей доставки...')
    
    // Проверяем, существуют ли уже поля доставки
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME IN ('delivery_method', 'delivery_cost', 'delivery_address', 'delivery_postal_code')
    `)
    
    if (columns.length > 0) {
      console.log('ℹ️  Поля доставки уже существуют, пропускаем миграцию')
      return
    }
    
    // Добавляем поля для хранения информации о доставке
    await conn.query(`
      ALTER TABLE orders
      ADD COLUMN delivery_method VARCHAR(64) NULL COMMENT 'ID способа доставки (russian-post-parcel, russian-post-ems, etc)',
      ADD COLUMN delivery_method_name VARCHAR(255) NULL COMMENT 'Название способа доставки',
      ADD COLUMN delivery_cost DECIMAL(10,2) NULL DEFAULT 0 COMMENT 'Стоимость доставки в рублях',
      ADD COLUMN delivery_min_days INT NULL COMMENT 'Минимальный срок доставки в днях',
      ADD COLUMN delivery_max_days INT NULL COMMENT 'Максимальный срок доставки в днях',
      ADD COLUMN delivery_address TEXT NULL COMMENT 'Адрес доставки',
      ADD COLUMN delivery_postal_code VARCHAR(10) NULL COMMENT 'Почтовый индекс',
      ADD COLUMN delivery_track_number VARCHAR(64) NULL COMMENT 'Трек-номер для отслеживания',
      ADD INDEX idx_delivery_method (delivery_method),
      ADD INDEX idx_delivery_postal_code (delivery_postal_code),
      ADD INDEX idx_delivery_track_number (delivery_track_number)
    `)
    
    console.log('✅ Миграция завершена успешно!')
    console.log('   Добавлены поля:')
    console.log('   - delivery_method (VARCHAR)')
    console.log('   - delivery_method_name (VARCHAR)')
    console.log('   - delivery_cost (DECIMAL)')
    console.log('   - delivery_min_days (INT)')
    console.log('   - delivery_max_days (INT)')
    console.log('   - delivery_address (TEXT)')
    console.log('   - delivery_postal_code (VARCHAR)')
    console.log('   - delivery_track_number (VARCHAR)')
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error.message)
    throw error
  } finally {
    conn.release()
    await pool.end()
  }
}

// Запускаем миграцию
migrate()
  .then(() => {
    console.log('🎉 Миграция завершена')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Миграция не удалась:', error)
    process.exit(1)
  })

