/**
 * Beam Search Reasoning Pattern Types
 *
 * Maintains multiple promising paths simultaneously, exploring them
 * in parallel with periodic evaluation and pruning.
 */
import { BaseReasoningNode, BaseReasoningSession } from './base.js';
/**
 * Status of a beam search path
 */
export type BeamPathStatus = 'active' | 'completed' | 'pruned' | 'merged' | 'stalled';
/**
 * Node in a beam search
 */
export interface BeamSearchNode extends BaseReasoningNode {
    /** Which paths include this node */
    pathIds: string[];
    /** Generation when this node was created */
    generationNumber: number;
    /** Local score for this specific node */
    localScore: number;
    /** Cumulative score from root to this node */
    cumulativeScore?: number;
    /** Extended metadata */
    metadata?: BeamNodeMetadata;
}
/**
 * Metadata for beam search nodes
 */
export interface BeamNodeMetadata {
    /** Features used for scoring */
    scoringFeatures?: Record<string, number>;
    /** Parent node IDs (can have multiple in beam search) */
    parentIds?: string[];
    /** Child node IDs */
    childIds?: string[];
    /** Generation time (ms) */
    generationTime?: number;
    /** Domain-specific attributes */
    domainAttributes?: Record<string, any>;
}
/**
 * A path being explored in beam search
 */
export interface BeamSearchPath {
    /** Unique path identifier */
    id: string;
    /** Ordered list of node IDs in this path */
    nodeIds: string[];
    /** Current path score */
    currentScore: number;
    /** Path status */
    status: BeamPathStatus;
    /** Path metadata */
    metadata?: BeamPathMetadata;
}
/**
 * Metadata for beam paths
 */
export interface BeamPathMetadata {
    /** Generation when path was pruned */
    pruningGeneration?: number;
    /** ID of path this was merged into */
    mergedIntoPathId?: string;
    /** Convergence metric (0.0-1.0) */
    convergenceMetric?: number;
    /** Score history */
    scoreHistory?: number[];
    /** Pruning reason */
    pruningReason?: string;
    /** Path creation time */
    createdAt?: string;
    /** Last update time */
    updatedAt?: string;
}
/**
 * Beam search session state
 */
export interface BeamSearchSession extends BaseReasoningSession {
    /** Maximum number of paths to maintain */
    beamWidth: number;
    /** Current generation number */
    currentGeneration: number;
    /** All nodes created */
    nodes: Map<string, BeamSearchNode>;
    /** All paths (active and inactive) */
    paths: Map<string, BeamSearchPath>;
    /** Currently active path IDs */
    activePaths: string[];
    /** Evaluation function description */
    evaluationFunction: string;
    /** Convergence criteria */
    convergenceCriteria?: ConvergenceCriteria;
    /** Configuration */
    config: BeamSearchConfig;
    /** Statistics */
    stats: BeamSearchStats;
}
/**
 * Convergence criteria for beam search
 */
export interface ConvergenceCriteria {
    /** Maximum generations to run */
    maxGenerations?: number;
    /** Minimum score improvement between generations */
    minScoreImprovement?: number;
    /** Consensus threshold (fraction of paths agreeing) */
    consensusThreshold?: number;
    /** Target score to reach */
    targetScore?: number;
    /** Maximum time to run (ms) */
    timeLimit?: number;
    /** Custom convergence function */
    customFunction?: string;
}
/**
 * Configuration for beam search
 */
export interface BeamSearchConfig {
    /** Expansion strategy */
    expansionStrategy: 'breadth' | 'depth' | 'hybrid';
    /** Number of children per node */
    branchingFactor: number;
    /** Score aggregation method */
    scoreAggregation: 'sum' | 'average' | 'max' | 'weighted';
    /** Whether to allow path merging */
    allowMerging?: boolean;
    /** Merge threshold (similarity score) */
    mergeThreshold?: number;
    /** Pruning strategy */
    pruningStrategy: 'absolute' | 'relative' | 'adaptive';
    /** Whether to keep pruned paths for analysis */
    keepPrunedPaths?: boolean;
    /** Diversity bonus to encourage exploration */
    diversityBonus?: number;
}
/**
 * Statistics for beam search
 */
export interface BeamSearchStats {
    /** Total paths created */
    totalPaths: number;
    /** Paths currently active */
    activePaths: number;
    /** Paths completed */
    completedPaths: number;
    /** Paths pruned */
    prunedPaths: number;
    /** Paths merged */
    mergedPaths: number;
    /** Total nodes explored */
    nodesExplored: number;
    /** Average path length */
    averagePathLength: number;
    /** Best score achieved */
    bestScore: number;
    /** Generation of best score */
    bestScoreGeneration: number;
    /** Score variance in current beam */
    scoreVariance?: number;
}
/**
 * Operations specific to beam search
 */
export interface BeamSearchOperations {
    /** Generate next generation of nodes */
    generateNextGeneration(session: BeamSearchSession): BeamSearchNode[];
    /** Evaluate and score paths */
    evaluatePaths(session: BeamSearchSession): Map<string, number>;
    /** Prune paths to maintain beam width */
    prunePaths(session: BeamSearchSession): string[];
    /** Check for path convergence */
    checkConvergence(session: BeamSearchSession): boolean;
    /** Merge similar paths */
    mergePaths(pathIds: string[], session: BeamSearchSession): BeamSearchPath;
    /** Get best path */
    getBestPath(session: BeamSearchSession): BeamSearchPath | null;
    /** Calculate path diversity */
    calculateDiversity(session: BeamSearchSession): number;
    /** Expand a specific path */
    expandPath(pathId: string, session: BeamSearchSession): BeamSearchNode[];
}
/**
 * Scoring components for beam search
 */
export interface BeamScoringComponents {
    /** Base score from evaluation function */
    baseScore: number;
    /** Length penalty/bonus */
    lengthAdjustment?: number;
    /** Diversity bonus */
    diversityBonus?: number;
    /** Recency bonus for newer nodes */
    recencyBonus?: number;
    /** Domain-specific adjustments */
    domainAdjustments?: Record<string, number>;
    /** Final computed score */
    finalScore: number;
}
/**
 * Path comparison result
 */
export interface PathComparison {
    /** Path IDs being compared */
    pathIds: [string, string];
    /** Similarity score (0.0-1.0) */
    similarity: number;
    /** Common node IDs */
    commonNodes: string[];
    /** Divergence point (node ID) */
    divergencePoint?: string;
    /** Whether paths can be merged */
    mergeable: boolean;
}
//# sourceMappingURL=beam-search.d.ts.map