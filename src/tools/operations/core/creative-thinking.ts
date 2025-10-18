/**
 * Creative Thinking Operation
 *
 * Structured tool for creative problem-solving through systematic ideation.
 * This tool provides scaffolding for various creative techniques but does NOT
 * generate ideas - the AI generates them using the provided framework.
 */

import chalk from "chalk";
import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

interface CreativeThinkingData {
	entry: string; // The creative idea or technique application
	entryNumber: number;
	totalEntries: number;
	nextEntryNeeded: boolean;
	isRevision?: boolean;
	revisesEntry?: number;
	branchFromEntry?: number;
	branchId?: string;
	technique?: string; // e.g., 'brainstorming', 'scamper', 'random_word', 'six_thinking_hats'
	evaluation?: string; // Evaluation or refinement of the idea
}

export class CreativeThinkingOperation extends BaseOperation {
	name = "creative_thinking";
	category = "core";

	private entryHistory: CreativeThinkingData[] = [];
	private branches: Record<string, CreativeThinkingData[]> = {};

	async execute(context: OperationContext): Promise<OperationResult> {
		const { parameters } = context;

		try {
			const validatedData = this.validateData(parameters);

			// Auto-adjust totalEntries if current exceeds total
			if (validatedData.entryNumber > validatedData.totalEntries) {
				validatedData.totalEntries = validatedData.entryNumber;
			}

			// Store in history
			this.entryHistory.push(validatedData);

			// Track branches if specified
			if (validatedData.branchFromEntry && validatedData.branchId) {
				if (!this.branches[validatedData.branchId]) {
					this.branches[validatedData.branchId] = [];
				}
				this.branches[validatedData.branchId].push(validatedData);
			}

			// Log to terminal (stderr) for human visibility
			this.logEntry(validatedData);

			// Return minimal metadata (no echoing)
			return this.createResult({
				entryNumber: validatedData.entryNumber,
				totalEntries: validatedData.totalEntries,
				nextEntryNeeded: validatedData.nextEntryNeeded,
				technique: validatedData.technique,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
			});
		} catch (error) {
			return this.createResult(
				{
					error: error instanceof Error ? error.message : String(error),
					status: "failed",
				},
				false,
			);
		}
	}

	private validateData(parameters: Record<string, unknown>): CreativeThinkingData {
		if (!parameters.entry || typeof parameters.entry !== "string") {
			throw new Error(
				"Invalid entry: must be a string containing the creative idea or technique application",
			);
		}
		if (!parameters.entryNumber || typeof parameters.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number");
		}
		if (!parameters.totalEntries || typeof parameters.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number");
		}
		if (typeof parameters.nextEntryNeeded !== "boolean") {
			throw new Error("Invalid nextEntryNeeded: must be a boolean");
		}

		return {
			entry: parameters.entry,
			entryNumber: parameters.entryNumber,
			totalEntries: parameters.totalEntries,
			nextEntryNeeded: parameters.nextEntryNeeded,
			isRevision: parameters.isRevision as boolean | undefined,
			revisesEntry: parameters.revisesEntry as number | undefined,
			branchFromEntry: parameters.branchFromEntry as number | undefined,
			branchId: parameters.branchId as string | undefined,
			technique: parameters.technique as string | undefined,
			evaluation: parameters.evaluation as string | undefined,
		};
	}

	private logEntry(data: CreativeThinkingData): void {
		const formatted = this.formatEntry(data);
		console.error(formatted);
	}

	private formatEntry(data: CreativeThinkingData): string {
		const {
			entryNumber,
			totalEntries,
			entry,
			isRevision,
			revisesEntry,
			branchFromEntry,
			branchId,
			technique,
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
			prefix = chalk.magenta("💡 Creative");
			context = technique ? ` [${technique}]` : "";
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

	getDescription(): string {
		return `Structured tool for creative problem-solving through systematic ideation.

This tool provides scaffolding for various creative thinking techniques. The AI generates
ideas using these frameworks - the tool itself does NOT generate ideas.

SUPPORTED CREATIVE TECHNIQUES:

1. **Brainstorming** (technique: "brainstorming")
   - Generate multiple ideas without judgment
   - Build on previous ideas
   - Encourage wild and unusual concepts
   - AI should: produce 5-10+ ideas, defer judgment, combine ideas

2. **SCAMPER** (technique: "scamper")
   - Substitute: What can be replaced?
   - Combine: What can be merged?
   - Adapt: What can be adjusted?
   - Modify: What can be changed?
   - Put to other uses: How else can this be used?
   - Eliminate: What can be removed?
   - Reverse/Rearrange: What can be flipped or reordered?
   - AI should: apply each lens systematically to the problem

3. **Random Word Association** (technique: "random_word")
   - Pick a random word unrelated to the problem
   - Find connections between word and problem
   - Use word as creative catalyst
   - AI should: select random word, explore 3-5 connections

4. **Six Thinking Hats** (technique: "six_thinking_hats")
   - White Hat: Facts and information
   - Red Hat: Emotions and intuition
   - Black Hat: Caution and risks
   - Yellow Hat: Benefits and optimism
   - Green Hat: Creativity and alternatives
   - Blue Hat: Process and meta-thinking
   - AI should: wear each hat systematically, one per entry

5. **TRIZ** (technique: "triz")
   - Use contradiction matrix
   - Apply 40 inventive principles
   - Identify patterns from patent analysis
   - AI should: identify contradictions, apply relevant principles

6. **Mind Mapping** (technique: "mind_mapping")
   - Start with central concept
   - Branch into related ideas
   - Use branching parameters (branchFromEntry, branchId)
   - AI should: create hierarchical idea network

7. **Reverse Brainstorming** (technique: "reverse_brainstorming")
   - How could we cause the problem?
   - How could we make it worse?
   - Reverse these to find solutions
   - AI should: generate anti-solutions, then reverse them

PARAMETERS:
- entry (required): The creative idea or technique application
- entryNumber (required): Current entry number
- totalEntries (required): Estimated total entries needed
- nextEntryNeeded (required): Whether more entries are needed
- technique (optional): Which creative technique being used
- evaluation (optional): Evaluation or refinement of the idea
- isRevision (optional): Whether this revises a previous entry
- revisesEntry (optional): Which entry is being revised
- branchFromEntry (optional): For mind mapping - which entry to branch from
- branchId (optional): Identifier for this branch

WORKFLOW:
1. AI selects appropriate creative technique(s) for the problem
2. AI generates ideas using that technique's framework
3. Each idea is one entry in the structured journal
4. AI can revise entries, branch (for mind mapping), or switch techniques
5. AI evaluates and refines promising ideas
6. Tool tracks progress, branches, and provides transparency

IMPORTANT:
- The AI generates ALL ideas - the tool only provides structure
- Each technique guides HOW to think, not WHAT to think
- Tool returns minimal metadata, no echoing
- Terminal shows formatted progress for human visibility
- Supports revision and branching for iterative refinement`;
	}
}

export default new CreativeThinkingOperation();
