import React, { useEffect, useState } from 'react';
import { Neo4jService } from '../../core/services/neo4j.service';
import { Concept, CodeExample } from '../../core/knowledge-graph/types';

interface ConceptDetailsProps {
  conceptId: string;
  neo4jService: Neo4jService;
  onClose?: () => void;
}

export const ConceptDetails: React.FC<ConceptDetailsProps> = ({
  conceptId,
  neo4jService,
  onClose
}) => {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [relatedConcepts, setRelatedConcepts] = useState<Concept[]>([]);
  const [selectedExample, setSelectedExample] = useState<CodeExample | null>(null);

  useEffect(() => {
    loadConceptDetails();
  }, [conceptId]);

  const loadConceptDetails = async () => {
    try {
      const [conceptData, related] = await Promise.all([
        neo4jService.getRelatedConcepts(conceptId),
        neo4jService.getRelatedConcepts(conceptId)
      ]);

      if (conceptData.length > 0) {
        setConcept(conceptData[0]);
        setRelatedConcepts(related);
      }
    } catch (error) {
      console.error('Error loading concept details:', error);
    }
  };

  if (!concept) {
    return (
      <div className="concept-details-loading">
        Loading concept details...
      </div>
    );
  }

  return (
    <div className="concept-details">
      <div className="concept-header">
        <h2>{concept.name}</h2>
        {onClose && (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        )}
      </div>

      <div className="concept-content">
        <section className="concept-info">
          <div className="difficulty">
            Difficulty: {concept.difficulty}/10
          </div>
          <p className="description">{concept.description}</p>
        </section>

        <section className="concept-examples">
          <h3>Examples</h3>
          <div className="examples-list">
            {concept.examples.map((example) => (
              <div
                key={example.id}
                className={`example-item ${selectedExample?.id === example.id ? 'selected' : ''}`}
                onClick={() => setSelectedExample(example)}
              >
                <pre>
                  <code>{example.code}</code>
                </pre>
                {selectedExample?.id === example.id && (
                  <div className="example-explanation">
                    {example.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="related-concepts">
          <h3>Related Concepts</h3>
          <div className="related-list">
            {relatedConcepts.map((related) => (
              <div key={related.id} className="related-item">
                <span className="name">{related.name}</span>
                <span className="type">{related.type}</span>
              </div>
            ))}
          </div>
        </section>

        {concept.resources.length > 0 && (
          <section className="resources">
            <h3>Learning Resources</h3>
            <ul className="resources-list">
              {concept.resources.map((resource) => (
                <li key={resource.id} className="resource-item">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.title}
                  </a>
                  <span className="resource-type">{resource.type}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <style jsx>{`
        .concept-details {
          height: 100%;
          overflow-y: auto;
          padding: 1rem;
        }

        .concept-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #404040;
        }

        .concept-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          color: #808080;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .close-button:hover {
          color: #ffffff;
        }

        .concept-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .difficulty {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #404040;
          border-radius: 4px;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #d4d4d4;
          line-height: 1.5;
        }

        .examples-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .example-item {
          background-color: #1e1e1e;
          border: 1px solid #404040;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }

        .example-item.selected {
          border-color: #0078d4;
        }

        .example-item pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
        }

        .example-explanation {
          padding: 1rem;
          background-color: #2d2d2d;
          border-top: 1px solid #404040;
        }

        .related-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .related-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.5rem;
          background-color: #2d2d2d;
          border: 1px solid #404040;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .related-item .type {
          color: #808080;
          font-size: 0.75rem;
        }

        .resources-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #2d2d2d;
          border: 1px solid #404040;
          border-radius: 4px;
        }

        .resource-item a {
          color: #0078d4;
          text-decoration: none;
        }

        .resource-item a:hover {
          text-decoration: underline;
        }

        .resource-type {
          font-size: 0.75rem;
          color: #808080;
          padding: 0.125rem 0.25rem;
          background-color: #404040;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}; 