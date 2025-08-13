/**
 * Progressive Deep Reasoning (PDR) Types
 * Based on Deep Research methodology for multi-pass exploration
 */

export type PDRApproach = 'sequential' | 'tree' | 'beam' | 'mcts' | 'graph' | 'auto';

export type EdgeType = 
  | 'supports'      
  | 'contradicts'   
  | 'refines'       
  | 'questions'     
  | 'leads-to'      
  | 'relates-to'    
  | 'derived-from'  
  | 'clusters-with';

export type NodeType = 'subject' | 'concept' | 'evidence' | 'question' | 'insight';

export interface PDRNode {
  id: string;
  content: string;
  type: NodeType;
  
  // Hierarchical properties
  depth: number;
  parentId?: string;
  childrenIds: Set<string>;
  
  // Graph properties
  incomingEdges: Set<string>;
  outgoingEdges: Set<string>;
  
  // Scoring and metadata
  scores: {
    confidence: number;
    centrality: number;
    passScores: Map<string, number>;
  };
  
  metadata: {
    createdInPass: string;
    lastModified: string;
    tags: Set<string>;
    patternUsed?: PDRApproach;
    selected: boolean;
  };
  
  // Content artifacts
  artifacts?: {
    reasoning?: string;
    evidence?: string[];
    citations?: Citation[];
  };
}

export interface PDREdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number;
  
  metadata: {
    createdInPass: string;
    confidence: number;
    justification?: string;
    bidirectional: boolean;
  };
}

export interface Citation {
  source: string;
  confidence: number;
  excerpt?: string;
}

export interface PDRSubject {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  passScores: Record<string, number>;
  confidence?: number;
  selected?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PDRSelectionCriteria {
  minScore?: number;
  topK?: number;
  diversity?: number;
  custom?: string;
}

export interface PDRPassPolicy {
  id: string;
  name: 'scan' | 'cluster' | 'select' | 'deepen' | 'synthesize';
  defaultApproach?: PDRApproach;
  perSubjectApproach?: {
    rules?: Array<{
      when: string;
      use: PDRApproach;
    }>;
    fallback?: PDRApproach;
  };
  selection?: PDRSelectionCriteria;
  budget?: {
    subjectsLimit?: number;
    timeMs?: number;
  };
}

export interface PDRPassTrace {
  id: string;
  policyId: string;
  startedAt: string;
  completedAt?: string;
  processedSubjectIds: string[];
  approachBySubject: Record<string, PDRApproach>;
  resultsBySubject: Record<string, {
    score?: number;
    confidence?: number;
    notes?: string;
    artifacts?: Array<{ 
      kind: 'markdown' | 'mermaid' | 'json' | 'code'; 
      content: string;
    }>;
  }>;
}

export interface PDRSession {
  id: string;
  subjects: Map<string, PDRSubject>;
  passes: PDRPassPolicy[];
  traces: PDRPassTrace[];
  maxPasses: number;
  globalSelection?: PDRSelectionCriteria;
  stopConditions?: {
    maxTimeMs?: number;
    minImprovement?: number;
    confidenceThreshold?: number;
  };
  summary?: {
    chosenSubjectIds: string[];
    synthesis?: string;
    decisions?: Array<{ 
      subjectId: string; 
      decision: string; 
      rationale?: string;
    }>;
  };
}

export interface KnowledgeGap {
  type: 'missing-link' | 'weak-evidence' | 'contradiction' | 'isolated-cluster';
  nodeIds: string[];
  priority: number;
  description: string;
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  avgDegree: number;
  maxDepth: number;
  clusterCount: number;
  gaps: KnowledgeGap[];
}

export interface HierarchicalStructure {
  root: string;
  levels: Map<number, Set<string>>;
  parentChild: Map<string, string[]>;
}

export interface Cluster {
  id: string;
  nodeIds: Set<string>;
  centroid?: string;
  coherence: number;
}