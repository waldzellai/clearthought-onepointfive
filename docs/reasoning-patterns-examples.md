# Reasoning Patterns Implementation Examples

This document provides practical examples of implementing and using the advanced reasoning patterns defined in the specification.

## Table of Contents

1. [Tree of Thought Example](#tree-of-thought-example)
2. [Graph of Thought Example](#graph-of-thought-example)
3. [Beam Search Example](#beam-search-example)
4. [Monte Carlo Tree Search Example](#monte-carlo-tree-search-example)
5. [Pattern Combination Example](#pattern-combination-example)
6. [Migration from Sequential Thinking](#migration-from-sequential-thinking)

## Tree of Thought Example

### Problem: Route Optimization

```typescript
import { 
  TreeOfThoughtNode, 
  TreeOfThoughtSession,
  TreeOfThoughtOperations 
} from '../src/types/reasoning-patterns/tree-of-thought.js';

// Implementation of Tree of Thought for route optimization
class RouteOptimizationToT implements TreeOfThoughtOperations {
  
  expand(nodeId: string, session: TreeOfThoughtSession): TreeOfThoughtNode[] {
    const node = session.nodes.get(nodeId);
    if (!node) return [];
    
    // Generate child nodes representing different routing strategies
    const strategies = [
      "Optimize for distance",
      "Optimize for time with traffic",
      "Optimize for fuel efficiency",
      "Balance all factors"
    ];
    
    const children: TreeOfThoughtNode[] = [];
    
    for (const strategy of strategies) {
      const child: TreeOfThoughtNode = {
        id: generateId(),
        content: `${node.content} -> ${strategy}`,
        timestamp: new Date().toISOString(),
        parentId: nodeId,
        childrenIds: [],
        depth: node.depth + 1,
        status: 'active',
        metadata: {
          explorationStrategy: session.config.defaultStrategy,
          domainMetrics: {
            estimatedDistance: Math.random() * 100,
            estimatedTime: Math.random() * 60,
            estimatedFuel: Math.random() * 50
          }
        }
      };
      
      children.push(child);
      session.nodes.set(child.id, child);
      node.childrenIds.push(child.id);
    }
    
    return children;
  }
  
  evaluate(nodeId: string, session: TreeOfThoughtSession): number {
    const node = session.nodes.get(nodeId);
    if (!node) return 0;
    
    // Evaluate based on domain metrics
    const metrics = node.metadata?.domainMetrics || {};
    const distanceScore = 1 - (metrics.estimatedDistance || 100) / 100;
    const timeScore = 1 - (metrics.estimatedTime || 60) / 60;
    const fuelScore = 1 - (metrics.estimatedFuel || 50) / 50;
    
    // Weighted combination
    return (distanceScore * 0.3 + timeScore * 0.5 + fuelScore * 0.2);
  }
  
  selectNext(session: TreeOfThoughtSession): string | null {
    // Best-first search: select unexplored node with highest parent score
    let bestNode: TreeOfThoughtNode | null = null;
    let bestScore = -1;
    
    for (const [id, node] of session.nodes) {
      if (node.status === 'active' && node.depth < session.config.maxDepth) {
        const score = node.score || 0;
        if (score > bestScore) {
          bestScore = score;
          bestNode = node;
        }
      }
    }
    
    return bestNode?.id || null;
  }
  
  // ... other methods implementation
}

// Usage example
async function optimizeDeliveryRoute() {
  const totOps = new RouteOptimizationToT();
  
  // Initialize session
  const session: TreeOfThoughtSession = {
    sessionId: "route-opt-001",
    patternType: 'tree',
    iteration: 0,
    nextStepNeeded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rootNodeId: "root",
    nodes: new Map(),
    currentNodeId: "root",
    explorationBudget: 50,
    evaluationCriteria: ["distance", "time", "fuel"],
    solutionCriteria: "score > 0.8",
    config: {
      maxDepth: 5,
      maxBranchingFactor: 4,
      defaultStrategy: 'best-first',
      pruningThreshold: 0.3
    },
    stats: {
      nodesCreated: 1,
      nodesExplored: 0,
      nodesPruned: 0,
      solutionsFound: 0,
      maxDepthReached: 0,
      totalTime: 0
    }
  };
  
  // Create root node
  const rootNode: TreeOfThoughtNode = {
    id: "root",
    content: "Deliver 10 packages in city",
    timestamp: new Date().toISOString(),
    childrenIds: [],
    depth: 0,
    status: 'active'
  };
  
  session.nodes.set(rootNode.id, rootNode);
  
  // Exploration loop
  while (session.stats.nodesExplored < session.explorationBudget) {
    const nextNodeId = totOps.selectNext(session);
    if (!nextNodeId) break;
    
    // Expand the node
    const children = totOps.expand(nextNodeId, session);
    
    // Evaluate children
    for (const child of children) {
      child.score = totOps.evaluate(child.id, session);
      
      // Prune if below threshold
      if (child.score < session.config.pruningThreshold!) {
        child.status = 'pruned';
        session.stats.nodesPruned++;
      }
    }
    
    // Update stats
    const node = session.nodes.get(nextNodeId)!;
    node.status = 'explored';
    session.stats.nodesExplored++;
    session.stats.nodesCreated += children.length;
    
    // Check for solution
    const bestChild = children.reduce((best, child) => 
      (child.score || 0) > (best.score || 0) ? child : best
    );
    
    if (bestChild.score && bestChild.score > 0.8) {
      bestChild.status = 'solution';
      session.stats.solutionsFound++;
      session.bestPathIds = totOps.getPath(bestChild.id, session);
      break;
    }
  }
  
  return session;
}
```

## Graph of Thought Example

### Problem: Scientific Hypothesis Analysis

```typescript
import {
  GraphOfThoughtNode,
  GraphOfThoughtEdge,
  GraphOfThoughtSession,
  GraphOfThoughtOperations
} from '../src/types/reasoning-patterns/graph-of-thought.js';

// Implementation for analyzing scientific hypotheses
class ScientificAnalysisGoT implements GraphOfThoughtOperations {
  
  addNode(
    node: Omit<GraphOfThoughtNode, 'id' | 'incomingEdges' | 'outgoingEdges'>, 
    session: GraphOfThoughtSession
  ): GraphOfThoughtNode {
    const newNode: GraphOfThoughtNode = {
      ...node,
      id: generateId(),
      incomingEdges: [],
      outgoingEdges: []
    };
    
    session.nodes.set(newNode.id, newNode);
    session.stats.totalNodes++;
    session.stats.nodesByType[node.nodeType] = 
      (session.stats.nodesByType[node.nodeType] || 0) + 1;
    
    return newNode;
  }
  
  connectNodes(
    sourceId: string, 
    targetId: string, 
    edgeType: GraphEdgeType, 
    weight: number, 
    session: GraphOfThoughtSession
  ): GraphOfThoughtEdge {
    const edge: GraphOfThoughtEdge = {
      id: generateId(),
      sourceId,
      targetId,
      edgeType,
      weight,
      metadata: {
        createdAt: new Date().toISOString()
      }
    };
    
    // Update node connections
    const sourceNode = session.nodes.get(sourceId)!;
    const targetNode = session.nodes.get(targetId)!;
    
    sourceNode.outgoingEdges.push(edge.id);
    targetNode.incomingEdges.push(edge.id);
    
    session.edges.set(edge.id, edge);
    session.stats.totalEdges++;
    session.stats.edgesByType[edgeType] = 
      (session.stats.edgesByType[edgeType] || 0) + 1;
    
    return edge;
  }
  
  findContradictions(session: GraphOfThoughtSession): Array<{nodeIds: string[], description: string}> {
    const contradictions: Array<{nodeIds: string[], description: string}> = [];
    
    // Find nodes connected by 'contradicts' edges
    for (const [edgeId, edge] of session.edges) {
      if (edge.edgeType === 'contradicts') {
        const source = session.nodes.get(edge.sourceId)!;
        const target = session.nodes.get(edge.targetId)!;
        
        contradictions.push({
          nodeIds: [edge.sourceId, edge.targetId],
          description: `${source.content} contradicts ${target.content}`
        });
      }
    }
    
    // Find logical inconsistencies in support chains
    // ... implementation
    
    return contradictions;
  }
  
  calculateCentrality(session: GraphOfThoughtSession): Map<string, number> {
    const centrality = new Map<string, number>();
    
    // Simple degree centrality
    for (const [nodeId, node] of session.nodes) {
      const degree = node.incomingEdges.length + node.outgoingEdges.length;
      const normalizedDegree = degree / (2 * (session.nodes.size - 1));
      centrality.set(nodeId, normalizedDegree);
    }
    
    // Could implement more sophisticated algorithms like:
    // - Betweenness centrality
    // - Eigenvector centrality
    // - PageRank
    
    return centrality;
  }
  
  // ... other methods
}

// Usage example
async function analyzeClimateHypothesis() {
  const gotOps = new ScientificAnalysisGoT();
  
  // Initialize session
  const session: GraphOfThoughtSession = {
    sessionId: "climate-analysis-001",
    patternType: 'graph',
    iteration: 0,
    nextStepNeeded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: new Map(),
    edges: new Map(),
    entryNodeIds: [],
    explorationPath: [],
    config: {
      maxNodes: 100,
      maxEdges: 200,
      allowCycles: true,
      analysisAlgorithms: ['centrality', 'clustering', 'paths']
    },
    stats: {
      totalNodes: 0,
      totalEdges: 0,
      nodesByType: {},
      edgesByType: {},
      averageDegree: 0,
      density: 0,
      connectedComponents: 1
    }
  };
  
  // Add hypothesis node
  const hypothesis = gotOps.addNode({
    content: "Rising CO2 levels cause global temperature increase",
    nodeType: 'hypothesis',
    strength: 0.9,
    timestamp: new Date().toISOString()
  }, session);
  
  session.entryNodeIds.push(hypothesis.id);
  
  // Add supporting evidence
  const evidence1 = gotOps.addNode({
    content: "Ice core data shows CO2-temperature correlation",
    nodeType: 'evidence',
    strength: 0.95,
    timestamp: new Date().toISOString(),
    metadata: {
      source: "Nature 2019",
      certainty: 'high'
    }
  }, session);
  
  gotOps.connectNodes(evidence1.id, hypothesis.id, 'supports', 0.9, session);
  
  // Add questioning node
  const question = gotOps.addNode({
    content: "What about natural climate variability?",
    nodeType: 'question',
    strength: 0.7,
    timestamp: new Date().toISOString()
  }, session);
  
  gotOps.connectNodes(question.id, hypothesis.id, 'questions', 0.6, session);
  
  // Add counterargument
  const counter = gotOps.addNode({
    content: "Solar activity variations could explain warming",
    nodeType: 'counterargument',
    strength: 0.4,
    timestamp: new Date().toISOString()
  }, session);
  
  gotOps.connectNodes(counter.id, hypothesis.id, 'contradicts', 0.4, session);
  
  // Analyze the graph
  const centrality = gotOps.calculateCentrality(session);
  const contradictions = gotOps.findContradictions(session);
  
  session.analysisMetrics = {
    centrality,
    clusters: [], // Would be filled by clustering algorithm
    criticalPaths: [] // Would be filled by path analysis
  };
  
  return session;
}
```

## Beam Search Example

### Problem: Text Generation with Multiple Hypotheses

```typescript
import {
  BeamSearchNode,
  BeamSearchPath,
  BeamSearchSession,
  BeamSearchOperations
} from '../src/types/reasoning-patterns/beam-search.js';

// Implementation for text generation using beam search
class TextGenerationBeam implements BeamSearchOperations {
  
  generateNextGeneration(session: BeamSearchSession): BeamSearchNode[] {
    const newNodes: BeamSearchNode[] = [];
    
    for (const pathId of session.activePaths) {
      const path = session.paths.get(pathId)!;
      if (path.status !== 'active') continue;
      
      const lastNodeId = path.nodeIds[path.nodeIds.length - 1];
      const lastNode = session.nodes.get(lastNodeId)!;
      
      // Generate candidate continuations
      const candidates = this.generateCandidates(lastNode.content);
      
      for (const candidate of candidates) {
        const newNode: BeamSearchNode = {
          id: generateId(),
          content: candidate.text,
          timestamp: new Date().toISOString(),
          pathIds: [pathId],
          generationNumber: session.currentGeneration + 1,
          localScore: candidate.score,
          cumulativeScore: (lastNode.cumulativeScore || 0) + candidate.score,
          metadata: {
            scoringFeatures: candidate.features,
            parentIds: [lastNodeId]
          }
        };
        
        newNodes.push(newNode);
        session.nodes.set(newNode.id, newNode);
      }
    }
    
    return newNodes;
  }
  
  evaluatePaths(session: BeamSearchSession): Map<string, number> {
    const scores = new Map<string, number>();
    
    for (const [pathId, path] of session.paths) {
      if (path.status !== 'active') continue;
      
      // Calculate path score based on nodes
      let totalScore = 0;
      let nodeCount = 0;
      
      for (const nodeId of path.nodeIds) {
        const node = session.nodes.get(nodeId)!;
        totalScore += node.localScore;
        nodeCount++;
      }
      
      // Apply scoring strategy
      let finalScore = 0;
      switch (session.config.scoreAggregation) {
        case 'sum':
          finalScore = totalScore;
          break;
        case 'average':
          finalScore = totalScore / nodeCount;
          break;
        case 'max':
          finalScore = Math.max(...path.nodeIds.map(id => 
            session.nodes.get(id)!.localScore
          ));
          break;
      }
      
      // Apply diversity bonus if configured
      if (session.config.diversityBonus) {
        const diversity = this.calculatePathDiversity(path, session);
        finalScore += diversity * session.config.diversityBonus;
      }
      
      scores.set(pathId, finalScore);
      path.currentScore = finalScore;
    }
    
    return scores;
  }
  
  prunePaths(session: BeamSearchSession): string[] {
    const scores = this.evaluatePaths(session);
    const sortedPaths = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const prunedIds: string[] = [];
    
    // Keep only top beamWidth paths
    for (let i = session.beamWidth; i < sortedPaths.length; i++) {
      const pathId = sortedPaths[i][0];
      const path = session.paths.get(pathId)!;
      
      path.status = 'pruned';
      path.metadata = {
        ...path.metadata,
        pruningGeneration: session.currentGeneration,
        pruningReason: 'Below beam width threshold'
      };
      
      prunedIds.push(pathId);
      
      // Remove from active paths
      const index = session.activePaths.indexOf(pathId);
      if (index > -1) {
        session.activePaths.splice(index, 1);
      }
    }
    
    // Update active paths to top beamWidth
    session.activePaths = sortedPaths
      .slice(0, session.beamWidth)
      .map(([id]) => id);
    
    return prunedIds;
  }
  
  checkConvergence(session: BeamSearchSession): boolean {
    // Check various convergence criteria
    
    // Max generations reached
    if (session.convergenceCriteria?.maxGenerations && 
        session.currentGeneration >= session.convergenceCriteria.maxGenerations) {
      return true;
    }
    
    // Score improvement threshold
    if (session.convergenceCriteria?.minScoreImprovement) {
      const currentBest = this.getBestPath(session)?.currentScore || 0;
      const lastBest = session.stats.bestScore;
      
      if (currentBest - lastBest < session.convergenceCriteria.minScoreImprovement) {
        return true;
      }
    }
    
    // Consensus among top paths
    if (session.convergenceCriteria?.consensusThreshold) {
      const consensus = this.calculateConsensus(session);
      if (consensus >= session.convergenceCriteria.consensusThreshold) {
        return true;
      }
    }
    
    return false;
  }
  
  // Helper methods
  private generateCandidates(context: string): Array<{text: string, score: number, features: any}> {
    // Simplified candidate generation
    const candidates = [
      { text: `${context} with optimization`, score: 0.8, features: {} },
      { text: `${context} using heuristics`, score: 0.7, features: {} },
      { text: `${context} through iteration`, score: 0.6, features: {} }
    ];
    
    return candidates;
  }
  
  private calculatePathDiversity(path: BeamSearchPath, session: BeamSearchSession): number {
    // Calculate how different this path is from others
    let totalSimilarity = 0;
    let comparisonCount = 0;
    
    for (const otherId of session.activePaths) {
      if (otherId === path.id) continue;
      
      const otherPath = session.paths.get(otherId)!;
      const similarity = this.calculateSimilarity(path, otherPath);
      totalSimilarity += similarity;
      comparisonCount++;
    }
    
    return comparisonCount > 0 ? 1 - (totalSimilarity / comparisonCount) : 1;
  }
  
  private calculateSimilarity(path1: BeamSearchPath, path2: BeamSearchPath): number {
    // Simple similarity based on common nodes
    const set1 = new Set(path1.nodeIds);
    const set2 = new Set(path2.nodeIds);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
  
  private calculateConsensus(session: BeamSearchSession): number {
    // Check if top paths converge on similar solutions
    // Simplified implementation
    return 0.5;
  }
  
  // ... other methods
}

// Usage example
async function generateOptimizedText() {
  const beamOps = new TextGenerationBeam();
  
  // Initialize session
  const session: BeamSearchSession = {
    sessionId: "text-gen-001",
    patternType: 'beam',
    iteration: 0,
    nextStepNeeded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    beamWidth: 5,
    currentGeneration: 0,
    nodes: new Map(),
    paths: new Map(),
    activePaths: [],
    evaluationFunction: "Language model score with diversity bonus",
    convergenceCriteria: {
      maxGenerations: 10,
      consensusThreshold: 0.8
    },
    config: {
      expansionStrategy: 'breadth',
      branchingFactor: 3,
      scoreAggregation: 'average',
      allowMerging: true,
      mergeThreshold: 0.9,
      pruningStrategy: 'relative',
      diversityBonus: 0.1
    },
    stats: {
      totalPaths: 0,
      activePaths: 0,
      completedPaths: 0,
      prunedPaths: 0,
      mergedPaths: 0,
      nodesExplored: 0,
      averagePathLength: 0,
      bestScore: 0,
      bestScoreGeneration: 0
    }
  };
  
  // Create initial path with seed text
  const seedNode: BeamSearchNode = {
    id: "seed",
    content: "Optimize the algorithm",
    timestamp: new Date().toISOString(),
    pathIds: ["path-0"],
    generationNumber: 0,
    localScore: 1.0,
    cumulativeScore: 1.0
  };
  
  session.nodes.set(seedNode.id, seedNode);
  
  const initialPath: BeamSearchPath = {
    id: "path-0",
    nodeIds: [seedNode.id],
    currentScore: 1.0,
    status: 'active'
  };
  
  session.paths.set(initialPath.id, initialPath);
  session.activePaths.push(initialPath.id);
  session.stats.totalPaths = 1;
  session.stats.activePaths = 1;
  
  // Run beam search
  while (!beamOps.checkConvergence(session) && session.currentGeneration < 10) {
    // Generate next generation
    const newNodes = beamOps.generateNextGeneration(session);
    
    // Create new paths for each node
    for (const node of newNodes) {
      for (const parentPathId of node.pathIds) {
        const parentPath = session.paths.get(parentPathId)!;
        const newPath: BeamSearchPath = {
          id: generateId(),
          nodeIds: [...parentPath.nodeIds, node.id],
          currentScore: 0,
          status: 'active'
        };
        
        session.paths.set(newPath.id, newPath);
        session.stats.totalPaths++;
      }
    }
    
    // Evaluate and prune
    beamOps.evaluatePaths(session);
    const pruned = beamOps.prunePaths(session);
    session.stats.prunedPaths += pruned.length;
    
    // Update generation
    session.currentGeneration++;
    
    // Update best score
    const bestPath = beamOps.getBestPath(session);
    if (bestPath && bestPath.currentScore > session.stats.bestScore) {
      session.stats.bestScore = bestPath.currentScore;
      session.stats.bestScoreGeneration = session.currentGeneration;
    }
  }
  
  return session;
}
```

## Monte Carlo Tree Search Example

### Problem: Strategic Decision Making

```typescript
import {
  MCTSNode,
  MCTSSession,
  MCTSOperations
} from '../src/types/reasoning-patterns/mcts.js';

// Implementation for strategic decision making
class StrategyMCTS implements MCTSOperations {
  
  selectLeaf(session: MCTSSession): MCTSNode {
    let current = session.nodes.get(session.rootNodeId)!;
    
    while (current.childrenIds.length > 0 && !current.isTerminal) {
      // Check if node is fully expanded
      if (current.untriedActions && current.untriedActions.length > 0) {
        break; // Node has untried actions, expand here
      }
      
      // Select best child using UCB
      let bestChild: MCTSNode | null = null;
      let bestUCB = -Infinity;
      
      for (const childId of current.childrenIds) {
        const child = session.nodes.get(childId)!;
        const ucb = this.calculateUCB(childId, current.visits, session);
        
        if (ucb > bestUCB) {
          bestUCB = ucb;
          bestChild = child;
        }
      }
      
      if (!bestChild) break;
      current = bestChild;
    }
    
    return current;
  }
  
  expandNode(nodeId: string, session: MCTSSession): MCTSNode {
    const node = session.nodes.get(nodeId)!;
    
    if (!node.untriedActions || node.untriedActions.length === 0) {
      throw new Error("No untried actions available");
    }
    
    // Select random untried action
    const actionIndex = Math.floor(Math.random() * node.untriedActions.length);
    const action = node.untriedActions[actionIndex];
    
    // Remove from untried actions
    node.untriedActions.splice(actionIndex, 1);
    
    // Create new child node
    const childNode: MCTSNode = {
      id: generateId(),
      content: `${node.content} -> ${action}`,
      timestamp: new Date().toISOString(),
      parentId: nodeId,
      childrenIds: [],
      visits: 0,
      totalValue: 0,
      averageValue: 0,
      untriedActions: this.getAvailableActions(action),
      metadata: {
        action,
        depth: (node.metadata?.depth || 0) + 1
      }
    };
    
    // Add to tree
    session.nodes.set(childNode.id, childNode);
    node.childrenIds.push(childNode.id);
    session.stats.totalNodes++;
    
    return childNode;
  }
  
  simulate(nodeId: string, session: MCTSSession): number {
    const startNode = session.nodes.get(nodeId)!;
    let currentState = this.nodeToState(startNode);
    let depth = 0;
    
    // Random rollout
    while (!this.isTerminal(currentState) && depth < session.simulationDepth) {
      const actions = this.getStateActions(currentState);
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      currentState = this.applyAction(currentState, randomAction);
      depth++;
    }
    
    // Evaluate terminal state
    return this.evaluateState(currentState);
  }
  
  backpropagate(leafNodeId: string, value: number, session: MCTSSession): void {
    let currentId: string | undefined = leafNodeId;
    
    while (currentId) {
      const node = session.nodes.get(currentId)!;
      
      // Update node statistics
      node.visits++;
      node.totalValue += value;
      node.averageValue = node.totalValue / node.visits;
      
      // Move to parent
      currentId = node.parentId;
    }
    
    // Update session stats
    session.totalSimulations++;
  }
  
  calculateUCB(nodeId: string, parentVisits: number, session: MCTSSession): number {
    const node = session.nodes.get(nodeId)!;
    
    if (node.visits === 0) {
      return Infinity; // Unvisited nodes have maximum priority
    }
    
    // UCB1 formula
    const exploitation = node.averageValue;
    const exploration = Math.sqrt(2 * Math.log(parentVisits) / node.visits);
    const ucb = exploitation + session.explorationConstant * exploration;
    
    // Store for reference
    node.ucbScore = ucb;
    
    return ucb;
  }
  
  runIteration(session: MCTSSession): void {
    // Selection
    session.currentPhase = 'selection';
    const leaf = this.selectLeaf(session);
    
    // Expansion
    session.currentPhase = 'expansion';
    let selectedNode = leaf;
    if (!leaf.isTerminal && leaf.untriedActions && leaf.untriedActions.length > 0) {
      selectedNode = this.expandNode(leaf.id, session);
    }
    
    // Simulation
    session.currentPhase = 'simulation';
    const value = this.simulate(selectedNode.id, session);
    
    // Backpropagation
    session.currentPhase = 'backpropagation';
    this.backpropagate(selectedNode.id, value, session);
  }
  
  getBestAction(session: MCTSSession): string {
    const root = session.nodes.get(session.rootNodeId)!;
    let bestChild: MCTSNode | null = null;
    let mostVisits = -1;
    
    for (const childId of root.childrenIds) {
      const child = session.nodes.get(childId)!;
      if (child.visits > mostVisits) {
        mostVisits = child.visits;
        bestChild = child;
      }
    }
    
    return bestChild?.metadata?.action || "";
  }
  
  // Helper methods
  private getAvailableActions(context: string): string[] {
    // Domain-specific action generation
    return ["expand", "optimize", "pivot", "consolidate", "innovate"];
  }
  
  private nodeToState(node: MCTSNode): any {
    return {
      content: node.content,
      depth: node.metadata?.depth || 0
    };
  }
  
  private isTerminal(state: any): boolean {
    return state.depth >= 5; // Simple depth limit
  }
  
  private getStateActions(state: any): string[] {
    return this.getAvailableActions(state.content);
  }
  
  private applyAction(state: any, action: string): any {
    return {
      content: `${state.content} -> ${action}`,
      depth: state.depth + 1
    };
  }
  
  private evaluateState(state: any): number {
    // Simple evaluation based on path
    const keywords = ["optimize", "innovate"];
    let score = 0;
    for (const keyword of keywords) {
      if (state.content.includes(keyword)) {
        score += 0.2;
      }
    }
    return Math.min(score, 1.0);
  }
  
  // ... other methods
}

// Usage example
async function makeStrategicDecision() {
  const mctsOps = new StrategyMCTS();
  
  // Initialize session
  const session: MCTSSession = {
    sessionId: "strategy-001",
    patternType: 'mcts',
    iteration: 0,
    nextStepNeeded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rootNodeId: "root",
    nodes: new Map(),
    explorationConstant: 1.414, // sqrt(2)
    simulationDepth: 10,
    totalSimulations: 0,
    rolloutPolicy: 'random',
    terminationCriteria: {
      maxSimulations: 1000,
      timeLimit: 30000, // 30 seconds
      confidenceThreshold: 0.95
    },
    config: {
      ucbVariant: 'ucb1',
      reuseTree: false,
      usePriors: false
    },
    stats: {
      totalNodes: 1,
      maxDepth: 0,
      averageBranchingFactor: 0
    }
  };
  
  // Create root node
  const rootNode: MCTSNode = {
    id: "root",
    content: "Strategic decision for product launch",
    timestamp: new Date().toISOString(),
    childrenIds: [],
    visits: 0,
    totalValue: 0,
    averageValue: 0,
    untriedActions: ["Market Analysis", "Competitor Research", "Customer Feedback", "Risk Assessment"]
  };
  
  session.nodes.set(rootNode.id, rootNode);
  
  // Run MCTS iterations
  const startTime = Date.now();
  
  while (session.totalSimulations < session.terminationCriteria.maxSimulations!) {
    // Check time limit
    if (Date.now() - startTime > session.terminationCriteria.timeLimit!) {
      break;
    }
    
    // Run one iteration
    mctsOps.runIteration(session);
    
    // Update stats
    if (session.totalSimulations % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      session.stats.simulationsPerSecond = session.totalSimulations / elapsed;
    }
  }
  
  // Get best action
  const bestAction = mctsOps.getBestAction(session);
  
  // Get action probabilities for analysis
  const root = session.nodes.get(session.rootNodeId)!;
  const actionProbs = mctsOps.getActionProbabilities(root.id, session);
  
  return {
    session,
    bestAction,
    actionProbabilities: actionProbs
  };
}

// Helper function to generate IDs
function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

## Pattern Combination Example

### Hybrid Approach: Tree of Thought with MCTS Evaluation

```typescript
// Combining Tree of Thought structure with MCTS evaluation
class HybridToTMCTS {
  private tot: TreeOfThoughtOperations;
  private mcts: MCTSOperations;
  
  constructor() {
    this.tot = new RouteOptimizationToT();
    this.mcts = new StrategyMCTS();
  }
  
  async exploreWithHybrid(problem: string): Promise<any> {
    // Use ToT for initial exploration
    const totSession = await this.exploreWithToT(problem);
    
    // Convert promising ToT branches to MCTS for deeper evaluation
    const promisingNodes = this.selectPromisingNodes(totSession);
    
    const results = [];
    for (const node of promisingNodes) {
      const mctsSession = this.convertToMCTS(node, totSession);
      const mctsResult = await this.evaluateWithMCTS(mctsSession);
      results.push({
        totPath: this.tot.getPath(node.id, totSession),
        mctsEvaluation: mctsResult
      });
    }
    
    return {
      totExploration: totSession,
      mctsEvaluations: results
    };
  }
  
  private selectPromisingNodes(totSession: TreeOfThoughtSession): TreeOfThoughtNode[] {
    // Select top-scoring leaf nodes
    const leaves = Array.from(totSession.nodes.values())
      .filter(node => node.childrenIds.length === 0 && node.status !== 'pruned')
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);
    
    return leaves;
  }
  
  private convertToMCTS(totNode: TreeOfThoughtNode, totSession: TreeOfThoughtSession): MCTSSession {
    // Convert ToT path to MCTS root
    // Implementation details...
    return {} as MCTSSession;
  }
  
  private async evaluateWithMCTS(mctsSession: MCTSSession): Promise<any> {
    // Run MCTS evaluation
    // Implementation details...
    return {};
  }
}
```

## Migration from Sequential Thinking

### Gradual Migration Strategy

```typescript
// Adapter to support legacy sequential thinking API
class SequentialThinkingAdapter {
  private patternRouter: PatternRouter;
  
  constructor() {
    this.patternRouter = new PatternRouter();
  }
  
  // Legacy API support
  async processSequentialThought(args: SequentialThinkingArgs): Promise<any> {
    // Convert to unified reasoning format
    const unifiedArgs: UnifiedReasoningArgs = {
      pattern: 'chain',
      operation: args.isRevision ? 'branch' : 'create',
      content: args.thought,
      sessionId: `legacy-${Date.now()}`,
      parameters: {
        thoughtNumber: args.thoughtNumber,
        totalThoughts: args.totalThoughts,
        isRevision: args.isRevision,
        revisesThought: args.revisesThought,
        branchFromThought: args.branchFromThought,
        branchId: args.branchId
      }
    };
    
    // Process with new system
    const result = await this.patternRouter.process(unifiedArgs);
    
    // Convert back to legacy format
    return this.convertToLegacyFormat(result);
  }
  
  // New API with pattern selection
  async processWithPattern(
    pattern: ReasoningPatternType,
    content: string,
    config?: any
  ): Promise<UnifiedReasoningResult> {
    const args: UnifiedReasoningArgs = {
      pattern,
      operation: 'create',
      content,
      sessionId: generateId(),
      parameters: config
    };
    
    return this.patternRouter.process(args);
  }
  
  private convertToLegacyFormat(result: UnifiedReasoningResult): any {
    // Convert unified result to legacy format
    return {
      thought: result.exportData?.content || "",
      thoughtNumber: result.exportData?.thoughtNumber || 1,
      totalThoughts: result.exportData?.totalThoughts || 1,
      nextThoughtNeeded: result.progress < 1.0,
      sessionContext: {
        sessionId: result.sessionId,
        progress: result.progress
      }
    };
  }
}

// Usage example showing migration
async function migrateThinkingPattern() {
  const adapter = new SequentialThinkingAdapter();
  
  // Old way (still works)
  const legacyResult = await adapter.processSequentialThought({
    thought: "Analyzing the problem",
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  });
  
  // New way with pattern selection
  const treeResult = await adapter.processWithPattern(
    'tree',
    "Analyzing the problem with multiple approaches",
    {
      maxDepth: 5,
      evaluationCriteria: ["feasibility", "cost", "impact"]
    }
  );
  
  // Gradual migration with hybrid approach
  const hybridResult = await adapter.processWithPattern(
    'chain',
    "Continue from legacy thought",
    {
      importFromLegacy: legacyResult,
      enableAdvancedFeatures: true
    }
  );
  
  return {
    legacy: legacyResult,
    tree: treeResult,
    hybrid: hybridResult
  };
}
```

## Best Practices

### 1. Pattern Selection Guide

```typescript
function selectBestPattern(problemCharacteristics: any): ReasoningPatternType {
  const { 
    needsExploration,
    hasMultipleSolutions,
    requiresBacktracking,
    hasUncertainty,
    needsRelationshipAnalysis
  } = problemCharacteristics;
  
  if (needsRelationshipAnalysis) {
    return 'graph';
  } else if (hasUncertainty && requiresBacktracking) {
    return 'mcts';
  } else if (hasMultipleSolutions && !needsExploration) {
    return 'beam';
  } else if (needsExploration) {
    return 'tree';
  } else {
    return 'chain';
  }
}
```

### 2. Performance Optimization

```typescript
class OptimizedReasoningEngine {
  private cache: Map<string, any> = new Map();
  private patterns: Map<ReasoningPatternType, ReasoningPattern<any, any>> = new Map();
  
  async processWithCaching(args: UnifiedReasoningArgs): Promise<UnifiedReasoningResult> {
    const cacheKey = this.generateCacheKey(args);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const pattern = this.patterns.get(args.pattern)!;
    const result = await this.processPattern(pattern, args);
    
    // Cache for reuse
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  private generateCacheKey(args: UnifiedReasoningArgs): string {
    return `${args.pattern}-${args.sessionId}-${args.operation}`;
  }
  
  private async processPattern(
    pattern: ReasoningPattern<any, any>,
    args: UnifiedReasoningArgs
  ): Promise<UnifiedReasoningResult> {
    // Implementation with performance monitoring
    const startTime = performance.now();
    
    try {
      // Process based on operation
      let result: any;
      
      switch (args.operation) {
        case 'create':
          const session = pattern.initializeSession(args.parameters);
          const node = pattern.operations.createNode(args.content!, session);
          result = { session, node };
          break;
        // ... other operations
      }
      
      const endTime = performance.now();
      
      return {
        sessionId: args.sessionId,
        pattern: args.pattern,
        currentNodeId: result.node?.id,
        suggestedActions: pattern.operations.getNextActions(result.session),
        progress: pattern.operations.evaluateProgress(result.session),
        success: true,
        exportData: {
          ...result,
          performanceMs: endTime - startTime
        }
      };
    } catch (error) {
      return {
        sessionId: args.sessionId,
        pattern: args.pattern,
        suggestedActions: [],
        progress: 0,
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: error.message,
          details: error
        }
      };
    }
  }
}
```

## Conclusion

These examples demonstrate how to implement and use various reasoning patterns beyond chain-of-thought. The key advantages include:

1. **Tree of Thought**: Systematic exploration with pruning
2. **Graph of Thought**: Complex relationship modeling
3. **Beam Search**: Parallel hypothesis tracking
4. **MCTS**: Uncertainty handling with simulation

The modular design allows for:
- Easy pattern selection based on problem characteristics
- Hybrid approaches combining multiple patterns
- Gradual migration from existing systems
- Performance optimization through caching and parallel processing

Choose the appropriate pattern based on your specific use case and requirements.