import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const CollaborativeReasoningSchema: z.ZodObject<
	{
		topic: z.ZodString;
		perspectives: z.ZodArray<
			z.ZodObject<
				{
					agent: z.ZodString;
					viewpoint: z.ZodString;
					reasoning: z.ZodString;
				},
				"strip",
				z.ZodTypeAny,
				{
					reasoning: string;
					agent: string;
					viewpoint: string;
				},
				{
					reasoning: string;
					agent: string;
					viewpoint: string;
				}
			>,
			"many"
		>;
		synthesis: z.ZodString;
		consensus: z.ZodOptional<z.ZodString>;
		sessionId: z.ZodOptional<z.ZodString>;
	},
	"strip",
	z.ZodTypeAny,
	{
		synthesis: string;
		perspectives: {
			reasoning: string;
			agent: string;
			viewpoint: string;
		}[];
		topic: string;
		consensus?: string | undefined;
		sessionId?: string | undefined;
	},
	{
		synthesis: string;
		perspectives: {
			reasoning: string;
			agent: string;
			viewpoint: string;
		}[];
		topic: string;
		consensus?: string | undefined;
		sessionId?: string | undefined;
	}
>;
export type CollaborativeReasoningArgs = z.infer<typeof CollaborativeReasoningSchema>;
declare function handleCollaborativeReasoning(
	args: CollaborativeReasoningArgs,
	session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleCollaborativeReasoning };
//# sourceMappingURL=collaborative-reasoning.d.ts.map
