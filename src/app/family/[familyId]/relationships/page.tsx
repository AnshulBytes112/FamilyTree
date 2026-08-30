import { getTranslations } from 'next-intl/server';
import { ArrowRightLeft, Users } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';

export default async function RelationshipFinderPage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const { familyId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Relationship Finder</h1>
          <p className="text-slate-500 font-medium">Discover how two family members are connected.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
            
            {/* Person A */}
            <div className="flex-1 w-full border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-emerald-500 transition-colors cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Person A</p>
                <p className="font-medium text-slate-900">Select person...</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Users size={20} />
              </div>
            </div>

            {/* Swap Icon */}
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
              <ArrowRightLeft size={18} />
            </div>

            {/* Person B */}
            <div className="flex-1 w-full border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-emerald-500 transition-colors cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Person B</p>
                <p className="font-medium text-slate-900">Select person...</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Users size={20} />
              </div>
            </div>

          </div>

          <div className="mt-8 text-center">
            <button className={cn(buttonVariants({ size: "lg" }), "bg-emerald-700 hover:bg-emerald-800 text-white w-full md:w-auto md:px-12")}>
              Find Relationship
            </button>
          </div>
        </div>

        {/* Dummy Result Card matching screenshot */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-50 pointer-events-none">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-4">Relationship (Coming Soon)</p>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">First Cousin</h3>
              <p className="text-slate-600 font-medium text-sm flex items-center flex-wrap gap-2">
                <span>Anshul</span> <ArrowRightLeft size={14} className="text-slate-300" /> 
                <span>Rajesh</span> <ArrowRightLeft size={14} className="text-slate-300" /> 
                <span>Suresh</span> <ArrowRightLeft size={14} className="text-slate-300" /> 
                <span>Rohit</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
