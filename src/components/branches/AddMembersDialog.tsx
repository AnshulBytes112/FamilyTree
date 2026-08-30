'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addMembersToBranch } from '@/app/family/[familyId]/branches/actions';
import { cn } from '@/lib/utils';

interface Person {
  id: string;
  name: string;
}

interface AddMembersDialogProps {
  familyId: string;
  branchId: string;
  allPeople: Person[];
  currentMemberIds: string[];
  triggerText?: string;
}

export function AddMembersDialog({ familyId, branchId, allPeople, currentMemberIds, triggerText = "Add Members" }: AddMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const filteredPeople = allPeople.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (currentMemberIds.includes(id)) return;
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;
    
    setLoading(true);
    await addMembersToBranch(familyId, branchId, Array.from(selectedIds));
    setLoading(false);
    
    setSelectedIds(new Set());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setSearch('');
        setSelectedIds(new Set());
      }
    }}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2">
        {triggerText}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Select members from your family to add to this branch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search family members..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-1">
            {filteredPeople.map(person => {
              const isAlreadyAdded = currentMemberIds.includes(person.id);
              const isSelected = selectedIds.has(person.id);
              
              return (
                <div 
                  key={person.id}
                  onClick={() => toggleSelection(person.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-transparent transition-colors",
                    isAlreadyAdded ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer hover:bg-slate-50",
                    isSelected && !isAlreadyAdded ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-50" : ""
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                    isAlreadyAdded ? "bg-slate-200 border-slate-300" : 
                    isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  )}>
                    {(isAlreadyAdded || isSelected) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{person.name}</p>
                  </div>
                  {isAlreadyAdded && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Added
                    </span>
                  )}
                </div>
              );
            })}
            
            {filteredPeople.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No members found.</p>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-slate-600">
              {selectedIds.size} selected
            </span>
            <Button 
              onClick={handleAdd} 
              disabled={selectedIds.size === 0 || loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Selected Members'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
