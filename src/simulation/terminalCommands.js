/**
 * Virtual CLI Terminal Command Parser for NetSimX
 */
import { runDijkstra } from '../algorithms/dijkstra.js';
import { buildRoutingTableForRouter } from '../algorithms/routing.js';

export function executeTerminalCommand(commandString, selectedNode, nodes, links) {
  const trimmed = commandString.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const outputLines = [];

  switch (cmd) {
    case 'help':
      outputLines.push('NetSimX Terminal — Virtual OS CLI (v1.0.0)');
      outputLines.push('Available commands:');
      outputLines.push('  ping <target_ip | target_name>    - Send ICMP echo request');
      outputLines.push('  traceroute <target_ip | target_name> - Trace router path to destination');
      outputLines.push('  ipconfig / ifconfig               - Display local network configuration');
      outputLines.push('  arp -a                            - Display ARP cache table');
      outputLines.push('  route print                       - Display active device routing table');
      outputLines.push('  clear                             - Clear terminal buffer');
      break;

    case 'clear':
      return [{ type: 'CLEAR' }];

    case 'ipconfig':
    case 'ifconfig':
      if (!selectedNode) {
        outputLines.push('Error: No device selected. Click a device on the canvas first.');
      } else {
        const d = selectedNode.data || {};
        outputLines.push(`Device Name . . . . . . : ${d.name || selectedNode.id}`);
        outputLines.push(`Device Type . . . . . . : ${d.deviceType?.toUpperCase() || 'UNKNOWN'}`);
        outputLines.push(`Physical Address (MAC)  : ${d.mac || '00:00:00:00:00:00'}`);
        outputLines.push(`IPv4 Address. . . . . . : ${d.ip || 'Not Configured'}`);
        outputLines.push(`Subnet Mask . . . . . . : ${d.subnetMask || '255.255.255.0'}`);
        outputLines.push(`Default Gateway . . . . : ${d.gateway || '0.0.0.0'}`);
        outputLines.push(`Power Status. . . . . . : ${d.status !== 'off' ? 'ONLINE (ON)' : 'OFFLINE (OFF)'}`);
      }
      break;

    case 'arp':
      if (args[0] === '-a' || !args[0]) {
        if (!selectedNode) {
          outputLines.push('Error: No device selected.');
        } else {
          outputLines.push(`Interface: ${selectedNode.data?.ip || '192.168.1.1'} --- ${selectedNode.data?.name}`);
          outputLines.push('  Internet Address      Physical Address      Type');
          // Return simulated ARP table entries from connected neighbors
          const neighbors = links
            .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
            .map(l => l.source === selectedNode.id ? l.target : l.source);

          neighbors.forEach(nId => {
            const neighborNode = nodes.find(n => n.id === nId);
            if (neighborNode && neighborNode.data?.ip) {
              outputLines.push(`  ${neighborNode.data.ip.padEnd(20)} ${neighborNode.data.mac || 'AA:BB:CC:DD:EE:FF'}   dynamic`);
            }
          });
          if (neighbors.length === 0) {
            outputLines.push('  No ARP entries found.');
          }
        }
      } else {
        outputLines.push('Usage: arp -a');
      }
      break;

    case 'route':
      if (args[0] === 'print' || !args[0]) {
        if (!selectedNode) {
          outputLines.push('Error: No device selected.');
        } else if (selectedNode.data?.deviceType !== 'router') {
          outputLines.push(`Device ${selectedNode.data?.name} is a ${selectedNode.data?.deviceType?.toUpperCase()}. Routing table is only available on Routers.`);
        } else {
          const routes = buildRoutingTableForRouter(selectedNode.id, nodes, links);
          outputLines.push('===========================================================================');
          outputLines.push('IPv4 Route Table for Router ' + selectedNode.data?.name);
          outputLines.push('===========================================================================');
          outputLines.push('Destination Network    Next Hop            Interface   Metric  Type');
          routes.forEach(r => {
            outputLines.push(`${(r.destination).padEnd(22)} ${(r.nextHop).padEnd(19)} ${(r.interface).padEnd(11)} ${(String(r.cost)).padEnd(7)} ${r.type}`);
          });
        }
      } else {
        outputLines.push('Usage: route print');
      }
      break;

    case 'ping':
      if (!args[0]) {
        outputLines.push('Usage: ping <target_ip_or_name>');
        break;
      }
      if (!selectedNode) {
        outputLines.push('Error: Source device not selected. Select a source PC/Server first.');
        break;
      }
      const targetQuery = args[0].toLowerCase();
      const targetNode = nodes.find(
        n => n.id === targetQuery ||
             n.data?.name?.toLowerCase() === targetQuery ||
             n.data?.ip === targetQuery
      );

      if (!targetNode) {
        outputLines.push(`Ping request could not find host ${args[0]}. Please check the name and try again.`);
        break;
      }

      outputLines.push(`Pinging ${targetNode.data?.name} [${targetNode.data?.ip || 'Unassigned'}] with 32 bytes of data:`);

      const pathRes = runDijkstra(nodes, links, selectedNode.id, targetNode.id);

      if (pathRes.path && pathRes.path.length >= 2 && pathRes.totalCost !== Infinity) {
        const rtt = Math.max(1, pathRes.totalCost * 4);
        outputLines.push(`Reply from ${targetNode.data?.ip}: bytes=32 time=${rtt}ms TTL=64`);
        outputLines.push(`Reply from ${targetNode.data?.ip}: bytes=32 time=${rtt + 1}ms TTL=64`);
        outputLines.push(`Reply from ${targetNode.data?.ip}: bytes=32 time=${rtt}ms TTL=64`);
        outputLines.push(`Reply from ${targetNode.data?.ip}: bytes=32 time=${rtt - 1 || 1}ms TTL=64`);
        outputLines.push('');
        outputLines.push(`Ping statistics for ${targetNode.data?.ip}:`);
        outputLines.push('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),');
        outputLines.push(`Approximate round trip times in milli-seconds:`);
        outputLines.push(`    Minimum = ${rtt - 1 || 1}ms, Maximum = ${rtt + 1}ms, Average = ${rtt}ms`);
      } else {
        outputLines.push('Request timed out.');
        outputLines.push('Request timed out.');
        outputLines.push('Request timed out.');
        outputLines.push('Request timed out.');
        outputLines.push('');
        outputLines.push(`Ping statistics for ${args[0]}:`);
        outputLines.push('    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)');
      }
      break;

    case 'traceroute':
    case 'tracert':
      if (!args[0]) {
        outputLines.push('Usage: traceroute <target_ip_or_name>');
        break;
      }
      if (!selectedNode) {
        outputLines.push('Error: Source device not selected.');
        break;
      }
      const trTargetQuery = args[0].toLowerCase();
      const trTargetNode = nodes.find(
        n => n.id === trTargetQuery ||
             n.data?.name?.toLowerCase() === trTargetQuery ||
             n.data?.ip === trTargetQuery
      );

      if (!trTargetNode) {
        outputLines.push(`Unable to resolve target system name ${args[0]}.`);
        break;
      }

      outputLines.push(`Tracing route to ${trTargetNode.data?.name} [${trTargetNode.data?.ip || 'Unassigned'}] over a maximum of 30 hops:`);
      outputLines.push('');

      const trPathRes = runDijkstra(nodes, links, selectedNode.id, trTargetNode.id);

      if (trPathRes.path && trPathRes.path.length >= 2 && trPathRes.totalCost !== Infinity) {
        trPathRes.path.forEach((nodeId, idx) => {
          if (idx === 0) return; // Skip source
          const hopNode = nodes.find(n => n.id === nodeId);
          const hopName = hopNode?.data?.name || nodeId;
          const hopIp = hopNode?.data?.ip || '192.168.x.x';
          const ms = (idx * 2) + Math.floor(Math.random() * 3);
          outputLines.push(`  ${idx}    ${ms} ms    ${ms + 1} ms    ${ms} ms    ${hopName} [${hopIp}]`);
        });
        outputLines.push('');
        outputLines.push('Trace complete.');
      } else {
        outputLines.push('  1    *        *        *        Request timed out.');
        outputLines.push('  2    *        *        *        Destination unreachable.');
        outputLines.push('Trace failed.');
      }
      break;

    default:
      outputLines.push(`Command '${cmd}' not recognized. Type 'help' for available commands.`);
      break;
  }

  return outputLines.map(line => ({ type: 'OUTPUT', text: line }));
}
