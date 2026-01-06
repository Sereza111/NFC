import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Benefits = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <section className="py-16 sm:py-20 bg-black relative overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Зачем нужна NFC карточка?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Современный способ обмена контактами в цифровую эпоху
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <ReasonCard
            index={0}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            icon="⚡"
            title="Мгновенная передача"
            description="Одно касание телефона — и все ваши контакты у собеседника"
            color="from-green-400 to-emerald-500"
          />
          
          <ReasonCard
            index={1}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            icon="🔄"
            title="Всегда актуальные данные"
            description="Обновили телефон или email? Изменения видны всем автоматически"
            color="from-emerald-400 to-cyan-500"
          />
          
          <ReasonCard
            index={2}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            icon="🌍"
            title="Работает везде"
            description="iOS, Android — не важно. NFC поддерживается всеми современными смартфонами"
            color="from-cyan-400 to-blue-500"
          />
          
          <ReasonCard
            index={3}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            icon="💼"
            title="Профессионально"
            description="Произведите впечатление на деловых встречах и нетворкинге"
            color="from-blue-400 to-indigo-500"
          />
          
          <ReasonCard
            index={4}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            icon="🌳"
            title="Экологично"
            description="Забудьте о бумажных визитках, которые теряются и выбрасываются"
            color="from-green-500 to-lime-500"
          />
          
          <ReasonCard
            index={5}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            icon="📊"
            title="Аналитика"
            description="Отслеживайте, кто и когда просматривал вашу карточку"
            color="from-purple-400 to-pink-500"
          />
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center mb-10 text-green-400">
            Почему NFC лучше бумаги
          </h3>
          
          <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
            <ComparisonRow
              title="Мгновенное обновление"
              nfc="Сразу меняете ссылку и контакты"
              paper="Нужно печатать заново"
              delay={0}
            />
            <ComparisonRow
              title="Бесконечные контакты"
              nfc="Все соцсети и ссылки"
              paper="Ограничено размером карты"
              delay={0.1}
            />
            <ComparisonRow
              title="Один клик"
              nfc="Сохранение в телефон"
              paper="Ручной набор"
              delay={0.2}
            />
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </section>
  )
}

const ReasonCard = ({ index, hoveredIndex, setHoveredIndex, icon, title, description, color }) => {
  const [isGlitching, setIsGlitching] = useState(false)
  const [displayTitle, setDisplayTitle] = useState(title)
  const originalTitle = title
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"

  useEffect(() => {
    if (isGlitching) {
      let iteration = 0
      const interval = setInterval(() => {
        setDisplayTitle(
          originalTitle
            .split("")
            .map((letter, idx) => {
              if (idx < iteration) {
                return originalTitle[idx]
              }
              return letters[Math.floor(Math.random() * letters.length)]
            })
            .join("")
        )
        
        if (iteration >= originalTitle.length) {
          clearInterval(interval)
          setIsGlitching(false)
        }
        
        iteration += 1 / 3
      }, 30)

      return () => clearInterval(interval)
    } else {
      setDisplayTitle(originalTitle)
    }
  }, [isGlitching, originalTitle])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => {
        setHoveredIndex(index)
        setIsGlitching(true)
      }}
      onHoverEnd={() => {
        setHoveredIndex(null)
      }}
      className="relative group"
    >
      <div className={`h-full p-6 rounded-2xl bg-gradient-to-br ${color} transition-all duration-300 ${
        hoveredIndex === index ? 'shadow-2xl shadow-green-500/50 scale-105' : 'bg-opacity-10'
      }`}>
        <div className={`absolute inset-0 rounded-2xl bg-black transition-opacity duration-300 ${
          hoveredIndex === index ? 'opacity-0' : 'opacity-90'
        }`}></div>
        
        <div className="relative z-10">
          <motion.div
            animate={{
              rotate: hoveredIndex === index ? [0, -10, 10, -10, 0] : 0,
              scale: hoveredIndex === index ? 1.2 : 1
            }}
            transition={{ duration: 0.5 }}
            className="text-5xl mb-4"
          >
            {icon}
          </motion.div>
          
          <h3 className="text-xl font-bold mb-3 text-white">
            {displayTitle}
          </h3>
          
          <motion.p
            animate={{
              opacity: hoveredIndex === index ? 1 : 0.7
            }}
            className="text-gray-200"
          >
            {description}
          </motion.p>
        </div>

        {hoveredIndex === index && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1), transparent 70%)`
            }}
          />
        )}
      </div>
    </motion.div>
  )
}

const ComparisonRow = ({ title, nfc, paper, delay }) => {
  const [nfcHovered, setNfcHovered] = useState(false)
  const [paperHovered, setPaperHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-gray-900/50 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">⚡</div>
        <h4 className="font-bold text-white text-lg">{title}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          onHoverStart={() => setNfcHovered(true)}
          onHoverEnd={() => setNfcHovered(false)}
          whileHover={{ scale: 1.05, y: -5 }}
          className="p-4 rounded-xl bg-green-500/10 border-2 border-green-500/40 relative overflow-hidden cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              animate={{ scale: nfcHovered ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3, repeat: nfcHovered ? Infinity : 0 }}
              className="w-3 h-3 bg-green-400 rounded-full"
            ></motion.div>
            <span className="text-green-400 font-bold">NFC</span>
          </div>
          <motion.div
            animate={{
              textDecoration: nfcHovered ? 'none' : 'none',
              opacity: nfcHovered ? 1 : 0.9
            }}
            className="text-gray-200"
          >
            {nfc}
          </motion.div>
          
          {nfcHovered && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400"
            />
          )}
        </motion.div>

        <motion.div
          onHoverStart={() => setPaperHovered(true)}
          onHoverEnd={() => setPaperHovered(false)}
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-gray-800/50 border-2 border-gray-700/50 relative cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 font-bold">Бумага</span>
          </div>
          <motion.div
            animate={{
              textDecoration: paperHovered ? 'line-through' : 'none',
              opacity: paperHovered ? 0.3 : 0.7
            }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            {paper}
          </motion.div>
          
          {paperHovered && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500"
              style={{ originX: 0 }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Benefits
