import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const SequentialThinkingSchema: z.ZodObject<
	{
		thought: z.ZodString;
		thoughtNumber: z.ZodNumber;
		totalThoughts: z.ZodNumber;
		nextThoughtNeeded: z.ZodBoolean;
		sessionId: z.ZodOptional<z.ZodString>;
		isRevision: z.ZodOptional<z.ZodBoolean>;
		revisesThought: z.ZodOptional<z.ZodNumber>;
		branchFromThought: z.ZodOptional<z.ZodNumber>;
		branchId: z.ZodOptional<z.ZodString>;
		needsMoreThoughts: z.ZodOptional<z.ZodBoolean>;
		reasoningPattern: z.ZodOptional<z.ZodEnum<["linear", "tree", "graph", "beam", "mcts"]>>;
		explorationDepth: z.ZodOptional<z.ZodNumber>;
		beamWidth: z.ZodOptional<z.ZodNumber>;
	},
	"strip",
	z.ZodTypeAny,
	{
		thought: string;
		thoughtNumber: number;
		totalThoughts: number;
		nextThoughtNeeded: boolean;
		sessionId?: string | undefined;
		isRevision?: boolean | undefined;
		revisesThought?: number | undefined;
		branchFromThought?: number | undefined;
		branchId?: string | undefined;
		needsMoreThoughts?: boolean | undefined;
		reasoningPattern?: "tree" | "graph" | "beam" | "mcts" | "linear" | undefined;
		explorationDepth?: number | undefined;
		beamWidth?: number | undefined;
	},
	{
		thought: string;
		thoughtNumber: number;
		totalThoughts: number;
		nextThoughtNeeded: boolean;
		sessionId?: string | undefined;
		isRevision?: boolean | undefined;
		revisesThought?: number | undefined;
		branchFromThought?: number | undefined;
		branchId?: string | undefined;
		needsMoreThoughts?: boolean | undefined;
		reasoningPattern?: "tree" | "graph" | "beam" | "mcts" | "linear" | undefined;
		explorationDepth?: number | undefined;
		beamWidth?: number | undefined;
	}
>;
export type SequentialThinkingArgs = z.infer<typeof SequentialThinkingSchema>;
declare function handleSequentialThinking(
	args: SequentialThinkingArgs,
	session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleSequentialThinking };
//# sourceMappingURL=sequential-thinking.d.ts.map
