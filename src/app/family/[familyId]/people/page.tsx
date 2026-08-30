/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getTranslations } from 'next-intl/server';
import { getFamilyPeople, searchPeople } from '@/app/family/[familyId]/people/actions';
import { Search, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function PeopleDirectoryPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ familyId: string }>,
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const { familyId } = resolvedParams;
  const q = resolvedSearch.q || '';
  
  const t = await getTranslations('people');
  
  let people: any[] = [];
  try {
    if (q) {
      people = await searchPeople(familyId, q);
    } else {
      people = await getFamilyPeople(familyId);
    }
  } catch (error) {
    // If unauthorized or not found, redirect to dash
    redirect(`/family/${familyId}`);
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('directory', { defaultMessage: 'People' })}</h1>
            <p className="text-slate-500 font-medium mt-1">
              {people.length} {t('familyMembers', { defaultMessage: 'family members' })}
            </p>
          </div>
          
          <Link 
            href={`/family/${familyId}/people/new`} 
            className={cn(buttonVariants({ size: "default" }), "bg-emerald-700 hover:bg-emerald-800 text-white")}
          >
            <UserPlus size={16} className="mr-2" /> {t('addFamilyMember', { defaultMessage: 'Add Family Member' })}
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <form action={`/family/${familyId}/people`} method="GET">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              name="q"
              defaultValue={q}
              placeholder={t('search', { defaultMessage: 'Search family' })}
              className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {people.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {q ? 'No family members found matching your search.' : 'No family members yet.'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {people.map((person) => (
                <li key={person.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <Link href={`/family/${familyId}/people/${person.id}`} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 text-lg">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-base">{person.name}</p>
                      {person.date_of_birth && (
                        <p className="text-sm text-slate-500">Born {new Date(person.date_of_birth).getFullYear()}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
