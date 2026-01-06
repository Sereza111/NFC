import 'dotenv/config'
import { getPool } from './db.js'

async function migrate() {
  const pool = getPool()
  const conn = await pool.getConnection()
  
  try {
    console.log('🔄 Проверка и добавление колонки participant_code...')
    
    // Проверяем, существует ли колонка
    const [columns] = await conn.query(`
      SHOW COLUMNS FROM orders LIKE 'participant_code'
    `)
    
    if (columns.length === 0) {
      console.log('➕ Добавление колонки participant_code...')
      
      // Добавляем колонку после id
      await conn.query(`
        ALTER TABLE orders 
        ADD COLUMN participant_code VARCHAR(32) NULL AFTER id,
        ADD INDEX idx_participant_code (participant_code)
      `)
      
      console.log('✅ Колонка participant_code успешно добавлена!')
    } else {
      console.log('ℹ️ Колонка participant_code уже существует')
    }
    
    console.log('✅ Миграция завершена!')
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
    throw error
  } finally {
    conn.release()
    await pool.end()
  }
}

migrate().catch(err => {
  console.error('Критическая ошибка:', err)
  process.exit(1)
})

