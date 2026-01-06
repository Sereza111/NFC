import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { useForm } from 'react-hook-form'
import QRCode from 'qrcode.react'
import NFCCard3DPreview from './NFCCard3DPreview.jsx'
import CardEditorModal from './CardEditorModal.jsx'

const CardCustomizer = () => {
  const [cardId] = useState(() => Date.now()) // Генерируем ID только один раз
  const [cardData, setCardData] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    telegram: '',
    vk: '',
    instagram: '',
    website: '',
    design: 'card1',
    primaryColor: '#0a0a0a',
    secondaryColor: '#00ff88',
    textColor: '#00ff88',
    backgroundStyle: 'gradient',
    backgroundImage: '/templates/CARD1B.svg',
    backgroundImageBack: '/templates/CARD1F.svg'
  })
  const [activeTab, setActiveTab] = useState('personal')
  const [previewMode, setPreviewMode] = useState('3d')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const [canvasDpr, setCanvasDpr] = useState([1, 1.15])
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const watchedData = watch()
  useEffect(() => { setCardData(prev => ({ ...prev, ...watchedData })) }, [watchedData])
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)')
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener?.('change', onChange)
    // Force initial resize to kick 3D context in maximized/fullscreen
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    const onFs = () => setCanvasKey((k) => k + 1)
    window.addEventListener('fullscreenchange', onFs)
    window.addEventListener('orientationchange', onFs)
    return () => {
      mql.removeEventListener?.('change', onChange)
      window.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('orientationchange', onFs)
    }
  }, [])
  useEffect(() => {
    // Detect long frame stalls and remount Canvas
    let last = performance.now()
    let rafId
    const tick = (t) => {
      if (previewMode === '3d' && t - last > 4000) setCanvasKey((k) => k + 1)
      last = t
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [previewMode])
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' })
  const onSubmit = async (data) => {
    try {
      setSubmitState({ status: 'loading', message: '' })
      
      // Сохранить данные заказа в localStorage
      const orderData = { ...cardData, ...data }
      localStorage.setItem('pendingOrder', JSON.stringify(orderData))
      
      // Перейти на страницу оформления заказа
      setTimeout(() => {
        window.history.pushState({}, '', '/checkout')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, 500)
      
    } catch (e) {
      setSubmitState({ status: 'error', message: 'Ошибка. Попробуйте позже.' })
    }
  }

  const designTemplates = [
    { 
      id: 'card1', 
      name: 'Дизайн 1', 
      preview: '/templates/CARD1B.svg',
      colors: { primary: '#0a0a0a', secondary: '#00ff88', text: '#00ff88' },
      description: 'Передняя - CARD1B, Задняя - CARD1F',
      hasBackground: true,
      backImage: '/templates/CARD1F.svg'
    },
    { 
      id: 'card2', 
      name: 'Дизайн 2', 
      preview: '/templates/CARD2F.svg',
      colors: { primary: '#1a1a2e', secondary: '#16213e', text: '#eaeaea' },
      description: 'Передняя - CARD2F, Задняя - CARD2B',
      hasBackground: true,
      backImage: '/templates/CARD2B.svg'
    },
    { 
      id: 'card3', 
      name: 'Дизайн 3 (Cyber)', 
      preview: '/templates/cyber.svg',
      colors: { primary: '#0f0f0f', secondary: '#00ff88', text: '#00ff88' },
      description: 'Передняя - Cyber, Задняя - Matrix',
      hasBackground: true,
      backImage: '/templates/matrix.svg'
    }
  ]
  const colorPalettes = [
    { primary: '#00ff88', secondary: '#00cc66', name: 'Неоновый зелёный', text: '#000000' },
    { primary: '#0a0a0a', secondary: '#00ff88', name: 'Чёрный/Зелёный', text: '#00ff88' },
    { primary: '#1a1a1a', secondary: '#00cc66', name: 'Тёмный/Зелёный', text: '#00ff88' },
    { primary: '#88ffd0', secondary: '#00ff88', name: 'Мятный', text: '#0a0a0a' }
  ]

  return (
    <div id="customizer" className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white">
      <div className="container mx-auto px-6 py-12">
        <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          Создай свою уникальную NFC карточку
        </motion.h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-green-500/20">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setPreviewMode('3d')} className={`flex-1 py-2 px-4 rounded-md transition-all ${previewMode === '3d' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'text-gray-400 hover:text-white hover:bg-green-500/10'}`}>3D Превью</motion.button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setPreviewMode('flat')} className={`flex-1 py-2 px-4 rounded-md transition-all ${previewMode === 'flat' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'text-gray-400 hover:text-white hover:bg-green-500/10'}`}>Плоский вид</motion.button>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/30">
              <h3 className="text-xl font-bold mb-6 text-center text-green-400">Предпросмотр карточки</h3>
              <AnimatePresence mode="wait">
                {previewMode === '3d' ? (
                  <motion.div key="p3d" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-72 sm:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-black to-gray-900 relative border border-green-500/20">
                    <Canvas
                      key={canvasKey}
                      camera={{ position: [0, 0, 8], fov: 45 }}
                      dpr={isMobile ? [1, 1.05] : canvasDpr}
                      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
                      onCreated={({ gl }) => {
                        const handleContextLost = (e) => e.preventDefault()
                        gl.domElement.addEventListener('webglcontextlost', handleContextLost, { passive: false })
                        const handleContextRestored = () => setCanvasKey((k) => k + 1)
                        gl.domElement.addEventListener('webglcontextrestored', handleContextRestored)
                      }}
                    >
                      <PerformanceMonitor onDecline={() => setCanvasDpr([1, 1])} onIncline={() => setCanvasDpr([1, 1.15])} />
                      <ambientLight intensity={0.8} />
                      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
                      <pointLight position={[10, 10, 10]} intensity={0.6} color="#00ff88" />
                      <pointLight position={[-10, -5, 5]} intensity={0.4} color="#00cc66" />
                      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={0.5} intensity={0.5} color="#00ff88" />
                      <NFCCard3DPreview cardData={cardData} cardId={cardId} />
                      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2.5} />
                    </Canvas>
                  </motion.div>
                ) : (
                  <motion.div key="pflat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative w-full max-w-full flex items-center justify-center">
                    <div 
                      className="w-full max-w-[min(100%,500px)] aspect-[1.75/1] rounded-xl shadow-2xl shadow-green-500/20 text-white relative overflow-hidden border border-green-500/30" 
                      style={{ 
                        background: cardData.backgroundImage && cardData.backgroundImage !== '' 
                          ? `url(${cardData.backgroundImage})`
                          : cardData.backgroundStyle === 'gradient' 
                            ? `linear-gradient(135deg, ${cardData.primaryColor}, ${cardData.secondaryColor})` 
                            : cardData.primaryColor,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-black/10" />
                    
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-green-400/10 opacity-40 pointer-events-none" />
                    
                    <div className="absolute inset-0 p-4 sm:p-5 flex items-end justify-start">
                      {/* QR Code positioned in bottom left - larger size */}
                      <div className="bg-white/95 p-2 rounded shadow-lg">
                        <QRCode 
                          value={`https://nfc-vl.ru/card/${cardData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}-${cardId}`} 
                          size={70}
                          level="M"
                        />
                      </div>
                    </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Красивая растягивающаяся кнопка для входа в расширенный редактор */}
              <motion.div className="mt-6">
                <motion.button
                  onClick={() => setIsEditorOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-[2px]"
                >
                  <div className="relative bg-black rounded-xl px-6 py-4 transition-all group-hover:bg-transparent">
                    <div className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 90, 180, 270, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-2xl"
                      >
                        🎨
                      </motion.div>
                      <span className="font-bold text-green-400 group-hover:text-white transition-colors">
                        Открыть расширенный конструктор
                      </span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-green-400 group-hover:text-white"
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
                <div className="inline-block p-4 bg-white rounded-lg">
                  <QRCode 
                    value={`https://nfc-vl.ru/card/${cardData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}-${cardId}`} 
                    size={80}
                    level="M"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-400">Ссылка на вашу цифровую визитку</p>
              </motion.div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-green-500/30">
              <h4 className="font-semibold mb-4 text-green-400">Что получите:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                {[
                  { color: 'bg-green-400', title: 'Премиум NFC', text: 'Физическая карточка с долговечным покрытием' },
                  { color: 'bg-emerald-400', title: 'Цифровая страница', text: 'Ваша персональная web-страница' },
                  { color: 'bg-green-300', title: 'QR-код', text: 'Совместимость с любыми устройствами' },
                  { color: 'bg-green-500', title: 'Изменение данных', text: 'Обновляйте контакты без перевыпуска' },
                ].map((i, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/40 border border-green-500/20">
                    <div className={`w-2 h-2 ${i.color} rounded-full mt-2 animate-pulse`}></div>
                    <div>
                      <div className="font-medium text-white">{i.title}</div>
                      <div className="text-gray-400 text-xs">{i.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex space-x-1 bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-green-500/20">
              {[
                { id: 'personal', label: 'Личные данные', icon: '👤' },
                { id: 'contacts', label: 'Контакты', icon: '📱' },
                { id: 'design', label: 'Дизайн', icon: '🎨' }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-4 rounded-md transition-all text-sm font-medium ${activeTab === tab.id ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'text-gray-400 hover:text-white hover:bg-green-500/10'}`}>
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400 text-center">Шаг {activeTab === 'personal' ? 1 : activeTab === 'contacts' ? 2 : 3} из 3</div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-green-500/30 space-y-6">
                  {activeTab === 'personal' && (<>
                    <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
                    <AnimatedInput label="Полное имя" name="name" register={register} errors={errors} icon="👤" placeholder="Иван Иванов" />
                    <AnimatedInput label="Должность" name="title" register={register} errors={errors} icon="💼" placeholder="Frontend Developer" />
                    <AnimatedInput label="Компания" name="company" register={register} errors={errors} icon="🏢" placeholder="Tech Company" />
                  </>)}
                  {activeTab === 'contacts' && (<>
                    <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
                    <AnimatedInput label="Телефон" name="phone" register={register} errors={errors} icon="📞" placeholder="+7 (999) 123-45-67" />
                    <AnimatedInput label="Email" name="email" type="email" register={register} errors={errors} icon="✉️" placeholder="email@example.com" />
                    <AnimatedInput label="Telegram" name="telegram" register={register} errors={errors} icon="✈️" placeholder="@username" />
                    <AnimatedInput label="VK" name="vk" register={register} errors={errors} icon="🔵" placeholder="vk.com/username" />
                    <AnimatedInput label="Instagram" name="instagram" register={register} errors={errors} icon="📷" placeholder="@username" />
                    <AnimatedInput label="Веб-сайт" name="website" register={register} errors={errors} icon="🌐" placeholder="https://example.com" />
                  </>)}
                  {activeTab === 'design' && (<>
                    <h3 className="text-lg font-semibold mb-4">Дизайн карточки</h3>
                    <div>
                      <label className="block text-sm font-medium mb-3">Шаблон дизайна</label>
                      <div className="grid grid-cols-1 gap-3">
                        {designTemplates.map((template) => (
                          <motion.div 
                            key={template.id} 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${cardData.design === template.id ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20' : 'border-gray-600 hover:border-green-500/50'}`} 
                            onClick={() => {
                              console.log('🎨 [CardCustomizer] Setting design:', template.name, {
                                front: template.preview,
                                back: template.backImage,
                                backFallback: template.backImage || template.preview
                              })
                              setCardData(prev => ({ 
                                ...prev, 
                                design: template.id,
                                primaryColor: template.colors.primary,
                                secondaryColor: template.colors.secondary,
                                textColor: template.colors.text,
                                backgroundImage: template.preview,
                                backgroundImageBack: template.backImage || template.preview
                              }))
                            }}
                          >
                            <div 
                              className="aspect-[1.75/1] rounded mb-2 border border-green-500/20 bg-cover bg-center relative overflow-hidden"
                              style={{ 
                                background: template.preview 
                                  ? `url(${template.preview}) center/cover` 
                                  : `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30"></div>
                              {!template.preview && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-2xl font-bold" style={{ color: template.colors.text }}>
                                    {template.name}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-center font-medium">{template.name}</div>
                            <div className="text-xs text-gray-400 text-center mt-1">{template.description}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">Цветовая схема</label>
                      <div className="grid grid-cols-2 gap-3">
                        {colorPalettes.map((palette, index) => (
                          <motion.div 
                            key={index} 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${cardData.primaryColor === palette.primary ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-600 hover:border-green-500/50'}`} 
                            onClick={() => setCardData(prev => ({ 
                              ...prev, 
                              primaryColor: palette.primary, 
                              secondaryColor: palette.secondary,
                              textColor: palette.text
                            }))}
                          >
                            <div className="flex space-x-2 mb-2">
                              <div className="w-6 h-6 rounded border border-green-500/30" style={{ backgroundColor: palette.primary }}></div>
                              <div className="w-6 h-6 rounded border border-green-500/30" style={{ backgroundColor: palette.secondary }}></div>
                            </div>
                            <div className="text-sm">{palette.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">Стиль фона</label>
                      <div className="flex space-x-3">
                        <button type="button" onClick={() => setCardData(prev => ({ ...prev, backgroundStyle: 'gradient' }))} className={`px-4 py-2 rounded-lg transition-all ${cardData.backgroundStyle === 'gradient' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-gray-700 text-gray-300 hover:bg-green-500/20'}`}>Градиент</button>
                        <button type="button" onClick={() => setCardData(prev => ({ ...prev, backgroundStyle: 'solid' }))} className={`px-4 py-2 rounded-lg transition-all ${cardData.backgroundStyle === 'solid' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-gray-700 text-gray-300 hover:bg-green-500/20'}`}>Сплошной</button>
                      </div>
                    </div>
                  </>)}
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)' }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg font-semibold transition-all shadow-lg text-black">
                  {submitState.status === 'loading' ? 'Загрузка...' : 'Перейти к оплате →'}
                </motion.button>
              </div>
              {submitState.status === 'error' && (
                <p className="text-sm text-red-400">{submitState.message}</p>
              )}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/40 shadow-lg shadow-green-500/10">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">Итого к оплате:</div>
                    <div className="text-sm text-gray-300">Включает доставку по России</div>
                  </div>
                  <div className="text-3xl font-bold text-green-400">1 990 ₽</div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <CardEditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} cardData={cardData} onChange={setCardData} />
    </div>
  )
}

const AnimatedInput = ({ label, name, register, errors, type = 'text', icon, placeholder }) => {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <motion.label animate={{ y: focused || hasValue ? -28 : 0, scale: focused || hasValue ? 0.85 : 1, color: focused ? '#00ff88' : '#9ca3af' }} className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none transition-colors font-medium">{label}</motion.label>
      <motion.input {...register(name, { required: true })} type={type} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={(e) => { setFocused(false); setHasValue(e.target.value.length > 0) }} whileFocus={{ borderColor: '#00ff88', boxShadow: '0 0 0 3px rgba(0, 255, 136, 0.15)' }} className="w-full h-12 sm:h-14 pl-12 pr-4 bg-black/50 border border-green-500/30 rounded-lg text-white transition-all focus:outline-none backdrop-blur-sm text-base sm:text-lg" />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</div>
      <AnimatePresence>
        {errors[name] && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 text-sm text-red-400">Поле обязательно для заполнения</motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CardCustomizer

