'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { joinFamilyAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function JoinFamilyPage() {
  const t = useTranslations();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(joinFamilyAction, null);

  useEffect(() => {
    if (state?.success && state?.familyId) {
      router.push(`/family/${state.familyId}`);
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center">
        ← {t('common.back')}
      </Link>
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold">{t('joinFamily.title')}</CardTitle>
          <CardDescription className="text-base">{t('joinFamily.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-base font-semibold text-slate-700">
                {t('joinFamily.codeLabel')}
              </Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder={t('joinFamily.codePlaceholder')}
                required
                className="h-12 text-lg px-4 uppercase"
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-base font-semibold text-slate-700">
                {t('joinFamily.yourNameLabel')}
              </Label>
              <Input
                id="userName"
                name="userName"
                placeholder={t('joinFamily.yourNamePlaceholder')}
                required
                className="h-12 text-lg px-4"
              />
            </div>
            
            {state?.error && (
              <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
                {state.error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700" 
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {t('joinFamily.submitBtn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
