import React from 'react';
import { networkStore } from '../../store/networkStore.js';
import { Monitor, Laptop, Server, Router, Network, Cpu, Cloud, Plus } from 'lucide-react';

const PALETTE_DEVICES = [
  { type: 'pc', label: 'PC', icon: Monitor, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60' },
  { type: 'laptop', label: 'Laptop', icon: Laptop, color: 'text-sky-400 bg-sky-950/60 border-sky-800/60' },
  { type: 'server', label: 'Server', icon: Server, color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' },
  { type: 'router', label: 'Router', icon: Router, color: 'text-purple-400 bg-purple-950/60 border-purple-800/60' },
  { type: 'switch', label: 'Switch', icon: Network, color: 'text-blue-400 bg-blue-950/60 border-blue-800/60' },
  { type: 'hub', label: 'Hub', icon: Cpu, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' },
  { type: 'cloud', label: 'Cloud', icon: Cloud, color: 'text-teal-400 bg-teal-950/60 border-teal-800/60' }
];

export function SidebarLeft() {
  const handleAdd = (deviceType) => {
    // Add node with randomized offset position near center
    const randomX = 250 + Math.floor(Math.random() * 200);
    const randomY = 180 + Math.floor(Math.random() * 200);
    networkStore.addNode(deviceType, { x: randomX, y: randomY });
  };

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-30 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Device Palette
        </h2>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Click to place device on topology canvas
        </p>
      </div>

      {/* Palette List */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {PALETTE_DEVICES.map(device => {
          const Icon = device.icon;
          return (
            <button
              key={device.type}
              onClick={() => handleAdd(device.type)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${device.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  {device.label}
                </span>
              </div>
              <Plus className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">💡 Topology Shortcuts:</p>
        <p>• Connect nodes by dragging handle-to-handle.</p>
        <p>• Click edge to change link cost / toggle DOWN.</p>
      </div>
    </aside>
  );
}
