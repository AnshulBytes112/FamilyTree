import { RawPerson, RawRelationship } from './tree-types';
import { findRelationship } from './relationship-engine';
// @ts-expect-error vitest is not installed globally in this project
import { describe, it, expect } from 'vitest';

describe('Relationship Engine', () => {
  const people: RawPerson[] = [
    { id: 'grandpa', name: 'Grandpa', gender: 'MALE', date_of_birth: null, date_of_death: null },
    { id: 'dad', name: 'Dad', gender: 'MALE', date_of_birth: null, date_of_death: null },
    { id: 'mom', name: 'Mom', gender: 'FEMALE', date_of_birth: null, date_of_death: null },
    { id: 'uncle', name: 'Uncle', gender: 'MALE', date_of_birth: null, date_of_death: null },
    { id: 'aunt', name: 'Aunt', gender: 'FEMALE', date_of_birth: null, date_of_death: null },
    { id: 'me', name: 'Anshul', gender: 'MALE', date_of_birth: null, date_of_death: null },
    { id: 'sister', name: 'Sister', gender: 'FEMALE', date_of_birth: null, date_of_death: null },
    { id: 'cousin', name: 'Cousin Rohit', gender: 'MALE', date_of_birth: null, date_of_death: null },
    { id: 'son', name: 'Son', gender: 'MALE', date_of_birth: null, date_of_death: null },
    { id: 'wife', name: 'Wife', gender: 'FEMALE', date_of_birth: null, date_of_death: null },
    { id: 'stranger', name: 'Stranger', gender: 'MALE', date_of_birth: null, date_of_death: null },
  ];

  const relationships: RawRelationship[] = [
    // Grandpa -> Dad & Uncle
    { id: 'r1', person_id: 'dad', related_person_id: 'grandpa', type: 'PARENT' },
    { id: 'r2', person_id: 'uncle', related_person_id: 'grandpa', type: 'PARENT' },
    
    // Dad + Mom
    { id: 'r3', person_id: 'dad', related_person_id: 'mom', type: 'SPOUSE' },
    
    // Dad -> Me & Sister
    { id: 'r4', person_id: 'me', related_person_id: 'dad', type: 'PARENT' },
    { id: 'r5', person_id: 'sister', related_person_id: 'dad', type: 'PARENT' },
    
    // Uncle + Aunt
    { id: 'r6', person_id: 'uncle', related_person_id: 'aunt', type: 'SPOUSE' },
    
    // Uncle -> Cousin
    { id: 'r7', person_id: 'cousin', related_person_id: 'uncle', type: 'PARENT' },
    
    // Me + Wife
    { id: 'r8', person_id: 'me', related_person_id: 'wife', type: 'SPOUSE' },
    
    // Me -> Son
    { id: 'r9', person_id: 'son', related_person_id: 'me', type: 'PARENT' }
  ];

  it('detects SAME_PERSON', () => {
    const res = findRelationship(people, relationships, 'me', 'me');
    expect(res.kind).toBe('SAME_PERSON');
  });

  it('detects NO_KNOWN_RELATIONSHIP', () => {
    const res = findRelationship(people, relationships, 'me', 'stranger');
    expect(res.kind).toBe('NO_KNOWN_RELATIONSHIP');
  });

  it('detects FATHER', () => {
    const res = findRelationship(people, relationships, 'me', 'dad');
    expect(res.kind).toBe('FATHER');
  });

  it('detects SON', () => {
    const res = findRelationship(people, relationships, 'dad', 'me');
    expect(res.kind).toBe('SON');
  });

  it('detects BROTHER/SISTER (Sibling)', () => {
    const res = findRelationship(people, relationships, 'me', 'sister');
    expect(res.kind).toBe('SISTER');
    
    const res2 = findRelationship(people, relationships, 'sister', 'me');
    expect(res2.kind).toBe('BROTHER');
  });

  it('detects GRANDFATHER', () => {
    const res = findRelationship(people, relationships, 'me', 'grandpa');
    expect(res.kind).toBe('GRANDFATHER');
  });

  it('detects UNCLE', () => {
    const res = findRelationship(people, relationships, 'me', 'uncle');
    expect(res.kind).toBe('UNCLE');
  });

  it('detects AUNT via spouse', () => {
    // Uncle's wife should be Aunt
    const res = findRelationship(people, relationships, 'me', 'aunt');
    expect(res.kind).toBe('AUNT');
  });

  it('detects FIRST_COUSIN', () => {
    const res = findRelationship(people, relationships, 'me', 'cousin');
    expect(res.kind).toBe('FIRST_COUSIN');
  });
  
  it('detects FIRST_COUSIN_ONCE_REMOVED', () => {
    const res = findRelationship(people, relationships, 'son', 'cousin');
    expect(res.kind).toBe('FIRST_COUSIN_ONCE_REMOVED');
  });

  it('detects SPOUSE', () => {
    const res = findRelationship(people, relationships, 'me', 'wife');
    expect(res.kind).toBe('WIFE');
  });
});
