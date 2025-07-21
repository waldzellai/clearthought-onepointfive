import {
  ListResourcesRequest,
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  return {
    resources: [
      {
        uri: "clearthought://memory",
        name: "Thinking Memory",
        description: "Access stored thoughts, mental models, and reasoning patterns",
        mimeType: "application/json"
      }
    ]
  };
}

export async function handleResourceCall(
  request: ReadResourceRequest
): Promise<ReadResourceResult> {
  if (request.params.uri === "clearthought://memory") {
    return {
      contents: [
        {
          uri: "clearthought://memory",
          mimeType: "application/json",
          text: JSON.stringify({
            thoughts: [],
            models: [],
            decisions: [],
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }
  
  throw new Error(`Unknown resource: ${request.params.uri}`);
}