import { getTranslations } from 'next-intl/server';
import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Trees, 
  LayoutDashboard, 
  Network, 
  Users, 
  GitBranch, 
  Search, 
  Image as ImageIcon, 
  Calendar, 
  Settings,
  Plus,
  User
} from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function FamilyDashboard({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations('dashboard');
  const tLanding = await getTranslations('landing');
  const supabase = createAdminClient();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ourfamily_session')?.value;

  if (!sessionToken) redirect('/');

  const { data: session } = await supabase
    .from('sessions')
    .select('users(*)')
    .eq('session_token', sessionToken)
    .single();

  if (!session || !session.users) redirect('/');
  const user: any = Array.isArray(session.users) ? session.users[0] : session.users;

  // Real data
  const { count: peopleCount } = await supabase
    .from('people')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', resolvedParams.familyId);

  const { count: contributorCount } = await supabase
    .from('family_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', resolvedParams.familyId);

  const { count: branchCount } = await supabase
    .from('branches')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', resolvedParams.familyId);

  const { data: recentPeople } = await supabase
    .from('people')
    .select('id, name, created_at')
    .eq('family_id', resolvedParams.familyId)
    .order('created_at', { ascending: false })
    .limit(3);

  const stats = [
    { label: t('stats.members'), value: peopleCount || 0 },
    { label: t('stats.contributors', { defaultMessage: 'Contributors' }), value: contributorCount || 1 },
    { label: t('stats.branches', { defaultMessage: 'Branches' }), value: branchCount || 0 },
    { label: t('stats.generations'), value: "—" }, // Coming later
  ];

  const recentMembers = (recentPeople || []).map(p => ({
    name: p.name,
    time: "Just now", // In a real app we'd calculate time difference
    img: p.name.charAt(0).toUpperCase()
  }));

  const recentActivity = (recentPeople || []).map(p => ({
    text: `You added ${p.name}`, 
    time: "Just now", 
    color: "bg-blue-500",
    icon: User
  }));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-[family-name:var(--font-playfair)] font-bold text-slate-900 mb-2 tracking-tight">{t('header.title', { defaultMessage: 'Dashboard' })}</h1>
          <p className="text-slate-800 font-medium text-[15px]">{t('header.welcome', { name: user.name })}</p>
        </div>
        <div>
          <Link 
            href={`/family/${resolvedParams.familyId}/people/new`} 
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E763A] hover:bg-emerald-800 text-white text-sm font-semibold rounded-md shadow-sm transition-all"
          >
            <Plus size={18} strokeWidth={2.5} /> {t('header.addPerson', { defaultMessage: 'Add Person' })}
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-6 flex flex-col justify-center">
              <p className="text-[13px] font-medium text-slate-600 mb-3">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recently Added Members */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">{t('recentMembers.title', { defaultMessage: 'Recently Added Members' })}</h3>
          </div>
          <CardContent className="p-0">
            {recentMembers.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No members added yet.</p>
            ) : (
              <ul className="px-2">
                {recentMembers.map((member, i) => (
                  <li key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/50 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#E5F0EA] flex items-center justify-center font-bold text-[#1E763A] shrink-0">
                      {member.img}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-[13px] truncate leading-tight">{member.name}</p>
                      <p className="text-[12px] text-slate-500 truncate mt-0.5">{member.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="px-6 py-5">
              <Link href={`/family/${resolvedParams.familyId}/people`} className="text-[#1E763A] text-sm font-bold hover:underline tracking-tight">
                {t('recentMembers.viewAll', { defaultMessage: 'View All' })}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">{t('recentActivity.title', { defaultMessage: 'Recent Activity' })}</h3>
          </div>
          <CardContent className="p-0">
            <ul className="px-2">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <li key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/50 rounded-lg transition-colors">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", activity.color)}>
                      <Icon size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900 text-[13px] truncate">{activity.text}</p>
                      <span className="text-[12px] text-slate-500 whitespace-nowrap shrink-0">{activity.time}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="px-6 py-5">
              <button className="text-[#1E763A] text-sm font-bold hover:underline tracking-tight">
                {t('recentActivity.viewAll', { defaultMessage: 'View All' })}
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
