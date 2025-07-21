import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface DebuggingApproachArgs {
    approachName: "binary_search" | "reverse_engineering" | "divide_conquer" | "backtracking" | "cause_elimination" | "program_slicing";
    steps: string[];
    resolution: string;
}
export declare function handleDebuggingApproach(args: DebuggingApproachArgs): Promise<CallToolResult>;
//# sourceMappingURL=debugging-approach.d.ts.map