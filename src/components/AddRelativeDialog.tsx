'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useActionState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, UserPlus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPerson, createParentRelationship, createSpouseRelationship, getFamilyPeople } from '@/app/family/[familyId]/people/actions';
import { useRouter } from 'next/navigation';

export function AddRelativeDialog({ familyId, personId, personName }: { familyId: string, personId: string, personName: string }) {
  const t = useTranslations('people');
  const router = useRouter();
  
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'type' | 'select' | 'new'>('type');
  const [relType, setRelType] = useState<'father' | 'mother' | 'spouse' | 'child' | null>(null);
  
  const [people, setPeople] = useState<any[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // Fetch people when dialog opens
  useEffect(() => {
    if (open && people.length === 0) {
      setLoadingPeople(true);
      getFamilyPeople(familyId)
        .then(data => setPeople(data.filter(p => p.id !== personId)))
        .finally(() => setLoadingPeople(false));
    }
  }, [open, familyId, personId, people.length]);

  const resetState = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep('type');
        setRelType(null);
      }, 300);
    }
  };

  const selectType = (type: 'father' | 'mother' | 'spouse' | 'child') => {
    setRelType(type);
    setStep('select'); // Next step is choosing existing vs new
  };

  // Form action for existing person
  const handleExisting = async (prevState: any, formData: FormData) => {
    const selectedId = formData.get('existingPersonId') as string;
    if (!selectedId || selectedId === 'none') return { error: 'Please select a person' };
    
    try {
      if (relType === 'father' || relType === 'mother') {
        await createParentRelationship(familyId, personId, selectedId);
      } else if (relType === 'child') {
        await createParentRelationship(familyId, selectedId, personId); // personId is the parent
      } else if (relType === 'spouse') {
        await createSpouseRelationship(familyId, personId, selectedId);
      }
      resetState(false);
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };
  const [existingState, existingAction, existingPending] = useActionState(handleExisting, null);

  // Form action for new person
  const handleNew = async (prevState: any, formData: FormData) => {
    try {
      // 1. Create Person
      const personRes = await createPerson(familyId, formData);
      if (!personRes.success || !personRes.personId) throw new Error(personRes.error);
      
      const newId = personRes.personId;
      
      // 2. Connect
      if (relType === 'father' || relType === 'mother') {
        await createParentRelationship(familyId, personId, newId);
      } else if (relType === 'child') {
        await createParentRelationship(familyId, newId, personId); // personId is the parent
      } else if (relType === 'spouse') {
        await createSpouseRelationship(familyId, personId, newId);
      }
      resetState(false);
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };
  const [newState, newAction, newPending] = useActionState(handleNew, null);

  return (
    <Dialog open={open} onOpenChange={resetState}>
      <DialogTrigger>
        <div className={cn(buttonVariants({ size: "default" }), "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer")}>
          <Plus size={16} className="mr-2" /> {t('addRelative', { defaultMessage: 'Add Relative' })}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        
        {step === 'type' && (
          <>
            <DialogHeader>
              <DialogTitle>{t('addRelative', { defaultMessage: 'Add Relative' })}</DialogTitle>
              <DialogDescription>
                {t('whoIsRelative', { name: personName, defaultMessage: `Who would you like to add for ${personName}?` })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 border-slate-200" onClick={() => selectType('father')}>
                <span className="font-semibold">{t('father', { defaultMessage: 'Father' })}</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 border-slate-200" onClick={() => selectType('mother')}>
                <span className="font-semibold">{t('mother', { defaultMessage: 'Mother' })}</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 border-slate-200" onClick={() => selectType('spouse')}>
                <span className="font-semibold">{t('spouse', { defaultMessage: 'Spouse' })}</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 border-slate-200" onClick={() => selectType('child')}>
                <span className="font-semibold">{t('child', { defaultMessage: 'Child' })}</span>
              </Button>
            </div>
          </>
        )}

        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="capitalize">{t(`add${relType}`, { defaultMessage: `Add ${relType}` })}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Button variant="outline" className="w-full justify-start h-12" onClick={() => setStep('new')}>
                <UserPlus size={16} className="mr-2 text-emerald-600" /> Create new person
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or select existing</span>
                </div>
              </div>

              <form action={existingAction} className="space-y-4">
                <Select name="existingPersonId">
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPeople ? "Loading..." : "Select family member"} />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {existingState?.error && <p className="text-sm text-destructive">{existingState.error}</p>}
                
                <Button type="submit" className="w-full bg-slate-900" disabled={existingPending}>
                  {existingPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect
                </Button>
              </form>
            </div>
          </>
        )}

        {step === 'new' && (
          <>
            <DialogHeader>
              <DialogTitle>Create New Person</DialogTitle>
            </DialogHeader>
            <form action={newAction} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" defaultValue={relType === 'father' ? 'MALE' : relType === 'mother' ? 'FEMALE' : 'UNKNOWN'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="UNKNOWN">Prefer not to specify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newState?.error && <p className="text-sm text-destructive">{newState.error}</p>}
              
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setStep('select')}>Back</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={newPending}>
                  {newPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create & Connect
                </Button>
              </div>
            </form>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
