'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Reports visualization - stacked documents/pages
function ReportsVisualization({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create stacked document/page structure
  const { positions, linePositions } = useMemo(() => {
    const points: number[] = [];
    const lines: number[] = [];
    
    // Create multiple stacked rectangular "documents"
    const numDocs = 5;
    const docWidth = 1.2;
    const docHeight = 1.6;
    const stackSpacing = 0.3;
    const offset = (numDocs - 1) * stackSpacing / 2;
    
    for (let i = 0; i < numDocs; i++) {
      const z = i * stackSpacing - offset;
      const wobble = i * 0.05; // Slight rotation effect
      
      // Four corners of each document
      const corners = [
        [-docWidth/2 + wobble, -docHeight/2, z],
        [docWidth/2 + wobble, -docHeight/2, z],
        [docWidth/2 - wobble, docHeight/2, z],
        [-docWidth/2 - wobble, docHeight/2, z],
      ];
      
      // Add corner points
      corners.forEach(c => points.push(c[0], c[1], c[2]));
      
      // Connect corners with lines (rectangle)
      for (let j = 0; j < 4; j++) {
        const next = (j + 1) % 4;
        lines.push(
          corners[j][0], corners[j][1], corners[j][2],
          corners[next][0], corners[next][1], corners[next][2]
        );
      }
      
      // Add horizontal "text" lines on each document
      const numLines = 3;
      for (let l = 0; l < numLines; l++) {
        const y = -docHeight/4 + (l * docHeight/4);
        const lineStart = [-docWidth/2 + 0.2 + wobble, y, z + 0.01];
        const lineEnd = [docWidth/2 - 0.3 - wobble, y, z + 0.01];
        lines.push(lineStart[0], lineStart[1], lineStart[2], lineEnd[0], lineEnd[1], lineEnd[2]);
      }
    }
    
    // Connect documents with corner lines (show depth)
    for (let i = 0; i < numDocs - 1; i++) {
      const z1 = i * stackSpacing - offset;
      const z2 = (i + 1) * stackSpacing - offset;
      const w1 = i * 0.05;
      const w2 = (i + 1) * 0.05;
      
      // Only connect bottom corners for cleaner look
      lines.push(-docWidth/2 + w1, -docHeight/2, z1, -docWidth/2 + w2, -docHeight/2, z2);
      lines.push(docWidth/2 + w1, -docHeight/2, z1, docWidth/2 + w2, -docHeight/2, z2);
    }
    
    return {
      positions: new Float32Array(points),
      linePositions: new Float32Array(lines)
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += (mouseRef.current.y * 0.2 - groupRef.current.rotation.x) * 0.03;
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
        <lineBasicMaterial color="#ffffff" opacity={0.25} transparent />
      </lineSegments>
      
      <points geometry={pointGeometry}>
        <pointsMaterial 
          color="#ffffff" 
          size={0.08} 
          opacity={0.7} 
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
