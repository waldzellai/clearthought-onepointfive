/**
 * Tree of Thought Pattern Handler Implementation
 *
 * Implements systematic exploration of multiple reasoning paths with
 * explicit branching and evaluation.
 */
import { v4 as uuidv4 } from 'uuid';
export class TreeOfThoughtHandler {
    defaultConfig = {
        maxDepth: 10,
        maxBranchingFactor: 3,
        defaultStrategy: 'best-first',
        pruningThreshold: 0.2,
        allowRevisiting: false,
        timeLimit: 60000 // 60 seconds
    };
    /**
     * Initialize a new Tree of Thought session
     */
    initializeSession(config) {
        const sessionId = uuidv4();
        const rootNodeId = uuidv4();
        const timestamp = new Date().toISOString();
        const rootNode = {
            id: rootNodeId,
            content: 'Root: Problem Statement',
            timestamp,
            childrenIds: [],
            depth: 0,
            status: 'active',
            metadata: {
                explorationStrategy: config?.defaultStrategy || this.defaultConfig.defaultStrategy
            }
        };
        const nodes = new Map();
        nodes.set(rootNodeId, rootNode);
        return {
            sessionId,
            patternType: 'tree',
            iteration: 0,
            nextStepNeeded: true,
            createdAt: timestamp,
            updatedAt: timestamp,
            rootNodeId,
            nodes,
            currentNodeId: rootNodeId,
            explorationBudget: 100,
            evaluationCriteria: [],
            solutionCriteria: '',
            config: { ...this.defaultConfig, ...config },
            stats: {
                nodesCreated: 1,
                nodesExplored: 0,
                nodesPruned: 0,
                solutionsFound: 0,
                maxDepthReached: 0,
                totalTime: 0
            }
        };
    }
    /**
     * Create a new node in the tree
     */
    createNode(content, parentId, session) {
        const parentNode = session.nodes.get(parentId);
        if (!parentNode) {
            throw new Error(`Parent node ${parentId} not found`);
        }
        if (parentNode.depth >= session.config.maxDepth) {
            throw new Error(`Maximum depth ${session.config.maxDepth} reached`);
        }
        if (parentNode.childrenIds.length >= session.config.maxBranchingFactor) {
            throw new Error(`Maximum branching factor ${session.config.maxBranchingFactor} reached`);
        }
        const nodeId = uuidv4();
        const node = {
            id: nodeId,
            content,
            timestamp: new Date().toISOString(),
            parentId,
            childrenIds: [],
            depth: parentNode.depth + 1,
            status: 'active',
            metadata: {}
        };
        // Add node to session
        session.nodes.set(nodeId, node);
        // Update parent's children
        parentNode.childrenIds.push(nodeId);
        // Update stats
        session.stats.nodesCreated++;
        session.stats.maxDepthReached = Math.max(session.stats.maxDepthReached, node.depth);
        return node;
    }
    /**
     * Expand a node by generating children
     */
    expand(nodeId, session) {
        const node = session.nodes.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }
        if (node.status !== 'active') {
            return [];
        }
        const children = [];
        const numChildren = Math.min(3, // Generate up to 3 children
        session.config.maxBranchingFactor - node.childrenIds.length);
        for (let i = 0; i < numChildren; i++) {
            const childContent = `${node.content} -> Branch ${i + 1}`;
            const child = this.createNode(childContent, nodeId, session);
            children.push(child);
        }
        node.status = 'explored';
        session.stats.nodesExplored++;
        return children;
    }
    /**
     * Evaluate a node's promise/score
     */
    evaluate(nodeId, session) {
        const node = session.nodes.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }
        // Simple heuristic evaluation based on depth and content length
        // In practice, this would use domain-specific evaluation
        const depthPenalty = node.depth / session.config.maxDepth;
        const contentScore = Math.min(node.content.length / 100, 1);
        const randomFactor = Math.random() * 0.2;
        const score = (contentScore + randomFactor) * (1 - depthPenalty * 0.5);
        node.score = score;
        if (node.metadata) {
            node.metadata.confidenceScore = score;
        }
        return score;
    }
    /**
     * Select next node to explore
     */
    selectNext(session) {
        const strategy = session.config.defaultStrategy;
        const activeNodes = Array.from(session.nodes.values())
            .filter(n => n.status === 'active');
        if (activeNodes.length === 0) {
            return null;
        }
        switch (strategy) {
            case 'depth-first':
                // Select deepest active node
                activeNodes.sort((a, b) => b.depth - a.depth);
                return activeNodes[0].id;
            case 'breadth-first':
                // Select shallowest active node
                activeNodes.sort((a, b) => a.depth - b.depth);
                return activeNodes[0].id;
            case 'best-first':
                // Evaluate all active nodes and select best
                activeNodes.forEach(node => {
                    if (node.score === undefined) {
                        this.evaluate(node.id, session);
                    }
                });
                activeNodes.sort((a, b) => (b.score || 0) - (a.score || 0));
                return activeNodes[0].id;
            default:
                return activeNodes[0].id;
        }
    }
    /**
     * Prune a subtree
     */
    prune(nodeId, reason, session) {
        const node = session.nodes.get(nodeId);
        if (!node) {
            return;
        }
        node.status = 'pruned';
        if (node.metadata) {
            node.metadata.pruningReason = reason;
        }
        session.stats.nodesPruned++;
        // Recursively prune children
        node.childrenIds.forEach(childId => {
            this.prune(childId, `Parent pruned: ${reason}`, session);
        });
    }
    /**
     * Check if node meets solution criteria
     */
    isSolution(nodeId, session) {
        const node = session.nodes.get(nodeId);
        if (!node) {
            return false;
        }
        // Simple check - in practice would use domain-specific criteria
        const score = node.score ?? this.evaluate(nodeId, session);
        if (score > 0.8) {
            node.status = 'solution';
            session.stats.solutionsFound++;
            return true;
        }
        return false;
    }
    /**
     * Get path from root to node
     */
    getPath(nodeId, session) {
        const path = [];
        let currentId = nodeId;
        while (currentId) {
            path.unshift(currentId);
            const node = session.nodes.get(currentId);
            currentId = node?.parentId;
        }
        return path;
    }
    /**
     * Get best path based on scores
     */
    getBestPath(session) {
        let bestScore = -Infinity;
        let bestNodeId = null;
        // Find leaf node with best cumulative score
        session.nodes.forEach(node => {
            if (node.childrenIds.length === 0 && node.status !== 'pruned') {
                const pathIds = this.getPath(node.id, session);
                const pathScore = pathIds.reduce((sum, id) => {
                    const n = session.nodes.get(id);
                    return sum + (n?.score || 0);
                }, 0);
                if (pathScore > bestScore) {
                    bestScore = pathScore;
                    bestNodeId = node.id;
                }
            }
        });
        if (bestNodeId) {
            const path = this.getPath(bestNodeId, session);
            session.bestPathIds = path;
            return path;
        }
        return [];
    }
    /**
     * Export session to sequential thinking format
     */
    exportToSequentialFormat(session) {
        const thoughts = [];
        const bestPath = session.bestPathIds || this.getBestPath(session);
        bestPath.forEach((nodeId, index) => {
            const node = session.nodes.get(nodeId);
            if (node) {
                thoughts.push({
                    thought: node.content,
                    thoughtNumber: index + 1,
                    totalThoughts: bestPath.length,
                    nextThoughtNeeded: index < bestPath.length - 1
                });
            }
        });
        return thoughts;
    }
    /**
     * Import from sequential thinking format
     */
    importFromSequentialFormat(thoughts) {
        const session = this.initializeSession();
        let parentId = session.rootNodeId;
        thoughts.forEach(thought => {
            const node = this.createNode(thought.thought, parentId, session);
            parentId = node.id;
        });
        return session;
    }
    /**
     * Run one iteration of tree exploration
     */
    runIteration(session) {
        const startTime = Date.now();
        // Select next node to explore
        const nodeId = this.selectNext(session);
        if (!nodeId) {
            session.nextStepNeeded = false;
            return;
        }
        // Expand the selected node
        const children = this.expand(nodeId, session);
        // Evaluate children
        children.forEach(child => {
            const score = this.evaluate(child.id, session);
            // Prune if below threshold
            if (session.config.pruningThreshold && score < session.config.pruningThreshold) {
                this.prune(child.id, `Score ${score} below threshold`, session);
            }
            // Check if solution
            this.isSolution(child.id, session);
        });
        // Update session
        session.iteration++;
        session.updatedAt = new Date().toISOString();
        session.stats.totalTime += Date.now() - startTime;
        // Check termination conditions
        if (session.stats.solutionsFound > 0 ||
            session.stats.nodesExplored >= session.explorationBudget ||
            (session.config.timeLimit && session.stats.totalTime > session.config.timeLimit)) {
            session.nextStepNeeded = false;
        }
    }
}
export default TreeOfThoughtHandler;
//# sourceMappingURL=tree-of-thought.js.map