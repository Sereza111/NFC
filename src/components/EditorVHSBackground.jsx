import React, { useEffect, useRef } from 'react'

const EditorVHSBackground = () => {
  const snowRef = useRef(null)

  useEffect(() => {
    const container = snowRef.current
    if (!container) return

    const snowflakes = []
    const chars = ['▪', '▫', '·', '•', '✦', '✧', '⠁', '⠂', '⠄']

    const createFlake = () => {
      const el = document.createElement('div')
      el.className = 'editor-snowflake'
      el.textContent = chars[Math.floor(Math.random() * chars.length)]
      el.style.left = `${Math.random() * 100}%`
      el.style.animationDuration = `${2 + Math.random() * 3}s`
      el.style.fontSize = `${8 + Math.random() * 10}px`
      el.style.opacity = `${0.25 + Math.random() * 0.6}`
      container.appendChild(el)
      snowflakes.push(el)
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el)
        const i = snowflakes.indexOf(el)
        if (i >= 0) snowflakes.splice(i, 1)
      }, 5000)
    }

    const id = setInterval(createFlake, 180)
    return () => {
      clearInterval(id)
      snowflakes.forEach((e) => e.parentNode && e.parentNode.removeChild(e))
    }
  }, [])

  return (
    <>
      <div className="editor-vhs-layer editor-vhs-scanlines" aria-hidden="true" />
      <div ref={snowRef} className="editor-pixel-snow" aria-hidden="true" />
    </>
  )
}

export default EditorVHSBackground


