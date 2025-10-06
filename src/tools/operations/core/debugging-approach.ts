/**
 * Debugging Approach Operation - Structured Journal Pattern
 *
 * Systematic debugging through methodical investigation using structured entries.
 * Supports multiple debugging methodologies: Binary Search, Root Cause Analysis,
 * Rubber Duck Debugging, Five Whys, etc.
 */

import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";
import chalk from "chalk";

/**
 * Structured data interface for debugging entries
 */
interface DebuggingData {
	entry: string; // Current debugging step/observation
	entryNumber: number; // Current entry position
	totalEntries: number; // Estimated total entries needed
	nextEntryNeeded: boolean; // Whether more investigation needed
	isRevision?: boolean; // If this revises previous finding
	revisesEntry?: number; // Which entry is being reconsidered
	branchFromEntry?: number; // Branching point for alternative investigation
	branchId?: string; // Identifier for investigation branch
	approach?: string; // Debugging methodology being used
	findings?: string; // Key findings or observations
}

export class DebuggingApproachOperation extends BaseOperation {
	name = "debugging_approach";
	category = "core";

	private entryHistory: DebuggingData[] = [];
	private branches: Record<string, DebuggingData[]> = {};
	private disableLogging: boolean = false;

	/**
	 * Tool description that guides AI behavior
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `A structured tool for systematic debugging through methodical investigation.

This tool provides scaffolding for debugging workflows, enforcing discipline through
required parameters while allowing flexibility in investigation approach.

When to use this tool:
- Isolating bugs through binary search debugging
- Conducting root cause analysis for production issues
- Rubber duck debugging to explain problems step-by-step
- Applying the Five Whys methodology
- Systematic investigation requiring clear documentation
- Problems where the investigation path needs to be tracked

Supported debugging approaches:
- binary_search: Divide and conquer - test midpoints to narrow down issue location
- root_cause: Deep analysis to find underlying causes, not just symptoms
- rubber_duck: Explain the problem step-by-step to clarify thinking
- five_whys: Ask "why" repeatedly to get to root cause (typically 5 iterations)
- hypothesis_testing: Form and test hypotheses systematically
- differential_diagnosis: Compare symptoms to known patterns
- timeline_analysis: Trace events chronologically to find trigger points

Key features:
- Track investigation progress with numbered entries
- Adjust totalEntries as complexity becomes clearer
- Mark revisions when reconsidering previous findings
- Branch to explore alternative hypotheses
- Document findings at each step
- Specify debugging approach being used

Parameters explained:
- entry: Your current debugging step or observation (required)
- entryNumber: Current step number in investigation (required, numeric)
- totalEntries: Estimated total steps needed (required, adjustable)
- nextEntryNeeded: True if more investigation needed (required, boolean)
- approach: Debugging methodology (optional: binary_search, root_cause, rubber_duck, five_whys, etc.)
- findings: Key findings or observations from this step (optional)
- isRevision: Boolean indicating if reconsidering previous finding (optional)
- revisesEntry: Which entry number is being reconsidered (optional)
- branchFromEntry: Entry number for branching point (optional)
- branchId: Identifier for investigation branch (optional)

You should:
1. Start with an estimated totalEntries, but adjust as understanding deepens
2. Choose a debugging approach and stick with it (or explicitly switch)
3. Document findings at each step for clarity
4. Mark revisions explicitly when reconsidering previous conclusions
5. Branch when exploring alternative hypotheses
6. Only set nextEntryNeeded to false when bug is isolated/understood`,
			inputSchema: {
				type: "object" as const,
				properties: {
					entry: {
						type: "string",
						description: "Current debugging step or observation",
					},
					entryNumber: {
						type: "integer",
						description: "Current entry number (1, 2, 3, etc.)",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total entries needed",
						minimum: 1,
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether more investigation is needed",
					},
					approach: {
						type: "string",
						description:
							"Debugging methodology (binary_search, root_cause, rubber_duck, five_whys, etc.)",
					},
					findings: {
						type: "string",
						description: "Key findings or observations from this step",
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
						description: "Branching point entry number",
						minimum: 1,
					},
					branchId: {
						type: "string",
						description: "Branch identifier for alternative hypothesis",
					},
				},
				required: ["entry", "entryNumber", "totalEntries", "nextEntryNeeded"],
			},
		};
	}

	/**
	 * Validate debugging data with strict type checking
	 */
	private validateData(input: unknown): DebuggingData {
		const data = input as Record<string, unknown>;

		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing the debugging step");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current step");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number estimating total steps needed");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error("Invalid nextEntryNeeded: must be a boolean indicating if more investigation is needed");
		}

		// Validate optional approach field
		if (data.approach !== undefined && typeof data.approach !== "string") {
			throw new Error("Invalid approach: must be a string (e.g., 'binary_search', 'root_cause', 'rubber_duck')");
		}

		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			totalEntries: data.totalEntries,
			nextEntryNeeded: data.nextEntryNeeded,
			isRevision: data.isRevision as boolean | undefined,
			revisesEntry: data.revisesEntry as number | undefined,
			branchFromEntry: data.branchFromEntry as number | undefined,
			branchId: data.branchId as string | undefined,
			approach: data.approach as string | undefined,
			findings: data.findings as string | undefined,
		};
	}

	/**
	 * Format debugging entry for terminal display
	 */
	private formatEntry(data: DebuggingData): string {
		const {
			entryNumber,
			totalEntries,
			entry,
			isRevision,
			revisesEntry,
			branchFromEntry,
			branchId,
			approach,
			findings,
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
			prefix = chalk.blue("🐛 Debug");
			context = approach ? ` [${approach}]` : "";
		}

		const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
		const border = "─".repeat(Math.max(header.length, entry.length, findings?.length || 0) + 4);

		let output = `
┌${border}┐
│ ${header.padEnd(border.length - 2)} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │`;

		if (findings) {
			output += `
├${border}┤
│ ${chalk.cyan("Findings:")} ${findings.padEnd(border.length - 11)} │`;
		}

		output += `
└${border}┘`;

		return output;
	}

	async execute(context: OperationContext): Promise<OperationResult> {
		const { parameters } = context;

		try {
			const validatedInput = this.validateData(parameters);

			// Auto-adjust totalEntries if current entry exceeds estimate
			if (validatedInput.entryNumber > validatedInput.totalEntries) {
				validatedInput.totalEntries = validatedInput.entryNumber;
			}

			// Store in history
			this.entryHistory.push(validatedInput);

			// Track branches for alternative investigation paths
			if (validatedInput.branchFromEntry && validatedInput.branchId) {
				if (!this.branches[validatedInput.branchId]) {
					this.branches[validatedInput.branchId] = [];
				}
				this.branches[validatedInput.branchId].push(validatedInput);
			}

			// Terminal logging for transparency
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}

			// Return minimal metadata (no prompt echoing)
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				approach: validatedInput.approach,
				findings: validatedInput.findings,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
			});
		} catch (error) {
			return this.createError(
				error instanceof Error ? error.message : String(error),
				{},
			);
		}
	}
}

export default new DebuggingApproachOperation();
