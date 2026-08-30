import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import AutoJoinFamilyClient from './AutoJoinFamilyClient';

export default async function AutoJoinFamilyPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ourfamily_session')?.value;
  
  if (sessionToken) {
    const supabase = createAdminClient();
    const { data: session } = await supabase.from('sessions').select('user_id').eq('session_token', sessionToken).single();
    
    if (session) {
      const { data: invite } = await supabase.from('invites').select('family_id').eq('code', resolvedParams.code.toUpperCase()).single();
      
      if (invite) {
        const { data: membership } = await supabase.from('family_memberships')
          .select('id')
          .eq('family_id', invite.family_id)
          .eq('user_id', session.user_id)
          .single();
          
        if (membership) {
          redirect(`/family/${invite.family_id}`);
        }
      }
    }
  }

  // Not a member yet, show the join form
  return <AutoJoinFamilyClient params={params} />;
}
