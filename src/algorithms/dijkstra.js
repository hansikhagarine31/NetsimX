/**
 * Dijkstra's Shortest Path Algorithm for NetSimX Network Simulator
 *
 * Evaluates shortest path using link weights/costs.
 * Handles disabled links (status !== 'up') and powered down devices (status === 'off').
 */

export function runDijkstra(nodes, links, sourceId, targetId = null) {
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

  // Build adjacency list
  const graph = {};
  activeNodeIds.forEach(id => {
    graph[id] = [];
  });

  activeLinks.forEach(link => {
    const cost = Number(link.data?.cost) || 1;
    graph[link.source].push({ node: link.target, cost, linkId: link.id });
    graph[link.target].push({ node: link.source, cost, linkId: link.id });
  });

  if (!activeNodeIds.has(sourceId)) {
    return {
      distances: {},
      previous: {},
      path: [],
      pathEdges: [],
      totalCost: Infinity,
      iterations: [],
      error: `Source node ${sourceId} is unreachable or powered off.`
    };
  }

  const distances = {};
  const previous = {};
  const previousEdge = {};
  const unvisited = new Set(activeNodeIds);
  const iterations = [];

  activeNodeIds.forEach(id => {
    distances[id] = Infinity;
    previous[id] = null;
    previousEdge[id] = null;
  });

  distances[sourceId] = 0;

  let stepCount = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance in unvisited set
    let current = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (current === null || minDistance === Infinity) {
      // Remaining nodes are unreachable
      break;
    }

    unvisited.delete(current);
    stepCount++;

    // Record iteration step for visualizer table
    iterations.push({
      step: stepCount,
      visitedNode: current,
      currentDistance: distances[current],
      tableState: Object.keys(distances).map(n => ({
        node: n,
        distance: distances[n] === Infinity ? '∞' : distances[n],
        previous: previous[n] || '-'
      }))
    });

    // Check neighbors
    const neighbors = graph[current] || [];
    for (const neighborObj of neighbors) {
      const { node: neighbor, cost, linkId } = neighborObj;
      if (unvisited.has(neighbor)) {
        const alt = distances[current] + cost;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
          previousEdge[neighbor] = linkId;
        }
      }
    }
  }

  // Reconstruction path if targetId specified
  let path = [];
  let pathEdges = [];
  let totalCost = Infinity;

  if (targetId && activeNodeIds.has(targetId)) {
    if (distances[targetId] !== Infinity) {
      let curr = targetId;
      totalCost = distances[targetId];

      while (curr !== null) {
        path.unshift(curr);
        if (previousEdge[curr]) {
          pathEdges.unshift(previousEdge[curr]);
        }
        curr = previous[curr];
      }
    }
  }

  return {
    distances,
    previous,
    path,
    pathEdges,
    totalCost,
    iterations,
    activeNodeIds: Array.from(activeNodeIds)
  };
}
