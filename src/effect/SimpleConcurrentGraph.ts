/**
 * Simplified Concurrent PDR Graph using Ref
 * Provides safe concurrent access without STM complexity
 */

import { Effect, Ref, pipe } from 'effect';
import { PDRKnowledgeGraph } from '../state/PDRKnowledgeGraph.js';
import { PDRNode, PDREdge } from '../types/reasoning-patterns/pdr.js';
import { GraphCapacityError, GraphIntegrityError } from './errors.js';

/**
 * Simplified concurrent graph wrapper using Ref
 */
export class SimpleConcurrentGraph {
  private readonly graphRef: Ref.Ref<PDRKnowledgeGraph>;

  constructor(graph: PDRKnowledgeGraph) {
    this.graphRef = Ref.unsafeMake(graph);
  }

  /**
   * Get node safely
   */
  readonly getNode = (nodeId: string) =>
    Ref.get(this.graphRef).pipe(
      Effect.map(graph => graph.getNode(nodeId))
    );

  /**
   * Get all nodes
   */
  readonly getAllNodes = () =>
    Ref.get(this.graphRef).pipe(
      Effect.map(graph => graph.getAllNodes())
    );

  /**
   * Add node with capacity check
   */
  readonly addNode = (data: Partial<PDRNode>) =>
    Ref.modify(this.graphRef, (graph) => {
      const nodeCount = graph.getNodeCount();
      const maxNodes = 500; // Development limit
      
      if (nodeCount >= maxNodes) {
        return Effect.fail(
          new GraphCapacityError({
            currentSize: nodeCount,
            maxSize: maxNodes,
            operation: 'addNode'
          })
        );
      }
      
      try {
        const nodeId = graph.createNode(data);
        return Effect.succeed([nodeId, graph]);
      } catch (error) {
        return Effect.fail(
          new GraphIntegrityError({
            reason: String(error),
            violation: 'invalid-depth'
          })
        );
      }
    }).pipe(Effect.flatten);

  /**
   * Add edge with validation
   */
  readonly addEdge = (data: Partial<PDREdge>) =>
    Ref.modify(this.graphRef, (graph) => {
      const edgeCount = graph.getEdgeCount();
      const maxEdges = 2500; // Development limit
      
      if (edgeCount >= maxEdges) {
        return Effect.fail(
          new GraphCapacityError({
            currentSize: edgeCount,
            maxSize: maxEdges,
            operation: 'addEdge'
          })
        );
      }
      
      if (data.sourceId && !graph.hasNode(data.sourceId)) {
        return Effect.fail(
          new GraphIntegrityError({
            nodeId: data.sourceId,
            reason: 'Source node does not exist',
            violation: 'orphan-edge'
          })
        );
      }
      
      if (data.targetId && !graph.hasNode(data.targetId)) {
        return Effect.fail(
          new GraphIntegrityError({
            nodeId: data.targetId,
            reason: 'Target node does not exist',
            violation: 'orphan-edge'
          })
        );
      }
      
      try {
        const edgeId = graph.addEdge(data);
        return Effect.succeed([edgeId, graph]);
      } catch (error) {
        return Effect.fail(
          new GraphIntegrityError({
            reason: String(error),
            violation: 'orphan-edge'
          })
        );
      }
    }).pipe(Effect.flatten);

  /**
   * Get statistics
   */
  readonly getStatistics = () =>
    Ref.get(this.graphRef).pipe(
      Effect.map(graph => ({
        nodes: graph.getNodeCount(),
        edges: graph.getEdgeCount(),
        clusters: graph.getClusters().size
      }))
    );

  /**
   * Serialize graph
   */
  readonly serialize = () =>
    Ref.get(this.graphRef).pipe(
      Effect.map(graph => graph.serialize())
    );
}