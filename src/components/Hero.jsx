import React, { Suspense, useMemo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, PerformanceMonitor } from '@react-three/drei'
import { motion } from 'framer-motion'
import ParticlesBackground from './ParticlesBackground.jsx'
import NFCCard3D from './NFCCard3D.jsx'

const Hero = () => {
  const [dpr, setDpr] = useState(() => (typeof window !== 'undefined' && window.devicePixelRatio > 1.5 ? [1, 1.25] : [1, 1.15]))
  const [canvasKey, setCanvasKey] = useState(0)
  useEffect(() => {
    // Heartbeat to detect prolonged frame stalls; remount if frozen
    let last = performance.now()
    let rafId
    const tick = (t) => {
      if (t - last > 4000) setCanvasKey((k) => k + 1)
      last = t
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    // Force initial resize to ensure correct canvas size in maximized/fullscreen
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    const onFs = () => setCanvasKey((k) => k + 1)
    window.addEventListener('fullscreenchange', onFs)
    window.addEventListener('orientationchange', onFs)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('orientationchange', onFs)
    }
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>
      <div className="absolute inset-0 z-10">
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={dpr}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: true, preserveDrawingBuffer: false }}
          onCreated={({ gl }) => {
            const handleContextLost = (e) => e.preventDefault()
            gl.domElement.addEventListener('webglcontextlost', handleContextLost, { passive: false })
            const handleContextRestored = () => setCanvasKey((k) => k + 1)
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored)
          }}
          style={{ display: 'block' }}
        >
          <Suspense fallback={null}>
            <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 1.15])} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={[2, 0, 0]}>
              <NFCCard3D />
            </Float>
            <OrbitControls makeDefault enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
          </Suspense>
        </Canvas>
      </div>
      <div className="relative z-20 flex items-center justify-center h-full">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-white space-y-6 sm:space-y-8"
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">Создай</span>
                <br />
                <span className="text-white">свою NFC</span>
                <br />
                <span className="text-green-400">карточку</span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-xl"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                Персональная цифровая визитка в одном прикосновении. Произведи незабываемое первое впечатление.
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="flex justify-center"
              >
                <motion.a 
                  href="#customizer" 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)' }} 
                  whileTap={{ scale: 0.95 }} 
                  className="relative px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-lg sm:text-xl font-extrabold shadow-lg ring-2 ring-green-400/40 text-black overflow-hidden group"
                >
                  <span className="relative z-10">Заказать карточку</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
              </motion.div>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-400">NFC</div>
                  <div className="text-sm text-gray-400">Технология</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-300">3D</div>
                  <div className="text-sm text-gray-400">Предпросмотр</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-500">∞</div>
                  <div className="text-sm text-gray-400">Дизайнов</div>
                </div>
              </motion.div>
            </motion.div>
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 h-3 bg-white/60 rounded-full mt-2" />
        </motion.div>
        <p className="text-white/60 text-sm mt-2 text-center">Прокрути вниз</p>
      </motion.div>
    </motion.section>
  )
}

export default Hero

