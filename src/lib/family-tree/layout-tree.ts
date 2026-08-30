import dagre from 'dagre';
import { FamilyTreeNode, FamilyTreeEdge } from './tree-types';

export function getLayoutedElements(
  nodes: FamilyTreeNode[],
  edges: FamilyTreeEdge[],
  direction = 'TB'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 220; // Width of our PersonNode card
  const nodeHeight = 80; // Height of our PersonNode card
  const unionWidth = 10;
  const unionHeight = 10;

  // Configuration for Dagre layout
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 80,   // horizontal space between nodes
    edgesep: 20,
    ranksep: 100,  // vertical space between ranks
  });

  nodes.forEach((node) => {
    const isUnion = node.type === 'union';
    dagreGraph.setNode(node.id, { 
      width: isUnion ? unionWidth : nodeWidth, 
      height: isUnion ? unionHeight : nodeHeight 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  try {
    dagre.layout(dagreGraph);
  } catch (err) {
    console.error("Dagre layout failed, returning unlayouted elements.", err);
    return { nodes, edges };
  }

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isUnion = node.type === 'union';
    
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches React Flow's default positioning (anchor=top left).
    const w = isUnion ? unionWidth : nodeWidth;
    const h = isUnion ? unionHeight : nodeHeight;
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - w / 2,
        y: nodeWithPosition.y - h / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
}
