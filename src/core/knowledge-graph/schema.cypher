// Create constraints
CREATE CONSTRAINT concept_id IF NOT EXISTS
FOR (c:Concept) REQUIRE c.id IS UNIQUE;

CREATE CONSTRAINT user_id IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT learning_path_id IF NOT EXISTS
FOR (p:LearningPath) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT example_id IF NOT EXISTS
FOR (e:Example) REQUIRE e.id IS UNIQUE;

CREATE CONSTRAINT resource_id IF NOT EXISTS
FOR (r:Resource) REQUIRE r.id IS UNIQUE;

// Create indexes
CREATE INDEX concept_name IF NOT EXISTS
FOR (c:Concept) ON (c.name);

CREATE INDEX concept_type IF NOT EXISTS
FOR (c:Concept) ON (c.type);

CREATE INDEX example_language IF NOT EXISTS
FOR (e:Example) ON (e.language);

CREATE INDEX resource_type IF NOT EXISTS
FOR (r:Resource) ON (r.type);

// Create initial concept types
MERGE (l:ConceptType {name: 'LANGUAGE'})
MERGE (f:ConceptType {name: 'FRAMEWORK'})
MERGE (p:ConceptType {name: 'PATTERN'})
MERGE (a:ConceptType {name: 'ALGORITHM'})
MERGE (d:ConceptType {name: 'DATA_STRUCTURE'})
MERGE (b:ConceptType {name: 'BEST_PRACTICE'});

// Create initial resource types
MERGE (doc:ResourceType {name: 'DOCUMENTATION'})
MERGE (tut:ResourceType {name: 'TUTORIAL'})
MERGE (vid:ResourceType {name: 'VIDEO'})
MERGE (art:ResourceType {name: 'ARTICLE'})
MERGE (ex:ResourceType {name: 'EXERCISE'});

// Create relationship types
MERGE (r1:RelationType {name: 'REQUIRES'})
MERGE (r2:RelationType {name: 'SIMILAR_TO'})
MERGE (r3:RelationType {name: 'IMPLEMENTS'})
MERGE (r4:RelationType {name: 'USES'})
MERGE (r5:RelationType {name: 'EXTENDS'});

// Create initial seed data for testing
CREATE (js:Concept {
  id: 'concept-javascript',
  name: 'JavaScript',
  description: 'A high-level, interpreted programming language that conforms to the ECMAScript specification.',
  type: 'LANGUAGE',
  difficulty: 1
});

CREATE (ts:Concept {
  id: 'concept-typescript',
  name: 'TypeScript',
  description: 'A strict syntactical superset of JavaScript that adds optional static typing.',
  type: 'LANGUAGE',
  difficulty: 2
});

CREATE (react:Concept {
  id: 'concept-react',
  name: 'React',
  description: 'A JavaScript library for building user interfaces.',
  type: 'FRAMEWORK',
  difficulty: 3
});

CREATE (hooks:Concept {
  id: 'concept-react-hooks',
  name: 'React Hooks',
  description: 'Functions that allow you to "hook into" React state and lifecycle features from function components.',
  type: 'PATTERN',
  difficulty: 4
});

// Create relationships
CREATE (ts)-[:REQUIRES]->(js)
CREATE (react)-[:REQUIRES]->(js)
CREATE (hooks)-[:REQUIRES]->(react)
CREATE (hooks)-[:USES]->(ts);

// Create example
CREATE (e:Example {
  id: 'example-react-hooks-1',
  code: 'import React, { useState, useEffect } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `Count: ${count}`;\n  }, [count]);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}',
  explanation: 'A simple counter component demonstrating useState and useEffect hooks.',
  language: 'typescript'
});

// Link example to concept
CREATE (hooks)-[:HAS_EXAMPLE]->(e);

// Create resource
CREATE (r:Resource {
  id: 'resource-react-hooks-1',
  title: 'Introduction to React Hooks',
  url: 'https://reactjs.org/docs/hooks-intro.html',
  type: 'DOCUMENTATION',
  difficulty: 2
});

// Link resource to concept
CREATE (hooks)-[:HAS_RESOURCE]->(r); 