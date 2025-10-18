/**
 * Visual Reasoning Operation - Structured Journal Pattern
 *
 * A structured tool for visual and spatial reasoning through systematic analysis.
 * Enforces methodical thinking about spatial relationships, patterns, and transformations.
 */
import chalk from "chalk";
import { BaseOperation } from "../base.js";
export class VisualReasoningOperation extends BaseOperation {
	name = "visual_reasoning";
	category = "core";
	// Journal storage
	entryHistory = [];
	branches = {};
	disableLogging;
	constructor() {
		super();
		this.disableLogging = (process.env.DISABLE_VISUAL_LOGGING || "").toLowerCase() === "true";
	}
	/**
	 * Validate visual reasoning entry data with strict type checking
	 */
	validateData(input) {
		const data = input;
		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing visual analysis");
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
		// Validate optional arrays if provided
		if (data.spatialRelations !== undefined) {
			if (!Array.isArray(data.spatialRelations)) {
				throw new Error("Invalid spatialRelations: must be an array");
			}
			if (!data.spatialRelations.every((item) => typeof item === "string")) {
				throw new Error("Invalid spatialRelations: all items must be strings");
			}
		}
		if (data.patterns !== undefined) {
			if (!Array.isArray(data.patterns)) {
				throw new Error("Invalid patterns: must be an array");
			}
			if (!data.patterns.every((item) => typeof item === "string")) {
				throw new Error("Invalid patterns: all items must be strings");
			}
		}
		if (data.transformations !== undefined) {
			if (!Array.isArray(data.transformations)) {
				throw new Error("Invalid transformations: must be an array");
			}
			if (!data.transformations.every((item) => typeof item === "string")) {
				throw new Error("Invalid transformations: all items must be strings");
			}
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
			spatialRelations: data.spatialRelations,
			patterns: data.patterns,
			transformations: data.transformations,
		};
	}
	/**
	 * Format entry for terminal display with visual reasoning context
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
			spatialRelations,
			patterns,
			transformations,
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
			prefix = chalk.blue("🔍 Visual Analysis");
			context = "";
		}
		const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
		const border = "─".repeat(Math.max(header.length, entry.length) + 4);
		let output = `
┌${border}┐
│ ${header} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │`;
		// Add metadata if present
		if (spatialRelations && spatialRelations.length > 0) {
			output += `
├${border}┤
│ ${chalk.cyan("Spatial:")} ${spatialRelations.join(", ").padEnd(border.length - 10)} │`;
		}
		if (patterns && patterns.length > 0) {
			output += `
├${border}┤
│ ${chalk.magenta("Patterns:")} ${patterns.join(", ").padEnd(border.length - 11)} │`;
		}
		if (transformations && transformations.length > 0) {
			output += `
├${border}┤
│ ${chalk.yellow("Transforms:")} ${transformations.join(", ").padEnd(border.length - 13)} │`;
		}
		output += `
└${border}┘`;
		return output;
	}
	/**
	 * Process visual reasoning entry
	 */
	processEntry(input) {
		try {
			const validatedInput = this.validateData(input);
			// Auto-adjust totalEntries if current exceeds estimate
			if (validatedInput.entryNumber > validatedInput.totalEntries) {
				validatedInput.totalEntries = validatedInput.entryNumber;
			}
			// Store in history
			this.entryHistory.push(validatedInput);
			// Track branches if applicable
			if (validatedInput.branchFromEntry && validatedInput.branchId) {
				if (!this.branches[validatedInput.branchId]) {
					this.branches[validatedInput.branchId] = [];
				}
				this.branches[validatedInput.branchId].push(validatedInput);
			}
			// Terminal logging (stderr for human readability)
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}
			// Return minimal metadata only
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
			});
		} catch (error) {
			return this.createError(error instanceof Error ? error.message : String(error), {});
		}
	}
	async execute(context) {
		const { parameters } = context;
		return this.processEntry(parameters);
	}
}
export default new VisualReasoningOperation();
