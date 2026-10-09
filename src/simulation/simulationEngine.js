/**
 * Simulation Engine State Machine for NetSimX
 */
import { runDijkstra } from '../algorithms/dijkstra.js';
import { verifyCRC } from '../algorithms/crc.js';

export function calculatePacketPath(nodes, links, sourceId, targetId) {
  const result = runDijkstra(nodes, links, sourceId, targetId);
  return result;
}

/**
 * Advances a packet by one step through its route
 */
export function stepSimulationPacket(packet, nodes, links) {
  if (packet.status === 'DELIVERED' || packet.status === 'DROPPED' || packet.status === 'CORRUPTED') {
    return { packet, events: [] };
  }

  const events = [];
  const updatedPacket = { ...packet };

  // Calculate or recalculate path
  const dijkstraRes = calculatePacketPath(nodes, links, updatedPacket.sourceId, updatedPacket.targetId);

  if (!dijkstraRes.path || dijkstraRes.path.length < 2) {
    updatedPacket.status = 'DROPPED';
    const reason = dijkstraRes.error || `Destination node unreachable from ${updatedPacket.sourceName}. No operational route exists.`;
    updatedPacket.events.push({
      time: new Date().toLocaleTimeString(),
      nodeId: updatedPacket.sourceId,
      nodeName: updatedPacket.sourceName,
      message: `TRANSMISSION FAILED: ${reason}`
    });
    return { packet: updatedPacket, events: updatedPacket.events };
  }

  updatedPacket.path = dijkstraRes.path;
  updatedPacket.pathEdges = dijkstraRes.pathEdges;

  // Current node
  const currentIndex = updatedPacket.currentHopIndex;
  const currentNodeId = updatedPacket.path[currentIndex];
  const nextNodeId = updatedPacket.path[currentIndex + 1];

  const currentNode = nodes.find(n => n.id === currentNodeId);
  const nextNode = nodes.find(n => n.id === nextNodeId);

  // Check if link between current and next is UP
  const connectingLink = links.find(
    l => (l.source === currentNodeId && l.target === nextNodeId) ||
         (l.source === nextNodeId && l.target === currentNodeId)
  );

  if (!connectingLink || connectingLink.data?.status === 'down') {
    // Attempt dynamic reroute around broken link
    const rerouteRes = calculatePacketPath(nodes, links, currentNodeId, updatedPacket.targetId);

    if (rerouteRes.path && rerouteRes.path.length >= 2) {
      // Successfully found alternate route!
      const newPath = [...updatedPacket.path.slice(0, currentIndex), ...rerouteRes.path];
      updatedPacket.path = newPath;
      updatedPacket.events.push({
        time: new Date().toLocaleTimeString(),
        nodeId: currentNodeId,
        nodeName: currentNode?.data?.name,
        message: `LINK DOWN detected on primary path. Dijkstra recalculated alternate path via ${rerouteRes.path[1]}`
      });
      // Move to next node in new path
      updatedPacket.currentHopIndex += 1;
      return { packet: updatedPacket, events: updatedPacket.events };
    } else {
      updatedPacket.status = 'DROPPED';
      updatedPacket.events.push({
        time: new Date().toLocaleTimeString(),
        nodeId: currentNodeId,
        nodeName: currentNode?.data?.name,
        message: `TRANSMISSION FAILED: Link to ${nextNode?.data?.name || nextNodeId} is DOWN and no alternate route is available.`
      });
      return { packet: updatedPacket, events: updatedPacket.events };
    }
  }

  // Decrement TTL
  updatedPacket.ttl -= 1;
  if (updatedPacket.ttl <= 0) {
    updatedPacket.status = 'DROPPED';
    updatedPacket.events.push({
      time: new Date().toLocaleTimeString(),
      nodeId: currentNodeId,
      nodeName: currentNode?.data?.name,
      message: `Time To Live (TTL) expired at ${currentNode?.data?.name}. Packet dropped.`
    });
    return { packet: updatedPacket, events: updatedPacket.events };
  }

  // Forwarding step
  updatedPacket.currentHopIndex += 1;
  const reachedNodeId = updatedPacket.path[updatedPacket.currentHopIndex];
  const reachedNode = nodes.find(n => n.id === reachedNodeId);

  updatedPacket.hops.push({
    from: currentNode?.data?.name || currentNodeId,
    to: reachedNode?.data?.name || reachedNodeId,
    linkId: connectingLink.id,
    cost: connectingLink.data?.cost || 1
  });

  // Check if reached destination
  if (reachedNodeId === updatedPacket.targetId) {
    // Perform CRC Verification
    const crcCheck = verifyCRC(updatedPacket.transmittedFrame, updatedPacket.crcPolynomial || '11000000000000101');

    if (crcCheck.isValid) {
      updatedPacket.status = 'DELIVERED';
      updatedPacket.events.push({
        time: new Date().toLocaleTimeString(),
        nodeId: reachedNodeId,
        nodeName: reachedNode?.data?.name,
        message: `Packet delivered to destination ${reachedNode?.data?.name}. CRC verification PASSED (Remainder: ${crcCheck.remainder}).`
      });
    } else {
      updatedPacket.status = 'CORRUPTED';
      updatedPacket.events.push({
        time: new Date().toLocaleTimeString(),
        nodeId: reachedNodeId,
        nodeName: reachedNode?.data?.name,
        message: `❌ ERROR DETECTED at destination ${reachedNode?.data?.name}: CRC verification FAILED (Remainder: ${crcCheck.remainder}). Packet rejected!`
      });
    }
  } else {
    updatedPacket.status = 'IN_FLIGHT';
    updatedPacket.events.push({
      time: new Date().toLocaleTimeString(),
      nodeId: reachedNodeId,
      nodeName: reachedNode?.data?.name,
      message: `Packet forwarded to ${reachedNode?.data?.name} (${reachedNode?.data?.deviceType?.toUpperCase()}). Next lookup in progress...`
    });
  }

  return { packet: updatedPacket, events: updatedPacket.events };
}
