'use client';

import { useTranslations } from 'next-intl';
import { useState, useActionState, useEffect } from 'react';
import { createParentRelationship, createSpouseRelationship, getFamilyPeople } from '@/app/family/[familyId]/people/actions';
import { buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AddRelationshipsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams() as { familyId: string, personId: string };
  
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFamilyPeople(params.familyId)
      .then(data => setPeople(data.filter(p => p.id !== params.personId))) // exclude self
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [params.familyId, params.personId]);

  const handleSubmit = async (prevState: any, formData: FormData) => {
    const fatherId = formData.get('fatherId') as string;
    const motherId = formData.get('motherId') as string;
    const spouseId = formData.get('spouseId') as string;

    try {
      if (fatherId && fatherId !== 'none') await createParentRelationship(params.familyId, params.personId, fatherId);
      if (motherId && motherId !== 'none') await createParentRelationship(params.familyId, params.personId, motherId);
      if (spouseId && spouseId !== 'none') await createSpouseRelationship(params.familyId, params.personId, spouseId);
      
      router.push(`/family/${params.familyId}/people/${params.personId}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save relationships' };
    }
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  const renderSelect = (name: string, label: string) => (
    <div className="space-y-3">
      <Label htmlFor={name} className="text-sm font-semibold text-slate-900">
        {label}
      </Label>
      <Select name={name} defaultValue="none">
        <SelectTrigger className="h-12 bg-slate-50/50">
          <SelectValue placeholder="Select family member" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-slate-400 italic">None selected</SelectItem>
          {people.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center">
          <Link href={`/family/${params.familyId}/people/${params.personId}`} className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> {t('common.back')}
          </Link>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{t('people.addRelationshipsBtn', { defaultMessage: 'Add Relationships' })}</h1>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-700" /></div>
          ) : (
            <form action={formAction} className="space-y-6">
              
              {renderSelect('fatherId', t('people.father', { defaultMessage: 'Father' }))}
              {renderSelect('motherId', t('people.mother', { defaultMessage: 'Mother' }))}
              {renderSelect('spouseId', t('people.spouse', { defaultMessage: 'Spouse' }))}
              
              {state?.error && (
                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  {state.error}
                </p>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  className={cn(buttonVariants({ size: "lg" }), "w-full h-12 text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm")} 
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : null}
                  {t('people.save', { defaultMessage: 'Save Relationships' })}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
