/**
 * Tree of Thought Pattern Handler Implementation
 *
 * Implements systematic exploration of multiple reasoning paths with
 * explicit branching and evaluation.
 */
import { TreeOfThoughtNode, TreeOfThoughtSession, TreeOfThoughtConfig, TreeOfThoughtOperations } from '../../types/reasoning-patterns/tree-of-thought.js';
import { ThoughtData } from '../../types/index.js';
export declare class TreeOfThoughtHandler implements TreeOfThoughtOperations {
    private readonly defaultConfig;
    /**
     * Initialize a new Tree of Thought session
     */
    initializeSession(config?: Partial<TreeOfThoughtConfig>): TreeOfThoughtSession;
    /**
     * Create a new node in the tree
     */
    createNode(content: string, parentId: string, session: TreeOfThoughtSession): TreeOfThoughtNode;
    /**
     * Expand a node by generating children
     */
    expand(nodeId: string, session: TreeOfThoughtSession): TreeOfThoughtNode[];
    /**
     * Evaluate a node's promise/score
     */
    evaluate(nodeId: string, session: TreeOfThoughtSession): number;
    /**
     * Select next node to explore
     */
    selectNext(session: TreeOfThoughtSession): string | null;
    /**
     * Prune a subtree
     */
    prune(nodeId: string, reason: string, session: TreeOfThoughtSession): void;
    /**
     * Check if node meets solution criteria
     */
    isSolution(nodeId: string, session: TreeOfThoughtSession): boolean;
    /**
     * Get path from root to node
     */
    getPath(nodeId: string, session: TreeOfThoughtSession): string[];
    /**
     * Get best path based on scores
     */
    getBestPath(session: TreeOfThoughtSession): string[];
    /**
     * Export session to sequential thinking format
     */
    exportToSequentialFormat(session: TreeOfThoughtSession): ThoughtData[];
    /**
     * Import from sequential thinking format
     */
    importFromSequentialFormat(thoughts: ThoughtData[]): TreeOfThoughtSession;
    /**
     * Run one iteration of tree exploration
     */
    runIteration(session: TreeOfThoughtSession): void;
}
export default TreeOfThoughtHandler;
//# sourceMappingURL=tree-of-thought.d.ts.map