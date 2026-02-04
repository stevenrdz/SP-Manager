"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  Panel,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { parseSqlFlow, generateReactFlowData, RFNode, RFEdge } from "@/lib/sqlParser";
import { Loader2, Database, Play, Square, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Custom Node Components ---

const CustomNode = ({ data }: NodeProps) => {
  const bgColor = useMemo(() => {
    switch (data.type) {
      case 'params': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
      case 'select': return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-500';
      case 'insert':
      case 'update':
      case 'delete': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500';
      case 'if':
      case 'else': return 'border-purple-500/50 bg-purple-500/10 text-purple-500';
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  }, [data.type]);

  return (
    <div className={`px-4 py-3 rounded-xl border-2 backdrop-blur-md shadow-lg ${bgColor} min-w-[180px] transition-all hover:scale-105 duration-300`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-700 border-2 border-slate-600" />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          {String(data.label)}
        </span>
        <span className="text-sm font-semibold leading-tight text-white/90">
          {String(data.subLabel || '')}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-700 border-2 border-slate-600" />
    </div>
  );
};

const TableNode = ({ data }: NodeProps) => {
  return (
    <div 
      className="px-4 py-2 rounded-full border border-lime-500/50 bg-lime-500/10 text-lime-400 backdrop-blur-sm shadow-md flex items-center gap-2 cursor-pointer hover:bg-lime-500/20 transition-colors"
      onClick={() => (window as any).handleTableClick?.(data.label)}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Database className="w-4 h-4" />
      <span className="text-sm font-medium">{String(data.label)}</span>
    </div>
  );
};

const SpecialNode = ({ data }: NodeProps) => {
  const isStart = data.type === 'start';
  return (
    <div className={`px-6 py-2 rounded-full border-2 ${isStart ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-500 bg-slate-500/20 text-slate-400'} shadow-xl flex items-center gap-3`}>
      {isStart && <Handle type="source" position={Position.Bottom} className="w-3 h-3" />}
      {!isStart && <Handle type="target" position={Position.Top} className="w-3 h-3" />}
      {isStart ? <Play className="w-4 h-4 fill-current" /> : <Square className="w-4 h-4 fill-current" />}
      <span className="text-sm font-bold tracking-wider">{String(data.label)}</span>
      {isStart && !!data.subLabel && <span className="text-[10px] opacity-60 ml-2">{String(data.subLabel)}</span>}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
  table: TableNode,
  special: SpecialNode,
};

// --- Layout Logic ---

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- Main Component ---

interface SPFlowProps {
  sql: string;
  spName: string;
  onTableClick: (tableName: string) => void;
}

function SPFlowBase({ sql, spName, onTableClick }: SPFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (window as any).handleTableClick = onTableClick;
  }, [onTableClick]);

  useEffect(() => {
    setLoading(true);
    try {
      const steps = parseSqlFlow(sql);
      const { nodes: initialNodes, edges: initialEdges } = generateReactFlowData(steps, spName);
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes as unknown as Node[], 
        initialEdges as unknown as Edge[]
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      console.error("React Flow Initialization error:", err);
    } finally {
      setLoading(false);
    }
  }, [sql, spName, setNodes, setEdges]);

  return (
    <div className="relative border rounded-xl bg-[#0a0f1d] p-0 h-[600px] overflow-hidden flex flex-col">
      <div className="flex-1 w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1d]/80 z-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <span className="text-blue-400 font-medium animate-pulse">Analizando Flujo SQL...</span>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          style={{ background: '#0a0f1d' }}
        >
          <Background color="#1e293b" variant={'dots' as any} gap={20} size={1} />
          <Controls className="bg-slate-800 border-slate-700 fill-slate-300" />
          
          <Panel position="top-left" className="bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-white/5 shadow-2xl m-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Mapa de Flujo de Negocio
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold italic">
                {spName}
              </p>
            </div>
          </Panel>

          <Panel position="bottom-right" className="m-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                   const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
                   setNodes(layoutedNodes);
                }}
              >
                Auto-Alinear Nodos
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      <style jsx global>{`
        .react-flow__handle {
          width: 8px;
          height: 8px;
          background: #475569;
          border: 2px solid #1e293b;
        }
        .react-flow__edge-path {
          stroke: #475569;
          stroke-width: 2;
          transition: stroke 0.3s, stroke-width 0.3s;
        }
        .react-flow__edge.animated .react-flow__edge-path {
          stroke: #3b82f6;
          stroke-dasharray: 5;
          animation: react-flow__dash-animation 0.5s linear infinite;
        }
        .react-flow__controls-button {
          background: #1e293b;
          border-color: #334155;
          color: #94a3b8;
        }
        .react-flow__controls-button:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

export function SPFlow(props: SPFlowProps) {
  return (
    <ReactFlowProvider>
      <SPFlowBase {...props} />
    </ReactFlowProvider>
  );
}
