'use server';

import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const createFamilySchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters').max(50, 'Family name is too long'),
  userName: z.string().min(2, 'Your name must be at least 2 characters').max(50, 'Your name is too long'),
});

const joinFamilySchema = z.object({
  inviteCode: z.string().min(6, 'Invalid invite code'),
  userName: z.string().min(2, 'Your name must be at least 2 characters').max(50, 'Your name is too long'),
});

// Helper to handle sessions
async function getOrCreateSessionAndUser(supabase: any, userName: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ourfamily_session')?.value;

  if (sessionToken) {
    const { data: session } = await supabase.from('sessions').select('*, users(*)').eq('session_token', sessionToken).single();
    if (session) {
      return { user: session.users, session };
    }
  }

  // Create new user and session
  const { data: newUser, error: userError } = await supabase.from('users').insert({ name: userName }).select().single();
  if (userError) throw new Error('Failed to create user');

  const newSessionToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3650); // 10 years for permanent login

  const { data: newSession, error: sessionError } = await supabase.from('sessions').insert({
    session_token: newSessionToken,
    user_id: newUser.id,
    expires_at: expiresAt.toISOString(),
  }).select().single();

  if (sessionError) throw new Error('Failed to create session');

  cookieStore.set('ourfamily_session', newSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });

  return { user: newUser, session: newSession };
}

export async function createFamilyAction(prevState: any, formData: FormData) {
  const supabase = createAdminClient();
  const rawData = {
    familyName: formData.get('familyName'),
    userName: formData.get('userName'),
  };

  const validated = createFamilySchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { familyName, userName } = validated.data;

  try {
    const { user } = await getOrCreateSessionAndUser(supabase, userName);

    // Create family
    const { data: family, error: familyError } = await supabase.from('families').insert({
      name: familyName,
    }).select().single();
    if (familyError) throw familyError;

    // Create membership
    const { error: membershipError } = await supabase.from('family_memberships').insert({
      family_id: family.id,
      user_id: user.id,
      role: 'ADMIN',
    });
    if (membershipError) throw membershipError;

    // Generate unique invite code
    const inviteCode = crypto.randomUUID().substring(0, 8).toUpperCase();
    const { error: inviteError } = await supabase.from('invites').insert({
      family_id: family.id,
      code: inviteCode,
      created_by: user.id,
    });
    if (inviteError) throw inviteError;

    return { success: true, familyId: family.id };
  } catch (error) {
    console.error('Create family error:', error);
    return { error: 'Failed to create family. Please try again.' };
  }
}

export async function joinFamilyAction(prevState: any, formData: FormData) {
  const supabase = createAdminClient();
  const rawData = {
    inviteCode: formData.get('inviteCode'),
    userName: formData.get('userName'),
  };

  const validated = joinFamilySchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { inviteCode, userName } = validated.data;

  try {
    // Verify invite code
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*, families(*)')
      .eq('code', inviteCode.toUpperCase())
      .single();

    if (inviteError || !invite) {
      return { error: 'Invalid or expired invite code.' };
    }

    const { user } = await getOrCreateSessionAndUser(supabase, userName);

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from('family_memberships')
      .select('id')
      .eq('family_id', invite.family_id)
      .eq('user_id', user.id)
      .single();

    if (!existingMembership) {
      // Create membership
      const { error: membershipError } = await supabase.from('family_memberships').insert({
        family_id: invite.family_id,
        user_id: user.id,
        role: 'MEMBER',
      });
      if (membershipError) throw membershipError;
    }

    return { success: true, familyId: invite.family_id };
  } catch (error) {
    console.error('Join family error:', error);
    return { error: 'Failed to join family. Please try again.' };
  }
}
