import { z } from 'zod';
const CollaborativeReasoningSchema = z.object({
    topic: z.string().describe('The topic being discussed'),
    perspectives: z.array(z.object({
        agent: z.string().describe('Name or role of the agent'),
        viewpoint: z.string().describe('The agent\'s perspective'),
        reasoning: z.string().describe('Reasoning behind the viewpoint')
    })).describe('Different perspectives from multiple agents'),
    synthesis: z.string().describe('Synthesis of all perspectives'),
    consensus: z.string().optional().describe('Consensus reached, if any'),
    // NEW: Optional sessionId for continuation
    sessionId: z.string().optional().describe('Session ID for continuing existing collaborative session')
});
async function handleCollaborativeReasoning(args, session) {
    const collaborativeData = {
        topic: args.topic,
        perspectives: args.perspectives,
        synthesis: args.synthesis,
        consensus: args.consensus,
        timestamp: new Date().toISOString()
    };
    // Store in unified store or session
    const stats = session.getStats();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...collaborativeData,
                    status: 'success',
                    sessionContext: {
                        sessionId: session.sessionId,
                        stats
                    }
                })
            }]
    };
}
// Self-register
// ToolRegistry.getInstance().register({
//   name: 'collaborativereasoning',
//   description: 'Enable multi-agent collaborative reasoning and perspective synthesis',
//   schema: CollaborativeReasoningSchema,
//   handler: handleCollaborativeReasoning,
//   category: 'collaborative'
// });
export { handleCollaborativeReasoning };
//# sourceMappingURL=collaborative-reasoning.js.map