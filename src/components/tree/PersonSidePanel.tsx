import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import Link from 'next/link';
import { RawPerson, RawRelationship } from '@/lib/family-tree/tree-types';

export function PersonSidePanel({ 
  personId, 
  familyId, 
  onClose,
  people,
  relationships
}: { 
  personId: string, 
  familyId: string, 
  onClose: () => void,
  people: RawPerson[],
  relationships: RawRelationship[]
}) {
  const t = useTranslations('people');
  
  const person = people.find(p => p.id === personId);
  if (!person) return null;

  // Find relationships
  const parentEdges = relationships.filter(r => r.type === 'PARENT' && r.person_id === personId);
  const parents = parentEdges.map(e => people.find(p => p.id === e.related_person_id)).filter(Boolean) as RawPerson[];

  const childEdges = relationships.filter(r => r.type === 'PARENT' && r.related_person_id === personId);
  const children = childEdges.map(e => people.find(p => p.id === e.person_id)).filter(Boolean) as RawPerson[];

  const spouseEdges = relationships.filter(r => r.type === 'SPOUSE' && (r.person_id === personId || r.related_person_id === personId));
  const spouses = spouseEdges.map(e => {
    const sId = e.person_id === personId ? e.related_person_id : e.person_id;
    return people.find(p => p.id === sId);
  }).filter(Boolean) as RawPerson[];

  const renderList = (list: RawPerson[]) => {
    if (list.length === 0) return <p className="text-sm text-slate-400 italic">—</p>;
    return (
      <ul className="space-y-2">
        {list.map(p => (
          <li key={p.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700">{p.name}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="absolute top-0 right-0 h-full w-[320px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 transform transition-transform">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900 truncate pr-2">{person.name}</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 shrink-0 border border-slate-200">
            {person.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{person.name}</p>
            {person.date_of_birth && (
              <p className="text-sm text-slate-500">Born {new Date(person.date_of_birth).getFullYear()}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('parents', { defaultMessage: 'Parents' })}</h3>
          {renderList(parents)}
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('spouse', { defaultMessage: 'Spouse' })}</h3>
          {renderList(spouses)}
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('children', { defaultMessage: 'Children' })}</h3>
          {renderList(children)}
        </div>

      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <Link 
          href={`/family/${familyId}/people/${personId}`} 
          className="w-full flex items-center justify-center py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {t('viewPersonBtn', { defaultMessage: 'View Full Profile' })}
        </Link>
      </div>
    </div>
  );
}
