import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DeviceNode } from './DeviceNode.jsx';
import { LinkEdge } from './LinkEdge.jsx';
import { LinkModal } from './LinkModal.jsx';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { Send, Zap } from 'lucide-react';

const nodeTypes = { deviceNode: DeviceNode };
const edgeTypes = { linkEdge: LinkEdge };

export function NetworkCanvas() {
  const store = useNetworkStore();
  const [activeEdgeModal, setActiveEdgeModal] = useState(null);

  const onNodesChange = useCallback((changes) => {
    // Handle position changes or node selection
    const updated = store.nodes.map(n => {
      const change = changes.find(c => c.id === n.id);
      if (change && change.type === 'position' && change.position) {
        return { ...n, position: change.position };
      }
      return n;
    });
    networkStore.setState({ nodes: updated });
  }, [store.nodes]);

  const onConnect = useCallback((params) => {
    networkStore.addLink(params.source, params.target);
  }, []);

  const onNodeClick = useCallback((_, node) => {
    networkStore.setState({ selectedNodeId: node.id });
  }, []);

  const onEdgeClick = useCallback((_, edge) => {
    setActiveEdgeModal(edge);
  }, []);

  const currentPacket = store.simulationState?.packets?.[0];
  const isSimulating = Boolean(store.simulationState?.isRunning);
  const activeNodeId = currentPacket?.path?.[currentPacket?.currentHopIndex];
  const prevNodeId =
    currentPacket && currentPacket.currentHopIndex > 0
      ? currentPacket.path?.[currentPacket.currentHopIndex - 1]
      : null;
  const pathEdgeIds = new Set(currentPacket?.pathEdges || []);

  // Format React Flow edges with live traversal animations and Dijkstra route highlight
  const flowEdges = store.links.map(l => {
    const isCurrentHop = Boolean(
      prevNodeId &&
      activeNodeId &&
      ((l.source === prevNodeId && l.target === activeNodeId) ||
       (l.source === activeNodeId && l.target === prevNodeId))
    );
    const isInPath =
      pathEdgeIds.has(l.id) ||
      Boolean(
        currentPacket?.path &&
        currentPacket.path.includes(l.source) &&
        currentPacket.path.includes(l.target)
      );

    return {
      ...l,
      type: 'linkEdge',
      animated: isCurrentHop || (isSimulating && isInPath),
      data: {
        ...l.data,
        isTraversing: isCurrentHop,
        isInPath: isInPath,
        packetProtocol: currentPacket?.protocol
      }
    };
  });

  // Format React Flow nodes with live packet indicator states
  const flowNodes = store.nodes.map(n => {
    const isCurrent = n.id === activeNodeId;
    const isSource = n.id === currentPacket?.sourceId;
    const isTarget = n.id === currentPacket?.targetId;
    const isDelivered = currentPacket?.status === 'DELIVERED' && isTarget;

    return {
      ...n,
      data: {
        ...n.data,
        hasPacket: isCurrent,
        isPacketSource: isSource,
        isPacketTarget: isTarget,
        isDelivered: isDelivered,
        packetProtocol: currentPacket?.protocol,
        packetStatus: currentPacket?.status
      }
    };
  });

  return (
    <div className="relative w-full h-full bg-slate-950 flex-1 overflow-hidden select-none">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
        colorMode="dark"
        className="bg-slate-950"
      >
        <Background color="#334155" gap={24} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 !rounded-xl overflow-hidden shadow-xl" />
        <MiniMap
          nodeColor="#00F0FF"
          maskColor="rgba(11, 15, 25, 0.85)"
          className="!bg-slate-900 !border-slate-800 !rounded-xl shadow-xl overflow-hidden"
        />
      </ReactFlow>

      {/* Edge Property Modal */}
      {activeEdgeModal && (
        <LinkModal
          link={activeEdgeModal}
          onClose={() => setActiveEdgeModal(null)}
        />
      )}
    </div>
  );
}
