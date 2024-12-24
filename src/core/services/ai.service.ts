import OpenAI from 'openai';
import { CodeExample, Concept, UserKnowledge } from '../knowledge-graph/types';

export class AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeCode(code: string, language: string): Promise<{
    quality: number;
    suggestions: string[];
    concepts: string[];
    potentialIssues: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a code analysis expert. Analyze the following ${language} code for quality, suggestions, related concepts, and potential issues. Provide a structured response.`
        },
        {
          role: 'user',
          content: code
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  async generateExercise(concept: Concept, userKnowledge: UserKnowledge): Promise<CodeExample> {
    const difficulty = this.calculateAppropriateExerciseDifficulty(userKnowledge);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Generate a coding exercise for the concept "${concept.name}" at difficulty level ${difficulty}. Include a clear problem statement, starter code, and explanation.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const exercise = JSON.parse(response.choices[0].message.content || '{}');
    return {
      id: `exercise-${Date.now()}`,
      title: exercise.title,
      code: exercise.code,
      explanation: exercise.explanation,
      language: exercise.language,
      tags: [concept.name, ...exercise.tags]
    };
  }

  async evaluateExerciseAttempt(
    exercise: CodeExample,
    attemptCode: string
  ): Promise<{
    score: number;
    feedback: string;
    improvements: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Evaluate the following code attempt for the given exercise. Provide a score, feedback, and suggested improvements.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            exercise,
            attempt: attemptCode
          })
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  async suggestLearningResources(
    concept: Concept,
    userKnowledge: UserKnowledge
  ): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Suggest learning resources for the concept "${concept.name}" based on the user's current proficiency level of ${userKnowledge.proficiency}.`
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  }

  private calculateAppropriateExerciseDifficulty(userKnowledge: UserKnowledge): number {
    // Implement adaptive difficulty scaling based on user's proficiency
    const baseDifficulty = 1;
    const proficiencyFactor = 0.5;
    return Math.min(
      Math.max(
        baseDifficulty + userKnowledge.proficiency * proficiencyFactor,
        1
      ),
      10
    );
  }
} 