import React, { useState } from 'react';
import { networkStore } from '../../store/networkStore';
import { X, Activity, DollarSign, Wifi } from 'lucide-react';

export function LinkModal({ link, onClose }) {
  if (!link) return null;

  const [cost, setCost] = useState(link.data?.cost || 1);
  const [bandwidth, setBandwidth] = useState(link.data?.bandwidth || '100Mbps');
  const [status, setStatus] = useState(link.data?.status || 'up');

  const handleSave = () => {
    networkStore.updateLinkData(link.id, {
      cost: Number(cost),
      bandwidth,
      status
    });
    networkStore.addLog(`Updated Link ${link.id}: Cost=${cost}, Status=${status.toUpperCase()}`);
    onClose();
  };

  const handleDelete = () => {
    networkStore.deleteLink(link.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
            <Activity className="w-5 h-5" />
            Configure Link Properties
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Link Status (UP / DOWN)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('up')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  status === 'up'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 ring-2 ring-emerald-500/20'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}
              >
                ● UP (Active)
              </button>
              <button
                type="button"
                onClick={() => setStatus('down')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  status === 'down'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 ring-2 ring-rose-500/20'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}
              >
                ✕ DOWN (Broken)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              Link Metric Cost (Dijkstra Weight)
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-purple-400" />
              Bandwidth Speed
            </label>
            <select
              value={bandwidth}
              onChange={e => setBandwidth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="10Mbps">10 Mbps</option>
              <option value="100Mbps">100 Mbps (Fast Ethernet)</option>
              <option value="1Gbps">1 Gbps (Gigabit Ethernet)</option>
              <option value="10Gbps">10 Gbps (10G Ethernet)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleDelete}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            Delete Link
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              Save Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
