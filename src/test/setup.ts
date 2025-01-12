import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import { config } from '../config';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(10000);

// Mock Neo4j driver
jest.mock('neo4j-driver', () => {
  const mockSession = {
    run: jest.fn(),
    close: jest.fn()
  };

  const mockDriver = {
    session: jest.fn(() => mockSession),
    close: jest.fn()
  };

  return {
    driver: jest.fn(() => mockDriver),
    auth: {
      basic: jest.fn()
    }
  };
});

// Mock Modus SDK
jest.mock('@hypermode/modus-sdk-as', () => {
  return {
    ModusClient: jest.fn().mockImplementation(() => ({
      analyze: jest.fn(),
      complete: jest.fn(),
      explain: jest.fn()
    }))
  };
});

// Global beforeAll hook
beforeAll(() => {
  // Set up any global test configuration
});

// Global afterAll hook
afterAll(() => {
  // Clean up any global test configuration
});

// Global beforeEach hook
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

// Test utilities
export const createMockConcept = (overrides = {}) => ({
  id: `test-concept-${Date.now()}`,
  name: 'Test Concept',
  description: 'A test concept',
  type: 'PATTERN',
  difficulty: 1,
  prerequisites: [],
  relatedConcepts: [],
  resources: [],
  examples: [],
  ...overrides
});

export const createMockExample = (overrides = {}) => ({
  id: `test-example-${Date.now()}`,
  code: 'console.log("Hello, World!");',
  explanation: 'A simple example',
  language: 'typescript',
  ...overrides
});

export const createMockResource = (overrides = {}) => ({
  id: `test-resource-${Date.now()}`,
  title: 'Test Resource',
  url: 'https://example.com',
  type: 'DOCUMENTATION',
  difficulty: 1,
  tags: [],
  ...overrides
});

export const createMockLearningPath = (overrides = {}) => ({
  id: `test-path-${Date.now()}`,
  userId: 'test-user',
  concepts: [],
  currentIndex: 0,
  progress: 0,
  created: new Date(),
  updated: new Date(),
  ...overrides
});

export const createMockUserKnowledge = (overrides = {}) => ({
  userId: 'test-user',
  conceptId: `test-concept-${Date.now()}`,
  proficiency: 5,
  lastPracticed: new Date(),
  exercises: [],
  ...overrides
});

// Mock Neo4j session results
export const mockNeo4jResult = (records: any[]) => ({
  records: records.map(record => ({
    get: (key: string) => record[key],
    toObject: () => record
  }))
});

// Helper to create Neo4j nodes
export const createMockNode = (properties: any) => ({
  properties,
  labels: [properties.type || 'Concept']
});

// Helper to create Neo4j relationships
export const createMockRelationship = (
  startNode: any,
  endNode: any,
  type: string,
  properties = {}
) => ({
  type,
  properties,
  startNode: createMockNode(startNode),
  endNode: createMockNode(endNode)
}); 