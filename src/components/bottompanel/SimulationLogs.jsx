import React from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { FileText, Trash2, Download } from 'lucide-react';

export function SimulationLogs() {
  const store = useNetworkStore();

  const handleExportLogs = () => {
    const logText = store.logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netsimx_simulation_logs_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col gap-3 font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <FileText className="w-4 h-4 text-cyan-400" />
          Simulation Event Audit Trail
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Logs
          </button>
          <button
            onClick={() => networkStore.clearLogs()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
        {store.logs.length === 0 ? (
          <div className="text-slate-600 italic p-4 text-center">No simulation events logged yet.</div>
        ) : (
          store.logs.map((log, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-300 leading-relaxed">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
