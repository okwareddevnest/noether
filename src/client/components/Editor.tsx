import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { AIService } from '../../core/services/ai.service';
import { Neo4jService } from '../../core/services/neo4j.service';
import { CodeExample, Concept } from '../../core/knowledge-graph/types';

interface EditorProps {
  initialValue: string;
  language: string;
  theme?: string;
  aiService: AIService;
  neo4jService: Neo4jService;
  onCodeChange?: (code: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  initialValue,
  language,
  theme = 'vs-dark',
  aiService,
  neo4jService,
  onCodeChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [analysis, setAnalysis] = useState<{
    quality: number;
    suggestions: string[];
    concepts: string[];
    potentialIssues: string[];
  } | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      const ed = monaco.editor.create(editorRef.current, {
        value: initialValue,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        tabSize: 2,
        wordWrap: 'on'
      });

      setEditor(ed);

      // Set up change listener
      ed.onDidChangeModelContent(() => {
        const value = ed.getValue();
        onCodeChange?.(value);
        analyzeCode(value);
      });

      return () => {
        ed.dispose();
      };
    }
  }, [editorRef.current]);

  const analyzeCode = async (code: string) => {
    if (!code.trim()) return;

    try {
      const result = await aiService.analyzeCode(code, language);
      setAnalysis(result);

      // Add inline decorations for issues
      if (editor && result.potentialIssues.length > 0) {
        const model = editor.getModel();
        if (model) {
          const decorations = result.potentialIssues.map(issue => ({
            range: {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: model.getLineCount(),
              endColumn: 1
            },
            options: {
              isWholeLine: true,
              glyphMarginClassName: 'warning-glyph',
              hoverMessage: { value: issue }
            }
          }));
          editor.deltaDecorations([], decorations);
        }
      }

      // Update knowledge graph with detected concepts
      if (result.concepts.length > 0) {
        result.concepts.forEach(async (conceptName) => {
          const concept: Concept = {
            id: `concept-${Date.now()}`,
            name: conceptName,
            description: '',
            type: 'PATTERN',
            difficulty: 1,
            prerequisites: [],
            relatedConcepts: [],
            resources: [],
            examples: []
          };
          await neo4jService.addConcept(concept);
        });
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
  };

  return (
    <div className="editor-container">
      <div ref={editorRef} className="editor" style={{ height: '600px' }} />
      {analysis && (
        <div className="analysis-panel">
          <h3>Code Analysis</h3>
          <div className="quality-score">
            Quality Score: {analysis.quality}/10
          </div>
          <div className="suggestions">
            <h4>Suggestions</h4>
            <ul>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
          <div className="concepts">
            <h4>Detected Concepts</h4>
            <ul>
              {analysis.concepts.map((concept, index) => (
                <li key={index}>{concept}</li>
              ))}
            </ul>
          </div>
          <div className="issues">
            <h4>Potential Issues</h4>
            <ul>
              {analysis.potentialIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 