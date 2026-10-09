import React from 'react';
import { useNetworkStore, networkStore } from '../../store/networkStore.js';
import { BookOpen, Sparkles, X, CheckCircle2, HelpCircle } from 'lucide-react';

export function LearningDrawer() {
  const store = useNetworkStore();
  if (!store.learningMode) return null;

  return (
    <div className="absolute top-16 right-4 z-40 w-80 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3 font-sans text-xs select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Learning Mode — Concept Breakdown
        </div>
        <button
          onClick={() => networkStore.setState({ learningMode: false })}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-1">
          <div className="font-bold text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Dynamic Routing via Dijkstra:
          </div>
          <p>
            Routers evaluate graph link metrics using Dijkstra's algorithm. In the active topology, shortest paths are calculated dynamically based on link costs.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="font-bold text-cyan-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Link Failure & Rerouting:
          </div>
          <p>
            When a primary link goes DOWN (dashed line), the routing engine detects the topology break and immediately invokes Dijkstra to recalculate alternate routes!
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="font-bold text-purple-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Data Link Layer CRC & Framing:
          </div>
          <p>
            Switch to the bottom CRC or Framing tabs to experiment with bit stuffing (5 ones rule) and inject bit errors to watch CRC remainder verification fail.
          </p>
        </div>
      </div>
    </div>
  );
}
