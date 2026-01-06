import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PromoCode = ({ onApply }) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(null)
  const [error, setError] = useState(null)

  const handleApply = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      })
      
      const data = await res.json()
      
      if (data.valid) {
        setApplied({
          code: code.trim().toUpperCase(),
          discount: data.discount,
          type: data.type // 'percent' или 'fixed'
        })
        onApply(data)
      } else {
        setError('Промокод не действителен или истек')
      }
    } catch (err) {
      setError('Ошибка проверки промокода')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setApplied(null)
    setCode('')
    onApply(null)
  }

  return (
    <div className="space-y-2">
      {!applied ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Промокод"
            className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none text-sm"
            maxLength={20}
            disabled={loading}
          />
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
          >
            {loading ? '...' : 'Применить'}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-green-400">{applied.code}</div>
                <div className="text-xs text-gray-400">
                  Скидка: {applied.type === 'percent' ? `${applied.discount}%` : `${applied.discount} ₽`}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PromoCode

