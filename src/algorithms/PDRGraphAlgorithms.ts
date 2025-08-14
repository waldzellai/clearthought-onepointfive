/**
 * PDR Graph Algorithms
 * Core algorithms for graph analysis and manipulation
 */

import { PDRKnowledgeGraph } from '../state/PDRKnowledgeGraph.js';
import { PDRNode, PDREdge, KnowledgeGap, Cluster } from '../types/reasoning-patterns/pdr.js';

export class PDRGraphAlgorithms {
  
  /**
   * Compute node centrality using PageRank algorithm
   * Handles dangling nodes (nodes with no outgoing edges)
   */
  computeCentrality(graph: PDRKnowledgeGraph): Map<string, number> {
    const nodes = graph.getAllNodes();
    if (nodes.length === 0) return new Map();
    
    const centrality = new Map<string, number>();
    
    // Initialize equal centrality
    nodes.forEach(node => centrality.set(node.id, 1 / nodes.length));
    
    // PageRank parameters
    const damping = 0.85;
    const iterations = 30;
    const tolerance = 0.0001;
    
    for (let i = 0; i < iterations; i++) {
      const newCentrality = new Map<string, number>();
      let danglingRank = 0;
      
      // Calculate dangling node contributions
      nodes.forEach(node => {
        const outDegree = graph.getOutgoingEdges(node.id).length;
        if (outDegree === 0) {
          danglingRank += centrality.get(node.id)!;
        }
      });
      
      // Calculate new centrality for each node
      let maxDiff = 0;
      nodes.forEach(node => {
        let rank = (1 - damping) / nodes.length;
        
        // Add dangling node contribution
        rank += damping * danglingRank / nodes.length;
        
        // Sum incoming link contributions
        const incoming = graph.getIncomingEdges(node.id);
        incoming.forEach(edge => {
          const sourceNode = graph.getNode(edge.sourceId);
          if (!sourceNode) return;
          
          const outDegree = graph.getOutgoingEdges(edge.sourceId).length;
          if (outDegree > 0) {
            // Standard PageRank: divide by out-degree, don't multiply by edge weight
            // Edge weight can be used as a threshold but not in the probability calculation
            rank += damping * (centrality.get(edge.sourceId)! / outDegree);
          }
        });
        
        newCentrality.set(node.id, rank);
        
        // Track convergence
        const oldRank = centrality.get(node.id)!;
        maxDiff = Math.max(maxDiff, Math.abs(rank - oldRank));
      });
      
      // Update centrality
      centrality.clear();
      newCentrality.forEach((v, k) => centrality.set(k, v));
      
      // Check for convergence
      if (maxDiff < tolerance) {
        break;
      }
    }
    
    return centrality;
  }
  
  /**
   * Detect connected components using BFS
   * Note: This is not true Louvain modularity optimization
   */
  detectConnectedComponents(graph: PDRKnowledgeGraph): Map<string, Cluster> {
    const clusters = new Map<string, Cluster>();
    const visited = new Set<string>();
    const nodes = graph.getAllNodes();
    
    nodes.forEach(node => {
      if (visited.has(node.id)) return;
      
      const clusterNodes = new Set<string>();
      const queue = [node.id];
      
      // BFS to find connected component
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        
        visited.add(current);
        clusterNodes.add(current);
        
        // Add strongly connected neighbors
        const edges = [...graph.getOutgoingEdges(current), ...graph.getIncomingEdges(current)];
        edges.forEach(edge => {
          const neighbor = edge.targetId === current ? edge.sourceId : edge.targetId;
          if (!visited.has(neighbor) && edge.weight > 0.6) {
            queue.push(neighbor);
          }
        });
      }
      
      // Create cluster if it has multiple nodes
      if (clusterNodes.size > 1) {
        const clusterId = `cluster-${clusters.size}`;
        clusters.set(clusterId, {
          id: clusterId,
          nodeIds: clusterNodes,
          centroid: node.id,
          coherence: this.calculateCoherence(graph, clusterNodes)
        });
      }
    });
    
    return clusters;
  }
  
  /**
   * Calculate cluster coherence (internal connectivity)
   */
  private calculateCoherence(graph: PDRKnowledgeGraph, nodeIds: Set<string>): number {
    if (nodeIds.size <= 1) return 1;
    
    let internalEdges = 0;
    let possibleEdges = nodeIds.size * (nodeIds.size - 1);
    
    nodeIds.forEach(nodeId => {
      const edges = graph.getOutgoingEdges(nodeId);
      edges.forEach(edge => {
        if (nodeIds.has(edge.targetId)) {
          internalEdges++;
        }
      });
    });
    
    return possibleEdges > 0 ? internalEdges / possibleEdges : 0;
  }
  
  /**
   * Find shortest path between nodes using Dijkstra's algorithm
   */
  findPath(graph: PDRKnowledgeGraph, startId: string, endId: string): string[] {
    // Validate inputs
    if (!graph.hasNode(startId) || !graph.hasNode(endId)) {
      throw new Error('Start or end node not found in graph');
    }
    
    if (startId === endId) return [startId];
    
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set(graph.getAllNodes().map(n => n.id));
    
    // Initialize distances
    graph.getAllNodes().forEach(node => {
      distances.set(node.id, node.id === startId ? 0 : Infinity);
    });
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: string | null = null;
      let minDist = Infinity;
      
      unvisited.forEach(nodeId => {
        const dist = distances.get(nodeId)!;
        if (dist < minDist) {
          minDist = dist;
          current = nodeId;
        }
      });
      
      if (!current || minDist === Infinity) break;
      if (current === endId) break; // Found target
      
      unvisited.delete(current);
      
      // Update distances to neighbors (current is guaranteed non-null here)
      const edges = graph.getOutgoingEdges(current!);
      edges.forEach(edge => {
        // Validate edge weight
        if (edge.weight <= 0) {
          console.warn(`Invalid edge weight ${edge.weight} for edge ${edge.id}`);
          return;
        }
        
        const alt = distances.get(current!)! + (1 / edge.weight); // Inverse weight as distance
        if (alt < distances.get(edge.targetId)!) {
          distances.set(edge.targetId, alt);
          previous.set(edge.targetId, current!);
        }
      });
    }
    
    // Reconstruct path
    const path: string[] = [];
    let current: string | undefined = endId;
    
    while (current && previous.has(current)) {
      path.unshift(current);
      current = previous.get(current);
    }
    
    if (current === startId) {
      path.unshift(startId);
      return path;
    }
    
    return []; // No path found
  }
  
  /**
   * Identify knowledge gaps in the graph
   */
  identifyGaps(graph: PDRKnowledgeGraph): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];
    
    // Find missing connections
    this.findMissingConnections(graph, gaps);
    
    // Find low confidence areas
    this.findLowConfidenceAreas(graph, gaps);
    
    // Find contradictions
    this.findContradictions(graph, gaps);
    
    // Find isolated clusters
    this.findIsolatedClusters(graph, gaps);
    
    // Sort by priority
    gaps.sort((a, b) => b.priority - a.priority);
    
    return gaps;
  }
  
  private findMissingConnections(graph: PDRKnowledgeGraph, gaps: KnowledgeGap[]): void {
    const nodes = graph.getAllNodes();
    
    // Look for nodes that should be connected based on tags
    nodes.forEach(node1 => {
      nodes.forEach(node2 => {
        if (node1.id >= node2.id) return;
        
        // Check tag overlap
        const commonTags = Array.from(node1.metadata.tags)
          .filter(tag => node2.metadata.tags.has(tag));
        
        if (commonTags.length > 0 && !graph.hasEdgeBetween(node1.id, node2.id)) {
          gaps.push({
            type: 'missing-link',
            nodeIds: [node1.id, node2.id],
            priority: commonTags.length * 0.3,
            description: `Potential connection between nodes with common tags: ${commonTags.join(', ')}`
          });
        }
      });
    });
  }
  
  private findLowConfidenceAreas(graph: PDRKnowledgeGraph, gaps: KnowledgeGap[]): void {
    const nodes = graph.getAllNodes();
    
    nodes.forEach(node => {
      if (node.scores.confidence < 0.3) {
        gaps.push({
          type: 'weak-evidence',
          nodeIds: [node.id],
          priority: 0.5,
          description: `Low confidence node: "${node.content.substring(0, 50)}..."`
        });
      }
    });
  }
  
  private findContradictions(graph: PDRKnowledgeGraph, gaps: KnowledgeGap[]): void {
    const contradictionEdges = graph.getEdgesByType('contradicts');
    
    contradictionEdges.forEach(edge => {
      gaps.push({
        type: 'contradiction',
        nodeIds: [edge.sourceId, edge.targetId],
        priority: edge.weight,
        description: 'Contradiction between nodes needs resolution'
      });
    });
  }
  
  private findIsolatedClusters(graph: PDRKnowledgeGraph, gaps: KnowledgeGap[]): void {
    const clusters = graph.getClusters();
    
    clusters.forEach(cluster => {
      // Check if cluster has external connections
      let externalConnections = 0;
      
      cluster.nodeIds.forEach(nodeId => {
        const edges = graph.getOutgoingEdges(nodeId);
        edges.forEach(edge => {
          if (!cluster.nodeIds.has(edge.targetId)) {
            externalConnections++;
          }
        });
      });
      
      if (externalConnections === 0 && cluster.nodeIds.size > 1) {
        gaps.push({
          type: 'isolated-cluster',
          nodeIds: Array.from(cluster.nodeIds),
          priority: 0.4,
          description: `Isolated cluster with ${cluster.nodeIds.size} nodes`
        });
      }
    });
  }
  
  /**
   * Select top K nodes based on centrality and diversity
   */
  selectTopNodes(
    graph: PDRKnowledgeGraph, 
    centrality: Map<string, number>,
    criteria: { topK?: number; perCluster?: number; diversityWeight?: number }
  ): string[] {
    const { topK = 10, perCluster = 3, diversityWeight = 0.3 } = criteria;
    const selected = new Set<string>();
    const clusters = graph.getClusters();
    
    // Select top nodes per cluster first
    if (clusters.size > 0 && perCluster > 0) {
      clusters.forEach(cluster => {
        const clusterNodes = Array.from(cluster.nodeIds)
          .map(id => ({ id, score: centrality.get(id) || 0 }))
          .sort((a, b) => b.score - a.score)
          .slice(0, perCluster);
        
        clusterNodes.forEach(node => selected.add(node.id));
      });
    }
    
    // Fill remaining slots with global top nodes
    if (selected.size < topK) {
      const sortedNodes = Array.from(centrality.entries())
        .sort((a, b) => b[1] - a[1])
        .filter(([id]) => !selected.has(id));
      
      for (const [nodeId] of sortedNodes) {
        if (selected.size >= topK) break;
        
        // Apply diversity penalty if too close to already selected nodes
        const node = graph.getNode(nodeId);
        if (!node) continue;
        
        let diversityScore = 1;
        selected.forEach(selectedId => {
          const path = this.findPath(graph, nodeId, selectedId);
          if (path.length > 0 && path.length < 3) {
            diversityScore *= (1 - diversityWeight);
          }
        });
        
        if (diversityScore > 0.5) {
          selected.add(nodeId);
        }
      }
    }
    
    return Array.from(selected);
  }
}