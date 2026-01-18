import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { HexGrid } from './HexGrid';
import { useSessionStore } from '../store/sessionStore';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3a3a5e" wireframe />
    </mesh>
  );
}

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#0a0a0f"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#4466ff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#00ff88" />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#ff4488" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#44ff88" />
    </>
  );
}

export function Scene() {
  const sessions = useSessionStore((state) => state.sessions);

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a0f' }}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 12, 12]}
        fov={50}
        near={0.1}
        far={1000}
      />

      <Suspense fallback={<LoadingFallback />}>
        {/* Environment */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Lighting */}
        <Lights />

        {/* Fog effect */}
        <fog attach="fog" args={['#0a0a0f', 20, 50]} />

        {/* Grid floor */}
        <GridFloor />

        {/* Main hex grid with sessions */}
        <HexGrid sessions={sessions} />
      </Suspense>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
