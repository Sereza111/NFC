import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import InputMask from 'react-input-mask'
import DeliverySelector from '../components/DeliverySelector'
import CheckoutProgress from '../components/CheckoutProgress'
import PromoCode from '../components/PromoCode'
import { useFormValidation } from '../hooks/useFormValidation'
import { useLocalStorage, useDebounce } from '../hooks/useLocalStorage'

const CheckoutImproved = () => {
  const [orderData, setOrderData] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentType, setPaymentType] = useState('online')
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [deliveryData, setDeliveryData] = useState(null)
  const [promoData, setPromoData] = useState(null)

  // Валидация формы
  const {
    values: formValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setValues
  } = useFormValidation({
    fullname: '',
    email: '',
    phone: ''
  })

  // Автосохранение формы в localStorage
  const [savedFormData, setSavedFormData, clearSavedFormData] = useLocalStorage('checkout_form_data', {})
  const debouncedFormValues = useDebounce(formValues, 500)

  useEffect(() => {
    // Автосохранение
    if (debouncedFormValues) {
      setSavedFormData(debouncedFormValues)
    }
  }, [debouncedFormValues, setSavedFormData])

  useEffect(() => {
    // Получить данные заказа
    const savedOrder = localStorage.getItem('pendingOrder')
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder))
    } else {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }

    // Восстановить данные формы
    if (savedFormData && Object.keys(savedFormData).length > 0) {
      setValues(savedFormData)
    }
  }, [])

  const handleDeliverySelect = (delivery) => {
    setDeliveryData(delivery)
  }

  const handlePromoApply = (promo) => {
    setPromoData(promo)
  }

  // Расчет итоговой суммы
  const calculateTotal = () => {
    let subtotal = 1990
    const deliveryCost = deliveryData?.cost || 0
    let discount = 0

    if (promoData) {
      if (promoData.type === 'percent') {
        discount = Math.round((subtotal + deliveryCost) * (promoData.discount / 100))
      } else {
        discount = promoData.discount
      }
    }

    return {
      subtotal,
      deliveryCost,
      discount,
      total: subtotal + deliveryCost - discount
    }
  }

  const totals = calculateTotal()

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Валидация контактных данных
      const isValid = validateAll({
        fullname: ['required', 'fullname'],
        email: ['required', 'email'],
        phone: ['required', 'phone']
      })

      if (isValid) {
        setCurrentStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 2) {
      // Проверка выбора доставки
      if (!deliveryData) {
        alert('Пожалуйста, выберите способ доставки и отделение')
        return
      }
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePayment = async () => {
    if (!acceptTerms) {
      alert('Пожалуйста, примите условия соглашения')
      return
    }

    setIsProcessing(true)

    try {
      const orderPayload = {
        ...orderData,
        fullname: formValues.fullname,
        email: formValues.email,
        phone: formValues.phone,
        delivery: deliveryData,
        promo: promoData,
        paymentMethod: 'yookassa',
        paymentType: paymentType,
        status: paymentType === 'cash_on_delivery' ? 'pending_approval' : 'pending_payment',
        totalAmount: totals.total
      }

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) throw new Error('Order submission failed')
      
      const result = await res.json()
      const orderId = result.id

      // Очистить сохраненные данные
      clearSavedFormData()
      localStorage.removeItem('pendingOrder')

      if (paymentType === 'cash_on_delivery') {
        setTimeout(() => {
          window.history.pushState({}, '', '/payment-success?type=cod')
          window.dispatchEvent(new PopStateEvent('popstate'))
        }, 1000)
        return
      }

      // Онлайн оплата
      const paymentRes = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          amount: totals.total,
          description: 'Оплата NFC карточки',
          email: formValues.email,
          paymentMethod: 'yookassa'
        })
      })

      if (!paymentRes.ok) throw new Error('Payment creation failed')

      const paymentData = await paymentRes.json()
      
      if (paymentData.ok && paymentData.confirmationUrl) {
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: paymentData.paymentId,
          orderId: orderId,
          amount: totals.total
        }))
        
        window.location.href = paymentData.confirmationUrl
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <motion.button
          onClick={handleBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
        >
          Оформление заказа
        </motion.h1>
        <p className="text-gray-400 mb-6 sm:mb-8">Заполните данные для получения вашей NFC карточки</p>

        {/* Прогресс */}
        <CheckoutProgress currentStep={currentStep} />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Основная форма */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ШАГ 1: Контактные данные */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
              >
                <h2 className="text-2xl font-bold text-green-400 mb-6">1. Контактные данные</h2>
                
                <div className="space-y-4">
                  {/* ФИО */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ФИО <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formValues.fullname}
                      onChange={handleChange}
                      onBlur={(e) => handleBlur(e, ['required', 'fullname'])}
                      placeholder="Иванов Иван Иванович"
                      className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        errors.fullname && touched.fullname
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-600 focus:border-green-500'
                      }`}
                    />
                    {errors.fullname && touched.fullname && (
                      <p className="mt-1 text-sm text-red-400">{errors.fullname}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Как на вашей карточке</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      onBlur={(e) => handleBlur(e, ['required', 'email'])}
                      placeholder="example@mail.ru"
                      className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-600 focus:border-green-500'
                      }`}
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Для отправки подтверждения заказа</p>
                  </div>

                  {/* Телефон с маской */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон <span className="text-red-400">*</span>
                    </label>
                    <InputMask
                      mask="+7 (999) 999-99-99"
                      value={formValues.phone}
                      onChange={handleChange}
                      onBlur={(e) => handleBlur(e, ['required', 'phone'])}
                    >
                      {(inputProps) => (
                        <input
                          {...inputProps}
                          type="tel"
                          name="phone"
                          placeholder="+7 (___) ___-__-__"
                          className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                            errors.phone && touched.phone
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-600 focus:border-green-500'
                          }`}
                        />
                      )}
                    </InputMask>
                    {errors.phone && touched.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="mt-6 w-full sm:w-auto px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
                >
                  Далее: Доставка →
                </button>
              </motion.div>
            )}

            {/* ШАГ 2: Доставка */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
              >
                <h2 className="text-2xl font-bold text-green-400 mb-6">2. Способ доставки</h2>
                
                <DeliverySelector 
                  onDeliverySelect={handleDeliverySelect}
                  initialDelivery={deliveryData}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!deliveryData}
                    className="flex-1 px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    Далее: Оплата →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ШАГ 3: Оплата */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
              >
                <h2 className="text-2xl font-bold text-green-400 mb-6">3. Способ оплаты</h2>
                
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
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
                    <div className="text-xs text-gray-400 mt-1">Картой через ЮKassa</div>
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

                <label className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">
                    Я согласен с{' '}
                    <a href="/terms" target="_blank" className="text-green-400 hover:text-green-300 underline">
                      условиями обработки персональных данных
                    </a>
                    {' '}и{' '}
                    <a href="/policy" target="_blank" className="text-green-400 hover:text-green-300 underline">
                      политикой конфиденциальности
                    </a>
                  </span>
                </label>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={!acceptTerms || isProcessing}
                    className="flex-1 px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Обработка...
                      </>
                    ) : (
                      `Оплатить ${totals.total} ₽`
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar: Сводка заказа (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
              >
                <h3 className="text-xl font-bold text-green-400 mb-4">Ваш заказ</h3>

                {/* Товары */}
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-2xl">
                      💳
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">NFC визитка</div>
                      <div className="text-sm text-gray-400">× 1</div>
                    </div>
                    <div className="font-semibold">{totals.subtotal} ₽</div>
                  </div>
                </div>

                {/* Промокод */}
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <PromoCode onApply={handlePromoApply} />
                </div>

                {/* Итоги */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Товары:</span>
                    <span>{totals.subtotal} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Доставка:</span>
                    <span>{deliveryData?.cost > 0 ? `${totals.deliveryCost} ₽` : '—'}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Скидка:</span>
                      <span>-{totals.discount} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
                    <span>Итого:</span>
                    <span className="text-green-400">{totals.total} ₽</span>
                  </div>
                </div>

                {/* Гарантии */}
                <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Гарантия 12 месяцев</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Безопасная оплата через ЮKassa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Трек-номер для отслеживания</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutImproved

