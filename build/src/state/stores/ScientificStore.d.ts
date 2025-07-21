/**
 * Store for managing scientific inquiry data
 */
import { BaseStore } from './BaseStore.js';
import { ScientificInquiryData, HypothesisData, ExperimentData } from '../../types/index.js';
/**
 * Specialized store for managing scientific inquiry sessions
 */
export declare class ScientificStore extends BaseStore<ScientificInquiryData> {
    /** Map of inquiry IDs to their sessions */
    private inquirySessions;
    /** Map of hypothesis IDs to their data */
    private hypotheses;
    /** Map of experiment IDs to their data */
    private experiments;
    constructor();
    /**
     * Add a new scientific inquiry session
     * @param id - Unique identifier
     * @param inquiry - The scientific inquiry data
     */
    add(id: string, inquiry: ScientificInquiryData): void;
    /**
     * Get all scientific inquiry sessions
     * @returns Array of all sessions
     */
    getAll(): ScientificInquiryData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get sessions by inquiry ID
     * @param inquiryId - The inquiry identifier
     * @returns Array of sessions for that inquiry
     */
    getByInquiry(inquiryId: string): ScientificInquiryData[];
    /**
     * Get sessions by stage
     * @param stage - The inquiry stage
     * @returns Array of sessions in that stage
     */
    getByStage(stage: ScientificInquiryData['stage']): ScientificInquiryData[];
    /**
     * Get hypothesis by ID
     * @param hypothesisId - The hypothesis identifier
     * @returns The hypothesis data or undefined
     */
    getHypothesis(hypothesisId: string): HypothesisData | undefined;
    /**
     * Get experiment by ID
     * @param experimentId - The experiment identifier
     * @returns The experiment data or undefined
     */
    getExperiment(experimentId: string): ExperimentData | undefined;
    /**
     * Get all hypotheses
     * @returns Array of all hypotheses
     */
    getAllHypotheses(): HypothesisData[];
    /**
     * Get all experiments
     * @returns Array of all experiments
     */
    getAllExperiments(): ExperimentData[];
    /**
     * Get hypotheses by status
     * @param status - The hypothesis status
     * @returns Array of hypotheses with that status
     */
    getHypothesesByStatus(status: HypothesisData['status']): HypothesisData[];
    /**
     * Get experiments with matched outcomes
     * @returns Array of experiments where predictions matched
     */
    getSuccessfulExperiments(): ExperimentData[];
    /**
     * Get experiments with unexpected observations
     * @returns Array of experiments with unexpected results
     */
    getExperimentsWithSurprises(): ExperimentData[];
    /**
     * Get active inquiries needing next stage
     * @returns Array of active inquiries
     */
    getActiveInquiries(): ScientificInquiryData[];
    /**
     * Get completed inquiries (reached conclusion)
     * @returns Array of completed inquiries
     */
    getCompletedInquiries(): ScientificInquiryData[];
    /**
     * Track the evolution of a hypothesis
     * @param hypothesisId - The hypothesis identifier
     * @returns Evolution history
     */
    getHypothesisEvolution(hypothesisId: string): HypothesisData[];
    /**
     * Get hypothesis-experiment pairs
     * @returns Array of paired hypotheses and experiments
     */
    getHypothesisExperimentPairs(): Array<{
        hypothesis: HypothesisData;
        experiment: ExperimentData;
    }>;
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get distribution by stage
     */
    private getStageDistribution;
    /**
     * Get hypothesis status distribution
     */
    private getHypothesisStatusDistribution;
}
//# sourceMappingURL=ScientificStore.d.ts.map