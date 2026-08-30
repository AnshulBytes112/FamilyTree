import { requireFamilyMember } from '@/app/family/[familyId]/people/actions';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Image as ImageIcon, Download, Share2, Network } from 'lucide-react';

export default async function ExportPage({ params }: { params: Promise<{ familyId: string }> }) {
  const resolvedParams = await params;
  const { familyId } = resolvedParams;
  await requireFamilyMember(familyId);
  
  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Export Family Tree</h1>
          <p className="text-slate-500 font-medium">Choose the format and range to export your family tree.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-60 pointer-events-none">
          
          {/* Left panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Export Range</label>
                  <div className="h-10 border border-slate-200 rounded-lg px-3 flex items-center bg-slate-50 text-slate-700 font-medium">
                    Entire Family
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Format</label>
                  <div className="h-10 border border-slate-200 rounded-lg px-3 flex items-center bg-slate-50 text-slate-700 font-medium">
                    PDF
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="border-2 border-emerald-500 bg-emerald-50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <FileText className="text-emerald-600" size={24} />
                  <span className="text-xs font-bold text-emerald-800">PDF</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50">
                  <ImageIcon className="text-slate-400" size={24} />
                  <span className="text-xs font-bold text-slate-500">PNG</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50">
                  <Share2 className="text-slate-400" size={24} />
                  <span className="text-xs font-bold text-slate-500">SVG</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50">
                  <Download className="text-slate-400" size={24} />
                  <span className="text-xs font-bold text-slate-500">JSON</span>
                </div>
              </div>

              <div className="pt-4">
                <button className={cn(buttonVariants({ size: "lg" }), "bg-emerald-700 text-white w-full h-12")}>
                  Export Now
                </button>
              </div>

            </div>
          </div>

          {/* Right panel (Preview) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Preview</h3>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center min-h-[300px]">
              <div className="text-center opacity-50 flex flex-col items-center gap-3">
                <Network size={32} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-500">Preview Generation...</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
