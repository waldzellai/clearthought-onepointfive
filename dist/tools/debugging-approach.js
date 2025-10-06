import { z } from "zod";

const DebuggingApproachSchema = z.object({
	approachName: z
		.enum([
			"binary_search",
			"reverse_engineering",
			"divide_conquer",
			"backtracking",
			"cause_elimination",
			"program_slicing",
		])
		.describe("Debugging approach"),
	issue: z.string().describe("The issue being debugged"),
	steps: z.array(z.string()).describe("Steps taken to debug"),
	findings: z.string().describe("Findings during debugging"),
	resolution: z.string().describe("How the issue was resolved"),
});
async function handleDebuggingApproach(args, session) {
	const debugData = {
		approachName: args.approachName,
		issue: args.issue,
		steps: args.steps,
		findings: args.findings,
		resolution: args.resolution,
	};
	session.addDebuggingSession(debugData);
	// Get session context
	const stats = session.getStats();
	const recentDebugging = session.getDebuggingSessions().slice(-3);
	return {
		content: [
			{
				type: "text",
				text: JSON.stringify({
					...debugData,
					status: "success",
					sessionContext: {
						sessionId: session.sessionId,
						totalDebuggingSessions: session.getDebuggingSessions().length,
						recentSessions: recentDebugging,
						stats,
					},
				}),
			},
		],
	};
}
// Self-register
// ToolRegistry.getInstance().register({
//   name: 'debuggingapproach',
//   description: 'Apply systematic debugging approaches to identify and resolve issues',
//   schema: DebuggingApproachSchema,
//   handler: handleDebuggingApproach,
//   category: 'metacognitive'
// });
export { handleDebuggingApproach };
//# sourceMappingURL=debugging-approach.js.map
