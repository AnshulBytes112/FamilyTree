/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').max(100),
  description: z.string().max(2000).optional().nullable().transform(v => v || null)
});

export async function getBranches(familyId: string) {
  const { supabase } = await requireFamilyMember(familyId);
  
  // Efficient query to get branches with member counts
  const { data, error } = await supabase
    .from('branches')
    .select(`
      id,
      name,
      description,
      branch_memberships(count)
    `)
    .eq('family_id', familyId)
    .order('name');
    
  if (error) throw error;
  
  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    memberCount: b.branch_memberships[0]?.count || 0
  }));
}

export async function getBranchDetails(familyId: string, branchId: string) {
  const { supabase } = await requireFamilyMember(familyId);
  z.string().uuid().parse(branchId);
  
  const { data: branch, error: branchError } = await supabase
    .from('branches')
    .select('*')
    .eq('id', branchId)
    .eq('family_id', familyId)
    .single();
    
  if (branchError || !branch) throw new Error('Branch not found');
  
  // Get members
  const { data: members, error: membersError } = await supabase
    .from('branch_memberships')
    .select(`
      person_id,
      people!inner(id, name, gender, date_of_birth)
    `)
    .eq('branch_id', branchId)
    .eq('family_id', familyId);
    
  if (membersError) throw membersError;
  
  return {
    branch,
    members: members.map((m: any) => m.people)
  };
}

export async function createBranch(familyId: string, formData: FormData) {
  try {
    const { userId, supabase } = await requireFamilyMember(familyId);
    
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
    };
    
    const validatedData = branchSchema.parse(rawData);

    const { data: branch, error } = await supabase
      .from('branches')
      .insert({
        family_id: familyId,
        created_by: userId,
        ...validatedData
      })
      .select('id')
      .single();

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    revalidatePath(`/family/${familyId}/branches`);
    return { success: true, branchId: branch.id };
  } catch (error: any) {
    console.error('createBranch error:', error);
    return { success: false, error: error.message || 'Failed to create branch' };
  }
}

export async function updateBranch(familyId: string, branchId: string, formData: FormData) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    z.string().uuid().parse(branchId);
    
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
    };
    
    const validatedData = branchSchema.parse(rawData);

    const { error } = await supabase
      .from('branches')
      .update(validatedData)
      .eq('id', branchId)
      .eq('family_id', familyId);

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    revalidatePath(`/family/${familyId}/branches`);
    revalidatePath(`/family/${familyId}/branches/${branchId}`);
    return { success: true };
  } catch (error: any) {
    console.error('updateBranch error:', error);
    return { success: false, error: error.message || 'Failed to update branch' };
  }
}

export async function deleteBranch(familyId: string, branchId: string) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    z.string().uuid().parse(branchId);
    
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', branchId)
      .eq('family_id', familyId);

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}`);
    revalidatePath(`/family/${familyId}/branches`);
    return { success: true };
  } catch (error: any) {
    console.error('deleteBranch error:', error);
    return { success: false, error: error.message || 'Failed to delete branch' };
  }
}

export async function addMembersToBranch(familyId: string, branchId: string, personIds: string[]) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    z.string().uuid().parse(branchId);
    z.array(z.string().uuid()).parse(personIds);
    
    if (personIds.length === 0) return { success: true };

    // The database composite foreign keys will inherently reject any personId that does not belong to familyId
    // And UNIQUE(branch_id, person_id) prevents duplicates
    // But we should use ON CONFLICT DO NOTHING to silently ignore duplicates
    
    const memberships = personIds.map(pid => ({
      branch_id: branchId,
      person_id: pid,
      family_id: familyId
    }));

    const { error } = await supabase
      .from('branch_memberships')
      .upsert(memberships, { onConflict: 'branch_id,person_id', ignoreDuplicates: true });

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}/branches`);
    revalidatePath(`/family/${familyId}/branches/${branchId}`);
    return { success: true };
  } catch (error: any) {
    console.error('addMembersToBranch error:', error);
    return { success: false, error: error.message || 'Failed to add members' };
  }
}

export async function removeMemberFromBranch(familyId: string, branchId: string, personId: string) {
  try {
    const { supabase } = await requireFamilyMember(familyId);
    z.string().uuid().parse(branchId);
    z.string().uuid().parse(personId);
    
    const { error } = await supabase
      .from('branch_memberships')
      .delete()
      .eq('branch_id', branchId)
      .eq('person_id', personId)
      .eq('family_id', familyId);

    if (error) throw error;
    
    revalidatePath(`/family/${familyId}/branches`);
    revalidatePath(`/family/${familyId}/branches/${branchId}`);
    return { success: true };
  } catch (error: any) {
    console.error('removeMemberFromBranch error:', error);
    return { success: false, error: error.message || 'Failed to remove member' };
  }
}
