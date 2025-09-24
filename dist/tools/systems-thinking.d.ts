import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const SystemsThinkingSchema: z.ZodObject<{
    systemName: z.ZodString;
    components: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        function: z.ZodString;
        interactions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        function: string;
        name: string;
        interactions: string[];
    }, {
        function: string;
        name: string;
        interactions: string[];
    }>, "many">;
    boundaries: z.ZodString;
    inputs: z.ZodArray<z.ZodString, "many">;
    outputs: z.ZodArray<z.ZodString, "many">;
    feedbackLoops: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["positive", "negative"]>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "positive" | "negative";
        description: string;
    }, {
        type: "positive" | "negative";
        description: string;
    }>, "many">>;
    emergentProperties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    systemName: string;
    components: {
        function: string;
        name: string;
        interactions: string[];
    }[];
    boundaries: string;
    inputs: string[];
    outputs: string[];
    feedbackLoops?: {
        type: "positive" | "negative";
        description: string;
    }[] | undefined;
    emergentProperties?: string[] | undefined;
}, {
    systemName: string;
    components: {
        function: string;
        name: string;
        interactions: string[];
    }[];
    boundaries: string;
    inputs: string[];
    outputs: string[];
    feedbackLoops?: {
        type: "positive" | "negative";
        description: string;
    }[] | undefined;
    emergentProperties?: string[] | undefined;
}>;
export type SystemsThinkingArgs = z.infer<typeof SystemsThinkingSchema>;
declare function handleSystemsThinking(args: SystemsThinkingArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleSystemsThinking };
//# sourceMappingURL=systems-thinking.d.ts.map