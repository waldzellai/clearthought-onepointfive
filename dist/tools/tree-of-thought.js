import { z } from "zod";
import TreeOfThoughtHandler from "../handlers/reasoning-patterns/tree-of-thought.js";

// In-memory session store for ToT
const totSessions = new Map();
const totHandler = new TreeOfThoughtHandler();
const ToTSchema = z.object({
	operation: z
		.enum([
			"init",
			"import",
			"expand",
			"evaluate",
			"selectNext",
			"prune",
			"isSolution",
			"bestPath",
			"iterate",
		])
		.describe("Tree-of-Thought operation"),
	sessionId: z.string().optional().describe("Session ID; created on init if omitted"),
	content: z.string().optional().describe("Node content for creation (used indirectly via import)"),
	nodeId: z.string().optional().describe("Target node for operations"),
	reason: z.string().optional().describe("Pruning reason"),
	config: z
		.object({
			maxDepth: z.number().optional(),
			maxBranchingFactor: z.number().optional(),
			defaultStrategy: z.enum(["depth-first", "breadth-first", "best-first"]).optional(),
			pruningThreshold: z.number().optional(),
			allowRevisiting: z.boolean().optional(),
			timeLimit: z.number().optional(),
		})
		.optional(),
	sequentialImport: z
		.array(
			z.object({
				thought: z.string(),
				thoughtNumber: z.number(),
				totalThoughts: z.number(),
				nextThoughtNeeded: z.boolean(),
			}),
		)
		.optional()
		.describe("Import existing sequential chain into ToT"),
});
async function handleToT(args, _session) {
	let sessionId = args.sessionId;
	let session = sessionId ? totSessions.get(sessionId) : undefined;
	if (!session || args.operation === "init") {
		session = totHandler.initializeSession(args.config || {});
		sessionId = session.sessionId;
		totSessions.set(sessionId, session);
	}
	if (!session) {
		return {
			content: [
				{ type: "text", text: JSON.stringify({ status: "error", message: "session_not_found" }) },
			],
		};
	}
	switch (args.operation) {
		case "import": {
			if (!args.sequentialImport) break;
			const imported = totHandler.importFromSequentialFormat(args.sequentialImport);
			totSessions.set(imported.sessionId, imported);
			sessionId = imported.sessionId;
			session = imported;
			break;
		}
		case "expand": {
			if (!args.nodeId) break;
			totHandler.expand(args.nodeId, session);
			break;
		}
		case "evaluate": {
			if (!args.nodeId) break;
			totHandler.evaluate(args.nodeId, session);
			break;
		}
		case "selectNext": {
			totHandler.selectNext(session);
			break;
		}
		case "prune": {
			if (!args.nodeId) break;
			totHandler.prune(args.nodeId, args.reason || "unspecified", session);
			break;
		}
		case "isSolution": {
			if (!args.nodeId) break;
			totHandler.isSolution(args.nodeId, session);
			break;
		}
		case "bestPath": {
			// No-op here; computed in response
			break;
		}
		case "iterate": {
			totHandler.runIteration(session);
			break;
		}
	}
	const exportSeq = totHandler.exportToSequentialFormat(session);
	const bestPath = totHandler.getBestPath(session);
	return {
		content: [
			{
				type: "text",
				text: JSON.stringify({
					status: "success",
					sessionId,
					iteration: session.iteration,
					stats: session.stats,
					bestPath,
					exportSequential: exportSeq,
				}),
			},
		],
	};
}
// ToolRegistry.getInstance().register({
//   name: 'treeofthought',
//   description: 'Tree-of-Thought reasoning tool (expand/evaluate/select/prune/iterate)',
//   schema: ToTSchema,
//   handler: handleToT,
//   category: 'reasoning'
// });
export { handleToT };
//# sourceMappingURL=tree-of-thought.js.map
