import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NFCWrite = () => {
  const [orderData, setOrderData] = useState(null)
  const [isWriting, setIsWriting] = useState(false)
  const [writeStatus, setWriteStatus] = useState({ type: '', message: '' })
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Проверить поддержку Web NFC API
    if ('NDEFReader' in window) {
      setIsNFCSupported(true)
    }

    // Попробовать загрузить данные из localStorage или из Checkout
    const pendingOrder = localStorage.getItem('pendingOrder')
    if (pendingOrder) {
      try {
        setOrderData(JSON.parse(pendingOrder))
      } catch (e) {
        console.error('Failed to parse order data:', e)
      }
    }
  }, [])

  const handleFileUpload = (file) => {
    if (!file) return

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setWriteStatus({ type: 'error', message: 'Пожалуйста, загрузите JSON файл' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        setOrderData(data)
        setWriteStatus({ type: 'success', message: '✅ Файл загружен! Данные готовы к записи.' })
        // Сохранить в localStorage для дальнейшего использования
        localStorage.setItem('pendingOrder', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to parse JSON:', error)
        setWriteStatus({ type: 'error', message: 'Ошибка чтения файла. Проверьте формат JSON.' })
      }
    }
    reader.readAsText(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    handleFileUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFileUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleBack = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const writeNFC = async () => {
    if (!orderData) {
      setWriteStatus({ type: 'error', message: 'Нет данных для записи. Сначала создайте карточку.' })
      return
    }

    if (!isNFCSupported) {
      setWriteStatus({ 
        type: 'error', 
        message: 'Web NFC не поддерживается. Используйте Android Chrome или приложение NFC Tools.' 
      })
      return
    }

    setIsWriting(true)
    setWriteStatus({ type: 'info', message: 'Приложите NFC карточку к телефону...' })

    try {
      const ndef = new NDEFReader()
      const url = orderData.nfcUrl || `https://nfc-vl.ru/card/${orderData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}`
      
      await ndef.write({
        records: [{
          recordType: "url",
          data: url
        }]
      })

      setWriteStatus({ 
        type: 'success', 
        message: '✅ Успешно! Карточка записана. Проверьте, приложив её к телефону.' 
      })
      setIsWriting(false)
    } catch (error) {
      console.error('NFC write error:', error)
      let errorMessage = 'Ошибка записи. '
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Разрешите доступ к NFC в браузере.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Ваше устройство не поддерживает Web NFC.'
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Не удалось записать. Убедитесь, что карточка пустая.'
      } else {
        errorMessage += error.message || 'Попробуйте снова.'
      }
      
      setWriteStatus({ type: 'error', message: errorMessage })
      setIsWriting(false)
    }
  }

  const testRead = async () => {
    if (!isNFCSupported) {
      alert('Web NFC не поддерживается на этом устройстве')
      return
    }

    try {
      const ndef = new NDEFReader()
      setWriteStatus({ type: 'info', message: 'Приложите карточку для чтения...' })
      
      await ndef.scan()
      
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        console.log(`> Serial Number: ${serialNumber}`)
        console.log(`> Records: ${message.records.length}`)
        
        let content = ''
        for (const record of message.records) {
          console.log(`Record type: ${record.recordType}`)
          console.log(`MIME type: ${record.mediaType}`)
          console.log(`Data: ${record.data}`)
          
          if (record.recordType === "url") {
            const decoder = new TextDecoder()
            content = decoder.decode(record.data)
          }
        }
        
        setWriteStatus({ 
          type: 'success', 
          message: `✅ Карточка прочитана!\nURL: ${content}\nSerial: ${serialNumber}` 
        })
      })
    } catch (error) {
      console.error('NFC read error:', error)
      setWriteStatus({ type: 'error', message: 'Ошибка чтения: ' + error.message })
    }
  }

  const copyURL = () => {
    const url = orderData?.nfcUrl || `https://nfc-vl.ru/card/${orderData?.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}`
    navigator.clipboard.writeText(url)
    alert('URL скопирован в буфер обмена!')
  }

  const handleNewFile = () => {
    setOrderData(null)
    setWriteStatus({ type: '', message: '' })
    localStorage.removeItem('pendingOrder')
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={handleBack}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 text-center"
          >
            <div className="text-6xl mb-4">📂</div>
            <h1 className="text-3xl font-bold mb-4">Загрузите файл заказа</h1>
            <p className="text-gray-300 mb-8">Выберите JSON файл из Telegram или создайте карточку</p>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-12 mb-6 transition-all ${
                isDragging
                  ? 'border-green-400 bg-green-500/20'
                  : 'border-green-500/30 hover:border-green-500/50'
              }`}
            >
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <div className="text-6xl mb-4">📱</div>
                <div className="text-xl font-semibold mb-2">
                  {isDragging ? 'Отпустите файл здесь' : 'Перетащите файл сюда'}
                </div>
                <div className="text-gray-400">или нажмите для выбора</div>
              </div>
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {writeStatus.message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-xl border mb-6 ${
                    writeStatus.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  {writeStatus.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="text-left bg-green-500/10 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-semibold text-green-400 mb-3">📖 Как получить файл:</h3>
              <ol className="text-sm text-gray-300 space-y-2">
                <li>1. Откройте Telegram с уведомлением о заказе</li>
                <li>2. Найдите прикрепленный JSON файл</li>
                <li>3. Скачайте файл на телефон</li>
                <li>4. Загрузите его здесь</li>
              </ol>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="mt-6 px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold border border-green-500/30 transition-all"
            >
              Или создайте новую карточку
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.button
          onClick={handleBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Запись NFC карточки
            </h1>
            <p className="text-gray-400">Запишите данные на физическую NFC карточку</p>
          </div>

          {/* Device Status */}
          <div className={`p-6 rounded-xl border ${
            isNFCSupported 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">{isNFCSupported ? '✅' : '⚠️'}</div>
              <div>
                <div className="font-semibold text-lg mb-1">
                  {isNFCSupported ? 'Web NFC поддерживается!' : 'Web NFC не поддерживается'}
                </div>
                <div className="text-sm text-gray-300">
                  {isNFCSupported 
                    ? 'Вы можете записывать NFC карточки прямо из браузера' 
                    : 'Используйте Android Chrome 89+ или приложение NFC Tools'}
                </div>
              </div>
            </div>
          </div>

          {/* Card Data Preview */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h2 className="text-xl font-bold text-green-400 mb-4">Данные для записи</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Имя:</span>
                <span className="font-semibold">{orderData.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Должность:</span>
                <span className="font-semibold">{orderData.title || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Компания:</span>
                <span className="font-semibold">{orderData.company || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Телефон:</span>
                <span className="font-semibold">{orderData.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-semibold">{orderData.email || '—'}</span>
              </div>
            </div>
          </div>

          {/* URL to Write */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-400">URL для записи</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewFile}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-green-500/30 transition-all"
              >
                📂 Загрузить другой файл
              </motion.button>
            </div>
            <div className="bg-black/70 p-4 rounded-lg border border-green-500/20 mb-4">
              <div className="text-green-400 font-mono text-sm break-all">
                {orderData.nfcUrl || `https://nfc-vl.ru/card/${orderData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}`}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyURL}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold border border-green-500/30 transition-all"
            >
              📋 Копировать URL
            </motion.button>
          </div>

          {/* Write Button */}
          <motion.button
            whileHover={!isWriting ? { scale: 1.02, boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)' } : {}}
            whileTap={!isWriting ? { scale: 0.98 } : {}}
            onClick={writeNFC}
            disabled={isWriting || !isNFCSupported}
            className={`w-full py-6 rounded-xl font-bold text-xl transition-all ${
              isWriting || !isNFCSupported
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg'
            }`}
          >
            {isWriting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Приложите карточку...
              </span>
            ) : (
              '📱 Записать на NFC карточку'
            )}
          </motion.button>

          {/* Test Read Button */}
          {isNFCSupported && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testRead}
              className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold border border-green-500/30 transition-all"
            >
              🔍 Проверить записанную карточку
            </motion.button>
          )}

          {/* Status Message */}
          <AnimatePresence>
            {writeStatus.message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 rounded-xl border ${
                  writeStatus.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : writeStatus.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="whitespace-pre-wrap">{writeStatus.message}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h2 className="text-xl font-bold text-green-400 mb-4">📖 Инструкция</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <div className="font-semibold text-white mb-2">На Android (Chrome):</div>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Убедитесь, что NFC включен в настройках</li>
                  <li>Нажмите кнопку "Записать на NFC"</li>
                  <li>Приложите карточку к задней части телефона</li>
                  <li>Дождитесь подтверждения записи</li>
                </ol>
              </div>

              <div>
                <div className="font-semibold text-white mb-2">Альтернатива (любой телефон):</div>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Скачайте "NFC Tools" из Play Store/App Store</li>
                  <li>Скопируйте URL выше</li>
                  <li>В приложении: Write → Add a record → URL/URI</li>
                  <li>Вставьте URL и нажмите Write</li>
                </ol>
              </div>

              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 mt-4">
                <div className="font-semibold text-yellow-400 mb-1">⚠️ Важно:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Используйте только пустые NTAG213/215/216 карточки</li>
                  <li>• Держите телефон неподвижно во время записи (2-3 секунды)</li>
                  <li>• После записи проверьте карточку на других устройствах</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NFCWrite

