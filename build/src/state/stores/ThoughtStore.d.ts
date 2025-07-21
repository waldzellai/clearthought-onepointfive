/**
 * Store for managing sequential thinking data with branching support
 */
import { BaseStore } from './BaseStore.js';
import { ThoughtData } from '../../types/index.js';
/**
 * Specialized store for managing thoughts with branching and revision support
 */
export declare class ThoughtStore extends BaseStore<ThoughtData> {
    /** Map of branch IDs to their thoughts */
    private branches;
    /** Map of thought numbers to their revision history */
    private revisions;
    constructor();
    /**
     * Add a new thought to the store
     * @param id - Unique identifier for the thought
     * @param thought - The thought data to store
     */
    add(id: string, thought: ThoughtData): void;
    /**
     * Get all thoughts in chronological order
     * @returns Array of all thoughts
     */
    getAll(): ThoughtData[];
    /**
     * Clear all thoughts and associated data
     */
    clear(): void;
    /**
     * Get thoughts for a specific branch
     * @param branchId - The branch identifier
     * @returns Array of thoughts in the branch
     */
    getBranch(branchId: string): ThoughtData[];
    /**
     * Get all branches
     * @returns Map of branch IDs to their thoughts
     */
    getAllBranches(): Map<string, ThoughtData[]>;
    /**
     * Get revision history for a thought
     * @param thoughtNumber - The original thought number
     * @returns Array of revisions for the thought
     */
    getRevisions(thoughtNumber: number): ThoughtData[];
    /**
     * Get the latest thought (highest thought number)
     * @returns The most recent thought or undefined
     */
    getLatest(): ThoughtData | undefined;
    /**
     * Get thoughts in a specific range
     * @param start - Starting thought number (inclusive)
     * @param end - Ending thought number (inclusive)
     * @returns Array of thoughts in the range
     */
    getRange(start: number, end: number): ThoughtData[];
    /**
     * Get thoughts that need continuation
     * @returns Array of thoughts where nextThoughtNeeded is true
     */
    getPendingThoughts(): ThoughtData[];
    /**
     * Count thoughts by type
     * @returns Object with counts for regular, revision, and branched thoughts
     */
    getStatistics(): {
        total: number;
        regular: number;
        revisions: number;
        branched: number;
        branches: number;
    };
    /**
     * Export store data including branch and revision metadata
     */
    export(): Record<string, any>;
    /**
     * Import store data including branch and revision metadata
     */
    import(data: Record<string, any>): void;
}
//# sourceMappingURL=ThoughtStore.d.ts.map