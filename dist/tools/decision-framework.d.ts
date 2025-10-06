import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const DecisionFrameworkSchema: z.ZodObject<
	{
		decisionStatement: z.ZodString;
		options: z.ZodArray<
			z.ZodObject<
				{
					name: z.ZodString;
					description: z.ZodString;
				},
				"strip",
				z.ZodTypeAny,
				{
					name: string;
					description: string;
				},
				{
					name: string;
					description: string;
				}
			>,
			"many"
		>;
		analysisType: z.ZodString;
		stage: z.ZodString;
		decisionId: z.ZodString;
		iteration: z.ZodNumber;
		nextStageNeeded: z.ZodBoolean;
	},
	"strip",
	z.ZodTypeAny,
	{
		options: {
			name: string;
			description: string;
		}[];
		iteration: number;
		decisionId: string;
		decisionStatement: string;
		analysisType: string;
		stage: string;
		nextStageNeeded: boolean;
	},
	{
		options: {
			name: string;
			description: string;
		}[];
		iteration: number;
		decisionId: string;
		decisionStatement: string;
		analysisType: string;
		stage: string;
		nextStageNeeded: boolean;
	}
>;
export type DecisionFrameworkArgs = z.infer<typeof DecisionFrameworkSchema>;
declare function handleDecisionFramework(
	args: DecisionFrameworkArgs,
	session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleDecisionFramework };
//# sourceMappingURL=decision-framework.d.ts.map
