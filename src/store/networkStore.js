import { useState, useEffect } from 'react';
import { TEMPLATES } from '../data/networkTemplates.js';

// Initial state from demo template
const initialTemplate = TEMPLATES.demoScenario;

let state = {
  nodes: initialTemplate.nodes,
  links: initialTemplate.links,
  selectedNodeId: 'pc1',
  selectedLinkId: null,
  activeTab: 'console', // 'console' | 'inspector' | 'routing' | 'logs' | 'crc' | 'framing'
  simulationState: {
    isRunning: false,
    isPaused: false,
    speed: 1, // 0.5x, 1x, 2x
    packets: [],
    selectedPacketId: null
  },
  logs: [
    `[${new Date().toLocaleTimeString()}] NetSimX Platform Initialized`,
    `[${new Date().toLocaleTimeString()}] Loaded Demo Scenario: Faculty Presentation Network Topology`
  ],
  learningMode: true,
  modals: {
    project: false,
    templates: false,
    ftp: false
  }
};

const listeners = new Set();

export const networkStore = {
  getState() {
    return state;
  },

  setState(partial) {
    state = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
    listeners.forEach(listener => listener(state));
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Helper actions
  addNode(deviceType, position) {
    const count = state.nodes.filter(n => n.data?.deviceType === deviceType).length + 1;
    const typeLabel = deviceType.toUpperCase();
    const id = `${deviceType}_${Date.now()}`;
    const newNode = {
      id,
      type: 'deviceNode',
      position: position || { x: 300, y: 200 },
      data: {
        name: `${typeLabel}${count}`,
        deviceType,
        mac: `00:E0:4C:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`,
        ip: deviceType === 'pc' || deviceType === 'laptop' || deviceType === 'server' || deviceType === 'router'
          ? `192.168.1.${10 + state.nodes.length}`
          : '',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        status: 'on'
      }
    };
    this.setState({
      nodes: [...state.nodes, newNode],
      selectedNodeId: id,
      logs: [`[${new Date().toLocaleTimeString()}] ${newNode.data.name} created`, ...state.logs]
    });
  },

  updateNodeData(id, newConfig) {
    const updatedNodes = state.nodes.map(node => {
      if (node.id === id) {
        return {
          ...node,
          data: { ...node.data, ...newConfig }
        };
      }
      return node;
    });
    this.setState({ nodes: updatedNodes });
  },

  deleteNode(id) {
    const nodeToDelete = state.nodes.find(n => n.id === id);
    const updatedNodes = state.nodes.filter(n => n.id !== id);
    const updatedLinks = state.links.filter(l => l.source !== id && l.target !== id);
    this.setState({
      nodes: updatedNodes,
      links: updatedLinks,
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      logs: [`[${new Date().toLocaleTimeString()}] ${nodeToDelete?.data?.name || id} deleted`, ...state.logs]
    });
  },

  addLink(sourceId, targetId) {
    const existing = state.links.find(
      l => (l.source === sourceId && l.target === targetId) || (l.source === targetId && l.target === sourceId)
    );
    if (existing) return;

    const sourceNode = state.nodes.find(n => n.id === sourceId);
    const targetNode = state.nodes.find(n => n.id === targetId);

    const newLink = {
      id: `link_${sourceId}_${targetId}_${Date.now()}`,
      source: sourceId,
      target: targetId,
      data: {
        sourceInterface: sourceNode?.data?.deviceType === 'router' ? 'Gi0/0' : 'eth0',
        targetInterface: targetNode?.data?.deviceType === 'router' ? 'Gi0/0' : 'eth0',
        cost: 1,
        bandwidth: '100Mbps',
        status: 'up'
      }
    };

    this.setState({
      links: [...state.links, newLink],
      logs: [`[${new Date().toLocaleTimeString()}] Link ${sourceNode?.data?.name} <-> ${targetNode?.data?.name} created`, ...state.logs]
    });
  },

  updateLinkData(id, newLinkConfig) {
    const updatedLinks = state.links.map(l => l.id === id ? { ...l, data: { ...l.data, ...newLinkConfig } } : l);
    this.setState({ links: updatedLinks });
  },

  deleteLink(id) {
    this.setState({
      links: state.links.filter(l => l.id !== id),
      selectedLinkId: state.selectedLinkId === id ? null : state.selectedLinkId
    });
  },

  loadTemplate(templateId) {
    const template = TEMPLATES[templateId] || TEMPLATES.demoScenario;
    this.setState({
      nodes: template.nodes,
      links: template.links,
      selectedNodeId: template.nodes[0]?.id || null,
      selectedLinkId: null,
      logs: [`[${new Date().toLocaleTimeString()}] Loaded template: ${template.name}`, ...state.logs]
    });
  },

  addLog(message) {
    this.setState({
      logs: [`[${new Date().toLocaleTimeString()}] ${message}`, ...state.logs]
    });
  },

  clearLogs() {
    this.setState({ logs: [] });
  }
};

export function useNetworkStore() {
  const [current, setCurrent] = useState(networkStore.getState());
  useEffect(() => {
    return networkStore.subscribe(setCurrent);
  }, []);
  return current;
}
