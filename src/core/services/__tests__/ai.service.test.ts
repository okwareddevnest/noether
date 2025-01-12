import { AIService } from '../ai.service';
import { Neo4jService } from '../neo4j.service';
import { config } from '../../../config';

jest.mock('@hypermode/modus-sdk-as');

describe('AIService', () => {
  let aiService: AIService;
  let neo4jService: Neo4jService;

  beforeAll(() => {
    neo4jService = new Neo4jService(
      config.neo4j.uri,
      config.neo4j.username,
      config.neo4j.password
    );
    aiService = new AIService(config.modus.apiKey, neo4jService);
  });

  afterAll(async () => {
    await neo4jService.close();
  });

  describe('Code Analysis', () => {
    const testCode = `
      function fibonacci(n: number): number {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
    `;

    it('should analyze code and return structured results', async () => {
      const analysis = await aiService.analyzeCode(testCode, 'typescript');

      expect(analysis).toBeDefined();
      expect(analysis.quality).toBeGreaterThanOrEqual(0);
      expect(analysis.quality).toBeLessThanOrEqual(10);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
      expect(Array.isArray(analysis.concepts)).toBe(true);
      expect(Array.isArray(analysis.potentialIssues)).toBe(true);
    });

    it('should identify relevant concepts', async () => {
      const analysis = await aiService.analyzeCode(testCode, 'typescript');

      expect(analysis.concepts).toContain('Recursion');
      expect(analysis.concepts).toContain('Dynamic Programming');
    });

    it('should suggest improvements', async () => {
      const analysis = await aiService.analyzeCode(testCode, 'typescript');

      expect(analysis.suggestions.length).toBeGreaterThan(0);
      expect(analysis.suggestions[0]).toContain('memoization');
    });

    it('should identify potential issues', async () => {
      const analysis = await aiService.analyzeCode(testCode, 'typescript');

      expect(analysis.potentialIssues.length).toBeGreaterThan(0);
      expect(analysis.potentialIssues[0]).toContain('stack overflow');
    });
  });

  describe('Code Completion', () => {
    const testCode = `
      function calculateArea(
    `;

    it('should provide relevant code completions', async () => {
      const completion = await aiService.getCodeCompletion(testCode, testCode.length);

      expect(completion).toContain('radius');
      expect(completion).toContain('number');
      expect(completion).toContain('return');
    });

    it('should respect the language context', async () => {
      const tsCode = 'interface Shape { ';
      const completion = await aiService.getCodeCompletion(tsCode, tsCode.length);

      expect(completion).toContain('area');
      expect(completion).toContain('perimeter');
    });
  });

  describe('Code Explanation', () => {
    const testCode = `
      const memoizedFib = (n: number, memo: Record<number, number> = {}): number => {
        if (n in memo) return memo[n];
        if (n <= 1) return n;
        memo[n] = memoizedFib(n - 1, memo) + memoizedFib(n - 2, memo);
        return memo[n];
      };
    `;

    it('should provide clear explanations', async () => {
      const explanation = await aiService.getCodeExplanation(testCode);

      expect(explanation).toContain('memoization');
      expect(explanation).toContain('fibonacci');
      expect(explanation).toContain('optimization');
    });

    it('should identify key concepts in the explanation', async () => {
      const explanation = await aiService.getCodeExplanation(testCode);

      expect(explanation).toContain('dynamic programming');
      expect(explanation).toContain('cache');
      expect(explanation).toContain('recursive');
    });
  });

  // Mock implementations
  beforeEach(() => {
    const ModusClient = require('@hypermode/modus-sdk-as').ModusClient;
    ModusClient.prototype.analyze.mockResolvedValue({
      quality: 7,
      suggestions: ['Consider using memoization to improve performance'],
      concepts: ['Recursion', 'Dynamic Programming'],
      potentialIssues: ['Potential stack overflow for large inputs'],
      complexity: 0.7,
      maintainability: 0.8,
      readability: 0.6,
      bestPractices: 0.7
    });

    ModusClient.prototype.complete.mockResolvedValue({
      text: 'radius: number): number {\n  return Math.PI * radius * radius;\n}'
    });

    ModusClient.prototype.explain.mockResolvedValue({
      text: 'This code implements a memoized version of the fibonacci sequence using dynamic programming. It uses a cache (memo object) to store previously calculated values, which helps optimize the recursive solution by avoiding redundant calculations.'
    });
  });
}); 