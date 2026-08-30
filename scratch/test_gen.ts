import { calculateGenerations } from '../src/lib/family-tree/generations';

const people = [
  { id: 'Triveni', name: 'Triveni', gender: 'MALE', date_of_birth: null, date_of_death: null },
  { id: 'Sushila', name: 'Sushila', gender: 'FEMALE', date_of_birth: null, date_of_death: null },
  { id: 'Muni', name: 'Muni', gender: 'MALE', date_of_birth: null, date_of_death: null },
];

const relationships = [
  { id: '1', person_id: 'Muni', related_person_id: 'Triveni', type: 'PARENT' }, // Triveni is parent of Muni
  { id: '2', person_id: 'Muni', related_person_id: 'Sushila', type: 'SPOUSE' } // Muni and Sushila are spouses
] as any[];

const res = calculateGenerations(people as any, relationships);
console.dir(res, { depth: null });
