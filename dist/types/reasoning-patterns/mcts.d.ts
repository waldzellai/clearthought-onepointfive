/**
 * Monte Carlo Tree Search (MCTS) Reasoning Pattern Types
 *
 * Combines tree exploration with random sampling for decision-making
 * under uncertainty using the four phases: selection, expansion,
 * simulation, and backpropagation.
 */
import { BaseReasoningNode, BaseReasoningSession } from './base.js';
/**
 * Phase of MCTS algorithm
 */
export type MCTSPhase = 'selection' | 'expansion' | 'simulation' | 'backpropagation';
/**
 * Rollout policy types
 */
export type RolloutPolicy = 'random' | 'heuristic' | 'neural' | 'hybrid';
/**
 * Node in an MCTS tree
 */
export interface MCTSNode extends BaseReasoningNode {
    /** Parent node ID (null for root) */
    parentId?: string;
    /** Child node IDs */
    childrenIds: string[];
    /** Number of times this node was visited */
    visits: number;
    /** Total value accumulated from simulations */
    totalValue: number;
    /** Average value (totalValue / visits) */
    averageValue: number;
    /** UCB score for selection */
    ucbScore?: number;
    /** Actions not yet tried from this node */
    untriedActions?: string[];
    /** Whether this is a terminal node */
    isTerminal?: boolean;
    /** Extended metadata */
    metadata?: MCTSNodeMetadata;
}
/**
 * Metadata for MCTS nodes
 */
export interface MCTSNodeMetadata {
    /** Policy used for this node's creation */
    simulationPolicy?: string;
    /** Domain-specific evaluation score */
    domainScore?: number;
    /** Prior probability (for neural-guided MCTS) */
    priorProbability?: number;
    /** State representation */
    stateRepresentation?: any;
    /** Action that led to this node */
    action?: string;
    /** Depth in the tree */
    depth?: number;
    /** Win/loss/draw statistics */
    outcomes?: {
        wins: number;
        losses: number;
        draws: number;
    };
}
/**
 * MCTS session state
 */
export interface MCTSSession extends BaseReasoningSession {
    /** Root node ID */
    rootNodeId: string;
    /** All nodes in the tree */
    nodes: Map<string, MCTSNode>;
    /** Current simulation path */
    currentSimulationPath?: string[];
    /** Current phase of MCTS */
    currentPhase?: MCTSPhase;
    /** Exploration constant (C in UCB formula) */
    explorationConstant: number;
    /** Maximum depth for simulations */
    simulationDepth: number;
    /** Total simulations run */
    totalSimulations: number;
    /** Best leaf node found */
    bestLeafNodeId?: string;
    /** Rollout policy being used */
    rolloutPolicy: RolloutPolicy;
    /** Termination criteria */
    terminationCriteria: MCTSTerminationCriteria;
    /** Configuration */
    config: MCTSConfig;
    /** Statistics */
    stats: MCTSStats;
}
/**
 * Termination criteria for MCTS
 */
export interface MCTSTerminationCriteria {
    /** Maximum number of simulations */
    maxSimulations?: number;
    /** Time limit in milliseconds */
    timeLimit?: number;
    /** Confidence threshold (based on visit distribution) */
    confidenceThreshold?: number;
    /** Minimum visits for best action */
    minVisitsThreshold?: number;
    /** Custom termination function */
    customFunction?: string;
}
/**
 * Configuration for MCTS
 */
export interface MCTSConfig {
    /** UCB formula variant */
    ucbVariant: 'ucb1' | 'ucb1-tuned' | 'puct' | 'custom';
    /** Whether to use RAVE (Rapid Action Value Estimation) */
    useRAVE?: boolean;
    /** RAVE bias parameter */
    raveBias?: number;
    /** Progressive widening parameters */
    progressiveWidening?: {
        enabled: boolean;
        alpha: number;
        beta: number;
    };
    /** Virtual loss for parallel MCTS */
    virtualLoss?: number;
    /** Reuse tree between searches */
    reuseTree?: boolean;
    /** Prior knowledge integration */
    usePriors?: boolean;
    /** Transposition table for duplicate states */
    useTranspositions?: boolean;
}
/**
 * Statistics for MCTS
 */
export interface MCTSStats {
    /** Total nodes in tree */
    totalNodes: number;
    /** Maximum depth reached */
    maxDepth: number;
    /** Average branching factor */
    averageBranchingFactor: number;
    /** Simulations per second */
    simulationsPerSecond?: number;
    /** Best action visit count */
    bestActionVisits?: number;
    /** Best action value */
    bestActionValue?: number;
    /** Exploration vs exploitation ratio */
    explorationRatio?: number;
    /** Effective branching factor */
    effectiveBranchingFactor?: number;
}
/**
 * Operations specific to MCTS
 */
export interface MCTSOperations {
    /** Select a leaf node using UCB */
    selectLeaf(session: MCTSSession): MCTSNode;
    /** Expand a node by adding children */
    expandNode(nodeId: string, session: MCTSSession): MCTSNode;
    /** Simulate from a node to terminal state */
    simulate(nodeId: string, session: MCTSSession): number;
    /** Backpropagate simulation results */
    backpropagate(leafNodeId: string, value: number, session: MCTSSession): void;
    /** Calculate UCB score for a node */
    calculateUCB(nodeId: string, parentVisits: number, session: MCTSSession): number;
    /** Get best action from root */
    getBestAction(session: MCTSSession): string;
    /** Get action probabilities */
    getActionProbabilities(nodeId: string, session: MCTSSession): Map<string, number>;
    /** Run one complete MCTS iteration */
    runIteration(session: MCTSSession): void;
}
/**
 * Simulation result from rollout
 */
export interface SimulationResult {
    /** Final value/reward */
    value: number;
    /** Path taken during simulation */
    path: string[];
    /** Terminal state reached */
    terminalState?: any;
    /** Number of steps in simulation */
    steps: number;
    /** Time taken (ms) */
    duration?: number;
}
/**
 * UCB calculation components
 */
export interface UCBComponents {
    /** Exploitation term (average value) */
    exploitationTerm: number;
    /** Exploration term */
    explorationTerm: number;
    /** Prior bias (if using priors) */
    priorBias?: number;
    /** RAVE term (if using RAVE) */
    raveTerm?: number;
    /** Final UCB score */
    ucbScore: number;
}
/**
 * Action statistics for MCTS
 */
export interface ActionStatistics {
    /** Action identifier */
    action: string;
    /** Number of visits */
    visits: number;
    /** Average value */
    averageValue: number;
    /** Win rate (for game scenarios) */
    winRate?: number;
    /** Prior probability */
    prior?: number;
    /** RAVE statistics */
    rave?: {
        visits: number;
        averageValue: number;
    };
}
/**
 * Tree policy for node selection
 */
export interface TreePolicy {
    /** Policy name */
    name: string;
    /** Select child node based on policy */
    selectChild(node: MCTSNode, session: MCTSSession): string | null;
    /** Whether node is fully expanded */
    isFullyExpanded(node: MCTSNode, session: MCTSSession): boolean;
    /** Get untried actions for a node */
    getUntriedActions(node: MCTSNode, session: MCTSSession): string[];
}
//# sourceMappingURL=mcts.d.ts.map