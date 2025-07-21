import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const collaborativeReasoning: Tool = {
  name: "collaborativereasoning",
  description: "Facilitate collaborative reasoning with multiple perspectives and personas",
  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "Topic for collaborative reasoning"
      },
      personas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            expertise: { type: "array", items: { type: "string" } },
            background: { type: "string" },
            perspective: { type: "string" },
            biases: { type: "array", items: { type: "string" } },
            communication: {
              type: "object",
              properties: {
                style: { type: "string", enum: ["formal", "casual", "technical", "creative"] },
                tone: { type: "string", enum: ["analytical", "supportive", "challenging", "neutral"] }
              },
              required: ["style", "tone"]
            }
          },
          required: ["id", "name", "expertise", "background", "perspective", "biases", "communication"]
        }
      },
      contributions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            personaId: { type: "string" },
            content: { type: "string" },
            type: { type: "string", enum: ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"] },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            referenceIds: { type: "array", items: { type: "string" } }
          },
          required: ["personaId", "content", "type", "confidence"]
        }
      },
      stage: {
        type: "string",
        enum: ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"]
      },
      activePersonaId: { type: "string" },
      sessionId: { type: "string" },
      iteration: { type: "number" },
      nextContributionNeeded: { type: "boolean" }
    },
    required: ["topic", "personas", "contributions", "stage", "activePersonaId", "sessionId", "iteration", "nextContributionNeeded"]
  }
};