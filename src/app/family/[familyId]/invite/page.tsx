import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trees } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase';
import { InviteShareOptions } from '@/components/InviteShareOptions';

export default async function InvitePage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations();
  
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('invites')
    .select('code')
    .eq('family_id', resolvedParams.familyId)
    .single();
    
  const inviteCode = data?.code || null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 text-center">
        <CardHeader className="space-y-4 pb-6">
          <div className="mx-auto bg-emerald-50 text-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Trees size={32} />
          </div>
          <CardTitle className="text-2xl font-bold">{t('createFamily.successTitle')}</CardTitle>
          <CardDescription className="text-base text-slate-600">
            {t('createFamily.successSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-slate-800">{t('invite.title')}</h3>
            <p className="text-sm text-slate-500">{t('invite.subtitle')}</p>
          </div>

          <InviteShareOptions 
            inviteCode={inviteCode} 
            familyId={resolvedParams.familyId}
          />
          
        </CardContent>
      </Card>
    </div>
  );
}
