import { Neo4jService } from '../neo4j.service';
import { config } from '../../../config';
import { Concept, CodeExample, Resource } from '../../knowledge-graph/types';

describe('Neo4jService', () => {
  let neo4jService: Neo4jService;

  beforeAll(async () => {
    neo4jService = new Neo4jService(
      config.neo4j.uri,
      config.neo4j.username,
      config.neo4j.password
    );
  });

  afterAll(async () => {
    await neo4jService.close();
  });

  describe('Connection', () => {
    it('should successfully connect to the database', async () => {
      const isConnected = await neo4jService.verifyConnection();
      expect(isConnected).toBe(true);
    });
  });

  describe('Concepts', () => {
    let testConcept: Concept;

    beforeEach(async () => {
      testConcept = {
        id: `test-concept-${Date.now()}`,
        name: 'Test Concept',
        description: 'A test concept for unit testing',
        type: 'PATTERN',
        difficulty: 2,
        prerequisites: [],
        relatedConcepts: [],
        resources: [],
        examples: []
      };
    });

    it('should add a new concept', async () => {
      await neo4jService.addConcept(testConcept);
      const concept = await neo4jService.getConceptById(testConcept.id);
      expect(concept).toBeTruthy();
      expect(concept?.name).toBe(testConcept.name);
    });

    it('should get related concepts', async () => {
      const relatedConcept: Concept = {
        ...testConcept,
        id: `related-${testConcept.id}`,
        name: 'Related Concept'
      };

      await neo4jService.addConcept(testConcept);
      await neo4jService.addConcept(relatedConcept);

      // Add relationship
      await neo4jService.addRelationship({
        source: testConcept.id,
        target: relatedConcept.id,
        type: 'REQUIRES'
      });

      const related = await neo4jService.getRelatedConcepts(testConcept.id);
      expect(related).toHaveLength(1);
      expect(related[0].id).toBe(relatedConcept.id);
    });
  });

  describe('Learning Paths', () => {
    const userId = `test-user-${Date.now()}`;
    let concepts: string[];

    beforeEach(async () => {
      // Create test concepts
      concepts = await Promise.all([
        neo4jService.addConcept({
          id: `path-concept-1-${Date.now()}`,
          name: 'Concept 1',
          description: 'First concept',
          type: 'PATTERN',
          difficulty: 1,
          prerequisites: [],
          relatedConcepts: [],
          resources: [],
          examples: []
        }),
        neo4jService.addConcept({
          id: `path-concept-2-${Date.now()}`,
          name: 'Concept 2',
          description: 'Second concept',
          type: 'PATTERN',
          difficulty: 2,
          prerequisites: [],
          relatedConcepts: [],
          resources: [],
          examples: []
        })
      ]).then(results => results.map(r => r.id));
    });

    it('should create a learning path', async () => {
      const path = await neo4jService.createLearningPath(userId, concepts);
      expect(path).toBeTruthy();
      expect(path.concepts).toHaveLength(2);
      expect(path.progress).toBe(0);
    });

    it('should update learning path progress', async () => {
      const path = await neo4jService.createLearningPath(userId, concepts);
      const updatedPath = {
        ...path,
        currentIndex: 1,
        progress: 50
      };

      await neo4jService.updateLearningPath(updatedPath);
      const paths = await neo4jService.getUserLearningPaths(userId);
      const retrievedPath = paths.find(p => p.id === path.id);

      expect(retrievedPath).toBeTruthy();
      expect(retrievedPath?.progress).toBe(50);
      expect(retrievedPath?.currentIndex).toBe(1);
    });
  });

  describe('User Knowledge', () => {
    const userId = `test-user-${Date.now()}`;
    let conceptId: string;

    beforeEach(async () => {
      const concept = await neo4jService.addConcept({
        id: `knowledge-concept-${Date.now()}`,
        name: 'Test Concept',
        description: 'A concept for testing knowledge',
        type: 'PATTERN',
        difficulty: 1,
        prerequisites: [],
        relatedConcepts: [],
        resources: [],
        examples: []
      });
      conceptId = concept.id;
    });

    it('should update user knowledge', async () => {
      const knowledge = {
        userId,
        conceptId,
        proficiency: 7,
        lastPracticed: new Date(),
        exercises: []
      };

      await neo4jService.updateUserKnowledge(knowledge);
      const userKnowledge = await neo4jService.getUserKnowledge(userId);

      expect(userKnowledge).toHaveLength(1);
      expect(userKnowledge[0].proficiency).toBe(7);
      expect(userKnowledge[0].conceptId).toBe(conceptId);
    });

    it('should suggest next concepts based on proficiency', async () => {
      // Create additional concepts with prerequisites
      const advancedConcept = await neo4jService.addConcept({
        id: `advanced-concept-${Date.now()}`,
        name: 'Advanced Concept',
        description: 'An advanced concept',
        type: 'PATTERN',
        difficulty: 3,
        prerequisites: [conceptId],
        relatedConcepts: [],
        resources: [],
        examples: []
      });

      // Update user knowledge for the prerequisite concept
      await neo4jService.updateUserKnowledge({
        userId,
        conceptId,
        proficiency: 8,
        lastPracticed: new Date(),
        exercises: []
      });

      const suggestions = await neo4jService.suggestNextConcepts(userId);
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].id).toBe(advancedConcept.id);
    });
  });
}); 