export const visualReasoning = {
    name: "visualreasoning",
    description: "Process visual reasoning and diagram operations",
    inputSchema: {
        type: "object",
        properties: {
            operation: {
                type: "string",
                description: "Operation being performed"
            },
            diagramId: {
                type: "string",
                description: "Unique identifier for the diagram"
            },
            diagramType: {
                type: "string",
                description: "Type of diagram"
            },
            iteration: {
                type: "number",
                description: "Current iteration"
            },
            nextOperationNeeded: {
                type: "boolean",
                description: "Whether another operation is needed"
            }
        },
        required: ["operation", "diagramId", "diagramType", "iteration", "nextOperationNeeded"]
    }
};
//# sourceMappingURL=visual-reasoning.js.map