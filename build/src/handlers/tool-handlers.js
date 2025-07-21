import { TOOLS, TOOL_ERROR_MESSAGES } from "../constants/tools.js";
import { validateWithErrors } from "../utils/validation.js";
import { handleSequentialThinking, handleMentalModel, handleDebuggingApproach, handleCollaborativeReasoning, handleDecisionFramework, handleMetacognitiveMonitoring, handleScientificMethod, handleStructuredArgumentation, handleVisualReasoning, } from "./tools/index.js";
export async function handleListTools(request) {
    try {
        const tools = [...TOOLS].sort((a, b) => a.name.localeCompare(b.name));
        return { tools };
    }
    catch (error) {
        return { tools: TOOLS };
    }
}
export async function handleToolCall(request) {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }
        const tool = TOOLS.find((t) => t.name === request.params.name);
        if (!tool) {
            throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
        }
        validateWithErrors(request.params.arguments, tool.inputSchema);
        const args = request.params.arguments;
        switch (request.params.name) {
            case "sequentialthinking":
                return await handleSequentialThinking(args);
            case "mentalmodel":
                return await handleMentalModel(args);
            case "debuggingapproach":
                return await handleDebuggingApproach(args);
            case "collaborativereasoning":
                return await handleCollaborativeReasoning(args);
            case "decisionframework":
                return await handleDecisionFramework(args);
            case "metacognitivemonitoring":
                return await handleMetacognitiveMonitoring(args);
            case "scientificmethod":
                return await handleScientificMethod(args);
            case "structuredargumentation":
                return await handleStructuredArgumentation(args);
            case "visualreasoning":
                return await handleVisualReasoning(args);
            default:
                throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
        }
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=tool-handlers.js.map