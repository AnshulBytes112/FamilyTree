'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  Background
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { RawPerson, RawRelationship, FamilyTreeNode, FamilyTreeEdge } from '@/lib/family-tree/tree-types';
import { PersonNode } from './PersonNode';
import { UnionNode } from './UnionNode';
import { PersonSidePanel } from './PersonSidePanel';
import { Search, ZoomIn, ZoomOut, Maximize, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
};

function FlowCanvas({ 
  initialNodes,
  initialEdges,
  people, 
  relationships, 
  familyId,
  initialPersonId
}: { 
  initialNodes: FamilyTreeNode[],
  initialEdges: FamilyTreeEdge[],
  people: RawPerson[], 
  relationships: RawRelationship[], 
  familyId: string,
  initialPersonId?: string
}) {
  const t = useTranslations();
  const router = useRouter();
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyTreeNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FamilyTreeEdge>(initialEdges);
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(initialPersonId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RawPerson[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const focusPerson = useCallback((id: string, currentNodes?: FamilyTreeNode[]) => {
    // If not provided, we rely on the node's position from the instance, but typically we pass currentNodes on first load
    setSelectedPersonId(id);
    // Let the highlight effect run, and use a timeout to center using the updated react flow instance if needed
    // Or just use the passed nodes if available
    if (currentNodes) {
      const node = currentNodes.find(n => n.id === id);
      if (node) {
        const x = node.position.x + 110; 
        const y = node.position.y + 40;  
        setCenter(x, y, { zoom: 1.2, duration: 800 });
      }
    } else {
       // fallback for search
       // we can safely ignore centering here and let the user pan, or use getNodes() if imported
    }
  }, [setCenter]);

  // Initial View Setup
  useEffect(() => {
    if (people.length === 0) return;
    
    // Slight delay to allow ReactFlow to render before fitting view
    setTimeout(() => {
      if (initialPersonId) {
        const node = initialNodes.find(n => n.id === initialPersonId);
        if (node) {
          setSelectedPersonId(initialPersonId);
          setCenter(node.position.x + 110, node.position.y + 40, { zoom: 1.2, duration: 800 });
        }
      } else {
        fitView({ padding: 0.2, duration: 800 });
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodes, initialPersonId]);

  // Update Highlight/Selected state
  useEffect(() => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.type === 'person') {
          return {
            ...node,
            data: {
              ...node.data,
              isHighlighted: node.id === selectedPersonId
            },
            selected: node.id === selectedPersonId
          };
        }
        return node;
      })
    );
  }, [selectedPersonId, setNodes]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: FamilyTreeNode) => {
    if (node.type === 'union') return;
    
    if (isMobile) {
      // Mobile: redirect to profile directly
      router.push(`/family/${familyId}/people/${node.id}`);
    } else {
      // Desktop: Open side panel and focus
      // focusPerson is called directly inline if needed, but since we separated it,
      // we can rely on state effect or use setCenter directly here
      setSelectedPersonId(node.id);
      const x = node.position.x + 110;
      const y = node.position.y + 40;
      setCenter(x, y, { zoom: 1.2, duration: 800 });
    }
  }, [isMobile, familyId, router, setCenter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = people.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  if (people.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('people.emptyTreeTitle', { defaultMessage: 'Your family tree is waiting for its first member.' })}</h2>
        <p className="text-slate-500 mb-6">{t('people.emptyTreeDesc', { defaultMessage: 'Start by adding someone to your family.' })}</p>
        <button onClick={() => router.push(`/family/${familyId}/people/new`)} className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors">
          {t('people.addFamilyMember', { defaultMessage: 'Add Family Member' })}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#fafafa]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedPersonId(null)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="touch-none"
      >
        <Background color="#cbd5e1" gap={20} />
        
        {/* Top Right Panel for Search */}
        <Panel position="top-right" className="m-4 md:m-6 w-[calc(100%-2rem)] md:w-80 flex flex-col gap-2 z-40">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1.5 flex items-center">
            <Search className="text-slate-400 ml-2" size={18} />
            <input 
              type="text" 
              placeholder="Search person..."
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm h-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-h-60 overflow-y-auto">
              <ul className="divide-y divide-slate-100">
                {searchResults.map(p => (
                  <li key={p.id}>
                    <button 
                      onClick={() => {
                        focusPerson(p.id);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700"
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        {/* Left Controls Panel */}
        <Panel position="top-left" className="m-4 md:m-6 flex flex-col gap-1.5 z-40">
          <button onClick={() => {
            if (initialPersonId) focusPerson(initialPersonId, nodes);
            else fitView({ padding: 0.2, duration: 800 });
          }} className="w-10 h-10 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-sm border border-slate-200 rounded-lg mb-2" title="Home">
            <Home size={18} />
          </button>
          <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => zoomIn({ duration: 300 })} className="w-10 h-10 hover:bg-slate-50 flex items-center justify-center text-slate-700 border-b border-slate-100" title="Zoom In">
              <ZoomIn size={18} />
            </button>
            <button onClick={() => zoomOut({ duration: 300 })} className="w-10 h-10 hover:bg-slate-50 flex items-center justify-center text-slate-700 border-b border-slate-100" title="Zoom Out">
              <ZoomOut size={18} />
            </button>
            <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="w-10 h-10 hover:bg-slate-50 flex items-center justify-center text-slate-700" title="Fit View">
              <Maximize size={18} />
            </button>
          </div>
        </Panel>

      </ReactFlow>

      {/* Desktop Side Panel */}
      {!isMobile && selectedPersonId && (
        <PersonSidePanel 
          personId={selectedPersonId}
          familyId={familyId}
          onClose={() => setSelectedPersonId(null)}
          people={people}
          relationships={relationships}
        />
      )}
    </div>
  );
}

export function FamilyTreeCanvas(props: {
  initialNodes: FamilyTreeNode[],
  initialEdges: FamilyTreeEdge[],
  people: RawPerson[], 
  relationships: RawRelationship[], 
  familyId: string,
  initialPersonId?: string
}) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
