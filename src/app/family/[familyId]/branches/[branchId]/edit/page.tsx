'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { updateBranch, deleteBranch, getBranchDetails } from '@/app/family/[familyId]/branches/actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function EditBranchPage({ params }: { params: Promise<{ familyId: string, branchId: string }> }) {
  const resolvedParams = use(params);
  const { familyId, branchId } = resolvedParams;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [initialData, setInitialData] = useState<{name: string, description: string | null} | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    async function loadBranch() {
      try {
        const { branch } = await getBranchDetails(familyId, branchId);
        setInitialData({ name: branch.name, description: branch.description });
      } catch {
        setError('Branch not found');
      } finally {
        setFetching(false);
      }
    }
    loadBranch();
  }, [familyId, branchId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateBranch(familyId, branchId, formData);
    
    if (result.success) {
      router.push(`/family/${familyId}/branches/${branchId}`);
    } else {
      setError(result.error || 'Failed to update branch');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const result = await deleteBranch(familyId, branchId);
    if (result.success) {
      router.push(`/family/${familyId}/branches`);
    } else {
      setError(result.error || 'Failed to delete branch');
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={`/family/${familyId}/branches/${branchId}`} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Branch
          </Link>
          
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors">
              <Trash2 size={16} />
              Delete Branch
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Branch?</DialogTitle>
                <DialogDescription>
                  This will remove the branch and its member assignments. Your family members will NOT be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting...' : 'Delete Branch'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Edit Branch</h1>
          </div>

          <div className="p-6 md:p-8">
            {fetching ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : initialData ? (
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
                    defaultValue={initialData.name}
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
                    defaultValue={initialData.description || ''}
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
                    Save Changes
                  </button>
                  <Link
                    href={`/family/${familyId}/branches/${branchId}`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
                Failed to load branch details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
