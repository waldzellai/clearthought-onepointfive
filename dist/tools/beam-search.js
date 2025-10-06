import { z } from "zod";
import BeamSearchHandler from "../handlers/reasoning-patterns/beam-search.js";

const beamSessions = new Map();
const beamHandler = new BeamSearchHandler();
const BeamSchema = z.object({
	operation: z
		.enum([
			"init",
			"import",
			"generate",
			"evaluate",
			"prune",
			"merge",
			"iterate",
			"bestPath",
			"export",
		])
		.describe("Beam Search operation"),
	sessionId: z.string().optional(),
	beamWidth: z.number().optional(),
	config: z
		.object({
			expansionStrategy: z.enum(["breadth", "depth", "hybrid"]).optional(),
			branchingFactor: z.number().optional(),
			scoreAggregation: z.enum(["sum", "average", "max", "weighted"]).optional(),
			allowMerging: z.boolean().optional(),
			mergeThreshold: z.number().optional(),
			pruningStrategy: z.enum(["absolute", "relative", "adaptive"]).optional(),
			keepPrunedPaths: z.boolean().optional(),
			diversityBonus: z.number().optional(),
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
		.optional(),
});
async function handleBeam(args, _session) {
	let sessionId = args.sessionId;
	let session = sessionId ? beamSessions.get(sessionId) : undefined;
	if (!session || args.operation === "init") {
		session = beamHandler.initializeSession(args.beamWidth, args.config || {});
		sessionId = session.sessionId;
		beamSessions.set(sessionId, session);
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
			const imported = beamHandler.importFromSequentialFormat(args.sequentialImport);
			beamSessions.set(imported.sessionId, imported);
			sessionId = imported.sessionId;
			session = imported;
			break;
		}
		case "generate": {
			beamHandler.generateNextGeneration(session);
			break;
		}
		case "evaluate": {
			beamHandler.evaluatePaths(session);
			break;
		}
		case "prune": {
			beamHandler.prunePaths(session);
			break;
		}
		case "merge": {
			// Merge is opportunistic in handler; explicit call does nothing without path IDs in schema
			break;
		}
		case "iterate": {
			beamHandler.runIteration(session);
			break;
		}
		case "bestPath":
		case "export": {
			// handled below
			break;
		}
	}
	const best = beamHandler.getBestPath(session);
	const exportSeq = beamHandler.exportToSequentialFormat(session);
	return {
		content: [
			{
				type: "text",
				text: JSON.stringify({
					status: "success",
					sessionId,
					iteration: session.iteration,
					stats: session.stats,
					currentGeneration: session.currentGeneration,
					activePaths: session.activePaths.length,
					bestPath: best,
					exportSequential: exportSeq,
				}),
			},
		],
	};
}
// ToolRegistry.getInstance().register({
//   name: 'beamsearch',
//   description: 'Beam Search reasoning tool (generate/evaluate/prune/iterate/export)',
//   schema: BeamSchema,
//   handler: handleBeam,
//   category: 'reasoning'
// });
export { handleBeam };
//# sourceMappingURL=beam-search.js.map
