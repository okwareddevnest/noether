import React, { useState } from 'react';
import { Editor } from './components/Editor';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { AIService } from '../core/services/ai.service';
import { Neo4jService } from '../core/services/neo4j.service';
import { config } from '../config';

// Initialize services
const neo4jService = new Neo4jService(
  config.neo4j.uri,
  config.neo4j.username,
  config.neo4j.password
);

const aiService = new AIService(config.modus.apiKey, neo4jService);

export const App: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [code, setCode] = useState<string>('// Start coding here...');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcept(conceptId);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NOETHER</h1>
        <nav>
          <button>Editor</button>
          <button>Knowledge Graph</button>
          <button>Learning Paths</button>
          <button>Settings</button>
        </nav>
      </header>

      <main className="app-main">
        <div className="editor-panel">
          <Editor
            initialValue={code}
            language="typescript"
            theme={config.editor.defaultTheme}
            aiService={aiService}
            neo4jService={neo4jService}
            onCodeChange={handleCodeChange}
          />
        </div>

        <div className="graph-panel">
          <KnowledgeGraph
            neo4jService={neo4jService}
            onConceptSelect={handleConceptSelect}
          />
        </div>

        {selectedConcept && (
          <div className="concept-details">
            <h3>Concept Details</h3>
            {/* Add concept details component here */}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with Modus, Neo4j, and ❤️</p>
      </footer>

      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #1e1e1e;
          color: #ffffff;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #2d2d2d;
          border-bottom: 1px solid #404040;
        }

        .app-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .app-header nav {
          display: flex;
          gap: 1rem;
        }

        .app-header button {
          padding: 0.5rem 1rem;
          background-color: transparent;
          border: 1px solid #404040;
          border-radius: 4px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .app-header button:hover {
          background-color: #404040;
        }

        .app-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .editor-panel {
          flex: 1;
          min-width: 0;
          padding: 1rem;
        }

        .graph-panel {
          width: 40%;
          min-width: 400px;
          border-left: 1px solid #404040;
          padding: 1rem;
        }

        .concept-details {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          background-color: #2d2d2d;
          border-left: 1px solid #404040;
          padding: 1rem;
          height: 80%;
          overflow-y: auto;
        }

        .app-footer {
          padding: 1rem;
          text-align: center;
          background-color: #2d2d2d;
          border-top: 1px solid #404040;
        }
      `}</style>
    </div>
  );
}; 