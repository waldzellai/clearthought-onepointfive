/**
 * Causal Analysis Operation
 *
 * Analyzes causal relationships and performs causal inference
 */
import { BaseOperation } from "../base.js";
export class CausalAnalysisOperation extends BaseOperation {
    name = "causal_analysis";
    category = "analysis";
    async execute(context) {
        const { sessionState, prompt, parameters } = context;
        const variables = parameters.variables || this.extractVariables(prompt);
        const existingGraph = parameters.graph || { nodes: [], edges: [] };
        const intervention = parameters.intervention || null;
        const analysisType = this.getParam(parameters, "analysisType", "structure");
        let graph = existingGraph;
        // Build causal graph if not provided
        if (graph.nodes.length === 0 && variables.length > 0) {
            graph = this.buildCausalGraph(variables, prompt);
        }
        let result = {
            graph,
            notes: [],
        };
        // Perform analysis based on type
        switch (analysisType) {
            case "intervention":
                if (intervention) {
                    result = this.analyzeIntervention(graph, intervention);
                }
                else {
                    result.notes?.push("Intervention analysis requires specifying an intervention");
                }
                break;
            case "counterfactual":
                result = this.performCounterfactualAnalysis(graph, intervention);
                break;
            case "structure":
            default:
                result = this.analyzeStructure(graph);
                break;
        }
        return this.createResult({
            ...result,
            analysisType,
            confounders: this.identifyConfounders(graph),
            causalPaths: this.findCausalPaths(graph),
            recommendations: this.generateRecommendations(graph, analysisType),
            sessionContext: {
                sessionId: sessionState.sessionId,
                stats: sessionState.getStats(),
            },
        });
    }
    extractVariables(prompt) {
        const variables = [];
        const sentences = prompt.split(/[.!?]+/);
        for (const sentence of sentences) {
            // Look for causal language patterns
            const causalWords = ["cause", "effect", "influence", "impact", "affect", "result", "lead to"];
            if (causalWords.some((word) => sentence.toLowerCase().includes(word))) {
                // Extract potential variables (nouns)
                const words = sentence.split(/\s+/);
                const potentialVars = words.filter((word) => word.length > 3 &&
                    /^[A-Za-z]/.test(word) &&
                    !["the", "and", "that", "this", "will", "can", "may"].includes(word.toLowerCase()));
                variables.push(...potentialVars.slice(0, 2));
            }
        }
        return [...new Set(variables)].slice(0, 6); // Remove duplicates, limit to 6
    }
    buildCausalGraph(variables, prompt) {
        const nodes = variables;
        const edges = [];
        // Simple heuristic: if variables appear in temporal or causal language, create edges
        const text = prompt.toLowerCase();
        for (let i = 0; i < variables.length; i++) {
            for (let j = 0; j < variables.length; j++) {
                if (i !== j) {
                    const var1 = variables[i].toLowerCase();
                    const var2 = variables[j].toLowerCase();
                    // Check for causal language patterns
                    const patterns = [
                        `${var1}.*cause.*${var2}`,
                        `${var1}.*lead.*${var2}`,
                        `${var1}.*influence.*${var2}`,
                        `${var1}.*affect.*${var2}`,
                    ];
                    if (patterns.some((pattern) => new RegExp(pattern).test(text))) {
                        edges.push({
                            from: variables[i],
                            to: variables[j],
                            weight: 0.7,
                        });
                    }
                }
            }
        }
        // If no causal patterns found, create a simple chain
        if (edges.length === 0 && variables.length > 1) {
            for (let i = 0; i < variables.length - 1; i++) {
                edges.push({
                    from: variables[i],
                    to: variables[i + 1],
                    weight: 0.5,
                });
            }
        }
        return { nodes, edges };
    }
    analyzeStructure(graph) {
        const notes = [];
        // Analyze graph properties
        const rootCauses = graph.nodes.filter((node) => !graph.edges.some((edge) => edge.to === node));
        const finalEffects = graph.nodes.filter((node) => !graph.edges.some((edge) => edge.from === node));
        if (rootCauses.length > 0) {
            notes.push(`Root causes identified: ${rootCauses.join(", ")}`);
        }
        if (finalEffects.length > 0) {
            notes.push(`Final effects: ${finalEffects.join(", ")}`);
        }
        // Check for cycles
        if (this.hasCycles(graph)) {
            notes.push("Causal graph contains feedback loops");
        }
        return { graph, notes };
    }
    analyzeIntervention(graph, intervention) {
        const notes = [];
        const predictedEffects = {};
        // Find all variables affected by the intervention
        const affectedNodes = this.findDownstreamNodes(graph, intervention.variable);
        for (const node of affectedNodes) {
            // Simple propagation model
            const pathStrength = this.calculatePathStrength(graph, intervention.variable, node);
            predictedEffects[node] = pathStrength * 0.5; // Simplified calculation
        }
        notes.push(`Intervention on ${intervention.variable} affects ${affectedNodes.length} variables`);
        return {
            graph,
            intervention: intervention || undefined,
            predictedEffects,
            notes,
        };
    }
    performCounterfactualAnalysis(graph, intervention) {
        const notes = [];
        const counterfactual = {};
        if (!intervention) {
            notes.push("Counterfactual analysis requires specifying a hypothetical intervention");
        }
        else {
            // Simulate what would happen if intervention had not occurred
            const affectedNodes = this.findDownstreamNodes(graph, intervention.variable);
            for (const node of affectedNodes) {
                const currentEffect = this.calculatePathStrength(graph, intervention.variable, node);
                counterfactual[node] = -currentEffect; // Opposite of current effect
            }
            notes.push(`Counterfactual: if ${intervention.variable} had not changed, effects would differ`);
        }
        return {
            graph,
            intervention: intervention || undefined,
            counterfactual,
            notes,
        };
    }
    identifyConfounders(graph) {
        const confounders = [];
        // A confounder affects multiple variables
        for (const node of graph.nodes) {
            const outgoingEdges = graph.edges.filter((edge) => edge.from === node);
            if (outgoingEdges.length > 1) {
                confounders.push(node);
            }
        }
        return confounders;
    }
    findCausalPaths(graph) {
        const paths = [];
        // Find all paths from root causes to final effects
        const rootCauses = graph.nodes.filter((node) => !graph.edges.some((edge) => edge.to === node));
        const finalEffects = graph.nodes.filter((node) => !graph.edges.some((edge) => edge.from === node));
        for (const root of rootCauses) {
            for (const effect of finalEffects) {
                const path = this.findPath(graph, root, effect);
                if (path.length > 0) {
                    paths.push({
                        path,
                        strength: this.calculatePathStrength(graph, root, effect),
                    });
                }
            }
        }
        return paths;
    }
    findDownstreamNodes(graph, startNode) {
        const visited = new Set();
        const downstream = [];
        const dfs = (node) => {
            if (visited.has(node))
                return;
            visited.add(node);
            const children = graph.edges.filter((edge) => edge.from === node).map((edge) => edge.to);
            for (const child of children) {
                downstream.push(child);
                dfs(child);
            }
        };
        dfs(startNode);
        return [...new Set(downstream)];
    }
    findPath(graph, from, to) {
        const visited = new Set();
        const dfs = (current, target, path) => {
            if (current === target)
                return [...path, current];
            if (visited.has(current))
                return null;
            visited.add(current);
            const neighbors = graph.edges.filter((edge) => edge.from === current).map((edge) => edge.to);
            for (const neighbor of neighbors) {
                const result = dfs(neighbor, target, [...path, current]);
                if (result)
                    return result;
            }
            return null;
        };
        return dfs(from, to, []) || [];
    }
    calculatePathStrength(graph, from, to) {
        const path = this.findPath(graph, from, to);
        if (path.length <= 1)
            return 0;
        let strength = 1;
        for (let i = 0; i < path.length - 1; i++) {
            const edge = graph.edges.find((e) => e.from === path[i] && e.to === path[i + 1]);
            strength *= edge?.weight || 0.5;
        }
        return strength;
    }
    hasCycles(graph) {
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (node) => {
            if (recursionStack.has(node))
                return true;
            if (visited.has(node))
                return false;
            visited.add(node);
            recursionStack.add(node);
            const neighbors = graph.edges.filter((edge) => edge.from === node).map((edge) => edge.to);
            for (const neighbor of neighbors) {
                if (dfs(neighbor))
                    return true;
            }
            recursionStack.delete(node);
            return false;
        };
        for (const node of graph.nodes) {
            if (dfs(node))
                return true;
        }
        return false;
    }
    generateRecommendations(graph, analysisType) {
        const recommendations = [];
        if (analysisType === "structure") {
            if (graph.edges.length === 0) {
                recommendations.push("Consider adding causal relationships between variables");
            }
            if (this.identifyConfounders(graph).length > 0) {
                recommendations.push("Control for confounding variables in any empirical analysis");
            }
        }
        if (analysisType === "intervention") {
            recommendations.push("Validate intervention effects through controlled experiments");
            recommendations.push("Consider unintended consequences of interventions");
        }
        recommendations.push("Test causal assumptions with domain expertise");
        return recommendations;
    }
}
export default new CausalAnalysisOperation();
