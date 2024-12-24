import neo4j, { Driver, Session } from 'neo4j-driver';
import { Concept, Resource, UserKnowledge, LearningPath } from '../knowledge-graph/types';

export class Neo4jService {
  private driver: Driver;

  constructor(uri: string, username: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const session = this.driver.session();
      await session.run('RETURN 1');
      session.close();
      return true;
    } catch (error) {
      console.error('Neo4j connection error:', error);
      return false;
    }
  }

  async addConcept(concept: Concept): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        CREATE (c:Concept {
          id: $id,
          name: $name,
          description: $description,
          type: $type,
          difficulty: $difficulty
        })
        `,
        concept
      );

      // Create relationships for prerequisites and related concepts
      for (const prereqId of concept.prerequisites) {
        await session.run(
          `
          MATCH (c:Concept {id: $conceptId}), (p:Concept {id: $prereqId})
          CREATE (p)-[:PREREQUISITE_FOR]->(c)
          `,
          { conceptId: concept.id, prereqId }
        );
      }
    } finally {
      session.close();
    }
  }

  async getUserKnowledgeState(userId: string): Promise<UserKnowledge[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[k:KNOWS]->(c:Concept)
        RETURN c.id as conceptId, k.proficiency as proficiency, k.lastPracticed as lastPracticed
        `,
        { userId }
      );
      return result.records.map(record => ({
        userId,
        conceptId: record.get('conceptId'),
        proficiency: record.get('proficiency'),
        lastPracticed: new Date(record.get('lastPracticed')),
        exercises: []
      }));
    } finally {
      session.close();
    }
  }

  async generateLearningPath(userId: string, goalConceptId: string): Promise<LearningPath> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (start:Concept {id: $goalConceptId})
        CALL apoc.path.spanningTree(start, {
          relationshipFilter: "PREREQUISITE_FOR",
          minLevel: 1,
          maxLevel: 5
        })
        YIELD path
        RETURN path
        `,
        { goalConceptId }
      );

      const concepts = result.records
        .map(record => record.get('path').segments)
        .flat()
        .map(segment => segment.start.properties.id)
        .reverse();

      return {
        id: `path-${Date.now()}`,
        userId,
        concepts,
        currentIndex: 0,
        progress: 0,
        created: new Date(),
        updated: new Date()
      };
    } finally {
      session.close();
    }
  }

  async updateUserKnowledge(knowledge: UserKnowledge): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (u:User {id: $userId}), (c:Concept {id: $conceptId})
        MERGE (u)-[k:KNOWS]->(c)
        SET k.proficiency = $proficiency,
            k.lastPracticed = $lastPracticed
        `,
        {
          userId: knowledge.userId,
          conceptId: knowledge.conceptId,
          proficiency: knowledge.proficiency,
          lastPracticed: knowledge.lastPracticed.toISOString()
        }
      );
    } finally {
      session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
} 