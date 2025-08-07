/**
 * Tree of Thought (ToT) Reasoning Pattern Types
 * 
 * Enables systematic exploration of multiple reasoning paths with
 * explicit branching and evaluation.
 */

import { BaseReasoningNode } from './base.js';

/**
 * Node in a Tree of Thought structure
 */
export interface TreeOfThoughtNode extends BaseReasoningNode {
  /** Parent node ID (null for root) */
  parentId?: string;
  
  /** IDs of child nodes */
  childrenIds: string[];
  
  /** Depth in the tree (0 for root) */
  depth: number;
  
  /** Evaluation score for this node/path */
  score?: number;
  
  /** Current status of the node */
  status: 'active' | 'explored' | 'pruned' | 'solution';
  
  /** Extended metadata for ToT */
  metadata?: TreeOfThoughtMetadata;
}

/**
 * Metadata specific to Tree of Thought nodes
 */
export interface TreeOfThoughtMetadata {
  /** Strategy used for exploration */
  explorationStrategy?: 'depth-first' | 'breadth-first' | 'best-first';
  
  /** Reason for pruning (if pruned) */
  pruningReason?: string;
  
  /** Confidence in this path (0.0-1.0) */
  confidenceScore?: number;
  
  /** Heuristic value for prioritization */
  heuristicValue?: number;
  
  /** Time spent exploring this node (ms) */
  explorationTime?: number;
  
  /** Domain-specific evaluation metrics */
  domainMetrics?: Record<string, number>;
}

/**
 * Tree of Thought session state
 */
export interface TreeOfThoughtSession {
  /** Session identifier */
  sessionId: string;
  
  /** Root node ID */
  rootNodeId: string;
  
  /** All nodes in the tree */
  nodes: Map<string, TreeOfThoughtNode>;
  
  /** Currently active/focused node */
  currentNodeId: string;
  
  /** Maximum nodes to explore */
  explorationBudget: number;
  
  /** Criteria for evaluating nodes */
  evaluationCriteria: string[];
  
  /** Criteria for identifying solutions */
  solutionCriteria: string;
  
  /** IDs forming the best path found so far */
  bestPathIds?: string[];
  
  /** Configuration for the session */
  config: TreeOfThoughtConfig;
  
  /** Statistics about the exploration */
  stats: TreeOfThoughtStats;
}

/**
 * Configuration for Tree of Thought
 */
export interface TreeOfThoughtConfig {
  /** Maximum depth to explore */
  maxDepth: number;
  
  /** Maximum children per node */
  maxBranchingFactor: number;
  
  /** Default exploration strategy */
  defaultStrategy: 'depth-first' | 'breadth-first' | 'best-first';
  
  /** Minimum score to continue exploration */
  pruningThreshold?: number;
  
  /** Whether to allow revisiting nodes */
  allowRevisiting?: boolean;
  
  /** Time limit for exploration (ms) */
  timeLimit?: number;
}

/**
 * Statistics for Tree of Thought exploration
 */
export interface TreeOfThoughtStats {
  /** Total nodes created */
  nodesCreated: number;
  
  /** Nodes explored */
  nodesExplored: number;
  
  /** Nodes pruned */
  nodesPruned: number;
  
  /** Solutions found */
  solutionsFound: number;
  
  /** Maximum depth reached */
  maxDepthReached: number;
  
  /** Total exploration time (ms) */
  totalTime: number;
  
  /** Average score of explored nodes */
  averageScore?: number;
}

/**
 * Operations specific to Tree of Thought
 */
export interface TreeOfThoughtOperations {
  /** Expand a node by generating children */
  expand(nodeId: string, session: TreeOfThoughtSession): TreeOfThoughtNode[];
  
  /** Evaluate a node's promise/score */
  evaluate(nodeId: string, session: TreeOfThoughtSession): number;
  
  /** Select next node to explore */
  selectNext(session: TreeOfThoughtSession): string | null;
  
  /** Prune a subtree */
  prune(nodeId: string, reason: string, session: TreeOfThoughtSession): void;
  
  /** Check if node meets solution criteria */
  isSolution(nodeId: string, session: TreeOfThoughtSession): boolean;
  
  /** Get path from root to node */
  getPath(nodeId: string, session: TreeOfThoughtSession): string[];
  
  /** Get best path based on scores */
  getBestPath(session: TreeOfThoughtSession): string[];
}