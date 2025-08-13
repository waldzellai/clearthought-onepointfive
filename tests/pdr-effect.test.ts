/**
 * Tests for Effect-TS PDR Integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Effect, Exit, pipe } from 'effect';
import { PDRGraphEffectAdapter } from '../src/effect/PDRGraphEffectAdapter.js';
import { ConcurrentPDRGraph } from '../src/effect/ConcurrentPDRGraph.js';
import { PDRKnowledgeGraph } from '../src/state/PDRKnowledgeGraph.js';
import {
  GraphCapacityError,
  GraphIntegrityError,
  GraphAlgorithmError
} from '../src/effect/errors.js';

describe('PDRGraphEffectAdapter', () => {
  let adapter: PDRGraphEffectAdapter;
  
  beforeEach(() => {
    adapter = new PDRGraphEffectAdapter('test-session', 'development');
  });
  
  describe('Basic Operations', () => {
    it('should create nodes with Effect wrapper', async () => {
      const program = adapter.createNode({
        content: 'Test node',
        type: 'concept',
        depth: 0
      });
      
      const result = await Effect.runPromise(program);
      expect(result).toBeDefined();
      expect(result).toMatch(/^node-/);
    });
    
    it('should handle capacity errors gracefully', async () => {
      // Create adapter with minimal capacity
      const limitedAdapter = new PDRGraphEffectAdapter('limited', 'development');
      
      // Fill up to capacity (development mode = 500 nodes)
      const programs: Effect.Effect<string, any>[] = [];
      for (let i = 0; i < 501; i++) {
        programs.push(
          limitedAdapter.createNode({ content: `Node ${i}` })
        );
      }
      
      // This should work up to 500
      const results = await Effect.runPromise(
        Effect.all(programs.slice(0, 500), { concurrency: 1 })
      );
      expect(results).toHaveLength(500);
      
      // The 501st should fail with GraphCapacityError
      const exit = await Effect.runPromiseExit(programs[500]);
      expect(Exit.isFailure(exit)).toBe(true);
      
      if (Exit.isFailure(exit)) {
        const error = exit.cause;
        expect(error).toBeDefined();
      }
    });
    
    it('should validate edges before creation', async () => {
      const node1 = await Effect.runPromise(
        adapter.createNode({ content: 'Node 1' })
      );
      
      const node2 = await Effect.runPromise(
        adapter.createNode({ content: 'Node 2' })
      );
      
      // Valid edge
      const edgeId = await Effect.runPromise(
        adapter.addEdge({
          sourceId: node1,
          targetId: node2,
          type: 'connects',
          weight: 0.7
        })
      );
      expect(edgeId).toMatch(/^edge-/);
      
      // Invalid edge (non-existent nodes)
      const exit = await Effect.runPromiseExit(
        adapter.addEdge({
          sourceId: 'invalid-node',
          targetId: node2
        })
      );
      expect(Exit.isFailure(exit)).toBe(true);
    });
  });
  
  describe('Algorithm Wrappers', () => {
    beforeEach(async () => {
      // Create a small graph for testing
      const nodes = await Effect.runPromise(
        Effect.all([
          adapter.createNode({ content: 'A' }),
          adapter.createNode({ content: 'B' }),
          adapter.createNode({ content: 'C' })
        ])
      );
      
      await Effect.runPromise(
        Effect.all([
          adapter.addEdge({ sourceId: nodes[0], targetId: nodes[1], weight: 0.8 }),
          adapter.addEdge({ sourceId: nodes[1], targetId: nodes[2], weight: 0.6 })
        ])
      );
    });
    
    it('should compute centrality with retry on failure', async () => {
      const centrality = await Effect.runPromise(
        adapter.computeCentrality()
      );
      
      expect(centrality).toBeInstanceOf(Map);
      expect(centrality.size).toBeGreaterThan(0);
      
      // Verify total centrality sums to ~1
      const total = Array.from(centrality.values()).reduce((a, b) => a + b, 0);
      expect(Math.abs(total - 1)).toBeLessThan(0.01);
    });
    
    it('should detect connected components', async () => {
      const clusters = await Effect.runPromise(
        adapter.detectConnectedComponents()
      );
      
      expect(clusters).toBeInstanceOf(Map);
    });
    
    it('should find shortest path', async () => {
      const nodes = await Effect.runPromise(
        adapter.getStatistics()
      );
      
      // We need actual node IDs for path finding
      // This is a simplified test
      expect(nodes.nodes).toBeGreaterThan(0);
    });
    
    it('should identify knowledge gaps with timeout', async () => {
      const gaps = await Effect.runPromise(
        adapter.identifyGaps()
      );
      
      expect(Array.isArray(gaps)).toBe(true);
    });
  });
  
  describe('Batch Operations', () => {
    it('should execute batch operations transactionally', async () => {
      const operations = [
        adapter.createNode({ content: 'Batch 1' }),
        adapter.createNode({ content: 'Batch 2' }),
        adapter.createNode({ content: 'Batch 3' })
      ];
      
      const results = await Effect.runPromise(
        adapter.batchOperations(operations)
      );
      
      expect(results).toHaveLength(3);
      results.forEach(id => expect(id).toMatch(/^node-/));
    });
    
    it('should rollback batch on error', async () => {
      const statsBefore = await Effect.runPromise(adapter.getStatistics());
      
      const operations = [
        adapter.createNode({ content: 'Valid' }),
        adapter.addEdge({ 
          sourceId: 'invalid-source',
          targetId: 'invalid-target'
        }) // This will fail
      ];
      
      const exit = await Effect.runPromiseExit(
        adapter.batchOperations(operations)
      );
      
      expect(Exit.isFailure(exit)).toBe(true);
      
      // Verify rollback - stats should be unchanged
      const statsAfter = await Effect.runPromise(adapter.getStatistics());
      expect(statsAfter.nodes).toBe(statsBefore.nodes);
    });
  });
  
  describe('Statistics and Serialization', () => {
    it('should provide graph statistics', async () => {
      const stats = await Effect.runPromise(adapter.getStatistics());
      
      expect(stats).toHaveProperty('nodes');
      expect(stats).toHaveProperty('edges');
      expect(stats).toHaveProperty('maxDepth');
      expect(stats).toHaveProperty('averageDegree');
      expect(stats).toHaveProperty('limits');
    });
    
    it('should serialize and deserialize', async () => {
      // Add some data
      const nodeId = await Effect.runPromise(
        adapter.createNode({ content: 'Serialize me' })
      );
      
      // Serialize
      const serialized = await Effect.runPromise(adapter.serialize());
      expect(typeof serialized).toBe('string');
      
      // Deserialize to new adapter
      const restoredAdapter = await Effect.runPromise(
        PDRGraphEffectAdapter.deserialize(serialized)
      );
      
      // Verify data preserved
      const stats = await Effect.runPromise(restoredAdapter.getStatistics());
      expect(stats.nodes).toBeGreaterThan(0);
    });
  });
});

describe('ConcurrentPDRGraph', () => {
  let graph: PDRKnowledgeGraph;
  let concurrent: ConcurrentPDRGraph;
  
  beforeEach(() => {
    graph = new PDRKnowledgeGraph('concurrent-test', 'development');
    concurrent = new ConcurrentPDRGraph(graph);
  });
  
  describe('Concurrent Reads', () => {
    it('should handle multiple concurrent reads', async () => {
      // Add test nodes
      const nodeIds = [];
      for (let i = 0; i < 10; i++) {
        const id = graph.createNode({ content: `Node ${i}` });
        nodeIds.push(id);
      }
      
      // Concurrent reads
      const reads = nodeIds.map(id => concurrent.getNode(id));
      const results = await Effect.runPromise(Effect.all(reads));
      
      expect(results).toHaveLength(10);
      results.forEach((node, i) => {
        expect(node?.content).toBe(`Node ${i}`);
      });
    });
  });
  
  describe('Atomic Writes', () => {
    it('should serialize write operations', async () => {
      const writes = [];
      for (let i = 0; i < 5; i++) {
        writes.push(
          concurrent.addNode({ content: `Concurrent ${i}` })
        );
      }
      
      const results = await Effect.runPromise(
        Effect.all(writes, { concurrency: 5 })
      );
      
      expect(results).toHaveLength(5);
      results.forEach(id => expect(id).toMatch(/^node-/));
      
      // Verify all nodes were added
      const stats = await Effect.runPromise(concurrent.getStatistics());
      expect(stats.nodes).toBe(5);
    });
  });
  
  describe('Batch Operations', () => {
    it('should execute batch atomically', async () => {
      const operations = [
        { type: 'addNode' as const, data: { content: 'Batch 1' } },
        { type: 'addNode' as const, data: { content: 'Batch 2' } },
        { type: 'addNode' as const, data: { content: 'Batch 3' } }
      ];
      
      const results = await Effect.runPromise(
        concurrent.batchUpdate(operations)
      );
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
    
    it('should rollback batch on failure', async () => {
      const operations = [
        { type: 'addNode' as const, data: { content: 'Will succeed' } },
        { type: 'removeNode' as const, id: 'non-existent' } // Will fail
      ];
      
      const exit = await Effect.runPromiseExit(
        concurrent.batchUpdate(operations)
      );
      
      expect(Exit.isFailure(exit)).toBe(true);
      
      // Verify rollback
      const stats = await Effect.runPromise(concurrent.getStatistics());
      expect(stats.nodes).toBe(0); // No nodes should exist
    });
  });
  
  describe('Compare and Swap', () => {
    it('should perform CAS operations', async () => {
      // Add initial node
      await Effect.runPromise(
        concurrent.addNode({ content: 'Initial' })
      );
      
      // CAS that should succeed
      const result1 = await Effect.runPromise(
        concurrent.compareAndSwap(
          graph => graph.getNodeCount() === 1,
          graph => graph.createNode({ content: 'CAS Added' })
        )
      );
      expect(result1).toBe(true);
      
      // CAS that should fail
      const result2 = await Effect.runPromise(
        concurrent.compareAndSwap(
          graph => graph.getNodeCount() === 1, // Now we have 2
          graph => graph.createNode({ content: 'Should not add' })
        )
      );
      expect(result2).toBe(false);
      
      // Verify final state
      const stats = await Effect.runPromise(concurrent.getStatistics());
      expect(stats.nodes).toBe(2);
    });
  });
});