/**
 * Sequential Thinking Operation
 *
 * Implements multi-step thinking with revision capabilities and pattern selection
 */
import { BaseOperation } from "../base.js";
export class SequentialThinkingOperation extends BaseOperation {
    name = "sequential_thinking";
    category = "core";
    async execute(context) {
        const { sessionState, prompt, parameters } = context;
        // Choose reasoning pattern
        const chosenPattern = this.selectReasoningPattern(prompt, parameters);
        // Build thought data
        const thoughtData = {
            thought: prompt,
            thoughtNumber: parameters.thoughtNumber || 1,
            totalThoughts: parameters.totalThoughts || 1,
            nextThoughtNeeded: parameters.nextThoughtNeeded,
            isRevision: parameters.isRevision,
            revisesThought: parameters.revisesThought,
            branchFromThought: parameters.branchFromThought,
            branchId: parameters.branchId,
            needsMoreThoughts: parameters.needsMoreThoughts,
        };
        // Add thought to session
        const added = sessionState.addThought(thoughtData);
        const allThoughts = sessionState.getThoughts();
        const recentThoughts = allThoughts.slice(-3);
        // If a non-chain pattern is selected, optionally dispatch to pattern operation
        let patternResult;
        if (chosenPattern !== "chain" && !parameters.__disablePatternDispatch) {
            patternResult = await this.dispatchToPattern(chosenPattern, sessionState, prompt, parameters);
        }
        return this.createResult({
            selectedPattern: chosenPattern,
            patternResult,
            ...thoughtData,
            status: added ? "success" : "limit_reached",
            sessionContext: {
                sessionId: sessionState.sessionId,
                totalThoughts: allThoughts.length,
                remainingThoughts: sessionState.getRemainingThoughts(),
                recentThoughts: recentThoughts.map((t) => ({
                    thoughtNumber: t.thoughtNumber,
                    isRevision: t.isRevision,
                })),
            },
        });
    }
    selectReasoningPattern(prompt, parameters) {
        const specifiedPattern = parameters.pattern;
        const patternParams = parameters.patternParams || {};
        if (specifiedPattern && specifiedPattern !== "auto") {
            return specifiedPattern;
        }
        // Heuristic selection based on prompt and params
        const ptext = `${prompt}`.toLowerCase();
        if ("depth" in patternParams ||
            "breadth" in patternParams ||
            ptext.includes("branch") ||
            ptext.includes("options")) {
            return "tree";
        }
        if ("beamWidth" in patternParams || ptext.includes("candidates") || ptext.includes("top-k")) {
            return "beam";
        }
        if ("simulations" in patternParams ||
            ptext.includes("uncertain") ||
            ptext.includes("probability") ||
            ptext.includes("stochastic")) {
            return "mcts";
        }
        if ("nodes" in patternParams ||
            "edges" in patternParams ||
            ptext.includes("dependencies") ||
            ptext.includes("graph")) {
            return "graph";
        }
        return "chain";
    }
    async dispatchToPattern(pattern, sessionState, prompt, parameters) {
        // This will be replaced with actual registry lookup once patterns are extracted
        const opMap = {
            tree: "tree_of_thought",
            beam: "beam_search",
            mcts: "mcts",
            graph: "graph_of_thought",
        };
        const mappedOp = opMap[pattern];
        if (!mappedOp)
            return undefined;
        // Placeholder for future registry-based dispatch
        // const operation = operationRegistry.get(mappedOp);
        // if (operation) {
        //   return await operation.execute({ sessionState, prompt, parameters });
        // }
        return {
            placeholder: true,
            message: `Would dispatch to ${mappedOp} operation`,
            pattern,
        };
    }
}
// Export singleton instance
export default new SequentialThinkingOperation();
