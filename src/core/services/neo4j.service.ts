import { driver as neo4jDriver, auth, Driver, Session, QueryResult } from 'neo4j-driver';
import { Concept, CodeExample, Relationship } from '../knowledge-graph/types.js';

export class Neo4jService {
  private driver: Driver;

  constructor(uri: string, username: string, password: string) {
    this.driver = neo4jDriver(uri, auth.basic(username, password));
  }

  async verifyConnection(): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.run('RETURN 1');
      return true;
    } catch (error) {
      console.error('Neo4j connection error:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  async executeQuery(query: string, params: Record<string, any> = {}): Promise<QueryResult> {
    const session = this.driver.session();
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
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

      // Add relationships to prerequisites
      for (const prereq of concept.prerequisites) {
        await session.run(
          `
          MATCH (c:Concept {id: $conceptId})
          MATCH (p:Concept {id: $prereqId})
          CREATE (c)-[:REQUIRES]->(p)
          `,
          { conceptId: concept.id, prereqId: prereq }
        );
      }
    } finally {
      await session.close();
    }
  }

  async getGraphData(): Promise<{ nodes: any[], relationships: any[] }> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (n:Concept)
        OPTIONAL MATCH (n)-[r]->(m:Concept)
        RETURN collect(distinct n) as nodes, collect(distinct r) as relationships
        `
      );
      
      const record = result.records[0];
      const nodes = record.get('nodes').map((node: any) => node.properties);
      const relationships = record.get('relationships').map((rel: any) => ({
        startNode: rel.startNodeElementId,
        endNode: rel.endNodeElementId,
        type: rel.type
      }));

      return { nodes, relationships };
    } finally {
      await session.close();
    }
  }

  async addCodeExample(conceptId: string, example: CodeExample): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (c:Concept {id: $conceptId})
        CREATE (e:Example {
          id: $exampleId,
          code: $code,
          explanation: $explanation,
          language: $language
        })
        CREATE (c)-[:HAS_EXAMPLE]->(e)
        `,
        {
          conceptId,
          exampleId: example.id,
          code: example.code,
          explanation: example.explanation,
          language: example.language
        }
      );
    } finally {
      await session.close();
    }
  }

  async getRelatedConcepts(conceptId: string): Promise<Concept[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (c:Concept {id: $conceptId})-[r]-(related:Concept)
        RETURN related
        `,
        { conceptId }
      );
      
      return result.records.map(record => record.get('related').properties as Concept);
    } finally {
      await session.close();
    }
  }

  async getConceptById(conceptId: string): Promise<Concept | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (c:Concept {id: $conceptId})
        OPTIONAL MATCH (c)-[:HAS_EXAMPLE]->(e:Example)
        OPTIONAL MATCH (c)-[:HAS_RESOURCE]->(r:Resource)
        RETURN c, collect(distinct e) as examples, collect(distinct r) as resources
        `,
        { conceptId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const concept = record.get('c').properties as Concept;
      concept.examples = record.get('examples').map((e: any) => e.properties);
      concept.resources = record.get('resources').map((r: any) => r.properties);

      return concept;
    } finally {
      await session.close();
    }
  }

  async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS_PATH]->(p:LearningPath)
        OPTIONAL MATCH (p)-[:INCLUDES]->(c:Concept)
        RETURN p, collect(c.id) as concepts
        ORDER BY p.created DESC
        `,
        { userId }
      );

      return result.records.map(record => {
        const path = record.get('p').properties as LearningPath;
        path.concepts = record.get('concepts');
        return path;
      });
    } finally {
      await session.close();
    }
  }

  async updateLearningPath(path: LearningPath): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (p:LearningPath {id: $pathId})
        SET p.currentIndex = $currentIndex,
            p.progress = $progress,
            p.updated = $updated
        `,
        {
          pathId: path.id,
          currentIndex: path.currentIndex,
          progress: path.progress,
          updated: new Date().toISOString()
        }
      );
    } finally {
      await session.close();
    }
  }

  async createLearningPath(userId: string, concepts: string[]): Promise<LearningPath> {
    const session = this.driver.session();
    try {
      const pathId = `path-${Date.now()}`;
      const now = new Date().toISOString();

      await session.run(
        `
        MATCH (u:User {id: $userId})
        CREATE (p:LearningPath {
          id: $pathId,
          currentIndex: 0,
          progress: 0,
          created: $created,
          updated: $updated
        })
        CREATE (u)-[:HAS_PATH]->(p)
        WITH p
        UNWIND $concepts as conceptId
        MATCH (c:Concept {id: conceptId})
        CREATE (p)-[:INCLUDES]->(c)
        `,
        {
          userId,
          pathId,
          concepts,
          created: now,
          updated: now
        }
      );

      return {
        id: pathId,
        userId,
        concepts,
        currentIndex: 0,
        progress: 0,
        created: new Date(now),
        updated: new Date(now)
      };
    } finally {
      await session.close();
    }
  }

  async getUserKnowledge(userId: string): Promise<UserKnowledge[]> {
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
      await session.close();
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
      await session.close();
    }
  }

  async suggestNextConcepts(userId: string, count: number = 5): Promise<Concept[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[k:KNOWS]->(known:Concept)
        MATCH (known)-[:REQUIRES]->(next:Concept)
        WHERE NOT (u)-[:KNOWS]->(next)
        WITH next, avg(k.proficiency) as avgProficiency
        ORDER BY avgProficiency DESC
        LIMIT $count
        RETURN next
        `,
        { userId, count }
      );

      return result.records.map(record => record.get('next').properties as Concept);
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
} 