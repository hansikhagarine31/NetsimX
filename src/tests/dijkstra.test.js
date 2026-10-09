import { describe, it, expect } from 'vitest';
import { runDijkstra } from '../algorithms/dijkstra.js';

describe("Dijkstra's Shortest Path Algorithm", () => {
  const nodes = [
    { id: 'R1', data: { name: 'Router1', status: 'on' } },
    { id: 'R2', data: { name: 'Router2', status: 'on' } },
    { id: 'R3', data: { name: 'Router3', status: 'on' } },
    { id: 'R4', data: { name: 'Router4', status: 'on' } },
    { id: 'R5', data: { name: 'Router5', status: 'off' } }, // powered off
  ];

  const links = [
    { id: 'L1', source: 'R1', target: 'R2', data: { cost: 5, status: 'up' } },
    { id: 'L2', source: 'R1', target: 'R3', data: { cost: 2, status: 'up' } },
    { id: 'L3', source: 'R2', target: 'R4', data: { cost: 3, status: 'up' } },
    { id: 'L4', source: 'R3', target: 'R4', data: { cost: 1, status: 'up' } },
    { id: 'L5', source: 'R3', target: 'R5', data: { cost: 1, status: 'up' } },
  ];

  it('calculates shortest path correctly (R1 -> R3 -> R4 with total cost 3)', () => {
    const result = runDijkstra(nodes, links, 'R1', 'R4');
    expect(result.totalCost).toBe(3);
    expect(result.path).toEqual(['R1', 'R3', 'R4']);
  });

  it('ignores powered off nodes (R5)', () => {
    const result = runDijkstra(nodes, links, 'R1', 'R5');
    expect(result.totalCost).toBe(Infinity);
    expect(result.path).toEqual([]);
  });

  it('handles link failure by finding alternate path', () => {
    // Break L4 (R3 -> R4)
    const brokenLinks = links.map(l => l.id === 'L4' ? { ...l, data: { ...l.data, status: 'down' } } : l);
    const result = runDijkstra(nodes, brokenLinks, 'R1', 'R4');
    // Shortest path must now be R1 -> R2 -> R4 with total cost 8 (5 + 3)
    expect(result.totalCost).toBe(8);
    expect(result.path).toEqual(['R1', 'R2', 'R4']);
  });
});
