import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const ScientificMethodSchema: z.ZodObject<{
    hypothesis: z.ZodString;
    experimentDesign: z.ZodString;
    variables: z.ZodObject<{
        independent: z.ZodArray<z.ZodString, "many">;
        dependent: z.ZodArray<z.ZodString, "many">;
        controlled: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        independent: string[];
        dependent: string[];
        controlled: string[];
    }, {
        independent: string[];
        dependent: string[];
        controlled: string[];
    }>;
    methodology: z.ZodString;
    expectedResults: z.ZodString;
    actualResults: z.ZodOptional<z.ZodString>;
    analysis: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    hypothesis: string;
    experimentDesign: string;
    variables: {
        independent: string[];
        dependent: string[];
        controlled: string[];
    };
    methodology: string;
    expectedResults: string;
    analysis?: string | undefined;
    conclusion?: string | undefined;
    actualResults?: string | undefined;
}, {
    hypothesis: string;
    experimentDesign: string;
    variables: {
        independent: string[];
        dependent: string[];
        controlled: string[];
    };
    methodology: string;
    expectedResults: string;
    analysis?: string | undefined;
    conclusion?: string | undefined;
    actualResults?: string | undefined;
}>;
export type ScientificMethodArgs = z.infer<typeof ScientificMethodSchema>;
declare function handleScientificMethod(args: ScientificMethodArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleScientificMethod };
//# sourceMappingURL=scientific-method.d.ts.map