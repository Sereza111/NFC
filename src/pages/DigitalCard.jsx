import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { interpolate } from 'flubber'
import QRCode from 'qrcode.react'

const DigitalCard = () => {
  const [cardData, setCardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const pathRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const path = window.location.pathname
    const slug = path.split('/card/')[1]

    fetch(`/api/card/${slug}`)
      .then(res => res.json())
      .then(result => {
        if (result.ok && result.data) {
          console.log('Card data loaded:', result.data)
          setCardData(result.data)
        } else {
          console.warn('Card not found, using defaults')
          setCardData({
            name: 'NFC VL',
            title: 'Цифровые визитки',
            company: 'Ваш бизнес',
            phone: '+7',
            email: 'info@nfc-vl.ru',
            website: 'nfc-vl.ru',
            telegram: 'nfc_vl'
          })
        }
        setLoading(false)
        setTimeout(() => setShowIntro(false), 7000)
      })
      .catch(err => {
        console.error('Error loading card:', err)
        setCardData({
          name: 'NFC VL',
          title: 'Цифровые визитки',
          company: 'Ваш бизнес',
          phone: '+7',
          email: 'info@nfc-vl.ru',
          website: 'nfc-vl.ru',
          telegram: 'nfc_vl'
        })
        setLoading(false)
        setTimeout(() => setShowIntro(false), 7000)
      })
  }, [])

  // Flubber морфинг ТОЧНО ПО КАДРАМ
  useEffect(() => {
    if (!pathRef.current || !showIntro) return

    const shapes = [
      // 0-1s: frame 0-30 - две молнии
      "M 200 340 L 150 410 L 175 410 L 140 500 M 600 340 L 650 410 L 625 410 L 660 500",
      
      // 1-1.8s: frame 30-50 - сливаются в V (фиолетовый → зелёный)
      "M 400 260 L 310 530 L 360 530 L 400 390 L 440 530 L 490 530 Z",
      
      // 1.8-3s: frame 50-100 - V с крыльями появляются
      "M 400 260 L 310 530 L 360 530 L 400 390 L 440 530 L 490 530 Z M 190 400 L 255 335 L 268 350 L 258 400 L 268 450 L 255 465 Z M 610 400 L 545 335 L 532 350 L 542 400 L 532 450 L 545 465 Z",
      
      // 3-3.8s: frame 100-150 - добавляется верхняя стрелка
      "M 400 260 L 310 530 L 360 530 L 400 390 L 440 530 L 490 530 Z M 190 400 L 255 335 L 268 350 L 258 400 L 268 450 L 255 465 Z M 610 400 L 545 335 L 532 350 L 542 400 L 532 450 L 545 465 Z M 400 210 L 375 238 L 392 238 L 392 270 L 408 270 L 408 238 L 425 238 Z",
      
      // 3.8-4.5s: frame 150-200 - стрелки по бокам + расширение
      "M 400 260 L 310 530 L 360 530 L 400 390 L 440 530 L 490 530 Z M 150 400 L 230 320 L 245 337 L 232 400 L 245 463 L 230 480 Z M 650 400 L 570 320 L 555 337 L 568 400 L 555 463 L 570 480 Z M 400 200 L 370 232 L 390 232 L 390 275 L 410 275 L 410 232 L 430 232 Z M 120 300 L 135 300 L 130 320 M 680 300 L 665 300 L 670 320",
      
      // 4.5-5.5s: frame 200-250 - большой wireframe треугольник
      "M 400 170 L 230 640 L 570 640 Z"
    ]

    let currentIndex = 0
    let startTime = Date.now()
    const durations = [1000, 800, 1200, 800, 700, 1000]

    const animate = () => {
      const elapsed = Date.now() - startTime
      const duration = durations[currentIndex] || 1000

      if (currentIndex < shapes.length - 1) {
        const nextIndex = currentIndex + 1
        
        try {
          const interpolator = interpolate(shapes[currentIndex], shapes[nextIndex], {
            maxSegmentLength: 0.3
          })

          const progress = Math.min(elapsed / duration, 1)
          
          // Easing
          const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2

          const morphedPath = interpolator(eased)
          if (pathRef.current) {
            pathRef.current.setAttribute('d', morphedPath)
          }

          if (progress >= 1) {
            currentIndex++
            startTime = Date.now()
          }

          animationRef.current = requestAnimationFrame(animate)
        } catch (err) {
          console.warn('Morph error:', err)
          currentIndex++
          startTime = Date.now()
          if (currentIndex < shapes.length - 1) {
            animationRef.current = requestAnimationFrame(animate)
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [showIntro])

  const handleContact = (type, value) => {
    const urls = {
      phone: `tel:${value}`,
      email: `mailto:${value}`,
      telegram: `https://t.me/${value.replace('@', '')}`,
      instagram: `https://instagram.com/${value.replace('@', '')}`,
      website: value.startsWith('http') ? value : `https://${value}`
    }
    if (urls[type]) window.location.href = urls[type]
  }

  const downloadVCard = () => {
    if (!cardData) return
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name || 'NFC VL'}
ORG:${cardData.company || 'NFC VL'}
TITLE:${cardData.title || 'Цифровые визитки'}
TEL:${cardData.phone || ''}
EMAIL:${cardData.email || ''}
URL:${cardData.website || 'nfc-vl.ru'}
NOTE:Telegram: ${cardData.telegram || ''}
END:VCARD`

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(cardData.name || 'contact').replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading || showIntro) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <style>{`
          #morphPath { will-change: d; }
          #morphSvg { transform: translateZ(0); }
        `}</style>

        <AnimatePresence>
          {showIntro && (
            <>
              {/* Фоновая сетка (как в frame 200+) */}
              <div className="absolute inset-0 opacity-5">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ff88" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* SVG анимация */}
              <svg
                id="morphSvg"
                viewBox="0 0 800 800"
                className="w-full h-full max-w-4xl max-h-screen relative z-10"
              >
                <defs>
                  {/* Градиент фиолет → зелёный */}
                  <linearGradient id="mainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7">
                      <animate attributeName="stop-color" values="#a855f7; #00ff88; #00ff88" dur="7s" fill="freeze" />
                    </stop>
                    <stop offset="100%" stopColor="#7c3aed">
                      <animate attributeName="stop-color" values="#7c3aed; #10b981; #10b981" dur="7s" fill="freeze" />
                    </stop>
                  </linearGradient>

                  {/* Текстура */}
                  <pattern id="techGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="#00ff88" opacity="0">
                      <animate attributeName="opacity" values="0; 0; 0; 0.5; 0.5" dur="7s" fill="freeze" />
                    </circle>
                    <line x1="0" y1="10" x2="20" y2="10" stroke="#059669" strokeWidth="0.3" opacity="0">
                      <animate attributeName="opacity" values="0; 0; 0; 0.3; 0.3" dur="7s" fill="freeze" />
                    </line>
                    <line x1="10" y1="0" x2="10" y2="20" stroke="#059669" strokeWidth="0.3" opacity="0">
                      <animate attributeName="opacity" values="0; 0; 0; 0.3; 0.3" dur="7s" fill="freeze" />
                    </line>
                  </pattern>

                  {/* Фильтры */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  <filter id="strongGlow">
                    <feGaussianBlur stdDeviation="18" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Главный морфинг path */}
                <path
                  ref={pathRef}
                  id="morphPath"
                  d="M 200 340 L 150 410 L 175 410 L 140 500 M 600 340 L 650 410 L 625 410 L 660 500"
                  fill="url(#mainGrad)"
                  stroke="url(#mainGrad)"
                  strokeWidth="2"
                  filter="url(#glow)"
                  opacity="0.95"
                />

                {/* Текстура (появляется 2-3s) */}
                <path
                  ref={pathRef}
                  fill="url(#techGrid)"
                  opacity="0">
                  <animate attributeName="opacity" values="0; 0; 0; 0; 0.6; 0.6" dur="7s" fill="freeze" />
                </path>

                {/* Wireframe линии (4.5-5.5s, frame 200-250) */}
                <g opacity="0">
                  <animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0.9; 0.9" dur="7s" fill="freeze" />
                  
                  {/* Большой контур */}
                  <path
                    d="M 400 170 L 230 640 L 570 640 Z"
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="2"
                    strokeDasharray="25 12"
                    filter="url(#glow)"
                    strokeDashoffset="2000">
                    <animate attributeName="stroke-dashoffset" values="2000; 0" dur="1s" fill="freeze" begin="4.5s" />
                  </path>

                  {/* Горизонтальные линии внутри */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const y = 250 + i * 55
                    const x1 = 255 + i * 22
                    const x2 = 545 - i * 22
                    return (
                      <line
                        key={`h-${i}`}
                        x1={x1} y1={y}
                        x2={x2} y2={y}
                        stroke="#10b981"
                        strokeWidth="1.2"
                        opacity="0.5"
                        strokeDasharray="300"
                        strokeDashoffset="300">
                        <animate attributeName="stroke-dashoffset" values="300; 0" dur="0.35s" fill="freeze" begin={`${4.7 + i * 0.08}s`} />
                      </line>
                    )
                  })}

                  {/* Вертикальные линии */}
                  {[-80, -50, -20, 0, 20, 50, 80].map((offset, i) => (
                    <line
                      key={`v-${i}`}
                      x1={400 + offset} y1="230"
                      x2={400 + offset} y2="600"
                      stroke="#059669"
                      strokeWidth="0.8"
                      opacity="0.35"
                      strokeDasharray="400"
                      strokeDashoffset="400">
                      <animate attributeName="stroke-dashoffset" values="400; 0" dur="0.5s" fill="freeze" begin={`${4.75 + i * 0.06}s`} />
                    </line>
                  ))}

                  {/* Диагональные линии (детализация) */}
                  {[0, 1, 2, 3].map((i) => (
                    <g key={`diag-${i}`}>
                      <line
                        x1={280 + i * 50} y1={300 + i * 80}
                        x2={320 + i * 50} y2={260 + i * 80}
                        stroke="#047857"
                        strokeWidth="0.6"
                        opacity="0.3"
                        strokeDasharray="100"
                        strokeDashoffset="100">
                        <animate attributeName="stroke-dashoffset" values="100; 0" dur="0.3s" fill="freeze" begin={`${5 + i * 0.05}s`} />
                      </line>
                    </g>
                  ))}
                </g>

                {/* Яркая вспышка (5.5-6.3s, frame 250-300) */}
                <g opacity="0">
                  <animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0.7; 0" dur="7s" fill="freeze" />
                  <circle cx="400" cy="400" r="120" fill="#ffffff" filter="url(#strongGlow)">
                    <animate attributeName="r" values="60; 450; 60" dur="0.8s" fill="freeze" begin="5.5s" />
                    <animate attributeName="opacity" values="0; 0.9; 0" dur="0.8s" fill="freeze" begin="5.5s" />
                  </circle>
                  
                  {/* Лучи от вспышки */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                    const rad = angle * Math.PI / 180
                    const x2 = 400 + Math.cos(rad) * 350
                    const y2 = 400 + Math.sin(rad) * 350
                    return (
                      <line
                        key={`ray-${i}`}
                        x1="400" y1="400"
                        x2={x2} y2={y2}
                        stroke="#00ff88"
                        strokeWidth="3"
                        opacity="0">
                        <animate attributeName="opacity" values="0; 0.9; 0" dur="0.5s" fill="freeze" begin={`${5.6 + i * 0.03}s`} />
                      </line>
                    )
                  })}
                </g>

                {/* Глитч квадраты + пиксели (6-6.8s, frame 300-350) */}
                {[...Array(25)].map((_, i) => {
                  const x = 400 + (Math.random() - 0.5) * 700
                  const y = 400 + (Math.random() - 0.5) * 700
                  const size = i < 15 ? 15 + Math.random() * 55 : 5 + Math.random() * 12
                  const isPixel = i >= 15
                  
                  return (
                    <rect
                      key={`glitch-${i}`}
                      x={x - size/2}
                      y={y - size/2}
                      width={size}
                      height={size}
                      fill={isPixel ? "#10b981" : "none"}
                      stroke={isPixel ? "none" : "#00ff88"}
                      strokeWidth="2.5"
                      opacity="0">
                      <animate
                        attributeName="opacity"
                        values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0.9; 0; 0.6; 0; 0.4; 0"
                        dur="7s"
                        fill="freeze"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={`0 ${x} ${y}; ${Math.random() * 900} ${x} ${y}`}
                        dur="0.6s"
                        fill="freeze"
                        begin="6s"
                      />
                    </rect>
                  )
                })}

                {/* Кольца расширяющиеся */}
                {[0, 1, 2, 3].map((ring) => (
                  <circle
                    key={`ring-${ring}`}
                    cx="400"
                    cy="400"
                    r="80"
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="2"
                    opacity="0">
                    <animate
                      attributeName="r"
                      values="70; 550"
                      dur="3.5s"
                      begin={`${1.2 + ring * 0.7}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8; 0"
                      dur="3.5s"
                      begin={`${1.2 + ring * 0.7}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values="2; 0.5"
                      dur="3.5s"
                      begin={`${1.2 + ring * 0.7}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}

                {/* Текст NFC VL */}
                <text
                  x="400"
                  y="710"
                  textAnchor="middle"
                  fontSize="100"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#00ff88"
                  filter="url(#strongGlow)"
                  opacity="0">
                  <animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 1" dur="7s" fill="freeze" />
                  NFC VL
                </text>

                {/* Подзаголовок */}
                <text
                  x="400"
                  y="760"
                  textAnchor="middle"
                  fontSize="26"
                  fontFamily="sans-serif"
                  fill="#10b981"
                  opacity="0">
                  <animate attributeName="opacity" values="0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0.8" dur="7s" fill="freeze" />
                  Цифровые визитки будущего
                </text>
              </svg>

              {/* Белая вспышка при выходе */}
              <motion.div
                className="absolute inset-0 bg-white z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, times: [0, 0.5, 1] }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Прогресс бар */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[520px] h-2 bg-gray-900/40 rounded-full overflow-hidden border border-green-500/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6.8, ease: "linear" }}
            style={{
              boxShadow: '0 0 25px rgba(0, 255, 136, 0.9)'
            }}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white"
    >
      <div className="container mx-auto px-6 py-12 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl backdrop-blur-md border border-green-500/30">
            <svg viewBox="0 0 50 50" className="w-12 h-12">
              <path d="M 25 10 L 15 35 L 20 35 L 25 22 L 30 35 L 35 35 L 25 10 Z" fill="#00ff88" />
            </svg>
            <div className="text-left">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {cardData?.name || 'NFC VL'}
              </div>
              <div className="text-xs text-gray-400">
                {cardData?.title || 'Цифровые визитки'}
              </div>
            </div>
          </div>
          {cardData?.company && (
            <div className="text-green-300 text-sm">
              {cardData.company}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {cardData?.phone && (
            <button
              onClick={() => handleContact('phone', cardData.phone)}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-green-500/30 transition-all backdrop-blur-sm"
            >
              <div className="text-2xl">📞</div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-400">Телефон</div>
                <div className="font-semibold">{cardData.phone}</div>
              </div>
            </button>
          )}

          {cardData?.email && (
            <button
              onClick={() => handleContact('email', cardData.email)}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-green-500/30 transition-all backdrop-blur-sm"
            >
              <div className="text-2xl">✉️</div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-400">Email</div>
                <div className="font-semibold">{cardData.email}</div>
              </div>
            </button>
          )}

          {cardData?.telegram && (
            <button
              onClick={() => handleContact('telegram', cardData.telegram)}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-green-500/30 transition-all backdrop-blur-sm"
            >
              <div className="text-2xl">💬</div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-400">Telegram</div>
                <div className="font-semibold">@{cardData.telegram.replace('@', '')}</div>
              </div>
            </button>
          )}

          {cardData?.website && (
            <button
              onClick={() => handleContact('website', cardData.website)}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-green-500/30 transition-all backdrop-blur-sm"
            >
              <div className="text-2xl">🌐</div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-400">Сайт</div>
                <div className="font-semibold">{cardData.website}</div>
              </div>
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl mb-6 flex justify-center"
        >
          <QRCode
            value={window.location.href}
            size={220}
            level="H"
            includeMargin
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={downloadVCard}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/50"
        >
          💾 Сохранить контакт
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          Powered by <span className="text-green-400 font-semibold">NFC-VL.RU</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DigitalCard
