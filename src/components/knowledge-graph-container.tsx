'use client';

import { useEffect, useState } from 'react';
import { Neo4jService } from '@/core/services/neo4j.service';
import { config } from '@/config';
import KnowledgeGraph from './knowledge-graph';

export default function KnowledgeGraphContainer() {
  const [neo4jService, setNeo4jService] = useState<Neo4jService | null>(null);

  useEffect(() => {
    const service = new Neo4jService(
      config.neo4j.uri,
      config.neo4j.username,
      config.neo4j.password
    );
    setNeo4jService(service);

    return () => {
      service.close();
    };
  }, []);

  if (!neo4jService) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">Connecting to knowledge graph...</div>
      </div>
    );
  }

  return <KnowledgeGraph neo4jService={neo4jService} />;
} 