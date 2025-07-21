import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface SequentialThinkingArgs {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    isRevision?: boolean;
    revisesThought?: number;
    branchFromThought?: number;
    branchId?: string;
    needsMoreThoughts?: boolean;
}
export declare function handleSequentialThinking(args: SequentialThinkingArgs): Promise<CallToolResult>;
//# sourceMappingURL=sequential-thinking.d.ts.map