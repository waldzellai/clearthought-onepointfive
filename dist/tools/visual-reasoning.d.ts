import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const VisualReasoningSchema: z.ZodObject<{
    visualType: z.ZodEnum<["diagram", "flowchart", "mind_map", "concept_map", "graph", "matrix"]>;
    elements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        label: z.ZodString;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        label: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
    }, {
        type: string;
        id: string;
        label: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
    }>, "many">;
    connections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        from: string;
        to: string;
        type?: string | undefined;
        label?: string | undefined;
    }, {
        from: string;
        to: string;
        type?: string | undefined;
        label?: string | undefined;
    }>, "many">>;
    insights: z.ZodString;
}, "strip", z.ZodTypeAny, {
    insights: string;
    visualType: "flowchart" | "graph" | "diagram" | "mind_map" | "concept_map" | "matrix";
    elements: {
        type: string;
        id: string;
        label: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
    }[];
    connections?: {
        from: string;
        to: string;
        type?: string | undefined;
        label?: string | undefined;
    }[] | undefined;
}, {
    insights: string;
    visualType: "flowchart" | "graph" | "diagram" | "mind_map" | "concept_map" | "matrix";
    elements: {
        type: string;
        id: string;
        label: string;
        position?: {
            x: number;
            y: number;
        } | undefined;
    }[];
    connections?: {
        from: string;
        to: string;
        type?: string | undefined;
        label?: string | undefined;
    }[] | undefined;
}>;
export type VisualReasoningArgs = z.infer<typeof VisualReasoningSchema>;
declare function handleVisualReasoning(args: VisualReasoningArgs, session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleVisualReasoning };
//# sourceMappingURL=visual-reasoning.d.ts.map