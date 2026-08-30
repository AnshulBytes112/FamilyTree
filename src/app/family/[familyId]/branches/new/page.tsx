'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createBranch } from '@/app/family/[familyId]/branches/actions';

export default function CreateBranchPage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = use(params);
  const { familyId } = resolvedParams;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await createBranch(familyId, formData);
    
    if (result.success) {
      router.push(`/family/${familyId}/branches/${result.branchId}`);
    } else {
      setError(result.error || 'Failed to create branch');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-6">
          <Link 
            href={`/family/${familyId}/branches`} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Create Branch</h1>
            <p className="text-slate-500 font-medium">Create a branch to organize members of your family.</p>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. Sharma Family"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="A short description of this branch..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all resize-y"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Create Branch
                </button>
                <Link
                  href={`/family/${familyId}/branches`}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
