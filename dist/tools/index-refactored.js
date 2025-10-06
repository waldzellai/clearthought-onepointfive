/**
 * Clear Thought Tools - Refactored Main Entry Point
 *
 * This file orchestrates all Clear Thought operations using the modular architecture
 */
import { z } from "zod";
import { EphemeralNotebookStore } from "../notebook/EphemeralNotebook.js";
import { executePython } from "../utils/execution.js";
import { executeOperation } from "./operations/index.js";
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
    // Operation-specific parameters - AI submits structured data here
    parameters: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("Operation-specific structured data (see tool description for each operation)"),
});
/**
 * Main handler for Clear Thought tool - now using modular operations
 */
export async function handleClearThoughtTool(sessionState, args) {
    try {
        // Special handling for code execution
        if (args.operation === "code_execution") {
            return await handleCodeExecution(sessionState, args);
        }
        // Special handling for notebook run cell (async)
        if (args.operation === "notebook_run_cell") {
            return await handleNotebookRunCell(args);
        }
        // Create operation context
        const context = {
            sessionState,
            parameters: args.parameters || {},
        };
        // Execute the operation using the registry
        const result = await executeOperation(args.operation, context);
        // Return metadata only - content was already logged to stderr by the operation
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    }
    catch (error) {
        const errorResponse = {
            toolOperation: args.operation,
            error: error.message,
            success: false,
        };
        return {
            content: [
                {
                    type: "text",
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
async function handleCodeExecution(sessionState, args) {
    const params = (args.parameters || {});
    const lang = params.language || "python";
    const code = String(params.code || "");
    const cfg = sessionState.getConfig();
    if (lang !== "python" || !cfg.allowCodeExecution) {
        const preview = await executeOperation("code_execution", {
            sessionState,
            parameters: args.parameters || {},
        });
        return {
            content: [{ type: "text", text: JSON.stringify(preview, null, 2) }],
        };
    }
    const result = await executePython(code, cfg.pythonCommand, cfg.executionTimeoutMs);
    const executionResult = { toolOperation: "code_execution", ...result };
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
async function handleNotebookRunCell(args) {
    const params = (args.parameters || {});
    try {
        const execution = await notebookStore.executeCell(params.notebookId || "", params.cellId || "", params.timeoutMs || 5000);
        const notebookResult = {
            toolOperation: "notebook_run_cell",
            notebookId: params.notebookId,
            cellId: params.cellId,
            execution: {
                id: execution.id,
                status: execution.status,
                outputs: execution.outputs,
                error: execution.error,
                duration: execution.completedAt ? execution.completedAt - execution.startedAt : undefined,
            },
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(notebookResult, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorResult = {
            toolOperation: "notebook_run_cell",
            notebookId: params.notebookId,
            cellId: params.cellId,
            error: error.message,
            success: false,
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(errorResult, null, 2),
                },
            ],
        };
    }
}
// Re-export for convenience
export { operationRegistry } from "./operations/index.js";
