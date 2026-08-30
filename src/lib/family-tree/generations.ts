import { RawPerson, RawRelationship } from './tree-types';

export interface GenerationGroup {
  generation: number;
  members: RawPerson[];
}

export function calculateGenerations(people: RawPerson[], relationships: RawRelationship[]) {
  if (people.length === 0) return { maxGenerations: 0, generationGroups: [] };

  const graph = new Map<string, { children: string[], spouses: string[], parents: string[] }>();
  const genMap = new Map<string, number>();

  for (const p of people) {
    graph.set(p.id, { children: [], spouses: [], parents: [] });
  }

  for (const r of relationships) {
    if (!graph.has(r.person_id) || !graph.has(r.related_person_id)) continue;
    
    if (r.type === 'PARENT') {
      // related_person is PARENT of person
      graph.get(r.related_person_id)!.children.push(r.person_id);
      graph.get(r.person_id)!.parents.push(r.related_person_id);
    } else if (r.type === 'SPOUSE') {
      graph.get(r.person_id)!.spouses.push(r.related_person_id);
      graph.get(r.related_person_id)!.spouses.push(r.person_id);
    }
  }

  // Implicitly link co-parents as spouses so their generations align
  for (const [id, info] of graph.entries()) {
    if (info.parents.length > 1) {
      for (let i = 0; i < info.parents.length; i++) {
        for (let j = i + 1; j < info.parents.length; j++) {
          const p1 = info.parents[i];
          const p2 = info.parents[j];
          if (!graph.get(p1)!.spouses.includes(p2)) {
            graph.get(p1)!.spouses.push(p2);
          }
          if (!graph.get(p2)!.spouses.includes(p1)) {
            graph.get(p2)!.spouses.push(p1);
          }
        }
      }
    }
  }

  // Find roots (nodes with no parents)
  const roots = people.filter(p => graph.get(p.id)!.parents.length === 0);
  
  // If no roots (circular dependency, highly unlikely but possible), use all people
  const startNodes = roots.length > 0 ? roots : people;

  for (const startNode of startNodes) {
    if (genMap.has(startNode.id)) continue;

    const queue: { id: string, gen: number }[] = [{ id: startNode.id, gen: 1 }];
    
    while (queue.length > 0) {
      const { id, gen } = queue.shift()!;
      
      let changed = false;
      if (genMap.has(id)) {
        // If already visited, only update if the new generation is higher (max depth)
        if (genMap.get(id)! < gen) {
          genMap.set(id, gen);
          changed = true;
        }
      } else {
        genMap.set(id, gen);
        changed = true;
      }

      if (changed) {
        const nodeInfo = graph.get(id)!;
        
        // Spouses get the same generation
        for (const spouse of nodeInfo.spouses) {
          queue.push({ id: spouse, gen });
        }

        // Children get gen + 1
        for (const child of nodeInfo.children) {
          queue.push({ id: child, gen: gen + 1 });
        }
      }
    }
  }

  // Handle any disconnected nodes that weren't reached
  for (const p of people) {
    if (!genMap.has(p.id)) {
      genMap.set(p.id, 1);
    }
  }

  // Group by generation
  const groups = new Map<number, RawPerson[]>();
  let maxGen = 0;

  for (const p of people) {
    const gen = genMap.get(p.id)!;
    if (gen > maxGen) maxGen = gen;
    if (!groups.has(gen)) groups.set(gen, []);
    groups.get(gen)!.push(p);
  }

  const generationGroups: GenerationGroup[] = [];
  for (let i = 1; i <= maxGen; i++) {
    if (groups.has(i)) {
      generationGroups.push({
        generation: i,
        members: groups.get(i)!
      });
    }
  }

  return { maxGenerations: maxGen, generationGroups };
}
