/**
 * Store for managing decision framework data
 */
import { BaseStore } from './BaseStore.js';
import { DecisionData, DecisionOption } from '../../types/index.js';
/**
 * Specialized store for managing decision-making sessions
 */
export declare class DecisionStore extends BaseStore<DecisionData> {
    /** Map of decision statements to their sessions */
    private decisionIndex;
    /** Map of analysis types to their sessions */
    private analysisSessions;
    constructor();
    /**
     * Add a new decision session
     * @param id - Unique identifier
     * @param decision - The decision data
     */
    add(id: string, decision: DecisionData): void;
    /**
     * Index decision keywords for search
     * @param decisionId - Decision identifier
     * @param statement - Decision statement
     */
    private indexDecision;
    /**
     * Get all decision sessions
     * @returns Array of all sessions
     */
    getAll(): DecisionData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Search decisions by keywords
     * @param keywords - Keywords to search for
     * @returns Array of matching decisions
     */
    searchDecisions(keywords: string): DecisionData[];
    /**
     * Get decisions by analysis type
     * @param analysisType - The type of analysis
     * @returns Array of decisions using that analysis
     */
    getByAnalysisType(analysisType: DecisionData['analysisType']): DecisionData[];
    /**
     * Get decisions by stage
     * @param stage - The decision stage
     * @returns Array of decisions in that stage
     */
    getByStage(stage: DecisionData['stage']): DecisionData[];
    /**
     * Get completed decisions (with recommendations)
     * @returns Array of completed decisions
     */
    getCompletedDecisions(): DecisionData[];
    /**
     * Get active decisions (needing next stage)
     * @returns Array of active decisions
     */
    getActiveDecisions(): DecisionData[];
    /**
     * Calculate decision quality score
     * @param decisionId - The decision identifier
     * @returns Quality score and breakdown
     */
    getDecisionQuality(decisionId: string): Record<string, any> | undefined;
    /**
     * Get the best option based on scores
     * @param decisionId - The decision identifier
     * @returns The best option or undefined
     */
    getBestOption(decisionId: string): DecisionOption | undefined;
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get distribution by analysis type
     */
    private getAnalysisTypeDistribution;
    /**
     * Get distribution by stage
     */
    private getStageDistribution;
}
//# sourceMappingURL=DecisionStore.d.ts.map