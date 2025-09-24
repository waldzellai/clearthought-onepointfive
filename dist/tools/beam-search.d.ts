import { z } from 'zod';
import type { SessionState } from '../state/SessionState.js';
declare const BeamSchema: z.ZodObject<{
    operation: z.ZodEnum<["init", "import", "generate", "evaluate", "prune", "merge", "iterate", "bestPath", "export"]>;
    sessionId: z.ZodOptional<z.ZodString>;
    beamWidth: z.ZodOptional<z.ZodNumber>;
    config: z.ZodOptional<z.ZodObject<{
        expansionStrategy: z.ZodOptional<z.ZodEnum<["breadth", "depth", "hybrid"]>>;
        branchingFactor: z.ZodOptional<z.ZodNumber>;
        scoreAggregation: z.ZodOptional<z.ZodEnum<["sum", "average", "max", "weighted"]>>;
        allowMerging: z.ZodOptional<z.ZodBoolean>;
        mergeThreshold: z.ZodOptional<z.ZodNumber>;
        pruningStrategy: z.ZodOptional<z.ZodEnum<["absolute", "relative", "adaptive"]>>;
        keepPrunedPaths: z.ZodOptional<z.ZodBoolean>;
        diversityBonus: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        expansionStrategy?: "breadth" | "depth" | "hybrid" | undefined;
        branchingFactor?: number | undefined;
        scoreAggregation?: "sum" | "average" | "max" | "weighted" | undefined;
        allowMerging?: boolean | undefined;
        mergeThreshold?: number | undefined;
        pruningStrategy?: "absolute" | "relative" | "adaptive" | undefined;
        keepPrunedPaths?: boolean | undefined;
        diversityBonus?: number | undefined;
    }, {
        expansionStrategy?: "breadth" | "depth" | "hybrid" | undefined;
        branchingFactor?: number | undefined;
        scoreAggregation?: "sum" | "average" | "max" | "weighted" | undefined;
        allowMerging?: boolean | undefined;
        mergeThreshold?: number | undefined;
        pruningStrategy?: "absolute" | "relative" | "adaptive" | undefined;
        keepPrunedPaths?: boolean | undefined;
        diversityBonus?: number | undefined;
    }>>;
    sequentialImport: z.ZodOptional<z.ZodArray<z.ZodObject<{
        thought: z.ZodString;
        thoughtNumber: z.ZodNumber;
        totalThoughts: z.ZodNumber;
        nextThoughtNeeded: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        thought: string;
        thoughtNumber: number;
        totalThoughts: number;
        nextThoughtNeeded: boolean;
    }, {
        thought: string;
        thoughtNumber: number;
        totalThoughts: number;
        nextThoughtNeeded: boolean;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    operation: "evaluate" | "merge" | "prune" | "iterate" | "export" | "init" | "import" | "generate" | "bestPath";
    sessionId?: string | undefined;
    beamWidth?: number | undefined;
    config?: {
        expansionStrategy?: "breadth" | "depth" | "hybrid" | undefined;
        branchingFactor?: number | undefined;
        scoreAggregation?: "sum" | "average" | "max" | "weighted" | undefined;
        allowMerging?: boolean | undefined;
        mergeThreshold?: number | undefined;
        pruningStrategy?: "absolute" | "relative" | "adaptive" | undefined;
        keepPrunedPaths?: boolean | undefined;
        diversityBonus?: number | undefined;
    } | undefined;
    sequentialImport?: {
        thought: string;
        thoughtNumber: number;
        totalThoughts: number;
        nextThoughtNeeded: boolean;
    }[] | undefined;
}, {
    operation: "evaluate" | "merge" | "prune" | "iterate" | "export" | "init" | "import" | "generate" | "bestPath";
    sessionId?: string | undefined;
    beamWidth?: number | undefined;
    config?: {
        expansionStrategy?: "breadth" | "depth" | "hybrid" | undefined;
        branchingFactor?: number | undefined;
        scoreAggregation?: "sum" | "average" | "max" | "weighted" | undefined;
        allowMerging?: boolean | undefined;
        mergeThreshold?: number | undefined;
        pruningStrategy?: "absolute" | "relative" | "adaptive" | undefined;
        keepPrunedPaths?: boolean | undefined;
        diversityBonus?: number | undefined;
    } | undefined;
    sequentialImport?: {
        thought: string;
        thoughtNumber: number;
        totalThoughts: number;
        nextThoughtNeeded: boolean;
    }[] | undefined;
}>;
export type BeamArgs = z.infer<typeof BeamSchema>;
declare function handleBeam(args: BeamArgs, _session: SessionState): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export { handleBeam };
//# sourceMappingURL=beam-search.d.ts.map