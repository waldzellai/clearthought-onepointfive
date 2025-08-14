/**
 * Main session state management class for the Clear Thought MCP server
 *
 * This class manages all thinking session data and provides centralized
 * access to different types of thinking tools and their data.
 */
// Import unified store
import { UnifiedStore } from './stores/UnifiedStore.js';
import { PDRKnowledgeGraph } from './PDRKnowledgeGraph.js';
/**
 * Main session state class
 */
export class SessionState {
    /** Expose config via getter */
    getConfig() { return this.config; }
    /** Expose unified store via getter (read-only reference) */
    getStore() { return this.unifiedStore; }
    /**
     * Create a new session state
     * @param sessionId - Unique identifier for this session
     * @param config - Server configuration
     */
    constructor(sessionId, config) {
        /** PDR Knowledge Graphs for sessions */
        this.pdrGraphs = new Map();
        /** PDR Sessions */
        this.pdrSessions = new Map();
        /** OODA Loop Sessions */
        this.oodaSessions = new Map();
        /** Ulysses Protocol Sessions */
        this.ulyssesSessions = new Map();
        /** Metagame KPI tracking */
        this.metagameKPIs = new Map();
        this.sessionId = sessionId;
        this.config = config;
        this.createdAt = new Date();
        this.lastAccessedAt = new Date();
        // Initialize unified store
        this.unifiedStore = new UnifiedStore(config.persistenceEnabled ? { persistenceDir: config.persistenceDir, knowledgeGraphFile: config.knowledgeGraphFile } : undefined);
        // Start timeout timer
        this.resetTimeout();
    }
    /**
     * Reset the session timeout
     */
    resetTimeout() {
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }
        this.timeoutTimer = setTimeout(() => {
            this.cleanup();
        }, this.config.sessionTimeout);
        this.lastAccessedAt = new Date();
    }
    /**
     * Touch the session to prevent timeout
     */
    touch() {
        this.resetTimeout();
    }
    // ============================================================================
    // Thought Management
    // ============================================================================
    /**
     * Add a new thought
     * @param thought - The thought data
     * @returns True if added, false if limit reached
     */
    addThought(thought) {
        this.touch();
        // Check thought limit
        if (this.unifiedStore.getByType('thought').length >= this.config.maxThoughtsPerSession) {
            return false;
        }
        const id = `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: 'thought', data: thought });
        return true;
    }
    /**
     * Get all thoughts
     */
    getThoughts() {
        this.touch();
        return this.unifiedStore.getByType('thought').map(item => item.data);
    }
    /**
     * Get remaining thought capacity
     */
    getRemainingThoughts() {
        return Math.max(0, this.config.maxThoughtsPerSession - this.unifiedStore.getByType('thought').length);
    }
    // ============================================================================
    // Mental Model Management
    // ============================================================================
    /**
     * Add a mental model application
     */
    addMentalModel(model) {
        this.touch();
        const id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: 'mental_model', data: model });
    }
    /**
     * Get all mental model applications
     */
    getMentalModels() {
        this.touch();
        return this.unifiedStore.getByType('mental_model').map(item => item.data);
    }
    // ============================================================================
    // Debugging Management
    // ============================================================================
    /**
     * Add a debugging session
     */
    addDebuggingSession(session) {
        this.touch();
        const id = `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: 'debugging', data: session });
    }
    /**
     * Get all debugging sessions
     */
    getDebuggingSessions() {
        this.touch();
        return this.unifiedStore.getByType('debugging').map(item => item.data);
    }
    // ============================================================================
    // Collaborative Reasoning Management
    // ============================================================================
    /**
     * Add a collaborative session
     */
    addCollaborativeSession(session) {
        this.touch();
        const id = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: 'collaborative', data: session });
    }
    /**
     * Get all collaborative sessions
     */
    getCollaborativeSessions() {
        this.touch();
        return this.unifiedStore.getByType('collaborative').map(item => item.data);
    }
    /**
     * Get a specific collaborative session by ID
     */
    getCollaborativeSession(sessionId) {
        this.touch();
        const items = this.unifiedStore.getByType('collaborative');
        return items.find(item => item.data.sessionId === sessionId)?.data;
    }
    // ============================================================================
    // Decision Framework Management
    // ============================================================================
    /**
     * Add a decision session
     */
    addDecision(decision) {
        this.touch();
        const id = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: 'decision', data: decision });
    }
    /**
     * Get all decision sessions
     */
    getDecisions() {
        this.touch();
        return this.unifiedStore.getByType('decision').map(item => item.data);
    }
    /**
     * Get a specific decision by ID
     */
    getDecision(decisionId) {
        this.touch();
        const items = this.unifiedStore.getByType('decision');
        return items.find(item => item.data.decisionId === decisionId)?.data;
    }
    // ============================================================================
    // Metacognitive Monitoring Management
    // ============================================================================
    /**
     * Add a metacognitive monitoring session
     */
    addMetacognitive(session) {
        this.touch();
        const id = `meta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: "metacognitive", data: session });
    }
    /**
     * Get all metacognitive sessions
     */
    getMetacognitiveSessions() {
        this.touch();
        return this.unifiedStore.getByType("metacognitive").map(item => item.data);
    }
    /**
     * Get a specific metacognitive session by ID
     */
    getMetacognitiveSession(monitoringId) {
        this.touch();
        const items = this.unifiedStore.getByType("metacognitive");
        return items.find(item => item.data.monitoringId === monitoringId)?.data;
    }
    // ============================================================================
    // Scientific Method Management
    // ============================================================================
    /**
     * Add a scientific inquiry session
     */
    addScientificInquiry(inquiry) {
        this.touch();
        const id = `sci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: "scientific", data: inquiry });
    }
    /**
     * Get all scientific inquiry sessions
     */
    getScientificInquiries() {
        this.touch();
        return this.unifiedStore.getByType("scientific").map(item => item.data);
    }
    /**
     * Get a specific scientific inquiry by ID
     */
    getScientificInquiry(inquiryId) {
        this.touch();
        const items = this.unifiedStore.getByType("scientific");
        return items.find(item => item.data.inquiryId === inquiryId)?.data;
    }
    // ============================================================================
    // Creative Thinking Management
    // ============================================================================
    /**
     * Add a creative thinking session
     */
    addCreativeSession(session) {
        this.touch();
        const id = `creative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: "creative", data: session });
    }
    /**
     * Get all creative sessions
     */
    getCreativeSessions() {
        this.touch();
        return this.unifiedStore.getByType("creative").map(item => item.data);
    }
    // ============================================================================
    // Systems Thinking Management
    // ============================================================================
    /**
     * Add a systems thinking session
     */
    addSystemsAnalysis(system) {
        this.touch();
        const id = `systems-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: "systems", data: system });
    }
    /**
     * Get all systems analyses
     */
    getSystemsAnalyses() {
        this.touch();
        return this.unifiedStore.getByType("systems").map(item => item.data);
    }
    // ============================================================================
    // Visual Reasoning Management
    // ============================================================================
    /**
     * Add a visual reasoning operation
     */
    addVisualOperation(visual) {
        this.touch();
        const id = `visual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.unifiedStore.add(id, { type: "visual", data: visual });
    }
    /**
     * Get all visual operations
     */
    getVisualOperations() {
        this.touch();
        return this.unifiedStore.getByType("visual").map(item => item.data);
    }
    /**
     * Get visual operations for a specific diagram
     */
    getVisualDiagram(diagramId) {
        this.touch();
        const items = this.unifiedStore.getByType("visual");
        return items.filter(item => item.data.diagramId === diagramId).map(item => item.data);
    }
    // ============================================================================
    // PDR Knowledge Graph Support
    // ============================================================================
    /**
     * Get or create a PDR knowledge graph for a session
     */
    getPDRGraph(graphId, mode) {
        this.touch();
        const id = graphId || this.sessionId;
        if (!this.pdrGraphs.has(id)) {
            this.pdrGraphs.set(id, new PDRKnowledgeGraph(id, mode || 'standard'));
        }
        return this.pdrGraphs.get(id);
    }
    /**
     * Set a PDR knowledge graph
     */
    setPDRGraph(graphId, graph) {
        this.touch();
        this.pdrGraphs.set(graphId, graph);
    }
    /**
     * Get or create a PDR session
     */
    getPDRSession(sessionId) {
        this.touch();
        const id = sessionId || this.sessionId;
        return this.pdrSessions.get(id);
    }
    /**
     * Set a PDR session
     */
    setPDRSession(sessionId, session) {
        this.touch();
        this.pdrSessions.set(sessionId, session);
    }
    /**
     * Serialize PDR graph for persistence
     */
    serializePDRGraph(graphId) {
        const id = graphId || this.sessionId;
        const graph = this.pdrGraphs.get(id);
        return graph ? graph.serialize() : undefined;
    }
    /**
     * Deserialize PDR graph from storage
     */
    deserializePDRGraph(data, graphId) {
        const graph = PDRKnowledgeGraph.deserialize(data);
        const id = graphId || this.sessionId;
        this.pdrGraphs.set(id, graph);
    }
    // ============================================================================
    // Argumentation Support (Socratic method uses ArgumentData)
    // ============================================================================
    /**
     * Add a Socratic/argumentation session
     * Note: Since SocraticData extends ArgumentData, we can store it directly
     */
    addArgumentation(argument) {
        this.touch();
        const isSocratic = argument.question !== undefined || argument.stage !== undefined;
        if (isSocratic) {
            const id = `socratic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            this.unifiedStore.add(id, { type: 'socratic', data: argument });
        }
        else {
            const id = `argument-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            this.unifiedStore.add(id, { type: 'argument', data: argument });
        }
    }
    // ============================================================================
    // Statistics and Export
    // ============================================================================
    /**
     * Get comprehensive session statistics
     */
    getStats() {
        this.touch();
        const toolsUsed = new Set();
        let totalOperations = 0;
        // Get statistics from unified store
        const stats = this.unifiedStore.getStats();
        // Check which tools have been used
        if (stats.thought > 0) {
            toolsUsed.add('sequential-thinking');
            totalOperations += stats.thought;
        }
        if (stats.mental_model > 0) {
            toolsUsed.add('mental-models');
            totalOperations += stats.mental_model;
        }
        if (stats.debugging > 0) {
            toolsUsed.add('debugging');
            totalOperations += stats.debugging;
        }
        if (stats.collaborative > 0) {
            toolsUsed.add('collaborative-reasoning');
            totalOperations += stats.collaborative;
        }
        if (stats.decision > 0) {
            toolsUsed.add('decision-framework');
            totalOperations += stats.decision;
        }
        if (stats.metacognitive > 0) {
            toolsUsed.add('metacognitive-monitoring');
            totalOperations += stats.metacognitive;
        }
        if (stats.scientific > 0) {
            toolsUsed.add('scientific-method');
            totalOperations += stats.scientific;
        }
        if (stats.creative > 0) {
            toolsUsed.add('creative-thinking');
            totalOperations += stats.creative;
        }
        if (stats.systems > 0) {
            toolsUsed.add('systems-thinking');
            totalOperations += stats.systems;
        }
        if (stats.visual > 0) {
            toolsUsed.add('visual-reasoning');
            totalOperations += stats.visual;
        }
        if (stats.argument > 0) {
            toolsUsed.add('argumentation');
            totalOperations += stats.argument;
        }
        if (stats.socratic > 0) {
            toolsUsed.add('socratic-method');
            totalOperations += stats.socratic;
        }
        return {
            sessionId: this.sessionId,
            createdAt: this.createdAt,
            lastAccessedAt: this.lastAccessedAt,
            thoughtCount: stats.thought || 0,
            toolsUsed: Array.from(toolsUsed),
            totalOperations,
            isActive: !!this.timeoutTimer,
            remainingThoughts: this.getRemainingThoughts(),
            stores: stats
        };
    }
    /**
     * Export session data
     * @param storeType - Optional specific store to export
     * @returns Exportable session data
     */
    export(storeType) {
        this.touch();
        const baseExport = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };
        // Export specific store if requested
        if (storeType) {
            const exports = [];
            switch (storeType) {
                case 'thoughts':
                    this.unifiedStore.getByType('thought').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'sequential',
                            data: item.data
                        });
                    });
                    break;
                case 'mentalModels':
                    this.unifiedStore.getByType('mental_model').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'mental-model',
                            data: item.data
                        });
                    });
                    break;
                case 'debugging':
                    this.unifiedStore.getByType('debugging').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'debugging',
                            data: item.data
                        });
                    });
                    break;
                case 'collaborative':
                    this.unifiedStore.getByType('collaborative').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'collaborative',
                            data: item.data
                        });
                    });
                    break;
                case 'decisions':
                    this.unifiedStore.getByType('decision').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'decision',
                            data: item.data
                        });
                    });
                    break;
                case 'metacognitive':
                    this.unifiedStore.getByType('metacognitive').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'metacognitive',
                            data: item.data
                        });
                    });
                    break;
                case 'scientific':
                    this.unifiedStore.getByType('scientific').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'scientific',
                            data: item.data
                        });
                    });
                    break;
                case 'creative':
                    this.unifiedStore.getByType('creative').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'creative',
                            data: item.data
                        });
                    });
                    break;
                case 'systems':
                    this.unifiedStore.getByType('systems').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'systems',
                            data: item.data
                        });
                    });
                    break;
                case 'visual':
                    this.unifiedStore.getByType('visual').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'visual',
                            data: item.data
                        });
                    });
                    break;
                case 'argument':
                    this.unifiedStore.getByType('argument').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'argument',
                            data: item.data
                        });
                    });
                    break;
                case 'socratic':
                    this.unifiedStore.getByType('socratic').forEach(item => {
                        exports.push({
                            ...baseExport,
                            sessionType: 'socratic',
                            data: item.data
                        });
                    });
                    break;
            }
            return exports.length === 1 ? exports[0] : exports;
        }
        // Export all data
        const allExports = [];
        // Add exports from all stores
        this.unifiedStore.getByType('thought').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'sequential',
                data: item.data
            });
        });
        this.unifiedStore.getByType('mental_model').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'mental-model',
                data: item.data
            });
        });
        this.unifiedStore.getByType('debugging').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'debugging',
                data: item.data
            });
        });
        this.unifiedStore.getByType('collaborative').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'collaborative',
                data: item.data
            });
        });
        this.unifiedStore.getByType('decision').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'decision',
                data: item.data
            });
        });
        this.unifiedStore.getByType('metacognitive').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'metacognitive',
                data: item.data
            });
        });
        this.unifiedStore.getByType('scientific').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'scientific',
                data: item.data
            });
        });
        this.unifiedStore.getByType('creative').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'creative',
                data: item.data
            });
        });
        this.unifiedStore.getByType('systems').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'systems',
                data: item.data
            });
        });
        this.unifiedStore.getByType('visual').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'visual',
                data: item.data
            });
        });
        this.unifiedStore.getByType('argument').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'argument',
                data: item.data
            });
        });
        this.unifiedStore.getByType('socratic').forEach(item => {
            allExports.push({
                ...baseExport,
                sessionType: 'socratic',
                data: item.data
            });
        });
        return allExports;
    }
    /**
     * Import session data
     * @param data - The session export data to import
     */
    import(data) {
        this.touch();
        const imports = Array.isArray(data) ? data : [data];
        imports.forEach(item => {
            switch (item.sessionType) {
                case 'sequential':
                    this.addThought(item.data);
                    break;
                case 'mental-model':
                    this.addMentalModel(item.data);
                    break;
                case 'debugging':
                    this.addDebuggingSession(item.data);
                    break;
                case 'collaborative':
                    this.addCollaborativeSession(item.data);
                    break;
                case 'decision':
                    this.addDecision(item.data);
                    break;
                case 'metacognitive':
                    this.addMetacognitive(item.data);
                    break;
                case 'scientific':
                    this.addScientificInquiry(item.data);
                    break;
                case 'creative':
                    this.addCreativeSession(item.data);
                    break;
                case 'systems':
                    this.addSystemsAnalysis(item.data);
                    break;
                case 'visual':
                    this.addVisualOperation(item.data);
                    break;
                case 'argument':
                    this.addArgumentation(item.data);
                    break;
                case 'socratic':
                    this.addArgumentation(item.data);
                    break;
            }
        });
    }
    /**
     * Cleanup session data and stop timers
     */
    cleanup() {
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        // Clear unified store
        this.unifiedStore.clear();
    }
    /**
     * Check if session is still active
     */
    isActive() {
        return !!this.timeoutTimer;
    }
    // ============= Metagame Session Management =============
    /**
     * Create or get an OODA Loop session
     */
    getOODASession(sessionId) {
        return this.oodaSessions.get(sessionId);
    }
    setOODASession(sessionId, session) {
        this.oodaSessions.set(sessionId, session);
        this.resetTimeout();
    }
    /**
     * Create or get a Ulysses Protocol session
     */
    getUlyssesSession(sessionId) {
        return this.ulyssesSessions.get(sessionId);
    }
    setUlyssesSession(sessionId, session) {
        this.ulyssesSessions.set(sessionId, session);
        this.resetTimeout();
    }
    /**
     * Track KPI metrics for metagames
     */
    updateKPI(key, value, label, target, direction) {
        const existing = this.metagameKPIs.get(key);
        const timestamp = new Date().toISOString();
        if (existing) {
            existing.value = value;
            existing.history.push({ timestamp, value });
            // Keep only last 100 history entries
            if (existing.history.length > 100) {
                existing.history = existing.history.slice(-100);
            }
        }
        else {
            this.metagameKPIs.set(key, {
                key,
                label: label || key,
                value,
                target,
                direction: direction || 'up',
                history: [{ timestamp, value }]
            });
        }
        this.resetTimeout();
    }
    /**
     * Get all KPIs or a specific one
     */
    getKPIs(key) {
        if (key) {
            return this.metagameKPIs.get(key);
        }
        return Array.from(this.metagameKPIs.values());
    }
    /**
     * Clear metagame sessions
     */
    clearMetagameSessions() {
        this.oodaSessions.clear();
        this.ulyssesSessions.clear();
        this.metagameKPIs.clear();
        this.resetTimeout();
    }
}
