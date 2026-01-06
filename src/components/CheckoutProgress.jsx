import React from 'react'
import { motion } from 'framer-motion'

const CheckoutProgress = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, label: 'Контакты' },
    { number: 2, label: 'Доставка' },
    { number: 3, label: 'Оплата' }
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: currentStep >= step.number ? '#10b981' : '#374151',
                scale: currentStep === step.number ? 1.1 : 1
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                currentStep >= step.number ? 'ring-4 ring-green-500/30' : ''
              }`}
            >
              {currentStep > step.number ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </motion.div>
            <span className={`ml-2 text-sm font-medium hidden sm:inline ${
              currentStep >= step.number ? 'text-green-400' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className="flex-1 mx-2 sm:mx-4">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep > step.number ? '#10b981' : '#374151'
                }}
                className="h-1 rounded-full transition-all"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default CheckoutProgress

