import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'

const NFCCard3D = () => {
  const cardRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
      cardRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.04
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
    }
  })

  return (
    <group>
      {/* Simplified glow effect */}
      <RoundedBox ref={glowRef} args={[3.7, 2.4, 0.05]} radius={0.15} position={[0, 0, -0.1]}>
        <meshBasicMaterial color="#00ff88" transparent opacity={0.25} />
      </RoundedBox>
      
      {/* Main card - simplified material */}
      <RoundedBox ref={cardRef} args={[3.5, 2.2, 0.15]} radius={0.12}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.3} />
      </RoundedBox>
      
      {/* Overlay - simplified */}
      <RoundedBox args={[3.4, 2.1, 0.01]} radius={0.12} position={[0, 0, 0.08]}>
        <meshStandardMaterial color="#00ff88" metalness={0.4} roughness={0.4} transparent opacity={0.2} />
      </RoundedBox>
      
      {/* Text content */}
      <group position={[0, 0, 0.1]}>
        <Text position={[-1.4, 0.7, 0]} fontSize={0.15} color="#00ff88" anchorX="left" anchorY="middle">
          DIGITAL CARD
        </Text>
        <Text position={[-1.4, 0.3, 0]} fontSize={0.25} color="white" anchorX="left" anchorY="middle">
          Ваше Имя
        </Text>
        <Text position={[-1.4, 0.05, 0]} fontSize={0.12} color="#e5e5e5" anchorX="left" anchorY="middle">
          Должность • Компания
        </Text>
        
        {/* Social icons - simplified */}
        <group position={[-1.4, -0.4, 0]}>
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#00cc66" />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#88ffd0" />
          </mesh>
        </group>
        
        {/* QR placeholder */}
        <mesh position={[1.2, 0.2, 0]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>
      
      {/* Simple ground shadow instead of reflector */}
      <mesh position={[0, -1.5, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default NFCCard3D

