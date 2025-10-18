/**
 * Sequential Thinking Operation - Structured Journal Pattern
 *
 * A structured tool for dynamic and reflective problem-solving through thoughts.
 * This tool provides scaffolding for methodical thinking, enforcing discipline
 * through required parameters while allowing flexibility in approach.
 *
 * Based on the reference implementation from docs/sequential-thinking-mcp-index.ts
 */
import { BaseOperation } from "../base.js";
export class SequentialThinkingOperation extends BaseOperation {
	name = "sequential_thinking";
	category = "core";
	entryHistory = [];
	branches = {};
	disableLogging = false;
	constructor() {
		super();
		// Check environment variable for logging control
		this.disableLogging = (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
	}
	/**
	 * Validate input data with strict type checking and descriptive errors
	 */
	validateData(input) {
		const data = input;
		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string representing the thought");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current position");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number estimating total thoughts needed");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error(
				"Invalid nextEntryNeeded: must be a boolean indicating if more thoughts are needed",
			);
		}
		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			totalEntries: data.totalEntries,
			nextEntryNeeded: data.nextEntryNeeded,
			isRevision: data.isRevision,
			revisesEntry: data.revisesEntry,
			branchFromEntry: data.branchFromEntry,
			branchId: data.branchId,
		};
	}
	/**
	 * Format entry for terminal logging with visual indicators
	 */
	formatEntry(data) {
		const {
			entryNumber,
			totalEntries,
			entry,
			isRevision,
			revisesEntry,
			branchFromEntry,
			branchId,
		} = data;
		let prefix = "";
		let context = "";
		if (isRevision) {
			prefix = "🔄 Revision";
			context = ` (revising thought ${revisesEntry})`;
		} else if (branchFromEntry) {
			prefix = "🌿 Branch";
			context = ` (from thought ${branchFromEntry}, ID: ${branchId})`;
		} else {
			prefix = "💭 Thought";
			context = "";
		}
		const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
		const border = "─".repeat(Math.max(header.length, entry.length) + 4);
		return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │
└${border}┘`;
	}
	async execute(context) {
		const { parameters } = context;
		try {
			// Validate input data
			const validatedInput = this.validateData({
				entry: parameters.thought || parameters.entry,
				entryNumber: parameters.thoughtNumber || parameters.entryNumber,
				totalEntries: parameters.totalThoughts || parameters.totalEntries,
				nextEntryNeeded: parameters.nextThoughtNeeded || parameters.nextEntryNeeded,
				isRevision: parameters.isRevision,
				revisesEntry: parameters.revisesThought || parameters.revisesEntry,
				branchFromEntry: parameters.branchFromThought || parameters.branchFromEntry,
				branchId: parameters.branchId,
			});
			// Auto-adjust totalEntries if current entry exceeds estimate
			if (validatedInput.entryNumber > validatedInput.totalEntries) {
				validatedInput.totalEntries = validatedInput.entryNumber;
			}
			// Store in history
			this.entryHistory.push(validatedInput);
			// Track branches
			if (validatedInput.branchFromEntry && validatedInput.branchId) {
				if (!this.branches[validatedInput.branchId]) {
					this.branches[validatedInput.branchId] = [];
				}
				this.branches[validatedInput.branchId].push(validatedInput);
			}
			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}
			// Return minimal metadata - NEVER echo the prompt
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
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
			description: `A detailed tool for dynamic and reflective problem-solving through thoughts.
This tool helps analyze problems through a flexible thinking process that can adapt and evolve.
Each thought can build on, question, or revise previous insights as understanding deepens.

This tool provides scaffolding for methodical thinking, enforcing discipline through required
parameters while allowing flexibility in approach. It does NOT perform computational reasoning -
it provides structure for the AI to think step-by-step through complex problems.

When to use this tool:
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

Key features:
- You can adjust totalEntries up or down as you progress
- You can question or revise previous thoughts
- You can add more thoughts even after reaching what seemed like the end
- You can express uncertainty and explore alternative approaches
- Not every thought needs to build linearly - you can branch or backtrack
- Generate and verify solution hypotheses
- Repeat the process until satisfied with the solution

Parameters explained:
- entry (or thought): Your current thinking step, which can include regular analytical steps,
  revisions of previous thoughts, questions about previous decisions, realizations about needing
  more analysis, changes in approach, hypothesis generation, or hypothesis verification
- nextEntryNeeded (or nextThoughtNeeded): True if you need more thinking, even if at what seemed like the end
- entryNumber (or thoughtNumber): Current number in sequence (can go beyond initial total if needed)
- totalEntries (or totalThoughts): Current estimate of thoughts needed (can be adjusted up/down)
- isRevision: A boolean indicating if this thought revises previous thinking
- revisesEntry (or revisesThought): If isRevision is true, which thought number is being reconsidered
- branchFromEntry (or branchFromThought): If branching, which thought number is the branching point
- branchId: Identifier for the current branch (if any)

You should:
1. Start with an initial estimate of needed thoughts, but be ready to adjust
2. Feel free to question or revise previous thoughts
3. Don't hesitate to add more thoughts if needed, even at the "end"
4. Express uncertainty when present
5. Mark thoughts that revise previous thinking or branch into new paths
6. Ignore information that is irrelevant to the current step
7. Generate a solution hypothesis when appropriate
8. Verify the hypothesis based on the Chain of Thought steps
9. Repeat the process until satisfied with the solution
10. Provide a single, ideally correct answer as the final output
11. Only set nextEntryNeeded to false when truly done and a satisfactory answer is reached`,
			inputSchema: {
				type: "object",
				properties: {
					entry: {
						type: "string",
						description: "Your current thinking step (can also use 'thought')",
					},
					thought: {
						type: "string",
						description: "Alias for 'entry' - your current thinking step",
					},
					nextEntryNeeded: {
						type: "boolean",
						description:
							"Whether another thought step is needed (can also use 'nextThoughtNeeded')",
					},
					nextThoughtNeeded: {
						type: "boolean",
						description: "Alias for 'nextEntryNeeded' - whether another thought is needed",
					},
					entryNumber: {
						type: "integer",
						description: "Current thought number (can also use 'thoughtNumber')",
						minimum: 1,
					},
					thoughtNumber: {
						type: "integer",
						description: "Alias for 'entryNumber' - current thought number",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total thoughts needed (can also use 'totalThoughts')",
						minimum: 1,
					},
					totalThoughts: {
						type: "integer",
						description: "Alias for 'totalEntries' - estimated total thoughts needed",
						minimum: 1,
					},
					isRevision: {
						type: "boolean",
						description: "Whether this revises previous thinking",
					},
					revisesEntry: {
						type: "integer",
						description: "Which thought is being reconsidered (can also use 'revisesThought')",
						minimum: 1,
					},
					revisesThought: {
						type: "integer",
						description: "Alias for 'revisesEntry' - which thought is being reconsidered",
						minimum: 1,
					},
					branchFromEntry: {
						type: "integer",
						description: "Branching point thought number (can also use 'branchFromThought')",
						minimum: 1,
					},
					branchFromThought: {
						type: "integer",
						description: "Alias for 'branchFromEntry' - branching point thought number",
						minimum: 1,
					},
					branchId: {
						type: "string",
						description: "Branch identifier",
					},
				},
				required: ["nextEntryNeeded", "entryNumber", "totalEntries"],
			},
		};
	}
}
// Export singleton instance
export default new SequentialThinkingOperation();
