/**
 * Optimization Operation - Structured Journal Pattern
 *
 * A structured tool for tracking optimization attempts through journal entries.
 * The AI provides optimization iterations with parameters, objective values, and reasoning.
 * The server tracks the optimization history without performing the optimization algorithms.
 *
 * This follows the structured journal pattern where the AI is responsible for the
 * computational reasoning, and the server provides structure and persistence.
 */
import { BaseOperation } from "../base.js";
export class OptimizationOperation extends BaseOperation {
	name = "optimization";
	category = "analysis";
	optimizationHistory = [];
	bestIteration = null;
	disableLogging = false;
	constructor() {
		super();
		// Check environment variable for logging control
		this.disableLogging = (process.env.DISABLE_OPTIMIZATION_LOGGING || "").toLowerCase() === "true";
	}
	/**
	 * Validate input data with strict type checking
	 */
	validateData(input) {
		const data = input;
		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing the optimization attempt");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current iteration");
		}
		if (!data.iteration || typeof data.iteration !== "object") {
			throw new Error("Invalid iteration: must be an object containing optimization data");
		}
		const iteration = data.iteration;
		if (!iteration.parameters || typeof iteration.parameters !== "object") {
			throw new Error("Invalid iteration.parameters: must be an object with parameter values");
		}
		if (typeof iteration.objectiveValue !== "number") {
			throw new Error("Invalid iteration.objectiveValue: must be a number");
		}
		if (typeof iteration.improvement !== "number") {
			throw new Error("Invalid iteration.improvement: must be a number");
		}
		if (!iteration.reasoning || typeof iteration.reasoning !== "string") {
			throw new Error("Invalid iteration.reasoning: must be a string explaining the iteration");
		}
		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			iteration: {
				parameters: iteration.parameters,
				objectiveValue: iteration.objectiveValue,
				improvement: iteration.improvement,
				reasoning: iteration.reasoning,
				constraintsSatisfied: iteration.constraintsSatisfied,
				gradientInfo: iteration.gradientInfo,
				metadata: iteration.metadata,
			},
			nextEntryNeeded: data.nextEntryNeeded,
			totalEntries: data.totalEntries,
		};
	}
	/**
	 * Format optimization entry for terminal logging
	 */
	formatEntry(data) {
		const { entryNumber, entry, iteration } = data;
		const paramStr = Object.entries(iteration.parameters)
			.map(([key, value]) => `${key}: ${value.toFixed(4)}`)
			.join(", ");
		const improvementStr =
			iteration.improvement >= 0
				? `+${iteration.improvement.toFixed(6)}`
				: iteration.improvement.toFixed(6);
		const gradientStr = iteration.gradientInfo
			? "\n│ Gradient: " +
				Object.entries(iteration.gradientInfo)
					.map(([key, value]) => `${key}: ${value.toFixed(4)}`)
					.join(", ")
			: "";
		const constraintsStr =
			iteration.constraintsSatisfied !== undefined
				? `\n│ Constraints: ${iteration.constraintsSatisfied ? "✓ Satisfied" : "✗ Violated"}`
				: "";
		const border = "─".repeat(80);
		return `
┌${border}┐
│ 🎯 Optimization Iteration ${entryNumber} │
├${border}┤
│ ${entry.padEnd(78)} │
├${border}┤
│ Parameters: ${paramStr.padEnd(66)} │
│ Objective:  ${iteration.objectiveValue.toFixed(6).padEnd(66)} │
│ Improvement: ${improvementStr.padEnd(65)} │${gradientStr}${constraintsStr}
├${border}┤
│ Reasoning: ${iteration.reasoning.padEnd(67)} │
└${border}┘`;
	}
	/**
	 * Update best iteration tracking
	 */
	updateBestIteration(iteration, objective) {
		if (!this.bestIteration) {
			this.bestIteration = iteration;
			return;
		}
		const isBetter =
			objective === "maximize"
				? iteration.objectiveValue > this.bestIteration.objectiveValue
				: iteration.objectiveValue < this.bestIteration.objectiveValue;
		if (isBetter) {
			this.bestIteration = iteration;
		}
	}
	/**
	 * Generate optimization summary
	 */
	generateSummary(objective) {
		if (this.optimizationHistory.length === 0) {
			return {
				status: "no_data",
				message: "No optimization iterations recorded",
			};
		}
		const totalIterations = this.optimizationHistory.length;
		const totalImprovement = this.optimizationHistory.reduce(
			(sum, entry) => sum + entry.iteration.improvement,
			0,
		);
		const convergenceRate = totalIterations > 1 ? totalImprovement / totalIterations : 0;
		const constraintsSatisfied = this.optimizationHistory.every(
			(entry) => entry.iteration.constraintsSatisfied !== false,
		);
		return {
			totalIterations,
			totalImprovement,
			convergenceRate,
			constraintsSatisfied,
			bestIteration: this.bestIteration,
			optimizationPath: this.optimizationHistory.map((entry) => ({
				iteration: entry.entryNumber,
				objectiveValue: entry.iteration.objectiveValue,
				improvement: entry.iteration.improvement,
			})),
		};
	}
	async execute(context) {
		const { parameters } = context;
		try {
			// Extract objective type (default to minimize)
			const objective = parameters.objective || "minimize";
			// Validate input data
			const validatedInput = this.validateData({
				entry: parameters.entry,
				entryNumber: parameters.entryNumber,
				iteration: parameters.iteration,
				nextEntryNeeded: parameters.nextEntryNeeded,
				totalEntries: parameters.totalEntries,
			});
			// Store in history
			this.optimizationHistory.push(validatedInput);
			// Update best iteration
			this.updateBestIteration(validatedInput.iteration, objective);
			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}
			// Generate summary if this is the last entry
			const summary = !validatedInput.nextEntryNeeded ? this.generateSummary(objective) : null;
			// Return minimal metadata - NEVER echo the prompt
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				objectiveValue: validatedInput.iteration.objectiveValue,
				improvement: validatedInput.iteration.improvement,
				isBestSoFar: this.bestIteration === validatedInput.iteration,
				historyLength: this.optimizationHistory.length,
				...(summary && { summary }),
			});
		} catch (error) {
			return this.createResult({
				error: error instanceof Error ? error.message : String(error),
				status: "failed",
			});
		}
	}
	/**
	 * Tool description that guides AI behavior
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `A structured tool for tracking optimization attempts through journal entries.
This tool provides a framework for the AI to perform optimization by documenting each iteration
with parameters, objective values, improvements, and reasoning.

The AI is responsible for:
- Choosing optimization algorithms (gradient descent, genetic algorithms, simulated annealing, etc.)
- Calculating objective function values
- Computing gradients and improvements
- Determining parameter updates
- Evaluating constraint satisfaction
- Deciding when to stop optimization

The server is responsible for:
- Tracking optimization history
- Maintaining best iteration
- Providing structured feedback
- Generating summaries

When to use this tool:
- Finding optimal parameter values for a function
- Minimizing or maximizing objective functions
- Solving constrained optimization problems
- Hyperparameter tuning
- Resource allocation problems
- Any problem requiring iterative improvement

Input format:
- entry: Description of what you're doing in this iteration (e.g., "Testing gradient descent with learning rate 0.01")
- entryNumber: Current iteration number (1, 2, 3, ...)
- iteration: Object containing:
  - parameters: Object with parameter names and values (e.g., {x: 1.5, y: 2.0, learning_rate: 0.01})
  - objectiveValue: Computed objective function value
  - improvement: Change from previous iteration (positive for improvement)
  - reasoning: Explanation of why these parameters were chosen
  - constraintsSatisfied: (optional) Whether constraints are met
  - gradientInfo: (optional) Gradient values for each parameter
  - metadata: (optional) Any algorithm-specific information
- nextEntryNeeded: (optional) Set to false when optimization is complete
- totalEntries: (optional) Estimated total iterations needed

The AI should:
1. Choose an appropriate optimization algorithm based on the problem
2. Initialize parameters reasonably
3. Compute objective function values accurately
4. Calculate improvements correctly (current - previous)
5. Provide clear reasoning for each iteration
6. Check constraint satisfaction when applicable
7. Decide when convergence is achieved
8. Set nextEntryNeeded to false when done

Example usage:
{
  "entry": "Initial gradient descent iteration with random initialization",
  "entryNumber": 1,
  "iteration": {
    "parameters": {"x": 1.5, "y": 2.0},
    "objectiveValue": 4.25,
    "improvement": 0,
    "reasoning": "Random initialization within bounds",
    "constraintsSatisfied": true,
    "gradientInfo": {"x": -3.0, "y": -4.0}
  },
  "nextEntryNeeded": true,
  "totalEntries": 10
}`,
			inputSchema: {
				type: "object",
				properties: {
					entry: {
						type: "string",
						description: "Description of this optimization iteration",
					},
					entryNumber: {
						type: "integer",
						description: "Current iteration number",
						minimum: 1,
					},
					iteration: {
						type: "object",
						description: "Optimization iteration data",
						properties: {
							parameters: {
								type: "object",
								description: "Parameter values for this iteration",
								additionalProperties: { type: "number" },
							},
							objectiveValue: {
								type: "number",
								description: "Objective function value",
							},
							improvement: {
								type: "number",
								description: "Improvement from previous iteration",
							},
							reasoning: {
								type: "string",
								description: "Explanation of this iteration",
							},
							constraintsSatisfied: {
								type: "boolean",
								description: "Whether constraints are satisfied",
							},
							gradientInfo: {
								type: "object",
								description: "Gradient information",
								additionalProperties: { type: "number" },
							},
							metadata: {
								type: "object",
								description: "Additional algorithm-specific data",
							},
						},
						required: ["parameters", "objectiveValue", "improvement", "reasoning"],
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether more iterations are needed",
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total iterations",
						minimum: 1,
					},
					objective: {
						type: "string",
						description: "Optimization objective: 'maximize' or 'minimize'",
						enum: ["maximize", "minimize"],
					},
				},
				required: ["entry", "entryNumber", "iteration"],
			},
		};
	}
}
// Export singleton instance
export default new OptimizationOperation();
