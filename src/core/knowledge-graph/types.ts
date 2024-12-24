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

export enum ConceptType {
  Language = 'LANGUAGE',
  Framework = 'FRAMEWORK',
  Pattern = 'PATTERN',
  Algorithm = 'ALGORITHM',
  DataStructure = 'DATA_STRUCTURE',
  BestPractice = 'BEST_PRACTICE'
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  effectiveness: number;
  difficulty: number;
}

export enum ResourceType {
  Documentation = 'DOCUMENTATION',
  Tutorial = 'TUTORIAL',
  Video = 'VIDEO',
  Article = 'ARTICLE',
  Exercise = 'EXERCISE'
}

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  explanation: string;
  language: string;
  tags: string[];
}

export interface UserKnowledge {
  userId: string;
  conceptId: string;
  proficiency: number;
  lastPracticed: Date;
  exercises: ExerciseAttempt[];
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  completed: boolean;
  score: number;
  timestamp: Date;
  feedback: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  concepts: string[];
  currentIndex: number;
  progress: number;
  created: Date;
  updated: Date;
} 