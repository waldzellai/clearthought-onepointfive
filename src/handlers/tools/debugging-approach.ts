import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface DebuggingApproachArgs {
  approachName: "binary_search" | "reverse_engineering" | "divide_conquer" | "backtracking" | "cause_elimination" | "program_slicing";
  steps: string[];
  resolution: string;
}

export async function handleDebuggingApproach(
  args: DebuggingApproachArgs
): Promise<CallToolResult> {
  const { approachName, steps, resolution } = args;

  // Apply the debugging approach
  const result = {
    approachName,
    status: "success",
    hasSteps: steps.length > 0,
    hasResolution: !!resolution,
    stepsCount: steps.length,
    debuggingApplied: true,
    timestamp: new Date().toISOString()
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}