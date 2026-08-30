/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useTranslations } from 'next-intl';
import { useState, useActionState, useEffect } from 'react';
import { createPerson } from '@/app/family/[familyId]/people/actions';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function AddPersonPage() {
  const t = useTranslations();
  const params = useParams() as { familyId: string };
  const familyId = params.familyId;
  
  const [createdPersonId, setCreatedPersonId] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string>('');
  
  // Custom action wrapper to capture the name and handle the result
  const handleSubmit = async (prevState: any, formData: FormData) => {
    const name = formData.get('name') as string;
    const result = await createPerson(familyId, formData);
    if (result.success && result.personId) {
      setCreatedName(name);
      setCreatedPersonId(result.personId);
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  if (createdPersonId) {
    return (
      <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-8">
        <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-12">
          <div className="mx-auto bg-emerald-50 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('people.personAdded', { defaultMessage: 'Person Added' })}</h1>
          <p className="text-slate-500 mb-10">
            {t('people.personAddedDesc', { name: createdName, defaultMessage: `${createdName} has been added to your family.` })}
          </p>
          
          <h2 className="text-sm font-semibold text-slate-900 mb-4">{t('people.whatNext', { defaultMessage: 'What would you like to do next?' })}</h2>
          
          <div className="space-y-3">
            <Link 
              href={`/family/${familyId}/people/${createdPersonId}/relationships`} 
              className={cn(buttonVariants({ size: "lg" }), "w-full bg-emerald-700 hover:bg-emerald-800 text-white")}
            >
              {t('people.addRelationshipsBtn', { defaultMessage: 'Add Relationships' })}
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-slate-200"
              onClick={() => {
                setCreatedPersonId(null);
                setCreatedName('');
              }}
            >
              {t('people.addAnotherPersonBtn', { defaultMessage: 'Add Another Person' })}
            </Button>
            <Link 
              href={`/family/${familyId}/people/${createdPersonId}`} 
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "w-full text-slate-600")}
            >
              {t('people.viewPersonBtn', { defaultMessage: 'View Person' })}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center">
          <Link href={`/family/${familyId}`} className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> {t('common.back')}
          </Link>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{t('people.addFamilyMember', { defaultMessage: 'Add Family Member' })}</h1>
            <p className="text-slate-500 text-sm">{t('people.whoToAdd', { defaultMessage: 'Who would you like to add?' })}</p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-900">
                {t('people.nameLabel', { defaultMessage: 'Name' })}
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t('people.namePlaceholder', { defaultMessage: 'Full name' })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold text-slate-900">
                {t('people.genderLabel', { defaultMessage: 'Gender' })}
              </Label>
              <Select defaultValue="UNKNOWN" name="gender">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t('people.genderMale', { defaultMessage: 'Male' })}</SelectItem>
                  <SelectItem value="FEMALE">{t('people.genderFemale', { defaultMessage: 'Female' })}</SelectItem>
                  <SelectItem value="OTHER">{t('people.genderOther', { defaultMessage: 'Other' })}</SelectItem>
                  <SelectItem value="UNKNOWN">{t('people.genderUnknown', { defaultMessage: 'Prefer not to specify' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-sm font-semibold text-slate-900">
                  {t('people.dobLabel', { defaultMessage: 'Date of birth' })}
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_death" className="text-sm font-semibold text-slate-900">
                  {t('people.dodLabel', { defaultMessage: 'Date of death' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
                </Label>
                <Input
                  id="date_of_death"
                  name="date_of_death"
                  type="date"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_birth" className="text-sm font-semibold text-slate-900">
                {t('people.pobLabel', { defaultMessage: 'Place of birth' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
              </Label>
              <Input
                id="place_of_birth"
                name="place_of_birth"
                placeholder={t('people.optional', { defaultMessage: 'Optional' })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_residence" className="text-sm font-semibold text-slate-900">
                {t('people.porLabel', { defaultMessage: 'Place of residence' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
              </Label>
              <Input
                id="place_of_residence"
                name="place_of_residence"
                placeholder={t('people.optional', { defaultMessage: 'Optional' })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-900">
                {t('people.notesLabel', { defaultMessage: 'Notes' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder={t('people.optional', { defaultMessage: 'Optional' })}
                className="resize-none"
                rows={3}
              />
            </div>
            
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
                {t('people.addPersonBtn', { defaultMessage: 'Add Person' })}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
