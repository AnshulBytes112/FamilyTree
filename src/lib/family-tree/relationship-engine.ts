export interface RawPerson {
  id: string;
  name: string;
  gender: string;
  date_of_birth: string | null;
  date_of_death: string | null;
}

export interface RawRelationship {
  id: string;
  person_id: string;
  related_person_id: string;
  type: 'PARENT' | 'SPOUSE';
}

export type RelationshipKind = 
  | 'FATHER' | 'MOTHER' | 'PARENT'
  | 'SON' | 'DAUGHTER' | 'CHILD'
  | 'BROTHER' | 'SISTER' | 'SIBLING'
  | 'HUSBAND' | 'WIFE' | 'SPOUSE'
  | 'GRANDFATHER' | 'GRANDMOTHER' | 'GRANDPARENT'
  | 'GRANDSON' | 'GRANDDAUGHTER' | 'GRANDCHILD'
  | 'UNCLE' | 'AUNT'
  | 'NEPHEW' | 'NIECE'
  | 'FIRST_COUSIN' | 'SECOND_COUSIN' | 'THIRD_COUSIN'
  | 'FIRST_COUSIN_ONCE_REMOVED' | 'FIRST_COUSIN_TWICE_REMOVED'
  | 'RELATIVE_BY_MARRIAGE'
  | 'EXTENDED_FAMILY'
  | 'NO_KNOWN_RELATIONSHIP'
  | 'SAME_PERSON';

export interface RelationshipPathStep {
  personId: string;
  relation: 'start' | 'parent' | 'child' | 'spouse';
  label: string;
  gender: string;
}

export interface RelationshipResult {
  kind: RelationshipKind;
  personAId: string;
  personBId: string;
  path: RelationshipPathStep[];
}

class Graph {
  adj = new Map<string, Array<{ to: string, type: 'parent' | 'child' | 'spouse' }>>();
  peopleMap = new Map<string, RawPerson>();

  constructor(people: RawPerson[], relationships: RawRelationship[]) {
    for (const p of people) {
      this.peopleMap.set(p.id, p);
      this.adj.set(p.id, []);
    }

    for (const rel of relationships) {
      if (!this.peopleMap.has(rel.person_id) || !this.peopleMap.has(rel.related_person_id)) continue;
      
      if (rel.type === 'PARENT') {
        // child -> parent (UP)
        this.adj.get(rel.person_id)!.push({ to: rel.related_person_id, type: 'parent' });
        // parent -> child (DOWN)
        this.adj.get(rel.related_person_id)!.push({ to: rel.person_id, type: 'child' });
      } else if (rel.type === 'SPOUSE') {
        this.adj.get(rel.person_id)!.push({ to: rel.related_person_id, type: 'spouse' });
        this.adj.get(rel.related_person_id)!.push({ to: rel.person_id, type: 'spouse' });
      }
    }
  }

  getPerson(id: string) {
    return this.peopleMap.get(id);
  }
}

function classifyPath(path: RelationshipPathStep[]): RelationshipKind {
  if (path.length <= 1) return 'SAME_PERSON';

  let ups = 0;
  let downs = 0;
  let spouses = 0;
  let validBloodPath = true;
  let lastStepSpouse = false;

  // We skip the first step ('start')
  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    if (step.relation === 'parent') {
      if (downs > 0) validBloodPath = false; // UP after DOWN is not a direct bloodline (it goes down then up, meaning spouse or crossing branches improperly if not tracked)
      ups++;
    } else if (step.relation === 'child') {
      downs++;
    } else if (step.relation === 'spouse') {
      spouses++;
      if (i === path.length - 1) {
        lastStepSpouse = true;
      } else if (i === 1 && path.length > 2) {
         // spouse is at the beginning. This is okay (e.g. wife's sister)
      } else {
         validBloodPath = false; // spouse in the middle makes classification hard
      }
    }
  }

  const targetGender = path[path.length - 1].gender;

  // Exact Match Logic
  if (spouses === 0 && validBloodPath) {
    if (ups === 1 && downs === 0) return targetGender === 'MALE' ? 'FATHER' : targetGender === 'FEMALE' ? 'MOTHER' : 'PARENT';
    if (ups === 0 && downs === 1) return targetGender === 'MALE' ? 'SON' : targetGender === 'FEMALE' ? 'DAUGHTER' : 'CHILD';
    
    if (ups === 2 && downs === 0) return targetGender === 'MALE' ? 'GRANDFATHER' : targetGender === 'FEMALE' ? 'GRANDMOTHER' : 'GRANDPARENT';
    if (ups === 0 && downs === 2) return targetGender === 'MALE' ? 'GRANDSON' : targetGender === 'FEMALE' ? 'GRANDDAUGHTER' : 'GRANDCHILD';
    
    if (ups > 2 && downs === 0) return 'EXTENDED_FAMILY'; // Great-grandparent etc.
    if (ups === 0 && downs > 2) return 'EXTENDED_FAMILY'; // Great-grandchild etc.

    if (ups === 1 && downs === 1) return targetGender === 'MALE' ? 'BROTHER' : targetGender === 'FEMALE' ? 'SISTER' : 'SIBLING';
    
    if (ups === 2 && downs === 1) return targetGender === 'MALE' ? 'UNCLE' : targetGender === 'FEMALE' ? 'AUNT' : 'UNCLE'; // fallback
    if (ups === 1 && downs === 2) return targetGender === 'MALE' ? 'NEPHEW' : targetGender === 'FEMALE' ? 'NIECE' : 'NEPHEW';

    if (ups > 0 && downs > 0) {
      const minGen = Math.min(ups, downs);
      const diff = Math.abs(ups - downs);
      
      const cousinLevel = minGen - 1;
      
      if (cousinLevel === 1) {
        if (diff === 0) return 'FIRST_COUSIN';
        if (diff === 1) return 'FIRST_COUSIN_ONCE_REMOVED';
        if (diff === 2) return 'FIRST_COUSIN_TWICE_REMOVED';
        return 'EXTENDED_FAMILY';
      }
      if (cousinLevel === 2) {
        if (diff === 0) return 'SECOND_COUSIN';
        return 'EXTENDED_FAMILY';
      }
      if (cousinLevel === 3) {
        if (diff === 0) return 'THIRD_COUSIN';
        return 'EXTENDED_FAMILY';
      }
      return 'EXTENDED_FAMILY';
    }
  }

  // Handle Spouse Modifiers
  if (spouses === 1) {
    if (path.length === 2) return targetGender === 'MALE' ? 'HUSBAND' : targetGender === 'FEMALE' ? 'WIFE' : 'SPOUSE';
    
    if (lastStepSpouse && validBloodPath) {
      // It's the spouse of a blood relative
      if (ups === 1 && downs === 1) return targetGender === 'MALE' ? 'BROTHER' : targetGender === 'FEMALE' ? 'SISTER' : 'RELATIVE_BY_MARRIAGE'; // Brother/Sister-in-law, loosely Brother/Sister or Aunt/Uncle in Indian context? Wait, the prompt says "Father's brother's wife -> Aunt"
      if (ups === 2 && downs === 1) return targetGender === 'MALE' ? 'UNCLE' : targetGender === 'FEMALE' ? 'AUNT' : 'RELATIVE_BY_MARRIAGE';
      // For general cases
      return 'RELATIVE_BY_MARRIAGE';
    }

    // Spouse at the beginning (e.g. Husband's brother)
    if (path[1].relation === 'spouse' && validBloodPath) {
       // We can evaluate the blood path from the spouse
       if (ups === 1 && downs === 1) return targetGender === 'MALE' ? 'BROTHER' : targetGender === 'FEMALE' ? 'SISTER' : 'RELATIVE_BY_MARRIAGE';
       if (ups === 1 && downs === 0) return targetGender === 'MALE' ? 'FATHER' : targetGender === 'FEMALE' ? 'MOTHER' : 'RELATIVE_BY_MARRIAGE'; // Father/Mother-in-law
    }
  }

  return 'EXTENDED_FAMILY';
}

export function findRelationship(
  people: RawPerson[], 
  relationships: RawRelationship[], 
  personAId: string, 
  personBId: string
): RelationshipResult {
  
  if (personAId === personBId) {
    return { kind: 'SAME_PERSON', personAId, personBId, path: [] };
  }

  const graph = new Graph(people, relationships);
  const startPerson = graph.getPerson(personAId);
  const endPerson = graph.getPerson(personBId);

  if (!startPerson || !endPerson) {
    return { kind: 'NO_KNOWN_RELATIONSHIP', personAId, personBId, path: [] };
  }

  // BFS
  const queue: { id: string, path: RelationshipPathStep[], ups: number, downs: number, spouses: number }[] = [];
  const visited = new Set<string>();

  queue.push({
    id: personAId,
    path: [{ personId: personAId, relation: 'start', label: startPerson.name, gender: startPerson.gender }],
    ups: 0,
    downs: 0,
    spouses: 0
  });
  
  visited.add(personAId);

  let bestResult: { path: RelationshipPathStep[], kind: RelationshipKind } | null = null;
  let bestScore = Infinity; // Lower is better (we penalize spouses, U->D inversions)

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.id === personBId) {
      const kind = classifyPath(current.path);
      let score = current.path.length;
      
      // Penalize bad paths
      if (kind === 'EXTENDED_FAMILY' || kind === 'RELATIVE_BY_MARRIAGE') score += 100;
      score += current.spouses * 10;
      
      if (score < bestScore) {
        bestScore = score;
        bestResult = { path: current.path, kind };
      }
      continue; 
    }

    const neighbors = graph.adj.get(current.id) || [];
    for (const neighbor of neighbors) {
      // Prevent revisiting to avoid cycles. However, sometimes revisiting via a different path is better.
      // For a simple family tree BFS, standard visited set is usually enough to find the shortest path.
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        
        const neighborPerson = graph.getPerson(neighbor.to)!;
        const nextPath = [...current.path, { 
          personId: neighbor.to, 
          relation: neighbor.type, 
          label: neighborPerson.name,
          gender: neighborPerson.gender
        }];
        
        queue.push({
          id: neighbor.to,
          path: nextPath,
          ups: current.ups + (neighbor.type === 'parent' ? 1 : 0),
          downs: current.downs + (neighbor.type === 'child' ? 1 : 0),
          spouses: current.spouses + (neighbor.type === 'spouse' ? 1 : 0),
        });
      }
    }
  }

  if (bestResult) {
    return {
      kind: bestResult.kind,
      personAId,
      personBId,
      path: bestResult.path
    };
  }

  return { kind: 'NO_KNOWN_RELATIONSHIP', personAId, personBId, path: [] };
}
