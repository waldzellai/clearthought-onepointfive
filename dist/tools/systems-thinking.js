import { z } from 'zod';
const SystemsThinkingSchema = z.object({
    systemName: z.string().describe('Name of the system being analyzed'),
    components: z.array(z.object({
        name: z.string(),
        function: z.string(),
        interactions: z.array(z.string())
    })).describe('System components'),
    boundaries: z.string().describe('System boundaries'),
    inputs: z.array(z.string()).describe('System inputs'),
    outputs: z.array(z.string()).describe('System outputs'),
    feedbackLoops: z.array(z.object({
        type: z.enum(['positive', 'negative']),
        description: z.string()
    })).optional().describe('Feedback loops'),
    emergentProperties: z.array(z.string()).optional().describe('Emergent properties')
});
async function handleSystemsThinking(args, session) {
    const systemsData = {
        systemName: args.systemName,
        components: args.components,
        boundaries: args.boundaries,
        inputs: args.inputs,
        outputs: args.outputs,
        feedbackLoops: args.feedbackLoops || [],
        emergentProperties: args.emergentProperties || [],
        timestamp: new Date().toISOString()
    };
    const stats = session.getStats();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...systemsData,
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
//   name: 'systemsthinking',
//   description: 'Analyze complex systems and their interactions',
//   schema: SystemsThinkingSchema,
//   handler: handleSystemsThinking,
//   category: 'reasoning'
// });
export { handleSystemsThinking };
//# sourceMappingURL=systems-thinking.js.map