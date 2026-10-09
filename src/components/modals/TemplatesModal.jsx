import React from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { TEMPLATES } from '../../data/networkTemplates.js';
import { X, FolderOpen, GraduationCap, Network, Play } from 'lucide-react';

export function TemplatesModal() {
  const store = useNetworkStore();
  if (!store.modals.templates) return null;

  const onClose = () => {
    networkStore.setState({ modals: { ...store.modals, templates: false } });
  };

  const handleSelect = (templateId) => {
    networkStore.loadTemplate(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
            <FolderOpen className="w-5 h-5" />
            Pre-Built Network Topology Templates
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {Object.values(TEMPLATES).map(tmpl => (
            <div
              key={tmpl.id}
              onClick={() => handleSelect(tmpl.id)}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 flex items-center gap-2">
                  {tmpl.id === 'demoScenario' && <GraduationCap className="w-4 h-4 text-purple-400" />}
                  {tmpl.name}
                </div>
                <p className="text-xs text-slate-400 max-w-md">{tmpl.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                  <span>Nodes: {tmpl.nodes.length}</span>
                  <span>Links: {tmpl.links.length}</span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950 font-bold text-xs transition-all shadow-md">
                <Play className="w-3.5 h-3.5 fill-current" /> Load
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
