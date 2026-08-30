/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { findRelationship } from '@/lib/family-tree/relationship-engine';
import { z } from 'zod';

export async function findRelationshipAction(familyId: string, personAId: string, personBId: string) {
  try {
    const { supabase } = await requireFamilyMember(familyId);

    // Validate
    z.string().uuid().parse(personAId);
    z.string().uuid().parse(personBId);

    if (personAId === personBId) {
      return { success: false, error: 'Please select two different family members.' };
    }

    // Fetch people
    const { data: people, error: pError } = await supabase
      .from('people')
      .select('id, name, gender, date_of_birth, date_of_death')
      .eq('family_id', familyId);

    if (pError) throw pError;

    // Fetch relationships
    const { data: relationships, error: rError } = await supabase
      .from('relationships')
      .select('id, person_id, related_person_id, type')
      .eq('family_id', familyId);

    if (rError) throw rError;

    // Run engine
    const result = findRelationship(people || [], relationships || [], personAId, personBId);

    return { success: true, result };
  } catch (error: any) {
    console.error('findRelationshipAction error:', error);
    return { success: false, error: 'We couldn\'t calculate this relationship right now. Please try again.' };
  }
}
