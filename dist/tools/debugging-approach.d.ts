import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const DebuggingApproachSchema: z.ZodObject<{
    approachName: z.ZodEnum<["binary_search", "reverse_engineering", "divide_conquer", "backtracking", "cause_elimination", "program_slicing"]>;
    issue: z.ZodString;
    steps: z.ZodArray<z.ZodString, "many">;
    findings: z.ZodString;
    resolution: z.ZodString;
}, "strip", z.ZodTypeAny, {
    steps: string[];
    approachName: "binary_search" | "reverse_engineering" | "divide_conquer" | "backtracking" | "cause_elimination" | "program_slicing";
    issue: string;
    findings: string;
    resolution: string;
}, {
    steps: string[];
    approachName: "binary_search" | "reverse_engineering" | "divide_conquer" | "backtracking" | "cause_elimination" | "program_slicing";
    issue: string;
    findings: string;
    resolution: string;
}>;
export type DebuggingApproachArgs = z.infer<typeof DebuggingApproachSchema>;
declare function handleDebuggingApproach(args: DebuggingApproachArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleDebuggingApproach };
//# sourceMappingURL=debugging-approach.d.ts.map