'use client';

import { useState } from 'react';
import { ArrowRightLeft, Loader2, Users } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PersonSelector } from '@/components/PersonSelector';
import { findRelationshipAction } from './actions';
import { getRelationshipLabel } from '@/lib/family-tree/relationship-labels';

interface Person {
  id: string;
  name: string;
  gender: string;
  date_of_birth: string | null;
}

interface RelationshipFinderClientProps {
  familyId: string;
  people: Person[];
  initialFrom?: string;
  initialTo?: string;
}

export function RelationshipFinderClient({ familyId, people, initialFrom, initialTo }: RelationshipFinderClientProps) {
  const [personA, setPersonA] = useState<string | null>(
    initialFrom && people.find(p => p.id === initialFrom) ? initialFrom : null
  );
  const [personB, setPersonB] = useState<string | null>(
    initialTo && people.find(p => p.id === initialTo) ? initialTo : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSwap = () => {
    const temp = personA;
    setPersonA(personB);
    setPersonB(temp);
    setResult(null);
  };

  const handleFind = async () => {
    if (!personA || !personB) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await findRelationshipAction(familyId, personA, personB);
      if (res.success) {
        setResult(res.result);
      } else {
        setError(res.error || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          
          <PersonSelector
            label="Person A"
            people={people}
            value={personA}
            onChange={(val) => { setPersonA(val); setResult(null); setError(null); }}
            disabled={loading}
          />

          {/* Swap Icon */}
          <div 
            className={cn(
              "w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2 z-10 transition-colors",
              loading ? "text-slate-300" : "text-slate-500 hover:text-slate-700 hover:border-slate-300 cursor-pointer"
            )}
            onClick={!loading ? handleSwap : undefined}
          >
            <ArrowRightLeft size={18} />
          </div>

          <PersonSelector
            label="Person B"
            people={people}
            value={personB}
            onChange={(val) => { setPersonB(val); setResult(null); setError(null); }}
            disabled={loading}
          />

        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-8 text-center">
          <button 
            onClick={handleFind}
            disabled={!personA || !personB || loading}
            className={cn(
              buttonVariants({ size: "lg" }), 
              "bg-emerald-700 hover:bg-emerald-800 text-white w-full md:w-auto md:px-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Finding relationship...
              </span>
            ) : (
              'Find Relationship'
            )}
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-6 tracking-wide">Relationship Result</p>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Primary Relationship Status */}
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Users size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      {getRelationshipLabel(result.kind, 'en')}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                      <span className="truncate max-w-[120px] sm:max-w-xs">{people.find(p => p.id === personA)?.name}</span>
                      <ArrowRightLeft size={12} className="shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-xs">{people.find(p => p.id === personB)?.name}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Path details */}
            {result.path && result.path.length > 0 && result.kind !== 'NO_KNOWN_RELATIONSHIP' && (
              <div className="flex-1 md:border-l md:border-slate-100 md:pl-10">
                <p className="text-sm font-semibold text-slate-900 mb-4">Connection Path</p>
                <div className="flex flex-col gap-1 relative">
                  {/* Decorative line */}
                  <div className="absolute left-[11px] top-4 bottom-4 w-px bg-slate-200"></div>

                  {result.path.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white z-10 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                      </div>
                      <div className="pb-4 pt-0.5">
                        <p className="text-sm font-medium text-slate-900">{step.label}</p>
                        {idx < result.path.length - 1 && (
                          <p className="text-xs text-slate-400 capitalize mt-0.5">
                            ↓ {result.path[idx + 1].relation === 'parent' ? 'parent' : result.path[idx + 1].relation === 'child' ? 'child' : result.path[idx + 1].relation === 'spouse' ? 'spouse' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
