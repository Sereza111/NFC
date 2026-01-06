import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DigitalCard = ({ userData }) => {
  const [showLogo, setShowLogo] = useState(true)
  const [logoComplete, setLogoComplete] = useState(false)

  useEffect(() => {
    // Simulate NFC tap animation
    const timer1 = setTimeout(() => {
      setLogoComplete(true)
    }, 2500)

    const timer2 = setTimeout(() => {
      setShowLogo(false)
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {showLogo ? (
          <ARCLogoAnimation key="logo" onComplete={() => setLogoComplete(true)} isComplete={logoComplete} />
        ) : (
          <UserCard key="card" userData={userData} />
        )}
      </AnimatePresence>
    </div>
  )
}

const ARCLogoAnimation = ({ onComplete, isComplete }) => {
  const logoPath1 = "M 50 20 L 80 80 L 65 80 L 57.5 60 L 42.5 60 L 35 80 L 20 80 L 50 20 Z M 50 35 L 45 50 L 55 50 Z"
  const logoPath2 = "M 90 40 Q 110 40 110 60 Q 110 70 105 75 L 120 80 L 110 80 L 97 75 L 90 75 L 90 80 L 85 80 L 85 40 L 90 40 Z M 90 50 L 90 65 L 100 65 Q 105 65 105 57.5 Q 105 50 100 50 Z"
  const logoPath3 = "M 130 40 Q 150 40 155 55 Q 155 65 145 70 Q 155 75 145 80 L 130 80 L 140 75 Q 145 72 145 67.5 Q 145 65 140 65 L 135 65 L 135 60 L 140 60 Q 145 60 145 55 Q 145 50 140 50 L 130 50 Z"

  const paths = [
    { d: logoPath1, delay: 0, color: '#00FF88' },
    { d: logoPath2, delay: 0.4, color: '#00CC66' },
    { d: logoPath3, delay: 0.8, color: '#88FFD0' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(0, 255, 136, 0.3)',
            '0 0 60px rgba(0, 255, 136, 0.6)',
            '0 0 20px rgba(0, 255, 136, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-xl"
      />

      <svg
        width="200"
        height="100"
        viewBox="0 0 200 100"
        className="relative z-10"
      >
        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path.d}
            fill="none"
            stroke={path.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, fill: path.color }}
            transition={{
              pathLength: { duration: 1, delay: path.delay, ease: 'easeInOut' },
              opacity: { duration: 0.3, delay: path.delay },
              fill: { duration: 0.5, delay: path.delay + 0.8 },
            }}
          />
        ))}
      </svg>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              color: ['#00FF88', '#00CC66', '#00FF88'],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl font-bold"
          >
            ARC
          </motion.div>
          <div className="text-green-400 text-sm mt-2">Загрузка...</div>
        </motion.div>
      )}
    </motion.div>
  )
}

const UserCard = ({ userData = {
  name: 'Иван Иванов',
  title: 'Frontend Developer',
  company: 'Tech Company',
  phone: '+7 (999) 123-45-67',
  email: 'email@example.com',
  telegram: '@username',
  instagram: '@username',
  vk: 'vk.com/username',
  website: 'https://example.com',
} }) => {
  const [activeTab, setActiveTab] = useState('info')

  const socialLinks = [
    { id: 'telegram', icon: '✈️', label: 'Telegram', value: userData.telegram, color: 'from-blue-500 to-blue-600' },
    { id: 'instagram', icon: '📷', label: 'Instagram', value: userData.instagram, color: 'from-pink-500 to-purple-600' },
    { id: 'vk', icon: '🔵', label: 'VK', value: userData.vk, color: 'from-blue-600 to-blue-700' },
    { id: 'website', icon: '🌐', label: 'Website', value: userData.website, color: 'from-green-500 to-emerald-600' },
  ].filter(link => link.value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -90 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      {/* Card Container */}
      <div className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/20">
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-r from-green-500 to-emerald-600 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          
          {/* Profile Image Placeholder */}
          <div className="absolute -bottom-12 left-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-4 border-black flex items-center justify-center text-4xl shadow-xl"
            >
              👤
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-1">{userData.name}</h2>
            <p className="text-green-400 font-medium">{userData.title}</p>
            <p className="text-gray-400 text-sm">{userData.company}</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 mb-4">
            {[
              { id: 'info', label: 'Контакты', icon: '📞' },
              { id: 'social', label: 'Соцсети', icon: '🌐' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {userData.phone && (
                  <ContactItem icon="📞" label="Телефон" value={userData.phone} href={`tel:${userData.phone}`} />
                )}
                {userData.email && (
                  <ContactItem icon="✉️" label="Email" value={userData.email} href={`mailto:${userData.email}`} />
                )}
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-2 gap-3"
              >
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.id}
                    href={social.value.startsWith('http') ? social.value : `https://${social.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${social.color} text-white text-center shadow-lg hover:shadow-xl transition-all`}
                  >
                    <div className="text-3xl mb-2">{social.icon}</div>
                    <div className="font-medium text-sm">{social.label}</div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Contact Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-black shadow-lg hover:shadow-green-500/30 transition-all"
          >
            💾 Сохранить контакт
          </motion.button>
        </div>
      </div>

      {/* Powered by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-6 text-gray-500 text-sm"
      >
        Powered by <span className="text-green-400 font-bold">ARC</span> NFC
      </motion.div>
    </motion.div>
  )
}

const ContactItem = ({ icon, label, value, href }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 136, 0.1)' }}
    whileTap={{ scale: 0.98 }}
    className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all group"
  >
    <div className="text-2xl">{icon}</div>
    <div className="flex-1">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-white font-medium group-hover:text-green-400 transition-colors">{value}</div>
    </div>
    <div className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
  </motion.a>
)

export default DigitalCard

