/**
 * Store for managing scientific inquiry data
 */
import { BaseStore } from './BaseStore.js';
/**
 * Specialized store for managing scientific inquiry sessions
 */
export class ScientificStore extends BaseStore {
    /** Map of inquiry IDs to their sessions */
    inquirySessions;
    /** Map of hypothesis IDs to their data */
    hypotheses;
    /** Map of experiment IDs to their data */
    experiments;
    constructor() {
        super('ScientificStore');
        this.inquirySessions = new Map();
        this.hypotheses = new Map();
        this.experiments = new Map();
    }
    /**
     * Add a new scientific inquiry session
     * @param id - Unique identifier
     * @param inquiry - The scientific inquiry data
     */
    add(id, inquiry) {
        this.data.set(id, inquiry);
        // Track by inquiry ID
        const sessions = this.inquirySessions.get(inquiry.inquiryId) || [];
        sessions.push(inquiry);
        this.inquirySessions.set(inquiry.inquiryId, sessions);
        // Track hypotheses
        if (inquiry.hypothesis) {
            this.hypotheses.set(inquiry.hypothesis.hypothesisId, inquiry.hypothesis);
        }
        // Track experiments
        if (inquiry.experiment) {
            this.experiments.set(inquiry.experiment.experimentId, inquiry.experiment);
        }
    }
    /**
     * Get all scientific inquiry sessions
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
        this.inquirySessions.clear();
        this.hypotheses.clear();
        this.experiments.clear();
    }
    /**
     * Get sessions by inquiry ID
     * @param inquiryId - The inquiry identifier
     * @returns Array of sessions for that inquiry
     */
    getByInquiry(inquiryId) {
        return this.inquirySessions.get(inquiryId) || [];
    }
    /**
     * Get sessions by stage
     * @param stage - The inquiry stage
     * @returns Array of sessions in that stage
     */
    getByStage(stage) {
        return this.filter(inquiry => inquiry.stage === stage);
    }
    /**
     * Get hypothesis by ID
     * @param hypothesisId - The hypothesis identifier
     * @returns The hypothesis data or undefined
     */
    getHypothesis(hypothesisId) {
        return this.hypotheses.get(hypothesisId);
    }
    /**
     * Get experiment by ID
     * @param experimentId - The experiment identifier
     * @returns The experiment data or undefined
     */
    getExperiment(experimentId) {
        return this.experiments.get(experimentId);
    }
    /**
     * Get all hypotheses
     * @returns Array of all hypotheses
     */
    getAllHypotheses() {
        return Array.from(this.hypotheses.values());
    }
    /**
     * Get all experiments
     * @returns Array of all experiments
     */
    getAllExperiments() {
        return Array.from(this.experiments.values());
    }
    /**
     * Get hypotheses by status
     * @param status - The hypothesis status
     * @returns Array of hypotheses with that status
     */
    getHypothesesByStatus(status) {
        return this.getAllHypotheses().filter(h => h.status === status);
    }
    /**
     * Get experiments with matched outcomes
     * @returns Array of experiments where predictions matched
     */
    getSuccessfulExperiments() {
        return this.getAllExperiments().filter(e => e.outcomeMatched === true);
    }
    /**
     * Get experiments with unexpected observations
     * @returns Array of experiments with unexpected results
     */
    getExperimentsWithSurprises() {
        return this.getAllExperiments().filter(e => e.unexpectedObservations && e.unexpectedObservations.length > 0);
    }
    /**
     * Get active inquiries needing next stage
     * @returns Array of active inquiries
     */
    getActiveInquiries() {
        return this.filter(inquiry => inquiry.nextStageNeeded);
    }
    /**
     * Get completed inquiries (reached conclusion)
     * @returns Array of completed inquiries
     */
    getCompletedInquiries() {
        return this.filter(inquiry => !!(inquiry.conclusion && inquiry.conclusion.trim().length > 0));
    }
    /**
     * Track the evolution of a hypothesis
     * @param hypothesisId - The hypothesis identifier
     * @returns Evolution history
     */
    getHypothesisEvolution(hypothesisId) {
        const evolution = [];
        const hypothesis = this.hypotheses.get(hypothesisId);
        if (!hypothesis)
            return evolution;
        // Add the hypothesis itself
        evolution.push(hypothesis);
        // Find refinements
        this.getAllHypotheses().forEach(h => {
            if (h.refinementOf === hypothesisId) {
                evolution.push(h);
            }
        });
        return evolution.sort((a, b) => a.iteration - b.iteration);
    }
    /**
     * Get hypothesis-experiment pairs
     * @returns Array of paired hypotheses and experiments
     */
    getHypothesisExperimentPairs() {
        const pairs = [];
        this.experiments.forEach(experiment => {
            const hypothesis = this.hypotheses.get(experiment.hypothesisId);
            if (hypothesis) {
                pairs.push({ hypothesis, experiment });
            }
        });
        return pairs;
    }
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics() {
        const inquiries = this.getAll();
        const hypotheses = this.getAllHypotheses();
        const experiments = this.getAllExperiments();
        return {
            totalInquiries: inquiries.length,
            activeInquiries: this.getActiveInquiries().length,
            completedInquiries: this.getCompletedInquiries().length,
            totalHypotheses: hypotheses.length,
            supportedHypotheses: this.getHypothesesByStatus('supported').length,
            refutedHypotheses: this.getHypothesesByStatus('refuted').length,
            totalExperiments: experiments.length,
            successfulExperiments: this.getSuccessfulExperiments().length,
            experimentsWithSurprises: this.getExperimentsWithSurprises().length,
            stageDistribution: this.getStageDistribution(),
            hypothesisStatusDistribution: this.getHypothesisStatusDistribution(),
            averageConfidence: hypotheses.length > 0
                ? hypotheses.reduce((sum, h) => sum + h.confidence, 0) / hypotheses.length
                : 0
        };
    }
    /**
     * Get distribution by stage
     */
    getStageDistribution() {
        const distribution = {};
        this.forEach(inquiry => {
            distribution[inquiry.stage] = (distribution[inquiry.stage] || 0) + 1;
        });
        return distribution;
    }
    /**
     * Get hypothesis status distribution
     */
    getHypothesisStatusDistribution() {
        const distribution = {};
        this.getAllHypotheses().forEach(hypothesis => {
            distribution[hypothesis.status] = (distribution[hypothesis.status] || 0) + 1;
        });
        return distribution;
    }
}
//# sourceMappingURL=ScientificStore.js.map