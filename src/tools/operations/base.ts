/**
 * Base interfaces for all Clear Thought operations
 */

import type { SessionState } from "../../state/SessionState.js";

/**
 * Context provided to each operation
 */
export interface OperationContext {
	sessionState: SessionState;
	parameters: Record<string, unknown>;
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
 * Standard result format for operations - METADATA ONLY
 * Operations are structured journals that validate and store data.
 * They return metadata about what was stored, NOT the content itself.
 * Content is logged to stderr for humans.
 */
export interface OperationResult {
	operation: string;
	status: "success" | "error";
	// Metadata about what was stored (counts, IDs, etc.)
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
	 * TODO Phase 2: Make this a strict union type after updating all operations
	 */
	category: string; // "core" | "patterns" | "analysis" | "collaborative" | "metagame";

	/**
	 * Execute the operation with given context
	 */
	execute(context: OperationContext): Promise<OperationResult>;

	/**
	 * Get tool description for MCP registration
	 * The description teaches the AI how to use this operation
	 */
	getToolDescription?(): ToolDescription;

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
	abstract category: string;

	abstract execute(context: OperationContext): Promise<OperationResult>;

	getToolDescription(): ToolDescription {
		return {
			name: this.name,
			description: `${this.name} operation`,
			inputSchema: {
				type: "object",
				properties: {},
			},
		};
	}

	/**
	 * Helper to get typed parameter with default value
	 */
	protected getParam<T>(parameters: Record<string, unknown>, key: string, defaultValue: T): T {
		return (parameters[key] as T) ?? defaultValue;
	}

	/**
	 * Create metadata-only result object
	 * Operations should return counts, IDs, status - NOT content
	 */
	protected createResult(metadata: Record<string, unknown> = {}): OperationResult {
		return {
			operation: this.name,
			status: "success",
			...metadata,
		};
	}

	/**
	 * Create error result
	 */
	protected createError(error: string, metadata: Record<string, unknown> = {}): OperationResult {
		return {
			operation: this.name,
			status: "error",
			error,
			...metadata,
		};
	}
}
