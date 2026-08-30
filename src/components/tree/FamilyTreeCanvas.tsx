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

import { buildTree } from '@/lib/family-tree/tree-builder';
import { getLayoutedElements } from '@/lib/family-tree/layout-tree';
import { RawPerson, RawRelationship, FamilyTreeNode, FamilyTreeEdge } from '@/lib/family-tree/tree-types';
import { PersonNode } from './PersonNode';
import { UnionNode } from './UnionNode';
import { PersonSidePanel } from './PersonSidePanel';
import { Search, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';

const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
};

function FlowCanvas({ 
  people, 
  relationships, 
  familyId,
  initialPersonId
}: { 
  people: RawPerson[], 
  relationships: RawRelationship[], 
  familyId: string,
  initialPersonId?: string
}) {
  const t = useTranslations();
  const router = useRouter();
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyTreeNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FamilyTreeEdge>([]);
  
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

  const focusPerson = useCallback((id: string, currentNodes = nodes) => {
    const node = currentNodes.find(n => n.id === id);
    if (node) {
      setSelectedPersonId(id);
      // Center the node
      const x = node.position.x + 110; // half of 220 width
      const y = node.position.y + 40;  // half of 80 height
      setCenter(x, y, { zoom: 1.2, duration: 800 });
    }
  }, [nodes, setCenter]);

  // Compute Layout ONCE when data changes
  useEffect(() => {
    if (people.length === 0) return;
    const { nodes: rawNodes, edges: rawEdges } = buildTree(people, relationships);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // Slight delay to allow ReactFlow to render before fitting view
    setTimeout(() => {
      if (initialPersonId) {
        focusPerson(initialPersonId, layoutedNodes);
      } else {
        fitView({ padding: 0.2, duration: 800 });
      }
    }, 100);
  }, [people, relationships, initialPersonId, setNodes, setEdges, fitView, focusPerson]);

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
    <div className="flex-1 relative bg-[#fafafa]">
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
        
        {/* Top Header Panel */}
        <Panel position="top-left" className="m-4 md:m-6 w-[calc(100%-2rem)] md:w-96 flex flex-col gap-2 z-40">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-2 flex items-center">
            <Search className="text-slate-400 ml-2" size={20} />
            <input 
              type="text" 
              placeholder={t('people.search', { defaultMessage: 'Search person...' })} 
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm h-10"
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

        {/* Custom Controls (bottom left to match reference or standard react flow controls) */}
        <Panel position="bottom-left" className="m-4 md:m-6 flex flex-col gap-2 shadow-md rounded-lg overflow-hidden border border-slate-200">
          <button onClick={() => zoomIn({ duration: 300 })} className="w-10 h-10 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 border-b border-slate-100" title={t('people.zoomIn', { defaultMessage: 'Zoom In' })}>
            <ZoomIn size={18} />
          </button>
          <button onClick={() => zoomOut({ duration: 300 })} className="w-10 h-10 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 border-b border-slate-100" title={t('people.zoomOut', { defaultMessage: 'Zoom Out' })}>
            <ZoomOut size={18} />
          </button>
          <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="w-10 h-10 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600" title={t('people.fitView', { defaultMessage: 'Fit View' })}>
            <Maximize size={18} />
          </button>
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
