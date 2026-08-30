'use client';

import { GitBranch } from 'lucide-react';
import Link from 'next/link';

interface BranchCardProps {
  familyId: string;
  branch: {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
  };
}

export function BranchCard({ familyId, branch }: BranchCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full hover:border-emerald-500 transition-colors shadow-sm hover:shadow-md">
      <div>
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
          <GitBranch size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{branch.name}</h3>
        {branch.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{branch.description}</p>
        )}
        <div className="mt-4 mb-6">
          <p className="font-medium text-slate-700">{branch.memberCount} Members</p>
        </div>
      </div>
      
      <Link 
        href={`/family/${familyId}/branches/${branch.id}`}
        className="w-full inline-flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
      >
        View Branch
      </Link>
    </div>
  );
}
