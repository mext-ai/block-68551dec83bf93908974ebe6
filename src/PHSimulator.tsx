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

// Composant pour un bécher de laboratoire réaliste
function MysteryBeaker({ solution, position, onClick, isSelected, showContent }: { 
  solution: Solution; 
  position: [number, number, number]; 
  onClick: () => void;
  isSelected: boolean;
  showContent: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = isSelected ? state.clock.elapsedTime * 0.5 : 0;
      meshRef.current.position.y = position[1] + (hovered ? 0.05 : 0);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Corps principal du bécher - cylindre droit */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.05 : 1}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
        <meshStandardMaterial 
          color={showContent ? solution.color : '#F0F0F0'} 
          transparent 
          opacity={0.8}
          emissive={isSelected ? (showContent ? solution.color : '#CCCCCC') : '#000000'}
          emissiveIntensity={isSelected ? 0.1 : 0}
          roughness={0.1}
          metalness={0.05}
        />
      </mesh>
      
      {/* Paroi extérieure du bécher pour l'effet verre */}
      <mesh scale={isSelected ? 1.05 : 1}>
        <cylinderGeometry args={[0.32, 0.32, 0.82, 32]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          transparent 
          opacity={0.15}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      
      {/* Bec verseur - forme intégrée et plate */}
      <mesh position={[0.31, 0.35, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[0.12, 0.08, 0.02]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Graduations sur le bécher */}
      {[0.2, 0, -0.2].map((y, index) => (
        <mesh key={index} position={[0.31, y, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.3]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      ))}
      
      {/* Base du bécher - plus fine */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          roughness={0.1}
          metalness={0.05}
        />
      </mesh>
      
      {/* Niveau de liquide si contenu visible */}
      {showContent && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.4, 32]} />
          <meshStandardMaterial 
            color={solution.color} 
            transparent 
            opacity={0.7}
            emissive={solution.color}
            emissiveIntensity={0.1}
          />
        </mesh>
      )}
      
      {/* Étiquette avec lettre */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.18}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Bécher {solution.letter}
      </Text>
      
      {/* Contenu révélé si showContent */}
      {showContent && (
        <Text
          position={[0, -0.95, 0]}
          fontSize={0.1}
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
            Bécher mystère {solution.letter}
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
function PHStrips({ position, currentPH, isUsed, letter }: { 
  position: [number, number, number]; 
  currentPH: number | null;
  isUsed: boolean;
  letter?: string;
}) {
  const stripRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stripRef.current && isUsed) {
      stripRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
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
      {/* Support de bandelette */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Bandelette */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.6, 0.08, 0.01]} />
        <meshStandardMaterial 
          color={isUsed && currentPH !== null ? getStripColor(currentPH) : '#FFFFFF'} 
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Bord de la bandelette pour l'effet papier */}
      <mesh position={[0, 0, 0.005]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.58, 0.06, 0.005]} />
        <meshStandardMaterial 
          color={isUsed && currentPH !== null ? getStripColor(currentPH) : '#F8F8F8'} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Texte pH si utilisée */}
      {isUsed && currentPH !== null && (
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.06}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          pH = {currentPH.toFixed(1)}
        </Text>
      )}
      
      {/* Lettre du bécher associé */}
      {letter && (
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.08}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {letter}
        </Text>
      )}
      
      {/* Étiquette */}
      <Text
        position={[0, -0.25, 0]}
        fontSize={0.05}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        {isUsed ? 'Bandelette pH' : 'Non utilisée'}
      </Text>
    </group>
  );
}

// Composant pour l'échelle de pH (repositionnée et plus compacte)
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
    <group position={[0, 3, -2]}>
      {/* Titre de l'échelle */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Échelle de pH
      </Text>
      
      {/* Échelle horizontale plus compacte */}
      {scaleItems.map((item, index) => (
        <group key={item.value} position={[-4 + index * 1, 0, 0]}>
          {/* Indicateur coloré */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.05]} />
            <meshStandardMaterial 
              color={item.color}
              emissive={measurements.some(m => Math.abs(m.pH - item.value) < 1) ? item.color : '#000000'}
              emissiveIntensity={measurements.some(m => Math.abs(m.pH - item.value) < 1) ? 0.3 : 0}
            />
          </mesh>
          
          {/* Valeur pH */}
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.08}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {item.value}
          </Text>
          
          {/* Affichage des mesures */}
          {measurements
            .filter(m => Math.abs(m.pH - item.value) < 1)
            .map((measurement, idx) => (
              <Text
                key={idx}
                position={[0, -0.5 + idx * -0.15, 0]}
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

// Composant de table de laboratoire améliorée
function LabTable() {
  return (
    <group position={[0, -1, 0]}>
      {/* Surface de la table */}
      <mesh>
        <boxGeometry args={[10, 0.15, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Rebord de la table */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[10.2, 0.05, 8.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Pieds de table */}
      {[[-4, -0.6, -3.5], [4, -0.6, -3.5], [-4, -0.6, 3.5], [4, -0.6, 3.5]].map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
      
      {/* Marquages sur la table */}
      <Text
        position={[0, 0.08, 3]}
        fontSize={0.12}
        color="#4A4A4A"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        TABLE DE LABORATOIRE - pH
      </Text>
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
      setUsedStrips(prev => {
        // Remplacer si déjà testé ou ajouter
        const filtered = prev.filter(strip => strip.solution.id !== solution.id);
        return [...filtered, { solution, pH: measuredPH }];
      });
      onMeasurement(solution, measuredPH);
    }, 1500);
  };

  return (
    <>
      {/* Éclairage amélioré */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#ffffff" />

      {/* Table de laboratoire */}
      <LabTable />

      {/* Béchers mystères - repositionnés */}
      {SOLUTIONS.map((solution, index) => {
        const angle = (index * Math.PI * 2) / SOLUTIONS.length;
        const radius = 2.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <MysteryBeaker
            key={solution.id}
            solution={solution}
            position={[x, 0, z]}
            onClick={() => handleSolutionClick(solution)}
            isSelected={selectedSolution?.id === solution.id}
            showContent={showContent}
          />
        );
      })}

      {/* Bandelettes de papier pH utilisées - positionnées devant chaque bécher */}
      {SOLUTIONS.map((solution, index) => {
        const usedStrip = usedStrips.find(strip => strip.solution.id === solution.id);
        if (!usedStrip) return null;
        
        const angle = (index * Math.PI * 2) / SOLUTIONS.length;
        const radius = 2.8; // Un peu plus loin que les béchers
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <PHStrips
            key={`strip-${solution.id}`}
            position={[x, 0.3, z]}
            currentPH={usedStrip.pH}
            isUsed={true}
            letter={solution.letter}
          />
        );
      })}

      {/* Bandelette en cours d'utilisation */}
      {selectedSolution && gamePhase === 'measuring' && (
        <PHStrips
          position={[0, 0.8, 0]}
          currentPH={null}
          isUsed={false}
        />
      )}

      {/* Échelle de pH repositionnée */}
      <PHScale measurements={usedStrips.map(s => ({ letter: s.solution.letter, pH: s.pH }))} />

      {/* Contrôles de caméra améliorés */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        minDistance={6}
        maxDistance={16}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        autoRotate={false}
      />
    </>
  );
}

export default PHSimulatorScene;
export { SOLUTIONS, type Solution };