import React from 'react'
import { motion } from 'framer-motion'

const Delivery = () => {
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
            Доставка и оплата
          </h1>
          <p className="text-gray-400 mb-8">Информация о способах доставки и оплаты заказа</p>

          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl p-8 border border-green-500/40"
            >
              <div className="text-center">
                <p className="text-gray-300 text-lg mb-2">Стоимость NFC карточки</p>
                <p className="text-6xl font-bold text-green-400 mb-2">1 990 ₽</p>
                <p className="text-gray-300">Включая доставку по всей России</p>
              </div>
            </motion.div>

            {/* Delivery Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 space-y-6"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-4">Доставка</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-900/50 rounded-xl border border-green-500/20">
                  <div className="text-green-400 mb-3">
                    <div className="text-3xl">📦</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Почта России — Посылка</h3>
                  <p className="text-gray-300 text-sm mb-3">Стандартная доставка в любой регион РФ</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Срок:</span>
                      <span className="text-white">5-10 дней</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Стоимость:</span>
                      <span className="text-white font-semibold">~360 ₽</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-900/50 rounded-xl border border-green-500/20">
                  <div className="text-green-400 mb-3">
                    <div className="text-3xl">⚡</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Почта России — EMS</h3>
                  <p className="text-gray-300 text-sm mb-3">Ускоренная экспресс-доставка</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Срок:</span>
                      <span className="text-white">2-4 дня</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Стоимость:</span>
                      <span className="text-white font-semibold">~630 ₽</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-900/50 rounded-xl border border-green-500/20">
                  <div className="text-green-400 mb-3">
                    <div className="text-3xl">🚚</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Почта России — Курьер</h3>
                  <p className="text-gray-300 text-sm mb-3">Курьерская доставка до двери</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Срок:</span>
                      <span className="text-white">3-5 дней</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Стоимость:</span>
                      <span className="text-white font-semibold">~480 ₽</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-sm text-gray-300">
                    ✨ <strong className="text-green-400">Новое!</strong> Теперь вы можете выбрать удобный способ доставки при оформлении заказа
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-gray-300">
                    📦 После отправки вы получите трек-номер для отслеживания посылки на указанный email
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Способы оплаты</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 bg-gray-900/50 rounded-xl border border-green-500/20 text-center">
                  <div className="text-4xl mb-3">💳</div>
                  <h3 className="font-semibold mb-2">Банковская карта</h3>
                  <p className="text-sm text-gray-400">Visa, MasterCard, МИР</p>
                </div>

                <div className="p-5 bg-gray-900/50 rounded-xl border border-green-500/20 text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-semibold mb-2">ЮMoney</h3>
                  <p className="text-sm text-gray-400">Электронный кошелёк</p>
                </div>

                <div className="p-5 bg-gray-900/50 rounded-xl border border-green-500/20 text-center">
                  <div className="text-4xl mb-3">📱</div>
                  <h3 className="font-semibold mb-2">СБП</h3>
                  <p className="text-sm text-gray-400">Система быстрых платежей</p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/30">
                <h3 className="font-semibold text-green-400 mb-3">🔒 Безопасность платежей</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Защищенное соединение HTTPS</li>
                  <li>✓ Платежи через сертифицированную систему ЮKassa</li>
                  <li>✓ Данные карт не сохраняются на нашем сервере</li>
                  <li>✓ Соответствие стандарту PCI DSS</li>
                </ul>
              </div>
            </motion.div>

            {/* Production Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Процесс изготовления и доставки</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mr-4">
                    <span className="text-green-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Оформление заказа</h3>
                    <p className="text-sm text-gray-400">Заполните форму на сайте и выберите дизайн</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ 5-10 минут</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mr-4">
                    <span className="text-green-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Подтверждение и оплата</h3>
                    <p className="text-sm text-gray-400">Получите подтверждение и оплатите онлайн</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ Сразу после заказа</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mr-4">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Изготовление карточки</h3>
                    <p className="text-sm text-gray-400">Персонализация, печать и программирование NFC</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ 3-5 рабочих дней</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mr-4">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Отправка</h3>
                    <p className="text-sm text-gray-400">Упаковка и передача в службу доставки</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ На следующий день после изготовления</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mr-4">
                    <span className="text-green-400 font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Доставка</h3>
                    <p className="text-sm text-gray-400">Получение по трек-номеру</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ 3-10 дней (зависит от региона)</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
                <p className="text-green-400 font-semibold">
                  ⚡ Общий срок от заказа до получения: 6-15 дней
                </p>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Частые вопросы</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-green-400">Можно ли забрать самовывозом?</h3>
                  <p className="text-gray-300 text-sm">
                    Самовывоз возможен по договоренности. Свяжитесь с нами для уточнения деталей.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-green-400">Доставка за границу?</h3>
                  <p className="text-gray-300 text-sm">
                    Да, осуществляем международную доставку. Стоимость и срок рассчитываются индивидуально.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-green-400">Можно ли заказать несколько карточек?</h3>
                  <p className="text-gray-300 text-sm">
                    Конечно! При заказе от 10 карточек предоставляем скидку. Свяжитесь для уточнения цены.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/40 text-center"
            >
              <h3 className="text-xl font-semibold mb-3">Остались вопросы?</h3>
              <p className="text-gray-300 mb-4">Свяжитесь с нами любым удобным способом</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="mailto:info@nfc-vl.ru" className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                  Email: info@nfc-vl.ru
                </a>
                <a href="https://t.me/ARC_303_ARC" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
                  Telegram: @ARC_303_ARC
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Delivery

