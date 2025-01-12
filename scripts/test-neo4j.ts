import { Neo4jService } from '../src/core/services/neo4j.service.js';
import { config } from '../src/config.js';

async function testKnowledgeGraph() {
  console.log('Testing Knowledge Graph functionality...');
  
  const neo4jService = new Neo4jService(
    config.neo4j.uri,
    config.neo4j.username,
    config.neo4j.password
  );

  try {
    // Test connection
    console.log('\nTesting connection...');
    const connected = await neo4jService.verifyConnection();
    console.log('Connection status:', connected ? 'Connected' : 'Failed');

    // Get all graph data
    console.log('\nFetching graph data...');
    const graphData = await neo4jService.getGraphData();
    console.log('Found nodes:', graphData.nodes.length);
    console.log('Found relationships:', graphData.relationships.length);

    // Get specific concept
    console.log('\nFetching React concept...');
    const reactConcept = await neo4jService.getConceptById('concept-react');
    console.log('React concept:', JSON.stringify(reactConcept, null, 2));

    // Get related concepts
    console.log('\nFetching concepts related to React...');
    const relatedConcepts = await neo4jService.getRelatedConcepts('concept-react');
    console.log('Related concepts:', JSON.stringify(relatedConcepts, null, 2));

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await neo4jService.close();
  }
}

testKnowledgeGraph(); 