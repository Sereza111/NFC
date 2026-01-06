import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DeliverySelector from '../components/DeliverySelector'

const Checkout = () => {
  const [orderData, setOrderData] = useState(null)
  const [paymentType, setPaymentType] = useState('online') // 'online' или 'cash_on_delivery'
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [deliveryData, setDeliveryData] = useState(null)

  useEffect(() => {
    // Получить данные заказа из localStorage
    const savedOrder = localStorage.getItem('pendingOrder')
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder))
    } else {
      // Если нет данных заказа, вернуться на главную
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [])

  const handleDeliverySelect = (delivery) => {
    setDeliveryData(delivery)
  }

  const handlePayment = async () => {
    if (!acceptTerms) {
      alert('Пожалуйста, примите условия соглашения')
      return
    }

    setIsProcessing(true)

    try {
      // Отправить заказ в БД и Telegram
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          delivery: deliveryData, // Добавляем данные о доставке
          paymentMethod: 'yookassa',
          paymentType: paymentType,
          status: paymentType === 'cash_on_delivery' ? 'pending_approval' : 'pending_payment'
        })
      })

      if (!res.ok) throw new Error('Order submission failed')
      
      const result = await res.json()
      const orderId = result.id

      // Если оплата при получении - сразу на страницу успеха
      if (paymentType === 'cash_on_delivery') {
        setTimeout(() => {
          localStorage.removeItem('pendingOrder')
          window.history.pushState({}, '', '/payment-success?type=cod')
          window.dispatchEvent(new PopStateEvent('popstate'))
        }, 1000)
        return
      }

      // Онлайн оплата через ЮKassa
      const paymentAmount = 1990
      const paymentDescription = 'Оплата NFC карточки с цифровым профилем'

      const paymentRes = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          amount: paymentAmount,
          description: paymentDescription,
          email: orderData.email,
          paymentMethod: 'yookassa'
        })
      })

      if (!paymentRes.ok) {
        const error = await paymentRes.json()
        throw new Error(error.error || 'Payment creation failed')
      }

      const paymentData = await paymentRes.json()
      
      if (paymentData.ok && paymentData.confirmationUrl) {
        // Сохраняем информацию о платеже для возврата
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: paymentData.paymentId,
          orderId: orderId,
          amount: paymentAmount
        }))
        
        // Редирект на страницу оплаты ЮKassa
        window.location.href = paymentData.confirmationUrl
      } else {
        throw new Error('Invalid payment response')
      }

    } catch (error) {
      console.error('Payment error:', error)
      alert('Ошибка при обработке платежа: ' + error.message)
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.button
          onClick={handleBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Вернуться к оформлению
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
        >
          Оформление заказа
        </motion.h1>
        <p className="text-gray-400 mb-8">Проверьте данные и выберите способ оплаты</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
            >
              <h2 className="text-xl font-bold text-green-400 mb-4">Предпросмотр карточки</h2>
              <div 
                className="w-full aspect-[1.75/1] rounded-xl shadow-2xl shadow-green-500/20 p-6 text-white relative overflow-hidden border border-green-500/30" 
                style={{ 
                  background: orderData.backgroundImage 
                    ? `url(${orderData.backgroundImage})`
                    : orderData.backgroundStyle === 'gradient' 
                      ? `linear-gradient(135deg, ${orderData.primaryColor}, ${orderData.secondaryColor})` 
                      : orderData.primaryColor,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="h-full flex flex-col justify-between relative z-10">
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{ color: orderData.textColor }}>DIGITAL CARD</div>
                    <div className="text-xl font-bold drop-shadow-lg" style={{ color: orderData.textColor }}>{orderData.name || 'Ваше имя'}</div>
                    <div className="text-sm opacity-90 drop-shadow-lg" style={{ color: orderData.textColor }}>{orderData.title || 'Должность'}</div>
                    <div className="text-xs opacity-75 drop-shadow-lg" style={{ color: orderData.textColor }}>{orderData.company || 'Компания'}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1 text-xs drop-shadow-lg" style={{ color: orderData.textColor }}>
                      {orderData.phone && <div>📞 {orderData.phone}</div>}
                      {orderData.email && <div>✉️ {orderData.email}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
            >
              <h2 className="text-xl font-bold text-green-400 mb-4">Данные карточки</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Имя</div>
                  <div className="font-medium">{orderData.name || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Должность</div>
                  <div className="font-medium">{orderData.title || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Компания</div>
                  <div className="font-medium">{orderData.company || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Телефон</div>
                  <div className="font-medium">{orderData.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Email</div>
                  <div className="font-medium">{orderData.email || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Telegram</div>
                  <div className="font-medium">{orderData.telegram || '—'}</div>
                </div>
              </div>
            </motion.div>

            {/* Payment Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
            >
              <h2 className="text-xl font-bold text-green-400 mb-4">Тип оплаты</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentType('online')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentType === 'online'
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-gray-600 hover:border-green-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold">Оплата онлайн</div>
                  <div className="text-xs text-gray-400 mt-1">Сейчас через ЮKassa</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentType('cash_on_delivery')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentType === 'cash_on_delivery'
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-gray-600 hover:border-green-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-semibold">При получении</div>
                  <div className="text-xs text-gray-400 mt-1">Оплата после доставки</div>
                </motion.button>
              </div>

              {paymentType === 'online' && (
                <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💳</div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-400 mb-2 text-lg">Оплата через ЮKassa</div>
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li>• Банковские карты (Visa, MasterCard, МИР)</li>
                        <li>• ЮMoney и другие электронные кошельки</li>
                        <li>• СБП (Система быстрых платежей)</li>
                        <li>• Наличные через терминалы</li>
                      </ul>
                      <div className="mt-4 p-3 bg-black/30 rounded-lg">
                        <p className="text-xs text-gray-400">
                          🔒 Безопасная оплата. Данные карты защищены по стандарту PCI DSS. Выбор способа оплаты будет доступен на следующей странице.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentType === 'cash_on_delivery' && (
                <div className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">ℹ️</div>
                    <div>
                      <div className="font-semibold text-blue-400 mb-2">Оплата при получении</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Заказ будет обработан после подтверждения</li>
                        <li>• Оплата наличными или картой курьеру</li>
                        <li>• Или на почте при получении</li>
                        <li>• Мы свяжемся с вами для подтверждения</li>
                      </ul>
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <div className="text-sm font-semibold text-green-400 mb-1">📞 Контакты для связи:</div>
                        <a href="https://t.me/ARC_303_ARC" target="_blank" rel="noopener noreferrer" className="text-sm text-green-300 hover:text-green-200 underline">
                          @ARC_303_ARC
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </motion.div>

          {/* Delivery Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
          >
            <DeliverySelector 
              onDeliverySelect={handleDeliverySelect}
              initialDelivery={deliveryData}
            />
          </motion.div>

          {/* Terms Agreement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
          >
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 mr-3 w-5 h-5 accent-green-500"
                />
                <span className="text-sm text-gray-300">
                  Я согласен с{' '}
                  <a href="/terms" target="_blank" className="text-green-400 hover:text-green-300 underline">
                    пользовательским соглашением
                  </a>
                  ,{' '}
                  <a href="/privacy" target="_blank" className="text-green-400 hover:text-green-300 underline">
                    политикой конфиденциальности
                  </a>
                  {' '}и{' '}
                  <a href="/refund" target="_blank" className="text-green-400 hover:text-green-300 underline">
                    условиями возврата
                  </a>
                </span>
              </label>
            </motion.div>
          </div>

          {/* Order Total Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/40 sticky top-6"
            >
              <h2 className="text-xl font-bold mb-6">Итого к оплате</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">NFC карточка</span>
                  <span className="font-semibold">1 990 ₽</span>
                </div>
                {deliveryData?.cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      Доставка {deliveryData?.methodName ? `(${deliveryData.methodName})` : ''}
                    </span>
                    <span className="font-semibold">{deliveryData.cost} ₽</span>
                  </div>
                )}
                {!deliveryData?.cost && (
                  <div className="text-sm text-gray-400 italic">
                    Стоимость доставки рассчитается после выбора отделения
                  </div>
                )}
                <div className="border-t border-green-500/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Всего:</span>
              <span className="text-3xl font-bold text-green-400">
                {deliveryData?.cost > 0 ? (1990 + deliveryData.cost) : 1990} ₽
              </span>
              {!deliveryData?.cost && (
                <div className="text-xs text-gray-400 mt-1">+ доставка</div>
              )}
                  </div>
                </div>
              </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={isProcessing || !acceptTerms}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isProcessing || !acceptTerms
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/50'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Обработка...
                </span>
              ) : paymentType === 'cash_on_delivery' ? (
                'Оформить заказ'
              ) : (
                'Перейти к оплате'
              )}
            </motion.button>

              <div className="mt-6 space-y-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Изготовление: 3-5 дней
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Доставка: 3-10 дней
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Гарантия: 12 месяцев
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout



