/**
 * Effect-TS Adapter for PDR Knowledge Graph
 * Provides safe, concurrent, and transactional graph operations
 */

import { Effect, Schedule, Duration, Ref, pipe } from 'effect';
import { PDRKnowledgeGraph, DeploymentMode } from '../state/PDRKnowledgeGraph.js';
import { PDRGraphAlgorithms } from '../algorithms/PDRGraphAlgorithms.js';
import { 
  PDRNode, 
  PDREdge, 
  PDRSession,
  KnowledgeGap,
  Cluster
} from '../types/reasoning-patterns/pdr.js';
import { PDRConfig, PDRResult } from '../types/reasoning-patterns/pdr-config.js';
import {
  GraphCapacityError,
  GraphIntegrityError,
  GraphAlgorithmError,
  PDRPassError,
  ResourceLimitError,
  PDRError
} from './errors.js';

/**
 * Effect-TS adapter for PDR Knowledge Graph operations
 * Provides safe wrappers and new Effect-native methods
 */
export class PDRGraphEffectAdapter {
  private readonly graphRef: Ref.Ref<PDRKnowledgeGraph>;
  private readonly writeSemaphore: Semaphore.Semaphore;
  private readonly algorithms: PDRGraphAlgorithms;

  constructor(
    private readonly sessionId: string,
    private readonly mode: DeploymentMode = 'development'
  ) {
    // Initialize with unsafe operations (will be made safe in methods)
    const graph = new PDRKnowledgeGraph(sessionId, mode);
    this.graphRef = Ref.unsafeMake(graph);
    this.writeSemaphore = Semaphore.unsafeMake(1);
    this.algorithms = new PDRGraphAlgorithms();
  }

  /**
   * Get current graph reference (safe read)
   */
  private getGraph(): Effect.Effect<PDRKnowledgeGraph, never> {
    return Ref.get(this.graphRef);
  }

  /**
   * Update graph with write lock
   */
  private updateGraph(
    fn: (graph: PDRKnowledgeGraph) => void
  ): Effect.Effect<void, PDRError> {
    return this.writeSemaphore.withPermits(1)(
      pipe(
        this.getGraph(),
        Effect.tap((graph) => Effect.sync(() => fn(graph))),
        Effect.catchAll((error) =>
          Effect.fail(
            new GraphIntegrityError({
              reason: 'Failed to update graph',
              violation: 'invalid-depth',
              nodeId: undefined
            })
          )
        )
      )
    );
  }

  /**
   * Wrap computeCentrality with Effect error handling and retry
   */
  computeCentrality(): Effect.Effect<Map<string, number>, GraphAlgorithmError> {
    return pipe(
      this.getGraph(),
      Effect.flatMap((graph) =>
        Effect.try({
          try: () => this.algorithms.computeCentrality(graph),
          catch: (e) => new GraphAlgorithmError({
            algorithm: 'PageRank',
            message: 'Failed to compute centrality',
            cause: e
          })
        })
      ),
      Effect.retry(
        Schedule.exponential(Duration.millis(100), 2).pipe(
          Schedule.intersect(Schedule.recurs(3))
        )
      ),
      Effect.timeout(Duration.seconds(10))
    );
  }

  /**
   * Detect connected components with error handling
   */
  detectConnectedComponents(): Effect.Effect<Map<string, Cluster>, GraphAlgorithmError> {
    return pipe(
      this.getGraph(),
      Effect.flatMap((graph) =>
        Effect.try({
          try: () => this.algorithms.detectConnectedComponents(graph),
          catch: (e) => new GraphAlgorithmError({
            algorithm: 'ConnectedComponents',
            message: 'Failed to detect clusters',
            cause: e
          })
        })
      )
    );
  }

  /**
   * Find shortest path with validation
   */
  findPath(
    startId: string,
    endId: string
  ): Effect.Effect<string[], GraphAlgorithmError> {
    return pipe(
      this.getGraph(),
      Effect.flatMap((graph) =>
        Effect.try({
          try: () => this.algorithms.findPath(graph, startId, endId),
          catch: (e) => new GraphAlgorithmError({
            algorithm: 'Dijkstra',
            message: `Failed to find path from ${startId} to ${endId}`,
            cause: e
          })
        })
      )
    );
  }

  /**
   * Identify knowledge gaps with timeout
   */
  identifyGaps(): Effect.Effect<KnowledgeGap[], GraphAlgorithmError> {
    return pipe(
      this.getGraph(),
      Effect.flatMap((graph) =>
        Effect.try({
          try: () => this.algorithms.identifyGaps(graph),
          catch: (e) => new GraphAlgorithmError({
            algorithm: 'GapAnalysis',
            message: 'Failed to identify knowledge gaps',
            cause: e
          })
        })
      ),
      Effect.timeout(Duration.seconds(5))
    );
  }

  /**
   * Create node with capacity checking
   */
  createNode(
    data: Partial<PDRNode>
  ): Effect.Effect<string, GraphCapacityError | GraphIntegrityError> {
    return this.writeSemaphore.withPermits(1)(
      pipe(
        this.getGraph(),
        Effect.flatMap((graph) => {
          // Check capacity
          const nodeCount = graph.getNodeCount();
          const maxNodes = graph.getResourceLimits().nodes;
          
          if (nodeCount >= maxNodes) {
            return Effect.fail(
              new GraphCapacityError({
                currentSize: nodeCount,
                maxSize: maxNodes,
                operation: 'createNode',
                suggestion: 'Consider pruning low-value nodes or upgrading deployment mode'
              })
            );
          }

          // Create node
          return Effect.try({
            try: () => graph.createNode(data),
            catch: (e) => new GraphIntegrityError({
              reason: String(e),
              violation: 'invalid-depth'
            })
          });
        })
      )
    );
  }

  /**
   * Add edge with validation
   */
  addEdge(
    data: Partial<PDREdge>
  ): Effect.Effect<string, GraphCapacityError | GraphIntegrityError> {
    return this.writeSemaphore.withPermits(1)(
      pipe(
        this.getGraph(),
        Effect.flatMap((graph) => {
          // Check edge capacity
          const edgeCount = graph.getEdgeCount();
          const maxEdges = graph.getResourceLimits().edges;
          
          if (edgeCount >= maxEdges) {
            return Effect.fail(
              new GraphCapacityError({
                currentSize: edgeCount,
                maxSize: maxEdges,
                operation: 'addEdge',
                suggestion: 'Consider removing redundant edges'
              })
            );
          }

          // Validate nodes exist
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

          // Add edge
          return Effect.try({
            try: () => graph.addEdge(data),
            catch: (e) => new GraphIntegrityError({
              reason: String(e),
              violation: 'orphan-edge'
            })
          });
        })
      )
    );
  }

  /**
   * Batch operations with transaction semantics
   */
  batchOperations<T>(
    operations: Array<Effect.Effect<T, PDRError>>
  ): Effect.Effect<T[], PDRError> {
    return this.writeSemaphore.withPermits(1)(
      pipe(
        this.getGraph(),
        Effect.flatMap((graph) => {
          // Create snapshot for rollback
          const snapshot = graph.serialize();
          
          return pipe(
            Effect.all(operations, { concurrency: 1 }),
            Effect.catchAll((error) =>
              // Rollback on error
              pipe(
                Effect.sync(() => {
                  const restored = PDRKnowledgeGraph.deserialize(snapshot);
                  Ref.unsafeSet(this.graphRef, restored);
                }),
                Effect.flatMap(() => Effect.fail(error))
              )
            )
          );
        })
      )
    );
  }

  /**
   * Execute PDR pass with comprehensive error handling
   */
  executePDRPass(
    passName: string,
    passNumber: number,
    config: PDRConfig
  ): Effect.Effect<PDRResult, PDRPassError> {
    return pipe(
      Effect.all(
        {
          centrality: this.computeCentrality(),
          clusters: this.detectConnectedComponents(),
          gaps: this.identifyGaps()
        },
        { concurrency: 3 }
      ),
      Effect.map((results) => ({
        sessionId: this.sessionId,
        passNumber,
        passName,
        timestamp: Date.now(),
        confidence: 0.8, // Calculate based on results
        insights: [],
        nextSteps: [],
        metrics: {
          nodesAnalyzed: results.centrality.size,
          clustersFound: results.clusters.size,
          gapsIdentified: results.gaps.length
        }
      })),
      Effect.catchAll((error) =>
        Effect.fail(
          new PDRPassError({
            passName,
            passNumber,
            reason: `Pass execution failed: ${error}`,
            partialResult: null
          })
        )
      ),
      Effect.timeout(Duration.seconds(30))
    );
  }

  /**
   * Prune low-value nodes to free capacity
   */
  pruneGraph(threshold: number): Effect.Effect<number, GraphIntegrityError> {
    return this.writeSemaphore.withPermits(1)(
      pipe(
        Effect.all({
          graph: this.getGraph(),
          centrality: this.computeCentrality()
        }),
        Effect.flatMap(({ graph, centrality }) => {
          const nodes = graph.getAllNodes();
          const toPrune = nodes
            .filter(node => (centrality.get(node.id) || 0) < threshold)
            .map(node => node.id);
          
          return Effect.try({
            try: () => {
              let pruned = 0;
              for (const nodeId of toPrune) {
                if (graph.removeNode(nodeId)) {
                  pruned++;
                }
              }
              return pruned;
            },
            catch: (e) => new GraphIntegrityError({
              reason: `Failed to prune nodes: ${e}`,
              violation: 'invalid-depth'
            })
          });
        })
      )
    );
  }

  /**
   * Get graph statistics
   */
  getStatistics(): Effect.Effect<{
    nodes: number;
    edges: number;
    maxDepth: number;
    averageDegree: number;
    limits: {
      nodes: number;
      edges: number;
      depth: number;
    };
  }, never> {
    return pipe(
      this.getGraph(),
      Effect.map((graph) => {
        const nodes = graph.getAllNodes();
        const edges = graph.getAllEdges();
        const limits = graph.getResourceLimits();
        
        const totalDegree = nodes.reduce((sum, node) => {
          return sum + graph.getOutgoingEdges(node.id).length + 
                       graph.getIncomingEdges(node.id).length;
        }, 0);
        
        return {
          nodes: nodes.length,
          edges: edges.length,
          maxDepth: Math.max(...nodes.map(n => n.depth), 0),
          averageDegree: nodes.length > 0 ? totalDegree / nodes.length : 0,
          limits: {
            nodes: limits.nodes,
            edges: limits.edges,
            depth: limits.depth
          }
        };
      })
    );
  }

  /**
   * Export graph for persistence
   */
  serialize(): Effect.Effect<string, never> {
    return pipe(
      this.getGraph(),
      Effect.map((graph) => graph.serialize())
    );
  }

  /**
   * Import graph from serialized data
   */
  static deserialize(
    data: string
  ): Effect.Effect<PDRGraphEffectAdapter, GraphIntegrityError> {
    return Effect.try({
      try: () => {
        const graph = PDRKnowledgeGraph.deserialize(data);
        const adapter = new PDRGraphEffectAdapter(graph.getSessionId(), graph.getMode());
        Ref.unsafeSet(adapter.graphRef, graph);
        return adapter;
      },
      catch: (e) => new GraphIntegrityError({
        reason: `Failed to deserialize graph: ${e}`,
        violation: 'invalid-depth'
      })
    });
  }
}