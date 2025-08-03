/**
 * Store for managing debugging session data
 */
import { BaseStore } from './BaseStore.js';
/**
 * Specialized store for managing debugging sessions
 */
export class DebuggingStore extends BaseStore {
    /** Map of approach names to their sessions */
    approachSessions;
    /** Map of issue keywords to related sessions */
    issueIndex;
    constructor() {
        super('DebuggingStore');
        this.approachSessions = new Map();
        this.issueIndex = new Map();
    }
    /**
     * Add a new debugging session
     * @param id - Unique identifier
     * @param session - The debugging session data
     */
    add(id, session) {
        this.data.set(id, session);
        // Track by approach
        const sessions = this.approachSessions.get(session.approachName) || [];
        sessions.push(session);
        this.approachSessions.set(session.approachName, sessions);
        // Index by issue keywords
        this.indexIssue(id, session.issue);
    }
    /**
     * Index issue keywords for search
     * @param sessionId - Session identifier
     * @param issue - Issue description
     */
    indexIssue(sessionId, issue) {
        // Extract keywords (simple tokenization)
        const keywords = issue.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3); // Only index words > 3 chars
        keywords.forEach(keyword => {
            const sessions = this.issueIndex.get(keyword) || new Set();
            sessions.add(sessionId);
            this.issueIndex.set(keyword, sessions);
        });
    }
    /**
     * Get all debugging sessions
     * @returns Array of all sessions
     */
    getAll() {
        return Array.from(this.data.values());
    }
    /**
     * Clear all data
     */
    clear() {
        this.data.clear();
        this.approachSessions.clear();
        this.issueIndex.clear();
    }
    /**
     * Get sessions by approach
     * @param approachName - The debugging approach name
     * @returns Array of sessions using that approach
     */
    getByApproach(approachName) {
        return this.approachSessions.get(approachName) || [];
    }
    /**
     * Search sessions by issue keywords
     * @param keywords - Keywords to search for
     * @returns Array of matching sessions
     */
    searchByIssue(keywords) {
        const searchTerms = keywords.toLowerCase().split(/\s+/);
        const matchingIds = new Set();
        searchTerms.forEach(term => {
            const sessions = this.issueIndex.get(term);
            if (sessions) {
                sessions.forEach(id => matchingIds.add(id));
            }
        });
        return Array.from(matchingIds)
            .map(id => this.get(id))
            .filter((session) => session !== undefined);
    }
    /**
     * Get successfully resolved sessions
     * @returns Array of sessions with resolutions
     */
    getResolvedSessions() {
        return this.filter(session => session.resolution.trim().length > 0);
    }
    /**
     * Get statistics about debugging approaches
     * @returns Statistics object
     */
    getStatistics() {
        const resolved = this.getResolvedSessions();
        const stats = {};
        this.approachSessions.forEach((sessions, approach) => {
            stats[approach] = sessions.length;
        });
        return {
            totalSessions: this.size(),
            resolvedSessions: resolved.length,
            approachUsage: stats,
            successRate: this.size() > 0 ? resolved.length / this.size() : 0
        };
    }
    /**
     * Get the most effective approach based on resolution rate
     * @returns Approach with highest success rate
     */
    getMostEffectiveApproach() {
        let bestApproach;
        let bestRate = 0;
        this.approachSessions.forEach((sessions, approach) => {
            const resolved = sessions.filter(s => s.resolution && s.resolution.trim().length > 0);
            const rate = sessions.length > 0 ? resolved.length / sessions.length : 0;
            if (rate > bestRate) {
                bestRate = rate;
                bestApproach = approach;
            }
        });
        return bestApproach ? { approach: bestApproach, successRate: bestRate } : undefined;
    }
}
//# sourceMappingURL=DebuggingStore.js.map