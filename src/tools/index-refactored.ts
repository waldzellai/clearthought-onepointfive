/**
 * Clear Thought Tools - Refactored Main Entry Point
 * 
 * This file orchestrates all Clear Thought operations using the modular architecture
 */

import { z } from "zod";
import type { SessionState } from "../state/SessionState.js";
import { operationRegistry, executeOperation, type OperationContext } from "./operations/index.js";
import { executePython } from "../utils/execution.js";
import { enhanceResponseWithNotebook } from "./notebookEnhancement.js";
import { EphemeralNotebookStore } from "../notebook/EphemeralNotebook.js";
import { getPresetForPattern } from "../notebook/presets.js";

// Initialize notebook store
const notebookStore = new EphemeralNotebookStore();

/**
 * Zod schema for Clear Thought tool parameters
 */
export const ClearThoughtParamsSchema = z.object({
  operation: z
    .enum([
      // Core thinking operations
      "sequential_thinking",
      "mental_model",
      "debugging_approach",
      "creative_thinking",
      "visual_reasoning",
      "metacognitive_monitoring",
      "scientific_method",
      // Collaborative operations
      "collaborative_reasoning",
      "decision_framework",
      "socratic_method",
      "structured_argumentation",
      // Systems and session operations
      "systems_thinking",
      "session_info",
      "session_export",
      "session_import",
      // Deep reasoning operations
      "pdr_reasoning",
      // New modules
      "research",
      "analogical_reasoning",
      "causal_analysis",
      "statistical_reasoning",
      "simulation",
      "optimization",
      "ethical_analysis",
      "visual_dashboard",
      "custom_framework",
      "code_execution",
      // Reasoning pattern operations
      "tree_of_thought",
      "beam_search",
      "mcts",
      "graph_of_thought",
      "orchestration_suggest",
      // Metagame operations
      "ooda_loop",
      "ulysses_protocol",
      // Notebook operations
      "notebook_create",
      "notebook_add_cell",
      "notebook_run_cell",
      "notebook_export",
    ])
    .describe("What type of reasoning operation to perform"),
  // Common parameters
  prompt: z.string().describe("The problem, question, or challenge to work on"),
  context: z
    .string()
    .optional()
    .describe("Additional context or background information"),
  sessionId: z
    .string()
    .optional()
    .describe("Session identifier for continuity"),
  // Operation-specific parameters
  parameters: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Operation-specific parameters"),
  // Advanced options
  advanced: z
    .object({
      autoProgress: z
        .boolean()
        .optional()
        .describe("Automatically progress through stages when applicable"),
      saveToSession: z
        .boolean()
        .default(true)
        .describe("Save results to session state"),
      generateNextSteps: z
        .boolean()
        .default(true)
        .describe("Generate recommended next steps"),
    })
    .optional()
    .describe("Advanced reasoning options"),
});

/**
 * Main handler for Clear Thought tool - now using modular operations
 */
export async function handleClearThoughtTool(
  sessionState: SessionState,
  args: z.infer<typeof ClearThoughtParamsSchema>,
): Promise<{
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}> {
  const startTime = Date.now();
  
  try {
    // Special handling for code execution
    if (args.operation === "code_execution") {
      return await handleCodeExecution(sessionState, args);
    }
    
    // Special handling for notebook run cell (async)
    if (args.operation === "notebook_run_cell") {
      return await handleNotebookRunCell(args);
    }
    
    // Auto-seed most operations with a brief sequential_thinking step
    const seedExclusions = new Set([
      "sequential_thinking",
      "code_execution",
      "session_info",
      "session_export",
      "session_import",
    ]);
    
    const shouldSeed = !seedExclusions.has(args.operation);
    
    // Create operation context
    const context: OperationContext = {
      sessionState,
      prompt: args.prompt,
      parameters: args.parameters || {},
    };
    
    // Execute the main operation using the registry
    const result = await executeOperation(args.operation, context);
    
    // Add initial thought if needed
    const enriched = shouldSeed
      ? {
          ...result,
          initialThought: await executeOperation("sequential_thinking", {
            sessionState,
            prompt: `Plan approach for: ${args.prompt}`,
            parameters: {
              thoughtNumber: 1,
              totalThoughts: 3,
              nextThoughtNeeded: true,
              needsMoreThoughts: true,
              pattern: "chain",
            },
          }),
        }
      : result;
    
    // Enhance response with notebook resources if applicable
    const baseResponse = {
      content: [{ type: "text" as const, text: JSON.stringify(enriched, null, 2) }],
    };
    
    const enhancedResponse = enhanceResponseWithNotebook(
      baseResponse,
      args.operation,
      args.prompt,
    );
    
    return enhancedResponse;
    
  } catch (error: any) {
    const errorResponse = {
      toolOperation: args.operation,
      error: error.message,
      success: false,
    };
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(errorResponse, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle code execution operation
 */
async function handleCodeExecution(
  sessionState: SessionState,
  args: z.infer<typeof ClearThoughtParamsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const params = (args.parameters || {}) as any;
  const lang = (params.language as string) || "python";
  const code = String(params.code || "");
  const cfg = sessionState.getConfig();
  
  if (lang !== "python" || !cfg.allowCodeExecution) {
    const preview = await executeOperation("code_execution", {
      sessionState,
      prompt: args.prompt,
      parameters: args.parameters || {},
    });
    
    return {
      content: [{ type: "text" as const, text: JSON.stringify(preview, null, 2) }],
    };
  }
  
  const result = await executePython(
    code,
    cfg.pythonCommand,
    cfg.executionTimeoutMs,
  );
  
  const executionResult: any = { toolOperation: "code_execution", ...result };
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(executionResult, null, 2),
      },
    ],
  };
}

/**
 * Handle notebook run cell operation
 */
async function handleNotebookRunCell(
  args: z.infer<typeof ClearThoughtParamsSchema>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const params = (args.parameters || {}) as any;
  
  try {
    const execution = await notebookStore.executeCell(
      params.notebookId || "",
      params.cellId || "",
      params.timeoutMs || 5000,
    );
    
    const notebookResult: any = {
      toolOperation: "notebook_run_cell",
      notebookId: params.notebookId,
      cellId: params.cellId,
      execution: {
        id: execution.id,
        status: execution.status,
        outputs: execution.outputs,
        error: execution.error,
        duration: execution.completedAt
          ? execution.completedAt - execution.startedAt
          : undefined,
      },
    };
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(notebookResult, null, 2),
        },
      ],
    };
  } catch (error: any) {
    const errorResult: any = {
      toolOperation: "notebook_run_cell",
      notebookId: params.notebookId,
      cellId: params.cellId,
      error: error.message,
      success: false,
    };
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(errorResult, null, 2),
        },
      ],
    };
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function executeClearThoughtOperation(
  sessionState: SessionState,
  operation: string,
  args: { prompt: string; parameters?: Record<string, unknown> },
): Promise<Record<string, unknown>> {
  const context: OperationContext = {
    sessionState,
    prompt: args.prompt,
    parameters: args.parameters || {},
  };
  
  return await executeOperation(operation, context);
}

/**
 * Register tools with the server (backward compatibility)
 */
export function registerTools(
  server: { tool: Function },
  sessionState: SessionState,
): void {
  server.tool(
    "clear_thought",
    "Unified Clear Thought reasoning tool - provides all reasoning operations through a single interface",
    ClearThoughtParamsSchema.shape,
    async (args: z.infer<typeof ClearThoughtParamsSchema>) =>
      handleClearThoughtTool(sessionState, args),
  );
}

// Re-export for convenience
export { operationRegistry } from "./operations/index.js";