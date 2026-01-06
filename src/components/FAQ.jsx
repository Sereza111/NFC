import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const qa = [
  { 
    q: 'Чем отличается физическая NFC карта?', 
    a: 'Физическая карта с NFC чипом открывает вашу цифровую страницу в одно касание телефона. Это стильный и профессиональный способ обмена контактами.',
    icon: '💳'
  },
  { 
    q: 'Как менять данные на цифровой странице?', 
    a: 'Мы предоставляем ссылку-редактор. Обновляете контакты — изменения видят все по той же ссылке. Не нужно перевыпускать карту!',
    icon: '✏️'
  },
  { 
    q: 'Безопасность данных', 
    a: 'Мы храним только предоставленные вами публичные контакты. Передача защищена HTTPS. Ваши данные в полной безопасности.',
    icon: '🔒'
  },
  { 
    q: 'Если карточка потеряна', 
    a: 'Мы перенесём вашу страницу на новую карту. Старую деактивируем. Ваши данные останутся при вас.',
    icon: '🔄'
  },
  {
    q: 'Работает ли на iPhone?',
    a: 'Да! NFC поддерживается на iPhone начиная с модели iPhone 7. Просто приложите карточку к верхней части телефона.',
    icon: '📱'
  },
  {
    q: 'Сколько контактов можно добавить?',
    a: 'Неограниченное количество! Добавляйте все соцсети, мессенджеры, ссылки — всё что угодно.',
    icon: '∞'
  }
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Частые вопросы
          </h2>
          <p className="text-gray-400 text-lg">Всё что нужно знать о NFC карточках</p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {qa.map((item, idx) => (
            <FAQItem
              key={idx}
              item={item}
              index={idx}
              isOpen={openIndex === idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQItem = ({ item, index, isOpen, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <motion.div
        animate={{
          scale: isOpen ? 1.02 : 1,
          boxShadow: isOpen 
            ? '0 0 30px rgba(0, 255, 136, 0.3)' 
            : isHovered 
            ? '0 0 20px rgba(0, 255, 136, 0.15)'
            : '0 0 0 rgba(0, 255, 136, 0)'
        }}
        transition={{ duration: 0.3 }}
        className={`bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border-2 rounded-2xl overflow-hidden cursor-pointer ${
          isOpen 
            ? 'border-green-500/50' 
            : 'border-green-500/20 hover:border-green-500/40'
        }`}
        onClick={onClick}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              animate={{
                rotate: isOpen ? 360 : 0,
                scale: isHovered ? 1.2 : 1
              }}
              transition={{ duration: 0.5 }}
              className="text-3xl"
            >
              {item.icon}
            </motion.div>
            
            <motion.div
              animate={{
                color: isOpen ? '#00FF88' : '#FFFFFF'
              }}
              className="font-semibold text-lg"
            >
              {item.q}
            </motion.div>
          </div>

          <motion.div
            animate={{
              rotate: isOpen ? 180 : 0,
              color: isOpen ? '#00FF88' : '#666'
            }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold"
          >
            ↓
          </motion.div>
        </div>

        {/* Answer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                className="px-6 pb-6 pt-0"
              >
                <div className="pl-16 pr-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="h-px bg-gradient-to-r from-green-500/50 to-transparent mb-4"
                  />
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-gray-300 leading-relaxed"
                  >
                    {item.a}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect on hover */}
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 136, 0.1), transparent 60%)'
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default FAQ
