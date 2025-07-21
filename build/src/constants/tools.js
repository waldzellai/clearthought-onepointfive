import { sequentialThinking } from "./tool/sequential-thinking.js";
import { mentalModel } from "./tool/mental-model.js";
import { debuggingApproach } from "./tool/debugging-approach.js";
import { collaborativeReasoning } from "./tool/collaborative-reasoning.js";
import { decisionFramework } from "./tool/decision-framework.js";
import { metacognitiveMonitoring } from "./tool/metacognitive-monitoring.js";
import { scientificMethod } from "./tool/scientific-method.js";
import { structuredArgumentation } from "./tool/structured-argumentation.js";
import { visualReasoning } from "./tool/visual-reasoning.js";
export const TOOL_ERROR_MESSAGES = {
    UNKNOWN_TOOL: "Unknown tool:",
    TOOL_CALL_FAILED: "Tool call failed:",
};
export const TOOLS = [
    sequentialThinking,
    mentalModel,
    debuggingApproach,
    collaborativeReasoning,
    decisionFramework,
    metacognitiveMonitoring,
    scientificMethod,
    structuredArgumentation,
    visualReasoning,
];
//# sourceMappingURL=tools.js.map