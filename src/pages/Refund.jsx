import React from 'react'
import { motion } from 'framer-motion'

const Refund = () => {
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
            Условия возврата и обмена
          </h1>
          <p className="text-gray-400 mb-8">Информация о возврате товара и возмещении средств</p>

          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Возврат товара надлежащего качества</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>
                  В соответствии с законодательством РФ (Закон о защите прав потребителей), 
                  персонализированные товары (товары, изготовленные по индивидуальному заказу) 
                  <strong className="text-green-400"> не подлежат возврату и обмену</strong>, 
                  если они надлежащего качества.
                </p>
                <p className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-yellow-300">
                  ⚠️ NFC карточки с вашими персональными данными являются товаром, изготовленным 
                  по индивидуальному заказу, и не могут быть возвращены, если нет претензий к качеству.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Возврат товара ненадлежащего качества</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>Вы можете вернуть или обменять товар в следующих случаях:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Обнаружен производственный брак</li>
                  <li>NFC чип не работает</li>
                  <li>Изображение или текст нанесены с ошибками или искажениями</li>
                  <li>Карточка повреждена при доставке</li>
                  <li>Получен не тот товар</li>
                </ul>
                <p className="mt-4">
                  <strong className="text-green-400">Срок для обращения:</strong> 14 дней с момента получения товара
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Процедура возврата</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-4 font-semibold text-green-400">Шаг 1: Свяжитесь с нами</p>
                <div className="ml-4 mb-6 space-y-2">
                  <p>• Email: <a href="mailto:info@nfc-vl.ru" className="text-green-400 hover:text-green-300">info@nfc-vl.ru</a></p>
                  <p>• Telegram: @ARC_303_ARC</p>
                  <p>• Укажите номер заказа и опишите проблему</p>
                </div>

                <p className="mb-4 font-semibold text-green-400">Шаг 2: Предоставьте подтверждение</p>
                <div className="ml-4 mb-6 space-y-2">
                  <p>• Фотографии брака или повреждения</p>
                  <p>• Видео работы (если NFC не функционирует)</p>
                  <p>• Копию товарного чека или подтверждения заказа</p>
                </div>

                <p className="mb-4 font-semibold text-green-400">Шаг 3: Получите решение</p>
                <div className="ml-4 mb-6 space-y-2">
                  <p>• Мы рассмотрим обращение в течение 2 рабочих дней</p>
                  <p>• Предложим замену товара или возврат средств</p>
                  <p>• Сообщим о дальнейших действиях</p>
                </div>

                <p className="mb-4 font-semibold text-green-400">Шаг 4: Возврат товара</p>
                <div className="ml-4 space-y-2">
                  <p>• Отправьте товар по указанному адресу</p>
                  <p>• Расходы на обратную доставку компенсируются</p>
                  <p>• Сохраните трек-номер отправления</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Возврат денежных средств</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>После получения и проверки возвращенного товара:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Возврат средств осуществляется в течение 10 рабочих дней</li>
                  <li>Деньги возвращаются тем же способом, которым была произведена оплата</li>
                  <li>Если оплата была картой — средства возвращаются на карту</li>
                  <li>Полная стоимость товара и доставки возмещается при подтверждении брака</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Обмен товара</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>При обнаружении брака вы можете:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <h3 className="font-semibold text-green-400 mb-2">✅ Обменять на новую карточку</h3>
                    <p className="text-sm">Бесплатное изготовление и доставка нового товара</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <h3 className="font-semibold text-green-400 mb-2">💰 Вернуть деньги</h3>
                    <p className="text-sm">Полный возврат стоимости товара и доставки</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Гарантия</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p><strong className="text-green-400">Гарантийный срок:</strong> 12 месяцев с даты получения</p>
                <p className="mt-3">Гарантия распространяется на:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Работоспособность NFC чипа</li>
                  <li>Качество печати и материалов</li>
                  <li>Прочность карточки при нормальной эксплуатации</li>
                </ul>
                <p className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-red-300">
                  ❌ Гарантия НЕ распространяется на повреждения от:
                  <ul className="list-disc list-inside ml-4 mt-2">
                    <li>Механических воздействий (удары, изгибы)</li>
                    <li>Контакта с водой (для обычных карточек)</li>
                    <li>Высоких температур</li>
                    <li>Химических веществ</li>
                  </ul>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Контакты для возврата</h2>
              <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-gray-300 mb-2">ИНН: 463405654528</p>
                <p className="text-gray-300 mb-2">Email: <a href="mailto:info@nfc-vl.ru" className="text-green-400 hover:text-green-300">info@nfc-vl.ru</a></p>
                <p className="text-gray-300 mb-2">Telegram: @ARC_303_ARC</p>
                <p className="text-gray-300 mt-4 text-sm">Время обработки обращений: пн-пт, 10:00-19:00 (МСК)</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Refund

