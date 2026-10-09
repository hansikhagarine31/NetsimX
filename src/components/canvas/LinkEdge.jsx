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
  const isTraversing = Boolean(data?.isTraversing);
  const isInPath = Boolean(data?.isInPath);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: isTraversing ? 4 : (selected || isInPath) ? 3 : 2,
          stroke: !isUp
            ? '#EF4444'
            : isTraversing
            ? '#00F0FF'
            : isInPath
            ? '#A855F7'
            : selected
            ? '#00F0FF'
            : '#38BDF8',
          strokeDasharray: isUp ? (isTraversing ? '8,4' : 'none') : '6,6',
          opacity: isUp ? 1 : 0.6,
        }}
      />
      <EdgeLabelRenderer>
        {isTraversing && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -170%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="z-40 flex items-center gap-1 bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black shadow-lg shadow-cyan-400/50 animate-pulse whitespace-nowrap uppercase"
          >
            <span>⚡</span>
            <span>{data?.packetProtocol || 'PKT'} TRANSIT</span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`nodrag nopan flex items-center gap-1.5 border rounded-lg px-2 py-0.5 text-[10px] shadow-md transition-all cursor-pointer ${
            isTraversing
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/40'
              : isInPath
              ? 'bg-purple-950/90 border-purple-500 text-purple-300'
              : 'bg-slate-900/90 border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isUp ? (isTraversing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400') : 'bg-rose-500'}`} />
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
