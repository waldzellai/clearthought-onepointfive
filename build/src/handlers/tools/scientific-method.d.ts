import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface ScientificMethodArgs {
    stage: string;
    inquiryId: string;
    iteration: number;
    nextStageNeeded: boolean;
}
export declare function handleScientificMethod(args: ScientificMethodArgs): Promise<CallToolResult>;
//# sourceMappingURL=scientific-method.d.ts.map