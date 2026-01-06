import React from 'react'
import { motion } from 'framer-motion'

const Requisites = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white">
      {/* Header with back button */}
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
          Назад на главную
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Реквизиты и контакты
          </h1>
          <p className="text-gray-400 mb-12">Юридическая информация и контактные данные</p>

          {/* Main content */}
          <div className="space-y-6">
            {/* Legal Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Юридическая информация</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Индивидуальный предприниматель</div>
                  <div className="text-lg font-medium">Самозанятый</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">ИНН</div>
                  <div className="text-lg font-medium text-green-400">463405654528</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Сайт</div>
                  <div className="text-lg font-medium">https://nfc-vl.ru/</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Вид деятельности</div>
                  <div className="text-lg font-medium">Производство и продажа NFC карточек</div>
                </div>
              </div>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Контактная информация</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-green-400 mr-4 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email для связи</div>
                    <a href="mailto:info@nfc-vl.ru" className="text-lg hover:text-green-400 transition-colors">
                      info@nfc-vl.ru
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-green-400 mr-4 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Telegram</div>
                    <a href="https://t.me/ARC_303_ARC" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-green-400 transition-colors">
                      @ARC_303_ARC
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-green-400 mr-4 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Сайт</div>
                    <a href="https://nfc-vl.ru" className="text-lg hover:text-green-400 transition-colors">
                      nfc-vl.ru
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Способы оплаты</h2>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <div>Банковские карты (Visa, MasterCard, МИР)</div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <div>ЮKassa (ЮMoney)</div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <div>СБП (Система быстрых платежей)</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-sm text-gray-300">
                  <span className="text-green-400 font-semibold">Безопасность платежей:</span> Все платежи проходят через защищенное соединение. 
                  Мы не храним данные банковских карт. Платежи обрабатываются через сертифицированную платежную систему ЮKassa.
                </p>
              </div>
            </motion.div>

            {/* Legal Documents Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-6">Документы</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/privacy"
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all group"
                >
                  <span className="text-gray-300 group-hover:text-white">Политика конфиденциальности</span>
                  <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <a
                  href="/terms"
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all group"
                >
                  <span className="text-gray-300 group-hover:text-white">Пользовательское соглашение</span>
                  <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <a
                  href="/refund"
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all group"
                >
                  <span className="text-gray-300 group-hover:text-white">Условия возврата</span>
                  <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                <a
                  href="/delivery"
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all group"
                >
                  <span className="text-gray-300 group-hover:text-white">Доставка и оплата</span>
                  <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-gray-400 text-sm py-8"
            >
              <p>© 2024 NFC-VL.RU — Производство и продажа NFC визиток</p>
              <p className="mt-2">ИНН: 463405654528</p>
              <p className="mt-4">Все права защищены</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Requisites

