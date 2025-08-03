/**
 * Store for managing decision framework data
 */
import { BaseStore } from './BaseStore.js';
/**
 * Specialized store for managing decision-making sessions
 */
export class DecisionStore extends BaseStore {
    /** Map of decision statements to their sessions */
    decisionIndex;
    /** Map of analysis types to their sessions */
    analysisSessions;
    constructor() {
        super('DecisionStore');
        this.decisionIndex = new Map();
        this.analysisSessions = new Map();
    }
    /**
     * Add a new decision session
     * @param id - Unique identifier
     * @param decision - The decision data
     */
    add(id, decision) {
        this.data.set(id, decision);
        // Index by decision keywords
        this.indexDecision(id, decision.decisionStatement);
        // Track by analysis type
        const sessions = this.analysisSessions.get(decision.analysisType) || [];
        sessions.push(decision);
        this.analysisSessions.set(decision.analysisType, sessions);
    }
    /**
     * Index decision keywords for search
     * @param decisionId - Decision identifier
     * @param statement - Decision statement
     */
    indexDecision(decisionId, statement) {
        const keywords = statement.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3);
        keywords.forEach(keyword => {
            const decisions = this.decisionIndex.get(keyword) || new Set();
            decisions.add(decisionId);
            this.decisionIndex.set(keyword, decisions);
        });
    }
    /**
     * Get all decision sessions
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
        this.decisionIndex.clear();
        this.analysisSessions.clear();
    }
    /**
     * Search decisions by keywords
     * @param keywords - Keywords to search for
     * @returns Array of matching decisions
     */
    searchDecisions(keywords) {
        const searchTerms = keywords.toLowerCase().split(/\s+/);
        const matchingIds = new Set();
        searchTerms.forEach(term => {
            const decisions = this.decisionIndex.get(term);
            if (decisions) {
                decisions.forEach(id => matchingIds.add(id));
            }
        });
        return Array.from(matchingIds)
            .map(id => this.get(id))
            .filter((decision) => decision !== undefined);
    }
    /**
     * Get decisions by analysis type
     * @param analysisType - The type of analysis
     * @returns Array of decisions using that analysis
     */
    getByAnalysisType(analysisType) {
        return this.analysisSessions.get(analysisType) || [];
    }
    /**
     * Get decisions by stage
     * @param stage - The decision stage
     * @returns Array of decisions in that stage
     */
    getByStage(stage) {
        return this.filter(decision => decision.stage === stage);
    }
    /**
     * Get completed decisions (with recommendations)
     * @returns Array of completed decisions
     */
    getCompletedDecisions() {
        return this.filter(decision => !!(decision.recommendation && decision.recommendation.trim().length > 0));
    }
    /**
     * Get active decisions (needing next stage)
     * @returns Array of active decisions
     */
    getActiveDecisions() {
        return this.filter(decision => decision.nextStageNeeded);
    }
    /**
     * Calculate decision quality score
     * @param decisionId - The decision identifier
     * @returns Quality score and breakdown
     */
    getDecisionQuality(decisionId) {
        const decision = this.get(decisionId);
        if (!decision)
            return undefined;
        const quality = {
            hasMultipleOptions: decision.options.length > 1,
            hasCriteria: (decision.criteria?.length || 0) > 0,
            hasEvaluations: (decision.criteriaEvaluations?.length || 0) > 0,
            hasStakeholders: (decision.stakeholders?.length || 0) > 0,
            hasConstraints: (decision.constraints?.length || 0) > 0,
            hasOutcomes: (decision.possibleOutcomes?.length || 0) > 0,
            hasInformationGaps: (decision.informationGaps?.length || 0) > 0,
            hasSensitivityAnalysis: (decision.sensitivityInsights?.length || 0) > 0,
            hasRecommendation: !!decision.recommendation
        };
        const score = Object.values(quality).filter(v => v).length / Object.keys(quality).length;
        return {
            score,
            breakdown: quality,
            completeness: `${Math.round(score * 100)}%`
        };
    }
    /**
     * Get the best option based on scores
     * @param decisionId - The decision identifier
     * @returns The best option or undefined
     */
    getBestOption(decisionId) {
        const decision = this.get(decisionId);
        if (!decision)
            return undefined;
        // Check different scoring methods
        if (decision.expectedValues) {
            const bestId = Object.entries(decision.expectedValues)
                .reduce((best, [id, value]) => value > (decision.expectedValues[best] || -Infinity) ? id : best, '');
            return decision.options.find(opt => opt.id === bestId);
        }
        if (decision.multiCriteriaScores) {
            const bestId = Object.entries(decision.multiCriteriaScores)
                .reduce((best, [id, score]) => score > (decision.multiCriteriaScores[best] || -Infinity) ? id : best, '');
            return decision.options.find(opt => opt.id === bestId);
        }
        return undefined;
    }
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics() {
        const decisions = this.getAll();
        const completed = this.getCompletedDecisions();
        return {
            totalDecisions: decisions.length,
            completedDecisions: completed.length,
            activeDecisions: this.getActiveDecisions().length,
            completionRate: decisions.length > 0 ? completed.length / decisions.length : 0,
            averageOptions: decisions.length > 0
                ? decisions.reduce((sum, d) => sum + d.options.length, 0) / decisions.length
                : 0,
            averageCriteria: decisions.length > 0
                ? decisions.reduce((sum, d) => sum + (d.criteria?.length || 0), 0) / decisions.length
                : 0,
            analysisTypeDistribution: this.getAnalysisTypeDistribution(),
            stageDistribution: this.getStageDistribution()
        };
    }
    /**
     * Get distribution by analysis type
     */
    getAnalysisTypeDistribution() {
        const distribution = {};
        this.analysisSessions.forEach((sessions, type) => {
            distribution[type] = sessions.length;
        });
        return distribution;
    }
    /**
     * Get distribution by stage
     */
    getStageDistribution() {
        const distribution = {};
        this.forEach(decision => {
            distribution[decision.stage] = (distribution[decision.stage] || 0) + 1;
        });
        return distribution;
    }
}
//# sourceMappingURL=DecisionStore.js.map