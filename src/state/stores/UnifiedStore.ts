/**
 * Unified store for all Clear Thought data
 * 
 * Consolidates all individual stores into a single, unified data store
 * that manages all types of reasoning data through a single interface.
 */


import { 
  ThoughtData, 
  MentalModelData, 
  DebuggingSession,
  CollaborativeSession,
  DecisionData,
  MetacognitiveData,
  ScientificInquiryData,
  CreativeData,
  SystemsData,
  VisualData,
  ArgumentData,
  SocraticData
} from '../../types/index.js';
import fs from 'fs';
import path from 'path';

/**
 * Union type for all possible data types
 */
export type ClearThoughtData = 
  | { type: 'thought'; data: ThoughtData }
  | { type: 'mental_model'; data: MentalModelData }
  | { type: 'debugging'; data: DebuggingSession }
  | { type: 'collaborative'; data: CollaborativeSession }
  | { type: 'decision'; data: DecisionData }
  | { type: 'metacognitive'; data: MetacognitiveData }
  | { type: 'scientific'; data: ScientificInquiryData }
  | { type: 'creative'; data: CreativeData }
  | { type: 'systems'; data: SystemsData }
  | { type: 'visual'; data: VisualData }
  | { type: 'argument'; data: ArgumentData }
  | { type: 'socratic'; data: SocraticData };

/**
 * Minimal knowledge graph structures
 */
export interface KnowledgeNode {
  id: string;
  type: ClearThoughtData['type'] | 'source' | 'concept' | 'evidence';
  labels?: string[];
  properties?: Record<string, any>;
}

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphSnapshot {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  version: string;
  updatedAt: string;
}

/**
 * Unified store that manages all Clear Thought data types
 */
export class UnifiedStore {
  private data = new Map<string, ClearThoughtData>();
  private persistenceDir?: string;
  private knowledgeGraphFile?: string;
  private knowledgeGraph: KnowledgeGraphSnapshot = {
    nodes: [],
    edges: [],
    version: '1',
    updatedAt: new Date().toISOString()
  };

  constructor(options?: { persistenceDir?: string; knowledgeGraphFile?: string }) {
    this.persistenceDir = options?.persistenceDir;
    this.knowledgeGraphFile = options?.knowledgeGraphFile;
    if (this.persistenceDir) {
      try {
        fs.mkdirSync(this.persistenceDir, { recursive: true });
      } catch {}
    }
    this.loadFromDisk();
  }

  /**
   * Add data to the store
   */
  add(id: string, item: ClearThoughtData): void {
    this.data.set(id, item);
    this.indexIntoKnowledgeGraph(id, item);
    this.saveToDiskDebounced();
  }

  /**
   * Get all items of a specific type
   */
  getByType<T extends ClearThoughtData['type']>(type: T): Extract<ClearThoughtData, { type: T }>[] {
    return Array.from(this.data.values())
      .filter(item => item.type === type) as Extract<ClearThoughtData, { type: T }>[];
  }

  /**
   * Get all items
   */
  getAll(): ClearThoughtData[] {
    return Array.from(this.data.values());
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear();
    this.knowledgeGraph = { nodes: [], edges: [], version: '1', updatedAt: new Date().toISOString() };
    this.saveToDiskDebounced();
  }

  /**
   * Get statistics for all data types
   */
  getStats() {
    const stats: Record<string, number> = {};
    this.data.forEach(item => {
      stats[item.type] = (stats[item.type] || 0) + 1;
    });
    return stats;
  }

  /**
   * Export all data organized by type
   */
  exportByType(): Record<string, any[]> {
    const result: Record<string, any[]> = {};
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
  importByType(data: Record<string, any[]>): void {
    this.clear();
    Object.entries(data).forEach(([type, items]) => {
      items.forEach((itemData, index) => {
        const id = `${type}_${Date.now()}_${index}`;
        this.add(id, { type: type as ClearThoughtData['type'], data: itemData });
      });
    });
    this.saveToDiskDebounced();
  }

  /**
   * Basic tagging on nodes; ensures node exists with label
   */
  tagNode(nodeId: string, label: string) {
    const node = this.knowledgeGraph.nodes.find(n => n.id === nodeId);
    if (node) {
      node.labels = Array.from(new Set([...(node.labels || []), label]));
      this.saveKnowledgeGraph();
    }
  }

  /**
   * Adds or updates a relation in the knowledge graph
   */
  relate(fromId: string, toId: string, relation: string, properties?: Record<string, any>) {
    const id = `${fromId}::${relation}::${toId}`;
    const existing = this.knowledgeGraph.edges.find(e => e.id === id);
    if (existing) {
      existing.properties = { ...(existing.properties || {}), ...(properties || {}) };
    } else {
      this.knowledgeGraph.edges.push({ id, from: fromId, to: toId, relation, properties });
    }
    this.saveKnowledgeGraph();
  }

  /**
   * Returns a snapshot of the knowledge graph
   */
  getKnowledgeGraph(): KnowledgeGraphSnapshot {
    return this.knowledgeGraph;
  }

  // ---------------------------------------------------------------------------
  // Persistence helpers
  // ---------------------------------------------------------------------------

  private debounceTimer?: NodeJS.Timeout;
  private saveToDiskDebounced() {
    if (!this.persistenceDir) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.saveToDisk(), 300);
  }

  private saveToDisk() {
    if (!this.persistenceDir) return;
    const dataPath = path.join(this.persistenceDir, 'unified-store.json');
    const graphPath = path.join(
      this.persistenceDir,
      this.knowledgeGraphFile || 'knowledge-graph.json'
    );
    try {
      fs.writeFileSync(dataPath, JSON.stringify([...this.data.entries()], null, 2));
    } catch {}
    try {
      this.saveKnowledgeGraph(graphPath);
    } catch {}
  }

  private saveKnowledgeGraph(customPath?: string) {
    if (!this.persistenceDir) return;
    const graphPath = customPath || path.join(
      this.persistenceDir,
      this.knowledgeGraphFile || 'knowledge-graph.json'
    );
    this.knowledgeGraph.updatedAt = new Date().toISOString();
    try {
      fs.writeFileSync(graphPath, JSON.stringify(this.knowledgeGraph, null, 2));
    } catch {}
  }

  private loadFromDisk() {
    if (!this.persistenceDir) return;
    const dataPath = path.join(this.persistenceDir, 'unified-store.json');
    const graphPath = path.join(
      this.persistenceDir,
      this.knowledgeGraphFile || 'knowledge-graph.json'
    );
    try {
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const entries: [string, ClearThoughtData][] = JSON.parse(raw);
        this.data = new Map(entries);
      }
    } catch {}
    try {
      if (fs.existsSync(graphPath)) {
        const raw = fs.readFileSync(graphPath, 'utf-8');
        this.knowledgeGraph = JSON.parse(raw);
      }
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // Minimal semantic indexing placeholder
  // ---------------------------------------------------------------------------

  private indexIntoKnowledgeGraph(id: string, item: ClearThoughtData) {
    // Ensure node exists
    const existing = this.knowledgeGraph.nodes.find(n => n.id === id);
    if (!existing) {
      this.knowledgeGraph.nodes.push({ id, type: item.type, properties: {} });
    }

    // Lightweight relations by session-like keys when present
    const props: Record<string, any> = (item.data as any) || {};
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