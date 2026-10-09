import React, { useState, useEffect } from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { validateDeviceConfig } from '../../algorithms/ipValidator.js';
import { startPacketSimulation } from '../../simulation/simulationController.js';
import {
  Settings,
  Power,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle,
  Network,
  Globe,
  HardDrive,
  Loader2
} from 'lucide-react';

export function SidebarRight() {
  const store = useNetworkStore();
  const selectedNode = store.nodes.find(n => n.id === store.selectedNodeId);

  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    subnetMask: '',
    gateway: '',
    status: 'on'
  });

  const [validationResult, setValidationResult] = useState({ isValid: true, errors: [], warnings: [] });
  const [targetSelectId, setTargetSelectId] = useState('');
  const [protocol, setProtocol] = useState('ICMP');
  const isTransmitting = Boolean(store.simulationState?.isRunning);

  useEffect(() => {
    if (selectedNode) {
      setFormData({
        name: selectedNode.data?.name || '',
        ip: selectedNode.data?.ip || '',
        subnetMask: selectedNode.data?.subnetMask || '255.255.255.0',
        gateway: selectedNode.data?.gateway || '192.168.1.1',
        status: selectedNode.data?.status || 'on'
      });
      // Set default target node
      const otherNode = store.nodes.find(n => n.id !== selectedNode.id);
      if (otherNode) setTargetSelectId(otherNode.id);
    }
  }, [selectedNode, store.nodes]);

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-30 select-none p-6 justify-center items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
          <Settings className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-300 text-sm">No Device Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Click any device node on the topology canvas to configure its interfaces, IP address, and status.
        </p>
      </aside>
    );
  }

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Validate
    const res = validateDeviceConfig({ ...selectedNode, ...updated }, store.nodes);
    setValidationResult(res);

    // Save automatically
    networkStore.updateNodeData(selectedNode.id, updated);
  };

  const handleTogglePower = () => {
    const newStatus = formData.status === 'on' ? 'off' : 'on';
    handleChange('status', newStatus);
    networkStore.addLog(`Device ${selectedNode.data?.name} power toggled ${newStatus.toUpperCase()}`);
  };

  const handleSendPacket = () => {
    if (!targetSelectId || isTransmitting) return;
    const targetNode = store.nodes.find(n => n.id === targetSelectId);
    if (!targetNode) return;

    startPacketSimulation({
      sourceNode: selectedNode,
      targetNode,
      protocol,
      payload: `${protocol} transmission from ${selectedNode.data?.name}`
    });
  };

  const handleDelete = () => {
    networkStore.deleteNode(selectedNode.id);
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-30 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Settings className="w-4 h-4 text-cyan-400" />
          Device Configuration
        </div>
        <button
          onClick={handleTogglePower}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            formData.status === 'on'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
        >
          <Power className="w-3 h-3" />
          {formData.status === 'on' ? 'ONLINE' : 'OFFLINE'}
        </button>
      </div>

      {/* Content Form */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Device Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Device Hostname
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Readonly Type & MAC */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="block text-[10px] text-slate-500 font-semibold">DEVICE TYPE</span>
            <span className="font-mono text-cyan-400 font-semibold">
              {selectedNode.data?.deviceType?.toUpperCase()}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="block text-[10px] text-slate-500 font-semibold">MAC ADDRESS</span>
            <span className="font-mono text-slate-300 text-[10px]">
              {selectedNode.data?.mac}
            </span>
          </div>
        </div>

        {/* IP Configuration (Only if applicable) */}
        {selectedNode.data?.deviceType !== 'switch' && selectedNode.data?.deviceType !== 'hub' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              IPv4 Configuration
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                IP Address
              </label>
              <input
                type="text"
                value={formData.ip}
                onChange={e => handleChange('ip', e.target.value)}
                placeholder="192.168.1.10"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Subnet Mask
              </label>
              <input
                type="text"
                value={formData.subnetMask}
                onChange={e => handleChange('subnetMask', e.target.value)}
                placeholder="255.255.255.0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Default Gateway
              </label>
              <input
                type="text"
                value={formData.gateway}
                onChange={e => handleChange('gateway', e.target.value)}
                placeholder="192.168.1.1"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Validation Errors & Warnings */}
        {validationResult.errors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Invalid Configuration
            </div>
            {validationResult.errors.map((err, idx) => (
              <p key={idx} className="text-[11px] leading-tight">• {err}</p>
            ))}
          </div>
        )}

        {/* Quick Send Packet Tool */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              Send Packet Simulation
            </h4>
            <select
              value={protocol}
              onChange={e => setProtocol(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] font-mono text-cyan-400 font-bold"
            >
              <option value="ICMP">ICMP</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={targetSelectId}
              onChange={e => setTargetSelectId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="">Select Destination Target...</option>
              {store.nodes
                .filter(n => n.id !== selectedNode.id)
                .map(n => (
                  <option key={n.id} value={n.id}>
                    {n.data?.name} ({n.data?.ip || n.data?.deviceType})
                  </option>
                ))}
            </select>
            <button
              onClick={handleSendPacket}
              disabled={!targetSelectId || formData.status === 'off' || isTransmitting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                isTransmitting
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950'
              }`}
            >
              {isTransmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          Delete Device
        </button>
      </div>
    </aside>
  );
}
