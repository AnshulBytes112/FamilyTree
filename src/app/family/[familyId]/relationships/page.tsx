import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { createAdminClient } from '@/lib/supabase';
import { RelationshipFinderClient } from './RelationshipFinderClient';

export default async function RelationshipFinderPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ familyId: string }>;
  searchParams: Promise<{ from?: string, to?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { familyId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  // Fetch people directly for the selector
  const supabase = createAdminClient();
  const { data: people } = await supabase
    .from('people')
    .select('id, name, gender, date_of_birth')
    .eq('family_id', familyId)
    .order('name');
  
  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Relationship Finder</h1>
          <p className="text-slate-500 font-medium">Discover how two family members are connected.</p>
        </div>

        <RelationshipFinderClient 
          familyId={familyId} 
          people={people || []} 
          initialFrom={resolvedSearchParams.from}
          initialTo={resolvedSearchParams.to}
        />

      </div>
    </div>
  );
}
