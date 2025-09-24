import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const CreativeThinkingSchema: z.ZodObject<{
    technique: z.ZodEnum<["brainstorming", "mind_mapping", "scamper", "six_thinking_hats", "lateral_thinking", "random_stimulation"]>;
    problem: z.ZodString;
    ideas: z.ZodArray<z.ZodString, "many">;
    connections: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    evaluation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    technique: "brainstorming" | "mind_mapping" | "scamper" | "six_thinking_hats" | "lateral_thinking" | "random_stimulation";
    problem: string;
    ideas: string[];
    evaluation?: string | undefined;
    connections?: string[] | undefined;
}, {
    technique: "brainstorming" | "mind_mapping" | "scamper" | "six_thinking_hats" | "lateral_thinking" | "random_stimulation";
    problem: string;
    ideas: string[];
    evaluation?: string | undefined;
    connections?: string[] | undefined;
}>;
export type CreativeThinkingArgs = z.infer<typeof CreativeThinkingSchema>;
declare function handleCreativeThinking(args: CreativeThinkingArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleCreativeThinking };
//# sourceMappingURL=creative-thinking.d.ts.map