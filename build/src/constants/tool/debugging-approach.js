export const debuggingApproach = {
    name: "debuggingapproach",
    description: "Apply systematic debugging approaches to identify and resolve issues",
    inputSchema: {
        type: "object",
        properties: {
            approachName: {
                type: "string",
                enum: ["binary_search", "reverse_engineering", "divide_conquer", "backtracking", "cause_elimination", "program_slicing"],
                description: "Debugging approach"
            },
            steps: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "Steps taken to debug"
            },
            resolution: {
                type: "string",
                description: "How the issue was resolved"
            }
        },
        required: ["approachName", "steps", "resolution"]
    }
};
//# sourceMappingURL=debugging-approach.js.map