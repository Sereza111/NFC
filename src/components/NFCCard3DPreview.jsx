import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import QRCode from 'qrcode'

// Component for card with texture - manual loading with proper CORS support
const CardWithTexture = ({ frontTextureUrl, backTextureUrl }) => {
  const [frontTexture, setFrontTexture] = useState(null)
  const [backTexture, setBackTexture] = useState(null)
  
  // Load texture with proper CORS handling and cache busting
  const loadTextureWithCORS = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const texture = new THREE.Texture(img)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.needsUpdate = true
        texture.repeat.set(1, 1)
        texture.offset.set(0, 0)
        resolve(texture)
      }
      img.onerror = (error) => {
        console.error('Error loading texture:', url, error)
        reject(error)
      }
      // Add cache busting parameter to force fresh load
      const cacheBuster = `?v=${Date.now()}`
      img.src = url + cacheBuster
    })
  }
  
  // Load front texture
  React.useEffect(() => {
    loadTextureWithCORS(frontTextureUrl)
      .then(texture => setFrontTexture(texture))
      .catch(error => console.error('Front texture load failed:', error))
  }, [frontTextureUrl])
  
  // Load back texture
  React.useEffect(() => {
    console.log('🔍 [NFCCard3DPreview] Loading back texture:', backTextureUrl)
    if (backTextureUrl && frontTexture) {
      loadTextureWithCORS(backTextureUrl)
        .then(texture => {
          console.log('✅ [NFCCard3DPreview] Back texture loaded successfully:', backTextureUrl)
          setBackTexture(texture)
        })
        .catch(error => {
          console.error('❌ [NFCCard3DPreview] Back texture load failed:', backTextureUrl, error)
          setBackTexture(frontTexture) // fallback to front
        })
    } else if (frontTexture) {
      console.log('⚠️ [NFCCard3DPreview] No backTextureUrl, using front texture as fallback')
      setBackTexture(frontTexture)
    }
  }, [backTextureUrl, frontTexture])
  
  if (!frontTexture) return null
  
  return (
    <group>
      {/* Front face */}
      <mesh castShadow receiveShadow position={[0, 0, 0.075]}>
        <planeGeometry args={[3.5, 2.2]} />
        <meshPhysicalMaterial
          map={frontTexture}
          metalness={0.6}
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          reflectivity={0.8}
        />
      </mesh>
      
      {/* Back face - only render when texture is loaded */}
      {backTexture && (
        <mesh castShadow receiveShadow position={[0, 0, -0.075]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.5, 2.2]} />
          <meshPhysicalMaterial
            map={backTexture}
            metalness={0.6}
            roughness={0.3}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
            reflectivity={0.8}
          />
        </mesh>
      )}
      
      {/* Simple edge frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 2.2, 0.15]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  )
}

// Component for card without texture
const CardWithColor = ({ cardData }) => (
  <mesh castShadow receiveShadow>
    <boxGeometry args={[3.5, 2.2, 0.15]} />
    <meshPhysicalMaterial
      color={cardData.primaryColor || '#0a0a0a'}
      metalness={0.7}
      roughness={0.2}
      clearcoat={0.6}
      clearcoatRoughness={0.2}
      reflectivity={0.9}
    />
  </mesh>
)

// QR Code Component
const QRCodeMesh = ({ cardData, cardId, size = 0.7 }) => {
  const [qrTexture, setQrTexture] = useState(null)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = `https://nfc-vl.ru/card/${cardData.name?.toLowerCase().replace(/\s+/g, '-') || 'demo'}-${cardId || Date.now()}`
        const canvas = document.createElement('canvas')
        await QRCode.toCanvas(canvas, url, {
          width: 256,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        setQrTexture(texture)
      } catch (err) {
        console.error('QR generation error:', err)
      }
    }
    
    generateQR()
  }, [cardData.name, cardId])

  if (!qrTexture) return null

  return (
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={qrTexture} transparent />
    </mesh>
  )
}

const NFCCard3DPreview = ({ cardData, cardId }) => {
  const cardRef = useRef()
  
  // Check if texture should be loaded
  const hasFrontTexture = !!(cardData.backgroundImage && cardData.backgroundImage !== '')

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08
    }
  })

  return (
    <group>
      {/* Simple ground shadow */}
      <mesh position={[0, -1.4, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      <group ref={cardRef} position={[0, 0, 0]}>
        {/* Main card with texture or color */}
        {hasFrontTexture ? (
          <Suspense fallback={<CardWithColor cardData={cardData} />}>
            <CardWithTexture 
              frontTextureUrl={cardData.backgroundImage} 
              backTextureUrl={cardData.backgroundImageBack || cardData.backgroundImage}
            />
          </Suspense>
        ) : (
          <CardWithColor cardData={cardData} />
        )}
        {/* Debug log */}
        {console.log('🎨 [NFCCard3DPreview] Card data:', {
          front: cardData.backgroundImage,
          back: cardData.backgroundImageBack,
          backFallback: cardData.backgroundImageBack || cardData.backgroundImage
        })}
        
        {/* Subtle overlay for glow effect - reduced opacity to avoid artifacts */}
        {!hasFrontTexture && (
          <mesh position={[0, 0, 0.076]}>
            <boxGeometry args={[3.48, 2.18, 0.002]} />
            <meshBasicMaterial
              color={cardData.secondaryColor || '#00ff88'}
              transparent
              opacity={0.08}
              side={THREE.FrontSide}
            />
          </mesh>
        )}
        
        {/* QR Code positioned in bottom left corner */}
        <group position={[0, 0, 0.08]}>
          {/* QR Code in the bottom left */}
          <group position={[-1.3, -0.55, 0]}>
            {/* QR Code */}
            <QRCodeMesh cardData={cardData} cardId={cardId} size={0.5} />
          </group>
        </group>
      </group>

      {/* Simple shadow circle */}
      <mesh position={[0, -1.2, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// Wrap in Suspense for texture loading
const NFCCard3DPreviewWrapper = (props) => {
  return (
    <Suspense fallback={null}>
      <NFCCard3DPreview {...props} />
    </Suspense>
  )
}

export default NFCCard3DPreviewWrapper

