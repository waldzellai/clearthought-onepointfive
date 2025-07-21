import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface VisualReasoningArgs {
    operation: string;
    diagramId: string;
    diagramType: string;
    iteration: number;
    nextOperationNeeded: boolean;
}
export declare function handleVisualReasoning(args: VisualReasoningArgs): Promise<CallToolResult>;
//# sourceMappingURL=visual-reasoning.d.ts.map