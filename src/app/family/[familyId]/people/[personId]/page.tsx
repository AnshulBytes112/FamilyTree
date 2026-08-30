import { getTranslations } from 'next-intl/server';
import { getPersonWithRelationships } from '@/app/family/[familyId]/people/actions';
import { ChevronLeft, Edit, Plus, Network } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AddRelativeDialog } from '@/components/AddRelativeDialog'; 

export default async function PersonProfilePage({ params }: { params: Promise<{ familyId: string, personId: string }> }) {
  const resolvedParams = await params;
  const { familyId, personId } = resolvedParams;
  const t = await getTranslations();
  
  const { person, parents, children, spouses } = await getPersonWithRelationships(familyId, personId);

  // Helper to categorize parents
  const fathers = (parents as any[]).filter(p => p.related_person.gender === 'MALE');
  const mothers = (parents as any[]).filter(p => p.related_person.gender === 'FEMALE');
  const otherParents = (parents as any[]).filter(p => p.related_person.gender !== 'MALE' && p.related_person.gender !== 'FEMALE');

  const renderPersonList = (list: any[], relationshipField: string, emptyMessage: string) => {
    if (list.length === 0) {
      return <p className="text-slate-400 text-sm italic">—</p>;
    }
    return (
      <ul className="space-y-3">
        {list.map((item) => {
          const relPerson = item[relationshipField];
          return (
            <li key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                {relPerson.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <Link href={`/family/${familyId}/people/${relPerson.id}`} className="font-semibold text-sm text-slate-900 hover:underline">
                  {relPerson.name}
                </Link>
                {relPerson.date_of_birth && (
                  <p className="text-xs text-slate-500">Born {new Date(relPerson.date_of_birth).getFullYear()}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full mx-auto">
        
        <div className="mb-6">
          <Link href={`/family/${familyId}/people`} className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> {t('people.directory', { defaultMessage: 'People' })}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{person.name}</h1>
              <p className="text-slate-500 font-medium mt-1">
                {t('people.familyMember', { defaultMessage: 'Family Member' })} 
                {person.date_of_birth && ` • Born ${new Date(person.date_of_birth).getFullYear()}`}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-end">
              <Link 
                href={`/family/${familyId}/tree?person=${personId}`} 
                className={cn(buttonVariants({ variant: "outline" }), "text-slate-700")}
              >
                <Network size={16} className="mr-2" /> {t('people.viewInTree', { defaultMessage: 'View in Family Tree' })}
              </Link>
              <AddRelativeDialog familyId={familyId} personId={personId} personName={person.name} />
              <Link 
                href={`/family/${familyId}/people/${personId}/edit`} 
                className={cn(buttonVariants({ variant: "outline" }), "text-slate-700")}
              >
                <Edit size={16} className="mr-2" /> {t('common.edit', { defaultMessage: 'Edit' })}
              </Link>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">{t('people.family', { defaultMessage: 'Family' })}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Father */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('people.father', { defaultMessage: 'Father' })}</h3>
                {renderPersonList(fathers, 'related_person', '—')}
              </div>

              {/* Mother */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('people.mother', { defaultMessage: 'Mother' })}</h3>
                {renderPersonList(mothers, 'related_person', '—')}
              </div>

              {/* Other Parents */}
              {otherParents.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('people.parents', { defaultMessage: 'Parents' })}</h3>
                  {renderPersonList(otherParents, 'related_person', '—')}
                </div>
              )}

              {/* Spouses */}
              <div className="md:col-span-2 pt-4 border-t border-slate-50">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('people.spouse', { defaultMessage: 'Spouse' })}</h3>
                {renderPersonList(spouses, 'spouse', '—')}
              </div>

              {/* Children */}
              <div className="md:col-span-2 pt-4 border-t border-slate-50">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('people.children', { defaultMessage: 'Children' })}</h3>
                {renderPersonList(children, 'child_person', '—')}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
