'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { createFamilyAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold">{t('createFamily.title')}</CardTitle>
          <CardDescription className="text-base">{t('createFamily.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="familyName" className="text-base font-semibold text-slate-700">
                {t('createFamily.familyNameLabel')}
              </Label>
              <Input
                id="familyName"
                name="familyName"
                placeholder={t('createFamily.familyNamePlaceholder')}
                required
                className="h-12 text-lg px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-base font-semibold text-slate-700">
                {t('createFamily.yourNameLabel')}
              </Label>
              <Input
                id="userName"
                name="userName"
                placeholder={t('createFamily.yourNamePlaceholder')}
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
              {t('createFamily.submitBtn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
