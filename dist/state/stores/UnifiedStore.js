/**
 * Unified Store Implementation
 *
 * Consolidates all specialized stores into a single, type-safe store
 * with efficient indexing and querying capabilities.
 */
/**
 * Data type tags for categorization and indexing
 */
export var DataTypeTag;
(function (DataTypeTag) {
    DataTypeTag["THOUGHT"] = "thought";
    DataTypeTag["MENTAL_MODEL"] = "mentalModel";
    DataTypeTag["DEBUGGING"] = "debugging";
    DataTypeTag["COLLABORATIVE"] = "collaborative";
    DataTypeTag["DECISION"] = "decision";
    DataTypeTag["METACOGNITIVE"] = "metacognitive";
    DataTypeTag["SCIENTIFIC"] = "scientific";
    DataTypeTag["CREATIVE"] = "creative";
    DataTypeTag["SYSTEMS"] = "systems";
    DataTypeTag["VISUAL"] = "visual";
    DataTypeTag["ARGUMENT"] = "argument";
    DataTypeTag["SOCRATIC"] = "socratic";
})(DataTypeTag || (DataTypeTag = {}));
/**
 * Type guards for runtime type checking
 */
export const TypeGuards = {
    isThoughtData: (data) => 'thoughtNumber' in data && 'totalThoughts' in data && 'nextThoughtNeeded' in data,
    isMentalModelData: (data) => 'modelName' in data && 'steps' in data && 'reasoning' in data,
    isDebuggingSession: (data) => 'sessionId' in data && 'approach' in data && 'debugSteps' in data,
    isCollaborativeSession: (data) => 'sessionId' in data && 'personas' in data && 'conversationHistory' in data,
    isDecisionData: (data) => 'decisionId' in data && 'options' in data && 'criteria' in data,
    isMetacognitiveData: (data) => 'monitoringId' in data && 'metacognitiveStrategy' in data,
    isScientificInquiry: (data) => 'inquiryId' in data && 'hypotheses' in data && 'experiments' in data,
    isCreativeData: (data) => 'technique' in data && 'ideaCategories' in data,
    isSystemsData: (data) => 'systemName' in data && 'components' in data,
    isVisualData: (data) => 'diagramId' in data && 'diagramType' in data,
    isArgumentData: (data) => 'argumentId' in data && 'argumentType' in data && 'claims' in data,
    isSocraticData: (data) => TypeGuards.isArgumentData(data) && 'socraticMethod' in data
};
/**
 * Unified store for all data types with type-safe operations
 */
export class UnifiedStore {
    // Internal storage map and store name (inlined from BaseStore)
    data;
    storeName;
    // Type-specific indexes for efficient queries
    typeIndexes;
    // Special indexes for specific data types
    thoughtSequence = [];
    collaborativeSessions = new Map();
    visualDiagrams = new Map();
    decisionIndex = new Map();
    inquiryIndex = new Map();
    constructor() {
        this.storeName = 'UnifiedStore';
        this.data = new Map();
        this.typeIndexes = new Map();
        // Initialize indexes for all types
        Object.values(DataTypeTag).forEach(type => {
            this.typeIndexes.set(type, new Set());
        });
    }
    // -------- Inlined generic store utilities (from BaseStore) --------
    get(id) {
        return this.data.get(id);
    }
    has(id) {
        return this.data.has(id);
    }
    delete(id) {
        return this.data.delete(id);
    }
    size() {
        return this.data.size;
    }
    export() {
        const result = {};
        this.data.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    import(data) {
        this.clear();
        Object.entries(data).forEach(([key, value]) => {
            this.add(key, value);
        });
    }
    keys() {
        return Array.from(this.data.keys());
    }
    values() {
        return Array.from(this.data.values());
    }
    forEach(callback) {
        this.data.forEach(callback);
    }
    filter(predicate) {
        return this.values().filter(predicate);
    }
    find(predicate) {
        return this.values().find(predicate);
    }
    update(id, updater) {
        const item = this.get(id);
        if (item) {
            this.add(id, updater(item));
            return true;
        }
        return false;
    }
    /**
     * Determine the data type tag for indexing
     */
    getDataType(data) {
        if (TypeGuards.isSocraticData(data))
            return DataTypeTag.SOCRATIC;
        if (TypeGuards.isArgumentData(data))
            return DataTypeTag.ARGUMENT;
        if (TypeGuards.isThoughtData(data))
            return DataTypeTag.THOUGHT;
        if (TypeGuards.isMentalModelData(data))
            return DataTypeTag.MENTAL_MODEL;
        if (TypeGuards.isDebuggingSession(data))
            return DataTypeTag.DEBUGGING;
        if (TypeGuards.isCollaborativeSession(data))
            return DataTypeTag.COLLABORATIVE;
        if (TypeGuards.isDecisionData(data))
            return DataTypeTag.DECISION;
        if (TypeGuards.isMetacognitiveData(data))
            return DataTypeTag.METACOGNITIVE;
        if (TypeGuards.isScientificInquiry(data))
            return DataTypeTag.SCIENTIFIC;
        if (TypeGuards.isCreativeData(data))
            return DataTypeTag.CREATIVE;
        if (TypeGuards.isSystemsData(data))
            return DataTypeTag.SYSTEMS;
        if (TypeGuards.isVisualData(data))
            return DataTypeTag.VISUAL;
        throw new Error(`Unknown data type: ${JSON.stringify(data).substring(0, 100)}`);
    }
    /**
     * Add any type of data to the store
     */
    add(id, item) {
        let entry;
        // Handle both StorageEntry and raw data
        if (this.isStorageEntry(item)) {
            entry = item;
        }
        else {
            const dataType = this.getDataType(item);
            entry = {
                id,
                type: dataType,
                data: item,
                timestamp: new Date()
            };
        }
        // Store in main map
        this.data.set(id, entry);
        // Update type index
        this.typeIndexes.get(entry.type)?.add(id);
        // Update special indexes
        this.updateSpecialIndexes(entry);
    }
    /**
     * Type guard for StorageEntry
     */
    isStorageEntry(item) {
        return item &&
            typeof item === 'object' &&
            'type' in item &&
            'data' in item &&
            'id' in item &&
            'timestamp' in item;
    }
    /**
     * Update special indexes based on data type
     */
    updateSpecialIndexes(entry) {
        switch (entry.type) {
            case DataTypeTag.THOUGHT:
                const thought = entry.data;
                if (!thought.isRevision) {
                    this.thoughtSequence.push(entry.id);
                }
                break;
            case DataTypeTag.COLLABORATIVE:
                const collab = entry.data;
                if (!this.collaborativeSessions.has(collab.sessionId)) {
                    this.collaborativeSessions.set(collab.sessionId, new Set());
                }
                this.collaborativeSessions.get(collab.sessionId)?.add(entry.id);
                break;
            case DataTypeTag.VISUAL:
                const visual = entry.data;
                if (!this.visualDiagrams.has(visual.diagramId)) {
                    this.visualDiagrams.set(visual.diagramId, new Set());
                }
                this.visualDiagrams.get(visual.diagramId)?.add(entry.id);
                break;
            case DataTypeTag.DECISION:
                const decision = entry.data;
                this.decisionIndex.set(decision.decisionId, entry.id);
                break;
            case DataTypeTag.SCIENTIFIC:
                const inquiry = entry.data;
                this.inquiryIndex.set(inquiry.inquiryId, entry.id);
                break;
        }
    }
    /**
     * Get all items of a specific type
     */
    getByType(type) {
        const ids = this.typeIndexes.get(type);
        if (!ids)
            return [];
        const results = [];
        ids.forEach(id => {
            const entry = this.data.get(id);
            if (entry) {
                results.push(entry.data);
            }
        });
        return results;
    }
    /**
     * Get all items (returns StorageEntry objects)
     */
    getAll() {
        return Array.from(this.data.values());
    }
    /**
     * Clear all data and indexes
     */
    clear() {
        this.data.clear();
        this.typeIndexes.forEach(index => index.clear());
        this.thoughtSequence = [];
        this.collaborativeSessions.clear();
        this.visualDiagrams.clear();
        this.decisionIndex.clear();
        this.inquiryIndex.clear();
    }
    // Type-safe getters for specific data types
    getThoughts() {
        return this.getByType(DataTypeTag.THOUGHT);
    }
    getMentalModels() {
        return this.getByType(DataTypeTag.MENTAL_MODEL);
    }
    getDebuggingSessions() {
        return this.getByType(DataTypeTag.DEBUGGING);
    }
    getCollaborativeSessions() {
        return this.getByType(DataTypeTag.COLLABORATIVE);
    }
    getDecisions() {
        return this.getByType(DataTypeTag.DECISION);
    }
    getMetacognitiveSessions() {
        return this.getByType(DataTypeTag.METACOGNITIVE);
    }
    getScientificInquiries() {
        return this.getByType(DataTypeTag.SCIENTIFIC);
    }
    getCreativeSessions() {
        return this.getByType(DataTypeTag.CREATIVE);
    }
    getSystemsAnalyses() {
        return this.getByType(DataTypeTag.SYSTEMS);
    }
    getVisualOperations() {
        return this.getByType(DataTypeTag.VISUAL);
    }
    getArguments() {
        const args = this.getByType(DataTypeTag.ARGUMENT);
        const socratic = this.getByType(DataTypeTag.SOCRATIC);
        return [...args, ...socratic];
    }
    // Special accessors using indexes
    /**
     * Get ordered thought sequence
     */
    getThoughtSequence() {
        return this.thoughtSequence.map(id => {
            const entry = this.data.get(id);
            return entry?.data;
        }).filter(Boolean);
    }
    /**
     * Get collaborative session by ID
     */
    getCollaborativeSession(sessionId) {
        const ids = this.collaborativeSessions.get(sessionId);
        if (!ids || ids.size === 0)
            return undefined;
        const firstId = ids.values().next().value;
        if (!firstId)
            return undefined;
        const entry = this.data.get(firstId);
        return entry?.data;
    }
    /**
     * Get decision by ID
     */
    getDecision(decisionId) {
        const id = this.decisionIndex.get(decisionId);
        if (!id)
            return undefined;
        const entry = this.data.get(id);
        return entry?.data;
    }
    /**
     * Get scientific inquiry by ID
     */
    getScientificInquiry(inquiryId) {
        const id = this.inquiryIndex.get(inquiryId);
        if (!id)
            return undefined;
        const entry = this.data.get(id);
        return entry?.data;
    }
    /**
     * Get visual diagrams by diagram ID
     */
    getVisualDiagram(diagramId) {
        const ids = this.visualDiagrams.get(diagramId);
        if (!ids)
            return [];
        const results = [];
        ids.forEach(id => {
            const entry = this.data.get(id);
            if (entry) {
                results.push(entry.data);
            }
        });
        return results;
    }
    /**
     * Get statistics by type
     */
    getStatsByType() {
        const stats = {};
        this.typeIndexes.forEach((ids, type) => {
            stats[type] = ids.size;
        });
        return stats;
    }
    /**
     * Export data by type or all data
     */
    exportByType(type) {
        const entries = type
            ? Array.from(this.typeIndexes.get(type) || [])
                .map(id => this.data.get(id))
                .filter(Boolean)
            : this.getAll();
        const exportData = entries.length === 1
            ? entries[0].data
            : entries.map(e => e.data);
        return {
            sessionId: 'unified-export',
            sessionType: type || 'sequential',
            timestamp: new Date().toISOString(),
            data: exportData
        };
    }
    /**
     * Import data from export
     */
    importData(sessionExport) {
        const dataArray = Array.isArray(sessionExport.data)
            ? sessionExport.data
            : [sessionExport.data];
        dataArray.forEach(item => {
            const id = this.generateId(item);
            this.add(id, item);
        });
    }
    /**
     * Generate unique ID for data item
     */
    generateId(data) {
        // Prefer existing identifier if present
        const existingId = this.extractExistingId(data);
        if (existingId)
            return existingId;
        // Generate new ID with type prefix
        const typePrefix = this.getDataType(data);
        return this.generate(typePrefix);
    }
    // ---- Local ID helpers (inlined to avoid separate utility file) ----
    extractExistingId(obj) {
        const idProps = ['id', 'sessionId', 'decisionId', 'inquiryId', 'monitoringId', 'argumentId', 'diagramId'];
        for (const prop of idProps) {
            if (prop in obj && typeof obj[prop] === 'string' && obj[prop]) {
                return obj[prop];
            }
        }
        return null;
    }
    generate(prefix, includeTimestamp = true, randomLength = 9, separator = '-') {
        const parts = [];
        if (prefix)
            parts.push(prefix);
        if (includeTimestamp)
            parts.push(Date.now().toString());
        if (randomLength > 0)
            parts.push(this.generateRandomString(randomLength));
        return parts.join(separator);
    }
    generateRandomString(length) {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * Search across all data types with a predicate
     */
    searchAll(predicate) {
        return this.filter(predicate);
    }
    /**
     * Get recent items across all types
     */
    getRecent(limit = 10) {
        return Array.from(this.data.values())
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
}
//# sourceMappingURL=UnifiedStore.js.map