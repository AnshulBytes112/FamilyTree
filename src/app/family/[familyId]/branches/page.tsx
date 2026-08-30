import { Users } from 'lucide-react';
import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';

export default async function BranchesPage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const { familyId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  const branches = [
    { name: 'Sharma Family', members: 23, color: 'text-emerald-700 bg-emerald-50', badge: 'Main' },
    { name: 'Verma Family', members: 18, color: 'text-purple-700 bg-purple-50' },
    { name: 'Gupta Family', members: 14, color: 'text-blue-700 bg-blue-50' },
    { name: 'Malhotra Family', members: 12, color: 'text-orange-700 bg-orange-50' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Family Branches</h1>
          <p className="text-slate-500 font-medium">Coming Soon</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 opacity-80 pointer-events-none">
          {branches.map((branch, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${branch.color}`}>
                <Users size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{branch.name}</h3>
                  {branch.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {branch.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mb-4">{branch.members} Members</p>
                <p className="text-emerald-700 text-sm font-semibold">View Branch</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
