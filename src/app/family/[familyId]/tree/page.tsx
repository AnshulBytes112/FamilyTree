import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { FamilyTreeCanvas } from '@/components/tree/FamilyTreeCanvas';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { buildTree } from '@/lib/family-tree/tree-builder';
import { getLayoutedElements } from '@/lib/family-tree/layout-tree';

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

  // Compute Layout ON THE SERVER (Heavy lifting)
  const { nodes: rawNodes, edges: rawEdges } = buildTree(people || [], relationships || []);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Header */}
      <div className="h-20 px-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between shrink-0 bg-[#fafafa] z-10 relative pt-4 md:pt-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[28px] font-[family-name:var(--font-playfair)] font-bold text-slate-900 tracking-tight">{t('familyTree', { defaultMessage: 'Family Tree' })}</h1>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <FamilyTreeCanvas 
          initialNodes={layoutedNodes}
          initialEdges={layoutedEdges}
          people={people || []} 
          relationships={relationships || []} 
          familyId={familyId} 
          initialPersonId={validPersonId} 
        />
      </div>
    </div>
  );
}
