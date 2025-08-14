/**
 * PDR Knowledge Graph Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PDRKnowledgeGraph, DeploymentMode } from '../src/state/PDRKnowledgeGraph.js';
import { PDRGraphAlgorithms } from '../src/algorithms/PDRGraphAlgorithms.js';
import { SessionState } from '../src/state/SessionState.js';
import { ServerConfigSchema } from '../src/config.js';

describe('PDRKnowledgeGraph', () => {
  let graph: PDRKnowledgeGraph;
  
  beforeEach(() => {
    graph = new PDRKnowledgeGraph('test-session', 'development');
  });
  
  describe('Node Management', () => {
    it('should create nodes with proper structure', () => {
      const nodeId = graph.createNode({
        content: 'Test subject',
        type: 'subject',
        depth: 0
      });
      
      expect(nodeId).toBeDefined();
      expect(nodeId).toMatch(/^node-/);
      
      const node = graph.getNode(nodeId);
      expect(node).toBeDefined();
      expect(node?.content).toBe('Test subject');
      expect(node?.type).toBe('subject');
      expect(node?.depth).toBe(0);
    });
    
    it('should enforce node limits based on deployment mode', () => {
      const devGraph = new PDRKnowledgeGraph('dev-test', 'development');
      
      // Development mode has 500 node limit
      for (let i = 0; i < 500; i++) {
        devGraph.createNode({ content: `Node ${i}` });
      }
      
      expect(() => {
        devGraph.createNode({ content: 'One too many' });
      }).toThrow(/Maximum node limit.*500.*reached/);
    });
    
    it('should maintain parent-child hierarchy', () => {
      const parentId = graph.createNode({ content: 'Parent', depth: 0 });
      const childId = graph.createNode({ 
        content: 'Child', 
        depth: 1,
        parentId 
      });
      
      const parent = graph.getNode(parentId);
      const child = graph.getNode(childId);
      
      expect(parent?.childrenIds.has(childId)).toBe(true);
      expect(child?.parentId).toBe(parentId);
    });
  });
  
  describe('Edge Management', () => {
    it('should create edges between nodes', () => {
      const node1 = graph.createNode({ content: 'Node 1' });
      const node2 = graph.createNode({ content: 'Node 2' });
      
      const edgeId = graph.addEdge({
        sourceId: node1,
        targetId: node2,
        type: 'supports',
        weight: 0.8
      });
      
      expect(edgeId).toBeDefined();
      expect(edgeId).toMatch(/^edge-/);
      
      const edge = graph.getEdge(edgeId);
      expect(edge?.sourceId).toBe(node1);
      expect(edge?.targetId).toBe(node2);
      expect(edge?.type).toBe('supports');
      expect(edge?.weight).toBe(0.8);
    });
    
    it('should validate edge weights', () => {
      const node1 = graph.createNode({ content: 'Node 1' });
      const node2 = graph.createNode({ content: 'Node 2' });
      
      expect(() => {
        graph.addEdge({
          sourceId: node1,
          targetId: node2,
          weight: -0.5 // Invalid weight
        });
      }).toThrow(/Edge weight must be between 0 and 1/);
    });
    
    it('should track incoming and outgoing edges', () => {
      const node1 = graph.createNode({ content: 'Node 1' });
      const node2 = graph.createNode({ content: 'Node 2' });
      const node3 = graph.createNode({ content: 'Node 3' });
      
      graph.addEdge({ sourceId: node1, targetId: node2 });
      graph.addEdge({ sourceId: node1, targetId: node3 });
      graph.addEdge({ sourceId: node2, targetId: node3 });
      
      const outgoing1 = graph.getOutgoingEdges(node1);
      const incoming3 = graph.getIncomingEdges(node3);
      
      expect(outgoing1).toHaveLength(2);
      expect(incoming3).toHaveLength(2);
    });
  });
  
  describe('Graph Algorithms', () => {
    let algorithms: PDRGraphAlgorithms;
    
    beforeEach(() => {
      algorithms = new PDRGraphAlgorithms();
    });
    
    it('should compute centrality with PageRank', () => {
      // Create a simple graph
      const n1 = graph.createNode({ content: 'Central' });
      const n2 = graph.createNode({ content: 'Node 2' });
      const n3 = graph.createNode({ content: 'Node 3' });
      const n4 = graph.createNode({ content: 'Node 4' });
      
      // n1 is central - all others point to it
      graph.addEdge({ sourceId: n2, targetId: n1, weight: 1 });
      graph.addEdge({ sourceId: n3, targetId: n1, weight: 1 });
      graph.addEdge({ sourceId: n4, targetId: n1, weight: 1 });
      graph.addEdge({ sourceId: n1, targetId: n2, weight: 0.5 });
      
      const centrality = algorithms.computeCentrality(graph);
      
      expect(centrality.size).toBe(4);
      expect(centrality.get(n1)).toBeGreaterThan(centrality.get(n2)!);
      expect(centrality.get(n1)).toBeGreaterThan(centrality.get(n3)!);
      
      // Total centrality should sum to 1
      const total = Array.from(centrality.values()).reduce((a, b) => a + b, 0);
      expect(Math.abs(total - 1)).toBeLessThan(0.01);
    });
    
    it('should handle dangling nodes in PageRank', () => {
      // Create nodes with no outgoing edges (dangling)
      const n1 = graph.createNode({ content: 'Node 1' });
      const n2 = graph.createNode({ content: 'Dangling' });
      const n3 = graph.createNode({ content: 'Node 3' });
      
      graph.addEdge({ sourceId: n1, targetId: n3 });
      // n2 has no outgoing edges (dangling node)
      
      const centrality = algorithms.computeCentrality(graph);
      
      // Should not throw or produce NaN values
      expect(centrality.get(n2)).toBeDefined();
      expect(centrality.get(n2)).not.toBeNaN();
      
      const total = Array.from(centrality.values()).reduce((a, b) => a + b, 0);
      expect(Math.abs(total - 1)).toBeLessThan(0.01);
    });
    
    it('should detect connected components', () => {
      // Create two separate clusters
      const cluster1_n1 = graph.createNode({ content: 'C1-N1' });
      const cluster1_n2 = graph.createNode({ content: 'C1-N2' });
      const cluster2_n1 = graph.createNode({ content: 'C2-N1' });
      const cluster2_n2 = graph.createNode({ content: 'C2-N2' });
      
      // Connect within clusters with high weight
      graph.addEdge({ sourceId: cluster1_n1, targetId: cluster1_n2, weight: 0.9 });
      graph.addEdge({ sourceId: cluster2_n1, targetId: cluster2_n2, weight: 0.9 });
      
      const clusters = algorithms.detectConnectedComponents(graph);
      
      expect(clusters.size).toBeGreaterThanOrEqual(1);
      
      // Each cluster should have coherent nodes
      clusters.forEach(cluster => {
        expect(cluster.nodeIds.size).toBeGreaterThanOrEqual(2);
        expect(cluster.coherence).toBeGreaterThan(0);
      });
    });
    
    it('should find shortest path with Dijkstra', () => {
      const n1 = graph.createNode({ content: 'Start' });
      const n2 = graph.createNode({ content: 'Middle 1' });
      const n3 = graph.createNode({ content: 'Middle 2' });
      const n4 = graph.createNode({ content: 'End' });
      
      // Create path: n1 -> n2 -> n4 (shorter)
      // Alternative: n1 -> n3 -> n4 (longer due to weights)
      graph.addEdge({ sourceId: n1, targetId: n2, weight: 0.9 });
      graph.addEdge({ sourceId: n2, targetId: n4, weight: 0.9 });
      graph.addEdge({ sourceId: n1, targetId: n3, weight: 0.3 });
      graph.addEdge({ sourceId: n3, targetId: n4, weight: 0.3 });
      
      const path = algorithms.findPath(graph, n1, n4);
      
      expect(path).toBeDefined();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toBe(n1);
      expect(path[path.length - 1]).toBe(n4);
    });
    
    it('should identify knowledge gaps', () => {
      const n1 = graph.createNode({ 
        content: 'Low confidence',
        scores: { confidence: 0.2, centrality: 0, passScores: new Map() }
      });
      const n2 = graph.createNode({ content: 'Node 2' });
      const n3 = graph.createNode({ content: 'Node 3' });
      
      // Create contradiction
      graph.addEdge({ sourceId: n2, targetId: n3, type: 'contradicts', weight: 0.8 });
      
      const gaps = algorithms.identifyGaps(graph);
      
      expect(gaps.length).toBeGreaterThan(0);
      
      // Should find low confidence gap
      const lowConfGap = gaps.find(g => g.type === 'weak-evidence');
      expect(lowConfGap).toBeDefined();
      
      // Should find contradiction
      const contradictionGap = gaps.find(g => g.type === 'contradiction');
      expect(contradictionGap).toBeDefined();
    });
  });
  
  describe('SessionState Integration', () => {
    it('should integrate with SessionState', () => {
      const config = ServerConfigSchema.parse({});
      const sessionState = new SessionState('test-session', config);
      
      // Get or create PDR graph
      const graph = sessionState.getPDRGraph();
      expect(graph).toBeDefined();
      
      // Add some nodes
      const nodeId = graph.createNode({ content: 'Test node' });
      expect(graph.getNode(nodeId)).toBeDefined();
      
      // Serialize and deserialize
      const serialized = sessionState.serializePDRGraph();
      expect(serialized).toBeDefined();
      
      // Create new session and restore
      const newSession = new SessionState('new-session', config);
      newSession.deserializePDRGraph(serialized!);
      
      const restoredGraph = newSession.getPDRGraph();
      expect(restoredGraph.getNode(nodeId)).toBeDefined();
    });
  });
  
  describe('Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      // Create complex graph
      const n1 = graph.createNode({ content: 'Node 1', depth: 0 });
      const n2 = graph.createNode({ content: 'Node 2', depth: 1, parentId: n1 });
      graph.addEdge({ sourceId: n1, targetId: n2, type: 'leads-to', weight: 0.7 });
      
      // Add metadata
      graph.updateNode(n1, {
        metadata: { selected: true, tags: new Set(['important']) }
      });
      
      // Serialize
      const serialized = graph.serialize();
      expect(serialized).toBeDefined();
      
      // Deserialize
      const restored = PDRKnowledgeGraph.deserialize(serialized);
      
      // Verify structure
      expect(restored.getNodeCount()).toBe(2);
      expect(restored.getEdgeCount()).toBe(1);
      
      const restoredNode = restored.getNode(n1);
      expect(restoredNode?.content).toBe('Node 1');
      expect(restoredNode?.metadata.selected).toBe(true);
    });
  });
});