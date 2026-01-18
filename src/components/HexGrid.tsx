import { useMemo } from 'react';
import { HexTile } from './HexTile';
import { useSessionStore } from '../store/sessionStore';
import type { ClaudeSession } from '../types/session';

// Hex grid spacing constants
const HEX_SIZE = 1.0;

interface HexGridProps {
  sessions: ClaudeSession[];
}

// Convert axial coordinates (q, r) to 3D position
function axialToWorld(q: number, r: number): [number, number, number] {
  const x = HEX_SIZE * (3/2 * q);
  const z = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return [x, 0, z];
}

export function HexGrid({ sessions }: HexGridProps) {
  const { selectedSessionId, selectSession } = useSessionStore();

  // Generate grid background hexes for visual effect
  const backgroundHexes = useMemo(() => {
    const hexes: { q: number; r: number }[] = [];
    const radius = 5;

    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        if (Math.abs(q + r) <= radius) {
          // Check if this position is occupied by a session
          const isOccupied = sessions.some(
            (s) => s.hexPosition?.q === q && s.hexPosition?.r === r
          );
          if (!isOccupied) {
            hexes.push({ q, r });
          }
        }
      }
    }
    return hexes;
  }, [sessions]);

  return (
    <group>
      {/* Background grid hexes */}
      {backgroundHexes.map(({ q, r }) => {
        const [x, , z] = axialToWorld(q, r);
        return (
          <mesh
            key={`bg-${q}-${r}`}
            position={[x, -0.2, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.85, 6]} />
            <meshStandardMaterial
              color="#1a1a2e"
              transparent
              opacity={0.3}
              metalness={0.5}
              roughness={0.8}
            />
          </mesh>
        );
      })}

      {/* Grid lines */}
      {backgroundHexes.map(({ q, r }) => {
        const [x, , z] = axialToWorld(q, r);
        return (
          <mesh
            key={`line-${q}-${r}`}
            position={[x, -0.19, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.8, 0.85, 6]} />
            <meshBasicMaterial
              color="#2a2a4e"
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}

      {/* Session tiles */}
      {sessions.map((session) => {
        if (!session.hexPosition) return null;
        const { q, r } = session.hexPosition;
        const position = axialToWorld(q, r);

        return (
          <HexTile
            key={session.id}
            session={session}
            position={position}
            isSelected={selectedSessionId === session.id}
            onClick={() => selectSession(session.id)}
          />
        );
      })}
    </group>
  );
}
