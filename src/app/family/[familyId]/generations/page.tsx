import { getTranslations, getLocale } from 'next-intl/server';
import { createAdminClient } from '@/lib/supabase';
import { translateArray } from '@/lib/translate';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { calculateGenerations } from '@/lib/family-tree/generations';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { FilterSelect } from '@/components/people/FilterSelect';

export default async function GenerationsPage({ params, searchParams }: { params: Promise<{ familyId: string }>, searchParams: Promise<{ filter?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { familyId } = resolvedParams;
  const filter = resolvedSearchParams.filter || 'all';
  const t = await getTranslations();
  const supabase = createAdminClient();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ourfamily_session')?.value;

  if (!sessionToken) redirect('/');

  const { data: session } = await supabase
    .from('sessions')
    .select('users(*)')
    .eq('session_token', sessionToken)
    .single();

  if (!session || !session.users) redirect('/');

  const { data: allPeople } = await supabase
    .from('people')
    .select('id, name, gender, date_of_birth, date_of_death')
    .eq('family_id', familyId);

  const { data: allRelationships } = await supabase
    .from('relationships')
    .select('id, person_id, related_person_id, type')
    .eq('family_id', familyId);

  let filteredPeople = allPeople || [];
  if (filter !== 'all') {
    const filterUpper = filter.toUpperCase();
    filteredPeople = filteredPeople.filter(p => p.gender === filterUpper);
  }

  const locale = await getLocale();
  const translatedPeople = await translateArray(filteredPeople, ['name'], locale);

  const { generationGroups } = calculateGenerations(translatedPeople, allRelationships || []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-[family-name:var(--font-playfair)] font-bold text-slate-900 tracking-tight">
            {t('generations.title', { defaultMessage: 'Generations' })}
          </h1>
          <p className="text-slate-500 font-medium text-[15px]">
            {t('generations.subtitle', { defaultMessage: 'Explore your family members organized by their generation.' })}
          </p>
        </div>
        <div>
          <FilterSelect familyId={familyId} currentFilter={filter} basePath={`/family/${familyId}/generations`} />
        </div>
      </header>

      <div className="space-y-8">
        {generationGroups.length === 0 ? (
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-12 text-center text-slate-500">
              <Users size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1} />
              <p>{t('generations.noMembers', { defaultMessage: 'No members to display.' })}</p>
            </CardContent>
          </Card>
        ) : (
          generationGroups.map((group) => (
            <div key={group.generation} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {t('generations.gen', { defaultMessage: 'Gen' })} {group.generation}
                </span>
                <span className="text-slate-400 font-normal text-sm">
                  ({group.members.length} {group.members.length === 1 ? t('generations.member') : t('generations.members')})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.members.map(member => (
                  <Link href={`/family/${familyId}/people/${member.id}`} key={member.id}>
                    <Card className="hover:border-emerald-300 hover:shadow-md transition-all h-full rounded-xl cursor-pointer bg-white group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center font-bold text-slate-600 group-hover:text-emerald-700 shrink-0 transition-colors">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">{member.name}</p>
                          {member.date_of_birth && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {t('generations.born')} {new Date(member.date_of_birth).getFullYear()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
