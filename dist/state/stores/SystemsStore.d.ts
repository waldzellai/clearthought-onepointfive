/**
 * Store for managing systems thinking data
 */
import { BaseStore } from './BaseStore.js';
import { SystemsData } from '../../types/index.js';
/**
 * Specialized store for managing systems thinking sessions
 */
export declare class SystemsStore extends BaseStore<SystemsData> {
    /** Map of system names to their analysis sessions */
    private systemAnalyses;
    /** Map of components to systems containing them */
    private componentIndex;
    constructor();
    /**
     * Add a new systems thinking session
     * @param id - Unique identifier
     * @param system - The systems data
     */
    add(id: string, system: SystemsData): void;
    /**
     * Get all systems thinking sessions
     * @returns Array of all sessions
     */
    getAll(): SystemsData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get analyses for a specific system
     * @param systemName - The system name
     * @returns Array of analyses for that system
     */
    getBySystem(systemName: string): SystemsData[];
    /**
     * Get systems containing a specific component
     * @param component - The component name
     * @returns Array of systems containing that component
     */
    getSystemsWithComponent(component: string): SystemsData[];
    /**
     * Get all unique components across all systems
     * @returns Array of component names
     */
    getAllComponents(): string[];
    /**
     * Get active sessions needing more analysis
     * @returns Array of active sessions
     */
    getActiveSessions(): SystemsData[];
    /**
     * Get systems with feedback loops
     * @returns Array of systems with identified feedback loops
     */
    getSystemsWithFeedbackLoops(): SystemsData[];
    /**
     * Get systems with positive feedback loops
     * @returns Array of systems with reinforcing loops
     */
    getSystemsWithPositiveFeedback(): SystemsData[];
    /**
     * Get systems with negative feedback loops
     * @returns Array of systems with balancing loops
     */
    getSystemsWithNegativeFeedback(): SystemsData[];
    /**
     * Calculate system complexity metrics
     * @param sessionId - The session identifier
     * @returns Complexity metrics
     */
    getComplexityMetrics(sessionId: string): Record<string, any> | undefined;
    /**
     * Calculate average relationship strength
     * @param system - The system data
     * @returns Average strength or 0
     */
    private calculateAverageRelationshipStrength;
    /**
     * Calculate complexity score
     * @param system - The system data
     * @returns Complexity score (0-1)
     */
    private calculateComplexityScore;
    /**
     * Find related systems (sharing components)
     * @param sessionId - The session identifier
     * @returns Array of related systems
     */
    findRelatedSystems(sessionId: string): SystemsData[];
    /**
     * Get component co-occurrence matrix
     * @returns Map of component pairs to occurrence count
     */
    getComponentCoOccurrence(): Map<string, number>;
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get most common components
     * @param limit - Number of top components
     * @returns Array of components and counts
     */
    private getMostCommonComponents;
}
//# sourceMappingURL=SystemsStore.d.ts.map