export interface Concept {
  id: string;
  name: string;
  description: string;
  type: ConceptType;
  difficulty: number;
  prerequisites: string[];
  relatedConcepts: string[];
  resources: Resource[];
  examples: CodeExample[];
}

export type ConceptType =
  | 'LANGUAGE'
  | 'FRAMEWORK'
  | 'PATTERN'
  | 'ALGORITHM'
  | 'DATA_STRUCTURE'
  | 'BEST_PRACTICE';

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  difficulty: number;
  tags: string[];
}

export type ResourceType =
  | 'ARTICLE'
  | 'VIDEO'
  | 'DOCUMENTATION'
  | 'TUTORIAL'
  | 'EXERCISE';

export interface CodeExample {
  id: string;
  code: string;
  explanation: string;
  language: string;
}

export interface Relationship {
  source: string;
  target: string;
  type: RelationshipType;
  weight?: number;
}

export type RelationshipType =
  | 'REQUIRES'
  | 'SIMILAR_TO'
  | 'IMPLEMENTS'
  | 'USES'
  | 'EXTENDS';

export interface LearningPath {
  id: string;
  userId: string;
  concepts: string[];
  currentIndex: number;
  progress: number;
  created: Date;
  updated: Date;
}

export interface UserKnowledge {
  userId: string;
  conceptId: string;
  proficiency: number;
  lastPracticed: Date;
  exercises: string[];
} 