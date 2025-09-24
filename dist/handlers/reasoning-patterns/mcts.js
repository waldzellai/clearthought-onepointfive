/**
 * Monte Carlo Tree Search (MCTS) Pattern Handler Implementation
 *
 * Combines tree exploration with random sampling for decision-making
 * under uncertainty using selection, expansion, simulation, and backpropagation.
 */
import { v4 as uuidv4 } from 'uuid';
export class MCTSHandler {
    defaultConfig = {
        ucbVariant: 'ucb1',
        useRAVE: false,
        raveBias: 0.5,
        progressiveWidening: {
            enabled: false,
            alpha: 0.5,
            beta: 0.0
        },
        virtualLoss: 0,
        reuseTree: false,
        usePriors: false,
        useTranspositions: false
    };
    defaultTerminationCriteria = {
        maxSimulations: 1000,
        timeLimit: 60000,
        confidenceThreshold: 0.95,
        minVisitsThreshold: 10
    };
    /**
     * Initialize a new MCTS session
     */
    initializeSession(explorationConstant = 1.414, config) {
        const sessionId = uuidv4();
        const rootNodeId = uuidv4();
        const timestamp = new Date().toISOString();
        // Create root node
        const rootNode = {
            id: rootNodeId,
            content: 'Root: Initial State',
            timestamp,
            childrenIds: [],
            visits: 0,
            totalValue: 0,
            averageValue: 0,
            untriedActions: this.generateInitialActions(),
            isTerminal: false,
            metadata: {
                depth: 0
            }
        };
        const nodes = new Map();
        nodes.set(rootNodeId, rootNode);
        return {
            sessionId,
            patternType: 'mcts',
            iteration: 0,
            nextStepNeeded: true,
            createdAt: timestamp,
            updatedAt: timestamp,
            rootNodeId,
            nodes,
            explorationConstant,
            simulationDepth: 10,
            totalSimulations: 0,
            rolloutPolicy: 'random',
            terminationCriteria: { ...this.defaultTerminationCriteria },
            config: { ...this.defaultConfig, ...config },
            stats: {
                totalNodes: 1,
                maxDepth: 0,
                averageBranchingFactor: 0,
                simulationsPerSecond: 0,
                bestActionVisits: 0,
                bestActionValue: 0,
                explorationRatio: 0,
                effectiveBranchingFactor: 0
            }
        };
    }
    /**
     * Generate initial actions for root node
     */
    generateInitialActions() {
        // In practice, these would be domain-specific
        return ['action1', 'action2', 'action3', 'action4', 'action5'];
    }
    /**
     * Select a leaf node using UCB
     */
    selectLeaf(session) {
        let currentNode = session.nodes.get(session.rootNodeId);
        while (!this.isLeaf(currentNode) && !currentNode.isTerminal) {
            currentNode = this.selectBestChild(currentNode, session);
        }
        return currentNode;
    }
    /**
     * Check if node is a leaf (has untried actions or no children)
     */
    isLeaf(node) {
        return (node.untriedActions && node.untriedActions.length > 0) ||
            node.childrenIds.length === 0;
    }
    /**
     * Select best child using UCB formula
     */
    selectBestChild(node, session) {
        let bestChild = null;
        let bestUCB = -Infinity;
        node.childrenIds.forEach(childId => {
            const child = session.nodes.get(childId);
            if (child) {
                const ucb = this.calculateUCB(child.id, node.visits, session);
                if (ucb > bestUCB) {
                    bestUCB = ucb;
                    bestChild = child;
                }
            }
        });
        return bestChild || session.nodes.get(node.childrenIds[0]);
    }
    /**
     * Calculate UCB score for a node
     */
    calculateUCB(nodeId, parentVisits, session) {
        const node = session.nodes.get(nodeId);
        if (!node)
            return 0;
        const components = {
            exploitationTerm: 0,
            explorationTerm: 0,
            ucbScore: 0
        };
        // Handle unvisited nodes
        if (node.visits === 0) {
            components.ucbScore = Infinity;
            return components.ucbScore;
        }
        // Calculate components based on variant
        switch (session.config.ucbVariant) {
            case 'ucb1':
                components.exploitationTerm = node.averageValue;
                components.explorationTerm = session.explorationConstant *
                    Math.sqrt(Math.log(parentVisits) / node.visits);
                break;
            case 'ucb1-tuned':
                components.exploitationTerm = node.averageValue;
                const variance = this.calculateVariance(node);
                const V = variance + Math.sqrt(2 * Math.log(parentVisits) / node.visits);
                components.explorationTerm = Math.sqrt(Math.log(parentVisits) / node.visits *
                    Math.min(0.25, V));
                break;
            case 'puct':
                // PUCT formula (used in AlphaGo)
                components.exploitationTerm = node.averageValue;
                const prior = node.metadata?.priorProbability || 1 / (node.parentId ?
                    session.nodes.get(node.parentId)?.childrenIds.length || 1 : 1);
                components.priorBias = prior;
                components.explorationTerm = session.explorationConstant * prior *
                    Math.sqrt(parentVisits) / (1 + node.visits);
                break;
            default:
                components.exploitationTerm = node.averageValue;
                components.explorationTerm = session.explorationConstant *
                    Math.sqrt(Math.log(parentVisits) / node.visits);
        }
        // Add RAVE term if enabled
        if (session.config.useRAVE && node.metadata?.action) {
            const raveStats = this.getRAVEStatistics(node.metadata.action, session);
            if (raveStats.visits > 0) {
                const beta = Math.sqrt(session.config.raveBias /
                    (3 * node.visits + session.config.raveBias));
                components.raveTerm = beta * raveStats.averageValue;
                components.exploitationTerm = (1 - beta) * components.exploitationTerm +
                    beta * raveStats.averageValue;
            }
        }
        components.ucbScore = components.exploitationTerm + components.explorationTerm +
            (components.priorBias || 0);
        // Store UCB score in node
        node.ucbScore = components.ucbScore;
        return components.ucbScore;
    }
    /**
     * Calculate variance for UCB1-Tuned
     */
    calculateVariance(node) {
        if (node.visits <= 1)
            return 0;
        // Simplified variance calculation
        // In practice, would track individual simulation values
        const mean = node.averageValue;
        return mean * (1 - mean); // Bernoulli variance approximation
    }
    /**
     * Get RAVE statistics for an action
     */
    getRAVEStatistics(action, session) {
        // Simplified RAVE - in practice would track action values across all simulations
        let totalVisits = 0;
        let totalValue = 0;
        session.nodes.forEach(node => {
            if (node.metadata?.action === action) {
                totalVisits += node.visits;
                totalValue += node.totalValue;
            }
        });
        return {
            visits: totalVisits,
            averageValue: totalVisits > 0 ? totalValue / totalVisits : 0
        };
    }
    /**
     * Expand a node by adding a child
     */
    expandNode(nodeId, session) {
        const node = session.nodes.get(nodeId);
        if (!node || !node.untriedActions || node.untriedActions.length === 0) {
            throw new Error('Cannot expand node: no untried actions');
        }
        // Select random untried action
        const actionIndex = Math.floor(Math.random() * node.untriedActions.length);
        const action = node.untriedActions[actionIndex];
        // Remove action from untried list
        node.untriedActions.splice(actionIndex, 1);
        // Create child node
        const childId = uuidv4();
        const childNode = {
            id: childId,
            content: `${node.content} -> ${action}`,
            timestamp: new Date().toISOString(),
            parentId: nodeId,
            childrenIds: [],
            visits: 0,
            totalValue: 0,
            averageValue: 0,
            untriedActions: this.generateActionsForState(action),
            isTerminal: this.isTerminalState(action, session),
            metadata: {
                action,
                depth: (node.metadata?.depth || 0) + 1,
                stateRepresentation: this.getStateRepresentation(node, action)
            }
        };
        // Add child to tree
        session.nodes.set(childId, childNode);
        node.childrenIds.push(childId);
        // Update statistics
        session.stats.totalNodes++;
        session.stats.maxDepth = Math.max(session.stats.maxDepth, childNode.metadata?.depth || 0);
        return childNode;
    }
    /**
     * Generate actions for a given state
     */
    generateActionsForState(previousAction) {
        // In practice, would generate based on game/problem state
        const actions = ['continue', 'branch_left', 'branch_right', 'backtrack', 'terminate'];
        return actions.filter(a => a !== previousAction);
    }
    /**
     * Check if state is terminal
     */
    isTerminalState(action, session) {
        // Simple heuristic - terminate after certain actions or depth
        return action === 'terminate' ||
            session.stats.maxDepth >= session.simulationDepth;
    }
    /**
     * Get state representation for a node
     */
    getStateRepresentation(parentNode, action) {
        // In practice, would encode the actual game/problem state
        return {
            path: parentNode.content + ' -> ' + action,
            depth: (parentNode.metadata?.depth || 0) + 1,
            action
        };
    }
    /**
     * Simulate from a node to terminal state
     */
    simulate(nodeId, session) {
        const startNode = session.nodes.get(nodeId);
        if (!startNode)
            return 0;
        const result = {
            value: 0,
            path: [nodeId],
            steps: 0,
            duration: Date.now()
        };
        // Perform rollout based on policy
        switch (session.rolloutPolicy) {
            case 'random':
                result.value = this.randomRollout(startNode, session, result);
                break;
            case 'heuristic':
                result.value = this.heuristicRollout(startNode, session, result);
                break;
            case 'neural':
                result.value = this.neuralRollout(startNode, session, result);
                break;
            case 'hybrid':
                result.value = Math.random() < 0.5 ?
                    this.randomRollout(startNode, session, result) :
                    this.heuristicRollout(startNode, session, result);
                break;
        }
        if (result.duration !== undefined) {
            result.duration = Date.now() - result.duration;
        }
        return result.value;
    }
    /**
     * Random rollout policy
     */
    randomRollout(startNode, session, result) {
        let currentDepth = startNode.metadata?.depth || 0;
        let value = 0;
        while (currentDepth < session.simulationDepth && !startNode.isTerminal) {
            // Random action selection
            const randomValue = Math.random();
            value += randomValue;
            currentDepth++;
            result.steps++;
            // Early termination based on random chance
            if (Math.random() < 0.1)
                break;
        }
        // Normalize value
        return result.steps > 0 ? value / result.steps : 0;
    }
    /**
     * Heuristic-based rollout policy
     */
    heuristicRollout(startNode, session, result) {
        let currentDepth = startNode.metadata?.depth || 0;
        let value = 0;
        while (currentDepth < session.simulationDepth && !startNode.isTerminal) {
            // Use heuristic to guide simulation
            const heuristicValue = this.evaluateHeuristic(startNode, currentDepth);
            value += heuristicValue;
            currentDepth++;
            result.steps++;
            // Terminate if heuristic indicates solution
            if (heuristicValue > 0.9)
                break;
        }
        return result.steps > 0 ? value / result.steps : 0;
    }
    /**
     * Neural network guided rollout (placeholder)
     */
    neuralRollout(startNode, session, result) {
        // In practice, would use a neural network for value estimation
        // For now, use a weighted random approach
        return this.heuristicRollout(startNode, session, result) * 0.7 +
            this.randomRollout(startNode, session, result) * 0.3;
    }
    /**
     * Evaluate heuristic value for a state
     */
    evaluateHeuristic(node, depth) {
        // Simple heuristic based on depth and node properties
        const depthBonus = Math.max(0, 1 - depth / 20);
        const explorationBonus = node.visits > 0 ? 1 / (1 + node.visits) : 0.5;
        const randomFactor = Math.random() * 0.2;
        return (depthBonus * 0.5 + explorationBonus * 0.3 + randomFactor);
    }
    /**
     * Backpropagate simulation results
     */
    backpropagate(leafNodeId, value, session) {
        let currentNodeId = leafNodeId;
        while (currentNodeId) {
            const node = session.nodes.get(currentNodeId);
            if (!node)
                break;
            // Update node statistics
            node.visits++;
            node.totalValue += value;
            node.averageValue = node.totalValue / node.visits;
            // Update win/loss/draw statistics if tracked
            if (node.metadata && !node.metadata.outcomes) {
                node.metadata.outcomes = { wins: 0, losses: 0, draws: 0 };
            }
            if (node.metadata?.outcomes) {
                if (value > 0.6)
                    node.metadata.outcomes.wins++;
                else if (value < 0.4)
                    node.metadata.outcomes.losses++;
                else
                    node.metadata.outcomes.draws++;
            }
            // Move to parent
            currentNodeId = node.parentId;
            // Alternate value for two-player games (minimax)
            // value = 1 - value;
        }
    }
    /**
     * Get best action from root
     */
    getBestAction(session) {
        const rootNode = session.nodes.get(session.rootNodeId);
        if (!rootNode || rootNode.childrenIds.length === 0) {
            return 'no_action';
        }
        // Select child with most visits (robust child)
        let bestChild = null;
        let maxVisits = -1;
        rootNode.childrenIds.forEach(childId => {
            const child = session.nodes.get(childId);
            if (child && child.visits > maxVisits) {
                maxVisits = child.visits;
                bestChild = child;
            }
        });
        // Update statistics
        if (bestChild) {
            const child = bestChild;
            session.stats.bestActionVisits = child.visits;
            session.stats.bestActionValue = child.averageValue;
            session.bestLeafNodeId = child.id;
        }
        return bestChild?.metadata?.action || 'no_action';
    }
    /**
     * Get action probabilities from a node
     */
    getActionProbabilities(nodeId, session) {
        const node = session.nodes.get(nodeId);
        const probabilities = new Map();
        if (!node || node.childrenIds.length === 0) {
            return probabilities;
        }
        const totalVisits = node.childrenIds.reduce((sum, childId) => {
            const child = session.nodes.get(childId);
            return sum + (child?.visits || 0);
        }, 0);
        if (totalVisits === 0)
            return probabilities;
        node.childrenIds.forEach(childId => {
            const child = session.nodes.get(childId);
            if (child && child.metadata?.action) {
                probabilities.set(child.metadata.action, child.visits / totalVisits);
            }
        });
        return probabilities;
    }
    /**
     * Run one complete MCTS iteration
     */
    runIteration(session) {
        const startTime = Date.now();
        // Selection
        session.currentPhase = 'selection';
        const leafNode = this.selectLeaf(session);
        // Expansion
        session.currentPhase = 'expansion';
        let selectedNode = leafNode;
        if (!leafNode.isTerminal && leafNode.untriedActions && leafNode.untriedActions.length > 0) {
            selectedNode = this.expandNode(leafNode.id, session);
        }
        // Simulation
        session.currentPhase = 'simulation';
        if (session.currentSimulationPath) {
            session.currentSimulationPath = [selectedNode.id];
        }
        else {
            session.currentSimulationPath = [selectedNode.id];
        }
        const value = this.simulate(selectedNode.id, session);
        // Backpropagation
        session.currentPhase = 'backpropagation';
        this.backpropagate(selectedNode.id, value, session);
        // Update session
        session.totalSimulations++;
        session.iteration++;
        session.updatedAt = new Date().toISOString();
        // Update statistics
        this.updateStatistics(session, Date.now() - startTime);
        // Check termination
        if (this.checkTermination(session)) {
            session.nextStepNeeded = false;
        }
    }
    /**
     * Check termination criteria
     */
    checkTermination(session) {
        const criteria = session.terminationCriteria;
        // Max simulations
        if (criteria.maxSimulations && session.totalSimulations >= criteria.maxSimulations) {
            return true;
        }
        // Time limit
        if (criteria.timeLimit) {
            const elapsed = Date.now() - new Date(session.createdAt).getTime();
            if (elapsed >= criteria.timeLimit) {
                return true;
            }
        }
        // Confidence threshold
        if (criteria.confidenceThreshold) {
            const probabilities = this.getActionProbabilities(session.rootNodeId, session);
            const maxProb = Math.max(...probabilities.values());
            if (maxProb >= criteria.confidenceThreshold) {
                return true;
            }
        }
        // Minimum visits for best action
        if (criteria.minVisitsThreshold && session.stats.bestActionVisits && session.stats.bestActionVisits >= criteria.minVisitsThreshold) {
            return true;
        }
        return false;
    }
    /**
     * Update session statistics
     */
    updateStatistics(session, iterationTime) {
        // Calculate simulations per second
        const totalTime = Date.now() - new Date(session.createdAt).getTime();
        session.stats.simulationsPerSecond = session.totalSimulations / (totalTime / 1000);
        // Calculate average branching factor
        let totalBranches = 0;
        let nodeCount = 0;
        session.nodes.forEach(node => {
            if (node.childrenIds.length > 0) {
                totalBranches += node.childrenIds.length;
                nodeCount++;
            }
        });
        session.stats.averageBranchingFactor = nodeCount > 0 ? totalBranches / nodeCount : 0;
        // Calculate effective branching factor (nodes with visits > threshold)
        const visitThreshold = session.totalSimulations * 0.01;
        let effectiveBranches = 0;
        session.nodes.forEach(node => {
            if (node.visits > visitThreshold) {
                effectiveBranches++;
            }
        });
        session.stats.effectiveBranchingFactor = effectiveBranches / session.stats.maxDepth;
        // Calculate exploration ratio
        const rootNode = session.nodes.get(session.rootNodeId);
        if (rootNode) {
            const exploredChildren = rootNode.childrenIds.filter(id => {
                const child = session.nodes.get(id);
                return child && child.visits > 0;
            }).length;
            session.stats.explorationRatio = rootNode.childrenIds.length > 0 ?
                exploredChildren / rootNode.childrenIds.length : 0;
        }
    }
    /**
     * Export to sequential thinking format
     */
    exportToSequentialFormat(session) {
        const thoughts = [];
        // Find best path from root to best leaf
        const bestPath = this.getBestPath(session);
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
     * Get best path through the tree
     */
    getBestPath(session) {
        const path = [];
        let currentNodeId = session.rootNodeId;
        while (currentNodeId) {
            path.push(currentNodeId);
            const node = session.nodes.get(currentNodeId);
            if (!node || node.childrenIds.length === 0)
                break;
            // Select child with most visits
            let bestChildId;
            let maxVisits = -1;
            node.childrenIds.forEach(childId => {
                const child = session.nodes.get(childId);
                if (child && child.visits > maxVisits) {
                    maxVisits = child.visits;
                    bestChildId = childId;
                }
            });
            currentNodeId = bestChildId;
        }
        return path;
    }
    /**
     * Import from sequential thinking format
     */
    importFromSequentialFormat(thoughts) {
        const session = this.initializeSession();
        let currentNodeId = session.rootNodeId;
        thoughts.forEach((thought, index) => {
            if (index === 0) {
                // Update root node
                const rootNode = session.nodes.get(currentNodeId);
                if (rootNode) {
                    rootNode.content = thought.thought;
                }
            }
            else {
                // Expand and create path
                const parentNode = session.nodes.get(currentNodeId);
                if (parentNode) {
                    const childNode = this.expandNode(currentNodeId, session);
                    childNode.content = thought.thought;
                    currentNodeId = childNode.id;
                }
            }
        });
        return session;
    }
    /**
     * Get action statistics for analysis
     */
    getActionStatistics(session) {
        const rootNode = session.nodes.get(session.rootNodeId);
        if (!rootNode)
            return [];
        const stats = [];
        rootNode.childrenIds.forEach(childId => {
            const child = session.nodes.get(childId);
            if (child && child.metadata?.action) {
                stats.push({
                    action: child.metadata.action,
                    visits: child.visits,
                    averageValue: child.averageValue,
                    winRate: child.metadata.outcomes ?
                        child.metadata.outcomes.wins / child.visits : undefined,
                    prior: child.metadata.priorProbability
                });
            }
        });
        return stats.sort((a, b) => b.visits - a.visits);
    }
}
export default MCTSHandler;
//# sourceMappingURL=mcts.js.map