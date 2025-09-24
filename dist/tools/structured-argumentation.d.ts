import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const StructuredArgumentationSchema: z.ZodObject<{
    claim: z.ZodString;
    premises: z.ZodArray<z.ZodObject<{
        statement: z.ZodString;
        support: z.ZodString;
        strength: z.ZodEnum<["strong", "moderate", "weak"]>;
    }, "strip", z.ZodTypeAny, {
        strength: "strong" | "moderate" | "weak";
        statement: string;
        support: string;
    }, {
        strength: "strong" | "moderate" | "weak";
        statement: string;
        support: string;
    }>, "many">;
    counterarguments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        argument: z.ZodString;
        rebuttal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        argument: string;
        rebuttal: string;
    }, {
        argument: string;
        rebuttal: string;
    }>, "many">>;
    conclusion: z.ZodString;
    validity: z.ZodEnum<["valid", "invalid", "uncertain"]>;
}, "strip", z.ZodTypeAny, {
    claim: string;
    conclusion: string;
    premises: {
        strength: "strong" | "moderate" | "weak";
        statement: string;
        support: string;
    }[];
    validity: "valid" | "uncertain" | "invalid";
    counterarguments?: {
        argument: string;
        rebuttal: string;
    }[] | undefined;
}, {
    claim: string;
    conclusion: string;
    premises: {
        strength: "strong" | "moderate" | "weak";
        statement: string;
        support: string;
    }[];
    validity: "valid" | "uncertain" | "invalid";
    counterarguments?: {
        argument: string;
        rebuttal: string;
    }[] | undefined;
}>;
export type StructuredArgumentationArgs = z.infer<typeof StructuredArgumentationSchema>;
declare function handleStructuredArgumentation(args: StructuredArgumentationArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleStructuredArgumentation };
//# sourceMappingURL=structured-argumentation.d.ts.map