import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminClient } from '@/lib/supabase';
import { InviteShareOptions } from '@/components/InviteShareOptions';
import Link from 'next/link';

export default async function InvitePage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations('invite');
  
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('invites')
    .select('code')
    .eq('family_id', resolvedParams.familyId)
    .single();
    
  const inviteCode = data?.code || null;

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl w-full mx-auto">
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-xl font-bold text-slate-900">{t('title')}</CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500 mt-1">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white p-6 md:p-8">
            <InviteShareOptions 
              inviteCode={inviteCode} 
              familyId={resolvedParams.familyId}
            />
          </CardContent>
        </Card>
        
        <div className="mt-6 flex justify-center">
          <Link href={`/family/${resolvedParams.familyId}`} className="text-sm font-medium text-emerald-700 hover:underline">
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
