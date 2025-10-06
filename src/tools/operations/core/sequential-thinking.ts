/**
 * Sequential Thinking Operation - Structured Journal Pattern
 *
 * A structured tool for dynamic and reflective problem-solving through thoughts.
 * This tool provides scaffolding for methodical thinking, enforcing discipline
 * through required parameters while allowing flexibility in approach.
 *
 * Based on the reference implementation from docs/sequential-thinking-mcp-index.ts
 */

import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

export interface SequentialThinkingData {
	entry: string; // The thought
	entryNumber: number;
	totalEntries: number;
	nextEntryNeeded: boolean;
	isRevision?: boolean;
	revisesEntry?: number;
	branchFromEntry?: number;
	branchId?: string;
}

export class SequentialThinkingOperation extends BaseOperation {
	name = "sequential_thinking";
	category = "core";

	private entryHistory: SequentialThinkingData[] = [];
	private branches: Record<string, SequentialThinkingData[]> = {};
	private disableLogging = false;

	constructor() {
		super();
		// Check environment variable for logging control
		this.disableLogging =
			(process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
	}

	/**
	 * Validate input data with strict type checking and descriptive errors
	 */
	private validateData(input: unknown): SequentialThinkingData {
		const data = input as Record<string, unknown>;

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
			throw new Error("Invalid nextEntryNeeded: must be a boolean indicating if more thoughts are needed");
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
		};
	}

	/**
	 * Format entry for terminal logging with visual indicators
	 */
	private formatEntry(data: SequentialThinkingData): string {
		const { entryNumber, totalEntries, entry, isRevision, revisesEntry, branchFromEntry, branchId } =
			data;

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

	async execute(context: OperationContext): Promise<OperationResult> {
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
}

// Export singleton instance
export default new SequentialThinkingOperation();
