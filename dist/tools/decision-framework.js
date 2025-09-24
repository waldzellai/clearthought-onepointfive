import { z } from 'zod';
const DecisionFrameworkSchema = z.object({
    decisionStatement: z.string().describe('The decision to be made'),
    options: z.array(z.object({
        name: z.string(),
        description: z.string()
    })).describe('Available options'),
    analysisType: z.string().describe('Type of analysis framework'),
    stage: z.string().describe('Current stage of decision process'),
    decisionId: z.string().describe('Unique identifier for this decision'),
    iteration: z.number().describe('Iteration number'),
    nextStageNeeded: z.boolean().describe('Whether next stage is needed')
});
async function handleDecisionFramework(args, session) {
    const decisionData = {
        decisionStatement: args.decisionStatement,
        options: args.options,
        analysisType: args.analysisType, // Type will be validated by schema
        stage: args.stage, // Type will be validated by schema
        decisionId: args.decisionId,
        iteration: args.iteration,
        nextStageNeeded: args.nextStageNeeded
    };
    session.addDecision(decisionData);
    const stats = session.getStats();
    const decisions = session.getDecisions();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...decisionData,
                    status: 'success',
                    sessionContext: {
                        sessionId: session.sessionId,
                        totalDecisions: decisions.length,
                        stats
                    }
                })
            }]
    };
}
// Self-register
// ToolRegistry.getInstance().register({
//   name: 'decisionframework',
//   description: 'Apply structured decision-making frameworks',
//   schema: DecisionFrameworkSchema,
//   handler: handleDecisionFramework,
//   category: 'metacognitive'
// });
export { handleDecisionFramework };
//# sourceMappingURL=decision-framework.js.map