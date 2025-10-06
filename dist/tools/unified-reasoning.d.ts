import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const UnifiedReasoningSchema: z.ZodObject<
	{
		operation: z.ZodEnum<
			[
				"sequential_thinking",
				"mental_model",
				"debugging_approach",
				"collaborative_reasoning",
				"decision_framework",
				"metacognitive",
				"socratic_method",
				"creative_thinking",
				"systems_thinking",
				"scientific_method",
				"structured_argumentation",
				"visual_reasoning",
				"tree_of_thought",
				"graph_of_thought",
				"beam_search",
				"mcts",
				"create",
				"continue",
				"evaluate",
				"branch",
				"merge",
				"prune",
				"analyze",
				"iterate",
				"export",
			]
		>;
		content: z.ZodOptional<z.ZodString>;
		prompt: z.ZodOptional<z.ZodString>;
		thought: z.ZodOptional<z.ZodString>;
		sessionId: z.ZodOptional<z.ZodString>;
		pattern: z.ZodOptional<
			z.ZodEnum<["chain", "tree", "graph", "beam", "mcts", "recursive", "dialectical"]>
		>;
		nodeId: z.ZodOptional<z.ZodString>;
		thoughtNumber: z.ZodOptional<z.ZodNumber>;
		totalThoughts: z.ZodOptional<z.ZodNumber>;
		nextThoughtNeeded: z.ZodOptional<z.ZodBoolean>;
		isRevision: z.ZodOptional<z.ZodBoolean>;
		revisesThought: z.ZodOptional<z.ZodNumber>;
		branchFromThought: z.ZodOptional<z.ZodNumber>;
		branchId: z.ZodOptional<z.ZodString>;
		needsMoreThoughts: z.ZodOptional<z.ZodBoolean>;
		parameters: z.ZodOptional<
			z.ZodObject<
				{
					maxDepth: z.ZodOptional<z.ZodNumber>;
					beamWidth: z.ZodOptional<z.ZodNumber>;
					explorationConstant: z.ZodOptional<z.ZodNumber>;
					pruningThreshold: z.ZodOptional<z.ZodNumber>;
				},
				"strip",
				z.ZodTypeAny,
				{
					maxDepth?: number | undefined;
					pruningThreshold?: number | undefined;
					beamWidth?: number | undefined;
					explorationConstant?: number | undefined;
				},
				{
					maxDepth?: number | undefined;
					pruningThreshold?: number | undefined;
					beamWidth?: number | undefined;
					explorationConstant?: number | undefined;
				}
			>
		>;
	},
	"strip",
	z.ZodTypeAny,
	{
		operation:
			| "create"
			| "metacognitive"
			| "mcts"
			| "continue"
			| "evaluate"
			| "branch"
			| "merge"
			| "prune"
			| "analyze"
			| "sequential_thinking"
			| "mental_model"
			| "debugging_approach"
			| "collaborative_reasoning"
			| "decision_framework"
			| "socratic_method"
			| "creative_thinking"
			| "systems_thinking"
			| "scientific_method"
			| "structured_argumentation"
			| "visual_reasoning"
			| "tree_of_thought"
			| "graph_of_thought"
			| "beam_search"
			| "iterate"
			| "export";
		thought?: string | undefined;
		sessionId?: string | undefined;
		thoughtNumber?: number | undefined;
		totalThoughts?: number | undefined;
		nextThoughtNeeded?: boolean | undefined;
		content?: string | undefined;
		isRevision?: boolean | undefined;
		revisesThought?: number | undefined;
		branchFromThought?: number | undefined;
		branchId?: string | undefined;
		needsMoreThoughts?: boolean | undefined;
		pattern?:
			| "chain"
			| "tree"
			| "graph"
			| "beam"
			| "mcts"
			| "recursive"
			| "dialectical"
			| undefined;
		prompt?: string | undefined;
		nodeId?: string | undefined;
		parameters?:
			| {
					maxDepth?: number | undefined;
					pruningThreshold?: number | undefined;
					beamWidth?: number | undefined;
					explorationConstant?: number | undefined;
			  }
			| undefined;
	},
	{
		operation:
			| "create"
			| "metacognitive"
			| "mcts"
			| "continue"
			| "evaluate"
			| "branch"
			| "merge"
			| "prune"
			| "analyze"
			| "sequential_thinking"
			| "mental_model"
			| "debugging_approach"
			| "collaborative_reasoning"
			| "decision_framework"
			| "socratic_method"
			| "creative_thinking"
			| "systems_thinking"
			| "scientific_method"
			| "structured_argumentation"
			| "visual_reasoning"
			| "tree_of_thought"
			| "graph_of_thought"
			| "beam_search"
			| "iterate"
			| "export";
		thought?: string | undefined;
		sessionId?: string | undefined;
		thoughtNumber?: number | undefined;
		totalThoughts?: number | undefined;
		nextThoughtNeeded?: boolean | undefined;
		content?: string | undefined;
		isRevision?: boolean | undefined;
		revisesThought?: number | undefined;
		branchFromThought?: number | undefined;
		branchId?: string | undefined;
		needsMoreThoughts?: boolean | undefined;
		pattern?:
			| "chain"
			| "tree"
			| "graph"
			| "beam"
			| "mcts"
			| "recursive"
			| "dialectical"
			| undefined;
		prompt?: string | undefined;
		nodeId?: string | undefined;
		parameters?:
			| {
					maxDepth?: number | undefined;
					pruningThreshold?: number | undefined;
					beamWidth?: number | undefined;
					explorationConstant?: number | undefined;
			  }
			| undefined;
	}
>;
export type UnifiedReasoningArgs = z.infer<typeof UnifiedReasoningSchema>;
declare function handleUnifiedReasoning(
	args: UnifiedReasoningArgs,
	session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleUnifiedReasoning };
//# sourceMappingURL=unified-reasoning.d.ts.map
