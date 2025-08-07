/**
 * Graph of Thought (GoT) Reasoning Pattern Types
 * 
 * Enables non-hierarchical connections between thoughts with support
 * for complex reasoning patterns including cycles and multiple connections.
 */

import { BaseReasoningNode, BaseReasoningSession } from './base.js';

/**
 * Node types in a Graph of Thought
 */
export type GraphNodeType = 
  | 'hypothesis'
  | 'evidence' 
  | 'conclusion'
  | 'question'
  | 'insight'
  | 'assumption'
  | 'counterargument';

/**
 * Edge types representing relationships between nodes
 */
export type GraphEdgeType =
  | 'supports'
  | 'contradicts'
  | 'refines'
  | 'questions'
  | 'leads-to'
  | 'depends-on'
  | 'alternatives'
  | 'elaborates';

/**
 * Node in a Graph of Thought structure
 */
export interface GraphOfThoughtNode extends BaseReasoningNode {
  /** Type of node */
  nodeType: GraphNodeType;
  
  /** Node importance/confidence (0.0-1.0) */
  strength: number;
  
  /** Incoming edge IDs */
  incomingEdges: string[];
  
  /** Outgoing edge IDs */
  outgoingEdges: string[];
  
  /** Extended metadata */
  metadata?: GraphNodeMetadata;
}

/**
 * Metadata specific to Graph of Thought nodes
 */
export interface GraphNodeMetadata {
  /** Source of the information */
  source?: string;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Certainty level */
  certainty?: 'high' | 'medium' | 'low' | 'speculative';
  
  /** Supporting references */
  references?: string[];
  
  /** Node creation context */
  context?: string;
  
  /** Domain-specific attributes */
  domainAttributes?: Record<string, any>;
}

/**
 * Edge in a Graph of Thought structure
 */
export interface GraphOfThoughtEdge {
  /** Unique edge identifier */
  id: string;
  
  /** Source node ID */
  sourceId: string;
  
  /** Target node ID */
  targetId: string;
  
  /** Type of relationship */
  edgeType: GraphEdgeType;
  
  /** Connection strength (0.0-1.0) */
  weight: number;
  
  /** Whether the edge is bidirectional */
  bidirectional?: boolean;
  
  /** Edge metadata */
  metadata?: GraphEdgeMetadata;
}

/**
 * Metadata for graph edges
 */
export interface GraphEdgeMetadata {
  /** Justification for the connection */
  justification?: string;
  
  /** Confidence in the connection (0.0-1.0) */
  confidence?: number;
  
  /** Evidence supporting the connection */
  evidence?: string[];
  
  /** Timestamp of edge creation */
  createdAt?: string;
  
  /** Who/what created this edge */
  createdBy?: string;
}

/**
 * Graph of Thought session state
 */
export interface GraphOfThoughtSession extends BaseReasoningSession {
  /** All nodes in the graph */
  nodes: Map<string, GraphOfThoughtNode>;
  
  /** All edges in the graph */
  edges: Map<string, GraphOfThoughtEdge>;
  
  /** Entry point node IDs */
  entryNodeIds: string[];
  
  /** Currently focused node */
  currentFocusNodeId?: string;
  
  /** History of node visits */
  explorationPath: string[];
  
  /** Graph analysis metrics */
  analysisMetrics?: GraphAnalysisMetrics;
  
  /** Configuration */
  config: GraphOfThoughtConfig;
  
  /** Statistics */
  stats: GraphOfThoughtStats;
}

/**
 * Graph analysis metrics
 */
export interface GraphAnalysisMetrics {
  /** Node centrality scores */
  centrality: Map<string, number>;
  
  /** Identified clusters of related nodes */
  clusters?: NodeCluster[];
  
  /** Critical paths through the graph */
  criticalPaths?: string[][];
  
  /** Strongly connected components */
  stronglyConnectedComponents?: string[][];
  
  /** Cycles detected in the graph */
  cycles?: string[][];
  
  /** Influence scores for nodes */
  influence?: Map<string, number>;
}

/**
 * Cluster of related nodes
 */
export interface NodeCluster {
  /** Cluster identifier */
  id: string;
  
  /** Node IDs in the cluster */
  nodeIds: string[];
  
  /** Cluster cohesion score */
  cohesion: number;
  
  /** Cluster label/theme */
  label?: string;
  
  /** Central node in the cluster */
  centroidNodeId?: string;
}

/**
 * Configuration for Graph of Thought
 */
export interface GraphOfThoughtConfig {
  /** Maximum nodes in the graph */
  maxNodes?: number;
  
  /** Maximum edges in the graph */
  maxEdges?: number;
  
  /** Whether to allow cycles */
  allowCycles?: boolean;
  
  /** Minimum edge weight to maintain */
  edgeWeightThreshold?: number;
  
  /** Analysis algorithms to run */
  analysisAlgorithms?: ('centrality' | 'clustering' | 'paths' | 'cycles')[];
  
  /** Default node type for new nodes */
  defaultNodeType?: GraphNodeType;
  
  /** Auto-prune weak connections */
  autoPruneWeakEdges?: boolean;
}

/**
 * Statistics for Graph of Thought
 */
export interface GraphOfThoughtStats {
  /** Total nodes created */
  totalNodes: number;
  
  /** Total edges created */
  totalEdges: number;
  
  /** Node count by type */
  nodesByType: Record<GraphNodeType, number>;
  
  /** Edge count by type */
  edgesByType: Record<GraphEdgeType, number>;
  
  /** Average node degree */
  averageDegree: number;
  
  /** Graph density (0.0-1.0) */
  density: number;
  
  /** Number of connected components */
  connectedComponents: number;
  
  /** Longest path length */
  diameter?: number;
}

/**
 * Operations specific to Graph of Thought
 */
export interface GraphOfThoughtOperations {
  /** Add a node to the graph */
  addNode(node: Omit<GraphOfThoughtNode, 'id' | 'incomingEdges' | 'outgoingEdges'>, session: GraphOfThoughtSession): GraphOfThoughtNode;
  
  /** Connect two nodes */
  connectNodes(sourceId: string, targetId: string, edgeType: GraphEdgeType, weight: number, session: GraphOfThoughtSession): GraphOfThoughtEdge;
  
  /** Find paths between nodes */
  findPaths(startId: string, endId: string, session: GraphOfThoughtSession): string[][];
  
  /** Get node neighbors */
  getNeighbors(nodeId: string, direction: 'incoming' | 'outgoing' | 'both', session: GraphOfThoughtSession): string[];
  
  /** Calculate node importance */
  calculateCentrality(session: GraphOfThoughtSession): Map<string, number>;
  
  /** Detect communities/clusters */
  detectCommunities(session: GraphOfThoughtSession): NodeCluster[];
  
  /** Find contradictions */
  findContradictions(session: GraphOfThoughtSession): Array<{nodeIds: string[], description: string}>;
  
  /** Merge similar nodes */
  mergeNodes(nodeIds: string[], session: GraphOfThoughtSession): GraphOfThoughtNode;
}

/**
 * Path finding options
 */
export interface PathFindingOptions {
  /** Maximum path length */
  maxLength?: number;
  
  /** Minimum path weight */
  minWeight?: number;
  
  /** Edge types to consider */
  allowedEdgeTypes?: GraphEdgeType[];
  
  /** Whether to find all paths or just shortest */
  findAll?: boolean;
  
  /** Use edge weights in path calculation */
  weighted?: boolean;
}