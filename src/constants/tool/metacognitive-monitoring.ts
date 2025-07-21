import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const metacognitiveMonitoring: Tool = {
  name: "metacognitivemonitoring",
  description: "Monitor and assess thinking processes and knowledge",
  inputSchema: {
    type: "object",
    properties: {
      task: {
        type: "string",
        description: "Task being monitored"
      },
      stage: {
        type: "string",
        description: "Current stage of metacognitive monitoring"
      },
      overallConfidence: {
        type: "number",
        description: "Overall confidence level (0-1)"
      },
      uncertaintyAreas: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Areas of uncertainty"
      },
      recommendedApproach: {
        type: "string",
        description: "Recommended approach based on assessment"
      },
      monitoringId: {
        type: "string",
        description: "Unique identifier for this monitoring session"
      },
      iteration: {
        type: "number",
        description: "Current iteration"
      },
      nextAssessmentNeeded: {
        type: "boolean",
        description: "Whether another assessment is needed"
      }
    },
    required: ["task", "stage", "overallConfidence", "uncertaintyAreas", "recommendedApproach", "monitoringId", "iteration", "nextAssessmentNeeded"]
  }
};