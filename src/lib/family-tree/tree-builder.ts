import { FamilyTreeNode, FamilyTreeEdge, RawPerson, RawRelationship, PersonData } from './tree-types';

export function buildTree(people: RawPerson[], relationships: RawRelationship[]) {
  const nodes: FamilyTreeNode[] = [];
  const edges: FamilyTreeEdge[] = [];
  const unions = new Map<string, string>(); // key: "id1,id2" (sorted), value: unionNodeId

  // 1. Create Person Nodes
  for (const p of people) {
    nodes.push({
      id: p.id,
      type: 'person',
      position: { x: 0, y: 0 },
      data: {
        id: p.id,
        name: p.name,
        gender: p.gender as PersonData['gender'],
        date_of_birth: p.date_of_birth,
        date_of_death: p.date_of_death,
      },
    });
  }

  // 2. Identify and create Union nodes (for Spouses)
  const spouses = relationships.filter((r) => r.type === 'SPOUSE');
  spouses.forEach((rel) => {
    // Canonical ordering is already person_id < related_person_id in DB, but ensure it here just in case
    const p1 = rel.person_id < rel.related_person_id ? rel.person_id : rel.related_person_id;
    const p2 = rel.person_id < rel.related_person_id ? rel.related_person_id : rel.person_id;
    
    // Check if both people actually exist in our dataset
    if (!people.find((p) => p.id === p1) || !people.find((p) => p.id === p2)) return;

    const unionId = `union-${p1}-${p2}`;
    const unionKey = `${p1},${p2}`;
    
    // Only add if not already added (prevent duplicates)
    if (!unions.has(unionKey)) {
      unions.set(unionKey, unionId);
      
      nodes.push({
        id: unionId,
        type: 'union',
        position: { x: 0, y: 0 },
        data: { id: unionId },
        hidden: false, // We must not set hidden: true for dagre, we will just render it invisibly via CSS or custom node
      });

      // Add spouse edges
      edges.push({
        id: `e-${p1}-${unionId}`,
        source: p1,
        target: unionId,
        type: 'smoothstep', // Custom or standard
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      });
      edges.push({
        id: `e-${p2}-${unionId}`,
        source: p2,
        target: unionId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      });
    }
  });

  // 3. Process Parent relationships
  const parents = relationships.filter((r) => r.type === 'PARENT');
  
  // Group parents by child
  const childParentsMap = new Map<string, string[]>();
  parents.forEach((rel) => {
    const childId = rel.person_id;
    const parentId = rel.related_person_id;
    
    if (!people.find((p) => p.id === childId) || !people.find((p) => p.id === parentId)) return;

    if (!childParentsMap.has(childId)) {
      childParentsMap.set(childId, []);
    }
    childParentsMap.get(childId)!.push(parentId);
  });

  // Create Parent-Child edges
  childParentsMap.forEach((parentIds, childId) => {
    let edgeCreated = false;

    // If child has exactly 2 parents and they form a union, connect from union
    if (parentIds.length === 2) {
      const p1 = parentIds[0] < parentIds[1] ? parentIds[0] : parentIds[1];
      const p2 = parentIds[0] < parentIds[1] ? parentIds[1] : parentIds[0];
      const unionKey = `${p1},${p2}`;
      
      if (unions.has(unionKey)) {
        const unionId = unions.get(unionKey)!;
        edges.push({
          id: `e-${unionId}-${childId}`,
          source: unionId,
          target: childId,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 1.5 },
        });
        edgeCreated = true;
      }
    }

    // Fallback: If no union found, draw individual edges from each parent
    if (!edgeCreated) {
      parentIds.forEach((parentId) => {
        edges.push({
          id: `e-${parentId}-${childId}`,
          source: parentId,
          target: childId,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 1.5 },
        });
      });
    }
  });

  return { nodes, edges };
}
