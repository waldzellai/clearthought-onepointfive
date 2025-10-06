/**
 * Debugging Approach Operation - Structured Journal Pattern
 *
 * Systematic debugging through methodical investigation using structured entries.
 * Supports multiple debugging methodologies: Binary Search, Root Cause Analysis,
 * Rubber Duck Debugging, Five Whys, etc.
 */
import { BaseOperation } from "../base.js";
import chalk from "chalk";
export class DebuggingApproachOperation extends BaseOperation {
    name = "debugging_approach";
    category = "core";
    entryHistory = [];
    branches = {};
    disableLogging = false;
    /**
     * Validate debugging data with strict type checking
     */
    validateData(input) {
        const data = input;
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
            isRevision: data.isRevision,
            revisesEntry: data.revisesEntry,
            branchFromEntry: data.branchFromEntry,
            branchId: data.branchId,
            approach: data.approach,
            findings: data.findings,
        };
    }
    /**
     * Format debugging entry for terminal display
     */
    formatEntry(data) {
        const { entryNumber, totalEntries, entry, isRevision, revisesEntry, branchFromEntry, branchId, approach, findings, } = data;
        let prefix = "";
        let context = "";
        if (isRevision) {
            prefix = chalk.yellow("🔄 Revision");
            context = ` (revising entry ${revisesEntry})`;
        }
        else if (branchFromEntry) {
            prefix = chalk.green("🌿 Branch");
            context = ` (from entry ${branchFromEntry}, ID: ${branchId})`;
        }
        else {
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
    async execute(context) {
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
        }
        catch (error) {
            return this.createError(error instanceof Error ? error.message : String(error), {});
        }
    }
}
export default new DebuggingApproachOperation();
