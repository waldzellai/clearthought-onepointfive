/**
 * Graph of Thought Pattern Handler Implementation
 *
 * Implements non-hierarchical connections between thoughts with support
 * for complex reasoning patterns including cycles and multiple connections.
 */
import { GraphOfThoughtNode, GraphOfThoughtEdge, GraphOfThoughtSession, GraphOfThoughtConfig, GraphOfThoughtOperations, GraphEdgeType, NodeCluster } from '../../types/reasoning-patterns/graph-of-thought.js';
import { ThoughtData } from '../../types/index.js';
export declare class GraphOfThoughtHandler implements GraphOfThoughtOperations {
    private readonly defaultConfig;
    /**
     * Initialize a new Graph of Thought session
     */
    initializeSession(config?: Partial<GraphOfThoughtConfig>): GraphOfThoughtSession;
    /**
     * Add a node to the graph
     */
    addNode(nodeData: Omit<GraphOfThoughtNode, 'id' | 'incomingEdges' | 'outgoingEdges' | 'timestamp'>, session: GraphOfThoughtSession): GraphOfThoughtNode;
    /**
     * Connect two nodes with an edge
     */
    connectNodes(sourceId: string, targetId: string, edgeType: GraphEdgeType, weight: number, session: GraphOfThoughtSession): GraphOfThoughtEdge;
    /**
     * Find paths between two nodes
     */
    findPaths(startId: string, endId: string, session: GraphOfThoughtSession, maxPaths?: number): string[][];
    /**
     * Get node neighbors
     */
    getNeighbors(nodeId: string, direction: 'incoming' | 'outgoing' | 'both', session: GraphOfThoughtSession): string[];
    /**
     * Calculate node centrality (PageRank-like algorithm)
     */
    calculateCentrality(session: GraphOfThoughtSession): Map<string, number>;
    /**
     * Detect communities/clusters using simple connected components
     */
    detectCommunities(session: GraphOfThoughtSession): NodeCluster[];
    /**
     * Find contradictions in the graph
     */
    findContradictions(session: GraphOfThoughtSession): Array<{
        nodeIds: string[];
        description: string;
    }>;
    /**
     * Merge similar nodes
     */
    mergeNodes(nodeIds: string[], session: GraphOfThoughtSession): GraphOfThoughtNode;
    /**
     * Export to sequential thinking format
     */
    exportToSequentialFormat(session: GraphOfThoughtSession): ThoughtData[];
    /**
     * Import from sequential thinking format
     */
    importFromSequentialFormat(thoughts: ThoughtData[]): GraphOfThoughtSession;
    private wouldCreateCycle;
    private updateGraphStats;
    private exploreCluster;
    private calculateClusterCohesion;
    private findClusterCentroid;
    private findCycles;
    private removeNode;
    private removeEdge;
}
export default GraphOfThoughtHandler;
//# sourceMappingURL=graph-of-thought.d.ts.map