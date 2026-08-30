import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

export default async function SettingsPage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const { familyId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Family Settings</h1>
        </div>

        <div className="border-b border-slate-200 mb-8 flex gap-8">
          <div className="pb-3 border-b-2 border-emerald-600 text-emerald-700 font-semibold text-sm">General</div>
          <div className="pb-3 text-slate-500 font-medium text-sm">Privacy</div>
          <div className="pb-3 text-slate-500 font-medium text-sm">Manage Members</div>
          <div className="pb-3 text-slate-500 font-medium text-sm">Delete Family</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 opacity-60 pointer-events-none">
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Family Name</label>
              <input type="text" defaultValue="Sharma Family" className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Family Description</label>
              <textarea defaultValue="This is the official family tree of Sharma family." className="w-full h-24 border border-slate-200 rounded-lg p-3 focus:outline-none resize-none" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Default Language</label>
              <select className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none bg-white">
                <option>English</option>
              </select>
            </div>

            <div className="pt-2">
              <button className={cn(buttonVariants({ size: "default" }), "bg-emerald-700 text-white px-6")}>
                Save Changes
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Family Admin</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  A
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Anshul Sharma</p>
                  <p className="text-xs text-slate-500">Admin</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">Created On</p>
                  <p className="text-sm font-medium text-slate-900">12 Jan 2024</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Family ID</p>
                  <p className="text-sm font-medium text-slate-900 font-mono text-[10px]">ABCD1234</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
