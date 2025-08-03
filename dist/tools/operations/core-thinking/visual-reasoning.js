import { z } from 'zod';
export function registerVisualReasoning(server, sessionState) {
    server.tool('visualreasoning', 'Process visual reasoning and diagram operations', {
        operation: z.string(),
        diagramId: z.string(),
        diagramType: z.string(),
        iteration: z.number(),
        nextOperationNeeded: z.boolean()
    }, async (args) => {
        const visualData = {
            operation: args.operation,
            diagramId: args.diagramId,
            diagramType: args.diagramType,
            iteration: args.iteration,
            nextOperationNeeded: args.nextOperationNeeded
        };
        sessionState.addVisualOperation(visualData);
        // Get session context
        const stats = sessionState.getStats();
        const recentVisuals = sessionState.getVisualOperations();
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        diagramId: args.diagramId,
                        diagramType: args.diagramType,
                        operation: args.operation,
                        iteration: args.iteration,
                        nextOperationNeeded: args.nextOperationNeeded,
                        status: 'success',
                        sessionContext: {
                            sessionId: sessionState.sessionId,
                            totalOperations: stats.totalOperations,
                            visualStoreStats: stats.stores.visual,
                            recentOperations: recentVisuals.slice(-3).map((v) => ({
                                diagramId: v.diagramId,
                                operation: v.operation,
                                iteration: v.iteration
                            }))
                        }
                    }, null, 2)
                }]
        };
    });
}
//# sourceMappingURL=visual-reasoning.js.map