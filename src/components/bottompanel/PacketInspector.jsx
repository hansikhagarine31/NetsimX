import React from 'react';
import { useNetworkStore } from '../../store/networkStore.js';
import { Layers, ShieldCheck, ShieldAlert, ArrowRight, Activity, Database } from 'lucide-react';

export function PacketInspector() {
  const store = useNetworkStore();
  const sim = store.simulationState;
  const activePacket = sim.packets.find(p => p.id === sim.selectedPacketId) || sim.packets[0];

  if (!activePacket) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500">
        <Layers className="w-8 h-8 text-slate-700 mb-2" />
        <p className="text-xs font-semibold text-slate-400">No Active Packet Inspected</p>
        <p className="text-[10px] text-slate-500 max-w-[260px] mt-0.5">
          Click "Send Packet" on the top navbar or select a device to generate a packet traversal.
        </p>
      </div>
    );
  }

  const isDelivered = activePacket.status === 'DELIVERED';
  const isCorrupted = activePacket.status === 'CORRUPTED';
  const isDropped = activePacket.status === 'DROPPED';

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto font-sans">
      {/* Top Banner Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Packet Header Inspection #{activePacket.seqNum}
              <span className="font-mono text-[10px] text-slate-400">({activePacket.protocol})</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Timestamp: {activePacket.timestamp}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isDelivered && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-4 h-4" />
              VALID (DELIVERED)
            </span>
          )}
          {isCorrupted && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 text-xs font-bold shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-4 h-4" />
              CORRUPTED (CRC FAILED)
            </span>
          )}
          {isDropped && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-bold">
              <Activity className="w-4 h-4" />
              DROPPED / UNREACHABLE
            </span>
          )}
        </div>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">SOURCE IP</span>
          <span className="font-mono text-cyan-400 font-bold">{activePacket.sourceIp}</span>
          <span className="block text-[9px] text-slate-500 truncate mt-0.5">{activePacket.sourceName}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">DESTINATION IP</span>
          <span className="font-mono text-purple-400 font-bold">{activePacket.targetIp}</span>
          <span className="block text-[9px] text-slate-500 truncate mt-0.5">{activePacket.targetName}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">TTL & PROTOCOL</span>
          <span className="font-mono text-slate-200 font-bold">TTL: {activePacket.ttl} | {activePacket.protocol}</span>
          <span className="block text-[9px] text-slate-500 truncate mt-0.5">L3 Layer</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="block text-[10px] text-slate-500 font-semibold">CRC REMAINDER</span>
          <span className="font-mono text-emerald-400 font-bold">{activePacket.crc || '0000'}</span>
          <span className="block text-[9px] text-slate-500 truncate mt-0.5">CRC-16 Polynomial</span>
        </div>
      </div>

      {/* Hop Traversal Path */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          Topology Traversal Path
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {activePacket.path && activePacket.path.map((nodeId, idx) => (
            <React.Fragment key={nodeId}>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1">
                {nodeId}
              </div>
              {idx < activePacket.path.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Payload */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 font-mono">
        <span className="text-[10px] text-slate-500 font-semibold uppercase block">Data Payload</span>
        <div className="text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-800">
          {activePacket.payload}
        </div>
      </div>
    </div>
  );
}
