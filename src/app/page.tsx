import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Trees } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8 py-12">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4">
          <Trees size={48} strokeWidth={1.5} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {t('heroTitle1')}
            <br />
            <span className="text-emerald-600">{t('heroTitle2')}</span>
          </h1>
          <p className="text-lg text-slate-600">
            {t('heroSubtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full pt-8">
          <Link href="/create-family" className={cn(buttonVariants({ size: "lg" }), "w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-primary-foreground")}>
            {t('createFamilyBtn')}
          </Link>
          <Link href="/join-family" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50")}>
            {t('joinFamilyBtn')}
          </Link>
        </div>

        <div className="pt-12">
          <p className="text-sm text-slate-400 font-medium">
            {t('footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
