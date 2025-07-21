import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface MetacognitiveMonitoringArgs {
    task: string;
    stage: string;
    overallConfidence: number;
    uncertaintyAreas: string[];
    recommendedApproach: string;
    monitoringId: string;
    iteration: number;
    nextAssessmentNeeded: boolean;
}
export declare function handleMetacognitiveMonitoring(args: MetacognitiveMonitoringArgs): Promise<CallToolResult>;
//# sourceMappingURL=metacognitive-monitoring.d.ts.map