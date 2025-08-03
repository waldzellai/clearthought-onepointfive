/**
 * Main session state management class for the Clear Thought MCP server
 *
 * This class manages all thinking session data and provides centralized
 * access to different types of thinking tools and their data.
 */
import { ServerConfig } from '../config.js';
import { ThoughtData, MentalModelData, DebuggingSession, CollaborativeSession, DecisionData, MetacognitiveData, ScientificInquiryData, CreativeData, SystemsData, VisualData, SessionExport, ArgumentData, SocraticData } from '../types/index.js';
/**
 * Comprehensive session statistics
 */
export interface SessionStatistics {
    sessionId: string;
    createdAt: Date;
    lastAccessedAt: Date;
    thoughtCount: number;
    toolsUsed: string[];
    totalOperations: number;
    isActive: boolean;
    remainingThoughts: number;
    stores: {
        thoughts: Record<string, any>;
        mentalModels: Record<string, any>;
        debugging: Record<string, any>;
        collaborative: Record<string, any>;
        decisions: Record<string, any>;
        metacognitive: Record<string, any>;
        scientific: Record<string, any>;
        creative: Record<string, any>;
        systems: Record<string, any>;
        visual: Record<string, any>;
    };
}
/**
 * Main session state class
 */
export declare class SessionState {
    /** Unique session identifier */
    readonly sessionId: string;
    /** Server configuration */
    private readonly config;
    /** Session creation timestamp */
    private readonly createdAt;
    /** Last access timestamp */
    private lastAccessedAt;
    /** Timeout timer reference */
    private timeoutTimer?;
    /** Data stores */
    private readonly thoughtStore;
    private readonly mentalModelStore;
    private readonly debuggingStore;
    private readonly collaborativeStore;
    private readonly decisionStore;
    private readonly metacognitiveStore;
    private readonly scientificStore;
    private readonly creativeStore;
    private readonly systemsStore;
    private readonly visualStore;
    /**
     * Create a new session state
     * @param sessionId - Unique identifier for this session
     * @param config - Server configuration
     */
    constructor(sessionId: string, config: ServerConfig);
    /**
     * Reset the session timeout
     */
    private resetTimeout;
    /**
     * Touch the session to prevent timeout
     */
    touch(): void;
    /**
     * Add a new thought
     * @param thought - The thought data
     * @returns True if added, false if limit reached
     */
    addThought(thought: ThoughtData): boolean;
    /**
     * Get all thoughts
     */
    getThoughts(): ThoughtData[];
    /**
     * Get remaining thought capacity
     */
    getRemainingThoughts(): number;
    /**
     * Add a mental model application
     */
    addMentalModel(model: MentalModelData): void;
    /**
     * Get all mental model applications
     */
    getMentalModels(): MentalModelData[];
    /**
     * Add a debugging session
     */
    addDebuggingSession(session: DebuggingSession): void;
    /**
     * Get all debugging sessions
     */
    getDebuggingSessions(): DebuggingSession[];
    /**
     * Add a collaborative session
     */
    addCollaborativeSession(session: CollaborativeSession): void;
    /**
     * Get all collaborative sessions
     */
    getCollaborativeSessions(): CollaborativeSession[];
    /**
     * Get a specific collaborative session by ID
     */
    getCollaborativeSession(sessionId: string): CollaborativeSession | undefined;
    /**
     * Add a decision session
     */
    addDecision(decision: DecisionData): void;
    /**
     * Get all decision sessions
     */
    getDecisions(): DecisionData[];
    /**
     * Get a specific decision by ID
     */
    getDecision(decisionId: string): DecisionData | undefined;
    /**
     * Add a metacognitive monitoring session
     */
    addMetacognitive(session: MetacognitiveData): void;
    /**
     * Get all metacognitive sessions
     */
    getMetacognitiveSessions(): MetacognitiveData[];
    /**
     * Get a specific metacognitive session by ID
     */
    getMetacognitiveSession(monitoringId: string): MetacognitiveData | undefined;
    /**
     * Add a scientific inquiry session
     */
    addScientificInquiry(inquiry: ScientificInquiryData): void;
    /**
     * Get all scientific inquiry sessions
     */
    getScientificInquiries(): ScientificInquiryData[];
    /**
     * Get a specific scientific inquiry by ID
     */
    getScientificInquiry(inquiryId: string): ScientificInquiryData | undefined;
    /**
     * Add a creative thinking session
     */
    addCreativeSession(session: CreativeData): void;
    /**
     * Get all creative sessions
     */
    getCreativeSessions(): CreativeData[];
    /**
     * Add a systems thinking session
     */
    addSystemsAnalysis(system: SystemsData): void;
    /**
     * Get all systems analyses
     */
    getSystemsAnalyses(): SystemsData[];
    /**
     * Add a visual reasoning operation
     */
    addVisualOperation(visual: VisualData): void;
    /**
     * Get all visual operations
     */
    getVisualOperations(): VisualData[];
    /**
     * Get visual operations for a specific diagram
     */
    getVisualDiagram(diagramId: string): VisualData[];
    /**
     * Add a Socratic/argumentation session
     * Note: Since SocraticData extends ArgumentData, we can store it directly
     */
    addArgumentation(argument: ArgumentData | SocraticData): void;
    /**
     * Get comprehensive session statistics
     */
    getStats(): SessionStatistics;
    /**
     * Export session data
     * @param storeType - Optional specific store to export
     * @returns Exportable session data
     */
    export(storeType?: string): SessionExport | SessionExport[];
    /**
     * Import session data
     * @param data - The session export data to import
     */
    import(data: SessionExport | SessionExport[]): void;
    /**
     * Cleanup session data and stop timers
     */
    cleanup(): void;
    /**
     * Check if session is still active
     */
    isActive(): boolean;
}
//# sourceMappingURL=SessionState.d.ts.map