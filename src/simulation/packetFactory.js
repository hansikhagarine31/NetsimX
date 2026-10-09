/**
 * Packet Factory for NetSimX Simulator
 * Constructs structured simulation packets with L2, L3, and L7 headers.
 */
import { calculateCRC, stringToBinary } from '../algorithms/crc.js';

let sequenceCounter = 1000;

export function createPacket({
  sourceNode,
  targetNode,
  protocol = 'ICMP',
  payload = 'PING REQUEST',
  ttl = 64
}) {
  sequenceCounter++;

  const sourceIp = sourceNode.data?.ip || '0.0.0.0';
  const targetIp = targetNode.data?.ip || '0.0.0.0';
  const sourceMac = sourceNode.data?.mac || '00:11:22:33:44:55';
  const targetMac = targetNode.data?.mac || 'FF:FF:FF:FF:FF:FF';

  // Calculate CRC for payload
  const binaryPayload = stringToBinary(payload);
  const crcResult = calculateCRC(binaryPayload, '11000000000000101'); // CRC-16 default

  return {
    id: `pkt_${Date.now()}_${sequenceCounter}`,
    seqNum: sequenceCounter,
    timestamp: new Date().toLocaleTimeString(),
    sourceId: sourceNode.id,
    sourceName: sourceNode.data?.name || sourceNode.id,
    sourceIp,
    sourceMac,
    targetId: targetNode.id,
    targetName: targetNode.data?.name || targetNode.id,
    targetIp,
    targetMac,
    protocol,
    payload,
    binaryPayload,
    ttl,
    crc: crcResult.remainder,
    crcPolynomial: crcResult.polynomial,
    transmittedFrame: crcResult.transmittedFrame,
    status: 'GENERATED', // GENERATED, IN_FLIGHT, DELIVERED, DROPPED, CORRUPTED
    currentHopIndex: 0,
    hops: [],
    events: [
      {
        time: new Date().toLocaleTimeString(),
        nodeId: sourceNode.id,
        nodeName: sourceNode.data?.name,
        message: `Packet #${sequenceCounter} created at ${sourceNode.data?.name} (${sourceIp})`
      }
    ]
  };
}
