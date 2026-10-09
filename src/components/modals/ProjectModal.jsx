import React, { useState } from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { X, Save, Upload, Download, HardDrive } from 'lucide-react';

export function ProjectModal() {
  const store = useNetworkStore();
  if (!store.modals.project) return null;

  const onClose = () => {
    networkStore.setState({ modals: { ...store.modals, project: false } });
  };

  const handleExportJSON = () => {
    const projectData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      devices: store.nodes,
      connections: store.links,
      logs: store.logs
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netsimx_topology_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    networkStore.addLog('Exported topology workspace JSON.');
    onClose();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.devices && imported.connections) {
          networkStore.setState({
            nodes: imported.devices,
            links: imported.connections,
            logs: [`[${new Date().toLocaleTimeString()}] Imported project: ${file.name}`, ...store.logs]
          });
          onClose();
        } else {
          alert('Invalid NetSimX topology JSON structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <Save className="w-5 h-5" />
            Project Storage & Persistence
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 group-hover:text-emerald-300">
                Export Workspace JSON
              </div>
              <p className="text-xs text-slate-400">Download current network topology, devices, and link parameters.</p>
            </div>
          </button>

          <label className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group">
            <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-300">
                Import Topology JSON
              </div>
              <p className="text-xs text-slate-400">Load a saved JSON topology file into the workspace canvas.</p>
            </div>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
