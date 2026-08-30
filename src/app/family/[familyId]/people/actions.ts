/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// --- AUTH HELPERS ---

export async function requireUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ourfamily_session')?.value;
  if (!sessionToken) throw new Error('Unauthorized');
  
  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .single();
    
  if (!session || !session.user_id) throw new Error('Unauthorized');
  return session.user_id;
}

export async function requireFamilyMember(familyId: string) {
  const userId = await requireUser();
  const supabase = createAdminClient();
  
  const { data: membership } = await supabase
    .from('family_memberships')
    .select('role')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .single();
    
  if (!membership) throw new Error('Forbidden: Not a member of this family');
  return { userId, role: membership.role, supabase };
}

// --- SCHEMAS ---

const basePersonSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).default('UNKNOWN'),
  date_of_birth: z.string().optional().nullable().transform(v => v || null),
  date_of_death: z.string().optional().nullable().transform(v => v || null),
  place_of_birth: z.string().max(255).optional().nullable().transform(v => v || null),
  place_of_residence: z.string().max(255).optional().nullable().transform(v => v || null),
  phone: z.string().max(50).optional().nullable().transform(v => v || null),
  notes: z.string().max(2000).optional().nullable().transform(v => v || null),
});

const personRefinement = (data: any, ctx: z.RefinementCtx) => {
  if (data.date_of_birth && data.date_of_death) {
    if (new Date(data.date_of_death) < new Date(data.date_of_birth)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of death cannot be before date of birth",
        path: ["date_of_death"]
      });
    }
  }
};

const personSchema = basePersonSchema.superRefine(personRefinement);
const updatePersonSchema = basePersonSchema.superRefine(personRefinement);

// --- ACTIONS ---

export async function createPerson(familyId: string, formData: FormData) {
  try {
    const { userId, supabase } = await requireFamilyMember(familyId);
    
    const rawData = {
      name: formData.get('name'),
      gender: formData.get('gender') || 'UNKNOWN',
      date_of_birth: formData.get('date_of_birth'),
      date_of_death: formData.get('date_of_death'),
      place_of_birth: formData.get('place_of_birth'),
      place_of_residence: formData.get('place_of_residence'),
      phone: formData.get('phone'),
      notes: formData.get('notes'),
    };
    
    const validatedData = personSchema.parse(rawData);

    const { data: person, error } = await supabase
      .from('people')
      .insert({
        family_id: familyId,
        created_by: userId,
        ...validatedData
      })
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    return { success: true, personId: person.id };
  } catch (error: any) {
    console.error('createPerson error:', error);
    return { success: false, error: error.message || 'Failed to create person' };
  }
}

export async function updatePerson(familyId: string, personId: string, formData: FormData) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    
    // Verify person belongs to family
    const { data: existingPerson } = await supabase
      .from('people')
      .select('id')
      .eq('id', personId)
      .eq('family_id', familyId)
      .single();
      
    if (!existingPerson) throw new Error("Person not found in this family");

    const rawData = {
      name: formData.get('name'),
      gender: formData.get('gender') || 'UNKNOWN',
      date_of_birth: formData.get('date_of_birth'),
      date_of_death: formData.get('date_of_death'),
      place_of_birth: formData.get('place_of_birth'),
      place_of_residence: formData.get('place_of_residence'),
      phone: formData.get('phone'),
      notes: formData.get('notes'),
    };
    
    const validatedData = updatePersonSchema.parse(rawData);

    const { error } = await supabase
      .from('people')
      .update(validatedData)
      .eq('id', personId)
      .eq('family_id', familyId);

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    revalidatePath(`/family/${familyId}/people/${personId}`);
    return { success: true };
  } catch (error: any) {
    console.error('updatePerson error:', error);
    return { success: false, error: error.message || 'Failed to update person' };
  }
}

export async function deletePerson(familyId: string, personId: string) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId)
      .eq('family_id', familyId);

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    return { success: true };
  } catch (error: any) {
    console.error('deletePerson error:', error);
    return { success: false, error: error.message || 'Failed to delete person' };
  }
}

export async function createParentRelationship(familyId: string, childId: string, parentId: string) {
  try {
    const { userId, supabase } = await requireFamilyMember(familyId);
    
    // Validate inputs
    z.string().uuid().parse(childId);
    z.string().uuid().parse(parentId);
    if (childId === parentId) throw new Error("Cannot be a parent of themselves");

    const { error } = await supabase
      .from('relationships')
      .insert({
        family_id: familyId,
        person_id: childId,
        related_person_id: parentId,
        type: 'PARENT',
        created_by: userId
      });

    if (error) {
      if (error.code === '23505') throw new Error("This relationship already exists");
      throw error;
    }
    
    revalidatePath(`/family/${familyId}`);
    return { success: true };
  } catch (error: any) {
    console.error('createParentRelationship error:', error);
    return { success: false, error: error.message || 'Failed to create relationship' };
  }
}

export async function createSpouseRelationship(familyId: string, person1Id: string, person2Id: string) {
  try {
    const { userId, supabase } = await requireFamilyMember(familyId);
    
    // Validate inputs
    z.string().uuid().parse(person1Id);
    z.string().uuid().parse(person2Id);
    if (person1Id === person2Id) throw new Error("Cannot be a spouse of themselves");

    // Canonicalize order for DB: person_id must be < related_person_id
    const p1 = person1Id < person2Id ? person1Id : person2Id;
    const p2 = person1Id < person2Id ? person2Id : person1Id;

    const { error } = await supabase
      .from('relationships')
      .insert({
        family_id: familyId,
        person_id: p1,
        related_person_id: p2,
        type: 'SPOUSE',
        created_by: userId
      });

    if (error) {
      if (error.code === '23505') throw new Error("This relationship already exists");
      throw error;
    }
    
    revalidatePath(`/family/${familyId}`);
    return { success: true };
  } catch (error: any) {
    console.error('createSpouseRelationship error:', error);
    return { success: false, error: error.message || 'Failed to create relationship' };
  }
}

export async function removeRelationship(familyId: string, relationshipId: string) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    
    z.string().uuid().parse(relationshipId);

    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', relationshipId)
      .eq('family_id', familyId);

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    return { success: true };
  } catch (error: any) {
    console.error('removeRelationship error:', error);
    return { success: false, error: error.message || 'Failed to remove relationship' };
  }
}

export async function createSiblingRelationship(familyId: string, personId: string, siblingId: string) {
  try {
    const { userId, supabase } = await requireFamilyMember(familyId);
    
    z.string().uuid().parse(personId);
    z.string().uuid().parse(siblingId);
    if (personId === siblingId) throw new Error("Cannot be a sibling of themselves");

    // 1. Find existing parents of personId
    const { data: parents } = await supabase
      .from('relationships')
      .select('related_person_id')
      .eq('family_id', familyId)
      .eq('person_id', personId)
      .eq('type', 'PARENT');

    let parentIds = (parents || []).map(p => p.related_person_id);

    // 2. If no parents exist, create an "Unknown Parent"
    if (parentIds.length === 0) {
      const { data: unknownParent, error: upError } = await supabase
        .from('people')
        .insert({
          family_id: familyId,
          name: 'Unknown Parent',
          gender: 'UNKNOWN',
          created_by: userId
        })
        .select('id')
        .single();
        
      if (upError) throw upError;
      
      parentIds = [unknownParent.id];

      // Link original person to this unknown parent
      await supabase
        .from('relationships')
        .insert({
          family_id: familyId,
          person_id: personId,
          related_person_id: unknownParent.id,
          type: 'PARENT',
          created_by: userId
        });
    }

    // 3. Link sibling to all identified parents
    const siblingRelationships = parentIds.map(parentId => ({
      family_id: familyId,
      person_id: siblingId,
      related_person_id: parentId,
      type: 'PARENT',
      created_by: userId
    }));

    const { error: relError } = await supabase
      .from('relationships')
      .upsert(siblingRelationships, { onConflict: 'family_id,person_id,related_person_id,type' });

    if (relError) throw relError;

    revalidatePath(`/family/${familyId}`);
    return { success: true };
  } catch (error: any) {
    console.error('createSiblingRelationship error:', error);
    return { success: false, error: error.message || 'Failed to create sibling relationship' };
  }
}

// --- QUERIES (Designed to be called from Server Components, but could be exposed as actions if needed) ---
export async function searchPeople(familyId: string, query: string) {
  const { supabase } = await requireFamilyMember(familyId);
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];
  
  const { data, error } = await supabase
    .from('people')
    .select('id, name, gender, date_of_birth')
    .eq('family_id', familyId)
    .ilike('name', `%${cleanQuery}%`)
    .limit(20);
    
  if (error) throw error;
  return data;
}

export async function getFamilyPeople(familyId: string) {
  const { supabase } = await requireFamilyMember(familyId);
  const { data, error } = await supabase
    .from('people')
    .select('id, name, gender')
    .eq('family_id', familyId)
    .order('name');
    
  if (error) throw error;
  return data;
}

export async function getPersonWithRelationships(familyId: string, personId: string) {
  const { supabase } = await requireFamilyMember(familyId);

  // Get the person
  const { data: person, error: personError } = await supabase
    .from('people')
    .select('*')
    .eq('id', personId)
    .eq('family_id', familyId)
    .single();

  if (personError || !person) throw new Error("Person not found");

  // Get relationships where person is the child (finding parents)
  const { data: parentsData } = await supabase
    .from('relationships')
    .select('id, type, related_person:people!relationships_related_person_id_fkey(id, name, gender, date_of_birth, date_of_death)')
    .eq('family_id', familyId)
    .eq('person_id', personId)
    .eq('type', 'PARENT');

  // Get relationships where person is the parent (finding children)
  const { data: childrenData } = await supabase
    .from('relationships')
    .select('id, type, child_person:people!relationships_person_id_fkey(id, name, gender, date_of_birth, date_of_death)')
    .eq('family_id', familyId)
    .eq('related_person_id', personId)
    .eq('type', 'PARENT');

  // Get spouses (can be in either person_id or related_person_id because of canonical ordering)
  const { data: spousesData1 } = await supabase
    .from('relationships')
    .select('id, type, spouse:people!relationships_related_person_id_fkey(id, name, gender, date_of_birth, date_of_death)')
    .eq('family_id', familyId)
    .eq('person_id', personId)
    .eq('type', 'SPOUSE');
    
  const { data: spousesData2 } = await supabase
    .from('relationships')
    .select('id, type, spouse:people!relationships_person_id_fkey(id, name, gender, date_of_birth, date_of_death)')
    .eq('family_id', familyId)
    .eq('related_person_id', personId)
    .eq('type', 'SPOUSE');

  return {
    person,
    parents: parentsData || [],
    children: childrenData || [],
    spouses: [...(spousesData1 || []), ...(spousesData2 || [])]
  };
}
