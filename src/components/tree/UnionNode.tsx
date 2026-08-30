import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

function UnionNodeComponent() {
  return (
    <div className="w-2 h-2 rounded-full bg-transparent">
      {/* Target for spouses to connect INTO the union */}
      <Handle type="target" position={Position.Top} className="opacity-0 w-0 h-0 border-0" />
      
      {/* Source for children to connect FROM the union */}
      <Handle type="source" position={Position.Bottom} className="opacity-0 w-0 h-0 border-0" />
    </div>
  );
}

export const UnionNode = memo(UnionNodeComponent);
