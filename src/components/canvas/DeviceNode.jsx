import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, Laptop, Server, Router, Network, Cpu, Cloud, ZapOff } from 'lucide-react';

const DEVICE_ICONS = {
  pc: Monitor,
  laptop: Laptop,
  server: Server,
  router: Router,
  switch: Network,
  hub: Cpu,
  cloud: Cloud
};

export const DeviceNode = React.memo(({ data, selected }) => {
  const DeviceIcon = DEVICE_ICONS[data.deviceType] || Monitor;
  const isOff = data.status === 'off';

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer min-w-[140px] shadow-lg ${
        data?.hasPacket
          ? 'border-amber-400 bg-slate-900/95 ring-4 ring-amber-400/40 shadow-amber-400/30 scale-[1.03]'
          : data?.isDelivered
          ? 'border-emerald-400 bg-slate-900/95 ring-4 ring-emerald-400/40 shadow-emerald-400/30'
          : selected
          ? 'border-cyan-400 bg-slate-900/95 ring-4 ring-cyan-500/20 shadow-cyan-500/20'
          : isOff
          ? 'border-slate-700 bg-slate-950/80 opacity-60'
          : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Floating Packet Active Badge */}
      {data?.hasPacket && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-cyan-500/50 animate-bounce whitespace-nowrap uppercase tracking-wider">
          <span>📦</span>
          <span>{data.packetProtocol || 'PACKET'}</span>
        </div>
      )}
      {data?.isDelivered && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/50 whitespace-nowrap uppercase tracking-wider">
          <span>✅</span>
          <span>DELIVERED</span>
        </div>
      )}

      {/* Top Handle for Connection */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-950 hover:scale-125 transition-transform"
      />

      <div className="flex items-center gap-3">
        {/* Device Icon Badge */}
        <div
          className={`p-2.5 rounded-lg flex items-center justify-center relative ${
            isOff
              ? 'bg-slate-800 text-slate-500'
              : data.deviceType === 'router'
              ? 'bg-purple-950/80 text-purple-400 border border-purple-800/50'
              : data.deviceType === 'server'
              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
              : data.deviceType === 'switch'
              ? 'bg-blue-950/80 text-blue-400 border border-blue-800/50'
              : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
          }`}
        >
          {isOff ? <ZapOff className="w-5 h-5 text-rose-400" /> : <DeviceIcon className="w-5 h-5" />}

          {/* Status Dot */}
          <span
            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
              isOff ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
            }`}
          />
        </div>

        {/* Device Text */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xs text-slate-100 truncate flex items-center gap-1">
            {data.name || 'Device'}
          </div>
          {data.ip ? (
            <div className="text-[10px] font-mono text-cyan-400/90 truncate mt-0.5">
              {data.ip}
            </div>
          ) : (
            <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
              {data.deviceType?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Handle for Connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-400 !w-3 !h-3 !border-2 !border-slate-950 hover:scale-125 transition-transform"
      />
    </div>
  );
});

DeviceNode.displayName = 'DeviceNode';
