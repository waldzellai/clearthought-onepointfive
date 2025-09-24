import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const SocraticMethodSchema: z.ZodObject<{
    initialStatement: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        purpose: z.ZodString;
        response: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        question: string;
        purpose: string;
        response?: string | undefined;
    }, {
        question: string;
        purpose: string;
        response?: string | undefined;
    }>, "many">;
    assumptions: z.ZodArray<z.ZodString, "many">;
    contradictions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    refinedUnderstanding: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assumptions: string[];
    questions: {
        question: string;
        purpose: string;
        response?: string | undefined;
    }[];
    initialStatement: string;
    refinedUnderstanding: string;
    contradictions?: string[] | undefined;
}, {
    assumptions: string[];
    questions: {
        question: string;
        purpose: string;
        response?: string | undefined;
    }[];
    initialStatement: string;
    refinedUnderstanding: string;
    contradictions?: string[] | undefined;
}>;
export type SocraticMethodArgs = z.infer<typeof SocraticMethodSchema>;
declare function handleSocraticMethod(args: SocraticMethodArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleSocraticMethod };
//# sourceMappingURL=socratic-method.d.ts.map