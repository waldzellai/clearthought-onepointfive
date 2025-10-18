/**
 * Metacognitive Monitoring Operation - Structured Journal Pattern
 *
 * Provides scaffolding for metacognitive reflection through structured entries.
 * Based on Sequential Thinking MCP server pattern.
 */

import chalk from "chalk";
import { BaseOperation } from "../base.js";
export class MetacognitiveMonitoringOperation extends BaseOperation {
	name = "metacognitive_monitoring";
	category = "core";
	entryHistory = [];
	branches = {};
	disableLogging;
	constructor() {
		super();
		this.disableLogging =
			(process.env.DISABLE_METACOGNITIVE_LOGGING || "").toLowerCase() === "true";
	}
	/**
	 * Get tool description for MCP registration
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `A structured tool for metacognitive monitoring and self-reflection through systematic entries.

This tool provides scaffolding for metacognitive awareness, helping you evaluate your thinking process, identify biases, assess confidence, and adjust strategies. It enforces discipline through required parameters while allowing flexibility in approach.

When to use this tool:
- When you need to evaluate the quality of your reasoning
- To identify potential biases or blind spots in your thinking
- When assessing confidence levels in conclusions
- For monitoring problem-solving strategies and adjusting approach
- To track improvement in thinking patterns over time
- When reflecting on decision-making processes
- To develop metacognitive awareness and self-regulation

Key features:
- Adjust totalEntries as your understanding of the thinking process evolves
- Mark revisions explicitly when reconsidering previous assessments
- Branch to explore alternative metacognitive perspectives
- Express uncertainty about thinking quality naturally
- Track confidence levels across reflections
- Identify and document cognitive biases

Parameters explained:
- entry: Your metacognitive reflection or self-assessment of thinking
- nextEntryNeeded: True if more metacognitive reflection is needed
- entryNumber: Current position in reflection sequence
- totalEntries: Current estimate of reflections needed (adjustable)
- isRevision: Boolean indicating reconsideration of previous assessment
- revisesEntry: Which entry number is being reconsidered
- branchFromEntry: Branching point for alternative metacognitive perspectives
- branchId: Identifier for exploration branch
- awareness: Explicit statement of self-awareness about thinking process
- evaluation: Evaluation of current thinking approach or strategy
- confidence: Confidence level in current thinking (0-1 scale)
- biasCheck: Array of identified biases, assumptions, or blind spots

You should:
1. Start with initial estimate of reflections needed, adjust as needed
2. Explicitly mark revisions when reconsidering assessments
3. Branch when exploring alternative metacognitive perspectives
4. Express uncertainty about thinking quality when present
5. Track confidence levels to identify areas needing more thought
6. Regularly check for biases and document them
7. Evaluate strategies and adjust approach based on reflection
8. Only set nextEntryNeeded to false when metacognitive monitoring is complete`,
			inputSchema: {
				type: "object",
				properties: {
					entry: {
						type: "string",
						description: "Metacognitive reflection or self-assessment content",
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether another metacognitive reflection is needed",
					},
					entryNumber: {
						type: "integer",
						description: "Current entry number (numeric value, e.g., 1, 2, 3)",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total entries needed (numeric value, adjustable)",
						minimum: 1,
					},
					isRevision: {
						type: "boolean",
						description: "Whether this revises previous metacognitive assessment",
					},
					revisesEntry: {
						type: "integer",
						description: "Which entry is being reconsidered",
						minimum: 1,
					},
					branchFromEntry: {
						type: "integer",
						description: "Branching point entry number for alternative perspective",
						minimum: 1,
					},
					branchId: {
						type: "string",
						description: "Branch identifier for metacognitive exploration",
					},
					awareness: {
						type: "string",
						description: "Self-awareness statement about thinking process",
					},
					evaluation: {
						type: "string",
						description: "Evaluation of current thinking approach or strategy",
					},
					confidence: {
						type: "number",
						description: "Confidence level in current thinking (0-1 scale)",
						minimum: 0,
						maximum: 1,
					},
					biasCheck: {
						type: "array",
						items: { type: "string" },
						description: "Identified biases, assumptions, or blind spots",
					},
				},
				required: ["entry", "nextEntryNeeded", "entryNumber", "totalEntries"],
			},
		};
	}
	/**
	 * Validates metacognitive data with strict type checking
	 */
	validateData(input) {
		const data = input;
		if (!data.entry || typeof data.entry !== "string") {
			throw new Error(
				"Invalid entry: must be a non-empty string containing metacognitive reflection",
			);
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a positive number");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a positive number");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error("Invalid nextEntryNeeded: must be a boolean");
		}
		// Validate confidence if provided
		if (data.confidence !== undefined) {
			if (typeof data.confidence !== "number" || data.confidence < 0 || data.confidence > 1) {
				throw new Error("Invalid confidence: must be a number between 0 and 1");
			}
		}
		// Validate biasCheck if provided
		if (data.biasCheck !== undefined) {
			if (
				!(Array.isArray(data.biasCheck) && data.biasCheck.every((item) => typeof item === "string"))
			) {
				throw new Error("Invalid biasCheck: must be an array of strings");
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
			awareness: data.awareness,
			evaluation: data.evaluation,
			confidence: data.confidence,
			biasCheck: data.biasCheck,
		};
	}
	/**
	 * Formats entry for terminal display
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
			confidence,
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
			prefix = chalk.blue("🧠 Metacognitive");
			context = "";
		}
		// Add confidence to context if available
		if (confidence !== undefined) {
			const confidencePercent = Math.round(confidence * 100);
			const confidenceColor =
				confidence >= 0.7 ? chalk.green : confidence >= 0.4 ? chalk.yellow : chalk.red;
			context += ` ${confidenceColor(`[${confidencePercent}% confidence]`)}`;
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
		try {
			const validatedInput = this.validateData(context.parameters);
			// Auto-adjust totalEntries if exceeded
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
			// Update confidence KPI if provided
			if (validatedInput.confidence !== undefined) {
				context.sessionState.updateKPI(
					"metacognitive_confidence",
					validatedInput.confidence,
					"Thinking Confidence",
					0.8,
					"up",
				);
			}
			// Terminal logging
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}
			// Return minimal metadata
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				confidence: validatedInput.confidence,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
			});
		} catch (error) {
			return this.createError(error instanceof Error ? error.message : String(error), {});
		}
	}
}
export default new MetacognitiveMonitoringOperation();
