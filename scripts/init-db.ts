import fs from 'fs';
import path from 'path';
import neo4j from 'neo4j-driver';
import { config } from '../src/config.js';

async function initializeDatabase() {
  const driver = neo4j.driver(
    config.neo4j.uri,
    neo4j.auth.basic(config.neo4j.username, config.neo4j.password)
  );

  const session = driver.session();

  try {
    console.log('Connecting to Neo4j database...');
    await session.run('RETURN 1');
    console.log('Successfully connected to Neo4j');

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '../src/core/knowledge-graph/schema.cypher');
    const schemaScript = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema initialization...');
    const statements = schemaScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await session.run(statement);
        console.log('Executed:', statement.slice(0, 50) + '...');
      } catch (error) {
        console.error('Error executing statement:', statement);
        console.error('Error details:', error);
      }
    }

    console.log('Database initialization completed successfully');

    // Verify the initialization
    const verificationQueries = [
      {
        query: 'MATCH (c:Concept) RETURN count(c) as count',
        name: 'Concepts'
      },
      {
        query: 'MATCH (e:Example) RETURN count(e) as count',
        name: 'Examples'
      },
      {
        query: 'MATCH (r:Resource) RETURN count(r) as count',
        name: 'Resources'
      },
      {
        query: 'MATCH ()-[r:REQUIRES]->() RETURN count(r) as count',
        name: 'Relationships'
      }
    ];

    console.log('\nVerifying initialization:');
    for (const { query, name } of verificationQueries) {
      const result = await session.run(query);
      const count = result.records[0].get('count').toNumber();
      console.log(`${name}: ${count}`);
    }

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

// Run the initialization
initializeDatabase().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 