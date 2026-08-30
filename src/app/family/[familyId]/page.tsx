import { getTranslations } from 'next-intl/server';
import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, UserPlus, Clock, Menu } from 'lucide-react';
import Link from 'next/link';

export default async function FamilyDashboard({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations('dashboard');
  const supabase = createAdminClient();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ourfamily_session')?.value;

  if (!sessionToken) {
    redirect('/');
  }

  // Get current user
  const { data: session } = await supabase
    .from('sessions')
    .select('users(*)')
    .eq('session_token', sessionToken)
    .single();

  if (!session || !session.users) {
    redirect('/');
  }

  const user = session.users;

  // Get family details and members count
  const { data: family } = await supabase
    .from('families')
    .select('*, family_memberships(count)')
    .eq('id', resolvedParams.familyId)
    .single();

  if (!family) {
    redirect('/');
  }

  const memberCount = family.family_memberships[0]?.count || 1;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Mobile Header / Nav equivalent */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-16 z-10">
        <h2 className="font-semibold text-lg text-slate-800 truncate pr-4">{family.name}</h2>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Menu size={24} />
        </Button>
      </div>

      <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6 mt-4">
        
        {/* Sidebar for Desktop */}
        <div className="hidden md:flex w-64 flex-col gap-2">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-slate-900">
              {family.name}
            </h2>
            <div className="space-y-1">
              <Button variant="secondary" className="w-full justify-start">
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-500 cursor-not-allowed">
                Family Tree ({t('comingSoon')})
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-500 cursor-not-allowed">
                People ({t('comingSoon')})
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {t('welcome', { name: user.name })}
            </h1>
          </div>
          <div className="md:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('welcome', { name: user.name })}
            </h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {t('membersCount')}
                </CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{memberCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/family/${resolvedParams.familyId}/invite`} className={cn(buttonVariants(), "flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 h-12 text-primary-foreground")}>
              <UserPlus className="mr-2 h-4 w-4" /> {t('addMemberBtn')}
            </Link>
            <Link href={`/family/${resolvedParams.familyId}/invite`} className={cn(buttonVariants({ variant: "outline" }), "flex-1 sm:flex-none border-emerald-200 text-emerald-700 h-12")}>
              {t('inviteBtn')}
            </Link>
          </div>

          <Card className="border-0 shadow-sm mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                {t('recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberCount === 1 ? (
                <div className="text-center py-8">
                  <div className="mx-auto bg-slate-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <Users className="text-slate-400" size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{t('emptyStateTitle')}</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    {t('emptyStateSubtitle')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="bg-emerald-100 text-emerald-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t('activityCreated')}</p>
                      <p className="text-xs text-slate-500">{t('justNow')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
