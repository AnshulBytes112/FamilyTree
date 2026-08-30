import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Trees, Users, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="text-primary">
            <Trees size={24} />
          </div>
          <span>Our Family</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#" className="hover:text-slate-900">{t('nav.features')}</Link>
          <Link href="#" className="hover:text-slate-900">{t('nav.howItWorks')}</Link>
          <Link href="#" className="hover:text-slate-900">{t('nav.pricing')}</Link>
          <Link href="#" className="hover:text-slate-900">{t('nav.about')}</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />
          <Link 
            href="/create-family" 
            className={cn(buttonVariants({ size: "default" }), "rounded-full px-4 sm:px-6 font-semibold shadow-md")}
          >
            {t('nav.getStarted')}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center pt-12 pb-24 gap-12 lg:gap-8">
        
        {/* Left Content */}
        <div className="flex-1 space-y-8 w-full max-w-2xl lg:max-w-none">
          <div className="space-y-4">
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              {t('hero.title1')} <br />
              {t('hero.title2')}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed pt-2">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              href="/create-family" 
              className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all")}
            >
              {t('createFamilyBtn')}
            </Link>
            <Link 
              href="/join-family" 
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-14 px-8 rounded-full text-base font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50")}
            >
              {t('joinFamilyBtn')}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-12 border-t border-slate-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Users size={20} />
                <span className="font-bold text-lg sm:text-xl text-slate-900">1,247+</span>
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stats.families')}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Users size={20} />
                <span className="font-bold text-lg sm:text-xl text-slate-900">25,000+</span>
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stats.members')}</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Trees size={20} />
                <span className="font-bold text-lg sm:text-xl text-slate-900">500+</span>
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('stats.generations')}</span>
            </div>
          </div>
        </div>

        {/* Right Illustration Placeholder */}
        <div className="flex-1 w-full h-[500px] bg-emerald-50 rounded-3xl relative overflow-hidden flex items-center justify-center border border-emerald-100">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
          <div className="text-center z-10 p-8">
            <Trees className="w-48 h-48 mx-auto text-emerald-200 mb-6" />
            <p className="text-emerald-700/60 font-medium">{t('illustrationPlaceholder')}</p>
          </div>
        </div>

      </main>
    </div>
  );
}
