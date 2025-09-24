import { z } from 'zod';
const SocraticMethodSchema = z.object({
    initialStatement: z.string().describe('Initial statement or belief'),
    questions: z.array(z.object({
        question: z.string(),
        purpose: z.string(),
        response: z.string().optional()
    })).describe('Socratic questions'),
    assumptions: z.array(z.string()).describe('Identified assumptions'),
    contradictions: z.array(z.string()).optional().describe('Discovered contradictions'),
    refinedUnderstanding: z.string().describe('Refined understanding after questioning')
});
async function handleSocraticMethod(args, session) {
    const socraticData = {
        initialStatement: args.initialStatement,
        questions: args.questions,
        assumptions: args.assumptions,
        contradictions: args.contradictions || [],
        refinedUnderstanding: args.refinedUnderstanding,
        timestamp: new Date().toISOString()
    };
    const stats = session.getStats();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...socraticData,
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
//   name: 'socraticmethod',
//   description: 'Use Socratic questioning to examine beliefs and uncover truth',
//   schema: SocraticMethodSchema,
//   handler: handleSocraticMethod,
//   category: 'reasoning'
// });
export { handleSocraticMethod };
//# sourceMappingURL=socratic-method.js.map