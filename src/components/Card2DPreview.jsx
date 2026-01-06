import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Card2DPreview = ({ cardData }) => {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isFlipped, setIsFlipped] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Вычисляем наклон (максимум 10 градусов)
    const tiltX = ((y - centerY) / centerY) * -10
    const tiltY = ((x - centerX) / centerX) * 10
    
    // Позиция бликов
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    
    setTilt({ x: tiltX, y: tiltY })
    setGlarePos({ x: glareX, y: glareY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setGlarePos({ x: 50, y: 50 })
  }

  const hasTexture = !!(cardData.backgroundImage && cardData.backgroundImage !== '')
  const hasBackTexture = !!(cardData.backgroundImageBack && cardData.backgroundImageBack !== '')
  
  // Текущее изображение в зависимости от стороны
  const currentImage = isFlipped 
    ? (cardData.backgroundImageBack || cardData.backgroundImage)
    : cardData.backgroundImage

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
      {/* Кнопка переворота */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFlipped(!isFlipped)}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
      >
        <motion.span
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          🔄
        </motion.span>
        {isFlipped ? 'Передняя' : 'Задняя'}
      </motion.button>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y + (isFlipped ? 180 : 0),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        className="relative w-full max-w-[500px] aspect-[1.75/1] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? 'back' : 'front'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: hasTexture 
                  ? `url(${currentImage}) center/cover`
                  : `linear-gradient(135deg, ${cardData.primaryColor || '#0a0a0a'}, ${cardData.secondaryColor || '#00ff88'})`,
                transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
              }}
            />

            {/* Dark overlay for text visibility */}
            {hasTexture && (
              <div className="absolute inset-0 bg-black/20" />
            )}

            {/* Subtle shine effect - more elegant */}
            {cardData.holographic !== false && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.15,
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
                  mixBlendMode: 'soft-light',
                }}
              />
            )}

            {/* Subtle gradient shift effect */}
            {cardData.glowEffect !== false && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.1,
                  background: `linear-gradient(${glarePos.x * 1.8}deg, 
                    rgba(0,255,136,0.3) 0%, 
                    transparent 50%, 
                    rgba(0,255,136,0.2) 100%)`,
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* Minimal visual elements - design shows through */}
            <div className="absolute inset-0">
              {/* Empty - let the background design show through */}
            </div>

            {/* Subtle border glow */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: `inset 0 0 30px rgba(0, 255, 136, 0.15), 0 0 20px rgba(0, 255, 136, 0.1)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      
      {/* Индикатор стороны */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 px-4 py-2 bg-black/50 rounded-lg border border-green-500/30"
      >
        <p className="text-sm text-green-400 font-medium">
          {isFlipped ? '📋 Задняя сторона' : '📋 Передняя сторона'}
        </p>
      </motion.div>
    </div>
  )
}

export default Card2DPreview

