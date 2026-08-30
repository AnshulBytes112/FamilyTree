import { Node, Edge } from '@xyflow/react';

export type PersonData = {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  date_of_birth?: string | null;
  date_of_death?: string | null;
  place_of_birth?: string | null;
  place_of_residence?: string | null;
  isHighlighted?: boolean;
};

export type UnionData = {
  id: string;
};

export type FamilyTreeNode = Node<PersonData, 'person'> | Node<UnionData, 'union'>;
export type FamilyTreeEdge = Edge;

export interface RawPerson {
  id: string;
  name: string;
  gender: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  place_of_birth?: string | null;
  place_of_residence?: string | null;
}

export interface RawRelationship {
  id: string;
  person_id: string;
  related_person_id: string;
  type: 'PARENT' | 'SPOUSE';
}
