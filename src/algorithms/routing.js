/**
 * Router & Switch Routing Table Engine for NetSimX
 */
import { runDijkstra } from './dijkstra.js';
import { ipToInt, isSameSubnet } from './ipValidator.js';

/**
 * Computes live Routing Table for a given router node
 */
export function buildRoutingTableForRouter(routerId, nodes, links) {
  const routerNode = nodes.find(n => n.id === routerId);
  if (!routerNode || routerNode.data?.deviceType !== 'router') return [];

  const table = [];

  // 1. Direct Connected Routes
  const interfaces = routerNode.data?.interfaces || [];
  interfaces.forEach(iface => {
    if (iface.ip && iface.status === 'up') {
      table.push({
        destination: `${iface.ip}/${iface.subnetMask || '24'}`,
        nextHop: 'Directly Connected',
        interface: iface.name,
        cost: 0,
        type: 'Connected'
      });
    }
  });

  // 2. Static Routes configured by user
  const staticRoutes = routerNode.data?.staticRoutes || [];
  staticRoutes.forEach(sr => {
    table.push({
      destination: sr.destination,
      nextHop: sr.nextHop,
      interface: sr.interface || 'Auto',
      cost: sr.cost || 1,
      type: 'Static'
    });
  });

  // 3. Dynamic Shortest-Path Routes via Dijkstra
  const dijkstraResult = runDijkstra(nodes, links, routerId);

  if (dijkstraResult && dijkstraResult.distances) {
    Object.keys(dijkstraResult.distances).forEach(targetNodeId => {
      if (targetNodeId === routerId) return;

      const targetNode = nodes.find(n => n.id === targetNodeId);
      if (!targetNode || dijkstraResult.distances[targetNodeId] === Infinity) return;

      // Find path to targetNodeId
      const path = getPathToNode(dijkstraResult.previous, targetNodeId);
      if (path.length > 1) {
        const nextHopNodeId = path[1]; // First node after current router
        const nextHopNode = nodes.find(n => n.id === nextHopNodeId);

        const destIp = targetNode.data?.ip || `${targetNode.data?.name} Network`;
        table.push({
          destination: destIp,
          nextHop: nextHopNode?.data?.name || nextHopNodeId,
          interface: getInterfaceConnectingNodes(routerId, nextHopNodeId, links, nodes),
          cost: dijkstraResult.distances[targetNodeId],
          type: 'Dynamic (Dijkstra)'
        });
      }
    });
  }

  return table;
}

function getPathToNode(previousMap, targetId) {
  const path = [];
  let curr = targetId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previousMap[curr];
  }
  return path;
}

function getInterfaceConnectingNodes(nodeA, nodeB, links, nodes) {
  const link = links.find(
    l => (l.source === nodeA && l.target === nodeB) || (l.source === nodeB && l.target === nodeA)
  );
  if (!link) return 'Eth0';

  if (link.source === nodeA) {
    return link.data?.sourceInterface || 'Gi0/0';
  } else {
    return link.data?.targetInterface || 'Gi0/1';
  }
}
