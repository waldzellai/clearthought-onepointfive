/**
 * Store for managing visual reasoning data
 */
import { BaseStore } from './BaseStore.js';
import { VisualData, VisualElement } from '../../types/index.js';
/**
 * Specialized store for managing visual reasoning sessions
 */
export declare class VisualStore extends BaseStore<VisualData> {
    /** Map of diagram IDs to their operations */
    private diagramOperations;
    /** Map of diagram types to their sessions */
    private diagramTypes;
    /** Current state of all diagrams (latest elements) */
    private diagramStates;
    constructor();
    /**
     * Add a new visual reasoning operation
     * @param id - Unique identifier
     * @param visual - The visual data
     */
    add(id: string, visual: VisualData): void;
    /**
     * Update the current state of a diagram based on operation
     * @param visual - The visual operation
     */
    private updateDiagramState;
    /**
     * Get all visual reasoning operations
     * @returns Array of all operations
     */
    getAll(): VisualData[];
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get operations for a specific diagram
     * @param diagramId - The diagram identifier
     * @returns Array of operations for that diagram
     */
    getByDiagram(diagramId: string): VisualData[];
    /**
     * Get all diagram IDs of a specific type
     * @param diagramType - The type of diagram
     * @returns Array of diagram IDs
     */
    getDiagramsByType(diagramType: VisualData['diagramType']): string[];
    /**
     * Get current state of a diagram
     * @param diagramId - The diagram identifier
     * @returns Current elements in the diagram
     */
    getDiagramState(diagramId: string): VisualElement[];
    /**
     * Get operations by type
     * @param operation - The operation type
     * @returns Array of operations of that type
     */
    getByOperation(operation: VisualData['operation']): VisualData[];
    /**
     * Get active sessions needing next operation
     * @returns Array of active sessions
     */
    getActiveSessions(): VisualData[];
    /**
     * Get operations with insights
     * @returns Array of operations that generated insights
     */
    getInsightfulOperations(): VisualData[];
    /**
     * Get operations with hypotheses
     * @returns Array of operations that formed hypotheses
     */
    getHypothesisOperations(): VisualData[];
    /**
     * Calculate diagram complexity
     * @param diagramId - The diagram identifier
     * @returns Complexity metrics
     */
    getDiagramComplexity(diagramId: string): Record<string, any>;
    /**
     * Get diagram evolution timeline
     * @param diagramId - The diagram identifier
     * @returns Timeline of operations
     */
    getDiagramTimeline(diagramId: string): Array<{
        iteration: number;
        operation: string;
        elementCount: number;
        hasInsight: boolean;
        hasHypothesis: boolean;
    }>;
    /**
     * Find similar diagrams based on structure
     * @param diagramId - The diagram identifier
     * @returns Array of similar diagram IDs
     */
    findSimilarDiagrams(diagramId: string): string[];
    /**
     * Get overall statistics
     * @returns Comprehensive statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Get distribution by operation type
     */
    private getOperationDistribution;
    /**
     * Get distribution by diagram type
     */
    private getDiagramTypeDistribution;
}
//# sourceMappingURL=VisualStore.d.ts.map