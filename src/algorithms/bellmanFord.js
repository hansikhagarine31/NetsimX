/**
 * Bellman-Ford Shortest Path Algorithm for NetSimX Network Simulator
 *
 * Evaluates shortest path using edge relaxation over (V-1) iterations.
 * Handles disabled links (status !== 'up') and powered-down devices (status === 'off').
 * Detects negative weight cycles.
 */

export function runBellmanFord(nodes, links, sourceId, targetId = null) {
  // Filter active nodes and active links
  const activeNodeIds = new Set(
    nodes.filter(n => n.data?.status !== 'off').map(n => n.id)
  );

  const activeLinks = links.filter(link => {
    const isUp = link.data?.status === 'up' || link.data?.status === undefined;
    const sourceActive = activeNodeIds.has(link.source);
    const targetActive = activeNodeIds.has(link.target);
    return isUp && sourceActive && targetActive;
  });

  if (!activeNodeIds.has(sourceId)) {
    return {
      distances: {},
      previous: {},
      path: [],
      pathEdges: [],
      totalCost: Infinity,
      iterations: [],
      hasNegativeCycle: false,
      error: `Source node ${sourceId} is unreachable or powered off.`
    };
  }

  const nodeList = Array.from(activeNodeIds);
  const distances = {};
  const previous = {};
  const previousEdge = {};

  // Build edge list (undirected → two directed edges per link)
  const edges = [];
  activeLinks.forEach(link => {
    const cost = Number(link.data?.cost) || 1;
    edges.push({ from: link.source, to: link.target, cost, linkId: link.id });
    edges.push({ from: link.target, to: link.source, cost, linkId: link.id });
  });

  // Initialize distances
  nodeList.forEach(id => {
    distances[id] = Infinity;
    previous[id] = null;
    previousEdge[id] = null;
  });
  distances[sourceId] = 0;

  const iterations = [];

  // Relax edges |V| - 1 times
  const V = nodeList.length;
  for (let iter = 1; iter <= V - 1; iter++) {
    let relaxedAny = false;

    for (const { from, to, cost, linkId } of edges) {
      if (distances[from] !== Infinity && distances[from] + cost < distances[to]) {
        distances[to] = distances[from] + cost;
        previous[to] = from;
        previousEdge[to] = linkId;
        relaxedAny = true;
      }
    }

    // Record iteration snapshot
    iterations.push({
      step: iter,
      tableState: nodeList.map(n => ({
        node: n,
        distance: distances[n] === Infinity ? '∞' : distances[n],
        previous: previous[n] || '-'
      }))
    });

    // Early exit if no relaxation happened
    if (!relaxedAny) break;
  }

  // Detect negative-weight cycles (one more relaxation pass)
  let hasNegativeCycle = false;
  for (const { from, to, cost } of edges) {
    if (distances[from] !== Infinity && distances[from] + cost < distances[to]) {
      hasNegativeCycle = true;
      break;
    }
  }

  // Reconstruct path
  let path = [];
  let pathEdges = [];
  let totalCost = Infinity;

  if (targetId && activeNodeIds.has(targetId) && distances[targetId] !== Infinity) {
    totalCost = distances[targetId];
    let curr = targetId;
    while (curr !== null) {
      path.unshift(curr);
      if (previousEdge[curr]) pathEdges.unshift(previousEdge[curr]);
      curr = previous[curr];
    }
  }

  return {
    distances,
    previous,
    path,
    pathEdges,
    totalCost,
    iterations,
    hasNegativeCycle,
    activeNodeIds: Array.from(activeNodeIds)
  };
}
