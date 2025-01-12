import { driver, auth } from 'neo4j-driver';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uri = 'bolt://localhost:7687';
const username = 'neo4j';
const password = 'poiuytr098';

function parseStatements(content: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';
  let escaped = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (escaped) {
      currentStatement += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      currentStatement += char;
      escaped = true;
      continue;
    }

    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      stringChar = char;
      currentStatement += char;
      continue;
    }

    if (char === stringChar && inString) {
      inString = false;
      currentStatement += char;
      continue;
    }

    if (char === ';' && !inString) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
      continue;
    }

    currentStatement += char;
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements.filter(s => !s.startsWith('//'));
}

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  console.log('Creating Neo4j driver...');
  const neo4jDriver = driver(uri, auth.basic(username, password));
  const session = neo4jDriver.session();

  try {
    console.log('Testing connection...');
    await session.run('RETURN 1');
    console.log('Successfully connected to Neo4j');

    console.log('Reading schema file...');
    const schemaPath = resolve(__dirname, '../src/core/knowledge-graph/schema.cypher');
    const schemaContent = readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema...');
    const statements = parseStatements(schemaContent);

    for (const statement of statements) {
      try {
        console.log('Executing statement:', statement.substring(0, 100) + '...');
        await session.run(statement);
        console.log('Statement executed successfully');
      } catch (error) {
        console.error('Error executing statement:', statement);
        throw error;
      }
    }

    console.log('Schema executed successfully');

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
        query: 'MATCH ()-[r]->() RETURN count(r) as count',
        name: 'Relationships'
      }
    ];

    console.log('\nVerifying initialization...');
    for (const { query, name } of verificationQueries) {
      const result = await session.run(query);
      console.log(`${name} count:`, result.records[0].get('count').toNumber());
    }

  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  } finally {
    await session.close();
    await neo4jDriver.close();
  }
}

initializeDatabase(); 