import { z } from "zod";

const CreativeThinkingSchema = z.object({
	technique: z
		.enum([
			"brainstorming",
			"mind_mapping",
			"scamper",
			"six_thinking_hats",
			"lateral_thinking",
			"random_stimulation",
		])
		.describe("Creative thinking technique"),
	problem: z.string().describe("Problem or challenge to address"),
	ideas: z.array(z.string()).describe("Generated ideas"),
	connections: z.array(z.string()).optional().describe("Connections between ideas"),
	evaluation: z.string().optional().describe("Evaluation of ideas"),
});
async function handleCreativeThinking(args, session) {
	const creativeData = {
		technique: args.technique,
		problem: args.problem,
		ideas: args.ideas,
		connections: args.connections || [],
		evaluation: args.evaluation,
		timestamp: new Date().toISOString(),
	};
	const stats = session.getStats();
	return {
		content: [
			{
				type: "text",
				text: JSON.stringify({
					...creativeData,
					status: "success",
					sessionContext: {
						sessionId: session.sessionId,
						stats,
					},
				}),
			},
		],
	};
}
// Self-register
// ToolRegistry.getInstance().register({
//   name: 'creativethinking',
//   description: 'Apply creative thinking techniques for innovative problem-solving',
//   schema: CreativeThinkingSchema,
//   handler: handleCreativeThinking,
//   category: 'creative'
// });
export { handleCreativeThinking };
//# sourceMappingURL=creative-thinking.js.map
