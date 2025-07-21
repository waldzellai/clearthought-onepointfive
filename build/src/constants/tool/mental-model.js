export const mentalModel = {
    name: "mentalmodel",
    description: "Apply mental models to analyze problems systematically",
    inputSchema: {
        type: "object",
        properties: {
            modelName: {
                type: "string",
                enum: ["first_principles", "opportunity_cost", "error_propagation", "rubber_duck", "pareto_principle", "occams_razor"],
                description: "Name of the mental model"
            },
            steps: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "Steps to apply the model"
            },
            conclusion: {
                type: "string",
                description: "Conclusions drawn"
            }
        },
        required: ["modelName", "steps", "conclusion"]
    }
};
//# sourceMappingURL=mental-model.js.map