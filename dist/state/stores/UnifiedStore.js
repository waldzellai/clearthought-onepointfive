/**
 * Unified store for all Clear Thought data
 *
 * Consolidates all individual stores into a single, unified data store
 * that manages all types of reasoning data through a single interface.
 */
/**
 * Unified store that manages all Clear Thought data types
 */
export class UnifiedStore {
    data = new Map();
    constructor() {
    }
    /**
     * Add data to the store
     */
    add(id, item) {
        this.data.set(id, item);
    }
    /**
     * Get all items of a specific type
     */
    getByType(type) {
        return Array.from(this.data.values())
            .filter(item => item.type === type);
    }
    /**
     * Get all items
     */
    getAll() {
        return Array.from(this.data.values());
    }
    /**
     * Clear all data
     */
    clear() {
        this.data.clear();
    }
    /**
     * Get statistics for all data types
     */
    getStats() {
        const stats = {};
        this.data.forEach(item => {
            stats[item.type] = (stats[item.type] || 0) + 1;
        });
        return stats;
    }
    /**
     * Export all data organized by type
     */
    exportByType() {
        const result = {};
        this.data.forEach(item => {
            if (!result[item.type]) {
                result[item.type] = [];
            }
            result[item.type].push(item.data);
        });
        return result;
    }
    /**
     * Import data organized by type
     */
    importByType(data) {
        this.clear();
        Object.entries(data).forEach(([type, items]) => {
            items.forEach((itemData, index) => {
                const id = `${type}_${Date.now()}_${index}`;
                this.add(id, { type: type, data: itemData });
            });
        });
    }
}
