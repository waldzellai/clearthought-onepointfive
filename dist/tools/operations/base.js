/**
 * Base interfaces for all Clear Thought operations
 */
/**
 * Abstract base class with common functionality
 */
export class BaseOperation {
    getToolDescription() {
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
    getParam(parameters, key, defaultValue) {
        return parameters[key] ?? defaultValue;
    }
    /**
     * Create metadata-only result object
     * Operations should return counts, IDs, status - NOT content
     */
    createResult(metadata = {}) {
        return {
            operation: this.name,
            status: "success",
            ...metadata,
        };
    }
    /**
     * Create error result
     */
    createError(error, metadata = {}) {
        return {
            operation: this.name,
            status: "error",
            error,
            ...metadata,
        };
    }
}
