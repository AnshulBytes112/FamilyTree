'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { createFamilyAction } from '@/app/actions';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CreateFamilyPage() {
  const t = useTranslations();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createFamilyAction, null);

  useEffect(() => {
    if (state?.success && state?.familyId) {
      router.push(`/family/${state.familyId}/invite`);
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white">
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-8">
        
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 mb-8 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> {t('common.back')}
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{t('createFamily.title')}</h1>
          <p className="text-slate-500 text-lg">{t('createFamily.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Form Area */}
          <div>
            <form action={formAction} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="familyName" className="text-sm font-semibold text-slate-900">
                  {t('createFamily.familyNameLabel')}
                </Label>
                <Input
                  id="familyName"
                  name="familyName"
                  placeholder={t('createFamily.familyNamePlaceholder')}
                  required
                  className="h-12 bg-slate-50/50"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="userName" className="text-sm font-semibold text-slate-900">
                  {t('createFamily.yourNameLabel')}
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  placeholder={t('createFamily.yourNamePlaceholder')}
                  required
                  className="h-12 bg-slate-50/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-900">
                  {t('createFamily.roleLabel')}
                </Label>
                <Select defaultValue="admin" name="role">
                  <SelectTrigger className="h-12 bg-slate-50/50">
                    <SelectValue placeholder={t('createFamily.rolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('createFamily.roleAdmin')}</SelectItem>
                    <SelectItem value="member">{t('createFamily.roleMember')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {state?.error && (
                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  {state.error}
                </p>
              )}

              <button 
                type="submit" 
                className={cn(buttonVariants({ size: "lg" }), "w-full h-14 text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white mt-4 shadow-sm")} 
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {t('createFamily.submitBtn')}
              </button>
            </form>
          </div>

          {/* Right Info Box */}
          <div className="hidden lg:flex">
            <div className="w-full max-w-sm bg-[#e8f5e9] rounded-2xl p-10 flex flex-col items-center justify-center text-center mx-auto border border-emerald-100/50">
              <div className="text-emerald-700 mb-6">
                <Users size={64} className="opacity-90" />
              </div>
              <p className="text-emerald-900 font-medium leading-relaxed">
                {t('createFamily.infoBoxText')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
