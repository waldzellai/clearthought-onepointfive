/**
 * Operation registry for managing all Clear Thought operations
 */

import type { Operation } from './base.js';

/**
 * Central registry for all operations
 */
class OperationRegistry {
  private operations = new Map<string, Operation>();
  
  /**
   * Register an operation
   */
  register(operation: Operation): void {
    if (this.operations.has(operation.name)) {
      console.warn(`Operation ${operation.name} is already registered, overwriting...`);
    }
    this.operations.set(operation.name, operation);
  }
  
  /**
   * Get an operation by name
   */
  get(name: string): Operation | undefined {
    return this.operations.get(name);
  }
  
  /**
   * Check if an operation exists
   */
  has(name: string): boolean {
    return this.operations.has(name);
  }
  
  /**
   * Get all registered operations
   */
  getAll(): Map<string, Operation> {
    return new Map(this.operations);
  }
  
  /**
   * Get operations by category
   */
  getByCategory(category: string): Operation[] {
    return Array.from(this.operations.values())
      .filter(op => op.category === category);
  }
  
  /**
   * Get all operation names
   */
  getNames(): string[] {
    return Array.from(this.operations.keys());
  }
  
  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.operations.clear();
  }
}

// Singleton instance
export const operationRegistry = new OperationRegistry();