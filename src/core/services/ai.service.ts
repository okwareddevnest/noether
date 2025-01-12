import { ModusClient } from '@hypermode/modus-sdk-as';
import { Neo4jService } from './neo4j.service';

interface CodeAnalysis {
  quality: number;
  suggestions: string[];
  concepts: string[];
  potentialIssues: string[];
}

export class AIService {
  private modusClient: ModusClient;
  private neo4jService: Neo4jService;

  constructor(modusApiKey: string, neo4jService: Neo4jService) {
    this.modusClient = new ModusClient(modusApiKey);
    this.neo4jService = neo4jService;
  }

  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    try {
      // Get relevant concepts from Neo4j for context
      const graphContext = await this.getGraphContext();

      // Analyze code using Llama 3.1 through Modus
      const analysis = await this.modusClient.analyze({
        code,
        language,
        context: graphContext,
        model: 'llama-3.1',
        options: {
          temperature: 0.3,
          max_tokens: 1000
        }
      });

      // Extract and structure the analysis results
      const result: CodeAnalysis = {
        quality: this.calculateCodeQuality(analysis),
        suggestions: this.extractSuggestions(analysis),
        concepts: this.extractConcepts(analysis),
        potentialIssues: this.extractIssues(analysis)
      };

      // Update knowledge graph with new insights
      await this.updateKnowledgeGraph(result.concepts, code);

      return result;
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw error;
    }
  }

  private async getGraphContext(): Promise<string> {
    const graphData = await this.neo4jService.getGraphData();
    return JSON.stringify({
      nodes: graphData.nodes,
      relationships: graphData.relationships
    });
  }

  private calculateCodeQuality(analysis: any): number {
    // Implement quality scoring based on various metrics
    const metrics = {
      complexity: analysis.complexity || 0,
      maintainability: analysis.maintainability || 0,
      readability: analysis.readability || 0,
      bestPractices: analysis.bestPractices || 0
    };

    return Math.round(
      (metrics.complexity + metrics.maintainability + metrics.readability + metrics.bestPractices) / 4 * 10
    );
  }

  private extractSuggestions(analysis: any): string[] {
    return analysis.suggestions || [];
  }

  private extractConcepts(analysis: any): string[] {
    return analysis.concepts || [];
  }

  private extractIssues(analysis: any): string[] {
    return analysis.issues || [];
  }

  private async updateKnowledgeGraph(concepts: string[], code: string): Promise<void> {
    for (const concept of concepts) {
      // Add new concepts to the knowledge graph
      await this.neo4jService.addConcept({
        id: `concept-${Date.now()}-${concept.toLowerCase().replace(/\s+/g, '-')}`,
        name: concept,
        description: '', // Will be populated by another AI call
        type: 'PATTERN',
        difficulty: 1,
        prerequisites: [],
        relatedConcepts: [],
        resources: [],
        examples: [{
          id: `example-${Date.now()}`,
          code,
          explanation: '', // Will be populated by another AI call
          language: 'typescript'
        }]
      });
    }
  }

  async getCodeCompletion(code: string, position: number): Promise<string> {
    try {
      const completion = await this.modusClient.complete({
        code,
        position,
        model: 'llama-3.1',
        options: {
          temperature: 0.3,
          max_tokens: 100
        }
      });

      return completion.text;
    } catch (error) {
      console.error('Error getting code completion:', error);
      throw error;
    }
  }

  async getCodeExplanation(code: string): Promise<string> {
    try {
      const explanation = await this.modusClient.explain({
        code,
        model: 'llama-3.1',
        options: {
          temperature: 0.5,
          max_tokens: 500
        }
      });

      return explanation.text;
    } catch (error) {
      console.error('Error getting code explanation:', error);
      throw error;
    }
  }
} 