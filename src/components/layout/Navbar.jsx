import React from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  BookOpen,
  FolderOpen,
  Save,
  HardDrive,
  FileCode,
  GraduationCap,
  Sparkles,
  Network
} from 'lucide-react';
import { TEMPLATES } from '../../data/networkTemplates.js';
import { createPacket } from '../../simulation/packetFactory.js';
import { stepSimulationPacket } from '../../simulation/simulationEngine.js';
import { startPacketSimulation, stopPacketSimulation } from '../../simulation/simulationController.js';

export function Navbar() {
  const store = useNetworkStore();
  const sim = store.simulationState;

  const handleRunDemo = () => {
    networkStore.loadTemplate('demoScenario');
    networkStore.setState({ activeTab: 'console' });
    networkStore.addLog('Faculty Demo Network Loaded! PC1, Switch1, Router1, R2, R3, Server1 active.');
  };

  const handleSendDemoPacket = () => {
    const pc1 = store.nodes.find(n => n.id === 'pc1' || n.data?.name?.toLowerCase().includes('pc1'));
    const server1 = store.nodes.find(n => n.id === 'server1' || n.data?.name?.toLowerCase().includes('server'));

    if (!pc1 || !server1) {
      alert('Demo source PC1 or target Server1 not found. Loading Demo Scenario...');
      handleRunDemo();
      return;
    }

    startPacketSimulation({
      sourceNode: pc1,
      targetNode: server1,
      protocol: 'TCP',
      payload: 'GET /index.html HTTP/1.1'
    });
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 z-40 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
          <Network className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              NETSIMX
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
              LAB EDITION
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">
            Computer Networks Simulator & Protocol Engine
          </p>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1">
        <button
          onClick={handleSendDemoPacket}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          Send Packet
        </button>

        <button
          onClick={() => {
            const currentPkt = sim.packets[0];
            if (currentPkt) {
              const stepped = stepSimulationPacket(currentPkt, store.nodes, store.links);
              networkStore.setState({
                simulationState: { ...sim, packets: [stepped.packet] },
                activeTab: 'inspector'
              });
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          title="Step-by-step transmission visualizer"
        >
          <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
          Step
        </button>

        <button
          onClick={() => {
            stopPacketSimulation();
            networkStore.setState({
              simulationState: { ...sim, packets: [], isRunning: false }
            });
            networkStore.addLog('Simulation reset.');
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          title="Reset simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Shortcuts */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRunDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/80 hover:bg-purple-900/60 text-purple-300 font-semibold text-xs transition-all shadow-md"
        >
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span className="hidden md:inline">Faculty Demo</span>
        </button>

        <button
          onClick={() => networkStore.setState({ modals: { ...store.modals, templates: true } })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-all"
        >
          <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
          Templates
        </button>

        <button
          onClick={() => networkStore.setState({ modals: { ...store.modals, ftp: true } })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-all"
        >
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          FTP Lab
        </button>

        <button
          onClick={() => networkStore.setState({ modals: { ...store.modals, project: true } })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-all"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          Project
        </button>

        {/* Learning Mode Toggle */}
        <button
          onClick={() => networkStore.setState({ learningMode: !store.learningMode })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all ${
            store.learningMode
              ? 'bg-amber-950/60 border-amber-700 text-amber-300 ring-2 ring-amber-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Contextual Learning Mode"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Learning Mode</span>
        </button>
      </div>
    </header>
  );
}
