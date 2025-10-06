import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const MCTSSchema: z.ZodObject<
	{
		operation: z.ZodEnum<["init", "import", "iteration", "bestAction", "probs", "export"]>;
		sessionId: z.ZodOptional<z.ZodString>;
		explorationConstant: z.ZodOptional<z.ZodNumber>;
		config: z.ZodOptional<
			z.ZodObject<
				{
					ucbVariant: z.ZodOptional<z.ZodEnum<["ucb1", "ucb1-tuned", "puct", "custom"]>>;
					useRAVE: z.ZodOptional<z.ZodBoolean>;
					raveBias: z.ZodOptional<z.ZodNumber>;
					virtualLoss: z.ZodOptional<z.ZodNumber>;
					reuseTree: z.ZodOptional<z.ZodBoolean>;
					usePriors: z.ZodOptional<z.ZodBoolean>;
					useTranspositions: z.ZodOptional<z.ZodBoolean>;
				},
				"strip",
				z.ZodTypeAny,
				{
					ucbVariant?: "custom" | "ucb1" | "ucb1-tuned" | "puct" | undefined;
					useRAVE?: boolean | undefined;
					raveBias?: number | undefined;
					virtualLoss?: number | undefined;
					reuseTree?: boolean | undefined;
					usePriors?: boolean | undefined;
					useTranspositions?: boolean | undefined;
				},
				{
					ucbVariant?: "custom" | "ucb1" | "ucb1-tuned" | "puct" | undefined;
					useRAVE?: boolean | undefined;
					raveBias?: number | undefined;
					virtualLoss?: number | undefined;
					reuseTree?: boolean | undefined;
					usePriors?: boolean | undefined;
					useTranspositions?: boolean | undefined;
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
		operation: "iteration" | "export" | "init" | "import" | "bestAction" | "probs";
		sessionId?: string | undefined;
		explorationConstant?: number | undefined;
		config?:
			| {
					ucbVariant?: "custom" | "ucb1" | "ucb1-tuned" | "puct" | undefined;
					useRAVE?: boolean | undefined;
					raveBias?: number | undefined;
					virtualLoss?: number | undefined;
					reuseTree?: boolean | undefined;
					usePriors?: boolean | undefined;
					useTranspositions?: boolean | undefined;
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
	},
	{
		operation: "iteration" | "export" | "init" | "import" | "bestAction" | "probs";
		sessionId?: string | undefined;
		explorationConstant?: number | undefined;
		config?:
			| {
					ucbVariant?: "custom" | "ucb1" | "ucb1-tuned" | "puct" | undefined;
					useRAVE?: boolean | undefined;
					raveBias?: number | undefined;
					virtualLoss?: number | undefined;
					reuseTree?: boolean | undefined;
					usePriors?: boolean | undefined;
					useTranspositions?: boolean | undefined;
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
	}
>;
export type MCTSArgs = z.infer<typeof MCTSSchema>;
declare function handleMCTS(
	args: MCTSArgs,
	_session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleMCTS };
//# sourceMappingURL=mcts.d.ts.map
