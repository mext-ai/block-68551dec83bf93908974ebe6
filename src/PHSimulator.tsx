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
  letter: string;
}

// Base de données des solutions (ordre mélangé)
const SOLUTIONS: Solution[] = [
  { id: 'citron', letter: 'A', name: 'Jus de citron', pH: 2.0, color: '#FFD700', description: 'Très acide' },
  { id: 'javel', letter: 'B', name: 'Eau de javel', pH: 12.0, color: '#FFFACD', description: 'Très basique' },
  { id: 'eau', letter: 'C', name: 'Eau pure', pH: 7.0, color: '#87CEEB', description: 'Neutre' },
  { id: 'bicarbonate', letter: 'D', name: 'Bicarbonate', pH: 9.0, color: '#E0E0E0', description: 'Basique' },
  { id: 'vinaigre', letter: 'E', name: 'Vinaigre', pH: 2.5, color: '#F4A460', description: 'Acide' },
  { id: 'savon', letter: 'F', name: 'Eau savonneuse', pH: 10.0, color: '#F0F8FF', description: 'Basique' },
  { id: 'cafe', letter: 'G', name: 'Café', pH: 5.0, color: '#8B4513', description: 'Légèrement acide' }
];

// Composant pour un flacon mystère
function MysteryBottle({ solution, position, onClick, isSelected, showContent }: { 
  solution: Solution; 
  position: [number, number, number]; 
  onClick: () => void;
  isSelected: boolean;
  showContent: boolean;
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
      {/* Bouteille - couleur neutre ou vraie couleur selon showContent */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.1 : 1}
      >
        <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
        <meshStandardMaterial 
          color={showContent ? solution.color : '#C0C0C0'} 
          transparent 
          opacity={0.8}
          emissive={isSelected ? (showContent ? solution.color : '#666666') : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Étiquette avec lettre */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Solution {solution.letter}
      </Text>
      
      {/* Contenu révélé si showContent */}
      {showContent && (
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.12}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {solution.name}
        </Text>
      )}
      
      {/* Info bulle au survol */}
      {hovered && !showContent && (
        <Html position={[0, 0.8, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            Solution mystère {solution.letter}
          </div>
        </Html>
      )}

      {/* Info révélée après validation */}
      {hovered && showContent && (
        <Html position={[0, 0.8, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            {solution.name} - pH: {solution.pH} - {solution.description}
          </div>
        </Html>
      )}
    </group>
  );
}

// Composant pour les bandelettes de papier pH
function PHStrips({ position, currentPH, isUsed }: { 
  position: [number, number, number]; 
  currentPH: number | null;
  isUsed: boolean;
}) {
  const stripRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stripRef.current) {
      stripRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  // Couleur de la bandelette selon le pH
  const getStripColor = (pH: number) => {
    if (pH <= 2) return '#FF0000';
    if (pH <= 4) return '#FF6600';
    if (pH <= 6) return '#FFAA00';
    if (pH < 7) return '#FFFF00';
    if (pH === 7) return '#00FF00';
    if (pH <= 8) return '#66FF66';
    if (pH <= 10) return '#00FFFF';
    if (pH <= 12) return '#0066FF';
    return '#0000FF';
  };

  return (
    <group ref={stripRef} position={position}>
      {/* Bandelette */}
      <mesh>
        <boxGeometry args={[0.8, 0.1, 0.02]} />
        <meshStandardMaterial 
          color={isUsed && currentPH !== null ? getStripColor(currentPH) : '#FFFFFF'} 
        />
      </mesh>
      
      {/* Texte pH si utilisée */}
      {isUsed && currentPH !== null && (
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.08}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          pH ≈ {currentPH.toFixed(1)}
        </Text>
      )}
      
      {/* Étiquette */}
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.06}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {isUsed ? 'Utilisée' : 'Bandelette pH'}
      </Text>
    </group>
  );
}

// Composant pour l'échelle de pH
function PHScale({ measurements }: { measurements: Array<{letter: string, pH: number}> }) {
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
    <group position={[4, 0, 0]}>
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
            <meshStandardMaterial color={item.color} />
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

          {/* Affichage des mesures */}
          {measurements
            .filter(m => Math.abs(m.pH - item.value) < 1)
            .map((measurement, idx) => (
              <Text
                key={idx}
                position={[1.2 + idx * 0.2, 0, 0]}
                fontSize={0.1}
                color="red"
                anchorX="center"
                anchorY="middle"
              >
                {measurement.letter}
              </Text>
            ))}
        </group>
      ))}
    </group>
  );
}

// Composant principal de la simulation
function PHSimulatorScene({ 
  selectedSolution, 
  onSolutionSelect, 
  onMeasurement,
  gamePhase,
  showContent
}: { 
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution) => void;
  onMeasurement: (solution: Solution, ph: number) => void;
  gamePhase: 'measuring' | 'associating' | 'results';
  showContent: boolean;
}) {
  const [usedStrips, setUsedStrips] = useState<Array<{solution: Solution, pH: number}>>([]);

  const handleSolutionClick = (solution: Solution) => {
    if (gamePhase !== 'measuring') return;
    
    onSolutionSelect(solution);
    
    // Simulation de la mesure avec bandelette
    setTimeout(() => {
      const measuredPH = solution.pH + (Math.random() - 0.5) * 0.3; // Variation réaliste
      setUsedStrips(prev => [...prev, { solution, pH: measuredPH }]);
      onMeasurement(solution, measuredPH);
    }, 1500);
  };

  return (
    <>
      {/* Éclairage */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6600" />

      {/* Solutions mystères */}
      {SOLUTIONS.map((solution, index) => (
        <MysteryBottle
          key={solution.id}
          solution={solution}
          position={[Math.cos(index * Math.PI * 2 / SOLUTIONS.length) * 2.5, 0, Math.sin(index * Math.PI * 2 / SOLUTIONS.length) * 2.5]}
          onClick={() => handleSolutionClick(solution)}
          isSelected={selectedSolution?.id === solution.id}
          showContent={showContent}
        />
      ))}

      {/* Bandelettes de papier pH utilisées */}
      {usedStrips.map((strip, index) => (
        <PHStrips
          key={index}
          position={[-2 + (index % 4) * 0.4, 1 - Math.floor(index / 4) * 0.3, -1]}
          currentPH={strip.pH}
          isUsed={true}
        />
      ))}

      {/* Bandelette en cours d'utilisation */}
      {selectedSolution && gamePhase === 'measuring' && (
        <PHStrips
          position={[0, 0.5, 0]}
          currentPH={null}
          isUsed={false}
        />
      )}

      {/* Échelle de pH */}
      <PHScale measurements={usedStrips.map(s => ({ letter: s.solution.letter, pH: s.pH }))} />

      {/* Contrôles de caméra */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={4}
        maxDistance={20}
      />
    </>
  );
}

export default PHSimulatorScene;
export { SOLUTIONS, type Solution };