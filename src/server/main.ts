import express from 'express';
import cors from 'cors';
import { config } from '../config';
import { Neo4jService } from '../core/services/neo4j.service';
import { AIService } from '../core/services/ai.service';

// Initialize services
const neo4jService = new Neo4jService(
  config.neo4j.uri,
  config.neo4j.username,
  config.neo4j.password
);

const aiService = new AIService(config.modus.apiKey, neo4jService);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Code analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    const analysis = await aiService.analyzeCode(code, language);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// Code completion endpoint
app.post('/api/complete', async (req, res) => {
  try {
    const { code, position } = req.body;
    const completion = await aiService.getCodeCompletion(code, position);
    res.json({ completion });
  } catch (error) {
    console.error('Error getting code completion:', error);
    res.status(500).json({ error: 'Failed to get code completion' });
  }
});

// Knowledge graph endpoints
app.get('/api/graph', async (req, res) => {
  try {
    const graphData = await neo4jService.getGraphData();
    res.json(graphData);
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
});

app.get('/api/concepts/:id', async (req, res) => {
  try {
    const relatedConcepts = await neo4jService.getRelatedConcepts(req.params.id);
    res.json(relatedConcepts);
  } catch (error) {
    console.error('Error fetching related concepts:', error);
    res.status(500).json({ error: 'Failed to fetch related concepts' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = config.app.port;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${config.app.env}`);
}); 