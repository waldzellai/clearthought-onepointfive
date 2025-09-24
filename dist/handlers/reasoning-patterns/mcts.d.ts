/**
 * Monte Carlo Tree Search (MCTS) Pattern Handler Implementation
 *
 * Combines tree exploration with random sampling for decision-making
 * under uncertainty using selection, expansion, simulation, and backpropagation.
 */
import { MCTSNode, MCTSSession, MCTSConfig, MCTSOperations, ActionStatistics } from '../../types/reasoning-patterns/mcts.js';
import { ThoughtData } from '../../types/index.js';
export declare class MCTSHandler implements MCTSOperations {
    private readonly defaultConfig;
    private readonly defaultTerminationCriteria;
    /**
     * Initialize a new MCTS session
     */
    initializeSession(explorationConstant?: number, config?: Partial<MCTSConfig>): MCTSSession;
    /**
     * Generate initial actions for root node
     */
    private generateInitialActions;
    /**
     * Select a leaf node using UCB
     */
    selectLeaf(session: MCTSSession): MCTSNode;
    /**
     * Check if node is a leaf (has untried actions or no children)
     */
    private isLeaf;
    /**
     * Select best child using UCB formula
     */
    private selectBestChild;
    /**
     * Calculate UCB score for a node
     */
    calculateUCB(nodeId: string, parentVisits: number, session: MCTSSession): number;
    /**
     * Calculate variance for UCB1-Tuned
     */
    private calculateVariance;
    /**
     * Get RAVE statistics for an action
     */
    private getRAVEStatistics;
    /**
     * Expand a node by adding a child
     */
    expandNode(nodeId: string, session: MCTSSession): MCTSNode;
    /**
     * Generate actions for a given state
     */
    private generateActionsForState;
    /**
     * Check if state is terminal
     */
    private isTerminalState;
    /**
     * Get state representation for a node
     */
    private getStateRepresentation;
    /**
     * Simulate from a node to terminal state
     */
    simulate(nodeId: string, session: MCTSSession): number;
    /**
     * Random rollout policy
     */
    private randomRollout;
    /**
     * Heuristic-based rollout policy
     */
    private heuristicRollout;
    /**
     * Neural network guided rollout (placeholder)
     */
    private neuralRollout;
    /**
     * Evaluate heuristic value for a state
     */
    private evaluateHeuristic;
    /**
     * Backpropagate simulation results
     */
    backpropagate(leafNodeId: string, value: number, session: MCTSSession): void;
    /**
     * Get best action from root
     */
    getBestAction(session: MCTSSession): string;
    /**
     * Get action probabilities from a node
     */
    getActionProbabilities(nodeId: string, session: MCTSSession): Map<string, number>;
    /**
     * Run one complete MCTS iteration
     */
    runIteration(session: MCTSSession): void;
    /**
     * Check termination criteria
     */
    private checkTermination;
    /**
     * Update session statistics
     */
    private updateStatistics;
    /**
     * Export to sequential thinking format
     */
    exportToSequentialFormat(session: MCTSSession): ThoughtData[];
    /**
     * Get best path through the tree
     */
    private getBestPath;
    /**
     * Import from sequential thinking format
     */
    importFromSequentialFormat(thoughts: ThoughtData[]): MCTSSession;
    /**
     * Get action statistics for analysis
     */
    getActionStatistics(session: MCTSSession): ActionStatistics[];
}
export default MCTSHandler;
//# sourceMappingURL=mcts.d.ts.map