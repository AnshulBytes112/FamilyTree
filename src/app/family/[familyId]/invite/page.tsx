import { getTranslations } from 'next-intl/server';
import { createAdminClient } from '@/lib/supabase';
import { InviteClientLayout } from '@/components/invite/InviteClientLayout';

export default async function InvitePage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const { familyId } = resolvedParams;
  const t = await getTranslations('invite');
  
  const supabase = createAdminClient();
  
  // Get invite code
  const { data: inviteData } = await supabase
    .from('invites')
    .select('code')
    .eq('family_id', familyId)
    .single();
    
  const inviteCode = inviteData?.code || null;

  // Get joined members
  const { data: membershipData } = await supabase
    .from('family_memberships')
    .select('user:users(id, name)')
    .eq('family_id', familyId);

  const members = (membershipData || []).map((m: any) => ({
    id: m.user.id,
    name: m.user.name,
    status: 'Joined'
  }));

  // Fetch family info for the share text
  const { data: familyData } = await supabase
    .from('families')
    .select('name')
    .eq('id', familyId)
    .single();

  const familyName = familyData?.name || 'our family';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa] p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl w-full mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-[family-name:var(--font-playfair)] font-bold tracking-tight text-slate-900 mb-2">
            {t('title', { defaultMessage: 'Invite Members' })}
          </h1>
          <p className="text-slate-500 font-medium text-[15px]">
            {t('subtitle', { defaultMessage: 'Share the link or invite members to join the family.' })}
          </p>
        </div>

        <InviteClientLayout 
          inviteCode={inviteCode} 
          members={members} 
          familyName={familyName}
          familyId={familyId}
        />

      </div>
    </div>
  );
}
