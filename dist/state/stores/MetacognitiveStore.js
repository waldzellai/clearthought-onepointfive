/**
 * Store for managing metacognitive monitoring data
 */
import { BaseStore } from './BaseStore.js';
/**
 * Specialized store for managing metacognitive monitoring sessions
 */
export class MetacognitiveStore extends BaseStore {
    /** Map of tasks to their monitoring sessions */
    taskSessions;
    /** Map of domains to knowledge assessments */
    domainKnowledge;
    constructor() {
        super('MetacognitiveStore');
        this.taskSessions = new Map();
        this.domainKnowledge = new Map();
    }
    /**
     * Add a new metacognitive monitoring session
     * @param id - Unique identifier
     * @param session - The metacognitive data
     */
    add(id, session) {
        this.data.set(id, session);
        // Track by task
        const sessions = this.taskSessions.get(session.task) || [];
        sessions.push(session);
        this.taskSessions.set(session.task, sessions);
        // Track knowledge assessments by domain
        if (session.knowledgeAssessment) {
            const assessments = this.domainKnowledge.get(session.knowledgeAssessment.domain) || [];
            assessments.push(session.knowledgeAssessment);
            this.domainKnowledge.set(session.knowledgeAssessment.domain, assessments);
        }
    }
    /**
     * Get all metacognitive sessions
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
        this.taskSessions.clear();
        this.domainKnowledge.clear();
    }
    /**
     * Get sessions by task
     * @param task - The task being monitored
     * @returns Array of monitoring sessions for that task
     */
    getByTask(task) {
        const taskLower = task.toLowerCase();
        return this.filter(session => session.task.toLowerCase().includes(taskLower));
    }
    /**
     * Get sessions by stage
     * @param stage - The monitoring stage
     * @returns Array of sessions in that stage
     */
    getByStage(stage) {
        return this.filter(session => session.stage === stage);
    }
    /**
     * Get knowledge assessments for a domain
     * @param domain - The knowledge domain
     * @returns Array of assessments for that domain
     */
    getKnowledgeByDomain(domain) {
        return this.domainKnowledge.get(domain) || [];
    }
    /**
     * Get all unique domains assessed
     * @returns Array of domain names
     */
    getAssessedDomains() {
        return Array.from(this.domainKnowledge.keys());
    }
    /**
     * Get sessions with low confidence
     * @param threshold - Confidence threshold (default: 0.5)
     * @returns Array of low-confidence sessions
     */
    getLowConfidenceSessions(threshold = 0.5) {
        return this.filter(session => session.overallConfidence < threshold);
    }
    /**
     * Get sessions with high uncertainty
     * @param minAreas - Minimum number of uncertainty areas (default: 3)
     * @returns Array of high-uncertainty sessions
     */
    getHighUncertaintySessions(minAreas = 3) {
        return this.filter(session => session.uncertaintyAreas.length >= minAreas);
    }
    /**
     * Get active sessions needing assessment
     * @returns Array of active sessions
     */
    getActiveSessions() {
        return this.filter(session => session.nextAssessmentNeeded);
    }
    /**
     * Analyze confidence trends across iterations
     * @param monitoringId - The monitoring session ID
     * @returns Confidence trend data
     */
    getConfidenceTrend(monitoringId) {
        const sessions = this.filter(session => session.monitoringId === monitoringId);
        if (sessions.length === 0)
            return undefined;
        return sessions
            .sort((a, b) => a.iteration - b.iteration)
            .map(session => ({
            iteration: session.iteration,
            confidence: session.overallConfidence
        }));
    }
    /**
     * Get claim assessment statistics
     * @returns Statistics about claims
     */
    getClaimStatistics() {
        const allClaims = [];
        this.forEach(session => {
            if (session.claims) {
                allClaims.push(...session.claims);
            }
        });
        const stats = {
            totalClaims: allClaims.length,
            byStatus: {},
            averageConfidence: 0,
            withAlternatives: 0
        };
        let totalConfidence = 0;
        allClaims.forEach(claim => {
            stats.byStatus[claim.status] = (stats.byStatus[claim.status] || 0) + 1;
            totalConfidence += claim.confidenceScore;
            if (claim.alternativeInterpretations && claim.alternativeInterpretations.length > 0) {
                stats.withAlternatives++;
            }
        });
        stats.averageConfidence = allClaims.length > 0 ? totalConfidence / allClaims.length : 0;
        return stats;
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
            averageConfidence: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.overallConfidence, 0) / sessions.length
                : 0,
            averageUncertaintyAreas: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.uncertaintyAreas.length, 0) / sessions.length
                : 0,
            assessedDomains: this.getAssessedDomains().length,
            stageDistribution: this.getStageDistribution(),
            claimStats: this.getClaimStatistics()
        };
    }
    /**
     * Get distribution by stage
     */
    getStageDistribution() {
        const distribution = {};
        this.forEach(session => {
            distribution[session.stage] = (distribution[session.stage] || 0) + 1;
        });
        return distribution;
    }
}
//# sourceMappingURL=MetacognitiveStore.js.map