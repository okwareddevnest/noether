import React, { useEffect, useState } from 'react';
import { Editor } from './components/Editor';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { AIService } from '../core/services/ai.service';
import { Neo4jService } from '../core/services/neo4j.service';
import { Concept, UserKnowledge } from '../core/knowledge-graph/types';

const aiService = new AIService(process.env.OPENAI_API_KEY || '');
const neo4jService = new Neo4jService(
  process.env.NEO4J_URI || '',
  process.env.NEO4J_USER || '',
  process.env.NEO4J_PASSWORD || ''
);

export const App: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [userKnowledge, setUserKnowledge] = useState<UserKnowledge[]>([]);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    checkConnection();
    loadUserKnowledge();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await neo4jService.verifyConnection();
      setIsConnected(connected);
      if (!connected) {
        console.error('Failed to connect to Neo4j database');
      }
    } catch (error) {
      console.error('Error connecting to Neo4j:', error);
      setIsConnected(false);
    }
  };

  const loadUserKnowledge = async () => {
    try {
      const userId = 'test-user';
      const knowledge = await neo4jService.getUserKnowledgeState(userId);
      setUserKnowledge(knowledge);
    } catch (error) {
      console.error('Error loading user knowledge:', error);
    }
  };

  const handleConceptSelect = async (concept: Concept) => {
    setSelectedConcept(concept);
    if (concept) {
      try {
        const userKnowledgeForConcept = userKnowledge.find(
          k => k.conceptId === concept.id
        ) || {
          userId: 'test-user',
          conceptId: concept.id,
          proficiency: 0,
          lastPracticed: new Date(),
          exercises: []
        };

        const exercise = await aiService.generateExercise(
          concept,
          userKnowledgeForConcept
        );
        setCurrentCode(exercise.code);
      } catch (error) {
        console.error('Error generating exercise:', error);
      }
    }
  };

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-white">
      <header className="px-4 py-3 bg-secondary flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">NOETHER</h1>
        <div className="font-mono px-3 py-2 rounded bg-secondary-light">
          Database: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>

      <main className="flex-1 flex p-4 gap-4">
        <div className="flex-1 bg-secondary rounded-lg p-4">
          <KnowledgeGraph
            neo4jService={neo4jService}
            onConceptSelect={handleConceptSelect}
          />
        </div>

        <div className="flex-[2] flex flex-col gap-4">
          <div className="bg-secondary rounded-lg p-4">
            {selectedConcept && (
              <>
                <h2 className="text-xl font-bold text-primary mb-2">
                  {selectedConcept.name}
                </h2>
                <p className="text-gray-300 mb-2">{selectedConcept.description}</p>
                <div className="text-sm text-gray-400">
                  Difficulty: {selectedConcept.difficulty}/10
                </div>
              </>
            )}
          </div>

          <div className="flex-1 bg-secondary rounded-lg overflow-hidden">
            <Editor
              initialValue={currentCode}
              language="typescript"
              aiService={aiService}
              neo4jService={neo4jService}
              onCodeChange={handleCodeChange}
            />
          </div>
        </div>
      </main>

      <footer className="px-4 py-3 bg-secondary">
        <div className="user-progress">
          {userKnowledge.length > 0 && (
            <div className="text-center text-sm text-gray-400">
              Concepts Learned: {userKnowledge.length} |
              Average Proficiency:{' '}
              {(
                userKnowledge.reduce((sum, k) => sum + k.proficiency, 0) /
                userKnowledge.length
              ).toFixed(1)}
              /10
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}; 