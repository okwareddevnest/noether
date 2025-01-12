'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Neo4jService } from '../services/neo4j.service';
import { config } from '@/config';

interface Neo4jContextType {
  neo4jService: Neo4jService | null;
  loading: boolean;
  error: Error | null;
}

const Neo4jContext = createContext<Neo4jContextType>({
  neo4jService: null,
  loading: true,
  error: null,
});

export function useNeo4j() {
  return useContext(Neo4jContext);
}

export function Neo4jProvider({ children }: { children: React.ReactNode }) {
  const [neo4jService, setNeo4jService] = useState<Neo4jService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initNeo4j = async () => {
      try {
        const service = new Neo4jService(
          config.neo4j.uri,
          config.neo4j.username,
          config.neo4j.password
        );

        // Verify connection
        const connected = await service.verifyConnection();
        if (!connected) {
          throw new Error('Failed to connect to Neo4j database');
        }

        setNeo4jService(service);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Neo4j service'));
      } finally {
        setLoading(false);
      }
    };

    initNeo4j();

    return () => {
      if (neo4jService) {
        neo4jService.close();
      }
    };
  }, []);

  return (
    <Neo4jContext.Provider value={{ neo4jService, loading, error }}>
      {children}
    </Neo4jContext.Provider>
  );
} 