'use client';

import React, { useEffect, useState } from 'react';
import { useNeo4j } from '@/core/contexts/neo4j-context';

interface LearningPath {
  id: string;
  userId: string;
  concepts: string[];
  currentIndex: number;
  progress: number;
  created: Date;
  updated: Date;
}

export default function LearningPaths() {
  const { neo4jService, loading: serviceLoading, error: serviceError } = useNeo4j();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLearningPaths = async () => {
      if (!neo4jService) return;

      try {
        setLoading(true);
        // For demo purposes, using a hardcoded user ID
        const userPaths = await neo4jService.getUserLearningPaths('demo-user');
        setPaths(userPaths);
        setError(null);
      } catch (err) {
        console.error('Error loading learning paths:', err);
        setError(err instanceof Error ? err : new Error('Failed to load learning paths'));
      } finally {
        setLoading(false);
      }
    };

    loadLearningPaths();
  }, [neo4jService]);

  if (serviceLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">Loading learning paths...</div>
      </div>
    );
  }

  if (serviceError || error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">
          Error: {(serviceError || error)?.message}
        </div>
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg text-neutral-300">Your Learning Paths</h3>
        <p className="text-neutral-400">You haven't started any learning paths yet.</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {/* TODO: Implement create learning path */}}
        >
          Create Learning Path
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-neutral-300">Your Learning Paths</h3>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {/* TODO: Implement create learning path */}}
        >
          Create New Path
        </button>
      </div>

      <div className="grid gap-4">
        {paths.map((path) => (
          <div
            key={path.id}
            className="p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-neutral-200">Learning Path {path.id}</h4>
              <span className="text-sm text-neutral-400">
                Progress: {path.progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${path.progress}%` }}
              />
            </div>
            <div className="mt-4 text-sm text-neutral-400">
              {path.concepts.length} concepts • Started{' '}
              {new Date(path.created).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 