import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

async function migrateCards() {
  const cardsDir = path.join(__dirname, 'data', 'cards')
  
  if (!fs.existsSync(cardsDir)) {
    console.error('❌ Папка data/cards не найдена')
    return
  }

  const files = fs.readdirSync(cardsDir).filter(f => f.endsWith('.json'))
  console.log(`📁 Найдено карточек: ${files.length}`)

  let updated = 0
  let skipped = 0

  for (const file of files) {
    const filePath = path.join(cardsDir, file)
    
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const cardData = JSON.parse(content)

      // Проверяем, есть ли уже код
      if (cardData.participantCode) {
        console.log(`⏭️  ${file} - уже имеет код: ${cardData.participantCode}`)
        skipped++
        continue
      }

      // Генерируем и добавляем код
      const participantCode = generateParticipantCode()
      cardData.participantCode = participantCode

      // Сохраняем обновлённый файл
      fs.writeFileSync(filePath, JSON.stringify(cardData, null, 2), 'utf8')
      
      console.log(`✅ ${file} - добавлен код: ${participantCode}`)
      updated++
    } catch (error) {
      console.error(`❌ Ошибка обработки ${file}:`, error.message)
    }
  }

  console.log('\n📊 Результаты миграции:')
  console.log(`✅ Обновлено: ${updated}`)
  console.log(`⏭️  Пропущено: ${skipped}`)
  console.log(`📁 Всего: ${files.length}`)
}

migrateCards().catch(err => {
  console.error('Критическая ошибка:', err)
  process.exit(1)
})

