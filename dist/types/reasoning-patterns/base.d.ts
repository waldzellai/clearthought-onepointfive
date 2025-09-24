/**
 * Base types for all reasoning patterns
 *
 * These interfaces provide the foundation for implementing
 * various reasoning structures in the sequential thinking framework.
 */
import { ThoughtData } from '../index.js';
/**
 * Base node interface that all reasoning nodes extend
 */
export interface BaseReasoningNode {
    /** Unique identifier for the node */
    id: string;
    /** Content/thought represented by this node */
    content: string;
    /** Creation timestamp */
    timestamp: string;
    /** Generic metadata storage */
    metadata?: Record<string, any>;
}
/**
 * Base session interface for reasoning patterns
 */
export interface BaseReasoningSession {
    /** Session identifier */
    sessionId: string;
    /** Pattern type being used */
    patternType: ReasoningPatternType;
    /** Current iteration/step number */
    iteration: number;
    /** Whether more reasoning steps are needed */
    nextStepNeeded: boolean;
    /** Session creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}
/**
 * Available reasoning pattern types
 */
export type ReasoningPatternType = 'chain' | 'tree' | 'graph' | 'beam' | 'mcts' | 'recursive' | 'dialectical';
/**
 * Common operations that all patterns support
 */
export interface ReasoningPatternOperations<TNode extends BaseReasoningNode, TSession extends BaseReasoningSession> {
    /** Create a new node */
    createNode(content: string, context: TSession): TNode;
    /** Update an existing node */
    updateNode(nodeId: string, updates: Partial<TNode>, context: TSession): TNode;
    /** Delete a node */
    deleteNode(nodeId: string, context: TSession): boolean;
    /** Get suggested next actions */
    getNextActions(session: TSession): string[];
    /** Evaluate current progress (0.0-1.0) */
    evaluateProgress(session: TSession): number;
}
/**
 * Interface for pattern implementations
 */
export interface ReasoningPattern<TNode extends BaseReasoningNode, TSession extends BaseReasoningSession> {
    /** Pattern identification */
    patternName: string;
    patternVersion: string;
    /** Operations */
    operations: ReasoningPatternOperations<TNode, TSession>;
    /** Session management */
    initializeSession(config: any): TSession;
    /** Serialization */
    serializeSession(session: TSession): string;
    deserializeSession(data: string): TSession;
    /** Compatibility with sequential thinking */
    exportToSequentialFormat(session: TSession): ThoughtData[];
    importFromSequentialFormat(thoughts: ThoughtData[]): TSession;
}
/**
 * Unified reasoning interface arguments
 */
export interface UnifiedReasoningArgs {
    /** Which reasoning pattern to use */
    pattern: ReasoningPatternType;
    /** Operation to perform */
    operation: 'create' | 'continue' | 'evaluate' | 'branch' | 'merge' | 'prune' | 'analyze';
    /** Content for create operations */
    content?: string;
    /** Node ID for node-specific operations */
    nodeId?: string;
    /** Session identifier */
    sessionId: string;
    /** Pattern-specific parameters */
    parameters?: Record<string, any>;
}
/**
 * Unified reasoning result
 */
export interface UnifiedReasoningResult {
    /** Session ID */
    sessionId: string;
    /** Pattern used */
    pattern: ReasoningPatternType;
    /** Current node ID (if applicable) */
    currentNodeId?: string;
    /** Suggested next actions */
    suggestedActions: string[];
    /** Progress score (0.0-1.0) */
    progress: number;
    /** Visual representation */
    visualization?: string;
    /** Pattern-specific export data */
    exportData?: any;
    /** Success status */
    success: boolean;
    /** Error information if failed */
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
/**
 * Visualization options for reasoning structures
 */
export interface VisualizationOptions {
    /** Format for visualization */
    format: 'ascii' | 'mermaid' | 'graphviz' | 'json';
    /** Maximum nodes to include */
    maxNodes?: number;
    /** Whether to include metadata */
    includeMetadata?: boolean;
    /** Highlight specific nodes */
    highlightNodes?: string[];
    /** Focus on specific subgraph */
    focusNodeId?: string;
    /** Depth limit for tree/graph structures */
    depthLimit?: number;
}
/**
 * Pattern registry entry
 */
export interface PatternRegistryEntry {
    /** Pattern type identifier */
    type: ReasoningPatternType;
    /** Human-readable name */
    name: string;
    /** Description of the pattern */
    description: string;
    /** When to use this pattern */
    useCases: string[];
    /** Pattern implementation */
    implementation: ReasoningPattern<any, any>;
    /** Whether pattern is experimental */
    experimental?: boolean;
}
//# sourceMappingURL=base.d.ts.map