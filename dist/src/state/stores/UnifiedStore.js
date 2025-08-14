/**
 * Unified store for all Clear Thought data
 *
 * Consolidates all individual stores into a single, unified data store
 * that manages all types of reasoning data through a single interface.
 */
import fs from 'fs';
import path from 'path';
/**
 * Unified store that manages all Clear Thought data types
 */
export class UnifiedStore {
    constructor(options) {
        this.data = new Map();
        this.knowledgeGraph = {
            nodes: [],
            edges: [],
            version: '1',
            updatedAt: new Date().toISOString()
        };
        this.persistenceDir = options?.persistenceDir;
        this.knowledgeGraphFile = options?.knowledgeGraphFile;
        if (this.persistenceDir) {
            try {
                fs.mkdirSync(this.persistenceDir, { recursive: true });
            }
            catch { }
        }
        this.loadFromDisk();
    }
    /**
     * Add data to the store
     */
    add(id, item) {
        this.data.set(id, item);
        this.indexIntoKnowledgeGraph(id, item);
        this.saveToDiskDebounced();
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
        this.knowledgeGraph = { nodes: [], edges: [], version: '1', updatedAt: new Date().toISOString() };
        this.saveToDiskDebounced();
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
        this.saveToDiskDebounced();
    }
    /**
     * Basic tagging on nodes; ensures node exists with label
     */
    tagNode(nodeId, label) {
        const node = this.knowledgeGraph.nodes.find(n => n.id === nodeId);
        if (node) {
            node.labels = Array.from(new Set([...(node.labels || []), label]));
            this.saveKnowledgeGraph();
        }
    }
    /**
     * Adds or updates a relation in the knowledge graph
     */
    relate(fromId, toId, relation, properties) {
        const id = `${fromId}::${relation}::${toId}`;
        const existing = this.knowledgeGraph.edges.find(e => e.id === id);
        if (existing) {
            existing.properties = { ...(existing.properties || {}), ...(properties || {}) };
        }
        else {
            this.knowledgeGraph.edges.push({ id, from: fromId, to: toId, relation, properties });
        }
        this.saveKnowledgeGraph();
    }
    /**
     * Returns a snapshot of the knowledge graph
     */
    getKnowledgeGraph() {
        return this.knowledgeGraph;
    }
    saveToDiskDebounced() {
        if (!this.persistenceDir)
            return;
        if (this.debounceTimer)
            clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.saveToDisk(), 300);
    }
    saveToDisk() {
        if (!this.persistenceDir)
            return;
        const dataPath = path.join(this.persistenceDir, 'unified-store.json');
        const graphPath = path.join(this.persistenceDir, this.knowledgeGraphFile || 'knowledge-graph.json');
        try {
            fs.writeFileSync(dataPath, JSON.stringify([...this.data.entries()], null, 2));
        }
        catch { }
        try {
            this.saveKnowledgeGraph(graphPath);
        }
        catch { }
    }
    saveKnowledgeGraph(customPath) {
        if (!this.persistenceDir)
            return;
        const graphPath = customPath || path.join(this.persistenceDir, this.knowledgeGraphFile || 'knowledge-graph.json');
        this.knowledgeGraph.updatedAt = new Date().toISOString();
        try {
            fs.writeFileSync(graphPath, JSON.stringify(this.knowledgeGraph, null, 2));
        }
        catch { }
    }
    loadFromDisk() {
        if (!this.persistenceDir)
            return;
        const dataPath = path.join(this.persistenceDir, 'unified-store.json');
        const graphPath = path.join(this.persistenceDir, this.knowledgeGraphFile || 'knowledge-graph.json');
        try {
            if (fs.existsSync(dataPath)) {
                const raw = fs.readFileSync(dataPath, 'utf-8');
                const entries = JSON.parse(raw);
                this.data = new Map(entries);
            }
        }
        catch { }
        try {
            if (fs.existsSync(graphPath)) {
                const raw = fs.readFileSync(graphPath, 'utf-8');
                this.knowledgeGraph = JSON.parse(raw);
            }
        }
        catch { }
    }
    // ---------------------------------------------------------------------------
    // Minimal semantic indexing placeholder
    // ---------------------------------------------------------------------------
    indexIntoKnowledgeGraph(id, item) {
        // Ensure node exists
        const existing = this.knowledgeGraph.nodes.find(n => n.id === id);
        if (!existing) {
            this.knowledgeGraph.nodes.push({ id, type: item.type, properties: {} });
        }
        // Lightweight relations by session-like keys when present
        const props = item.data || {};
        const maybeSessionId = props.sessionId || props.decisionId || props.monitoringId || props.inquiryId || props.diagramId;
        if (maybeSessionId) {
            const sessionNodeId = `session:${maybeSessionId}`;
            if (!this.knowledgeGraph.nodes.find(n => n.id === sessionNodeId)) {
                this.knowledgeGraph.nodes.push({ id: sessionNodeId, type: 'concept', labels: ['session'] });
            }
            this.relate(sessionNodeId, id, 'HAS_ITEM');
        }
        // Tag by type
        this.tagNode(id, item.type);
    }
}
