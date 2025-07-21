export const decisionFramework = {
    name: "decisionframework",
    description: "Apply structured decision-making frameworks",
    inputSchema: {
        type: "object",
        properties: {
            decisionStatement: {
                type: "string",
                description: "The decision to be made"
            },
            options: {
                type: "array",
                items: {
                    type: "object"
                },
                description: "Available options"
            },
            analysisType: {
                type: "string",
                description: "Type of analysis framework"
            },
            stage: {
                type: "string",
                description: "Current stage in the decision process"
            },
            decisionId: {
                type: "string",
                description: "Unique identifier for this decision"
            },
            iteration: {
                type: "number",
                description: "Current iteration"
            },
            nextStageNeeded: {
                type: "boolean",
                description: "Whether to proceed to the next stage"
            }
        },
        required: ["decisionStatement", "options", "analysisType", "stage", "decisionId", "iteration", "nextStageNeeded"]
    }
};
//# sourceMappingURL=decision-framework.js.map