import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const MetacognitiveSchema: z.ZodObject<{
    thinkingProcess: z.ZodString;
    observations: z.ZodArray<z.ZodString, "many">;
    adjustments: z.ZodArray<z.ZodString, "many">;
    effectiveness: z.ZodNumber;
    insights: z.ZodString;
}, "strip", z.ZodTypeAny, {
    thinkingProcess: string;
    observations: string[];
    adjustments: string[];
    effectiveness: number;
    insights: string;
}, {
    thinkingProcess: string;
    observations: string[];
    adjustments: string[];
    effectiveness: number;
    insights: string;
}>;
export type MetacognitiveArgs = z.infer<typeof MetacognitiveSchema>;
declare function handleMetacognitive(args: MetacognitiveArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleMetacognitive };
//# sourceMappingURL=metacognitive.d.ts.map