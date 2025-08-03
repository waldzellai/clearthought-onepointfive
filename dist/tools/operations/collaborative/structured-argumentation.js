import { z } from 'zod';
export function registerStructuredArgumentation(server, sessionState) {
    server.tool('structuredargumentation', 'Construct and analyze structured arguments', {
        claim: z.string(),
        premises: z.array(z.string()),
        conclusion: z.string(),
        argumentType: z.string(),
        confidence: z.number(),
        nextArgumentNeeded: z.boolean()
    }, async (args) => {
        const argumentData = {
            claim: args.claim,
            premises: args.premises,
            conclusion: args.conclusion,
            argumentType: args.argumentType,
            confidence: args.confidence,
            nextArgumentNeeded: args.nextArgumentNeeded,
            sessionId: sessionState.sessionId,
            iteration: 1
        };
        // Store using the addArgumentation method
        sessionState.addArgumentation(argumentData);
        // Get session context
        const stats = sessionState.getStats();
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        claim: args.claim,
                        premisesCount: args.premises.length,
                        argumentType: args.argumentType,
                        confidence: args.confidence,
                        nextArgumentNeeded: args.nextArgumentNeeded,
                        status: 'success',
                        sessionContext: {
                            sessionId: sessionState.sessionId,
                            totalOperations: stats.totalOperations,
                            creativeStoreStats: stats.stores.creative
                        }
                    }, null, 2)
                }]
        };
    });
}
//# sourceMappingURL=structured-argumentation.js.map