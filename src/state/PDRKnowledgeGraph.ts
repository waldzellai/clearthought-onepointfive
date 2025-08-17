/**
 * PDR Knowledge Graph Implementation
 * In-memory graph with hierarchical + network structure
 */

import type {
	Cluster,
	EdgeType,
	GraphMetrics,
	HierarchicalStructure,
	KnowledgeGap,
	PDREdge,
	PDRNode,
} from "../types/reasoning-patterns/pdr.js";

export type DeploymentMode = "development" | "standard" | "extended" | "cloud";

interface ResourceLimits {
	nodes: number;
	edges: number;
	depth: number;
	targetMemoryMB: number;
	requiresFlag?: string;
}

export class PDRKnowledgeGraph {
	private nodes: Map<string, PDRNode>;
	private edges: Map<string, PDREdge>;
	private edgesBySource: Map<string, Set<string>>;
	private hierarchy: HierarchicalStructure;
	private clusters: Map<string, Cluster>;
	private metrics: GraphMetrics;
	private readonly sessionId: string;
	private readonly mode: DeploymentMode;

	// Resource limits based on Node.js/V8 constraints
	private static readonly LIMITS: Record<DeploymentMode, ResourceLimits> = {
		development: {
			nodes: 500,
			edges: 2500,
			depth: 8,
			targetMemoryMB: 10,
		},
		standard: {
			nodes: 5000,
			edges: 25000,
			depth: 10,
			targetMemoryMB: 50,
		},
		extended: {
			nodes: 20000,
			edges: 100000,
			depth: 12,
			targetMemoryMB: 200,
		},
		cloud: {
			nodes: 50000,
			edges: 250000,
			depth: 15,
			targetMemoryMB: 500,
			requiresFlag: "--max-old-space-size=2048",
		},
	};

	constructor(sessionId: string, mode: DeploymentMode = "standard") {
		this.sessionId = sessionId;
		this.mode = mode;
		this.nodes = new Map();
		this.edges = new Map();
		this.edgesBySource = new Map();
		this.hierarchy = {
			root: "",
			levels: new Map(),
			parentChild: new Map(),
		};
		this.clusters = new Map();
		this.metrics = {
			nodeCount: 0,
			edgeCount: 0,
			avgDegree: 0,
			maxDepth: 0,
			clusterCount: 0,
			gaps: [],
		};
	}

	private get limits(): ResourceLimits {
		return PDRKnowledgeGraph.LIMITS[this.mode];
	}

	createNode(data: Partial<PDRNode>): string {
		// Enforce resource limits
		if (this.nodes.size >= this.limits.nodes) {
			throw new Error(
				`Maximum node limit (${this.limits.nodes}) reached for mode ${this.mode}`,
			);
		}

		if (data.depth && data.depth > this.limits.depth) {
			throw new Error(`Maximum depth (${this.limits.depth}) exceeded`);
		}

		// Generate ID
		const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const node: PDRNode = {
			id,
			content: data.content || "",
			type: data.type || "subject",
			depth: data.depth || 0,
			parentId: data.parentId,
			childrenIds: new Set(data.childrenIds || []),
			incomingEdges: new Set(),
			outgoingEdges: new Set(),
			scores: {
				confidence: data.scores?.confidence || 0.5,
				centrality: 0,
				passScores: new Map(),
			},
			metadata: {
				createdInPass: data.metadata?.createdInPass || "initial",
				lastModified: new Date().toISOString(),
				tags: new Set(data.metadata?.tags || []),
				patternUsed: data.metadata?.patternUsed,
				selected: false,
			},
			artifacts: data.artifacts,
		};

		this.nodes.set(id, node);

		// Update hierarchy
		if (node.parentId && this.nodes.has(node.parentId)) {
			const parent = this.nodes.get(node.parentId)!;
			parent.childrenIds.add(id);

			if (!this.hierarchy.parentChild.has(node.parentId)) {
				this.hierarchy.parentChild.set(node.parentId, []);
			}
			this.hierarchy.parentChild.get(node.parentId)?.push(id);
		}

		// Update depth levels
		if (!this.hierarchy.levels.has(node.depth)) {
			this.hierarchy.levels.set(node.depth, new Set());
		}
		this.hierarchy.levels.get(node.depth)?.add(id);

		// Set root if first node
		if (this.nodes.size === 1) {
			this.hierarchy.root = id;
		}

		// Update metrics
		this.metrics.nodeCount = this.nodes.size;
		this.metrics.maxDepth = Math.max(this.metrics.maxDepth, node.depth);

		return id;
	}

	addEdge(data: Partial<PDREdge>): string {
		// Enforce resource limits
		if (this.edges.size >= this.limits.edges) {
			throw new Error(
				`Maximum edge limit (${this.limits.edges}) reached for mode ${this.mode}`,
			);
		}

		// Validate nodes exist
		if (!data.sourceId || !data.targetId) {
			throw new Error("Source and target IDs are required");
		}

		if (!this.nodes.has(data.sourceId) || !this.nodes.has(data.targetId)) {
			throw new Error("Source or target node does not exist");
		}

		// Validate weight
		if (data.weight !== undefined && (data.weight < 0 || data.weight > 1)) {
			throw new Error("Edge weight must be between 0 and 1");
		}

		const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const edge: PDREdge = {
			id,
			sourceId: data.sourceId,
			targetId: data.targetId,
			type: data.type || "relates-to",
			weight: data.weight || 0.5,
			metadata: {
				createdInPass: data.metadata?.createdInPass || "initial",
				confidence: data.metadata?.confidence || 0.5,
				justification: data.metadata?.justification,
				bidirectional: data.metadata?.bidirectional || false,
			},
		};

		// Store edge
		this.edges.set(id, edge);

		// Update source index
		if (!this.edgesBySource.has(edge.sourceId)) {
			this.edgesBySource.set(edge.sourceId, new Set());
		}
		this.edgesBySource.get(edge.sourceId)?.add(id);

		// Update node references
		this.nodes.get(edge.sourceId)?.outgoingEdges.add(id);
		this.nodes.get(edge.targetId)?.incomingEdges.add(id);

		// Handle bidirectional edges
		if (edge.metadata.bidirectional) {
			this.nodes.get(edge.targetId)?.outgoingEdges.add(id);
			this.nodes.get(edge.sourceId)?.incomingEdges.add(id);
		}

		// Update metrics
		this.metrics.edgeCount = this.edges.size;
		this.updateAverageDegree();

		return id;
	}

	private updateAverageDegree(): void {
		if (this.nodes.size === 0) {
			this.metrics.avgDegree = 0;
			return;
		}

		let totalDegree = 0;
		this.nodes.forEach((node) => {
			totalDegree += node.incomingEdges.size + node.outgoingEdges.size;
		});

		this.metrics.avgDegree = totalDegree / this.nodes.size;
	}

	// Query methods
	getNode(nodeId: string): PDRNode | undefined {
		return this.nodes.get(nodeId);
	}

	getEdge(edgeId: string): PDREdge | undefined {
		return this.edges.get(edgeId);
	}

	getAllNodes(): PDRNode[] {
		return Array.from(this.nodes.values());
	}

	getAllEdges(): PDREdge[] {
		return Array.from(this.edges.values());
	}

	getOutgoingEdges(nodeId: string): PDREdge[] {
		const node = this.nodes.get(nodeId);
		if (!node) return [];

		return Array.from(node.outgoingEdges)
			.map((edgeId) => this.edges.get(edgeId))
			.filter((edge): edge is PDREdge => edge !== undefined);
	}

	getIncomingEdges(nodeId: string): PDREdge[] {
		const node = this.nodes.get(nodeId);
		if (!node) return [];

		return Array.from(node.incomingEdges)
			.map((edgeId) => this.edges.get(edgeId))
			.filter((edge): edge is PDREdge => edge !== undefined);
	}

	getEdgesByType(type: EdgeType): PDREdge[] {
		return Array.from(this.edges.values()).filter((edge) => edge.type === type);
	}

	hasNode(nodeId: string): boolean {
		return this.nodes.has(nodeId);
	}

	hasEdgeBetween(nodeId1: string, nodeId2: string): boolean {
		const edges1 = this.getOutgoingEdges(nodeId1);
		return edges1.some((edge) => edge.targetId === nodeId2);
	}

	// Modification methods
	updateNode(nodeId: string, updates: Partial<PDRNode>): void {
		const node = this.nodes.get(nodeId);
		if (!node) throw new Error(`Node ${nodeId} not found`);

		// Update allowed fields
		if (updates.content !== undefined) node.content = updates.content;
		if (updates.type !== undefined) node.type = updates.type;
		if (updates.scores) {
			Object.assign(node.scores, updates.scores);
		}
		if (updates.metadata) {
			Object.assign(node.metadata, updates.metadata);
			node.metadata.lastModified = new Date().toISOString();
		}
		if (updates.artifacts) {
			node.artifacts = { ...node.artifacts, ...updates.artifacts };
		}
	}

	markSelected(nodeId: string, selected: boolean): void {
		const node = this.nodes.get(nodeId);
		if (node) {
			node.metadata.selected = selected;
		}
	}

	getSelectedNodes(): PDRNode[] {
		return Array.from(this.nodes.values()).filter(
			(node) => node.metadata.selected,
		);
	}

	// Cluster management
	setClusters(clusters: Map<string, Cluster>): void {
		this.clusters = clusters;
		this.metrics.clusterCount = clusters.size;
	}

	getClusters(): Map<string, Cluster> {
		return this.clusters;
	}

	getCluster(clusterId: string): Cluster | undefined {
		return this.clusters.get(clusterId);
	}

	// Centrality update
	updateCentrality(centrality: Map<string, number>): void {
		centrality.forEach((score, nodeId) => {
			const node = this.nodes.get(nodeId);
			if (node) {
				node.scores.centrality = score;
			}
		});
	}

	// Gap tracking
	setGaps(gaps: KnowledgeGap[]): void {
		this.metrics.gaps = gaps;
	}

	getGaps(): KnowledgeGap[] {
		return this.metrics.gaps;
	}

	// Metrics
	getMetrics(): GraphMetrics {
		return { ...this.metrics };
	}

	getNodeCount(): number {
		return this.nodes.size;
	}

	getEdgeCount(): number {
		return this.edges.size;
	}

	// Serialization
	serialize(): string {
		return JSON.stringify({
			sessionId: this.sessionId,
			mode: this.mode,
			nodes: Array.from(this.nodes.entries()).map(([id, node]) => [
				id,
				{
					...node,
					childrenIds: Array.from(node.childrenIds),
					incomingEdges: Array.from(node.incomingEdges),
					outgoingEdges: Array.from(node.outgoingEdges),
					metadata: {
						...node.metadata,
						tags: Array.from(node.metadata.tags),
					},
					scores: {
						...node.scores,
						passScores: Array.from(node.scores.passScores.entries()),
					},
				},
			]),
			edges: Array.from(this.edges.entries()),
			edgesBySource: Array.from(this.edgesBySource.entries()).map(([k, v]) => [
				k,
				Array.from(v),
			]),
			hierarchy: {
				...this.hierarchy,
				levels: Array.from(this.hierarchy.levels.entries()).map(([k, v]) => [
					k,
					Array.from(v),
				]),
			},
			clusters: Array.from(this.clusters.entries()).map(([id, cluster]) => [
				id,
				{
					...cluster,
					nodeIds: Array.from(cluster.nodeIds),
				},
			]),
			metrics: this.metrics,
		});
	}

	static deserialize(data: string): PDRKnowledgeGraph {
		const parsed = JSON.parse(data);
		const graph = new PDRKnowledgeGraph(parsed.sessionId, parsed.mode);

		// Restore nodes
		parsed.nodes.forEach(([id, nodeData]: [string, any]) => {
			const node: PDRNode = {
				...nodeData,
				childrenIds: new Set(nodeData.childrenIds),
				incomingEdges: new Set(nodeData.incomingEdges),
				outgoingEdges: new Set(nodeData.outgoingEdges),
				metadata: {
					...nodeData.metadata,
					tags: new Set(nodeData.metadata.tags),
				},
				scores: {
					...nodeData.scores,
					passScores: new Map(nodeData.scores.passScores),
				},
			};
			graph.nodes.set(id, node);
		});

		// Restore edges
		parsed.edges.forEach(([id, edge]: [string, PDREdge]) => {
			graph.edges.set(id, edge);
		});

		// Restore indices
		parsed.edgesBySource.forEach(([k, v]: [string, string[]]) => {
			graph.edgesBySource.set(k, new Set(v));
		});

		// Restore hierarchy
		graph.hierarchy = {
			...parsed.hierarchy,
			levels: new Map(
				parsed.hierarchy.levels.map(([k, v]: [number, string[]]) => [
					k,
					new Set(v),
				]),
			),
		};

		// Restore clusters
		parsed.clusters.forEach(([id, clusterData]: [string, any]) => {
			graph.clusters.set(id, {
				...clusterData,
				nodeIds: new Set(clusterData.nodeIds),
			});
		});

		graph.metrics = parsed.metrics;

		return graph;
	}

	getMode(): DeploymentMode {
		return this.mode;
	}

	getSessionId(): string {
		return this.sessionId;
	}

	getResourceLimits() {
		return PDRKnowledgeGraph.LIMITS[this.mode];
	}

	removeNode(nodeId: string): boolean {
		const node = this.nodes.get(nodeId);
		if (!node) return false;

		// Remove all edges connected to this node
		const edgesToRemove = [
			...this.getIncomingEdges(nodeId),
			...this.getOutgoingEdges(nodeId),
		];

		edgesToRemove.forEach((edge) => this.removeEdge(edge.id));

		// Remove from parent's children
		if (node.parentId) {
			const parent = this.nodes.get(node.parentId);
			if (parent) {
				parent.childrenIds.delete(nodeId);
			}
		}

		// Remove node
		this.nodes.delete(nodeId);
		return true;
	}

	removeEdge(edgeId: string): boolean {
		return this.edges.delete(edgeId);
	}
}
