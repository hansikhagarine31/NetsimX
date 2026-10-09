/**
 * Network Topologies & Templates Data for NetSimX
 */

export const TEMPLATES = {
  simpleLAN: {
    id: 'simpleLAN',
    name: 'Simple LAN Topology',
    description: 'Basic local area network connecting two PCs through a Switch.',
    nodes: [
      {
        id: 'pc1',
        type: 'deviceNode',
        position: { x: 150, y: 250 },
        data: {
          name: 'PC1',
          deviceType: 'pc',
          mac: '00:1A:2B:3C:4D:01',
          ip: '192.168.1.10',
          subnetMask: '255.255.255.0',
          gateway: '192.168.1.1',
          status: 'on'
        }
      },
      {
        id: 'sw1',
        type: 'deviceNode',
        position: { x: 400, y: 250 },
        data: {
          name: 'Switch1',
          deviceType: 'switch',
          mac: '00:1A:2B:3C:4D:FE',
          status: 'on'
        }
      },
      {
        id: 'pc2',
        type: 'deviceNode',
        position: { x: 650, y: 250 },
        data: {
          name: 'PC2',
          deviceType: 'pc',
          mac: '00:1A:2B:3C:4D:02',
          ip: '192.168.1.20',
          subnetMask: '255.255.255.0',
          gateway: '192.168.1.1',
          status: 'on'
        }
      }
    ],
    links: [
      { id: 'l_pc1_sw1', source: 'pc1', target: 'sw1', data: { sourceInterface: 'eth0', targetInterface: 'Fa0/1', cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l_sw1_pc2', source: 'sw1', target: 'pc2', data: { sourceInterface: 'Fa0/2', targetInterface: 'eth0', cost: 1, bandwidth: '100Mbps', status: 'up' } }
    ]
  },

  routerNetwork: {
    id: 'routerNetwork',
    name: 'Dual Router Subnet Topology',
    description: 'Two separate LANs connected via two interconnected routers.',
    nodes: [
      { id: 'pc1', type: 'deviceNode', position: { x: 100, y: 250 }, data: { name: 'PC1', deviceType: 'pc', mac: '00:AA:11:00:01', ip: '192.168.1.10', subnetMask: '255.255.255.0', gateway: '192.168.1.1', status: 'on' } },
      { id: 'sw1', type: 'deviceNode', position: { x: 280, y: 250 }, data: { name: 'Switch1', deviceType: 'switch', mac: '00:AA:11:00:FE', status: 'on' } },
      { id: 'r1', type: 'deviceNode', position: { x: 460, y: 250 }, data: { name: 'Router1', deviceType: 'router', mac: '00:AA:11:00:R1', ip: '192.168.1.1', subnetMask: '255.255.255.0', gateway: '0.0.0.0', status: 'on' } },
      { id: 'r2', type: 'deviceNode', position: { x: 640, y: 250 }, data: { name: 'Router2', deviceType: 'router', mac: '00:AA:11:00:R2', ip: '192.168.2.1', subnetMask: '255.255.255.0', gateway: '0.0.0.0', status: 'on' } },
      { id: 'sw2', type: 'deviceNode', position: { x: 820, y: 250 }, data: { name: 'Switch2', deviceType: 'switch', mac: '00:AA:11:00:FF', status: 'on' } },
      { id: 'pc2', type: 'deviceNode', position: { x: 1000, y: 250 }, data: { name: 'PC2', deviceType: 'pc', mac: '00:AA:11:00:02', ip: '192.168.2.10', subnetMask: '255.255.255.0', gateway: '192.168.2.1', status: 'on' } }
    ],
    links: [
      { id: 'l1', source: 'pc1', target: 'sw1', data: { cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l2', source: 'sw1', target: 'r1', data: { cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l3', source: 'r1', target: 'r2', data: { cost: 3, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l4', source: 'r2', target: 'sw2', data: { cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l5', source: 'sw2', target: 'pc2', data: { cost: 1, bandwidth: '100Mbps', status: 'up' } }
    ]
  },

  demoScenario: {
    id: 'demoScenario',
    name: 'Faculty Presentation Demo Network (Multi-Path Rerouting)',
    description: 'Complete CN Course Demo: PC1 -> Switch1 -> Router1 -> [R2 / R3] -> Server1. Demonstrates Dijkstra, Link Failure Rerouting, CRC, and Framing.',
    nodes: [
      {
        id: 'pc1',
        type: 'deviceNode',
        position: { x: 100, y: 260 },
        data: {
          name: 'PC1',
          deviceType: 'pc',
          mac: '00:E0:4C:00:00:01',
          ip: '192.168.1.10',
          subnetMask: '255.255.255.0',
          gateway: '192.168.1.1',
          status: 'on'
        }
      },
      {
        id: 'sw1',
        type: 'deviceNode',
        position: { x: 260, y: 260 },
        data: {
          name: 'Switch1',
          deviceType: 'switch',
          mac: '00:E0:4C:00:00:SW',
          status: 'on'
        }
      },
      {
        id: 'r1',
        type: 'deviceNode',
        position: { x: 440, y: 260 },
        data: {
          name: 'Router1',
          deviceType: 'router',
          mac: '00:E0:4C:00:00:R1',
          ip: '192.168.1.1',
          subnetMask: '255.255.255.0',
          gateway: '0.0.0.0',
          status: 'on'
        }
      },
      {
        id: 'r2',
        type: 'deviceNode',
        position: { x: 640, y: 120 },
        data: {
          name: 'Router2 (High Cost)',
          deviceType: 'router',
          mac: '00:E0:4C:00:00:R2',
          ip: '10.0.1.1',
          subnetMask: '255.255.255.0',
          gateway: '0.0.0.0',
          status: 'on'
        }
      },
      {
        id: 'r3',
        type: 'deviceNode',
        position: { x: 640, y: 400 },
        data: {
          name: 'Router3 (Optimal Cost)',
          deviceType: 'router',
          mac: '00:E0:4C:00:00:R3',
          ip: '10.0.2.1',
          subnetMask: '255.255.255.0',
          gateway: '0.0.0.0',
          status: 'on'
        }
      },
      {
        id: 'server1',
        type: 'deviceNode',
        position: { x: 880, y: 260 },
        data: {
          name: 'Server1 (FTP/HTTP)',
          deviceType: 'server',
          mac: '00:E0:4C:00:00:SV',
          ip: '192.168.3.100',
          subnetMask: '255.255.255.0',
          gateway: '192.168.3.1',
          status: 'on',
          services: { http: true, ftp: true }
        }
      }
    ],
    links: [
      { id: 'l_pc1_sw1', source: 'pc1', target: 'sw1', data: { sourceInterface: 'eth0', targetInterface: 'Fa0/1', cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l_sw1_r1', source: 'sw1', target: 'r1', data: { sourceInterface: 'Fa0/2', targetInterface: 'Gi0/0', cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l_r1_r2', source: 'r1', target: 'r2', data: { sourceInterface: 'Gi0/1', targetInterface: 'Gi0/0', cost: 5, bandwidth: '10Mbps', status: 'up' } },
      { id: 'l_r1_r3', source: 'r1', target: 'r3', data: { sourceInterface: 'Gi0/2', targetInterface: 'Gi0/0', cost: 1, bandwidth: '100Mbps', status: 'up' } },
      { id: 'l_r2_server', source: 'r2', target: 'server1', data: { sourceInterface: 'Gi0/1', targetInterface: 'eth0', cost: 2, bandwidth: '10Mbps', status: 'up' } },
      { id: 'l_r3_server', source: 'r3', target: 'server1', data: { sourceInterface: 'Gi0/1', targetInterface: 'eth0', cost: 1, bandwidth: '100Mbps', status: 'up' } }
    ]
  }
};
