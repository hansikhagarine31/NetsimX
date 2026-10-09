import React, { useState, useRef, useEffect } from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { executeTerminalCommand } from '../../simulation/terminalCommands.js';
import { Terminal, CornerDownLeft } from 'lucide-react';

export function ConsoleTab() {
  const store = useNetworkStore();
  const selectedNode = store.nodes.find(n => n.id === store.selectedNodeId);

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { type: 'SYSTEM', text: 'NetSimX Virtual Network Console [Version 1.0.0]' },
    { type: 'SYSTEM', text: 'Type "help" to view supported networking commands (ping, traceroute, ipconfig, arp, route).' },
    { type: 'SYSTEM', text: `Active Device Context: ${selectedNode ? selectedNode.data?.name : 'None selected (click a device node on canvas)'}` }
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const promptText = `${selectedNode ? selectedNode.data?.name : 'NetSimX'}> ${inputVal}`;
    const userLine = { type: 'PROMPT', text: promptText };

    const responseLines = executeTerminalCommand(inputVal, selectedNode, store.nodes, store.links);

    if (responseLines.length === 1 && responseLines[0].type === 'CLEAR') {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, userLine, ...responseLines]);
    }

    setInputVal('');
  };

  const promptPrefix = `${selectedNode ? selectedNode.data?.name : 'NetSimX'}>`;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs p-3 overflow-hidden select-text">
      {/* Console Output Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
        {history.map((item, idx) => (
          <div key={idx} className="leading-relaxed">
            {item.type === 'PROMPT' ? (
              <span className="text-cyan-400 font-bold">{item.text}</span>
            ) : item.type === 'SYSTEM' ? (
              <span className="text-purple-400 font-medium">{item.text}</span>
            ) : (
              <span className="text-slate-300 whitespace-pre-wrap">{item.text}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Line Form */}
      <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
        <span className="text-cyan-400 font-bold shrink-0">{promptPrefix}</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="type ping 192.168.3.10 or help..."
          className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono"
          autoFocus
        />
        <button type="submit" className="text-slate-500 hover:text-cyan-400 p-1">
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
