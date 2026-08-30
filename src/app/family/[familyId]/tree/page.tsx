import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { FamilyTreeCanvas } from '@/components/tree/FamilyTreeCanvas';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function FamilyTreePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ familyId: string }>,
  searchParams: Promise<{ person?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const { familyId } = resolvedParams;
  const initialPersonId = resolvedSearch.person;

  // Securely fetch data
  const { supabase } = await requireFamilyMember(familyId);
  const t = await getTranslations('people');

  // Fetch all people
  const { data: people, error: pError } = await supabase
    .from('people')
    .select('id, name, gender, date_of_birth, date_of_death')
    .eq('family_id', familyId);

  if (pError) throw pError;

  // Fetch all relationships
  const { data: relationships, error: rError } = await supabase
    .from('relationships')
    .select('id, person_id, related_person_id, type')
    .eq('family_id', familyId);

  if (rError) throw rError;

  // Check if person belongs to family if initialPersonId is passed
  let validPersonId = undefined;
  if (initialPersonId && people?.some(p => p.id === initialPersonId)) {
    validPersonId = initialPersonId;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 bg-white z-10 relative">
        <div className="flex items-center gap-4">
          <Link href={`/family/${familyId}`} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">{t('familyTree', { defaultMessage: 'Family Tree' })}</h1>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <FamilyTreeCanvas 
          people={people || []} 
          relationships={relationships || []} 
          familyId={familyId} 
          initialPersonId={validPersonId} 
        />
      </div>
    </div>
  );
}
