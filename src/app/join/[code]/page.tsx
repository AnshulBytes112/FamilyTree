'use client';

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { joinFamilyAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, use } from 'react';
import Link from 'next/link';

export default function AutoJoinFamilyPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(joinFamilyAction, null);

  useEffect(() => {
    if (state?.success && state?.familyId) {
      router.push(`/family/${state.familyId}/people/new?welcome=true`);
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto bg-emerald-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <Users className="text-emerald-600" size={32} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{t('joinFamily.title')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('joinFamily.autoJoinDesc')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="inviteCode" value={resolvedParams.code} />
            
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
