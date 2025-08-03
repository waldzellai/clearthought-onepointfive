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
 * Unified store that manages all Clear Thought data types
 */
export class UnifiedStore {
  private data = new Map<string, ClearThoughtData>();

  constructor() {
  }

  /**
   * Add data to the store
   */
  add(id: string, item: ClearThoughtData): void {
    this.data.set(id, item);
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
  }
} 