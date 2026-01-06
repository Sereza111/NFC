import React from 'react'
import { motion } from 'framer-motion'

const Terms = () => {
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
            Пользовательское соглашение
          </h1>
          <p className="text-gray-400 mb-8">Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Общие положения</h2>
              <p className="text-gray-300 leading-relaxed">
                Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между 
                Индивидуальным предпринимателем (ИНН: 463405654528) и пользователями сайта nfc-vl.ru 
                при заказе и приобретении NFC карточек.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. Предмет соглашения</h2>
              <p className="text-gray-300 leading-relaxed">
                Продавец обязуется изготовить и передать Покупателю персонализированную NFC карточку 
                с цифровой визиткой, а Покупатель обязуется принять и оплатить товар на условиях 
                настоящего Соглашения.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. Оформление заказа</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>3.1. Заказ оформляется через форму на сайте nfc-vl.ru</p>
                <p>3.2. После оформления заказа Покупатель получает подтверждение на указанный email или Telegram</p>
                <p>3.3. Продавец вправе отказать в выполнении заказа при указании недостоверных данных</p>
                <p>3.4. Стоимость товара указана на сайте и составляет 1 990 рублей (включая доставку по России)</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Оплата</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>4.1. Оплата производится онлайн через платежную систему ЮKassa</p>
                <p>4.2. Доступные способы оплаты:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Банковские карты (Visa, MasterCard, МИР)</li>
                  <li>ЮMoney</li>
                  <li>СБП (Система быстрых платежей)</li>
                </ul>
                <p>4.3. Все платежи проходят через защищенное соединение</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Изготовление и доставка</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>5.1. Срок изготовления карточки: 3-5 рабочих дней</p>
                <p>5.2. Доставка по России: 3-7 рабочих дней (в зависимости от региона)</p>
                <p>5.3. Доставка осуществляется Почтой России или курьерской службой</p>
                <p>5.4. Трек-номер для отслеживания отправления высылается на email</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Гарантии и ответственность</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>6.1. Гарантия на карточку: 12 месяцев</p>
                <p>6.2. Гарантия не распространяется на:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Механические повреждения</li>
                  <li>Повреждения от воды (если карточка не водостойкая)</li>
                  <li>Повреждения от нагрева или химических веществ</li>
                </ul>
                <p>6.3. В случае брака или неисправности Продавец обязуется заменить товар</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Возврат и обмен</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>7.1. Возврат и обмен возможен в течение 14 дней с момента получения</p>
                <p>7.2. Товар должен сохранить товарный вид и потребительские свойства</p>
                <p>7.3. Возврат персонализированного товара надлежащего качества не предусмотрен законом РФ</p>
                <p>7.4. При обнаружении брака - полный возврат средств или замена товара</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Персональные данные</h2>
              <p className="text-gray-300 leading-relaxed">
                Оформляя заказ, вы соглашаетесь с{' '}
                <a href="/privacy" className="text-green-400 hover:text-green-300 underline">
                  Политикой конфиденциальности
                </a>{' '}
                и даете согласие на обработку персональных данных.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Контакты</h2>
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-gray-300">ИНН: 463405654528</p>
                <p className="text-gray-300 mt-2">Email: <a href="mailto:info@nfc-vl.ru" className="text-green-400 hover:text-green-300">info@nfc-vl.ru</a></p>
                <p className="text-gray-300 mt-2">Сайт: nfc-vl.ru</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms

