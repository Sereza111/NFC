import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Card2DPreview from './Card2DPreview.jsx'
import EditorVHSBackground from './EditorVHSBackground.jsx'

const presets = [
  { id: 'card1', name: 'Дизайн 1', primary: '#0a0a0a', secondary: '#00ff88', text: '#00ff88', preview: '/templates/CARD1B.svg', backImage: '/templates/CARD1F.svg' },
  { id: 'card2', name: 'Дизайн 2', primary: '#1a1a2e', secondary: '#16213e', text: '#eaeaea', preview: '/templates/CARD2F.svg', backImage: '/templates/CARD2B.svg' },
  { id: 'card3', name: 'Дизайн 3 (Cyber)', primary: '#0f0f0f', secondary: '#00ff88', text: '#00ff88', preview: '/templates/cyber.svg', backImage: '/templates/matrix.svg' },
]

const CardEditorModal = ({ isOpen, onClose, cardData, onChange }) => {
  const [localData, setLocalData] = useState(cardData)
  const [currentStep, setCurrentStep] = useState(0)

  // Инициализация только при первом открытии
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    if (isOpen && !initialized) {
      setLocalData(cardData)
      setCurrentStep(0)
      setInitialized(true)
    } else if (!isOpen) {
      setInitialized(false)
    }
  }, [isOpen, cardData, initialized])


  const steps = useMemo(() => [
    { id: 'info', title: 'Личная информация', icon: '👤' },
    { id: 'contacts', title: 'Контакты', icon: '📱' },
    { id: 'design', title: 'Дизайн', icon: '🎨' },
    { id: 'effects', title: 'Эффекты', icon: '✨' },
  ], [])

  const handleNext = () => {
    console.log('handleNext clicked, current step:', currentStep)
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      console.log('Moving to step:', nextStep)
      setCurrentStep(nextStep)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    onChange({
      ...cardData,
      ...localData
    })
    onClose()
  }

  const bgStyle = useMemo(() => {
    if (localData.backgroundStyle === 'solid') return localData.primaryColor
    return `linear-gradient(135deg, ${localData.primaryColor}, ${localData.secondaryColor})`
  }, [localData])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
          <EditorVHSBackground />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute inset-2 sm:inset-4 md:inset-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/95 via-gray-950/95 to-green-950/90 border-2 border-green-500/30 shadow-2xl shadow-green-500/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/20 bg-black/40">
              <div>
                <div className="text-xl font-bold text-green-400">Расширенный конструктор</div>
                <div className="text-sm text-gray-400">Шаг {currentStep + 1} из {steps.length}</div>
              </div>
              <button 
                onClick={onClose} 
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white border border-green-500/30 transition-all"
              >
                ✕ Закрыть
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-4 bg-black/20">
              <div className="flex items-center gap-2">
                {steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: currentStep === idx ? 1.1 : 1 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                        currentStep === idx
                          ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                          : currentStep > idx
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-gray-800/50 text-gray-500'
                      }`}
                      onClick={() => setCurrentStep(idx)}
                    >
                      <span className="text-xl">{step.icon}</span>
                      <span className="font-medium text-sm hidden sm:inline">{step.title}</span>
                    </motion.div>
                    {idx < steps.length - 1 && (
                      <div className={`h-1 flex-1 rounded ${currentStep > idx ? 'bg-green-500' : 'bg-gray-700'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-3 md:p-6">
                {/* Left side - 3D Preview */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/50 rounded-2xl p-6 border border-green-500/30 flex flex-col"
                >
                  <h3 className="text-lg font-bold text-green-400 mb-4">Предпросмотр</h3>
                  <div className="flex-1 rounded-xl overflow-hidden bg-gradient-to-br from-black to-gray-900 border border-green-500/20 relative">
                    <Card2DPreview cardData={localData} />
                  </div>
                </motion.div>

                {/* Right side - Step content */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/50 rounded-2xl p-6 border border-green-500/30 overflow-y-auto"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {currentStep === 0 && (
                        <StepInfo localData={localData} setLocalData={setLocalData} />
                      )}
                      {currentStep === 1 && (
                        <StepContacts localData={localData} setLocalData={setLocalData} />
                      )}
                      {currentStep === 2 && (
                        <StepDesign localData={localData} setLocalData={setLocalData} presets={presets} />
                      )}
                      {currentStep === 3 && (
                        <StepEffects localData={localData} setLocalData={setLocalData} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-green-500/20 bg-black/40 flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 0
                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-green-500/30'
                }`}
              >
                ← Назад
              </motion.button>
              
              {currentStep === steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 font-bold text-black shadow-lg"
                >
                  ✓ Сохранить
                </motion.button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  Далее →
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const StepInfo = ({ localData, setLocalData }) => (
  <>
    <h3 className="text-2xl font-bold text-green-400 mb-2">Личная информация</h3>
    <p className="text-gray-400 text-sm mb-6">Заполните основные данные для вашей карточки</p>
    
    <div className="space-y-4">
      <InputField
        label="Имя"
        value={localData.name || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, name: v }))}
        placeholder="Иван Иванов"
        icon="👤"
      />
      <InputField
        label="Должность"
        value={localData.title || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, title: v }))}
        placeholder="Frontend Developer"
        icon="💼"
      />
      <InputField
        label="Компания"
        value={localData.company || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, company: v }))}
        placeholder="Tech Company"
        icon="🏢"
      />
    </div>
  </>
)

const StepContacts = ({ localData, setLocalData }) => (
  <>
    <h3 className="text-2xl font-bold text-green-400 mb-2">Контакты</h3>
    <p className="text-gray-400 text-sm mb-6">Добавьте способы связи</p>
    
    <div className="space-y-4">
      <InputField
        label="Телефон"
        value={localData.phone || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, phone: v }))}
        placeholder="+7 (999) 123-45-67"
        icon="📞"
      />
      <InputField
        label="Email"
        value={localData.email || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, email: v }))}
        placeholder="email@example.com"
        icon="✉️"
        type="email"
      />
      <InputField
        label="Telegram"
        value={localData.telegram || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, telegram: v }))}
        placeholder="@username"
        icon="✈️"
      />
      <InputField
        label="Веб-сайт"
        value={localData.website || ''}
        onChange={(v) => setLocalData((p) => ({ ...p, website: v }))}
        placeholder="https://example.com"
        icon="🌐"
      />
    </div>
  </>
)

const StepDesign = ({ localData, setLocalData, presets }) => (
  <>
    <h3 className="text-2xl font-bold text-green-400 mb-2">Дизайн</h3>
    <p className="text-gray-400 text-sm mb-6">Выберите цветовую схему</p>
    
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Готовые пресеты</label>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <motion.div
              key={preset.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setLocalData((p) => ({
                  ...p,
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  textColor: preset.text,
                  backgroundImage: preset.preview,
                  backgroundImageBack: preset.backImage || preset.preview,
                  backgroundStyle: preset.primary === preset.secondary ? 'solid' : 'gradient'
                }))
              }}
              className={`p-3 rounded-xl cursor-pointer border-2 transition-all ${
                localData.primaryColor === preset.primary
                  ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/30'
                  : 'border-gray-700 hover:border-green-500/50 bg-gray-900/50'
              }`}
            >
              {preset.preview ? (
                <div 
                  className="h-20 rounded-lg mb-2 bg-cover bg-center border border-green-500/20"
                  style={{ backgroundImage: `url(${preset.preview})` }}
                />
              ) : (
                <div 
                  className="h-20 rounded-lg mb-2"
                  style={{ background: `linear-gradient(90deg, ${preset.primary}, ${preset.secondary})` }}
                />
              )}
              <div className="text-sm font-semibold text-white text-center">{preset.name}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Свои цвета</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Основной цвет</label>
            <input
              type="color"
              value={localData.primaryColor || '#00ff88'}
              onChange={(e) => setLocalData((p) => ({ ...p, primaryColor: e.target.value }))}
              className="w-full h-12 bg-black border border-green-500/30 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Второй цвет</label>
            <input
              type="color"
              value={localData.secondaryColor || '#00cc66'}
              onChange={(e) => setLocalData((p) => ({ ...p, secondaryColor: e.target.value }))}
              className="w-full h-12 bg-black border border-green-500/30 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Стиль фона</label>
        <div className="flex gap-3">
          <button
            onClick={() => setLocalData((p) => ({ ...p, backgroundStyle: 'gradient' }))}
            className={`flex-1 py-3 rounded-lg transition-all ${
              localData.backgroundStyle === 'gradient'
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Градиент
          </button>
          <button
            onClick={() => setLocalData((p) => ({ ...p, backgroundStyle: 'solid' }))}
            className={`flex-1 py-3 rounded-lg transition-all ${
              localData.backgroundStyle === 'solid'
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Сплошной
          </button>
        </div>
      </div>
    </div>
  </>
)

const StepEffects = ({ localData, setLocalData }) => (
  <>
    <h3 className="text-2xl font-bold text-green-400 mb-2">Эффекты</h3>
    <p className="text-gray-400 text-sm mb-6">Добавьте визуальные эффекты</p>
    
    <div className="space-y-4">
      <div className="p-4 bg-gray-900/50 rounded-xl border border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-white">Голографический эффект</div>
            <div className="text-sm text-gray-400">Блеск на карточке</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localData.holographic ?? true}
              onChange={(e) => setLocalData((p) => ({ ...p, holographic: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      <div className="p-4 bg-gray-900/50 rounded-xl border border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-white">Эффект свечения</div>
            <div className="text-sm text-gray-400">Неоновая подсветка</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localData.glowEffect ?? true}
              onChange={(e) => setLocalData((p) => ({ ...p, glowEffect: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-8 p-6 bg-green-500/10 rounded-xl border border-green-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✓</div>
          <div>
            <div className="font-semibold text-green-400 mb-1">Готово!</div>
            <div className="text-sm text-gray-300">
              Ваша карточка настроена. Нажмите "Сохранить" чтобы применить изменения.
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)

const InputField = ({ label, value, onChange, placeholder, icon, type = 'text' }) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">{icon}</div>
        <input
          type={type}
          defaultValue={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-12 pl-12 pr-4 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
        />
      </div>
    </div>
  )
}

export default CardEditorModal
