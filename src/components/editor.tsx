'use client';

import React, { useCallback, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { AIService } from '@/core/services/ai.service';
import { Neo4jService } from '@/core/services/neo4j.service';
import { config } from '@/config';

interface EditorProps {
  initialValue?: string;
  language?: string;
  theme?: string;
  aiService?: AIService;
  neo4jService?: Neo4jService;
  onCodeChange?: (code: string) => void;
}

export default function Editor({
  initialValue = '// Start coding here...',
  language = 'typescript',
  theme = config.editor.defaultTheme,
  aiService,
  neo4jService,
  onCodeChange,
}: EditorProps) {
  const [code, setCode] = useState(initialValue);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setCode(value);
        onCodeChange?.(value);
      }
    },
    [onCodeChange]
  );

  const analyzeCode = useCallback(async () => {
    if (!aiService || !code) return;

    try {
      setIsAnalyzing(true);
      const result = await aiService.analyzeCode(code, language);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiService, code, language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (code && code !== initialValue) {
        analyzeCode();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, initialValue, analyzeCode]);

  return (
    <div className="editor-container h-full flex flex-col">
      <div className="editor-main flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={language}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: config.editor.fontSize,
            tabSize: config.editor.tabSize,
            wordWrap: config.editor.wordWrap,
            minimap: { enabled: config.editor.minimap },
            lineNumbers: config.editor.lineNumbers ? 'on' : 'off',
            automaticLayout: true,
          }}
        />
      </div>

      {isAnalyzing && (
        <div className="analysis-loading p-2 text-sm text-neutral-400">
          Analyzing code...
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="analysis-results p-4 bg-background-light border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Analysis Results</h3>
            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary-foreground">
              Quality: {analysis.quality}/10
            </span>
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-medium mb-1 text-neutral-400">
                Suggestions
              </h4>
              <ul className="text-xs space-y-1">
                {analysis.suggestions.map((suggestion: string, i: number) => (
                  <li key={i} className="text-neutral-300">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.concepts.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-medium mb-1 text-neutral-400">
                Detected Concepts
              </h4>
              <div className="flex flex-wrap gap-1">
                {analysis.concepts.map((concept: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.potentialIssues.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1 text-neutral-400">
                Potential Issues
              </h4>
              <ul className="text-xs space-y-1">
                {analysis.potentialIssues.map((issue: string, i: number) => (
                  <li key={i} className="text-red-400">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 