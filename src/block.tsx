import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import PHSimulatorScene, { SOLUTIONS, type Solution } from './PHSimulator';
import './styles.css';

interface BlockProps {
  title?: string;
  description?: string;
}

const Block: React.FC<BlockProps> = ({ 
  title = "Simulateur de pH - Laboratoire Virtuel",
  description = "Découvrez le monde fascinant du pH en testant différentes solutions chimiques !"
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [measurements, setMeasurements] = useState<Array<{solution: Solution, measuredPH: number, accuracy: number}>>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Envoyer l'événement de completion quand l'utilisateur termine
  useEffect(() => {
    if (measurements.length >= 5) {
      const finalScore = Math.round((score / attempts) * 100);
      
      // Envoyer l'événement de completion
      const completionData = {
        type: 'BLOCK_COMPLETION',
        blockId: '68551dec83bf93908974ebe6',
        completed: true,
        score: finalScore,
        maxScore: 100,
        data: {
          measurements: measurements.length,
          averageAccuracy: finalScore,
          timeSpent: Date.now()
        }
      };
      
      window.postMessage(completionData, '*');
      window.parent.postMessage(completionData, '*');
      
      setGameState('results');
    }
  }, [measurements, score, attempts]);

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
    setShowHint(false);
  };

  const handleMeasurement = (measuredPH: number) => {
    if (!selectedSolution) return;

    const accuracy = Math.max(0, 100 - Math.abs(selectedSolution.pH - measuredPH) * 20);
    const newMeasurement = {
      solution: selectedSolution,
      measuredPH: measuredPH,
      accuracy: accuracy
    };

    setMeasurements(prev => [...prev, newMeasurement]);
    setScore(prev => prev + accuracy);
    setAttempts(prev => prev + 1);
  };

  const resetExperiment = () => {
    setGameState('intro');
    setSelectedSolution(null);
    setMeasurements([]);
    setScore(0);
    setAttempts(0);
    setShowHint(false);
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 90) return '#4CAF50';
    if (accuracy >= 70) return '#FF9800';
    return '#F44336';
  };

  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 95) return "Excellent ! Mesure très précise ! 🎯";
    if (accuracy >= 85) return "Très bien ! Bonne précision ! 👍";
    if (accuracy >= 70) return "Bien ! Mesure correcte ! ✅";
    if (accuracy >= 50) return "Pas mal, mais tu peux mieux faire ! 💪";
    return "Continue à t'entraîner ! 📚";
  };

  if (gameState === 'intro') {
    return (
      <div className="ph-simulator">
        <div className="intro-screen">
          <h1>🧪 {title}</h1>
          <p className="description">{description}</p>
          
          <div className="info-panel">
            <h3>🎯 Objectif</h3>
            <p>Utilise le pH-mètre virtuel pour mesurer le pH de différentes solutions chimiques. 
               Apprends à reconnaître les substances acides, neutres et basiques !</p>
            
            <h3>🕹️ Comment jouer</h3>
            <ul>
              <li>Clique sur une solution pour la sélectionner</li>
              <li>Le pH-mètre mesurera automatiquement le pH</li>
              <li>Observe l'échelle de pH pour comprendre les valeurs</li>
              <li>Teste au moins 5 solutions différentes</li>
            </ul>
            
            <h3>📊 Échelle de pH</h3>
            <div className="ph-info">
              <span className="ph-range acid">0-6 : Acide</span>
              <span className="ph-range neutral">7 : Neutre</span>
              <span className="ph-range basic">8-14 : Basique</span>
            </div>
          </div>
          
          <button className="start-button" onClick={() => setGameState('playing')}>
            🚀 Commencer l'expérience
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const finalScore = Math.round((score / attempts) * 100);
    
    return (
      <div className="ph-simulator">
        <div className="results-screen">
          <h1>🏆 Résultats de l'expérience</h1>
          
          <div className="score-summary">
            <h2 style={{ color: getScoreColor(finalScore) }}>
              Score final : {finalScore}%
            </h2>
            <p>{getAccuracyMessage(finalScore)}</p>
          </div>
          
          <div className="measurements-list">
            <h3>📋 Tes mesures :</h3>
            {measurements.map((measurement, index) => (
              <div key={index} className="measurement-item">
                <span className="solution-name">{measurement.solution.name}</span>
                <span className="ph-values">
                  pH réel: {measurement.solution.pH} | 
                  pH mesuré: {measurement.measuredPH.toFixed(1)}
                </span>
                <span 
                  className="accuracy"
                  style={{ color: getScoreColor(measurement.accuracy) }}
                >
                  {measurement.accuracy.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="educational-content">
            <h3>🧠 Ce que tu as appris :</h3>
            <ul>
              <li>Les solutions acides ont un pH inférieur à 7</li>
              <li>L'eau pure est neutre avec un pH de 7</li>
              <li>Les solutions basiques ont un pH supérieur à 7</li>
              <li>Plus le pH est faible, plus la solution est acide</li>
              <li>Plus le pH est élevé, plus la solution est basique</li>
            </ul>
          </div>
          
          <button className="restart-button" onClick={resetExperiment}>
            🔄 Recommencer l'expérience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ph-simulator">
      <div className="game-header">
        <h2>🧪 Laboratoire de pH - Mesure en cours</h2>
        <div className="stats">
          <span>Mesures effectuées: {measurements.length}/5</span>
          <span>Score moyen: {attempts > 0 ? Math.round(score / attempts) : 0}%</span>
        </div>
      </div>

      <div className="game-container">
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            <PHSimulatorScene
              selectedSolution={selectedSolution}
              onSolutionSelect={handleSolutionSelect}
              onMeasurement={handleMeasurement}
            />
          </Canvas>
        </div>

        <div className="sidebar">
          <div className="selected-solution">
            {selectedSolution ? (
              <div className="solution-info">
                <h3>Solution sélectionnée</h3>
                <div 
                  className="solution-preview"
                  style={{ backgroundColor: selectedSolution.color }}
                >
                  {selectedSolution.name}
                </div>
                <p><strong>pH réel:</strong> {selectedSolution.pH}</p>
                <p><strong>Type:</strong> {selectedSolution.description}</p>
              </div>
            ) : (
              <div className="no-selection">
                <h3>Sélectionne une solution</h3>
                <p>Clique sur une bouteille dans la scène 3D pour commencer la mesure</p>
              </div>
            )}
          </div>

          <div className="recent-measurements">
            <h3>Dernières mesures</h3>
            {measurements.slice(-3).reverse().map((measurement, index) => (
              <div key={index} className="measurement-result">
                <span className="solution-name">{measurement.solution.name}</span>
                <span className="ph-measured">pH: {measurement.measuredPH.toFixed(1)}</span>
                <span 
                  className="accuracy-badge"
                  style={{ backgroundColor: getScoreColor(measurement.accuracy) }}
                >
                  {measurement.accuracy.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          <div className="help-section">
            <button 
              className="hint-button"
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? 'Masquer' : 'Afficher'} l'aide
            </button>
            
            {showHint && (
              <div className="hint-content">
                <h4>💡 Conseils :</h4>
                <ul>
                  <li>Utilise la molette pour zoomer</li>
                  <li>Clique et glisse pour faire tourner la vue</li>
                  <li>Survole les solutions pour voir leur pH</li>
                  <li>Regarde l'échelle de pH à droite</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Block;