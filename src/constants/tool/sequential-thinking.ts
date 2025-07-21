import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const sequentialThinking: Tool = {
  name: "sequentialthinking",
  description: "Process sequential thoughts with branching, revision, and memory management capabilities",
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "The thought content"
      },
      thoughtNumber: {
        type: "number",
        description: "Current thought number in sequence"
      },
      totalThoughts: {
        type: "number",
        description: "Total expected thoughts in sequence"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether the next thought is needed"
      },
      isRevision: {
        type: "boolean",
        description: "Whether this is a revision of a previous thought"
      },
      revisesThought: {
        type: "number",
        description: "Which thought number this revises"
      },
      branchFromThought: {
        type: "number",
        description: "Which thought this branches from"
      },
      branchId: {
        type: "string",
        description: "Unique identifier for this branch"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "Whether more thoughts are needed"
      }
    },
    required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
  }
};