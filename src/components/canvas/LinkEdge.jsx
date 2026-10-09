import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const LinkEdge = React.memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isUp = data?.status === 'up' || data?.status === undefined;
  const cost = data?.cost || 1;
  const bandwidth = data?.bandwidth || '100Mbps';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: selected ? 3 : 2,
          stroke: isUp ? (selected ? '#00F0FF' : '#38BDF8') : '#EF4444',
          strokeDasharray: isUp ? 'none' : '6,6',
          opacity: isUp ? 0.9 : 0.6,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-0.5 text-[10px] shadow-md hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <span className={`w-2 h-2 rounded-full ${isUp ? 'bg-emerald-400' : 'bg-rose-500'}`} />
          <span className="font-mono text-cyan-300 font-semibold">Cost: {cost}</span>
          <span className="text-slate-400 border-l border-slate-700 pl-1">{bandwidth}</span>
          {!isUp && (
            <span className="text-rose-400 font-bold flex items-center gap-0.5 ml-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              DOWN
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

LinkEdge.displayName = 'LinkEdge';
