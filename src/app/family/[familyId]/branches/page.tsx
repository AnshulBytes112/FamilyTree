import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { getBranches } from '@/app/family/[familyId]/branches/actions';
import { BranchCard } from '@/components/branches/BranchCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function BranchesDirectoryPage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const { familyId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  const branches = await getBranches(familyId);
  
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Family Branches</h1>
            <p className="text-slate-500 font-medium">Organize your family into branches.</p>
          </div>
          
          <Link
            href={`/family/${familyId}/branches/new`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus size={18} />
            Create Branch
          </Link>
        </div>

        {branches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {branches.map((branch: any) => (
              <BranchCard key={branch.id} familyId={familyId} branch={branch} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm text-center px-4">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No branches yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm">Create your first branch to start organizing your family members.</p>
            <Link
              href={`/family/${familyId}/branches/new`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus size={18} />
              Create Branch
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
