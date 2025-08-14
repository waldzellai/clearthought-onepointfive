# Sequential Thinking Patterns: Advanced Reasoning Structures Specification

## Overview

This specification details how to extend the current sequential thinking implementation to support advanced reasoning structures beyond the traditional chain-of-thought approach. The goal is to create a flexible framework that can accommodate various reasoning patterns while maintaining compatibility with the existing MCP (Model Context Protocol) infrastructure.

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Proposed Architecture](#proposed-architecture)
3. [Reasoning Structure Specifications](#reasoning-structure-specifications)
   - [Tree of Thought (ToT)](#tree-of-thought-tot)
   - [Graph of Thought (GoT)](#graph-of-thought-got)
   - [Beam Search Reasoning](#beam-search-reasoning)
   - [Monte Carlo Tree Search (MCTS)](#monte-carlo-tree-search-mcts)
   - [Recursive Reasoning](#recursive-reasoning)
   - [Dialectical Reasoning](#dialectical-reasoning)
   - [Progressive Deep Research (PDR)](#progressive-deep-research-pdr)
4. [Core Interfaces](#core-interfaces)
5. [Implementation Strategy](#implementation-strategy)
6. [Examples](#examples)
7. [Migration Path](#migration-path)

## Current State Analysis

The existing sequential thinking implementation supports:
- Linear chain-of-thought progression
- Basic branching capabilities via `branchFromThought` and `branchId`
- Revision tracking with `isRevision` and `revisesThought`
- Simple thought numbering and total thoughts tracking

### Limitations:
1. **Linear bias**: While branching is supported, the structure is optimized for linear sequences
2. **No evaluation metrics**: No built-in scoring or evaluation of thought paths
3. **Limited exploration**: No support for parallel exploration of multiple paths
4. **No backtracking**: Limited support for systematic backtracking or pruning

## Proposed Architecture

### Core Principles

1. **Extensibility**: Support for multiple reasoning patterns through a common interface
2. **Compatibility**: Maintain backward compatibility with existing sequential thinking
3. **Flexibility**: Allow hybrid approaches combining multiple reasoning patterns
4. **Performance**: Efficient storage and retrieval of complex reasoning structures

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  MCP Server Interface                │
├─────────────────────────────────────────────────────┤
│              Reasoning Pattern Router                │
├─────────────┬───────────┬──────────┬────────────────┤
│   Chain of   │  Tree of  │ Graph of │  Beam Search │
│   Thought    │  Thought  │ Thought  │   & Others   │
├──────────────┴───────────┴──────────┴────────────────┤
│           Common Reasoning Infrastructure            │
│  - Node Management  - Path Tracking  - Evaluation   │
└─────────────────────────────────────────────────────┘
```

## Reasoning Structure Specifications

### Tree of Thought (ToT)

Tree of Thought enables systematic exploration of multiple reasoning paths with explicit branching and evaluation.

#### Key Features:
- Hierarchical thought structure
- Multiple children per node
- Path evaluation and scoring
- Pruning of unpromising branches
- Best-first or depth-first exploration strategies

#### Interface Design:

```typescript
export interface TreeOfThoughtNode {
  id: string;
  content: string;
  parentId?: string;
  childrenIds: string[];
  depth: number;
  score?: number;
  status: 'active' | 'explored' | 'pruned' | 'solution';
  metadata?: {
    explorationStrategy?: 'depth-first' | 'breadth-first' | 'best-first';
    pruningReason?: string;
    confidenceScore?: number;
  };
}

export interface TreeOfThoughtSession {
  rootNodeId: string;
  nodes: Map<string, TreeOfThoughtNode>;
  currentNodeId: string;
  explorationBudget: number;
  evaluationCriteria: string[];
  solutionCriteria: string;
  bestPathIds?: string[];
}
```

### Graph of Thought (GoT)

Graph of Thought allows non-hierarchical connections between thoughts, enabling complex reasoning patterns with cycles and multiple connections.

#### Key Features:
- Directed graph structure
- Multiple connection types (supports, contradicts, refines, etc.)
- Cycle detection and handling
- Path finding algorithms
- Centrality and influence analysis

#### Interface Design:

```typescript
export interface GraphOfThoughtNode {
  id: string;
  content: string;
  nodeType: 'hypothesis' | 'evidence' | 'conclusion' | 'question' | 'insight';
  strength: number; // Node importance/confidence
  metadata?: {
    source?: string;
    timestamp?: string;
    tags?: string[];
  };
}

export interface GraphOfThoughtEdge {
  id: string;
  sourceId: string;
  targetId: string;
  edgeType: 'supports' | 'contradicts' | 'refines' | 'questions' | 'leads-to';
  weight: number; // Connection strength
  bidirectional?: boolean;
  metadata?: {
    justification?: string;
    confidence?: number;
  };
}

export interface GraphOfThoughtSession {
  nodes: Map<string, GraphOfThoughtNode>;
  edges: Map<string, GraphOfThoughtEdge>;
  entryNodeIds: string[]; // Multiple entry points
  currentFocusNodeId?: string;
  explorationPath: string[]; // History of node visits
  analysisMetrics?: {
    centrality: Map<string, number>;
    clusters?: string[][];
    criticalPaths?: string[][];
  };
}
```

### Beam Search Reasoning

Beam search maintains multiple promising paths simultaneously, exploring them in parallel with periodic pruning.

#### Key Features:
- Fixed-width exploration (beam width)
- Parallel path exploration
- Periodic evaluation and pruning
- Convergence detection
- Backtracking support

#### Interface Design:

```typescript
export interface BeamSearchPath {
  id: string;
  nodeIds: string[];
  currentScore: number;
  status: 'active' | 'completed' | 'pruned' | 'merged';
  metadata?: {
    pruningGeneration?: number;
    mergedIntoPathId?: string;
    convergenceMetric?: number;
  };
}

export interface BeamSearchNode {
  id: string;
  content: string;
  pathIds: string[]; // Nodes can belong to multiple paths
  generationNumber: number;
  localScore: number;
}

export interface BeamSearchSession {
  beamWidth: number;
  currentGeneration: number;
  nodes: Map<string, BeamSearchNode>;
  paths: Map<string, BeamSearchPath>;
  activePaths: string[]; // Current beam
  evaluationFunction: string; // Description of scoring method
  convergenceCriteria?: {
    maxGenerations?: number;
    minScoreImprovement?: number;
    consensusThreshold?: number;
  };
}
```

### Monte Carlo Tree Search (MCTS)

MCTS combines tree exploration with random sampling for decision-making under uncertainty.

#### Key Features:
- Selection, expansion, simulation, backpropagation phases
- UCB (Upper Confidence Bound) for exploration vs exploitation
- Rollout policies for simulation
- Visit count and value tracking
- Adaptive exploration

#### Interface Design:

```typescript
export interface MCTSNode {
  id: string;
  content: string;
  parentId?: string;
  childrenIds: string[];
  visits: number;
  totalValue: number;
  averageValue: number;
  ucbScore?: number;
  untried_actions?: string[]; // Potential expansions
  metadata?: {
    simulationPolicy?: string;
    domainSpecificScore?: number;
  };
}

export interface MCTSSession {
  rootNodeId: string;
  nodes: Map<string, MCTSNode>;
  currentSimulationPath?: string[];
  explorationConstant: number; // C in UCB formula
  simulationDepth: number;
  totalSimulations: number;
  bestLeafNodeId?: string;
  rolloutPolicy: 'random' | 'heuristic' | 'neural';
  terminationCriteria: {
    maxSimulations?: number;
    timeLimit?: number;
    confidenceThreshold?: number;
  };
}
```

### Recursive Reasoning

Recursive reasoning allows thoughts to reference and build upon themselves, creating nested reasoning structures.

#### Key Features:
- Self-referential thought structures
- Recursive depth limits
- Base case identification
- Memoization of sub-problems
- Recursive pattern detection

#### Interface Design:

```typescript
export interface RecursiveReasoningNode {
  id: string;
  content: string;
  recursivePattern: 'divide-conquer' | 'bottom-up' | 'top-down' | 'mutual';
  baseCase?: boolean;
  subproblemIds: string[];
  parentProblemId?: string;
  recursionDepth: number;
  memoizedResult?: any;
  metadata?: {
    problemDecomposition?: string;
    combinationStrategy?: string;
  };
}

export interface RecursiveReasoningSession {
  rootProblemId: string;
  nodes: Map<string, RecursiveReasoningNode>;
  maxRecursionDepth: number;
  memoizationCache: Map<string, any>;
  detectedPatterns: Array<{
    patternType: string;
    nodeIds: string[];
    confidence: number;
  }>;
  solutionStrategy: 'depth-first' | 'breadth-first' | 'dynamic-programming';
}
```

### Dialectical Reasoning

Dialectical reasoning explores ideas through thesis, antithesis, and synthesis.

#### Key Features:
- Structured opposition and synthesis
- Argument tracking
- Contradiction resolution
- Multi-perspective integration
- Iterative refinement

#### Interface Design:

```typescript
export interface DialecticalNode {
  id: string;
  content: string;
  nodeRole: 'thesis' | 'antithesis' | 'synthesis' | 'supporting' | 'challenging';
  relatedNodeIds: {
    opposes?: string[];
    supports?: string[];
    synthesizes?: string[];
  };
  argumentStrength: number;
  metadata?: {
    perspective?: string;
    assumptions?: string[];
    evidence?: string[];
  };
}

export interface DialecticalSession {
  nodes: Map<string, DialecticalNode>;
  currentDialecticId: string;
  dialecticChains: Array<{
    thesisId: string;
    antithesisIds: string[];
    synthesisId?: string;
    status: 'open' | 'synthesized' | 'abandoned';
  }>;
  consensusPoints: string[];
  unresolved_tensions: Array<{
    nodeIds: string[];
    description: string;
  }>;
}
```

### Progressive Deep Reasoning (PDR)

Progressive Deep Reasoning orchestrates a breadth-first reasoning pass followed by selective deepening across multiple passes. Each pass can assign a different reasoning approach per subject (sequential/tree/beam/mcts/graph), enabling adaptive exploration with budgets and stop conditions.

#### Key Features:
- Breadth→depth multi-pass workflow (scan → cluster → select → deepen → synthesize)
- Per-subject approach selection (rule-based or auto)
- Budgeting per pass and per subject
- Selection criteria and pruning between passes
- Confidence tracking and pass-level termination conditions

#### Interface Design:

```typescript
export type PDRApproach = 'sequential' | 'tree' | 'beam' | 'mcts' | 'graph' | 'auto';

export interface PDRSubject {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  passScores: Record<string, number>; // passId → score
  confidence?: number; // 0-1
  selected?: boolean; // selected for next pass
  metadata?: Record<string, unknown>;
}

export interface PDRSelectionCriteria {
  minScore?: number;
  topK?: number;
  diversity?: number; // 0-1 penalty for redundancy
  custom?: string; // DSL or description of selection rule
}

export interface PDRPassPolicy {
  id: string;
  name: 'scan' | 'cluster' | 'select' | 'deepen' | 'synthesize';
  defaultApproach?: PDRApproach; // used when perSubjectApproach rule returns 'auto'
  perSubjectApproach?: {
    rules?: Array<{
      when: string; // rule expression over subject metadata/tags/scores
      use: PDRApproach;
    }>;
    fallback?: PDRApproach; // default if no rule matches
  };
  selection?: PDRSelectionCriteria; // which subjects advance to next pass
  budget?: {
    subjectsLimit?: number; // max subjects to process in this pass
    timeMs?: number; // soft budget
  };
}

export interface PDRPassTrace {
  id: string;
  policyId: string;
  startedAt: string;
  completedAt?: string;
  processedSubjectIds: string[];
  approachBySubject: Record<string, PDRApproach>; // subjectId → approach used
  resultsBySubject: Record<string, {
    score?: number;
    confidence?: number;
    notes?: string;
    artifacts?: Array<{ kind: 'markdown'|'mermaid'|'json'|'code'; content: string }>;
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
    minImprovement?: number; // stop if improvement < threshold across last N passes
    confidenceThreshold?: number; // stop when avg confidence ≥ threshold
  };
  summary?: {
    chosenSubjectIds: string[];
    synthesis?: string; // final narrative/summary
    decisions?: Array<{ subjectId: string; decision: string; rationale?: string }>;
  };
}
```

#### Minimal Workflow (example control flow):
1. Pass 0 (scan): `sequential` + `orchestration_suggest` to enumerate/seed subjects.
2. Pass 1 (cluster/select): `graph` for clustering; `beam` to pick top‑K per cluster.
3. Pass 2+ (deepen): choose per subject:
   - `tree` for divergent ideation,
   - `beam` for narrowing,
   - `mcts` for uncertainty/cost tradeoffs,
   - `graph` for evidence/relations,
   - `sequential` for linear drill‑down.
4. Final: `decision_framework` ranks outputs; `metacognitive_monitoring` records confidence.

#### Compatibility Notes:
- PDR composes existing modes; no breaking change to current operations.
- Each per‑subject step can append artifacts (markdown/mermaid/code) that align with the notebook model.
- PDR state can be serialized into session export alongside sequential thoughts.

## Core Interfaces

### Base Reasoning Node

All reasoning structures will extend from a common base node interface:

```typescript
export interface BaseReasoningNode {
  id: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

### Reasoning Pattern Interface

Each reasoning pattern must implement this interface:

```typescript
export interface ReasoningPattern<TNode extends BaseReasoningNode, TSession> {
  // Pattern identification
  patternName: string;
  patternVersion: string;
  
  // Node operations
  createNode(content: string, context: TSession): TNode;
  updateNode(nodeId: string, updates: Partial<TNode>, context: TSession): TNode;
  deleteNode(nodeId: string, context: TSession): boolean;
  
  // Session operations
  initializeSession(config: any): TSession;
  getNextActions(session: TSession): string[];
  evaluateProgress(session: TSession): number; // 0-1 progress score
  
  // Serialization
  serializeSession(session: TSession): string;
  deserializeSession(data: string): TSession;
  
  // Compatibility
  exportToSequentialFormat(session: TSession): ThoughtData[];
  importFromSequentialFormat(thoughts: ThoughtData[]): TSession;
}
```

### Unified Reasoning Interface

A unified interface that can handle any reasoning pattern:

```typescript
export interface UnifiedReasoningArgs {
  pattern: 'chain' | 'tree' | 'graph' | 'beam' | 'mcts' | 'recursive' | 'dialectical';
  operation: 'create' | 'continue' | 'evaluate' | 'branch' | 'merge' | 'prune';
  content?: string;
  nodeId?: string;
  sessionId: string;
  parameters?: Record<string, any>;
}

export interface UnifiedReasoningResult {
  sessionId: string;
  pattern: string;
  currentNodeId?: string;
  suggestedActions: string[];
  progress: number;
  visualization?: string; // ASCII or mermaid diagram
  exportData?: any;
}
```

## Implementation Strategy

### Phase 1: Infrastructure (Weeks 1-2)
1. Create base interfaces and types
2. Implement pattern registry system
3. Build common node and session management
4. Create serialization framework

### Phase 2: Core Patterns (Weeks 3-6)
1. Implement Tree of Thought
2. Implement Graph of Thought
3. Implement Beam Search
4. Add evaluation and scoring systems

### Phase 3: Advanced Patterns (Weeks 7-8)
1. Implement MCTS
2. Implement Recursive Reasoning
3. Implement Dialectical Reasoning
4. Add pattern combination support

### Phase 4: Integration (Weeks 9-10)
1. Update MCP tool definitions
2. Create unified interface
3. Add visualization support
4. Implement import/export

### Phase 5: Testing & Documentation (Weeks 11-12)
1. Comprehensive testing
2. Performance optimization
3. Documentation and examples
4. Migration tooling

## Examples

### Tree of Thought Example

```typescript
// Initialize a Tree of Thought session for problem solving
const totSession = await mcp.callTool("clear_thought", {
  operation: "tree_of_thought",
  prompt: "How can we optimize the delivery route for 10 packages?",
  sessionId: "delivery-optimization-001",
  parameters: {
    explorationStrategy: "best-first",
    maxDepth: 5,
    branchingFactor: 3
  }
});

// Explore a branch
const branch1 = await mcp.callTool("clear_thought", {
  operation: "tree_of_thought",
  prompt: "Group packages by geographic proximity",
  sessionId: "delivery-optimization-001",
  parameters: {
    nodeId: totSession.currentNodeId,
    evaluationScore: 0.8
  }
});
```

### Graph of Thought Example

```typescript
// Create a Graph of Thought for analyzing relationships
const gotSession = await mcp.callTool("clear_thought", {
  operation: "graph_of_thought",
  prompt: "Climate change impacts on agriculture",
  sessionId: "climate-agriculture-001",
  parameters: {
    nodeType: "hypothesis"
  }
});

// Add supporting evidence
const evidence = await mcp.callTool("clear_thought", {
  operation: "graph_of_thought",
  prompt: "Rising temperatures reduce wheat yields by 6% per degree",
  sessionId: "climate-agriculture-001",
  parameters: {
    nodeType: "evidence",
    connectTo: gotSession.currentNodeId,
    connectionType: "supports",
    connectionWeight: 0.9
  }
});
```

### Beam Search Example

```typescript
// Initialize beam search for exploring multiple solutions
const beamSession = await mcp.callTool("clear_thought", {
  operation: "beam_search",
  prompt: "Design a sustainable city transportation system",
  sessionId: "transport-design-001",
  parameters: {
    beamWidth: 5,
    evaluationCriteria: ["cost", "environmental impact", "accessibility"]
  }
});

// Continue exploration
const nextGeneration = await mcp.callTool("clear_thought", {
  operation: "beam_search",
  prompt: "Continue beam search exploration",
  sessionId: "transport-design-001",
  parameters: {
    action: "continue",
    generationLimit: 3
  }
});
```

## Migration Path

### For Existing Sequential Thinking Users

1. **Compatibility Mode**: Existing sequential thinking calls will automatically use chain-of-thought pattern
2. **Gradual Migration**: New patterns can be adopted incrementally
3. **Data Preservation**: All existing thought data will be preserved and accessible

### Migration Example

```typescript
// Current API (sequential thinking operation)
const result = await mcp.callTool("clear_thought", {
  operation: "sequential_thinking",
  prompt: "Analyzing the problem",
  parameters: {
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
});

// Enhanced API (with pattern specification)
const result = await mcp.callTool("clear_thought", {
  operation: "sequential_thinking",
  prompt: "Analyzing the problem",
  sessionId: "analysis-001",
  parameters: {
    pattern: "tree",  // or "chain", "graph", "beam", "mcts", "auto"
    patternParams: {
      maxDepth: 5,
      explorationStrategy: "best-first"
    }
  }
});
```

### Backward Compatibility

- Current `sequential_thinking` operation continues to work with existing parameters
- Default behavior uses chain-of-thought pattern when no pattern is specified
- All existing thought data fields (`branchFromThought`, `isRevision`, etc.) remain supported
- Pattern selection is optional - omitting it maintains current behavior

## Performance Considerations

### Storage Optimization

1. **Lazy Loading**: Load only active paths/nodes
2. **Compression**: Compress historical data
3. **Indexing**: Efficient indexes for node relationships
4. **Caching**: Cache frequently accessed paths

### Computation Optimization

1. **Incremental Updates**: Avoid full tree/graph recalculation
2. **Parallel Processing**: Explore multiple paths concurrently
3. **Early Pruning**: Remove unpromising paths early
4. **Memoization**: Cache repeated subproblem solutions

## Future Extensions

### Potential Additions

1. **Neural-Guided Reasoning**: Integration with neural networks for path evaluation
2. **Collaborative Patterns**: Multi-agent reasoning structures
3. **Temporal Reasoning**: Time-aware thought progression
4. **Probabilistic Reasoning**: Uncertainty quantification in paths
5. **Meta-Reasoning**: Reasoning about reasoning patterns

### Research Integration

- Support for emerging reasoning patterns from research
- Pluggable architecture for custom patterns
- A/B testing framework for pattern comparison
- Analytics and insights on reasoning effectiveness

## Conclusion

This specification provides a comprehensive framework for implementing advanced reasoning structures beyond chain-of-thought. The modular design ensures extensibility while maintaining compatibility with existing systems. By supporting multiple reasoning patterns, we enable more sophisticated problem-solving capabilities that can adapt to different types of challenges and domains.