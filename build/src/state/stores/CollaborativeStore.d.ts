/**
 * Store for managing collaborative reasoning sessions
 */
import { BaseStore } from './BaseStore.js';
import { CollaborativeSession } from '../../types/index.js';
/**
 * Specialized store for managing collaborative reasoning sessions
 */
export declare class CollaborativeStore extends BaseStore<CollaborativeSession> {
    /** Map of topics to their sessions */
    private topicSessions;
    /** Map of persona IDs to their participation sessions */
    private personaParticipation;
    constructor();
    /**
     * Add a new collaborative session
     * @param id - Unique identifier
     * @param session - The collaborative session data
     */
    add(id: string, session: CollaborativeSession): void;
    /**
     * Get all collaborative sessions
     * @returns Array of all sessions
     */
    getAll(): CollaborativeSession[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get sessions by topic
     * @param topic - The topic to search for
     * @returns Array of sessions on that topic
     */
    getByTopic(topic: string): CollaborativeSession[];
    /**
     * Get sessions where a specific persona participated
     * @param personaId - The persona identifier
     * @returns Array of sessions with that persona
     */
    getByPersona(personaId: string): CollaborativeSession[];
    /**
     * Get active sessions (those needing next contribution)
     * @returns Array of active sessions
     */
    getActiveSessions(): CollaborativeSession[];
    /**
     * Get sessions with consensus
     * @returns Array of sessions that reached consensus
     */
    getConsensusSession(): CollaborativeSession[];
    /**
     * Get sessions with unresolved disagreements
     * @returns Array of sessions with active disagreements
     */
    getDisagreementSessions(): CollaborativeSession[];
    /**
     * Get contribution statistics for a session
     * @param sessionId - The session identifier
     * @returns Statistics about contributions
     */
    getContributionStats(sessionId: string): Record<string, any> | undefined;
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get distribution of sessions by stage
     * @returns Count of sessions in each stage
     */
    private getStageDistribution;
}
//# sourceMappingURL=CollaborativeStore.d.ts.map