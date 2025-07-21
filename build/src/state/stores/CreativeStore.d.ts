/**
 * Store for managing creative thinking data
 */
import { BaseStore } from './BaseStore.js';
import { CreativeData } from '../../types/index.js';
/**
 * Specialized store for managing creative thinking sessions
 */
export declare class CreativeStore extends BaseStore<CreativeData> {
    /** Map of prompts to their sessions */
    private promptSessions;
    /** Map of techniques to sessions using them */
    private techniqueSessions;
    constructor();
    /**
     * Add a new creative thinking session
     * @param id - Unique identifier
     * @param session - The creative data
     */
    add(id: string, session: CreativeData): void;
    /**
     * Get all creative sessions
     * @returns Array of all sessions
     */
    getAll(): CreativeData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get sessions by prompt similarity
     * @param prompt - The prompt to search for
     * @returns Array of sessions with similar prompts
     */
    getSimilarPrompts(prompt: string): CreativeData[];
    /**
     * Get sessions using a specific technique
     * @param technique - The creative technique
     * @returns Array of sessions using that technique
     */
    getByTechnique(technique: string): CreativeData[];
    /**
     * Get all unique techniques used
     * @returns Array of technique names
     */
    getAllTechniques(): string[];
    /**
     * Get active sessions needing more ideas
     * @returns Array of active sessions
     */
    getActiveSessions(): CreativeData[];
    /**
     * Get sessions with the most ideas
     * @param limit - Number of top sessions to return
     * @returns Array of most productive sessions
     */
    getMostProductiveSessions(limit?: number): CreativeData[];
    /**
     * Get sessions with the most insights
     * @param limit - Number of top sessions to return
     * @returns Array of most insightful sessions
     */
    getMostInsightfulSessions(limit?: number): CreativeData[];
    /**
     * Calculate creativity metrics for a session
     * @param sessionId - The session identifier
     * @returns Creativity metrics
     */
    getCreativityMetrics(sessionId: string): Record<string, any> | undefined;
    /**
     * Calculate idea diversity (unique words ratio)
     * @param ideas - Array of ideas
     * @returns Diversity score
     */
    private calculateIdeaDiversity;
    /**
     * Find cross-pollination opportunities
     * @param sessionId - The session identifier
     * @returns Sessions with overlapping techniques or themes
     */
    findCrossPollination(sessionId: string): CreativeData[];
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get technique usage counts
     */
    private getTechniqueUsage;
    /**
     * Get most used techniques
     * @param limit - Number of top techniques
     * @returns Array of technique names and counts
     */
    private getTopTechniques;
}
//# sourceMappingURL=CreativeStore.d.ts.map