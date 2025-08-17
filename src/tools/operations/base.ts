/**
 * Base interfaces for all Clear Thought operations
 */

import type { SessionState } from '../../state/SessionState.js';

/**
 * Context provided to each operation
 */
export interface OperationContext {
  sessionState: SessionState;
  prompt: string;
  parameters: Record<string, unknown>;
}

/**
 * Standard result format for operations
 */
export interface OperationResult {
  toolOperation: string;
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
  category: string;
  
  /**
   * Execute the operation with given context
   */
  execute(context: OperationContext): Promise<OperationResult>;
  
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
  
  /**
   * Helper to get typed parameter with default value
   */
  protected getParam<T>(
    parameters: Record<string, unknown>,
    key: string,
    defaultValue: T
  ): T {
    return (parameters[key] as T) ?? defaultValue;
  }
  
  /**
   * Create base result object
   */
  protected createResult(data: Record<string, unknown>): OperationResult {
    return {
      toolOperation: this.name,
      ...data
    };
  }
}