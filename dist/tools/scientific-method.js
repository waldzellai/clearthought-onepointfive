import { z } from 'zod';
const ScientificMethodSchema = z.object({
    hypothesis: z.string().describe('The hypothesis to test'),
    experimentDesign: z.string().describe('Design of the experiment'),
    variables: z.object({
        independent: z.array(z.string()),
        dependent: z.array(z.string()),
        controlled: z.array(z.string())
    }).describe('Experimental variables'),
    methodology: z.string().describe('Methodology description'),
    expectedResults: z.string().describe('Expected results'),
    actualResults: z.string().optional().describe('Actual results if available'),
    analysis: z.string().optional().describe('Analysis of results'),
    conclusion: z.string().optional().describe('Conclusion drawn')
});
async function handleScientificMethod(args, session) {
    const scientificData = {
        hypothesis: args.hypothesis,
        experimentDesign: args.experimentDesign,
        variables: args.variables,
        methodology: args.methodology,
        expectedResults: args.expectedResults,
        actualResults: args.actualResults,
        analysis: args.analysis,
        conclusion: args.conclusion,
        timestamp: new Date().toISOString()
    };
    const stats = session.getStats();
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    ...scientificData,
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
//   name: 'scientificmethod',
//   description: 'Apply scientific method for hypothesis testing and experimentation',
//   schema: ScientificMethodSchema,
//   handler: handleScientificMethod,
//   category: 'reasoning'
// });
export { handleScientificMethod };
//# sourceMappingURL=scientific-method.js.map