'use client';

import React, { useEffect, useState } from 'react';
import { Neo4jService } from '@/core/services/neo4j.service';
import { AIService } from '@/core/services/ai.service';
import { LearningPath, Concept } from '@/core/knowledge-graph/types';

interface LearningPathsProps {
  neo4jService: Neo4jService;
  aiService: AIService;
  userId: string;
}

export default function LearningPaths({
  neo4jService,
  aiService,
  userId,
}: LearningPathsProps) {
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
          const updatedPath = {
            ...selectedPath,
            currentIndex: nextIndex,
            progress: (nextIndex / selectedPath.concepts.length) * 100,
          };
          setSelectedPath(updatedPath);
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
    </div>
  );
} 