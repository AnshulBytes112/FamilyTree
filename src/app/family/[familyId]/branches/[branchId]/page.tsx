import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { getBranchDetails } from '@/app/family/[familyId]/branches/actions';
import { createAdminClient } from '@/lib/supabase';
import { BranchMemberRow } from '@/components/branches/BranchMemberRow';
import { AddMembersDialog } from '@/components/branches/AddMembersDialog';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function BranchDetailsPage({ params }: { params: Promise<{ familyId: string, branchId: string }> }) {
  const resolvedParams = await params;
  const { familyId, branchId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  let branchData;
  try {
    branchData = await getBranchDetails(familyId, branchId);
  } catch {
    notFound();
  }
  
  const { branch, members } = branchData;
  const memberIds = members.map((m: any) => m.id);

  // Fetch all people in family for the add members dialog
  const supabase = createAdminClient();
  const { data: allPeople } = await supabase
    .from('people')
    .select('id, name')
    .eq('family_id', familyId)
    .order('name');
  
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        <div className="mb-6">
          <Link 
            href={`/family/${familyId}/branches`} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{branch.name}</h1>
              <p className="text-slate-500 font-medium mb-4">{members.length} Members</p>
              {branch.description && (
                <p className="text-slate-700 text-sm max-w-2xl">{branch.description}</p>
              )}
            </div>
            
            <div className="flex flex-row flex-wrap gap-3 shrink-0">
              <Link
                href={`/family/${familyId}/branches/${branchId}/edit`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-all"
              >
                <Pencil size={16} />
                Edit Branch
              </Link>
              <AddMembersDialog 
                familyId={familyId} 
                branchId={branchId} 
                allPeople={allPeople || []} 
                currentMemberIds={memberIds} 
              />
            </div>
          </div>
          
          <div className="p-6 md:p-8 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Members</h2>
            
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member: any) => (
                  <BranchMemberRow 
                    key={member.id} 
                    familyId={familyId} 
                    branchId={branchId} 
                    person={member} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-slate-200 border-dashed rounded-xl">
                <p className="text-lg font-bold text-slate-900 mb-1">0 Members</p>
                <p className="text-slate-500 mb-6">This branch doesn't have any members yet.</p>
                <AddMembersDialog 
                  familyId={familyId} 
                  branchId={branchId} 
                  allPeople={allPeople || []} 
                  currentMemberIds={memberIds} 
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
