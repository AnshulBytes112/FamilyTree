import { getTranslations, getLocale } from 'next-intl/server';
import { getFamilyPeople, searchPeople } from '@/app/family/[familyId]/people/actions';
import { translateArray } from '@/lib/translate';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { FilterSelect } from '@/components/people/FilterSelect';
import { PersonListRow } from '@/components/people/PersonListRow';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function PeopleDirectoryPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ familyId: string }>,
  searchParams: Promise<{ q?: string, filter?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const { familyId } = resolvedParams;
  const q = resolvedSearch.q || '';
  const filter = resolvedSearch.filter || 'all';
  
  const t = await getTranslations('people');
  
  let people: any[] = [];
  try {
    if (q) {
      people = await searchPeople(familyId, q);
    } else {
      people = await getFamilyPeople(familyId);
    }
  } catch (error) {
    redirect(`/family/${familyId}`);
  }

  // In-memory filter for gender
  let filteredPeople = people;
  if (filter === 'male') {
    filteredPeople = people.filter(p => p.gender === 'MALE');
  } else if (filter === 'female') {
    filteredPeople = people.filter(p => p.gender === 'FEMALE');
  } else if (filter === 'unknown') {
    filteredPeople = people.filter(p => p.gender === 'UNKNOWN' || p.gender === 'OTHER');
  }

  const locale = await getLocale();
  const translatedPeople = await translateArray(filteredPeople, ['name'], locale);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fafafa] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Header Area */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <h1 className="text-[28px] font-[family-name:var(--font-playfair)] font-bold tracking-tight text-slate-900">
                {t('directory', { defaultMessage: 'People Directory' })}
              </h1>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <form action={`/family/${familyId}/people`} method="GET" className="relative flex-1 sm:w-64">
                  {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="q"
                    defaultValue={q}
                    placeholder={t('searchPeople', { defaultMessage: 'Search people...' })}
                    className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-[15px]"
                  />
                </form>

                {/* Filter */}
                <FilterSelect familyId={familyId} currentQuery={q} currentFilter={filter} />

                {/* Add Person */}
                <Link 
                  href={`/family/${familyId}/people/new`}
                  className={cn(buttonVariants({ size: "default" }), "bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg h-11 px-3 sm:px-4 shrink-0")}
                >
                  <Plus size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">{t('addPersonBtn', { defaultMessage: 'Add Person' })}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* List Area */}
          <div className="flex flex-col">
            {filteredPeople.length === 0 ? (
              <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
                <p className="text-slate-900 font-medium text-lg mb-2">
                  {q || filter !== 'all' 
                    ? t('noResults', { defaultMessage: 'No family members match your search.' }) 
                    : t('noMembers', { defaultMessage: 'No family members yet.' })}
                </p>
                {!q && filter === 'all' && (
                  <>
                    <p className="text-slate-500 mb-8 max-w-sm">
                      {t('addFirstMember', { defaultMessage: 'Add your first family member to start building your family tree.' })}
                    </p>
                    <Link 
                      href={`/family/${familyId}/people/new`}
                      className={cn(buttonVariants({ size: "default" }), "bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-6")}
                    >
                      <Plus size={18} className="mr-2" />
                      {t('addPersonBtn', { defaultMessage: 'Add Person' })}
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div>
                {translatedPeople.map((person) => (
                  <PersonListRow 
                    key={person.id} 
                    person={person} 
                    familyId={familyId} 
                    relationship={t('familyMember', { defaultMessage: 'Family Member' })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
