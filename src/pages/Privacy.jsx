import React from 'react'
import { motion } from 'framer-motion'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white">
      <div className="container mx-auto px-6 py-8">
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Политика конфиденциальности
          </h1>
          <p className="text-gray-400 mb-8">Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Общие положения</h2>
              <p className="text-gray-300 leading-relaxed">
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                пользователей сайта nfc-vl.ru (далее — Сайт). Используя Сайт, вы соглашаетесь с условиями настоящей Политики.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. Собираемые данные</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                При заказе NFC карточки мы можем собирать следующую информацию:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Имя и фамилия</li>
                <li>Должность и название компании</li>
                <li>Контактные данные (телефон, email, Telegram, соцсети)</li>
                <li>Адрес доставки</li>
                <li>Данные для оформления карточки</li>
                <li>IP-адрес и технические данные браузера</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. Цели обработки данных</h2>
              <p className="text-gray-300 leading-relaxed mb-3">Ваши персональные данные используются для:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Обработки и выполнения заказов</li>
                <li>Связи с вами по вопросам заказа</li>
                <li>Изготовления и персонализации NFC карточек</li>
                <li>Организации доставки</li>
                <li>Улучшения качества обслуживания</li>
                <li>Соблюдения законодательства РФ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Защита данных</h2>
              <p className="text-gray-300 leading-relaxed">
                Мы применяем все необходимые технические и организационные меры для защиты ваших персональных данных 
                от несанкционированного доступа, изменения, раскрытия или уничтожения. Данные передаются по защищенному 
                протоколу HTTPS. Платежные данные обрабатываются через сертифицированную платежную систему ЮKassa 
                и не хранятся на наших серверах.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Передача данных третьим лицам</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                Мы можем передавать ваши данные третьим лицам только в следующих случаях:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Службам доставки для выполнения заказа</li>
                <li>Платежным системам для обработки платежей</li>
                <li>По требованию государственных органов в установленном законом порядке</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Ваши права</h2>
              <p className="text-gray-300 leading-relaxed mb-3">Вы имеете право:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Запросить доступ к своим персональным данным</li>
                <li>Требовать исправления неточных данных</li>
                <li>Запросить удаление ваших данных</li>
                <li>Отозвать согласие на обработку данных</li>
                <li>Подать жалобу в надзорный орган</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Файлы Cookie</h2>
              <p className="text-gray-300 leading-relaxed">
                Сайт использует файлы cookie для улучшения работы и анализа посещаемости. Вы можете настроить 
                использование cookie в настройках вашего браузера.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Изменения политики</h2>
              <p className="text-gray-300 leading-relaxed">
                Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
                Актуальная версия всегда доступна на данной странице.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Контакты</h2>
              <p className="text-gray-300 leading-relaxed">
                По вопросам обработки персональных данных обращайтесь:
              </p>
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-gray-300">Email: <a href="mailto:info@nfc-vl.ru" className="text-green-400 hover:text-green-300">info@nfc-vl.ru</a></p>
                <p className="text-gray-300 mt-2">ИНН: 463405654528</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Privacy

