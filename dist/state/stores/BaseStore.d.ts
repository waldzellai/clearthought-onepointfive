/**
 * Base abstract class for all data stores in the Clear Thought MCP server
 *
 * This class provides common functionality for storing and managing
 * different types of thinking session data.
 */
/**
 * Generic base store for managing collections of typed data
 * @template T - The type of data this store manages
 */
export declare abstract class BaseStore<T> {
    /** Internal storage map */
    protected data: Map<string, T>;
    /** Store name for logging and debugging */
    protected readonly storeName: string;
    constructor(storeName: string);
    /**
     * Add a new item to the store
     * @param id - Unique identifier for the item
     * @param item - The item to store
     */
    abstract add(id: string, item: T): void;
    /**
     * Get all items from the store
     * @returns Array of all stored items
     */
    abstract getAll(): T[];
    /**
     * Clear all items from the store
     */
    abstract clear(): void;
    /**
     * Get a specific item by ID
     * @param id - The item's unique identifier
     * @returns The item if found, undefined otherwise
     */
    get(id: string): T | undefined;
    /**
     * Check if an item exists
     * @param id - The item's unique identifier
     * @returns True if the item exists
     */
    has(id: string): boolean;
    /**
     * Delete a specific item
     * @param id - The item's unique identifier
     * @returns True if the item was deleted
     */
    delete(id: string): boolean;
    /**
     * Get the number of items in the store
     * @returns The count of items
     */
    size(): number;
    /**
     * Export all data for persistence
     * @returns Serializable representation of the store
     */
    export(): Record<string, T>;
    /**
     * Import data from a serialized representation
     * @param data - The data to import
     */
    import(data: Record<string, T>): void;
    /**
     * Get all keys in the store
     * @returns Array of all keys
     */
    keys(): string[];
    /**
     * Get all values in the store
     * @returns Array of all values
     */
    values(): T[];
    /**
     * Iterate over all entries
     * @param callback - Function to call for each entry
     */
    forEach(callback: (value: T, key: string) => void): void;
    /**
     * Filter items based on a predicate
     * @param predicate - Function to test each item
     * @returns Array of items that match the predicate
     */
    filter(predicate: (item: T) => boolean): T[];
    /**
     * Find the first item matching a predicate
     * @param predicate - Function to test each item
     * @returns The first matching item or undefined
     */
    find(predicate: (item: T) => boolean): T | undefined;
    /**
     * Update an existing item
     * @param id - The item's unique identifier
     * @param updater - Function to update the item
     * @returns True if the item was updated
     */
    update(id: string, updater: (item: T) => T): boolean;
}
//# sourceMappingURL=BaseStore.d.ts.map