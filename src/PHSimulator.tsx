import React, { useState, useRef } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Types pour les solutions chimiques
interface Solution {
  id: string;
  name: string;
  pH: number;
  color: string;
  description: string;
}

// Base de données des solutions
const SOLUTIONS: Solution[] = [
  { id: 'citron', name: 'Jus de citron', pH: 2.0, color: '#FFD700', description: 'Très acide' },
  { id: 'vinaigre', name: 'Vinaigre', pH: 2.5, color: '#F4A460', description: 'Acide' },
  { id: 'cafe', name: 'Café', pH: 5.0, color: '#8B4513', description: 'Légèrement acide' },
  { id: 'eau', name: 'Eau pure', pH: 7.0, color: '#87CEEB', description: 'Neutre' },
  { id: 'bicarbonate', name: 'Bicarbonate', pH: 9.0, color: '#E0E0E0', description: 'Basique' },
  { id: 'savon', name: 'Eau savonneuse', pH: 10.0, color: '#F0F8FF', description: 'Basique' },
  { id: 'javel', name: 'Eau de javel', pH: 12.0, color: '#FFFACD', description: 'Très basique' }
];

// Composant pour une solution 3D
function SolutionBottle({ solution, position, onClick, isSelected }: { 
  solution: Solution; 
  position: [number, number, number]; 
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = isSelected ? state.clock.elapsedTime : 0;
      meshRef.current.position.y = position[1] + (hovered ? 0.1 : 0);
    }
  });

  return (
    <group position={position}>
      {/* Bouteille */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.1 : 1}
      >
        <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
        <meshStandardMaterial 
          color={solution.color} 
          transparent 
          opacity={0.8}
          emissive={isSelected ? solution.color : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Étiquette */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {solution.name}
      </Text>
      
      {/* Info bulle au survol */}
      {hovered && (
        <Html position={[0, 0.8, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            pH: {solution.pH} - {solution.description}
          </div>
        </Html>
      )}
    </group>
  );
}

// Composant pour le pH-mètre
function PHMeter({ position, currentPH }: { position: [number, number, number]; currentPH: number | null }) {
  const meterRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meterRef.current) {
      meterRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meterRef} position={position}>
      {/* Corps du pH-mètre */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Écran */}
      <mesh position={[0, 0.2, 0.051]}>
        <boxGeometry args={[0.3, 0.4, 0.01]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Affichage du pH */}
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.08}
        color={currentPH !== null ? '#00FF00' : '#FF0000'}
        anchorX="center"
        anchorY="middle"
      >
        {currentPH !== null ? `pH: ${currentPH.toFixed(1)}` : 'pH: ---'}
      </Text>
      
      {/* Sonde */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
    </group>
  );
}

// Composant pour l'échelle de pH
function PHScale({ currentPH }: { currentPH: number | null }) {
  const scaleItems = [
    { value: 0, color: '#FF0000', label: 'Très acide' },
    { value: 2, color: '#FF6600', label: 'Acide fort' },
    { value: 4, color: '#FFAA00', label: 'Acide' },
    { value: 6, color: '#FFFF00', label: 'Légèrement acide' },
    { value: 7, color: '#00FF00', label: 'Neutre' },
    { value: 8, color: '#66FF66', label: 'Légèrement basique' },
    { value: 10, color: '#00FFFF', label: 'Basique' },
    { value: 12, color: '#0066FF', label: 'Basique fort' },
    { value: 14, color: '#0000FF', label: 'Très basique' }
  ];

  return (
    <group position={[3, 0, 0]}>
      {/* Titre de l'échelle */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Échelle de pH
      </Text>
      
      {/* Échelle graduée */}
      {scaleItems.map((item, index) => (
        <group key={item.value} position={[0, 1.5 - index * 0.3, 0]}>
          {/* Indicateur coloré */}
          <mesh position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.05]} />
            <meshStandardMaterial 
              color={item.color}
              emissive={currentPH !== null && Math.abs(currentPH - item.value) < 0.5 ? item.color : '#000000'}
              emissiveIntensity={currentPH !== null && Math.abs(currentPH - item.value) < 0.5 ? 0.3 : 0}
            />
          </mesh>
          
          {/* Valeur pH */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.08}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {item.value}
          </Text>
          
          {/* Description */}
          <Text
            position={[0.5, 0, 0]}
            fontSize={0.06}
            color="black"
            anchorX="left"
            anchorY="middle"
          >
            {item.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

// Composant principal de la simulation
function PHSimulatorScene({ 
  selectedSolution, 
  onSolutionSelect, 
  onMeasurement 
}: { 
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution) => void;
  onMeasurement: (ph: number) => void;
}) {
  const [currentPH, setCurrentPH] = useState<number | null>(null);

  const handleSolutionClick = (solution: Solution) => {
    onSolutionSelect(solution);
    // Simulation de la mesure avec un petit délai
    setTimeout(() => {
      const measuredPH = solution.pH + (Math.random() - 0.5) * 0.2; // Petite variation
      setCurrentPH(measuredPH);
      onMeasurement(measuredPH);
    }, 1000);
  };

  return (
    <>
      {/* Éclairage */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6600" />

      {/* Solutions chimiques */}
      {SOLUTIONS.map((solution, index) => (
        <SolutionBottle
          key={solution.id}
          solution={solution}
          position={[Math.cos(index * Math.PI * 2 / SOLUTIONS.length) * 2, 0, Math.sin(index * Math.PI * 2 / SOLUTIONS.length) * 2]}
          onClick={() => handleSolutionClick(solution)}
          isSelected={selectedSolution?.id === solution.id}
        />
      ))}

      {/* pH-mètre */}
      <PHMeter position={[0, 0, 0]} currentPH={currentPH} />

      {/* Échelle de pH */}
      <PHScale currentPH={currentPH} />

      {/* Contrôles de caméra */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
}

export default PHSimulatorScene;
export { SOLUTIONS, type Solution };