/**
 * Store for managing creative thinking data
 */
import { BaseStore } from './BaseStore.js';
/**
 * Specialized store for managing creative thinking sessions
 */
export class CreativeStore extends BaseStore {
    /** Map of prompts to their sessions */
    promptSessions;
    /** Map of techniques to sessions using them */
    techniqueSessions;
    constructor() {
        super('CreativeStore');
        this.promptSessions = new Map();
        this.techniqueSessions = new Map();
    }
    /**
     * Add a new creative thinking session
     * @param id - Unique identifier
     * @param session - The creative data
     */
    add(id, session) {
        this.data.set(id, session);
        // Track by prompt (first 50 chars as key)
        const promptKey = session.prompt.substring(0, 50);
        const sessions = this.promptSessions.get(promptKey) || [];
        sessions.push(session);
        this.promptSessions.set(promptKey, sessions);
        // Track by techniques
        session.techniques.forEach(technique => {
            const sessionIds = this.techniqueSessions.get(technique) || new Set();
            sessionIds.add(id);
            this.techniqueSessions.set(technique, sessionIds);
        });
    }
    /**
     * Get all creative sessions
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
        this.promptSessions.clear();
        this.techniqueSessions.clear();
    }
    /**
     * Get sessions by prompt similarity
     * @param prompt - The prompt to search for
     * @returns Array of sessions with similar prompts
     */
    getSimilarPrompts(prompt) {
        const promptLower = prompt.toLowerCase();
        return this.filter(session => session.prompt.toLowerCase().includes(promptLower) ||
            promptLower.includes(session.prompt.toLowerCase()));
    }
    /**
     * Get sessions using a specific technique
     * @param technique - The creative technique
     * @returns Array of sessions using that technique
     */
    getByTechnique(technique) {
        const sessionIds = this.techniqueSessions.get(technique);
        if (!sessionIds)
            return [];
        return Array.from(sessionIds)
            .map(id => this.get(id))
            .filter((session) => session !== undefined);
    }
    /**
     * Get all unique techniques used
     * @returns Array of technique names
     */
    getAllTechniques() {
        return Array.from(this.techniqueSessions.keys());
    }
    /**
     * Get active sessions needing more ideas
     * @returns Array of active sessions
     */
    getActiveSessions() {
        return this.filter(session => session.nextIdeaNeeded);
    }
    /**
     * Get sessions with the most ideas
     * @param limit - Number of top sessions to return
     * @returns Array of most productive sessions
     */
    getMostProductiveSessions(limit = 5) {
        return this.getAll()
            .sort((a, b) => b.ideas.length - a.ideas.length)
            .slice(0, limit);
    }
    /**
     * Get sessions with the most insights
     * @param limit - Number of top sessions to return
     * @returns Array of most insightful sessions
     */
    getMostInsightfulSessions(limit = 5) {
        return this.getAll()
            .sort((a, b) => b.insights.length - a.insights.length)
            .slice(0, limit);
    }
    /**
     * Calculate creativity metrics for a session
     * @param sessionId - The session identifier
     * @returns Creativity metrics
     */
    getCreativityMetrics(sessionId) {
        const session = this.get(sessionId);
        if (!session)
            return undefined;
        return {
            ideaCount: session.ideas.length,
            techniqueCount: session.techniques.length,
            connectionCount: session.connections.length,
            insightCount: session.insights.length,
            ideaDiversity: this.calculateIdeaDiversity(session.ideas),
            connectionDensity: session.ideas.length > 0
                ? session.connections.length / session.ideas.length
                : 0,
            insightRatio: session.ideas.length > 0
                ? session.insights.length / session.ideas.length
                : 0
        };
    }
    /**
     * Calculate idea diversity (unique words ratio)
     * @param ideas - Array of ideas
     * @returns Diversity score
     */
    calculateIdeaDiversity(ideas) {
        if (ideas.length === 0)
            return 0;
        const allWords = new Set();
        let totalWords = 0;
        ideas.forEach(idea => {
            const words = idea.toLowerCase().split(/\s+/);
            words.forEach(word => {
                allWords.add(word);
                totalWords++;
            });
        });
        return totalWords > 0 ? allWords.size / totalWords : 0;
    }
    /**
     * Find cross-pollination opportunities
     * @param sessionId - The session identifier
     * @returns Sessions with overlapping techniques or themes
     */
    findCrossPollination(sessionId) {
        const session = this.get(sessionId);
        if (!session)
            return [];
        const related = new Set();
        // Find sessions using similar techniques
        session.techniques.forEach(technique => {
            const sessionIds = this.techniqueSessions.get(technique);
            if (sessionIds) {
                sessionIds.forEach(id => {
                    if (id !== sessionId)
                        related.add(id);
                });
            }
        });
        return Array.from(related)
            .map(id => this.get(id))
            .filter((s) => s !== undefined);
    }
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics() {
        const sessions = this.getAll();
        return {
            totalSessions: sessions.length,
            activeSessions: this.getActiveSessions().length,
            totalIdeas: sessions.reduce((sum, s) => sum + s.ideas.length, 0),
            totalInsights: sessions.reduce((sum, s) => sum + s.insights.length, 0),
            totalConnections: sessions.reduce((sum, s) => sum + s.connections.length, 0),
            averageIdeasPerSession: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.ideas.length, 0) / sessions.length
                : 0,
            uniqueTechniques: this.getAllTechniques().length,
            techniqueUsage: this.getTechniqueUsage(),
            topTechniques: this.getTopTechniques(5)
        };
    }
    /**
     * Get technique usage counts
     */
    getTechniqueUsage() {
        const usage = {};
        this.techniqueSessions.forEach((sessions, technique) => {
            usage[technique] = sessions.size;
        });
        return usage;
    }
    /**
     * Get most used techniques
     * @param limit - Number of top techniques
     * @returns Array of technique names and counts
     */
    getTopTechniques(limit) {
        const usage = this.getTechniqueUsage();
        return Object.entries(usage)
            .map(([technique, count]) => ({ technique, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}
//# sourceMappingURL=CreativeStore.js.map