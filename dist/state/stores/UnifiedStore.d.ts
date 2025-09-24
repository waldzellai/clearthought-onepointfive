/**
 * Unified Store Implementation
 *
 * Consolidates all specialized stores into a single, type-safe store
 * with efficient indexing and querying capabilities.
 */
import { ThoughtData, MentalModelData, DebuggingSession, CollaborativeSession, DecisionData, MetacognitiveData, ScientificInquiryData, CreativeData, SystemsData, VisualData, ArgumentData, SocraticData, SessionExport } from '../../types/index.js';
/**
 * Union type for all data types managed by the unified store
 */
export type UnifiedDataType = ThoughtData | MentalModelData | DebuggingSession | CollaborativeSession | DecisionData | MetacognitiveData | ScientificInquiryData | CreativeData | SystemsData | VisualData | ArgumentData | SocraticData;
/**
 * Data type tags for categorization and indexing
 */
export declare enum DataTypeTag {
    THOUGHT = "thought",
    MENTAL_MODEL = "mentalModel",
    DEBUGGING = "debugging",
    COLLABORATIVE = "collaborative",
    DECISION = "decision",
    METACOGNITIVE = "metacognitive",
    SCIENTIFIC = "scientific",
    CREATIVE = "creative",
    SYSTEMS = "systems",
    VISUAL = "visual",
    ARGUMENT = "argument",
    SOCRATIC = "socratic"
}
/**
 * Storage entry with metadata for tracking and indexing
 */
export interface StorageEntry<T extends UnifiedDataType = UnifiedDataType> {
    id: string;
    type: DataTypeTag;
    data: T;
    timestamp: Date;
    metadata?: Record<string, any>;
}
/**
 * Type guards for runtime type checking
 */
export declare const TypeGuards: {
    isThoughtData: (data: UnifiedDataType) => data is ThoughtData;
    isMentalModelData: (data: UnifiedDataType) => data is MentalModelData;
    isDebuggingSession: (data: UnifiedDataType) => data is DebuggingSession;
    isCollaborativeSession: (data: UnifiedDataType) => data is CollaborativeSession;
    isDecisionData: (data: UnifiedDataType) => data is DecisionData;
    isMetacognitiveData: (data: UnifiedDataType) => data is MetacognitiveData;
    isScientificInquiry: (data: UnifiedDataType) => data is ScientificInquiryData;
    isCreativeData: (data: UnifiedDataType) => data is CreativeData;
    isSystemsData: (data: UnifiedDataType) => data is SystemsData;
    isVisualData: (data: UnifiedDataType) => data is VisualData;
    isArgumentData: (data: UnifiedDataType) => data is ArgumentData;
    isSocraticData: (data: UnifiedDataType) => data is SocraticData;
};
/**
 * Unified store for all data types with type-safe operations
 */
export declare class UnifiedStore {
    private data;
    private readonly storeName;
    private typeIndexes;
    private thoughtSequence;
    private collaborativeSessions;
    private visualDiagrams;
    private decisionIndex;
    private inquiryIndex;
    constructor();
    get(id: string): StorageEntry | undefined;
    has(id: string): boolean;
    delete(id: string): boolean;
    size(): number;
    export(): Record<string, StorageEntry>;
    import(data: Record<string, StorageEntry>): void;
    keys(): string[];
    values(): StorageEntry[];
    forEach(callback: (value: StorageEntry, key: string) => void): void;
    filter(predicate: (item: StorageEntry) => boolean): StorageEntry[];
    find(predicate: (item: StorageEntry) => boolean): StorageEntry | undefined;
    update(id: string, updater: (item: StorageEntry) => StorageEntry): boolean;
    /**
     * Determine the data type tag for indexing
     */
    private getDataType;
    /**
     * Add any type of data to the store
     */
    add(id: string, item: StorageEntry | UnifiedDataType): void;
    /**
     * Type guard for StorageEntry
     */
    private isStorageEntry;
    /**
     * Update special indexes based on data type
     */
    private updateSpecialIndexes;
    /**
     * Get all items of a specific type
     */
    getByType<T extends UnifiedDataType>(type: DataTypeTag): T[];
    /**
     * Get all items (returns StorageEntry objects)
     */
    getAll(): StorageEntry[];
    /**
     * Clear all data and indexes
     */
    clear(): void;
    getThoughts(): ThoughtData[];
    getMentalModels(): MentalModelData[];
    getDebuggingSessions(): DebuggingSession[];
    getCollaborativeSessions(): CollaborativeSession[];
    getDecisions(): DecisionData[];
    getMetacognitiveSessions(): MetacognitiveData[];
    getScientificInquiries(): ScientificInquiryData[];
    getCreativeSessions(): CreativeData[];
    getSystemsAnalyses(): SystemsData[];
    getVisualOperations(): VisualData[];
    getArguments(): (ArgumentData | SocraticData)[];
    /**
     * Get ordered thought sequence
     */
    getThoughtSequence(): ThoughtData[];
    /**
     * Get collaborative session by ID
     */
    getCollaborativeSession(sessionId: string): CollaborativeSession | undefined;
    /**
     * Get decision by ID
     */
    getDecision(decisionId: string): DecisionData | undefined;
    /**
     * Get scientific inquiry by ID
     */
    getScientificInquiry(inquiryId: string): ScientificInquiryData | undefined;
    /**
     * Get visual diagrams by diagram ID
     */
    getVisualDiagram(diagramId: string): VisualData[];
    /**
     * Get statistics by type
     */
    getStatsByType(): Record<DataTypeTag, number>;
    /**
     * Export data by type or all data
     */
    exportByType(type?: DataTypeTag): SessionExport;
    /**
     * Import data from export
     */
    importData(sessionExport: SessionExport): void;
    /**
     * Generate unique ID for data item
     */
    private generateId;
    private extractExistingId;
    private generate;
    private generateRandomString;
    /**
     * Search across all data types with a predicate
     */
    searchAll(predicate: (entry: StorageEntry) => boolean): StorageEntry[];
    /**
     * Get recent items across all types
     */
    getRecent(limit?: number): StorageEntry[];
}
//# sourceMappingURL=UnifiedStore.d.ts.map