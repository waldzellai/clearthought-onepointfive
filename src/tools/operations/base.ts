/**
 * Base interfaces for all Clear Thought operations
 */

import type { SessionState } from "../../state/SessionState.js";

/**
 * Context provided to each operation
 */
export interface OperationContext {
	sessionState: SessionState;
	prompt: string;
	parameters: Record<string, unknown>;
}

/**
 * Progress metadata for an operation
 */
export interface ProgressMetadata {
	stepsCompleted: number;
	stepsRequired: number;
	currentPhase: string;
	phaseSpecificMetrics?: Record<string, unknown>;
}

/**
 * Guidance for what the AI should do next
 */
export interface NextStepGuidance {
	action: string; // e.g., "generate_branches", "evaluate_options", "simulate_outcome"
	prompt: string; // What should AI think about next
	parameters?: Record<string, unknown>; // Suggested parameter values
	constraints?: string[]; // Requirements for next step
}

/**
 * Tool description for MCP registration
 */
export interface ToolDescription {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, unknown>;
		required?: string[];
	};
}

/**
 * Standard result format for operations
 */
export interface OperationResult {
	operation: string;
	progress: ProgressMetadata;
	nextStep: NextStepGuidance;
	sessionContext: {
		sessionId: string;
		operationHistory: string[];
		remainingBudget: number;
	};
	status: "in_progress" | "completed" | "requires_input" | "error";
	// Allow additional operation-specific data
	[key: string]: unknown;
}

/**
 * Base interface for all operations
 */
export interface Operation {
	/**
	 * Unique name of the operation (e.g., 'sequential_thinking')
	 */
	name: string;

	/**
	 * Category for organization (e.g., 'core', 'collaborative')
	 */
	category: "core" | "patterns" | "analysis" | "collaborative" | "metagame";

	/**
	 * Execute the operation with given context
	 */
	execute(context: OperationContext): Promise<OperationResult>;

	/**
	 * Get current progress through this operation
	 */
	getProgress(sessionState: SessionState): ProgressMetadata;

	/**
	 * Get guidance for what AI should do next
	 */
	getNextStep(sessionState: SessionState): NextStepGuidance;

	/**
	 * Get tool description for MCP registration
	 */
	getToolDescription(): ToolDescription;

	/**
	 * Optional validation of parameters before execution
	 */
	validateParameters?(parameters: Record<string, unknown>): void;
}

/**
 * Abstract base class with common functionality
 */
export abstract class BaseOperation implements Operation {
	abstract name: string;
	abstract category: "core" | "patterns" | "analysis" | "collaborative" | "metagame";

	abstract execute(context: OperationContext): Promise<OperationResult>;
	abstract getProgress(sessionState: SessionState): ProgressMetadata;
	abstract getNextStep(sessionState: SessionState): NextStepGuidance;
	abstract getToolDescription(): ToolDescription;

	/**
	 * Helper to get typed parameter with default value
	 */
	protected getParam<T>(parameters: Record<string, unknown>, key: string, defaultValue: T): T {
		return (parameters[key] as T) ?? defaultValue;
	}

	/**
	 * Create base result object with required fields
	 */
	protected createResult(
		sessionState: SessionState,
		status: "in_progress" | "completed" | "requires_input" | "error",
		additionalData?: Record<string, unknown>,
	): OperationResult {
		return {
			operation: this.name,
			progress: this.getProgress(sessionState),
			nextStep: this.getNextStep(sessionState),
			sessionContext: {
				sessionId: sessionState.sessionId,
				operationHistory: this.getOperationHistory(sessionState),
				remainingBudget: this.getRemainingBudget(sessionState),
			},
			status,
			...additionalData,
		};
	}

	/**
	 * Get operation history from session state
	 * Override this when unified history is implemented
	 */
	protected getOperationHistory(_sessionState: SessionState): string[] {
		// Temporary implementation - will be replaced with unified history
		return [];
	}

	/**
	 * Get remaining token budget
	 * Override this when budget tracking is implemented
	 */
	protected getRemainingBudget(_sessionState: SessionState): number {
		// Temporary implementation - will be replaced with actual budget tracking
		return 10000;
	}
}
