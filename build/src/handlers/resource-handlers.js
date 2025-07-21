export async function handleListResources(request) {
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
export async function handleResourceCall(request) {
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
//# sourceMappingURL=resource-handlers.js.map