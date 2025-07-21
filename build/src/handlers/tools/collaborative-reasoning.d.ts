import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface CollaborativeReasoningArgs {
    topic: string;
    personas: Array<{
        id: string;
        name: string;
        expertise: string[];
        background: string;
        perspective: string;
        biases: string[];
        communication: {
            style: "formal" | "casual" | "technical" | "creative";
            tone: "analytical" | "supportive" | "challenging" | "neutral";
        };
    }>;
    contributions: Array<{
        personaId: string;
        content: string;
        type: "observation" | "question" | "insight" | "concern" | "suggestion" | "challenge" | "synthesis";
        confidence: number;
        referenceIds?: string[];
    }>;
    stage: "problem-definition" | "ideation" | "critique" | "integration" | "decision" | "reflection";
    activePersonaId: string;
    sessionId: string;
    iteration: number;
    nextContributionNeeded: boolean;
}
export declare function handleCollaborativeReasoning(args: CollaborativeReasoningArgs): Promise<CallToolResult>;
//# sourceMappingURL=collaborative-reasoning.d.ts.map