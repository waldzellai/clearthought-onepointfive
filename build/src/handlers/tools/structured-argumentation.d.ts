import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface StructuredArgumentationArgs {
    claim: string;
    premises: string[];
    conclusion: string;
    argumentType: string;
    confidence: number;
    nextArgumentNeeded: boolean;
}
export declare function handleStructuredArgumentation(args: StructuredArgumentationArgs): Promise<CallToolResult>;
//# sourceMappingURL=structured-argumentation.d.ts.map