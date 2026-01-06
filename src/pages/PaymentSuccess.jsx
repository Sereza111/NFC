import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const PaymentSuccess = () => {
  const [isCOD, setIsCOD] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Проверить тип оплаты
        const urlParams = new URLSearchParams(window.location.search)
        const isCashOnDelivery = urlParams.get('type') === 'cod'
        
        if (isCashOnDelivery) {
          setIsCOD(true)
          setIsLoading(false)
          localStorage.removeItem('pendingOrder')
          return
        }

        // Проверить статус онлайн платежа
        const pendingPayment = localStorage.getItem('pendingPayment')
        if (pendingPayment) {
          const paymentInfo = JSON.parse(pendingPayment)
          setIsTestMode(paymentInfo.isTestMode || false)
          
          // Проверяем статус платежа через API
          const res = await fetch(`/api/payment-status/${paymentInfo.paymentId}`)
          if (res.ok) {
            const data = await res.json()
            setPaymentStatus(data.status)
            
            if (data.status === 'succeeded' || data.paid) {
              // Оплата успешна
              localStorage.removeItem('pendingOrder')
              localStorage.removeItem('pendingPayment')
            }
          }
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error checking payment:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    checkPayment()
  }, [])

  const handleBackHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p>Проверка статуса платежа...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-green-500/30 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500"
          >
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
          >
            {isCOD ? 'Заказ оформлен!' : isTestMode ? 'Карта успешно привязана!' : 'Оплата прошла успешно!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg mb-8"
          >
            {isCOD 
              ? 'Спасибо за ваш заказ! Мы свяжемся с вами для подтверждения и уточнения деталей доставки.' 
              : isTestMode
                ? '🎉 Тестовый платёж на 10₽ прошёл успешно! Деньги автоматически вернутся на вашу карту в течение 3-5 минут. Система оплаты работает корректно!'
                : 'Спасибо за ваш заказ! Мы начнём изготовление карточки в ближайшее время.'}
          </motion.p>

          {isTestMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-yellow-500/10 rounded-xl p-6 mb-8 border border-yellow-500/30"
            >
              <h2 className="text-xl font-semibold text-yellow-400 mb-2">ℹ️ Тестовый режим</h2>
              <p className="text-sm text-gray-300">
                Вы использовали тестовый режим привязки карты. 10 рублей вернутся автоматически.
                Теперь вы можете оформить настоящий заказ на NFC карточку!
              </p>
            </motion.div>
          )}

          {!isTestMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-green-500/10 rounded-xl p-6 mb-8 border border-green-500/30"
            >
              <h2 className="text-xl font-semibold text-green-400 mb-4">Что дальше?</h2>
              <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-green-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Подтверждение на email</div>
                  <div className="text-sm text-gray-400">В течение 5 минут вы получите письмо с деталями заказа</div>
                </div>
              </div>

              {isCOD && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-green-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Подтверждение заказа</div>
                    <div className="text-sm text-gray-400">Мы свяжемся с вами в течение 24 часов</div>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-green-400 font-bold text-sm">{isCOD ? '3' : '2'}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Изготовление</div>
                  <div className="text-sm text-gray-400">Карточка будет готова через 3-5 рабочих дней</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-green-400 font-bold text-sm">{isCOD ? '4' : '3'}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Отправка</div>
                  <div className="text-sm text-gray-400">Вы получите трек-номер для отслеживания посылки</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-green-400 font-bold text-sm">{isCOD ? '5' : '4'}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Получение {isCOD && '+ Оплата'}</div>
                  <div className="text-sm text-gray-400">
                    {isCOD 
                      ? 'Доставка 3-10 дней. Оплата наличными или картой при получении' 
                      : 'Доставка займёт 3-10 дней в зависимости от региона'}
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackHome}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/50"
            >
              Вернуться на главную
            </motion.button>

            <div className="text-sm text-gray-400">
              <p>Возникли вопросы?</p>
              <p className="mt-2">
                Напишите нам:{' '}
                <a href="mailto:info@nfc-vl.ru" className="text-green-400 hover:text-green-300 underline">
                  info@nfc-vl.ru
                </a>
                {' '}или в{' '}
                <a href="https://t.me/nfc_vl" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">
                  Telegram
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Confetti Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "linear"
              }}
              className="absolute w-3 h-3 bg-green-400 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess

