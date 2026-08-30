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
  // Formatting place
  let place = data.place_of_birth || data.place_of_residence || '';

  // Displaying gender
  let genderDisplay = '';
  if (data.gender === 'MALE') genderDisplay = 'Male';
  else if (data.gender === 'FEMALE') genderDisplay = 'Female';
  else if (data.gender === 'OTHER') genderDisplay = 'Other';

  return (
    <div 
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm p-3 w-[260px] flex items-center gap-4 transition-colors",
        (selected || data.isHighlighted) ? "border-[#1E763A] bg-emerald-50/50" : "hover:border-slate-300"
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 w-0 h-0 border-0" />
      
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 shadow-inner">
        {data.name.charAt(0).toUpperCase()}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="font-bold text-slate-900 text-sm truncate">{data.name}</p>
        
        {/* Detail row 1: Place / Gender */}
        {(place || genderDisplay) && (
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {[place, genderDisplay].filter(Boolean).join(' • ')}
          </p>
        )}
        
        {/* Detail row 2: Years */}
        {years && (
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {years}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 w-0 h-0 border-0" />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
