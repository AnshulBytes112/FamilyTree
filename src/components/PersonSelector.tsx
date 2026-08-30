'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, User, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Person {
  id: string;
  name: string;
  gender: string;
  date_of_birth?: string | null;
}

interface PersonSelectorProps {
  label: string;
  people: Person[];
  value: string | null;
  onChange: (personId: string) => void;
  disabled?: boolean;
}

export function PersonSelector({ label, people, value, onChange, disabled }: PersonSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPerson = people.find(p => p.id === value);
  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch('');
  };

  const calculateAge = (dob: string | null | undefined) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    // eslint-disable-next-line react-hooks/purity
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className={cn(
          "w-full border border-slate-200 rounded-lg p-4 flex items-center justify-between transition-colors bg-white",
          !disabled && "hover:border-emerald-500 cursor-pointer",
          open && "border-emerald-500 ring-1 ring-emerald-500",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50"
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
          {selectedPerson ? (
            <div className="flex flex-col">
              <p className="font-medium text-slate-900 truncate">{selectedPerson.name}</p>
              <p className="text-xs text-slate-500">
                {selectedPerson.gender === 'MALE' ? 'Male' : selectedPerson.gender === 'FEMALE' ? 'Female' : 'Unknown'}
                {selectedPerson.date_of_birth && ` · ${calculateAge(selectedPerson.date_of_birth)} years`}
              </p>
            </div>
          ) : (
            <p className="font-medium text-slate-400 truncate">Select person...</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 ml-4">
          <User size={20} />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center px-3 border-b border-slate-100">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search person..."
              className="w-full py-3 px-3 text-sm focus:outline-none bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredPeople.length > 0 ? (
              filteredPeople.map(person => (
                <div 
                  key={person.id}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 flex flex-col cursor-pointer transition-colors",
                    value === person.id && "bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-50"
                  )}
                  onClick={() => handleSelect(person.id)}
                >
                  <span>{person.name}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-slate-500 text-center">
                No family members found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
