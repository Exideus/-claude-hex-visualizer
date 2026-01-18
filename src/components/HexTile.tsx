import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ClaudeSession, SessionStatus } from '../types/session';

interface HexTileProps {
  session: ClaudeSession;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_COLORS: Record<SessionStatus, string> = {
  active: '#00ff88',
  working: '#ffaa00',
  idle: '#3a3a5e',
  error: '#ff4444',
  completed: '#4488ff',
};

const STATUS_EMISSIVE: Record<SessionStatus, number> = {
  active: 0.3,
  working: 0.5,
  idle: 0.05,
  error: 0.4,
  completed: 0.1,
};

export function HexTile({ session, position, isSelected, onClick }: HexTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = STATUS_COLORS[session.status];
  const emissiveIntensity = STATUS_EMISSIVE[session.status];

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;

      // Pulse for working status
      if (session.status === 'working' && glowRef.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        glowRef.current.scale.set(scale, scale, 1);
      }
    }
  });

  // Hex geometry vertices
  const hexRadius = 0.9;
  const hexHeight = 0.3;

  return (
    <group position={position}>
      {/* Glow effect for active/working */}
      {(session.status === 'active' || session.status === 'working') && (
        <mesh ref={glowRef} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[hexRadius * 1.3, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Main hex tile */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[hexRadius, hexRadius, hexHeight, 6]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={hovered ? emissiveIntensity * 2 : emissiveIntensity}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, hexHeight / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[hexRadius * 0.95, hexRadius * 1.05, 6]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Session label */}
      <Text
        position={[0, hexHeight / 2 + 0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {session.name.length > 12 ? session.name.slice(0, 12) + '...' : session.name}
      </Text>

      {/* Status indicator dot */}
      <mesh position={[0, hexHeight / 2 + 0.35, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={session.status === 'working' ? 1 : 0.5}
        />
      </mesh>

      {/* Hover info */}
      {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-gray-900/95 backdrop-blur px-3 py-2 rounded-lg border border-gray-700 min-w-[180px] text-xs">
            <div className="font-bold text-white mb-1">{session.name}</div>
            <div className="text-gray-400 text-[10px] mb-2 truncate max-w-[200px]">
              {session.workingDirectory}
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Messages:</span>
              <span className="text-green-400">{session.messageCount}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Tools:</span>
              <span className="text-yellow-400">{session.toolUseCount}</span>
            </div>
            {session.gitBranch && (
              <div className="flex justify-between text-gray-300">
                <span>Branch:</span>
                <span className="text-blue-400">{session.gitBranch}</span>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
