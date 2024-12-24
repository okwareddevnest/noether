import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph';
import { Neo4jService } from '../../core/services/neo4j.service';
import { Concept } from '../../core/knowledge-graph/types';

interface KnowledgeGraphProps {
  neo4jService: Neo4jService;
  onConceptSelect?: (concept: Concept) => void;
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    val: number;
    color: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  neo4jService,
  onConceptSelect
}) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      // This would need to be implemented in the Neo4jService
      const result = await neo4jService.getGraphData();
      const nodes = result.nodes.map(node => ({
        id: node.id,
        name: node.name,
        val: calculateNodeValue(node),
        color: getNodeColor(node.type)
      }));

      const links = result.relationships.map(rel => ({
        source: rel.startNode,
        target: rel.endNode,
        type: rel.type
      }));

      setGraphData({ nodes, links });
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
  };

  const calculateNodeValue = (node: any) => {
    // Implement node size calculation based on importance, connections, etc.
    return 1 + (node.connections?.length || 0) * 0.5;
  };

  const getNodeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      LANGUAGE: '#ff6b6b',
      FRAMEWORK: '#4ecdc4',
      PATTERN: '#45b7d1',
      ALGORITHM: '#96ceb4',
      DATA_STRUCTURE: '#ffeead',
      BEST_PRACTICE: '#d4a5a5'
    };
    return colors[type] || '#666666';
  };

  return (
    <div className="knowledge-graph-container" style={{ height: '600px' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => (node.id === selectedNode ? '#ff0000' : node.color)}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={(node: any) => {
          setSelectedNode(node.id);
          onConceptSelect?.(node);
        }}
        onNodeHover={(node: any) => {
          if (node) {
            // Show tooltip or highlight connected nodes
          }
        }}
        linkWidth={2}
        linkColor={() => '#cccccc'}
        d3Force={('link', {
          distance: 100
        })}
        cooldownTicks={100}
        onEngineStop={() => {
          // Graph has finished initial rendering
        }}
      />
      <div className="graph-legend">
        <h4>Node Types</h4>
        {Object.entries({
          Language: '#ff6b6b',
          Framework: '#4ecdc4',
          Pattern: '#45b7d1',
          Algorithm: '#96ceb4',
          'Data Structure': '#ffeead',
          'Best Practice': '#d4a5a5'
        }).map(([type, color]) => (
          <div key={type} className="legend-item">
            <span
              className="color-dot"
              style={{
                backgroundColor: color,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px'
              }}
            />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}; 