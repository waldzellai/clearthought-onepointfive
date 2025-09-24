import { z } from 'zod';
import MCTSHandler from '../handlers/reasoning-patterns/mcts.js';
const mctsSessions = new Map();
const mctsHandler = new MCTSHandler();
const MCTSSchema = z.object({
    operation: z.enum(['init', 'import', 'iteration', 'bestAction', 'probs', 'export'])
        .describe('MCTS operation'),
    sessionId: z.string().optional(),
    explorationConstant: z.number().optional(),
    config: z.object({
        ucbVariant: z.enum(['ucb1', 'ucb1-tuned', 'puct', 'custom']).optional(),
        useRAVE: z.boolean().optional(),
        raveBias: z.number().optional(),
        virtualLoss: z.number().optional(),
        reuseTree: z.boolean().optional(),
        usePriors: z.boolean().optional(),
        useTranspositions: z.boolean().optional()
    }).optional(),
    sequentialImport: z.array(z.object({
        thought: z.string(),
        thoughtNumber: z.number(),
        totalThoughts: z.number(),
        nextThoughtNeeded: z.boolean()
    })).optional()
});
async function handleMCTS(args, _session) {
    let sessionId = args.sessionId;
    let session = sessionId ? mctsSessions.get(sessionId) : undefined;
    if (!session || args.operation === 'init') {
        session = mctsHandler.initializeSession(args.explorationConstant, args.config || {});
        sessionId = session.sessionId;
        mctsSessions.set(sessionId, session);
    }
    if (!session) {
        return { content: [{ type: 'text', text: JSON.stringify({ status: 'error', message: 'session_not_found' }) }] };
    }
    switch (args.operation) {
        case 'import': {
            if (!args.sequentialImport)
                break;
            const imported = mctsHandler.importFromSequentialFormat(args.sequentialImport);
            mctsSessions.set(imported.sessionId, imported);
            sessionId = imported.sessionId;
            session = imported;
            break;
        }
        case 'iteration': {
            mctsHandler.runIteration(session);
            break;
        }
        case 'bestAction': {
            mctsHandler.getBestAction(session);
            break;
        }
        case 'probs': {
            mctsHandler.getActionProbabilities(session.rootNodeId, session);
            break;
        }
        case 'export': {
            // handled below
            break;
        }
    }
    const bestAction = mctsHandler.getBestAction(session);
    const exportSeq = mctsHandler.exportToSequentialFormat(session);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    status: 'success',
                    sessionId,
                    iteration: session.iteration,
                    simulations: session.totalSimulations,
                    bestAction,
                    stats: session.stats,
                    exportSequential: exportSeq
                })
            }]
    };
}
// ToolRegistry.getInstance().register({
//   name: 'mcts',
//   description: 'MCTS reasoning tool (iteration/bestAction/probs/export)',
//   schema: MCTSSchema,
//   handler: handleMCTS,
//   category: 'reasoning'
// });
export { handleMCTS };
//# sourceMappingURL=mcts.js.map