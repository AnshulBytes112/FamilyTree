'use client';

import { useTranslations } from 'next-intl';
import { useState, useActionState, useEffect } from 'react';
import { updatePerson, deletePerson } from '@/app/family/[familyId]/people/actions';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

export default function EditPersonPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams() as { familyId: string, personId: string };
  const { familyId, personId } = params;
  
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch person data directly using fetch to an API route, or a server action query. 
    // Since getPerson is not yet created for client, we'll import it from actions.
    import('@/app/family/[familyId]/people/actions').then(actions => {
      actions.getPersonWithRelationships(familyId, personId)
        .then(data => setPerson(data.person))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    });
  }, [familyId, personId]);

  const handleSubmit = async (prevState: any, formData: FormData) => {
    return await updatePerson(familyId, personId, formData);
  };
  
  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  useEffect(() => {
    if (state?.success) {
      router.push(`/family/${familyId}/people/${personId}`);
    }
  }, [state, router, familyId, personId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deletePerson(familyId, personId);
    if (res.success) {
      router.push(`/family/${familyId}/people`);
    } else {
      setIsDeleting(false);
      alert(res.error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-700 w-8 h-8" /></div>;
  if (!person) return <div className="p-20 text-center">Person not found</div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <Link href={`/family/${familyId}/people/${personId}`} className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> {t('common.back')}
          </Link>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger>
              <div className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer")}>
                <Trash2 size={16} className="mr-2" /> Delete
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('people.deleteTitle', { defaultMessage: 'Delete Person?' })}</DialogTitle>
                <DialogDescription>
                  {t('people.deleteDesc', { defaultMessage: 'This will remove this person from the family tree and remove their stored relationships.' })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Person
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{t('people.editPerson', { defaultMessage: 'Edit Person' })}</h1>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-900">
                {t('people.nameLabel', { defaultMessage: 'Name' })}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={person.name}
                required
                className="h-11 bg-slate-50/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-semibold text-slate-900">
                {t('people.genderLabel', { defaultMessage: 'Gender' })}
              </Label>
              <Select defaultValue={person.gender || 'UNKNOWN'} name="gender">
                <SelectTrigger className="h-11 bg-slate-50/50">
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
                  {t('people.dobLabel', { defaultMessage: 'Date of birth' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  defaultValue={person.date_of_birth || ''}
                  className="h-11 bg-slate-50/50"
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
                  defaultValue={person.date_of_death || ''}
                  className="h-11 bg-slate-50/50"
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
                defaultValue={person.place_of_birth || ''}
                className="h-11 bg-slate-50/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place_of_residence" className="text-sm font-semibold text-slate-900">
                {t('people.porLabel', { defaultMessage: 'Place of residence' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
              </Label>
              <Input
                id="place_of_residence"
                name="place_of_residence"
                defaultValue={person.place_of_residence || ''}
                className="h-11 bg-slate-50/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-900">
                {t('people.phoneLabel', { defaultMessage: 'Phone number' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={person.phone || ''}
                className="h-11 bg-slate-50/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-900">
                {t('people.notesLabel', { defaultMessage: 'Notes' })} <span className="text-slate-400 font-normal ml-1">({t('people.optional', { defaultMessage: 'Optional' })})</span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={person.notes || ''}
                className="bg-slate-50/50 resize-none"
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
                {t('people.save', { defaultMessage: 'Save' })}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
