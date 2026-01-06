// Миграция базы данных для добавления полей платежей
import 'dotenv/config'
import { getPool } from './db.js'

async function migrate() {
  const pool = getPool()
  const conn = await pool.getConnection()
  
  try {
    console.log('🔄 Начинаем миграцию базы данных...')
    
    // Проверяем и добавляем поля
    const fields = [
      { name: 'payment_id', type: 'VARCHAR(255) NULL' },
      { name: 'payment_status', type: 'VARCHAR(64) NULL' },
      { name: 'payment_method', type: 'VARCHAR(64) NULL' },
      { name: 'is_card_binding', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'paid_at', type: 'DATETIME NULL' },
      { name: 'canceled_at', type: 'DATETIME NULL' }
    ]
    
    for (const field of fields) {
      try {
        await conn.query(`ALTER TABLE orders ADD COLUMN ${field.name} ${field.type}`)
        console.log(`✅ Добавлено поле: ${field.name}`)
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⏭️  Поле ${field.name} уже существует`)
        } else {
          throw err
        }
      }
    }
    
    // Добавляем индексы
    const indexes = [
      { name: 'idx_payment_id', column: 'payment_id' },
      { name: 'idx_payment_status', column: 'payment_status' }
    ]
    
    for (const index of indexes) {
      try {
        await conn.query(`ALTER TABLE orders ADD INDEX ${index.name} (${index.column})`)
        console.log(`✅ Добавлен индекс: ${index.name}`)
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`⏭️  Индекс ${index.name} уже существует`)
        } else {
          throw err
        }
      }
    }
    
    console.log('✅ Миграция завершена успешно!')
    
    // Показываем структуру таблицы
    const [rows] = await conn.query('DESCRIBE orders')
    console.log('\n📋 Структура таблицы orders:')
    console.table(rows)
    
  } catch (err) {
    console.error('❌ Ошибка миграции:', err)
    process.exit(1)
  } finally {
    conn.release()
    process.exit(0)
  }
}

migrate()

