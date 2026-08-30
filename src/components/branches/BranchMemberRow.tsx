'use client';

import { UserMinus, User } from 'lucide-react';
import { useState } from 'react';
import { removeMemberFromBranch } from '@/app/family/[familyId]/branches/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BranchMemberRowProps {
  familyId: string;
  branchId: string;
  person: {
    id: string;
    name: string;
    gender: string;
    date_of_birth: string | null;
  };
}

export function BranchMemberRow({ familyId, branchId, person }: BranchMemberRowProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(person.date_of_birth);

  const handleRemove = async () => {
    setLoading(true);
    await removeMemberFromBranch(familyId, branchId, person.id);
    setLoading(false);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
          <User size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{person.name}</p>
          <p className="text-sm text-slate-500">
            {person.gender === 'MALE' ? 'Male' : person.gender === 'FEMALE' ? 'Female' : 'Unknown'}
            {age !== null && ` · ${age} years`}
          </p>
        </div>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
          <UserMinus size={18} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from branch?</DialogTitle>
            <DialogDescription>
              This person will remain in your family, but will no longer appear in this branch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={loading}>
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
