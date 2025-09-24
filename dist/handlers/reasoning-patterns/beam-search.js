/**
 * Beam Search Pattern Handler Implementation
 *
 * Maintains multiple promising paths simultaneously, exploring them
 * in parallel with periodic evaluation and pruning.
 */
import { v4 as uuidv4 } from 'uuid';
export class BeamSearchHandler {
    defaultConfig = {
        expansionStrategy: 'breadth',
        branchingFactor: 3,
        scoreAggregation: 'average',
        allowMerging: true,
        mergeThreshold: 0.8,
        pruningStrategy: 'relative',
        keepPrunedPaths: true,
        diversityBonus: 0.1
    };
    defaultConvergenceCriteria = {
        maxGenerations: 10,
        minScoreImprovement: 0.01,
        consensusThreshold: 0.7,
        targetScore: 0.9,
        timeLimit: 60000
    };
    /**
     * Initialize a new Beam Search session
     */
    initializeSession(beamWidth = 5, config) {
        const sessionId = uuidv4();
        const timestamp = new Date().toISOString();
        // Create initial path
        const initialPathId = uuidv4();
        const initialPath = {
            id: initialPathId,
            nodeIds: [],
            currentScore: 0,
            status: 'active',
            metadata: {
                createdAt: timestamp,
                updatedAt: timestamp,
                scoreHistory: [0]
            }
        };
        return {
            sessionId,
            patternType: 'beam',
            iteration: 0,
            nextStepNeeded: true,
            createdAt: timestamp,
            updatedAt: timestamp,
            beamWidth,
            currentGeneration: 0,
            nodes: new Map(),
            paths: new Map([[initialPathId, initialPath]]),
            activePaths: [initialPathId],
            evaluationFunction: 'default',
            convergenceCriteria: this.defaultConvergenceCriteria,
            config: { ...this.defaultConfig, ...config },
            stats: {
                totalPaths: 1,
                activePaths: 1,
                completedPaths: 0,
                prunedPaths: 0,
                mergedPaths: 0,
                nodesExplored: 0,
                averagePathLength: 0,
                bestScore: 0,
                bestScoreGeneration: 0
            }
        };
    }
    /**
     * Generate next generation of nodes
     */
    generateNextGeneration(session) {
        const newNodes = [];
        const generation = ++session.currentGeneration;
        // Expand each active path
        session.activePaths.forEach(pathId => {
            const path = session.paths.get(pathId);
            if (path && path.status === 'active') {
                const expandedNodes = this.expandPath(pathId, session);
                newNodes.push(...expandedNodes);
            }
        });
        session.stats.nodesExplored += newNodes.length;
        return newNodes;
    }
    /**
     * Expand a specific path
     */
    expandPath(pathId, session) {
        const path = session.paths.get(pathId);
        if (!path)
            return [];
        const newNodes = [];
        const newPaths = [];
        // Generate children based on branching factor
        for (let i = 0; i < session.config.branchingFactor; i++) {
            const nodeId = uuidv4();
            const node = {
                id: nodeId,
                content: `Generation ${session.currentGeneration}, Branch ${i + 1}`,
                timestamp: new Date().toISOString(),
                pathIds: [],
                generationNumber: session.currentGeneration,
                localScore: Math.random(), // Simple random score for demo
                cumulativeScore: path.currentScore,
                metadata: {
                    generationTime: Date.now()
                }
            };
            // Create new path for this expansion
            const newPathId = uuidv4();
            const newPath = {
                id: newPathId,
                nodeIds: [...path.nodeIds, nodeId],
                currentScore: 0, // Will be updated by evaluation
                status: 'active',
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    scoreHistory: [...(path.metadata?.scoreHistory || []), 0]
                }
            };
            node.pathIds.push(newPathId);
            session.nodes.set(nodeId, node);
            session.paths.set(newPathId, newPath);
            newNodes.push(node);
            newPaths.push(newPath);
        }
        // Mark original path as completed if it was expanded
        if (newPaths.length > 0) {
            path.status = 'completed';
            session.stats.completedPaths++;
            session.stats.activePaths--;
        }
        // Add new paths to active paths (will be pruned later)
        session.activePaths.push(...newPaths.map(p => p.id));
        session.stats.totalPaths += newPaths.length;
        session.stats.activePaths += newPaths.length;
        return newNodes;
    }
    /**
     * Evaluate and score paths
     */
    evaluatePaths(session) {
        const scores = new Map();
        session.activePaths.forEach(pathId => {
            const path = session.paths.get(pathId);
            if (path && path.status === 'active') {
                const score = this.calculatePathScore(path, session);
                scores.set(pathId, score);
                path.currentScore = score;
                // Update score history
                if (path.metadata) {
                    path.metadata.scoreHistory?.push(score);
                    path.metadata.updatedAt = new Date().toISOString();
                }
                // Update best score
                if (score > session.stats.bestScore) {
                    session.stats.bestScore = score;
                    session.stats.bestScoreGeneration = session.currentGeneration;
                }
            }
        });
        return scores;
    }
    /**
     * Calculate score for a path
     */
    calculatePathScore(path, session) {
        const components = {
            baseScore: 0,
            finalScore: 0
        };
        // Base score from node scores
        let totalScore = 0;
        let count = 0;
        path.nodeIds.forEach(nodeId => {
            const node = session.nodes.get(nodeId);
            if (node) {
                totalScore += node.localScore;
                count++;
            }
        });
        switch (session.config.scoreAggregation) {
            case 'sum':
                components.baseScore = totalScore;
                break;
            case 'average':
                components.baseScore = count > 0 ? totalScore / count : 0;
                break;
            case 'max':
                components.baseScore = path.nodeIds.reduce((max, nodeId) => {
                    const node = session.nodes.get(nodeId);
                    return node ? Math.max(max, node.localScore) : max;
                }, 0);
                break;
            case 'weighted':
                // Weight recent nodes more heavily
                let weightedSum = 0;
                let weightSum = 0;
                path.nodeIds.forEach((nodeId, index) => {
                    const node = session.nodes.get(nodeId);
                    if (node) {
                        const weight = Math.pow(0.9, path.nodeIds.length - index - 1);
                        weightedSum += node.localScore * weight;
                        weightSum += weight;
                    }
                });
                components.baseScore = weightSum > 0 ? weightedSum / weightSum : 0;
                break;
        }
        // Apply diversity bonus
        if (session.config.diversityBonus) {
            const diversity = this.calculatePathDiversity(path, session);
            components.diversityBonus = diversity * session.config.diversityBonus;
        }
        // Apply length adjustment
        const lengthPenalty = Math.max(0, 1 - (path.nodeIds.length / 20));
        components.lengthAdjustment = lengthPenalty * 0.1;
        // Calculate final score
        components.finalScore = components.baseScore +
            (components.diversityBonus || 0) +
            (components.lengthAdjustment || 0);
        return components.finalScore;
    }
    /**
     * Calculate diversity of a path compared to other active paths
     */
    calculatePathDiversity(path, session) {
        if (session.activePaths.length <= 1)
            return 1;
        let totalSimilarity = 0;
        let comparisons = 0;
        session.activePaths.forEach(otherPathId => {
            if (otherPathId !== path.id) {
                const otherPath = session.paths.get(otherPathId);
                if (otherPath) {
                    const similarity = this.calculatePathSimilarity(path, otherPath);
                    totalSimilarity += similarity;
                    comparisons++;
                }
            }
        });
        return comparisons > 0 ? 1 - (totalSimilarity / comparisons) : 1;
    }
    /**
     * Calculate similarity between two paths
     */
    calculatePathSimilarity(path1, path2) {
        const set1 = new Set(path1.nodeIds);
        const set2 = new Set(path2.nodeIds);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    /**
     * Prune paths to maintain beam width
     */
    prunePaths(session) {
        const prunedPathIds = [];
        // Only prune if we exceed beam width
        if (session.activePaths.length <= session.beamWidth) {
            return prunedPathIds;
        }
        // Score all active paths
        const scores = this.evaluatePaths(session);
        // Sort paths by score
        const sortedPaths = session.activePaths
            .map(pathId => ({ pathId, score: scores.get(pathId) || 0 }))
            .sort((a, b) => b.score - a.score);
        // Determine pruning threshold based on strategy
        let threshold;
        switch (session.config.pruningStrategy) {
            case 'absolute':
                threshold = 0.3; // Fixed threshold
                break;
            case 'relative':
                // Keep top beam_width paths
                if (sortedPaths.length > session.beamWidth) {
                    threshold = sortedPaths[session.beamWidth].score;
                }
                else {
                    threshold = 0;
                }
                break;
            case 'adaptive':
                // Adaptive threshold based on score distribution
                const avgScore = sortedPaths.reduce((sum, p) => sum + p.score, 0) / sortedPaths.length;
                threshold = avgScore * 0.8;
                break;
            default:
                threshold = 0;
        }
        // Prune paths below threshold
        const newActivePaths = [];
        sortedPaths.forEach((pathData, index) => {
            if (index < session.beamWidth && pathData.score >= threshold) {
                newActivePaths.push(pathData.pathId);
            }
            else {
                const path = session.paths.get(pathData.pathId);
                if (path) {
                    path.status = 'pruned';
                    if (path.metadata) {
                        path.metadata.pruningGeneration = session.currentGeneration;
                        path.metadata.pruningReason = `Score ${pathData.score} below threshold ${threshold}`;
                    }
                    prunedPathIds.push(pathData.pathId);
                    // Remove from paths if not keeping pruned
                    if (!session.config.keepPrunedPaths) {
                        session.paths.delete(pathData.pathId);
                    }
                }
            }
        });
        session.activePaths = newActivePaths;
        session.stats.prunedPaths += prunedPathIds.length;
        session.stats.activePaths = newActivePaths.length;
        return prunedPathIds;
    }
    /**
     * Check for convergence
     */
    checkConvergence(session) {
        const criteria = session.convergenceCriteria;
        if (!criteria)
            return false;
        // Check max generations
        if (criteria.maxGenerations && session.currentGeneration >= criteria.maxGenerations) {
            return true;
        }
        // Check target score
        if (criteria.targetScore && session.stats.bestScore >= criteria.targetScore) {
            return true;
        }
        // Check consensus
        if (criteria.consensusThreshold && session.activePaths.length > 0) {
            const consensus = this.calculateConsensus(session);
            if (consensus >= criteria.consensusThreshold) {
                return true;
            }
        }
        // Check score improvement
        if (criteria.minScoreImprovement && session.currentGeneration > 2) {
            const improvement = this.calculateScoreImprovement(session);
            if (improvement < criteria.minScoreImprovement) {
                return true;
            }
        }
        return false;
    }
    /**
     * Calculate consensus among active paths
     */
    calculateConsensus(session) {
        if (session.activePaths.length <= 1)
            return 1;
        // Check if paths are converging to similar solutions
        const paths = session.activePaths.map(id => session.paths.get(id)).filter(Boolean);
        let totalSimilarity = 0;
        let comparisons = 0;
        for (let i = 0; i < paths.length; i++) {
            for (let j = i + 1; j < paths.length; j++) {
                totalSimilarity += this.calculatePathSimilarity(paths[i], paths[j]);
                comparisons++;
            }
        }
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    }
    /**
     * Calculate score improvement over recent generations
     */
    calculateScoreImprovement(session) {
        const recentGenerations = 3;
        const startGen = Math.max(0, session.currentGeneration - recentGenerations);
        // Get best scores from recent generations
        const recentScores = [];
        session.paths.forEach(path => {
            if (path.metadata?.scoreHistory) {
                const history = path.metadata.scoreHistory;
                for (let i = startGen; i <= session.currentGeneration && i < history.length; i++) {
                    recentScores.push(history[i]);
                }
            }
        });
        if (recentScores.length < 2)
            return 1;
        // Calculate improvement
        const oldMax = Math.max(...recentScores.slice(0, Math.floor(recentScores.length / 2)));
        const newMax = Math.max(...recentScores.slice(Math.floor(recentScores.length / 2)));
        return oldMax > 0 ? (newMax - oldMax) / oldMax : 0;
    }
    /**
     * Merge similar paths
     */
    mergePaths(pathIds, session) {
        if (pathIds.length < 2) {
            throw new Error('Need at least 2 paths to merge');
        }
        const paths = pathIds.map(id => session.paths.get(id)).filter(Boolean);
        if (paths.length !== pathIds.length) {
            throw new Error('Some paths not found');
        }
        // Create merged path
        const mergedPathId = uuidv4();
        const mergedNodeIds = this.mergeNodeSequences(paths.map(p => p.nodeIds));
        const avgScore = paths.reduce((sum, p) => sum + p.currentScore, 0) / paths.length;
        const mergedPath = {
            id: mergedPathId,
            nodeIds: mergedNodeIds,
            currentScore: avgScore,
            status: 'active',
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                scoreHistory: [avgScore]
            }
        };
        // Update nodes to reference merged path
        mergedNodeIds.forEach(nodeId => {
            const node = session.nodes.get(nodeId);
            if (node) {
                node.pathIds.push(mergedPathId);
            }
        });
        // Mark original paths as merged
        pathIds.forEach(pathId => {
            const path = session.paths.get(pathId);
            if (path) {
                path.status = 'merged';
                if (path.metadata) {
                    path.metadata.mergedIntoPathId = mergedPathId;
                }
                // Remove from active paths
                const index = session.activePaths.indexOf(pathId);
                if (index !== -1) {
                    session.activePaths.splice(index, 1);
                }
            }
        });
        // Add merged path
        session.paths.set(mergedPathId, mergedPath);
        session.activePaths.push(mergedPathId);
        session.stats.mergedPaths += pathIds.length;
        return mergedPath;
    }
    /**
     * Merge node sequences from multiple paths
     */
    mergeNodeSequences(sequences) {
        if (sequences.length === 0)
            return [];
        if (sequences.length === 1)
            return sequences[0];
        // Simple merge: take consensus at each position
        const maxLength = Math.max(...sequences.map(s => s.length));
        const merged = [];
        for (let i = 0; i < maxLength; i++) {
            const nodesAtPosition = sequences
                .filter(seq => seq.length > i)
                .map(seq => seq[i]);
            if (nodesAtPosition.length > 0) {
                // Take most common node at this position
                const counts = new Map();
                nodesAtPosition.forEach(node => {
                    counts.set(node, (counts.get(node) || 0) + 1);
                });
                let maxCount = 0;
                let mostCommon = nodesAtPosition[0];
                counts.forEach((count, node) => {
                    if (count > maxCount) {
                        maxCount = count;
                        mostCommon = node;
                    }
                });
                merged.push(mostCommon);
            }
        }
        return merged;
    }
    /**
     * Get best path
     */
    getBestPath(session) {
        if (session.paths.size === 0)
            return null;
        let bestPath = null;
        let bestScore = -Infinity;
        session.paths.forEach(path => {
            if (path.currentScore > bestScore) {
                bestScore = path.currentScore;
                bestPath = path;
            }
        });
        return bestPath;
    }
    /**
     * Calculate diversity across all active paths
     */
    calculateDiversity(session) {
        if (session.activePaths.length <= 1)
            return 0;
        const paths = session.activePaths.map(id => session.paths.get(id)).filter(Boolean);
        let totalDiversity = 0;
        let comparisons = 0;
        for (let i = 0; i < paths.length; i++) {
            for (let j = i + 1; j < paths.length; j++) {
                totalDiversity += 1 - this.calculatePathSimilarity(paths[i], paths[j]);
                comparisons++;
            }
        }
        return comparisons > 0 ? totalDiversity / comparisons : 0;
    }
    /**
     * Export to sequential thinking format
     */
    exportToSequentialFormat(session) {
        const bestPath = this.getBestPath(session);
        if (!bestPath)
            return [];
        const thoughts = [];
        bestPath.nodeIds.forEach((nodeId, index) => {
            const node = session.nodes.get(nodeId);
            if (node) {
                thoughts.push({
                    thought: node.content,
                    thoughtNumber: index + 1,
                    totalThoughts: bestPath.nodeIds.length,
                    nextThoughtNeeded: index < bestPath.nodeIds.length - 1
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
        // Create a single path from the thoughts
        const pathId = uuidv4();
        const path = {
            id: pathId,
            nodeIds: [],
            currentScore: 0,
            status: 'active',
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                scoreHistory: []
            }
        };
        thoughts.forEach((thought, index) => {
            const nodeId = uuidv4();
            const node = {
                id: nodeId,
                content: thought.thought,
                timestamp: new Date().toISOString(),
                pathIds: [pathId],
                generationNumber: index,
                localScore: 0.5
            };
            session.nodes.set(nodeId, node);
            path.nodeIds.push(nodeId);
        });
        session.paths.set(pathId, path);
        session.activePaths = [pathId];
        return session;
    }
    /**
     * Run one iteration of beam search
     */
    runIteration(session) {
        // Generate next generation
        this.generateNextGeneration(session);
        // Evaluate paths
        this.evaluatePaths(session);
        // Prune to maintain beam width
        this.prunePaths(session);
        // Check for similar paths to merge
        if (session.config.allowMerging) {
            this.attemptPathMerging(session);
        }
        // Update statistics
        this.updateStatistics(session);
        // Check convergence
        if (this.checkConvergence(session)) {
            session.nextStepNeeded = false;
        }
        session.iteration++;
        session.updatedAt = new Date().toISOString();
    }
    /**
     * Attempt to merge similar paths
     */
    attemptPathMerging(session) {
        if (!session.config.mergeThreshold)
            return;
        const paths = session.activePaths.map(id => session.paths.get(id)).filter(Boolean);
        const merged = new Set();
        for (let i = 0; i < paths.length; i++) {
            if (merged.has(paths[i].id))
                continue;
            const similarPaths = [paths[i].id];
            for (let j = i + 1; j < paths.length; j++) {
                if (merged.has(paths[j].id))
                    continue;
                const similarity = this.calculatePathSimilarity(paths[i], paths[j]);
                if (similarity >= session.config.mergeThreshold) {
                    similarPaths.push(paths[j].id);
                    merged.add(paths[j].id);
                }
            }
            if (similarPaths.length > 1) {
                this.mergePaths(similarPaths, session);
                similarPaths.forEach(id => merged.add(id));
            }
        }
    }
    /**
     * Update session statistics
     */
    updateStatistics(session) {
        // Calculate average path length
        let totalLength = 0;
        let pathCount = 0;
        session.paths.forEach(path => {
            if (path.status === 'active' || path.status === 'completed') {
                totalLength += path.nodeIds.length;
                pathCount++;
            }
        });
        session.stats.averagePathLength = pathCount > 0 ? totalLength / pathCount : 0;
        // Calculate score variance
        const scores = session.activePaths.map(id => {
            const path = session.paths.get(id);
            return path ? path.currentScore : 0;
        });
        if (scores.length > 0) {
            const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
            const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
            session.stats.scoreVariance = variance;
        }
    }
}
export default BeamSearchHandler;
//# sourceMappingURL=beam-search.js.map