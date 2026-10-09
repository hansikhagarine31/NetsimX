import { networkStore } from '../store/networkStore.js';
import { createPacket } from './packetFactory.js';
import { calculatePacketPath, stepSimulationPacket } from './simulationEngine.js';

let simulationInterval = null;

/**
 * Starts an animated, step-by-step packet transmission along the Dijkstra route.
 */
export function startPacketSimulation({
  sourceNode,
  targetNode,
  protocol = 'ICMP',
  payload = null,
  speedMs = 850
}) {
  if (!sourceNode || !targetNode) return;

  // Clear any existing active simulation timer
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }

  const currentState = networkStore.getState();

  // Validate that source is powered on
  if (sourceNode.data?.status === 'off') {
    networkStore.addLog(`⚠️ Cannot transmit packet: Source device ${sourceNode.data?.name} is powered OFF.`);
    return;
  }

  // Calculate shortest path using Dijkstra
  const dijkstraRes = calculatePacketPath(currentState.nodes, currentState.links, sourceNode.id, targetNode.id);

  if (!dijkstraRes.path || dijkstraRes.path.length < 2) {
    const errorMsg = dijkstraRes.error || `Destination ${targetNode.data?.name} unreachable from ${sourceNode.data?.name}. No operational route exists.`;
    const droppedPkt = createPacket({
      sourceNode,
      targetNode,
      protocol,
      payload: payload || `${protocol} message from ${sourceNode.data?.name}`
    });
    droppedPkt.status = 'DROPPED';
    droppedPkt.events.push({
      time: new Date().toLocaleTimeString(),
      nodeId: sourceNode.id,
      nodeName: sourceNode.data?.name,
      message: `TRANSMISSION FAILED: ${errorMsg}`
    });

    networkStore.setState({
      simulationState: {
        isRunning: false,
        isPaused: false,
        speed: 1,
        packets: [droppedPkt],
        selectedPacketId: droppedPkt.id
      },
      activeTab: 'inspector',
      bottomPanelCollapsed: false
    });
    networkStore.addLog(`❌ Transmission failed: ${errorMsg}`);
    return;
  }

  // Create initial packet
  const initialPacket = createPacket({
    sourceNode,
    targetNode,
    protocol,
    payload: payload || `${protocol} transmission to ${targetNode.data?.name}`
  });
  initialPacket.path = dijkstraRes.path;
  initialPacket.pathEdges = dijkstraRes.pathEdges;
  initialPacket.currentHopIndex = 0;
  initialPacket.status = 'IN_FLIGHT';

  // Update store immediately with packet at hop 0
  networkStore.setState({
    simulationState: {
      isRunning: true,
      isPaused: false,
      speed: 1,
      packets: [initialPacket],
      selectedPacketId: initialPacket.id
    },
    activeTab: 'inspector',
    bottomPanelCollapsed: false
  });

  networkStore.addLog(
    `🚀 Packet simulation started: ${sourceNode.data?.name} ➔ ${targetNode.data?.name} [${protocol}]. Route: ${dijkstraRes.path.join(' → ')}`
  );

  let currentPkt = initialPacket;

  // Animate subsequent hops
  simulationInterval = setInterval(() => {
    const state = networkStore.getState();
    const result = stepSimulationPacket(currentPkt, state.nodes, state.links);
    currentPkt = result.packet;

    const isFinished =
      currentPkt.status === 'DELIVERED' ||
      currentPkt.status === 'DROPPED' ||
      currentPkt.status === 'CORRUPTED';

    networkStore.setState({
      simulationState: {
        ...state.simulationState,
        isRunning: !isFinished,
        packets: [currentPkt],
        selectedPacketId: currentPkt.id
      }
    });

    if (isFinished) {
      clearInterval(simulationInterval);
      simulationInterval = null;

      if (currentPkt.status === 'DELIVERED') {
        networkStore.addLog(
          `✅ Packet #${currentPkt.seqNum} (${protocol}) successfully DELIVERED to ${targetNode.data?.name}! CRC check PASSED.`
        );
      } else {
        networkStore.addLog(
          `❌ Packet #${currentPkt.seqNum} ${currentPkt.status} on transmission to ${targetNode.data?.name}.`
        );
      }
    }
  }, speedMs);
}

/**
 * Stops or resets the active packet simulation.
 */
export function stopPacketSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  const state = networkStore.getState();
  networkStore.setState({
    simulationState: {
      ...state.simulationState,
      isRunning: false
    }
  });
}
