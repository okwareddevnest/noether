import React, { useEffect, useState } from 'react';
import { Neo4jService } from '../../core/services/neo4j.service';
import { AIService } from '../../core/services/ai.service';
import { LearningPath, Concept } from '../../core/knowledge-graph/types';

interface LearningPathsProps {
  neo4jService: Neo4jService;
  aiService: AIService;
  userId: string;
}

export const LearningPaths: React.FC<LearningPathsProps> = ({
  neo4jService,
  aiService,
  userId
}) => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningPaths();
  }, [userId]);

  const loadLearningPaths = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the Neo4jService
      const userPaths = await neo4jService.getUserLearningPaths(userId);
      setPaths(userPaths);
      setLoading(false);
    } catch (error) {
      console.error('Error loading learning paths:', error);
      setLoading(false);
    }
  };

  const handlePathSelect = async (path: LearningPath) => {
    setSelectedPath(path);
    if (path.concepts.length > 0) {
      try {
        const concept = await neo4jService.getConceptById(path.concepts[path.currentIndex]);
        setCurrentConcept(concept);
      } catch (error) {
        console.error('Error loading concept:', error);
      }
    }
  };

  const handleNextConcept = async () => {
    if (selectedPath && currentConcept) {
      const nextIndex = selectedPath.currentIndex + 1;
      if (nextIndex < selectedPath.concepts.length) {
        try {
          const concept = await neo4jService.getConceptById(selectedPath.concepts[nextIndex]);
          setCurrentConcept(concept);
          // Update path progress
          const updatedPath = {
            ...selectedPath,
            currentIndex: nextIndex,
            progress: (nextIndex / selectedPath.concepts.length) * 100
          };
          setSelectedPath(updatedPath);
          // This would need to be implemented in the Neo4jService
          await neo4jService.updateLearningPath(updatedPath);
        } catch (error) {
          console.error('Error loading next concept:', error);
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading learning paths...</div>;
  }

  return (
    <div className="learning-paths">
      <div className="paths-list">
        <h2>Your Learning Paths</h2>
        {paths.length === 0 ? (
          <div className="no-paths">
            <p>You haven't started any learning paths yet.</p>
            <button className="create-path-button">Create New Path</button>
          </div>
        ) : (
          paths.map((path) => (
            <div
              key={path.id}
              className={`path-item ${selectedPath?.id === path.id ? 'selected' : ''}`}
              onClick={() => handlePathSelect(path)}
            >
              <div className="path-header">
                <h3>Learning Path {path.id}</h3>
                <div className="path-progress">
                  {Math.round(path.progress)}% Complete
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
              <div className="path-stats">
                <span>{path.concepts.length} concepts</span>
                <span>•</span>
                <span>
                  Started {new Date(path.created).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPath && currentConcept && (
        <div className="current-concept">
          <h2>Current Concept</h2>
          <div className="concept-card">
            <h3>{currentConcept.name}</h3>
            <div className="concept-difficulty">
              Difficulty: {currentConcept.difficulty}/10
            </div>
            <p className="concept-description">{currentConcept.description}</p>
            {currentConcept.examples.length > 0 && (
              <div className="concept-example">
                <h4>Example</h4>
                <pre>
                  <code>{currentConcept.examples[0].code}</code>
                </pre>
                <p>{currentConcept.examples[0].explanation}</p>
              </div>
            )}
            <button
              className="next-concept-button"
              onClick={handleNextConcept}
              disabled={selectedPath.currentIndex === selectedPath.concepts.length - 1}
            >
              Next Concept
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .learning-paths {
          display: flex;
          gap: 2rem;
          padding: 1rem;
          height: 100%;
        }

        .paths-list {
          flex: 1;
          max-width: 400px;
        }

        .paths-list h2 {
          margin-bottom: 1rem;
        }

        .no-paths {
          text-align: center;
          padding: 2rem;
          background-color: #2d2d2d;
          border-radius: 4px;
        }

        .create-path-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #0078d4;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
        }

        .path-item {
          background-color: #2d2d2d;
          border: 1px solid #404040;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .path-item:hover {
          border-color: #0078d4;
        }

        .path-item.selected {
          border-color: #0078d4;
          background-color: #1e1e1e;
        }

        .path-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .path-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .path-progress {
          font-size: 0.875rem;
          color: #0078d4;
        }

        .progress-bar {
          height: 4px;
          background-color: #404040;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background-color: #0078d4;
          transition: width 0.3s ease;
        }

        .path-stats {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #808080;
        }

        .current-concept {
          flex: 2;
        }

        .concept-card {
          background-color: #2d2d2d;
          border: 1px solid #404040;
          border-radius: 4px;
          padding: 1.5rem;
        }

        .concept-difficulty {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #404040;
          border-radius: 4px;
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }

        .concept-description {
          color: #d4d4d4;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .concept-example {
          background-color: #1e1e1e;
          border: 1px solid #404040;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .concept-example pre {
          margin: 1rem 0;
          padding: 1rem;
          background-color: #2d2d2d;
          border-radius: 4px;
          overflow-x: auto;
        }

        .next-concept-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #0078d4;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .next-concept-button:hover:not(:disabled) {
          background-color: #006cbd;
        }

        .next-concept-button:disabled {
          background-color: #404040;
          cursor: not-allowed;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 1.1rem;
          color: #808080;
        }
      `}</style>
    </div>
  );
}; 