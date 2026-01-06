import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NFCWriter = () => {
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    email: '',
    telegram: '',
    instagram: '',
    vk: '',
    website: '',
    customUrl: '',
    nfcType: 'NTAG213',
  })
  const [generatedConfig, setGeneratedConfig] = useState(null)
  const [step, setStep] = useState(1)

  const generateNFCConfig = () => {
    const config = {
      chipType: 'NTAG213',
      totalMemory: 144,
      usableMemory: 137,
      url: orderData.customUrl || `https://card.nfc-vl.ru/${orderData.name?.toLowerCase().replace(/\s+/g, '-')}`,
      records: [
        {
          type: 'U', // URI Record
          payload: orderData.customUrl || `https://card.nfc-vl.ru/${orderData.name?.toLowerCase().replace(/\s+/g, '-')}`,
        }
      ],
      userData: {
        name: orderData.name,
        phone: orderData.phone,
        email: orderData.email,
        telegram: orderData.telegram,
        instagram: orderData.instagram,
        vk: orderData.vk,
        website: orderData.website,
      },
      writeProtection: false,
      password: null,
      timestamp: new Date().toISOString(),
    }
    setGeneratedConfig(config)
    setStep(3)
  }

  const downloadConfig = () => {
    const dataStr = JSON.stringify(generatedConfig, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `nfc-config-${orderData.name?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedConfig, null, 2))
    alert('Конфигурация скопирована в буфер обмена!')
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Конструктор NFC записи
          </h1>
          <p className="text-gray-400 text-lg">
            Генератор конфигурации для записи меток NTAG213
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Данные клиента' },
              { num: 2, title: 'Настройки URL' },
              { num: 3, title: 'Конфигурация' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <motion.div
                  animate={{ scale: step === s.num ? 1.1 : 1 }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl ${
                    step === s.num
                      ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                      : step > s.num
                      ? 'bg-green-500/30 text-green-300'
                      : 'bg-gray-800/50 text-gray-500'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center font-bold">
                    {s.num}
                  </div>
                  <span className="font-medium hidden sm:inline">{s.title}</span>
                </motion.div>
                {idx < 2 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${step > s.num ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl mx-auto bg-black/50 rounded-2xl p-8 border border-green-500/30"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Данные клиента</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Имя"
                    value={orderData.name}
                    onChange={(v) => setOrderData({ ...orderData, name: v })}
                    placeholder="Иван Иванов"
                    icon="👤"
                  />
                  <InputField
                    label="Телефон"
                    value={orderData.phone}
                    onChange={(v) => setOrderData({ ...orderData, phone: v })}
                    placeholder="+7 (999) 123-45-67"
                    icon="📞"
                  />
                  <InputField
                    label="Email"
                    value={orderData.email}
                    onChange={(v) => setOrderData({ ...orderData, email: v })}
                    placeholder="email@example.com"
                    icon="✉️"
                    type="email"
                  />
                  <InputField
                    label="Telegram"
                    value={orderData.telegram}
                    onChange={(v) => setOrderData({ ...orderData, telegram: v })}
                    placeholder="@username"
                    icon="✈️"
                  />
                  <InputField
                    label="Instagram"
                    value={orderData.instagram}
                    onChange={(v) => setOrderData({ ...orderData, instagram: v })}
                    placeholder="@username"
                    icon="📷"
                  />
                  <InputField
                    label="VK"
                    value={orderData.vk}
                    onChange={(v) => setOrderData({ ...orderData, vk: v })}
                    placeholder="vk.com/username"
                    icon="🔵"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-black shadow-lg hover:shadow-green-500/30 transition-all"
                >
                  Далее →
                </motion.button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Настройки URL</h2>
                
                <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                      <div className="font-semibold text-green-400 mb-1">Информация о NTAG213</div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>• Объём памяти: 144 байта (137 байт для пользователя)</div>
                        <div>• Совместимость: iOS и Android</div>
                        <div>• Дальность считывания: до 10 см</div>
                        <div>• Защита от записи: опционально</div>
                      </div>
                    </div>
                  </div>
                </div>

                <InputField
                  label="URL для записи на метку"
                  value={orderData.customUrl}
                  onChange={(v) => setOrderData({ ...orderData, customUrl: v })}
                  placeholder={`https://card.nfc-vl.ru/${orderData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}`}
                  icon="🌐"
                />

                <InputField
                  label="Веб-сайт (дополнительно)"
                  value={orderData.website}
                  onChange={(v) => setOrderData({ ...orderData, website: v })}
                  placeholder="https://example.com"
                  icon="🌍"
                />

                <div className="p-4 bg-gray-900/50 rounded-xl border border-green-500/20">
                  <div className="text-sm text-gray-400 mb-2">Предпросмотр URL:</div>
                  <div className="text-green-400 font-mono text-lg break-all">
                    {orderData.customUrl || `https://card.nfc-vl.ru/${orderData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}`}
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-white border border-green-500/30 transition-all"
                  >
                    ← Назад
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateNFCConfig}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-black shadow-lg hover:shadow-green-500/30 transition-all"
                  >
                    Сгенерировать конфигурацию →
                  </motion.button>
                </div>
              </div>
            )}

            {step === 3 && generatedConfig && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Конфигурация готова!</h2>
                
                <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl">✓</div>
                    <div>
                      <div className="font-semibold text-green-400 text-xl mb-1">Успешно!</div>
                      <div className="text-sm text-gray-300">
                        Конфигурация для записи NFC метки {generatedConfig.chipType} создана.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-black/50 rounded-xl border border-green-500/20 text-center">
                    <div className="text-3xl mb-2">💾</div>
                    <div className="text-sm text-gray-400">Тип чипа</div>
                    <div className="text-lg font-bold text-green-400">{generatedConfig.chipType}</div>
                  </div>
                  <div className="p-4 bg-black/50 rounded-xl border border-green-500/20 text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-sm text-gray-400">Память</div>
                    <div className="text-lg font-bold text-green-400">{generatedConfig.usableMemory} байт</div>
                  </div>
                  <div className="p-4 bg-black/50 rounded-xl border border-green-500/20 text-center">
                    <div className="text-3xl mb-2">🔗</div>
                    <div className="text-sm text-gray-400">Записей</div>
                    <div className="text-lg font-bold text-green-400">{generatedConfig.records.length}</div>
                  </div>
                </div>

                <div className="bg-black/70 rounded-xl p-6 border border-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-green-400">Конфигурация JSON</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white border border-green-500/30 transition-all"
                    >
                      📋 Копировать
                    </motion.button>
                  </div>
                  <pre className="text-xs text-green-300 overflow-x-auto max-h-64 overflow-y-auto p-4 bg-black/50 rounded-lg border border-green-500/20 font-mono">
                    {JSON.stringify(generatedConfig, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-white border border-green-500/30 transition-all"
                  >
                    ← Создать новую
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadConfig}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-black shadow-lg transition-all"
                  >
                    💾 Скачать JSON
                  </motion.button>
                </div>

                <div className="p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <div className="font-semibold text-yellow-400 mb-1">Важно!</div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>• Используйте приложение NFC Tools для записи метки</div>
                        <div>• Убедитесь что метка NTAG213 пустая или форматирована</div>
                        <div>• Держите телефон близко к метке во время записи</div>
                        <div>• После записи проверьте работу метки на разных устройствах</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

const InputField = ({ label, value, onChange, placeholder, icon, type = 'text' }) => {
  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">{icon}</div>
        <input
          type={type}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
        />
      </div>
    </div>
  )
}

export default NFCWriter

