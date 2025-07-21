import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const structuredArgumentation: Tool = {
  name: "structuredargumentation",
  description: "Construct and analyze structured arguments",
  inputSchema: {
    type: "object",
    properties: {
      claim: {
        type: "string",
        description: "The main claim or thesis"
      },
      premises: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Supporting premises"
      },
      conclusion: {
        type: "string",
        description: "The conclusion drawn"
      },
      argumentType: {
        type: "string",
        description: "Type of argument structure"
      },
      confidence: {
        type: "number",
        description: "Confidence in the argument (0-1)"
      },
      nextArgumentNeeded: {
        type: "boolean",
        description: "Whether another argument is needed"
      }
    },
    required: ["claim", "premises", "conclusion", "argumentType", "confidence", "nextArgumentNeeded"]
  }
};