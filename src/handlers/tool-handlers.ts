import {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, TOOL_ERROR_MESSAGES } from "../constants/tools.js";
import { validateWithErrors } from "../utils/validation.js";
import { JSONSchema7 } from "json-schema";
import {
  handleSequentialThinking,
  handleMentalModel,
  handleDebuggingApproach,
  handleCollaborativeReasoning,
  handleDecisionFramework,
  handleMetacognitiveMonitoring,
  handleScientificMethod,
  handleStructuredArgumentation,
  handleVisualReasoning,
  SequentialThinkingArgs,
  MentalModelArgs,
  DebuggingApproachArgs,
  CollaborativeReasoningArgs,
  DecisionFrameworkArgs,
  MetacognitiveMonitoringArgs,
  ScientificMethodArgs,
  StructuredArgumentationArgs,
  VisualReasoningArgs,
} from "./tools/index.js";

type ToolArgs = {
  sequentialthinking: SequentialThinkingArgs;
  mentalmodel: MentalModelArgs;
  debuggingapproach: DebuggingApproachArgs;
  collaborativereasoning: CollaborativeReasoningArgs;
  decisionframework: DecisionFrameworkArgs;
  metacognitivemonitoring: MetacognitiveMonitoringArgs;
  scientificmethod: ScientificMethodArgs;
  structuredargumentation: StructuredArgumentationArgs;
  visualreasoning: VisualReasoningArgs;
};

export async function handleListTools(request: ListToolsRequest): Promise<ListToolsResult> {
  try {
    const tools = [...TOOLS].sort((a, b) => a.name.localeCompare(b.name));
    return { tools };
  } catch (error) {
    return { tools: TOOLS };
  }
}

export async function handleToolCall(
  request: CallToolRequest,
): Promise<CallToolResult> {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    const tool = TOOLS.find((t) => t.name === request.params.name);
    if (!tool) {
      throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }

    validateWithErrors(request.params.arguments, tool.inputSchema as JSONSchema7);
    const args = request.params.arguments as unknown as ToolArgs[keyof ToolArgs];

    switch (request.params.name) {
      case "sequentialthinking":
        return await handleSequentialThinking(args as SequentialThinkingArgs);
      case "mentalmodel":
        return await handleMentalModel(args as MentalModelArgs);
      case "debuggingapproach":
        return await handleDebuggingApproach(args as DebuggingApproachArgs);
      case "collaborativereasoning":
        return await handleCollaborativeReasoning(args as CollaborativeReasoningArgs);
      case "decisionframework":
        return await handleDecisionFramework(args as DecisionFrameworkArgs);
      case "metacognitivemonitoring":
        return await handleMetacognitiveMonitoring(args as MetacognitiveMonitoringArgs);
      case "scientificmethod":
        return await handleScientificMethod(args as ScientificMethodArgs);
      case "structuredargumentation":
        return await handleStructuredArgumentation(args as StructuredArgumentationArgs);
      case "visualreasoning":
        return await handleVisualReasoning(args as VisualReasoningArgs);
      default:
        throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }
  } catch (error) {
    throw error;
  }
}