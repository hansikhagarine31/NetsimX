import React, { useState } from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { ConsoleTab } from './ConsoleTab.jsx';
import { PacketInspector } from './PacketInspector.jsx';
import { RoutingTableTab } from './RoutingTableTab.jsx';
import { SimulationLogs } from './SimulationLogs.jsx';
import { CRCLabTab } from './CRCLabTab.jsx';
import { FramingLabTab } from './FramingLabTab.jsx';
import { SubnetCalcTab } from './SubnetCalcTab.jsx';
import {
  Terminal,
  Layers,
  Compass,
  FileText,
  Cpu,
  Boxes,
  Calculator,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';

const TABS = [
  { id: 'console', label: 'Console Terminal', icon: Terminal, color: 'text-cyan-400' },
  { id: 'inspector', label: 'Packet Inspector', icon: Layers, color: 'text-purple-400' },
  { id: 'routing', label: 'Routing & Dijkstra', icon: Compass, color: 'text-amber-400' },
  { id: 'logs', label: 'Simulation Logs', icon: FileText, color: 'text-emerald-400' },
  { id: 'crc', label: 'CRC Laboratory', icon: Cpu, color: 'text-rose-400' },
  { id: 'framing', label: 'Framing Laboratory', icon: Boxes, color: 'text-sky-400' },
  { id: 'subnet', label: 'Subnet Calculator', icon: Calculator, color: 'text-teal-400' }
];

export function BottomPanel() {
  const store = useNetworkStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (store.bottomPanelCollapsed !== undefined) {
      setIsCollapsed(store.bottomPanelCollapsed);
    }
  }, [store.bottomPanelCollapsed]);

  const activeTab = store.activeTab || 'console';

  return (
    <footer
      className={`bg-slate-900 border-t border-slate-800 flex flex-col z-30 transition-all duration-300 select-none ${
        isCollapsed
          ? 'h-10'
          : isMaximized
          ? 'h-[80vh]'
          : 'h-72'
      }`}
    >
      {/* Header Tab Bar */}
      <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  networkStore.setState({ activeTab: tab.id });
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-950 text-slate-100 border border-slate-800 shadow-md ring-1 ring-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title={isMaximized ? 'Restore height' : 'Maximize panel'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              const next = !isCollapsed;
              setIsCollapsed(next);
              networkStore.setState({ bottomPanelCollapsed: next });
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Tab Content Area */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {activeTab === 'console' && <ConsoleTab />}
          {activeTab === 'inspector' && <PacketInspector />}
          {activeTab === 'routing' && <RoutingTableTab />}
          {activeTab === 'logs' && <SimulationLogs />}
          {activeTab === 'crc' && <CRCLabTab />}
          {activeTab === 'framing' && <FramingLabTab />}
          {activeTab === 'subnet' && <SubnetCalcTab />}
        </div>
      )}
    </footer>
  );
}
