/**
 * Beam Search Pattern Handler Implementation
 *
 * Maintains multiple promising paths simultaneously, exploring them
 * in parallel with periodic evaluation and pruning.
 */
import { BeamSearchNode, BeamSearchPath, BeamSearchSession, BeamSearchConfig, BeamSearchOperations } from '../../types/reasoning-patterns/beam-search.js';
import { ThoughtData } from '../../types/index.js';
export declare class BeamSearchHandler implements BeamSearchOperations {
    private readonly defaultConfig;
    private readonly defaultConvergenceCriteria;
    /**
     * Initialize a new Beam Search session
     */
    initializeSession(beamWidth?: number, config?: Partial<BeamSearchConfig>): BeamSearchSession;
    /**
     * Generate next generation of nodes
     */
    generateNextGeneration(session: BeamSearchSession): BeamSearchNode[];
    /**
     * Expand a specific path
     */
    expandPath(pathId: string, session: BeamSearchSession): BeamSearchNode[];
    /**
     * Evaluate and score paths
     */
    evaluatePaths(session: BeamSearchSession): Map<string, number>;
    /**
     * Calculate score for a path
     */
    private calculatePathScore;
    /**
     * Calculate diversity of a path compared to other active paths
     */
    private calculatePathDiversity;
    /**
     * Calculate similarity between two paths
     */
    private calculatePathSimilarity;
    /**
     * Prune paths to maintain beam width
     */
    prunePaths(session: BeamSearchSession): string[];
    /**
     * Check for convergence
     */
    checkConvergence(session: BeamSearchSession): boolean;
    /**
     * Calculate consensus among active paths
     */
    private calculateConsensus;
    /**
     * Calculate score improvement over recent generations
     */
    private calculateScoreImprovement;
    /**
     * Merge similar paths
     */
    mergePaths(pathIds: string[], session: BeamSearchSession): BeamSearchPath;
    /**
     * Merge node sequences from multiple paths
     */
    private mergeNodeSequences;
    /**
     * Get best path
     */
    getBestPath(session: BeamSearchSession): BeamSearchPath | null;
    /**
     * Calculate diversity across all active paths
     */
    calculateDiversity(session: BeamSearchSession): number;
    /**
     * Export to sequential thinking format
     */
    exportToSequentialFormat(session: BeamSearchSession): ThoughtData[];
    /**
     * Import from sequential thinking format
     */
    importFromSequentialFormat(thoughts: ThoughtData[]): BeamSearchSession;
    /**
     * Run one iteration of beam search
     */
    runIteration(session: BeamSearchSession): void;
    /**
     * Attempt to merge similar paths
     */
    private attemptPathMerging;
    /**
     * Update session statistics
     */
    private updateStatistics;
}
export default BeamSearchHandler;
//# sourceMappingURL=beam-search.d.ts.map