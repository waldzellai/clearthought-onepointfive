/**
 * Store for managing metacognitive monitoring data
 */
import { BaseStore } from './BaseStore.js';
import { MetacognitiveData, KnowledgeAssessment } from '../../types/index.js';
/**
 * Specialized store for managing metacognitive monitoring sessions
 */
export declare class MetacognitiveStore extends BaseStore<MetacognitiveData> {
    /** Map of tasks to their monitoring sessions */
    private taskSessions;
    /** Map of domains to knowledge assessments */
    private domainKnowledge;
    constructor();
    /**
     * Add a new metacognitive monitoring session
     * @param id - Unique identifier
     * @param session - The metacognitive data
     */
    add(id: string, session: MetacognitiveData): void;
    /**
     * Get all metacognitive sessions
     * @returns Array of all sessions
     */
    getAll(): MetacognitiveData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get sessions by task
     * @param task - The task being monitored
     * @returns Array of monitoring sessions for that task
     */
    getByTask(task: string): MetacognitiveData[];
    /**
     * Get sessions by stage
     * @param stage - The monitoring stage
     * @returns Array of sessions in that stage
     */
    getByStage(stage: MetacognitiveData['stage']): MetacognitiveData[];
    /**
     * Get knowledge assessments for a domain
     * @param domain - The knowledge domain
     * @returns Array of assessments for that domain
     */
    getKnowledgeByDomain(domain: string): KnowledgeAssessment[];
    /**
     * Get all unique domains assessed
     * @returns Array of domain names
     */
    getAssessedDomains(): string[];
    /**
     * Get sessions with low confidence
     * @param threshold - Confidence threshold (default: 0.5)
     * @returns Array of low-confidence sessions
     */
    getLowConfidenceSessions(threshold?: number): MetacognitiveData[];
    /**
     * Get sessions with high uncertainty
     * @param minAreas - Minimum number of uncertainty areas (default: 3)
     * @returns Array of high-uncertainty sessions
     */
    getHighUncertaintySessions(minAreas?: number): MetacognitiveData[];
    /**
     * Get active sessions needing assessment
     * @returns Array of active sessions
     */
    getActiveSessions(): MetacognitiveData[];
    /**
     * Analyze confidence trends across iterations
     * @param monitoringId - The monitoring session ID
     * @returns Confidence trend data
     */
    getConfidenceTrend(monitoringId: string): Array<{
        iteration: number;
        confidence: number;
    }> | undefined;
    /**
     * Get claim assessment statistics
     * @returns Statistics about claims
     */
    getClaimStatistics(): Record<string, any>;
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get distribution by stage
     */
    private getStageDistribution;
}
//# sourceMappingURL=MetacognitiveStore.d.ts.map