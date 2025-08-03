import { z } from 'zod';
export function registerMetacognitiveMonitoring(server, sessionState) {
    server.tool('metacognitivemonitoring', 'Monitor and assess thinking processes and knowledge', {
        task: z.string(),
        stage: z.string(),
        overallConfidence: z.number(),
        uncertaintyAreas: z.array(z.string()),
        recommendedApproach: z.string(),
        monitoringId: z.string(),
        iteration: z.number(),
        nextAssessmentNeeded: z.boolean()
    }, async (args) => {
        const metacognitiveData = {
            task: args.task,
            stage: args.stage,
            overallConfidence: args.overallConfidence,
            uncertaintyAreas: args.uncertaintyAreas,
            recommendedApproach: args.recommendedApproach,
            monitoringId: args.monitoringId,
            iteration: args.iteration,
            nextAssessmentNeeded: args.nextAssessmentNeeded
        };
        sessionState.addMetacognitive(metacognitiveData);
        // Get session context
        const stats = sessionState.getStats();
        const recentMonitoring = sessionState.getMetacognitiveSessions();
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        task: args.task,
                        stage: args.stage,
                        overallConfidence: args.overallConfidence,
                        uncertaintyCount: args.uncertaintyAreas.length,
                        nextAssessmentNeeded: args.nextAssessmentNeeded,
                        status: 'success',
                        sessionContext: {
                            sessionId: sessionState.sessionId,
                            totalOperations: stats.totalOperations,
                            metacognitiveStoreStats: stats.stores.metacognitive,
                            recentSessions: recentMonitoring.slice(-3).map((m) => ({
                                task: m.task,
                                stage: m.stage,
                                confidence: m.overallConfidence,
                                iteration: m.iteration
                            }))
                        }
                    }, null, 2)
                }]
        };
    });
}
//# sourceMappingURL=metacognitive.js.map