'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Neo4jService } from '@/core/services/neo4j.service';
import { config } from '@/config';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-neutral-400">Loading graph visualization...</div>
    </div>
  ),
});

interface KnowledgeGraphProps {
  neo4jService: Neo4jService;
  onConceptSelect?: (conceptId: string) => void;
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export default function KnowledgeGraph({
  neo4jService,
  onConceptSelect,
}: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  const loadGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await neo4jService.getGraphData();
      const formattedData = {
        nodes: data.nodes.map((node: any) => ({
          ...node,
          val: calculateNodeValue(node),
          color: getNodeColor(node.type),
        })),
        links: data.relationships,
      };
      setGraphData(formattedData);
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setLoading(false);
    }
  }, [neo4jService]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const calculateNodeValue = (node: any) => {
    const baseSize = config.graph.defaultNodeSize;
    const difficultyFactor = node.difficulty ? node.difficulty / 5 : 1;
    return baseSize * difficultyFactor;
  };

  const getNodeColor = (type: string) => {
    return config.graph.colors[type as keyof typeof config.graph.colors] || '#808080';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">Loading knowledge graph...</div>
      </div>
    );
  }

  return (
    <div className="graph-container h-full">
      <ForceGraph3D
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeVal="val"
        linkWidth={config.graph.defaultEdgeWidth}
        linkColor={() => '#404040'}
        backgroundColor="#1a1a1a"
        onNodeClick={(node: any) => onConceptSelect?.(node.id)}
      />
    </div>
  );
} 