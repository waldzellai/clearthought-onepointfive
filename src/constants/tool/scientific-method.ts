import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const scientificMethod: Tool = {
  name: "scientificmethod",
  description: "Apply scientific method for systematic inquiry",
  inputSchema: {
    type: "object",
    properties: {
      stage: {
        type: "string",
        description: "Current stage of scientific method"
      },
      inquiryId: {
        type: "string",
        description: "Unique identifier for this inquiry"
      },
      iteration: {
        type: "number",
        description: "Current iteration"
      },
      nextStageNeeded: {
        type: "boolean",
        description: "Whether to proceed to next stage"
      }
    },
    required: ["stage", "inquiryId", "iteration", "nextStageNeeded"]
  }
};