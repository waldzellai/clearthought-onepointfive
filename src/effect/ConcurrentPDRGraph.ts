/**
 * Concurrent PDR Graph with STM (Software Transactional Memory)
 * Provides safe concurrent access to graph operations
 */

import { Effect, STM, Ref, pipe } from 'effect';
import { PDRKnowledgeGraph } from '../state/PDRKnowledgeGraph.js';
import { PDRNode, PDREdge } from '../types/reasoning-patterns/pdr.js';
import { GraphCapacityError, GraphIntegrityError } from './errors.js';

/**
 * Graph operation types for batch processing
 */
export type GraphOperation = 
  | { type: 'addNode'; data: Partial<PDRNode> }
  | { type: 'updateNode'; id: string; data: Partial<PDRNode> }
  | { type: 'removeNode'; id: string }
  | { type: 'addEdge'; data: Partial<PDREdge> }
  | { type: 'removeEdge'; id: string };

/**
 * Operation result
 */
export type OperationResult = 
  | { success: true; type: string; id?: string }
  | { success: false; type: string; error: string };

/**
 * Concurrent graph wrapper using STM for consistency
 */
export class ConcurrentPDRGraph {
  private readonly graphRef: Ref.Ref<PDRKnowledgeGraph>;

  constructor(graph: PDRKnowledgeGraph) {
    this.graphRef = Ref.unsafeMake(graph);
  }

  /**
   * Safe concurrent read operation
   */
  readonly getNode = (nodeId: string) =>
    this.readSemaphore.withPermits(1)(
      STM.get(this.graphRef).pipe(
        STM.map(graph => graph.getNode(nodeId)),
        STM.commit
      )
    );

  /**
   * Safe concurrent get all nodes
   */
  readonly getAllNodes = () =>
    this.readSemaphore.withPermits(1)(
      STM.get(this.graphRef).pipe(
        STM.map(graph => graph.getAllNodes()),
        STM.commit
      )
    );

  /**
   * Safe concurrent edge read
   */
  readonly getEdge = (edgeId: string) =>
    this.readSemaphore.withPermits(1)(
      STM.get(this.graphRef).pipe(
        STM.map(graph => graph.getEdge(edgeId)),
        STM.commit
      )
    );

  /**
   * Atomic node creation with STM
   */
  readonly addNode = (data: Partial<PDRNode>) =>
    this.writeSemaphore.withPermits(1)(
      STM.gen(function* ($) {
        const graph = yield* $(STM.get(this.graphRef));
        
        // Check capacity within transaction
        const nodeCount = graph.getNodeCount();
        const maxNodes = graph.getResourceLimits().nodes;
        
        if (nodeCount >= maxNodes) {
          yield* $(STM.fail(
            new GraphCapacityError({
              currentSize: nodeCount,
              maxSize: maxNodes,
              operation: 'addNode',
              suggestion: 'Upgrade deployment mode or prune existing nodes'
            })
          ));
        }
        
        // Create node
        const nodeId = graph.createNode(data);
        yield* $(STM.set(this.graphRef, graph));
        return nodeId;
      }).pipe(STM.commit)
    );

  /**
   * Atomic node update
   */
  readonly updateNode = (nodeId: string, data: Partial<PDRNode>) =>
    this.writeSemaphore.withPermits(1)(
      STM.gen(function* ($) {
        const graph = yield* $(STM.get(this.graphRef));
        
        if (!graph.hasNode(nodeId)) {
          yield* $(STM.fail(
            new GraphIntegrityError({
              nodeId,
              reason: 'Node does not exist',
              violation: 'invalid-depth'
            })
          ));
        }
        
        graph.updateNode(nodeId, data);
        yield* $(STM.set(this.graphRef, graph));
        return true;
      }).pipe(STM.commit)
    );

  /**
   * Atomic edge addition
   */
  readonly addEdge = (data: Partial<PDREdge>) =>
    this.writeSemaphore.withPermits(1)(
      STM.gen(function* ($) {
        const graph = yield* $(STM.get(this.graphRef));
        
        // Check capacity
        const edgeCount = graph.getEdgeCount();
        const maxEdges = graph.getResourceLimits().edges;
        
        if (edgeCount >= maxEdges) {
          yield* $(STM.fail(
            new GraphCapacityError({
              currentSize: edgeCount,
              maxSize: maxEdges,
              operation: 'addEdge'
            })
          ));
        }
        
        // Validate nodes exist
        if (data.sourceId && !graph.hasNode(data.sourceId)) {
          yield* $(STM.fail(
            new GraphIntegrityError({
              nodeId: data.sourceId,
              reason: 'Source node does not exist',
              violation: 'orphan-edge'
            })
          ));
        }
        
        if (data.targetId && !graph.hasNode(data.targetId)) {
          yield* $(STM.fail(
            new GraphIntegrityError({
              nodeId: data.targetId,
              reason: 'Target node does not exist',
              violation: 'orphan-edge'
            })
          ));
        }
        
        const edgeId = graph.addEdge(data);
        yield* $(STM.set(this.graphRef, graph));
        return edgeId;
      }).pipe(STM.commit)
    );

  /**
   * Batch operations with all-or-nothing semantics
   */
  readonly batchUpdate = (operations: GraphOperation[]) =>
    this.writeSemaphore.withPermits(1)(
      STM.gen(function* ($) {
        const graph = yield* $(STM.get(this.graphRef));
        const results: OperationResult[] = [];
        
        // Take snapshot for potential rollback
        const snapshot = graph.serialize();
        
        for (const op of operations) {
          try {
            switch (op.type) {
              case 'addNode': {
                const id = graph.createNode(op.data);
                results.push({ success: true, type: 'addNode', id });
                break;
              }
              
              case 'updateNode': {
                graph.updateNode(op.id, op.data);
                results.push({ success: true, type: 'updateNode', id: op.id });
                break;
              }
              
              case 'removeNode': {
                const removed = graph.removeNode(op.id);
                if (removed) {
                  results.push({ success: true, type: 'removeNode', id: op.id });
                } else {
                  throw new Error(`Node ${op.id} not found`);
                }
                break;
              }
              
              case 'addEdge': {
                const id = graph.addEdge(op.data);
                results.push({ success: true, type: 'addEdge', id });
                break;
              }
              
              case 'removeEdge': {
                const removed = graph.removeEdge(op.id);
                if (removed) {
                  results.push({ success: true, type: 'removeEdge', id: op.id });
                } else {
                  throw new Error(`Edge ${op.id} not found`);
                }
                break;
              }
            }
          } catch (error) {
            // Rollback on any failure
            const restoredGraph = PDRKnowledgeGraph.deserialize(snapshot);
            yield* $(STM.set(this.graphRef, restoredGraph));
            yield* $(STM.fail(
              new GraphIntegrityError({
                reason: `Batch operation failed: ${error}`,
                violation: 'invalid-depth'
              })
            ));
          }
        }
        
        // Commit all changes
        yield* $(STM.set(this.graphRef, graph));
        return results;
      }).pipe(STM.commit)
    );

  /**
   * Optimistic concurrency control for high-frequency reads
   */
  readonly optimisticRead = <T>(
    fn: (graph: PDRKnowledgeGraph) => T
  ): Effect.Effect<T, never> =>
    STM.gen(function* ($) {
      const graph = yield* $(STM.get(this.graphRef));
      return fn(graph);
    }).pipe(
      STM.commit,
      Effect.retry(STM.retryPolicy)
    );

  /**
   * Compare and swap operation
   */
  readonly compareAndSwap = (
    predicate: (graph: PDRKnowledgeGraph) => boolean,
    update: (graph: PDRKnowledgeGraph) => void
  ) =>
    this.writeSemaphore.withPermits(1)(
      STM.gen(function* ($) {
        const graph = yield* $(STM.get(this.graphRef));
        
        if (predicate(graph)) {
          update(graph);
          yield* $(STM.set(this.graphRef, graph));
          return true;
        }
        
        return false;
      }).pipe(STM.commit)
    );

  /**
   * Get statistics atomically
   */
  readonly getStatistics = () =>
    this.readSemaphore.withPermits(1)(
      STM.get(this.graphRef).pipe(
        STM.map(graph => ({
          nodes: graph.getNodeCount(),
          edges: graph.getEdgeCount(),
          clusters: graph.getClusters().size,
          limits: graph.getResourceLimits()
        })),
        STM.commit
      )
    );

  /**
   * Export current state
   */
  readonly serialize = () =>
    this.readSemaphore.withPermits(1)(
      STM.get(this.graphRef).pipe(
        STM.map(graph => graph.serialize()),
        STM.commit
      )
    );

  /**
   * Import state atomically
   */
  readonly deserialize = (data: string) =>
    this.writeSemaphore.withPermits(1)(
      STM.gen(function* ($) {
        try {
          const graph = PDRKnowledgeGraph.deserialize(data);
          yield* $(STM.set(this.graphRef, graph));
          return true;
        } catch (error) {
          yield* $(STM.fail(
            new GraphIntegrityError({
              reason: `Failed to deserialize: ${error}`,
              violation: 'invalid-depth'
            })
          ));
        }
      }).pipe(STM.commit)
    );
}