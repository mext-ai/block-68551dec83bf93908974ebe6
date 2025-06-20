import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import PHSimulatorScene, { SOLUTIONS, type Solution } from './PHSimulator';
import './styles.css';

interface BlockProps {
  title?: string;
  description?: string;
}

interface Measurement {
  solution: Solution;
  measuredPH: number;
}

interface Association {
  letter: string;
  guessedSolution: string;
}

const Block: React.FC<BlockProps> = ({ 
  title = "Laboratoire de pH - Identification des Solutions",
  description = "Utilisez des bandelettes de papier pH pour identifier des solutions mystères !"
}) => {
  const [gameState, setGameState] = useState<'intro' | 'measuring' | 'associating' | 'results'>('intro');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Initialiser les associations vides
  useEffect(() => {
    if (gameState === 'associating' && associations.length === 0) {
      setAssociations(SOLUTIONS.map(sol => ({ letter: sol.letter, guessedSolution: '' })));
    }
  }, [gameState, associations.length]);

  // Envoyer l'événement de completion
  useEffect(() => {
    if (gameState === 'results') {
      const completionData = {
        type: 'BLOCK_COMPLETION',
        blockId: '68551dec83bf93908974ebe6',
        completed: true,
        score: score,
        maxScore: 100,
        data: {
          measurements: measurements.length,
          correctAssociations: score,
          totalSolutions: SOLUTIONS.length
        }
      };
      
      window.postMessage(completionData, '*');
      window.parent.postMessage(completionData, '*');
    }
  }, [gameState, score, measurements.length]);

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
  };

  const handleMeasurement = (solution: Solution, measuredPH: number) => {
    const newMeasurement = { solution, measuredPH };
    setMeasurements(prev => {
      const filtered = prev.filter(m => m.solution.id !== solution.id);
      return [...filtered, newMeasurement];
    });
    setSelectedSolution(null);
  };

  const handleAssociationChange = (letter: string, guessedSolution: string) => {
    setAssociations(prev => 
      prev.map(assoc => 
        assoc.letter === letter 
          ? { ...assoc, guessedSolution }
          : assoc
      )
    );
  };

  const validateAssociations = () => {
    let correctCount = 0;
    associations.forEach(assoc => {
      const correctSolution = SOLUTIONS.find(sol => sol.letter === assoc.letter);
      if (correctSolution && correctSolution.name === assoc.guessedSolution) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / SOLUTIONS.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    setGameState('results');
  };

  const resetGame = () => {
    setGameState('intro');
    setSelectedSolution(null);
    setMeasurements([]);
    setAssociations([]);
    setScore(0);
    setShowResults(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreMessage = (score: number) => {
    if (score === 100) return "Parfait ! Tu es un vrai chimiste ! 👨‍🔬";
    if (score >= 80) return "Excellent travail ! Tu maîtrises bien le pH ! 🎯";
    if (score >= 60) return "Bien joué ! Continue à t'entraîner ! 👍";
    if (score >= 40) return "Pas mal ! Tu progresses ! 💪";
    return "Continue à apprendre, tu vas y arriver ! 📚";
  };

  if (gameState === 'intro') {
    return (
      <div className="ph-simulator">
        <div className="intro-screen">
          <h1>🧪 {title}</h1>
          <p className="description">{description}</p>
          
          <div className="info-panel">
            <h3>🎯 Mission</h3>
            <p>Tu es un chimiste en herbe ! Devant toi se trouvent 7 flacons mystères étiquetés A, B, C, D, E, F, G. 
               Ton objectif est d'identifier leur contenu en utilisant des bandelettes de papier pH.</p>
            
            <h3>📋 Protocole</h3>
            <div className="protocol-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>Phase de mesure</strong>
                  <p>Clique sur chaque flacon pour y tremper une bandelette de papier pH. 
                     Note la couleur et la valeur du pH obtenue.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>Phase d'association</strong>
                  <p>Associe chaque flacon (A, B, C...) à son contenu réel en te basant sur 
                     les mesures de pH que tu as effectuées.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>Validation</strong>
                  <p>Valide tes associations pour découvrir si tu as correctement identifié 
                     toutes les solutions !</p>
                </div>
              </div>
            </div>
            
            <h3>💡 Rappel sur le pH</h3>
            <div className="ph-reminder">
              <div className="ph-info-item">
                <span className="ph-range acid">pH 0-6 : Acide</span>
                <span>Plus le pH est bas, plus c'est acide</span>
              </div>
              <div className="ph-info-item">
                <span className="ph-range neutral">pH 7 : Neutre</span>
                <span>Comme l'eau pure</span>
              </div>
              <div className="ph-info-item">
                <span className="ph-range basic">pH 8-14 : Basique</span>
                <span>Plus le pH est haut, plus c'est basique</span>
              </div>
            </div>
          </div>
          
          <button className="start-button" onClick={() => setGameState('measuring')}>
            🔬 Commencer l'expérience
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'measuring') {
    return (
      <div className="ph-simulator">
        <div className="game-header">
          <h2>🔬 Phase de mesure - Teste les solutions</h2>
          <div className="stats">
            <span>Solutions testées : {measurements.length}/7</span>
            <button 
              className="phase-button"
              onClick={() => setGameState('associating')}
              disabled={measurements.length < 7}
            >
              {measurements.length < 7 ? 'Teste toutes les solutions' : '➡️ Phase d\'association'}
            </button>
          </div>
        </div>

        <div className="game-container">
          <div className="canvas-container">
            <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
              <PHSimulatorScene
                selectedSolution={selectedSolution}
                onSolutionSelect={handleSolutionSelect}
                onMeasurement={handleMeasurement}
                gamePhase="measuring"
                showContent={false}
              />
            </Canvas>
          </div>

          <div className="sidebar">
            <div className="current-measurement">
              {selectedSolution ? (
                <div className="measuring-info">
                  <h3>🧪 Mesure en cours</h3>
                  <p>Test de la solution <strong>{selectedSolution.letter}</strong></p>
                  <p>Trempage de la bandelette...</p>
                  <div className="measuring-animation">
                    <div className="dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-measurement">
                  <h3>Sélectionne une solution</h3>
                  <p>Clique sur un flacon pour y tremper une bandelette de papier pH</p>
                </div>
              )}
            </div>

            <div className="measurements-list">
              <h3>📊 Résultats des mesures</h3>
              {measurements.length === 0 ? (
                <p>Aucune mesure effectuée</p>
              ) : (
                <div className="measurements-grid">
                  {measurements.map((measurement, index) => (
                    <div key={index} className="measurement-card">
                      <div className="solution-letter">{measurement.solution.letter}</div>
                      <div className="ph-value">pH = {measurement.measuredPH.toFixed(1)}</div>
                      <div className="ph-strip-color" style={{ 
                        backgroundColor: 
                          measurement.measuredPH <= 2 ? '#FF0000' :
                          measurement.measuredPH <= 4 ? '#FF6600' :
                          measurement.measuredPH <= 6 ? '#FFAA00' :
                          measurement.measuredPH < 7 ? '#FFFF00' :
                          measurement.measuredPH === 7 ? '#00FF00' :
                          measurement.measuredPH <= 8 ? '#66FF66' :
                          measurement.measuredPH <= 10 ? '#00FFFF' :
                          measurement.measuredPH <= 12 ? '#0066FF' : '#0000FF'
                      }}>
                        Bandelette
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="help-section">
              <h3>💡 Aide</h3>
              <ul>
                <li>Clique sur chaque flacon pour le tester</li>
                <li>Observe la couleur de la bandelette</li>
                <li>Note les valeurs de pH obtenues</li>
                <li>Utilise la molette pour zoomer/dézoomer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'associating') {
    const availableSolutions = ['Jus de citron', 'Vinaigre', 'Café', 'Eau pure', 'Bicarbonate', 'Eau savonneuse', 'Eau de javel'];
    
    return (
      <div className="ph-simulator">
        <div className="game-header">
          <h2>🔍 Phase d'association - Identifie les solutions</h2>
          <div className="stats">
            <span>Associations : {associations.filter(a => a.guessedSolution).length}/7</span>
            <button 
              className="validate-button"
              onClick={validateAssociations}
              disabled={associations.filter(a => a.guessedSolution).length < 7}
            >
              {associations.filter(a => a.guessedSolution).length < 7 ? 'Complète toutes les associations' : '✅ Valider mes réponses'}
            </button>
          </div>
        </div>

        <div className="association-container">
          <div className="measurements-reference">
            <h3>📊 Tes mesures de pH</h3>
            <div className="reference-grid">
              {measurements.map((measurement, index) => (
                <div key={index} className="reference-card">
                  <div className="solution-letter">{measurement.solution.letter}</div>
                  <div className="ph-value">pH = {measurement.measuredPH.toFixed(1)}</div>
                  <div className="ph-description">
                    {measurement.measuredPH <= 3 ? 'Très acide' :
                     measurement.measuredPH <= 5 ? 'Acide' :
                     measurement.measuredPH <= 6.5 ? 'Légèrement acide' :
                     measurement.measuredPH <= 7.5 ? 'Neutre' :
                     measurement.measuredPH <= 9 ? 'Légèrement basique' :
                     measurement.measuredPH <= 11 ? 'Basique' : 'Très basique'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="association-form">
            <h3>🎯 Associe chaque flacon à son contenu</h3>
            <div className="associations-grid">
              {associations.map((assoc, index) => (
                <div key={index} className="association-item">
                  <label className="solution-label">Solution {assoc.letter} :</label>
                  <select 
                    value={assoc.guessedSolution}
                    onChange={(e) => handleAssociationChange(assoc.letter, e.target.value)}
                    className="solution-select"
                  >
                    <option value="">Sélectionne une solution...</option>
                    {availableSolutions.map(solution => (
                      <option key={solution} value={solution}>{solution}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="hints-section">
            <h3>💡 Indices</h3>
            <div className="hints-grid">
              <div className="hint-item">
                <strong>Très acides (pH 2-3) :</strong> Agrumes, vinaigre
              </div>
              <div className="hint-item">
                <strong>Légèrement acides (pH 4-6) :</strong> Boissons comme le café
              </div>
              <div className="hint-item">
                <strong>Neutres (pH 7) :</strong> Eau pure
              </div>
              <div className="hint-item">
                <strong>Basiques (pH 8-10) :</strong> Produits de nettoyage doux
              </div>
              <div className="hint-item">
                <strong>Très basiques (pH 11-14) :</strong> Produits de nettoyage forts
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="ph-simulator">
        <div className="results-screen">
          <h1>🏆 Résultats de l'expérience</h1>
          
          <div className="score-summary">
            <h2 style={{ color: getScoreColor(score) }}>
              Score : {score}% ({associations.filter(assoc => {
                const correctSolution = SOLUTIONS.find(sol => sol.letter === assoc.letter);
                return correctSolution && correctSolution.name === assoc.guessedSolution;
              }).length}/{SOLUTIONS.length} correct{associations.filter(assoc => {
                const correctSolution = SOLUTIONS.find(sol => sol.letter === assoc.letter);
                return correctSolution && correctSolution.name === assoc.guessedSolution;
              }).length > 1 ? 'es' : 'e'})
            </h2>
            <p>{getScoreMessage(score)}</p>
          </div>

          <div className="results-details">
            <h3>📋 Détail de tes associations</h3>
            <div className="results-grid">
              {associations.map((assoc, index) => {
                const correctSolution = SOLUTIONS.find(sol => sol.letter === assoc.letter);
                const isCorrect = correctSolution && correctSolution.name === assoc.guessedSolution;
                const measurement = measurements.find(m => m.solution.letter === assoc.letter);
                
                return (
                  <div key={index} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="result-header">
                      <span className="solution-letter">{assoc.letter}</span>
                      <span className={`result-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="result-content">
                      <div className="ph-measured">pH mesuré : {measurement?.measuredPH.toFixed(1)}</div>
                      <div className="your-guess">Ta réponse : {assoc.guessedSolution || 'Aucune'}</div>
                      <div className="correct-answer">Correct : {correctSolution?.name}</div>
                      {!isCorrect && (
                        <div className="explanation">
                          pH réel : {correctSolution?.pH} - {correctSolution?.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="educational-content">
            <h3>🧠 Ce que tu as appris</h3>
            <ul>
              <li>Comment utiliser des bandelettes de papier pH pour mesurer l'acidité</li>
              <li>Les différentes valeurs de pH des solutions courantes</li>
              <li>La différence entre substances acides, neutres et basiques</li>
              <li>L'importance de la mesure précise en chimie</li>
              <li>Comment interpréter les résultats d'une expérience</li>
            </ul>
          </div>

          <div className="final-scene">
            <h3>🔬 Solutions révélées</h3>
            <div className="canvas-container">
              <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
                <PHSimulatorScene
                  selectedSolution={null}
                  onSolutionSelect={() => {}}
                  onMeasurement={() => {}}
                  gamePhase="results"
                  showContent={true}
                />
              </Canvas>
            </div>
          </div>
          
          <button className="restart-button" onClick={resetGame}>
            🔄 Recommencer l'expérience
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Block;