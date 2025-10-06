import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
declare const GoTSchema: z.ZodObject<
	{
		operation: z.ZodEnum<
			["init", "import", "addNode", "connect", "paths", "neighbors", "analyze", "merge", "export"]
		>;
		sessionId: z.ZodOptional<z.ZodString>;
		node: z.ZodOptional<
			z.ZodObject<
				{
					content: z.ZodString;
					nodeType: z.ZodEnum<
						[
							"hypothesis",
							"evidence",
							"conclusion",
							"question",
							"insight",
							"assumption",
							"counterargument",
						]
					>;
					strength: z.ZodNumber;
					metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
				},
				"strip",
				z.ZodTypeAny,
				{
					content: string;
					nodeType:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument";
					strength: number;
					metadata?: Record<string, any> | undefined;
				},
				{
					content: string;
					nodeType:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument";
					strength: number;
					metadata?: Record<string, any> | undefined;
				}
			>
		>;
		edge: z.ZodOptional<
			z.ZodObject<
				{
					sourceId: z.ZodString;
					targetId: z.ZodString;
					edgeType: z.ZodEnum<
						[
							"supports",
							"contradicts",
							"refines",
							"questions",
							"leads-to",
							"depends-on",
							"alternatives",
							"elaborates",
						]
					>;
					weight: z.ZodNumber;
				},
				"strip",
				z.ZodTypeAny,
				{
					sourceId: string;
					targetId: string;
					edgeType:
						| "questions"
						| "supports"
						| "contradicts"
						| "refines"
						| "leads-to"
						| "depends-on"
						| "alternatives"
						| "elaborates";
					weight: number;
				},
				{
					sourceId: string;
					targetId: string;
					edgeType:
						| "questions"
						| "supports"
						| "contradicts"
						| "refines"
						| "leads-to"
						| "depends-on"
						| "alternatives"
						| "elaborates";
					weight: number;
				}
			>
		>;
		startId: z.ZodOptional<z.ZodString>;
		endId: z.ZodOptional<z.ZodString>;
		direction: z.ZodOptional<z.ZodEnum<["incoming", "outgoing", "both"]>>;
		sequentialImport: z.ZodOptional<
			z.ZodArray<
				z.ZodObject<
					{
						thought: z.ZodString;
						thoughtNumber: z.ZodNumber;
						totalThoughts: z.ZodNumber;
						nextThoughtNeeded: z.ZodBoolean;
					},
					"strip",
					z.ZodTypeAny,
					{
						thought: string;
						thoughtNumber: number;
						totalThoughts: number;
						nextThoughtNeeded: boolean;
					},
					{
						thought: string;
						thoughtNumber: number;
						totalThoughts: number;
						nextThoughtNeeded: boolean;
					}
				>,
				"many"
			>
		>;
		config: z.ZodOptional<
			z.ZodObject<
				{
					maxNodes: z.ZodOptional<z.ZodNumber>;
					maxEdges: z.ZodOptional<z.ZodNumber>;
					allowCycles: z.ZodOptional<z.ZodBoolean>;
					edgeWeightThreshold: z.ZodOptional<z.ZodNumber>;
					analysisAlgorithms: z.ZodOptional<
						z.ZodArray<z.ZodEnum<["centrality", "clustering", "paths", "cycles"]>, "many">
					>;
					defaultNodeType: z.ZodOptional<
						z.ZodEnum<
							[
								"hypothesis",
								"evidence",
								"conclusion",
								"question",
								"insight",
								"assumption",
								"counterargument",
							]
						>
					>;
					autoPruneWeakEdges: z.ZodOptional<z.ZodBoolean>;
				},
				"strip",
				z.ZodTypeAny,
				{
					maxNodes?: number | undefined;
					maxEdges?: number | undefined;
					allowCycles?: boolean | undefined;
					edgeWeightThreshold?: number | undefined;
					analysisAlgorithms?: ("centrality" | "clustering" | "paths" | "cycles")[] | undefined;
					defaultNodeType?:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument"
						| undefined;
					autoPruneWeakEdges?: boolean | undefined;
				},
				{
					maxNodes?: number | undefined;
					maxEdges?: number | undefined;
					allowCycles?: boolean | undefined;
					edgeWeightThreshold?: number | undefined;
					analysisAlgorithms?: ("centrality" | "clustering" | "paths" | "cycles")[] | undefined;
					defaultNodeType?:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument"
						| undefined;
					autoPruneWeakEdges?: boolean | undefined;
				}
			>
		>;
	},
	"strip",
	z.ZodTypeAny,
	{
		operation:
			| "merge"
			| "analyze"
			| "paths"
			| "export"
			| "init"
			| "import"
			| "addNode"
			| "connect"
			| "neighbors";
		node?:
			| {
					content: string;
					nodeType:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument";
					strength: number;
					metadata?: Record<string, any> | undefined;
			  }
			| undefined;
		edge?:
			| {
					sourceId: string;
					targetId: string;
					edgeType:
						| "questions"
						| "supports"
						| "contradicts"
						| "refines"
						| "leads-to"
						| "depends-on"
						| "alternatives"
						| "elaborates";
					weight: number;
			  }
			| undefined;
		sessionId?: string | undefined;
		config?:
			| {
					maxNodes?: number | undefined;
					maxEdges?: number | undefined;
					allowCycles?: boolean | undefined;
					edgeWeightThreshold?: number | undefined;
					analysisAlgorithms?: ("centrality" | "clustering" | "paths" | "cycles")[] | undefined;
					defaultNodeType?:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument"
						| undefined;
					autoPruneWeakEdges?: boolean | undefined;
			  }
			| undefined;
		sequentialImport?:
			| {
					thought: string;
					thoughtNumber: number;
					totalThoughts: number;
					nextThoughtNeeded: boolean;
			  }[]
			| undefined;
		startId?: string | undefined;
		endId?: string | undefined;
		direction?: "incoming" | "outgoing" | "both" | undefined;
	},
	{
		operation:
			| "merge"
			| "analyze"
			| "paths"
			| "export"
			| "init"
			| "import"
			| "addNode"
			| "connect"
			| "neighbors";
		node?:
			| {
					content: string;
					nodeType:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument";
					strength: number;
					metadata?: Record<string, any> | undefined;
			  }
			| undefined;
		edge?:
			| {
					sourceId: string;
					targetId: string;
					edgeType:
						| "questions"
						| "supports"
						| "contradicts"
						| "refines"
						| "leads-to"
						| "depends-on"
						| "alternatives"
						| "elaborates";
					weight: number;
			  }
			| undefined;
		sessionId?: string | undefined;
		config?:
			| {
					maxNodes?: number | undefined;
					maxEdges?: number | undefined;
					allowCycles?: boolean | undefined;
					edgeWeightThreshold?: number | undefined;
					analysisAlgorithms?: ("centrality" | "clustering" | "paths" | "cycles")[] | undefined;
					defaultNodeType?:
						| "question"
						| "insight"
						| "hypothesis"
						| "conclusion"
						| "evidence"
						| "assumption"
						| "counterargument"
						| undefined;
					autoPruneWeakEdges?: boolean | undefined;
			  }
			| undefined;
		sequentialImport?:
			| {
					thought: string;
					thoughtNumber: number;
					totalThoughts: number;
					nextThoughtNeeded: boolean;
			  }[]
			| undefined;
		startId?: string | undefined;
		endId?: string | undefined;
		direction?: "incoming" | "outgoing" | "both" | undefined;
	}
>;
export type GoTArgs = z.infer<typeof GoTSchema>;
declare function handleGoT(
	args: GoTArgs,
	_session: SessionState,
): Promise<{
	content: {
		type: "text";
		text: string;
	}[];
}>;
export { handleGoT };
//# sourceMappingURL=graph-of-thought.d.ts.map
