/**
 * Store for managing mental model application data
 */
import { BaseStore } from './BaseStore.js';
/**
 * Specialized store for managing mental model applications
 */
export class MentalModelStore extends BaseStore {
    /** Map of model names to their applications */
    modelApplications;
    constructor() {
        super('MentalModelStore');
        this.modelApplications = new Map();
    }
    /**
     * Add a new mental model application
     * @param id - Unique identifier
     * @param model - The mental model data
     */
    add(id, model) {
        this.data.set(id, model);
        // Track by model name
        const applications = this.modelApplications.get(model.modelName) || [];
        applications.push(model);
        this.modelApplications.set(model.modelName, applications);
    }
    /**
     * Get all mental model applications
     * @returns Array of all applications
     */
    getAll() {
        return Array.from(this.data.values());
    }
    /**
     * Clear all data
     */
    clear() {
        this.data.clear();
        this.modelApplications.clear();
    }
    /**
     * Get applications of a specific model
     * @param modelName - The name of the mental model
     * @returns Array of applications for that model
     */
    getByModel(modelName) {
        return this.modelApplications.get(modelName) || [];
    }
    /**
     * Get all unique problems analyzed
     * @returns Array of unique problem statements
     */
    getUniqueProblems() {
        const problems = new Set();
        this.data.forEach(model => problems.add(model.problem));
        return Array.from(problems);
    }
    /**
     * Get statistics about model usage
     * @returns Object with usage counts per model
     */
    getStatistics() {
        const stats = {};
        this.modelApplications.forEach((applications, modelName) => {
            stats[modelName] = applications.length;
        });
        return stats;
    }
    /**
     * Find models applied to similar problems
     * @param problem - The problem to search for
     * @returns Array of models applied to similar problems
     */
    findSimilarApplications(problem) {
        const problemLower = problem.toLowerCase();
        return this.filter(model => model.problem.toLowerCase().includes(problemLower) ||
            problemLower.includes(model.problem.toLowerCase()));
    }
    /**
     * Get the most frequently used model
     * @returns The model name and count, or undefined
     */
    getMostUsedModel() {
        let maxCount = 0;
        let mostUsed;
        this.modelApplications.forEach((applications, modelName) => {
            if (applications.length > maxCount) {
                maxCount = applications.length;
                mostUsed = modelName;
            }
        });
        return mostUsed ? { modelName: mostUsed, count: maxCount } : undefined;
    }
}
//# sourceMappingURL=MentalModelStore.js.map