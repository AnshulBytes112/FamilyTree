'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Trees, LayoutDashboard, Network, Users, Layers,
  GitBranch, Search, Image as ImageIcon, 
  Calendar, Settings, Menu, X, UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function AppSidebar({ familyId }: { familyId: string }) {
  const pathname = usePathname();
  const t = useTranslations('dashboard.nav');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: t('dashboard'), href: `/family/${familyId}`, icon: LayoutDashboard },
    { name: t('familyTree'), href: `/family/${familyId}/tree`, icon: Network },
    { name: t('people'), href: `/family/${familyId}/people`, icon: Users },
    { name: t('generations', { defaultMessage: 'Generations' }), href: `/family/${familyId}/generations`, icon: Layers },
    { name: t('branches'), href: `/family/${familyId}/branches`, icon: GitBranch },
    { name: t('relationshipFinder'), href: `/family/${familyId}/relationships`, icon: Search },
    { name: t('inviteMembers', { defaultMessage: 'Invite Members' }), href: `/family/${familyId}/invite`, icon: UserPlus },
    { name: t('photos'), href: `/family/${familyId}/photos`, icon: ImageIcon, disabled: true },
    { name: 'Events', href: `/family/${familyId}/events`, icon: Calendar, disabled: true },
    { name: t('settings', { defaultMessage: 'Settings' }), href: `/family/${familyId}/settings`, icon: Settings, disabled: true },
  ];

  const sidebarContent = (
    <>
      <div className="h-[72px] flex items-center px-6 border-b border-slate-100 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-playfair)] font-bold text-xl text-slate-900 tracking-tight">
          <span className="text-2xl leading-none" role="img" aria-label="tree">🌳</span>
          <span>Our Family</span>
        </Link>
      </div>
      
      <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Exact match for dashboard, prefix match for others
          const isActive = item.href === `/family/${familyId}` 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
            
          const Icon = item.icon;
          
          if (item.disabled) {
            return (
              <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 text-slate-400 font-medium text-sm cursor-not-allowed">
                <Icon size={18} />
                {item.name}
              </div>
            );
          }

          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive 
                  ? 'bg-[#1E763A] text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-500'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 shrink-0">
        <LanguageSwitcher />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <div className="text-emerald-700"><Trees size={20} /></div>
          <span>Our Family</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -mr-2 text-slate-600">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
