/**
 * Operation registry for managing all Clear Thought operations
 */
/**
 * Central registry for all operations
 */
class OperationRegistry {
	operations = new Map();
	/**
	 * Register an operation
	 */
	register(operation) {
		if (this.operations.has(operation.name)) {
			console.warn(`Operation ${operation.name} is already registered, overwriting...`);
		}
		this.operations.set(operation.name, operation);
	}
	/**
	 * Get an operation by name
	 */
	get(name) {
		return this.operations.get(name);
	}
	/**
	 * Check if an operation exists
	 */
	has(name) {
		return this.operations.has(name);
	}
	/**
	 * Get all registered operations
	 */
	getAll() {
		return new Map(this.operations);
	}
	/**
	 * Get operations by category
	 */
	getByCategory(category) {
		return Array.from(this.operations.values()).filter((op) => op.category === category);
	}
	/**
	 * Get all operation names
	 */
	getNames() {
		return Array.from(this.operations.keys());
	}
	/**
	 * Clear all registrations (useful for testing)
	 */
	clear() {
		this.operations.clear();
	}
}
// Singleton instance
export const operationRegistry = new OperationRegistry();
