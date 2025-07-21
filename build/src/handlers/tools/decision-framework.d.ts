import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface DecisionFrameworkArgs {
    decisionStatement: string;
    options: Array<any>;
    analysisType: string;
    stage: string;
    decisionId: string;
    iteration: number;
    nextStageNeeded: boolean;
}
export declare function handleDecisionFramework(args: DecisionFrameworkArgs): Promise<CallToolResult>;
//# sourceMappingURL=decision-framework.d.ts.map