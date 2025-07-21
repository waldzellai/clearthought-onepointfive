/**
 * Store for managing debugging session data
 */
import { BaseStore } from './BaseStore.js';
import { DebuggingSession } from '../../types/index.js';
/**
 * Specialized store for managing debugging sessions
 */
export declare class DebuggingStore extends BaseStore<DebuggingSession> {
    /** Map of approach names to their sessions */
    private approachSessions;
    /** Map of issue keywords to related sessions */
    private issueIndex;
    constructor();
    /**
     * Add a new debugging session
     * @param id - Unique identifier
     * @param session - The debugging session data
     */
    add(id: string, session: DebuggingSession): void;
    /**
     * Index issue keywords for search
     * @param sessionId - Session identifier
     * @param issue - Issue description
     */
    private indexIssue;
    /**
     * Get all debugging sessions
     * @returns Array of all sessions
     */
    getAll(): DebuggingSession[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get sessions by approach
     * @param approachName - The debugging approach name
     * @returns Array of sessions using that approach
     */
    getByApproach(approachName: DebuggingSession['approachName']): DebuggingSession[];
    /**
     * Search sessions by issue keywords
     * @param keywords - Keywords to search for
     * @returns Array of matching sessions
     */
    searchByIssue(keywords: string): DebuggingSession[];
    /**
     * Get successfully resolved sessions
     * @returns Array of sessions with resolutions
     */
    getResolvedSessions(): DebuggingSession[];
    /**
     * Get statistics about debugging approaches
     * @returns Statistics object
     */
    getStatistics(): {
        totalSessions: number;
        resolvedSessions: number;
        approachUsage: Record<string, number>;
        successRate: number;
    };
    /**
     * Get the most effective approach based on resolution rate
     * @returns Approach with highest success rate
     */
    getMostEffectiveApproach(): {
        approach: string;
        successRate: number;
    } | undefined;
}
//# sourceMappingURL=DebuggingStore.d.ts.map