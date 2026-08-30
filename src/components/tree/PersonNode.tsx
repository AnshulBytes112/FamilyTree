import { Handle, Position } from '@xyflow/react';
import { PersonData } from '@/lib/family-tree/tree-types';
import { cn } from '@/lib/utils';
import { memo } from 'react';

function PersonNodeComponent({ data, selected }: { data: PersonData, selected: boolean }) {
  // If date of death exists, show "(1950 - 2020)"
  // If only birth, show "(1950)"
  let years = '';
  if (data.date_of_birth) {
    const b = new Date(data.date_of_birth).getFullYear();
    if (data.date_of_death) {
      const d = new Date(data.date_of_death).getFullYear();
      years = `(${b} - ${d})`;
    } else {
      years = `(${b})`;
    }
  }

  return (
    <div 
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm p-3 w-[220px] flex items-center gap-3 transition-colors",
        selected ? "border-emerald-600 ring-1 ring-emerald-600" : "hover:border-emerald-300",
        data.isHighlighted ? "bg-emerald-50/50" : ""
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 w-0 h-0 border-0" />
      
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
        {data.name.charAt(0).toUpperCase()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm truncate">{data.name}</p>
        {years && <p className="text-xs text-slate-500 truncate">{years}</p>}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 w-0 h-0 border-0" />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
