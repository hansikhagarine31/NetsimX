import React, { useState } from 'react';
import { useNetworkStore } from '../../store/networkStore.js';
import { buildRoutingTableForRouter } from '../../algorithms/routing.js';
import { runDijkstra } from '../../algorithms/dijkstra.js';
import { runBellmanFord } from '../../algorithms/bellmanFord.js';
import { Table, Network, Cpu, Compass, GitCompare } from 'lucide-react';

export function RoutingTableTab() {
  const store = useNetworkStore();
  const [algoTab, setAlgoTab] = useState('dijkstra'); // 'dijkstra' | 'bellmanford' | 'compare'

  const selectedNode = store.nodes.find(n => n.id === store.selectedNodeId);
  const routerNodes  = store.nodes.filter(n => n.data?.deviceType === 'router');
  const activeRouter = selectedNode?.data?.deviceType === 'router' ? selectedNode : routerNodes[0];

  const routingTable    = activeRouter ? buildRoutingTableForRouter(activeRouter.id, store.nodes, store.links) : [];
  const dijkstraResult  = activeRouter ? runDijkstra(store.nodes, store.links, activeRouter.id)    : null;
  const bellmanResult   = activeRouter ? runBellmanFord(store.nodes, store.links, activeRouter.id) : null;

  // Node name resolver
  const nodeName = id => store.nodes.find(n => n.id === id)?.data?.name || id;

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col gap-4 overflow-y-auto font-sans text-xs">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Compass className="w-4 h-4 text-purple-400" />
          Routing Table &amp; Algorithm Engine
        </div>
        {activeRouter && (
          <div className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/80 px-3 py-1 rounded-lg">
            Active Router: {activeRouter.data?.name}
          </div>
        )}
      </div>

      {/* Routing table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">
            Routing Table ({activeRouter?.data?.name || 'No Router'})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Updated dynamically via Dijkstra shortest path
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-[11px] text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-2.5">DESTINATION</th>
                <th className="p-2.5">NEXT HOP</th>
                <th className="p-2.5">INTERFACE</th>
                <th className="p-2.5">METRIC COST</th>
                <th className="p-2.5">TYPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {routingTable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    No routes populated. Add router interfaces or links.
                  </td>
                </tr>
              ) : (
                routingTable.map((route, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-2.5 text-cyan-300 font-semibold">{route.destination}</td>
                    <td className="p-2.5 text-purple-300">{route.nextHop}</td>
                    <td className="p-2.5 text-slate-300">{route.interface}</td>
                    <td className="p-2.5 text-amber-300 font-bold">{route.cost}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/50">
                        {route.type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Algorithm comparison section */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            Algorithm Comparison
          </span>
          {/* Sub-tab toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'dijkstra',    label: 'Dijkstra' },
              { id: 'bellmanford', label: 'Bellman-Ford' },
              { id: 'compare',     label: 'Side-by-Side' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setAlgoTab(t.id)}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                  algoTab === t.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── DIJKSTRA ITERATIONS ── */}
        {algoTab === 'dijkstra' && dijkstraResult?.iterations && (
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-[10px] text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-2">STEP #</th>
                  <th className="p-2">VISITED NODE</th>
                  <th className="p-2">DIST FROM SOURCE</th>
                  <th className="p-2">DISTANCE TABLE STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                {dijkstraResult.iterations.map((iter, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2 text-cyan-400">Step {iter.step}</td>
                    <td className="p-2 font-bold text-slate-100">{nodeName(iter.visitedNode)}</td>
                    <td className="p-2 text-amber-300">{iter.currentDistance}</td>
                    <td className="p-2 text-[11px] text-slate-400">
                      {iter.tableState.map(t => `${nodeName(t.node)}: d=${t.distance} (via ${t.previous === '-' ? '-' : nodeName(t.previous)})`).join(' | ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── BELLMAN-FORD ITERATIONS ── */}
        {algoTab === 'bellmanford' && bellmanResult?.iterations && (
          <>
            {bellmanResult.hasNegativeCycle && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold text-xs">
                ⚠️ Negative weight cycle detected! Distances are unreliable.
              </div>
            )}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-[10px] text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-2">ITERATION #</th>
                    <th className="p-2">NODE DISTANCE TABLE STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                  {bellmanResult.iterations.map((iter, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-2 text-purple-400">Iter {iter.step}</td>
                      <td className="p-2 text-[11px] text-slate-400">
                        {iter.tableState.map(t => `${nodeName(t.node)}: d=${t.distance} (via ${t.previous === '-' ? '-' : nodeName(t.previous)})`).join(' | ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── SIDE-BY-SIDE COMPARE ── */}
        {algoTab === 'compare' && dijkstraResult && bellmanResult && (
          <div className="grid grid-cols-2 gap-3">
            {/* Dijkstra summary */}
            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-800/40 space-y-2">
              <div className="text-[11px] font-bold text-cyan-400 border-b border-slate-800 pb-1">
                Dijkstra's Algorithm
              </div>
              <div className="text-[10px] text-slate-400 space-y-1">
                <p>✅ <span className="text-slate-300">Complexity:</span> O((V+E) log V) with priority queue</p>
                <p>✅ <span className="text-slate-300">Works with:</span> Non-negative weights only</p>
                <p>✅ <span className="text-slate-300">Strategy:</span> Greedy — visits min-distance node first</p>
                <p>✅ <span className="text-slate-300">Iterations:</span> {dijkstraResult.iterations.length} steps</p>
              </div>
              <div className="border-t border-slate-800 pt-2 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Final Distances</span>
                {Object.entries(dijkstraResult.distances).map(([id, d]) => (
                  <div key={id} className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">{nodeName(id)}</span>
                    <span className={d === Infinity ? 'text-rose-400' : 'text-cyan-400'}>{d === Infinity ? '∞' : d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bellman-Ford summary */}
            <div className="p-3 rounded-xl bg-slate-900 border border-purple-800/40 space-y-2">
              <div className="text-[11px] font-bold text-purple-400 border-b border-slate-800 pb-1">
                Bellman-Ford Algorithm
              </div>
              <div className="text-[10px] text-slate-400 space-y-1">
                <p>✅ <span className="text-slate-300">Complexity:</span> O(V × E) edge relaxation passes</p>
                <p>✅ <span className="text-slate-300">Works with:</span> Negative weights + negative cycle detection</p>
                <p>✅ <span className="text-slate-300">Strategy:</span> Dynamic — relaxes all edges V-1 times</p>
                <p>✅ <span className="text-slate-300">Iterations:</span> {bellmanResult.iterations.length} passes</p>
              </div>
              {bellmanResult.hasNegativeCycle && (
                <div className="text-[10px] text-rose-400 font-bold">⚠️ Negative cycle detected!</div>
              )}
              <div className="border-t border-slate-800 pt-2 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Final Distances</span>
                {Object.entries(bellmanResult.distances).map(([id, d]) => {
                  const dkDist = dijkstraResult.distances[id];
                  const matches = d === dkDist;
                  return (
                    <div key={id} className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-300">{nodeName(id)}</span>
                      <span className={`${d === Infinity ? 'text-rose-400' : 'text-purple-400'} ${matches ? '' : 'underline decoration-amber-400'}`}>
                        {d === Infinity ? '∞' : d}
                        {!matches && <span className="text-amber-400 ml-1">≠</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

