import { z } from 'zod';
export function registerDebuggingApproach(server, sessionState) {
    server.tool('debuggingapproach', 'Apply systematic debugging approaches to identify and resolve issues', {
        approachName: z.enum(['binary_search', 'reverse_engineering', 'divide_conquer', 'backtracking', 'cause_elimination', 'program_slicing']).describe('Debugging approach'),
        steps: z.array(z.string()).describe('Steps taken to debug'),
        resolution: z.string().describe('How the issue was resolved')
    }, async (args) => {
        const debugData = {
            approachName: args.approachName,
            issue: 'Issue being debugged', // TODO: Add issue to schema
            steps: args.steps,
            findings: 'Findings during debugging', // TODO: Add findings to schema
            resolution: args.resolution
        };
        sessionState.addDebuggingSession(debugData);
        // Get session context
        const stats = sessionState.getStats();
        const recentDebugging = sessionState.getDebuggingSessions().slice(-3);
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        ...debugData,
                        status: 'success',
                        hasSteps: args.steps.length > 0,
                        hasResolution: !!args.resolution,
                        sessionContext: {
                            sessionId: sessionState.sessionId,
                            totalDebuggingApproaches: stats.stores.debugging.count || 0,
                            recentApproaches: recentDebugging.map(d => ({
                                approachName: d.approachName,
                                resolved: !!d.resolution
                            }))
                        }
                    }, null, 2)
                }]
        };
    });
}
//# sourceMappingURL=debugging-approach.js.map