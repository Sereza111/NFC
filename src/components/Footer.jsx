import React from 'react'
import { motion } from 'framer-motion'

const Footer = () => {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <footer className="bg-black border-t border-green-500/20 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-4">NFC-VL.RU</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Производство и продажа персонализированных NFC карточек для бизнеса и личного использования.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Документы</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('/requisites')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Реквизиты
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/privacy')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Политика конфиденциальности
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/terms')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Пользовательское соглашение
                </button>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('/delivery')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Доставка и оплата
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/refund')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Возврат и обмен
                </button>
              </li>
              <li>
                <a
                  href="#customizer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Заказать карточку
                </a>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold text-white mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@nfc-vl.ru"
                  className="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@nfc-vl.ru
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/ARC_303_ARC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.10.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  @ARC_303_ARC
                </a>
              </li>
              <li className="text-gray-400 text-xs mt-4">
                ИНН: 463405654528
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-green-500/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 NFC-VL.RU — Все права защищены</p>
            <div className="flex items-center mt-4 md:mt-0 space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Работаем по всей России
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

