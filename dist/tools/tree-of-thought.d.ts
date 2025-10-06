import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const ToTSchema: z.ZodObject<
	{
		operation: z.ZodEnum<
			[
				"init",
				"import",
				"expand",
				"evaluate",
				"selectNext",
				"prune",
				"isSolution",
				"bestPath",
				"iterate",
			]
		>;
		sessionId: z.ZodOptional<z.ZodString>;
		content: z.ZodOptional<z.ZodString>;
		nodeId: z.ZodOptional<z.ZodString>;
		reason: z.ZodOptional<z.ZodString>;
		config: z.ZodOptional<
			z.ZodObject<
				{
					maxDepth: z.ZodOptional<z.ZodNumber>;
					maxBranchingFactor: z.ZodOptional<z.ZodNumber>;
					defaultStrategy: z.ZodOptional<z.ZodEnum<["depth-first", "breadth-first", "best-first"]>>;
					pruningThreshold: z.ZodOptional<z.ZodNumber>;
					allowRevisiting: z.ZodOptional<z.ZodBoolean>;
					timeLimit: z.ZodOptional<z.ZodNumber>;
				},
				"strip",
				z.ZodTypeAny,
				{
					maxDepth?: number | undefined;
					maxBranchingFactor?: number | undefined;
					defaultStrategy?: "depth-first" | "breadth-first" | "best-first" | undefined;
					pruningThreshold?: number | undefined;
					allowRevisiting?: boolean | undefined;
					timeLimit?: number | undefined;
				},
				{
					maxDepth?: number | undefined;
					maxBranchingFactor?: number | undefined;
					defaultStrategy?: "depth-first" | "breadth-first" | "best-first" | undefined;
					pruningThreshold?: number | undefined;
					allowRevisiting?: boolean | undefined;
					timeLimit?: number | undefined;
				}
			>
		>;
		sequentialImport: z.ZodOptional<
			z.ZodArray<
				z.ZodObject<
					{
						thought: z.ZodString;
						thoughtNumber: z.ZodNumber;
						totalThoughts: z.ZodNumber;
						nextThoughtNeeded: z.ZodBoolean;
					},
					"strip",
					z.ZodTypeAny,
					{
						thought: string;
						thoughtNumber: number;
						totalThoughts: number;
						nextThoughtNeeded: boolean;
					},
					{
						thought: string;
						thoughtNumber: number;
						totalThoughts: number;
						nextThoughtNeeded: boolean;
					}
				>,
				"many"
			>
		>;
	},
	"strip",
	z.ZodTypeAny,
	{
		operation:
			| "evaluate"
			| "prune"
			| "iterate"
			| "init"
			| "import"
			| "bestPath"
			| "expand"
			| "selectNext"
			| "isSolution";
		sessionId?: string | undefined;
		content?: string | undefined;
		nodeId?: string | undefined;
		config?:
			| {
					maxDepth?: number | undefined;
					maxBranchingFactor?: number | undefined;
					defaultStrategy?: "depth-first" | "breadth-first" | "best-first" | undefined;
					pruningThreshold?: number | undefined;
					allowRevisiting?: boolean | undefined;
					timeLimit?: number | undefined;
			  }
			| undefined;
		sequentialImport?:
			| {
					thought: string;
					thoughtNumber: number;
					totalThoughts: number;
					nextThoughtNeeded: boolean;
			  }[]
			| undefined;
		reason?: string | undefined;
	},
	{
		operation:
			| "evaluate"
			| "prune"
			| "iterate"
			| "init"
			| "import"
			| "bestPath"
			| "expand"
			| "selectNext"
			| "isSolution";
		sessionId?: string | undefined;
		content?: string | undefined;
		nodeId?: string | undefined;
		config?:
			| {
					maxDepth?: number | undefined;
					maxBranchingFactor?: number | undefined;
					defaultStrategy?: "depth-first" | "breadth-first" | "best-first" | undefined;
					pruningThreshold?: number | undefined;
					allowRevisiting?: boolean | undefined;
					timeLimit?: number | undefined;
			  }
			| undefined;
		sequentialImport?:
			| {
					thought: string;
					thoughtNumber: number;
					totalThoughts: number;
					nextThoughtNeeded: boolean;
			  }[]
			| undefined;
		reason?: string | undefined;
	}
>;
export type ToTArgs = z.infer<typeof ToTSchema>;
declare function handleToT(
	args: ToTArgs,
	_session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleToT };
//# sourceMappingURL=tree-of-thought.d.ts.map
