'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Reports visualization - top-down view of papers scattered on desk
function ReportsVisualization({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create papers on desk (top-down view)
  const { positions, linePositions } = useMemo(() => {
    const points: number[] = [];
    const lines: number[] = [];
    
    const docWidth = 1.4;
    const docHeight = 1.8;
    
    // Helper to rotate a point around origin (for Z-axis rotation in top-down view)
    const rotatePoint = (x: number, y: number, angle: number): [number, number] => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x * cos - y * sin, x * sin + y * cos];
    };
    
    // Paper definitions: [rotation angle, z offset, x offset, y offset]
    const papers = [
      { angle: 0, z: 0, offsetX: 0, offsetY: 0 },           // Bottom paper - straight
      { angle: -0.2, z: 0.05, offsetX: -0.1, offsetY: 0.05 }, // Middle paper - slight left angle
      { angle: 0.25, z: 0.1, offsetX: 0.15, offsetY: -0.08 }, // Top paper - right angle
    ];
    
    const isTopPaper = (index: number) => index === papers.length - 1;
    
    papers.forEach((paper, paperIndex) => {
      const { angle, z, offsetX, offsetY } = paper;
      
      // Four corners of document (before rotation)
      const baseCorners: [number, number][] = [
        [-docWidth/2, -docHeight/2],
        [docWidth/2, -docHeight/2],
        [docWidth/2, docHeight/2],
        [-docWidth/2, docHeight/2],
      ];
      
      // Rotate and offset corners
      const corners = baseCorners.map(([x, y]) => {
        const [rx, ry] = rotatePoint(x, y, angle);
        return [rx + offsetX, ry + offsetY, z] as [number, number, number];
      });
      
      // Add corner points
      corners.forEach(c => points.push(c[0], c[1], c[2]));
      
      // Connect corners with lines (rectangle outline)
      for (let j = 0; j < 4; j++) {
        const next = (j + 1) % 4;
        lines.push(
          corners[j][0], corners[j][1], corners[j][2],
          corners[next][0], corners[next][1], corners[next][2]
        );
      }
      
      // Only add "text" lines on the top paper (correct perspective)
      if (isTopPaper(paperIndex)) {
        const numTextLines = 4;
        const margin = 0.2;
        for (let l = 0; l < numTextLines; l++) {
          const yPos = -docHeight/2 + margin + (l * (docHeight - margin * 2) / (numTextLines));
          const lineStartX = -docWidth/2 + margin;
          const lineEndX = docWidth/2 - margin - (l % 2 === 0 ? 0 : 0.3); // Varying line lengths
          
          const [sx, sy] = rotatePoint(lineStartX, yPos, angle);
          const [ex, ey] = rotatePoint(lineEndX, yPos, angle);
          
          lines.push(
            sx + offsetX, sy + offsetY, z + 0.01,
            ex + offsetX, ey + offsetY, z + 0.01
          );
        }
        
        // Add more points along edges for visual density (only on top paper)
        for (let i = 0; i < 4; i++) {
          const next = (i + 1) % 4;
          const midX = (corners[i][0] + corners[next][0]) / 2;
          const midY = (corners[i][1] + corners[next][1]) / 2;
          points.push(midX, midY, z);
        }
      }
    });
    
    return {
      positions: new Float32Array(points),
      linePositions: new Float32Array(lines)
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // Subtle floating/wobble effect instead of rotation
      const time = Date.now() * 0.001;
      groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.05 + mouseRef.current.y * 0.1;
      groupRef.current.rotation.y = Math.cos(time * 0.3) * 0.05 + mouseRef.current.x * 0.1;
      groupRef.current.rotation.z = Math.sin(time * 0.4) * 0.02;
    }
  });

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  const pointGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </lineSegments>
      
      <points geometry={pointGeometry}>
        <pointsMaterial 
          color="#ffffff" 
          size={0.08} 
          opacity={0.8} 
          transparent 
          sizeAttenuation 
        />
      </points>
    </group>
  );
}

// Time visualization - hourglass shape
function HourglassVisualization({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create hourglass structure
  const { positions, linePositions } = useMemo(() => {
    const points: number[] = [];
    const lines: number[] = [];
    
    const segments = 12; // Number of segments around the hourglass
    const topRadius = 1.0;
    const middleRadius = 0.15;
    const height = 2.0;
    
    // Generate hourglass profile points
    const rings: number[][] = [];
    const numRings = 7;
    
    for (let r = 0; r < numRings; r++) {
      const t = r / (numRings - 1); // 0 to 1
      const y = (t - 0.5) * height;
      
      // Hourglass curve - pinched in the middle
      const curveT = Math.abs(t - 0.5) * 2; // 0 at middle, 1 at ends
      const radius = middleRadius + (topRadius - middleRadius) * Math.pow(curveT, 0.7);
      
      const ring: number[] = [];
      for (let s = 0; s < segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        ring.push(x, y, z);
        points.push(x, y, z);
      }
      rings.push(ring);
    }
    
    // Connect points within each ring
    for (let r = 0; r < numRings; r++) {
      for (let s = 0; s < segments; s++) {
        const next = (s + 1) % segments;
        const i = s * 3;
        const ni = next * 3;
        lines.push(
          rings[r][i], rings[r][i + 1], rings[r][i + 2],
          rings[r][ni], rings[r][ni + 1], rings[r][ni + 2]
        );
      }
    }
    
    // Connect rings vertically (only some segments for cleaner look)
    for (let r = 0; r < numRings - 1; r++) {
      for (let s = 0; s < segments; s += 2) { // Every other segment
        const i = s * 3;
        lines.push(
          rings[r][i], rings[r][i + 1], rings[r][i + 2],
          rings[r + 1][i], rings[r + 1][i + 1], rings[r + 1][i + 2]
        );
      }
    }
    
    // Add "sand" particles falling through
    const sandParticles = 8;
    for (let p = 0; p < sandParticles; p++) {
      const y = (p / sandParticles - 0.5) * height * 0.6;
      const spread = Math.abs(y) < 0.2 ? 0.05 : 0.15;
      points.push(
        (Math.random() - 0.5) * spread,
        y,
        (Math.random() - 0.5) * spread
      );
    }
    
    return {
      positions: new Float32Array(points),
      linePositions: new Float32Array(lines)
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x += (mouseRef.current.y * 0.15 - groupRef.current.rotation.x) * 0.03;
      groupRef.current.rotation.y += (mouseRef.current.x * 0.2) * 0.02;
    }
  });

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  const pointGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#ffffff" opacity={0.25} transparent />
      </lineSegments>
      
      <points geometry={pointGeometry}>
        <pointsMaterial 
          color="#ffffff" 
          size={0.06} 
          opacity={0.7} 
          transparent 
          sizeAttenuation 
        />
      </points>
    </group>
  );
}

// Original cube visualization (keeping for reference)
function InteractiveCube({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, linePositions } = useMemo(() => {
    const cubeSize = 1.5;
    const offset = cubeSize / 2;
    
    const points: number[] = [];
    const lines: number[] = [];
    
    for (let x = 0; x <= 2; x++) {
      for (let y = 0; y <= 2; y++) {
        for (let z = 0; z <= 2; z++) {
          points.push(
            (x - 1) * offset,
            (y - 1) * offset,
            (z - 1) * offset
          );
        }
      }
    }
    
    const gridSize = 3;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const px = (x - 1) * offset;
          const py = (y - 1) * offset;
          const pz = (z - 1) * offset;
          
          if (x < gridSize - 1) {
            lines.push(px, py, pz, px + offset, py, pz);
          }
          if (y < gridSize - 1) {
            lines.push(px, py, pz, px, py + offset, pz);
          }
          if (z < gridSize - 1) {
            lines.push(px, py, pz, px, py, pz + offset);
          }
        }
      }
    }
    
    return {
      positions: new Float32Array(points),
      linePositions: new Float32Array(lines)
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001;
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += (mouseRef.current.y * 0.3 - groupRef.current.rotation.x % (Math.PI * 2)) * 0.02;
      groupRef.current.rotation.y += (mouseRef.current.x * 0.3) * 0.02;
    }
  });

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return geo;
  }, [linePositions]);

  const pointGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
      </lineSegments>
      
      <points geometry={pointGeometry}>
        <pointsMaterial 
          color="#ffffff" 
          size={0.06} 
          opacity={0.7} 
          transparent 
          sizeAttenuation 
        />
      </points>
    </group>
  );
}

// Shared mouse tracking hook
function useGlobalMouse() {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mouseRef;
}

// Export components for different visualizations
export function ReportsWireframe() {
  const mouseRef = useGlobalMouse();

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ReportsVisualization mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}

export function TimeWireframe() {
  const mouseRef = useGlobalMouse();

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <HourglassVisualization mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}

// Legacy export for backwards compatibility
export function WireframeCubeWithGlobalMouse() {
  const mouseRef = useGlobalMouse();

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <InteractiveCube mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}
