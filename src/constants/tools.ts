import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { sequentialThinking } from "./tool/sequential-thinking.js";
import { mentalModel } from "./tool/mental-model.js";
import { debuggingApproach } from "./tool/debugging-approach.js";
import { collaborativeReasoning } from "./tool/collaborative-reasoning.js";
import { decisionFramework } from "./tool/decision-framework.js";
import { metacognitiveMonitoring } from "./tool/metacognitive-monitoring.js";
import { scientificMethod } from "./tool/scientific-method.js";
import { structuredArgumentation } from "./tool/structured-argumentation.js";
import { visualReasoning } from "./tool/visual-reasoning.js";
import { CREATIVE_THINKING_TOOL } from "./tool/creative-thinking.js";
import { SOCRATIC_METHOD_TOOL } from "./tool/socratic-method.js";
import { SYSTEMS_THINKING_TOOL } from "./tool/systems-thinking.js";
import { SESSION_INFO_TOOL, SESSION_EXPORT_TOOL, SESSION_IMPORT_TOOL } from "./tool/session-management.js";

export const TOOL_ERROR_MESSAGES = {
  UNKNOWN_TOOL: "Unknown tool:",
  TOOL_CALL_FAILED: "Tool call failed:",
} as const;

export const TOOLS: Tool[] = [
  sequentialThinking,
  mentalModel,
  debuggingApproach,
  collaborativeReasoning,
  decisionFramework,
  metacognitiveMonitoring,
  scientificMethod,
  structuredArgumentation,
  visualReasoning,
  CREATIVE_THINKING_TOOL,
  SOCRATIC_METHOD_TOOL,
  SYSTEMS_THINKING_TOOL,
  SESSION_INFO_TOOL,
  SESSION_EXPORT_TOOL,
  SESSION_IMPORT_TOOL,
];