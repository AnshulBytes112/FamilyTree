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
  Plus
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
  const user = session.users;

  // Static mockup data
  const stats = [
    { label: t('stats.members'), value: "128" },
    { label: t('stats.generations'), value: "6" },
    { label: t('stats.branches'), value: "8" },
    { label: t('stats.photos'), value: "342" },
  ];

  const recentMembers = [
    { name: "Rohit Sharma", time: "2 days ago", img: "R" },
    { name: "Priya Sharma", time: "3 days ago", img: "P" },
    { name: "Karan Verma", time: "5 days ago", img: "K" },
  ];

  const recentActivity = [
    { text: "You added Rohit Sharma", time: "2 days ago", icon: "user", color: "bg-blue-100 text-blue-600" },
    { text: "Priya Sharma updated her profile", time: "3 days ago", icon: "update", color: "bg-blue-100 text-blue-600" },
    { text: "Karan Verma was added", time: "5 days ago", icon: "add", color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex min-h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <div className="text-emerald-700">
              <Trees size={22} />
            </div>
            <span>Our Family</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 bg-emerald-700 text-white rounded-lg font-medium text-sm">
            <LayoutDashboard size={18} />
            {t('nav.dashboard')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Network size={18} />
            {t('nav.familyTree')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Users size={18} />
            {t('nav.people')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <GitBranch size={18} />
            {t('nav.branches')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Search size={18} />
            {t('nav.relationshipFinder')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <ImageIcon size={18} />
            {t('nav.photos')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Calendar size={18} />
            {t('nav.events')}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            <Settings size={18} />
            {t('nav.settings')}
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <LanguageSwitcher />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{t('header.title')}</h1>
            <p className="text-slate-500 font-medium">{t('header.welcome', { name: user.name })}</p>
          </div>
          <Link 
            href={`/family/${resolvedParams.familyId}/invite`} 
            className={cn(buttonVariants({ size: "default" }), "bg-emerald-700 hover:bg-emerald-800 text-white rounded-md")}
          >
            <Plus size={16} className="mr-2" /> {t('header.addPerson')}
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border border-slate-200 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recently Added Members */}
          <Card className="border border-slate-200 shadow-sm rounded-xl">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{t('recentMembers.title')}</h3>
            </div>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {recentMembers.map((member, i) => (
                  <li key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                      {member.img}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{member.name}</p>
                      <p className="text-xs text-slate-500 truncate">{member.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 pt-2">
                <button className="text-emerald-700 text-sm font-semibold hover:underline">{t('recentMembers.viewAll')}</button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-slate-200 shadow-sm rounded-xl">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{t('recentActivity.title')}</h3>
            </div>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {recentActivity.map((activity, i) => (
                  <li key={i} className="flex gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", activity.color)}>
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900 text-sm">{activity.text}</p>
                      <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{activity.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 pt-2">
                <button className="text-emerald-700 text-sm font-semibold hover:underline">{t('recentActivity.viewAll')}</button>
              </div>
            </CardContent>
          </Card>

        </div>

      </main>
    </div>
  );
}
