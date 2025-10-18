/**
 * Mental Model Operation - Structured Journal Pattern
 *
 * Provides structured scaffolding for applying mental models like
 * First Principles, Pareto Principle, Inversion, etc.
 *
 * This is a STRUCTURED JOURNAL - it validates, stores, and logs entries.
 * The tool description guides AI behavior. No computational reasoning here.
 */
import chalk from "chalk";
import { BaseOperation } from "../base.js";
export class MentalModelOperation extends BaseOperation {
	name = "mental_model";
	category = "core";
	// Journal storage
	entryHistory = [];
	branches = {};
	disableLogging = (process.env.DISABLE_MENTAL_MODEL_LOGGING || "").toLowerCase() === "true";
	/**
	 * Validate mental model data with strict type checking
	 */
	validateData(input) {
		const data = input;
		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a non-empty string describing the current step");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error("Invalid nextEntryNeeded: must be a boolean");
		}
		// Validate model name if provided
		const validModels = [
			"first_principles",
			"pareto_principle",
			"inversion",
			"circle_of_competence",
			"second_order_thinking",
			"occams_razor",
			"opportunity_cost",
			"error_propagation",
			"rubber_duck",
			"custom",
		];
		if (data.modelName && !validModels.includes(data.modelName)) {
			throw new Error(
				`Invalid modelName: must be one of ${validModels.join(", ")} (got: ${data.modelName})`,
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
			modelName: data.modelName,
			reasoning: data.reasoning,
		};
	}
	/**
	 * Format entry for terminal display
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
			modelName,
		} = data;
		let prefix = "";
		let context = "";
		if (isRevision) {
			prefix = chalk.yellow("🔄 Revision");
			context = ` (revising entry ${revisesEntry})`;
		} else if (branchFromEntry) {
			prefix = chalk.green("🌿 Branch");
			context = ` (from entry ${branchFromEntry}, ID: ${branchId})`;
		} else {
			prefix = chalk.blue("🎯 Mental Model");
			context = modelName ? ` [${modelName}]` : "";
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
		const { sessionState, parameters } = context;
		try {
			const validatedInput = this.validateData(parameters);
			// Auto-adjust totalEntries if current entry exceeds it
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
			// Store in session state (for persistence)
			const legacyFormat = {
				modelName: validatedInput.modelName || "custom",
				problem: validatedInput.entry,
				steps: this.entryHistory.map((e) => `${e.entryNumber}. ${e.entry}`),
				reasoning: validatedInput.reasoning || "",
				conclusion: validatedInput.nextEntryNeeded ? "" : validatedInput.entry,
			};
			sessionState.addMentalModel(legacyFormat);
			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}
			// Return minimal metadata
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				modelName: validatedInput.modelName,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
			});
		} catch (error) {
			return this.createError(error instanceof Error ? error.message : String(error));
		}
	}
	/**
	 * Tool description that guides AI behavior
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `A structured tool for applying mental models systematically through journal entries.

This tool provides scaffolding for applying established mental frameworks to break down complex problems. It enforces discipline through required parameters while allowing flexibility in approach.

**Supported Mental Models:**

1. **first_principles** - Break down to fundamental truths, rebuild understanding
2. **pareto_principle** - Identify the vital few (80/20 rule)
3. **inversion** - Think backwards, consider what to avoid
4. **circle_of_competence** - Know what you know, admit what you don't
5. **second_order_thinking** - Consider consequences of consequences
6. **occams_razor** - Prefer simpler explanations
7. **opportunity_cost** - Consider what you're giving up
8. **error_propagation** - Trace how errors compound
9. **rubber_duck** - Explain problem step-by-step
10. **custom** - Apply your own framework

**When to use this tool:**
- Breaking down complex problems using established frameworks
- Systematic analysis with mental model discipline
- Problems requiring structured thinking approach
- When you need to apply a specific reasoning framework
- Situations where cognitive biases might interfere

**Key features:**
- Adjust totalEntries as understanding evolves
- Mark revisions explicitly when reconsidering steps
- Branch to explore alternative paths
- Express uncertainty naturally within framework
- Track which mental model is being applied

**Parameters explained:**
- entry: Your current step in applying the mental model
- nextEntryNeeded: True if more steps needed to complete analysis
- entryNumber: Current position in the sequence
- totalEntries: Current estimate of steps needed (adjustable)
- modelName: Which mental model you're applying (optional)
- reasoning: Why this step matters in the framework (optional)
- isRevision: Boolean indicating reconsideration of previous step
- revisesEntry: Which entry number is being revised
- branchFromEntry: Entry number to branch from for alternatives
- branchId: Identifier for exploration branch

**You should:**
1. Choose appropriate mental model for the problem
2. Start with initial estimate of steps, adjust as needed
3. Apply model systematically, entry by entry
4. Mark revisions explicitly when reconsidering
5. Branch when exploring alternative interpretations
6. Express uncertainty when present
7. Only set nextEntryNeeded to false when analysis is complete`,
			inputSchema: {
				type: "object",
				properties: {
					entry: {
						type: "string",
						description: "Current step in mental model application",
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether another step is needed",
					},
					entryNumber: {
						type: "integer",
						description: "Current entry number",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total entries needed",
						minimum: 1,
					},
					modelName: {
						type: "string",
						description: "Mental model being applied",
						enum: [
							"first_principles",
							"pareto_principle",
							"inversion",
							"circle_of_competence",
							"second_order_thinking",
							"occams_razor",
							"opportunity_cost",
							"error_propagation",
							"rubber_duck",
							"custom",
						],
					},
					reasoning: {
						type: "string",
						description: "Why this step matters in the framework",
					},
					isRevision: {
						type: "boolean",
						description: "Whether this revises previous thinking",
					},
					revisesEntry: {
						type: "integer",
						description: "Which entry is being reconsidered",
						minimum: 1,
					},
					branchFromEntry: {
						type: "integer",
						description: "Entry number to branch from",
						minimum: 1,
					},
					branchId: {
						type: "string",
						description: "Branch identifier",
					},
				},
				required: ["entry", "nextEntryNeeded", "entryNumber", "totalEntries"],
			},
		};
	}
}
export default new MentalModelOperation();
