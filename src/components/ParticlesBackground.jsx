import React, { useCallback, useMemo } from 'react'
import Particles from 'react-particles'
import { loadSlim } from 'tsparticles-slim'

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 640px)').matches
  }, [])

  const options = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: isMobile ? 45 : 60,
    interactivity: {
      events: {
        onHover: { enable: !isMobile, mode: 'repulse' },
        resize: true,
      },
      modes: { repulse: { distance: 150, duration: 0.4 } },
    },
    particles: {
      color: { value: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'] },
      links: { color: '#3b82f6', distance: 120, enable: true, opacity: 0.15, width: 1 },
      move: { direction: 'none', enable: true, outModes: { default: 'out' }, random: true, speed: isMobile ? 0.4 : 0.8, straight: false },
      number: { density: { enable: true, area: 800 }, value: isMobile ? 50 : 100 },
      opacity: { value: { min: 0.08, max: 0.5 } },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 2.5 } },
    },
    detectRetina: true,
  }), [isMobile])

  return (
    <Particles init={particlesInit} options={options} />
  )
}

export default ParticlesBackground

