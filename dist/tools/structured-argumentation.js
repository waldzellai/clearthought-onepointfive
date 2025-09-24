import { z } from 'zod';
const StructuredArgumentationSchema = z.object({
    claim: z.string().describe('Main claim or thesis'),
    premises: z.array(z.object({
        statement: z.string(),
        support: z.string(),
        strength: z.enum(['strong', 'moderate', 'weak'])
    })).describe('Supporting premises'),
    counterarguments: z.array(z.object({
        argument: z.string(),
        rebuttal: z.string()
    })).optional().describe('Counterarguments and rebuttals'),
    conclusion: z.string().describe('Final conclusion'),
    validity: z.enum(['valid', 'invalid', 'uncertain']).describe('Argument validity')
});
async function handleStructuredArgumentation(args, session) {
    const argumentData = {
        claim: args.claim,
        premises: args.premises,
        counterarguments: args.counterarguments || [],
        conclusion: args.conclusion,
        validity: args.validity,
        timestamp: new Date().toISOString()
    };
    const stats = session.getStats();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...argumentData,
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
//   name: 'structuredargumentation',
//   description: 'Build and analyze structured logical arguments',
//   schema: StructuredArgumentationSchema,
//   handler: handleStructuredArgumentation,
//   category: 'reasoning'
// });
export { handleStructuredArgumentation };
//# sourceMappingURL=structured-argumentation.js.map