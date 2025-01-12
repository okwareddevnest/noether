export const config = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },
  modus: {
    apiKey: process.env.MODUS_API_KEY || '',
    modelVersion: 'llama-3.1',
  },
  editor: {
    defaultTheme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: true,
  },
  graph: {
    defaultNodeSize: 10,
    defaultEdgeWidth: 2,
    colors: {
      LANGUAGE: '#ff6b6b',
      FRAMEWORK: '#4ecdc4',
      PATTERN: '#45b7d1',
      ALGORITHM: '#96ceb4',
      DATA_STRUCTURE: '#ffeead',
      BEST_PRACTICE: '#d4a5a5',
    },
  },
  features: {
    enableCodeCompletion: true,
    enableErrorCorrection: true,
    enableKnowledgeGraph: true,
    enableLearningPaths: true,
    enableTutorials: true,
  },
} as const; 