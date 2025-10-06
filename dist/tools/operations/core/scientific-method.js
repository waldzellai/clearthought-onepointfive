/**
 * Scientific Method Operation
 *
 * Structured journaling for systematic experimentation following scientific methodology
 * Implementation: Validation + Storage + Logging + Metadata (NO computational reasoning)
 */
import chalk from "chalk";
import { BaseOperation } from "../base.js";
/**
 * PHASE 3-4: Validation & Storage
 */
export class ScientificMethodOperation extends BaseOperation {
    name = "scientific_method";
    category = "core";
    // Storage
    entryHistory = [];
    branches = {};
    // Logging control
    disableLogging = (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
    /**
     * PHASE 3: Strict validation with descriptive errors
     */
    validateData(input) {
        const data = input;
        if (!data.entry || typeof data.entry !== "string") {
            throw new Error("Invalid entry: must be a string describing the current scientific step");
        }
        if (typeof data.entryNumber !== "number") {
            throw new Error("Invalid entryNumber: must be a number");
        }
        if (typeof data.totalEntries !== "number") {
            throw new Error("Invalid totalEntries: must be a number");
        }
        if (typeof data.nextEntryNeeded !== "boolean") {
            throw new Error("Invalid nextEntryNeeded: must be a boolean");
        }
        // Validate phase if provided
        if (data.phase &&
            !["observation", "hypothesis", "experiment", "analysis", "conclusion"].includes(data.phase)) {
            throw new Error("Invalid phase: must be one of observation, hypothesis, experiment, analysis, conclusion");
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
            phase: data.phase,
            experimentData: data.experimentData,
            observationData: data.observationData,
            analysisResults: data.analysisResults,
            reproducibilityCheck: data.reproducibilityCheck,
        };
    }
    /**
     * PHASE 5: Terminal logging with chalk colors
     */
    formatEntry(data) {
        const { entryNumber, totalEntries, entry, isRevision, revisesEntry, phase, branchId } = data;
        let prefix = "";
        let context = "";
        if (isRevision) {
            prefix = chalk.yellow("🔄 Revision");
            context = ` (revising entry ${revisesEntry})`;
        }
        else if (branchId) {
            prefix = chalk.green("🌿 Branch");
            context = ` (${branchId})`;
        }
        else {
            prefix = chalk.blue("🔬 Scientific Method");
            context = "";
        }
        // Add phase to context if available
        if (phase) {
            const phaseColor = phase === "observation"
                ? chalk.cyan
                : phase === "hypothesis"
                    ? chalk.magenta
                    : phase === "experiment"
                        ? chalk.yellow
                        : phase === "analysis"
                            ? chalk.blue
                            : chalk.green;
            context += ` [${phaseColor(phase.toUpperCase())}]`;
        }
        const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
        const border = "─".repeat(Math.max(header.length - 10, entry.length) + 4);
        return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │
└${border}┘`;
    }
    /**
     * PHASE 4-7: Main execution - Storage + Minimal Response
     */
    async execute(context) {
        const { parameters } = context;
        try {
            // Validate input
            const validatedInput = this.validateData(parameters);
            // Auto-adjust totalEntries if needed
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
            // Log to stderr for humans
            if (!this.disableLogging) {
                const formattedEntry = this.formatEntry(validatedInput);
                console.error(formattedEntry);
            }
            // PHASE 7: Return ONLY metadata (<100 tokens)
            return this.createResult({
                entryNumber: validatedInput.entryNumber,
                totalEntries: validatedInput.totalEntries,
                nextEntryNeeded: validatedInput.nextEntryNeeded,
                phase: validatedInput.phase,
                branches: Object.keys(this.branches),
                historyLength: this.entryHistory.length,
            });
        }
        catch (error) {
            return this.createError(error instanceof Error ? error.message : String(error));
        }
    }
    /**
     * PHASE 6: Tool description that guides AI behavior
     */
    getToolDescription() {
        return {
            name: this.name,
            description: `A structured tool for scientific methodology through systematic experimentation.

This tool provides scaffolding for the scientific method, enforcing discipline through required parameters
while allowing flexibility in exploration. It does NOT perform computational reasoning - it provides structure
for the AI to think methodically through: observation → hypothesis → experiment → analysis → conclusion.

When to use this tool:
- Conducting systematic experiments or investigations
- Testing hypotheses through structured methodology
- Analyzing results with scientific rigor
- Documenting reproducible processes
- Problems requiring empirical validation
- Iterative refinement of understanding through experimentation

Key features:
- Adjust totalEntries as understanding evolves
- Mark explicit phases (observation, hypothesis, experiment, analysis, conclusion)
- Revise entries when new evidence emerges
- Branch to explore alternative hypotheses
- Track experimental data and reproducibility
- Express uncertainty naturally

Parameters explained:
- entry: Your current step in the scientific process (what you're observing, hypothesizing, testing, etc.)
- nextEntryNeeded: True if more entries needed to complete the investigation
- entryNumber: Current position in the sequence (1, 2, 3, ...)
- totalEntries: Current estimate of total entries needed (adjustable)
- phase: Current phase (observation, hypothesis, experiment, analysis, conclusion)
- isRevision: Boolean indicating if this revises previous thinking
- revisesEntry: Which entry number is being reconsidered
- branchFromEntry: Branching point for alternative hypotheses
- branchId: Identifier for the exploration branch
- experimentData: Optional data from experiments
- observationData: Optional observational data
- analysisResults: Optional analysis results
- reproducibilityCheck: Optional reproducibility verification

You should:
1. Start with observation, form hypotheses, design experiments
2. Mark which phase you're in explicitly
3. Revise hypotheses when evidence contradicts them
4. Branch to test alternative explanations
5. Document experiments and results thoroughly
6. Verify reproducibility when possible
7. Only set nextEntryNeeded to false when investigation is complete`,
            inputSchema: {
                type: "object",
                properties: {
                    entry: {
                        type: "string",
                        description: "Current step in the scientific process",
                    },
                    nextEntryNeeded: {
                        type: "boolean",
                        description: "Whether another entry is needed",
                    },
                    entryNumber: {
                        type: "integer",
                        description: "Current entry number (1, 2, 3, ...)",
                        minimum: 1,
                    },
                    totalEntries: {
                        type: "integer",
                        description: "Estimated total entries needed",
                        minimum: 1,
                    },
                    phase: {
                        type: "string",
                        enum: ["observation", "hypothesis", "experiment", "analysis", "conclusion"],
                        description: "Current phase of scientific method",
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
                        description: "Branch identifier",
                    },
                    experimentData: {
                        type: "object",
                        description: "Experimental data",
                    },
                    observationData: {
                        type: "object",
                        description: "Observational data",
                    },
                    analysisResults: {
                        type: "object",
                        description: "Analysis results",
                    },
                    reproducibilityCheck: {
                        type: "object",
                        description: "Reproducibility verification",
                    },
                },
                required: ["entry", "nextEntryNeeded", "entryNumber", "totalEntries"],
            },
        };
    }
}
export default new ScientificMethodOperation();
