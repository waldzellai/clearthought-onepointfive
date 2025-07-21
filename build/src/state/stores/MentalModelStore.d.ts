/**
 * Store for managing mental model application data
 */
import { BaseStore } from './BaseStore.js';
import { MentalModelData } from '../../types/index.js';
/**
 * Specialized store for managing mental model applications
 */
export declare class MentalModelStore extends BaseStore<MentalModelData> {
    /** Map of model names to their applications */
    private modelApplications;
    constructor();
    /**
     * Add a new mental model application
     * @param id - Unique identifier
     * @param model - The mental model data
     */
    add(id: string, model: MentalModelData): void;
    /**
     * Get all mental model applications
     * @returns Array of all applications
     */
    getAll(): MentalModelData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get applications of a specific model
     * @param modelName - The name of the mental model
     * @returns Array of applications for that model
     */
    getByModel(modelName: MentalModelData['modelName']): MentalModelData[];
    /**
     * Get all unique problems analyzed
     * @returns Array of unique problem statements
     */
    getUniqueProblems(): string[];
    /**
     * Get statistics about model usage
     * @returns Object with usage counts per model
     */
    getStatistics(): Record<string, number>;
    /**
     * Find models applied to similar problems
     * @param problem - The problem to search for
     * @returns Array of models applied to similar problems
     */
    findSimilarApplications(problem: string): MentalModelData[];
    /**
     * Get the most frequently used model
     * @returns The model name and count, or undefined
     */
    getMostUsedModel(): {
        modelName: string;
        count: number;
    } | undefined;
}
//# sourceMappingURL=MentalModelStore.d.ts.map