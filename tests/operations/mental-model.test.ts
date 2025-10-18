/**
 * Mental Model Operation - Structured Journal Pattern Tests
 *
 * Tests validate, store, log, and return minimal metadata behavior
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionState } from "../../src/state/SessionState.js";
import { MentalModelOperation } from "../../src/tools/operations/core/mental-model.js";

describe("MentalModelOperation - Structured Journal Pattern", () => {
	let operation: MentalModelOperation;
	let sessionState: SessionState;

	beforeEach(() => {
		operation = new MentalModelOperation();
		sessionState = new SessionState("test-session", {
			persistenceEnabled: false,
			maxThoughts: 1000,
			maxContextSize: 50000,
		});
		// Suppress console.error for cleaner test output
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	describe("Parameter Validation", () => {
		it("should throw error for missing entry", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entry");
		});

		it("should throw error for missing entryNumber", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Break down to first principles",
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entryNumber");
		});

		it("should throw error for missing totalEntries", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Break down to first principles",
					entryNumber: 1,
					nextEntryNeeded: true,
				},
			});

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid totalEntries");
		});

		it("should throw error for missing nextEntryNeeded", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Break down to first principles",
					entryNumber: 1,
					totalEntries: 3,
				},
			});

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid nextEntryNeeded");
		});

		it("should throw error for invalid modelName", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Apply invalid model",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					modelName: "invalid_model",
				},
			});

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid modelName");
		});

		it("should accept valid modelName", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Break down to fundamentals",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					modelName: "first_principles",
				},
			});

			expect(result.status).toBe("success");
			expect(result.modelName).toBe("first_principles");
		});
	});

	describe("Entry Storage", () => {
		it("should store entries in history", async () => {
			const result1 = await operation.execute({
				sessionState,
				parameters: {
					entry: "First entry",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			expect(result1.historyLength).toBe(1);

			const result2 = await operation.execute({
				sessionState,
				parameters: {
					entry: "Second entry",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			expect(result2.historyLength).toBe(2);
		});

		it("should auto-adjust totalEntries when exceeded", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Entry exceeding total",
					entryNumber: 5,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			expect(result.totalEntries).toBe(5);
		});
	});

	describe("Branching Support", () => {
		it("should track branches correctly", async () => {
			// Main branch
			await operation.execute({
				sessionState,
				parameters: {
					entry: "Main entry 1",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			// Branch from entry 1
			const branchResult = await operation.execute({
				sessionState,
				parameters: {
					entry: "Alternative approach",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
					branchFromEntry: 1,
					branchId: "alt-1",
				},
			});

			expect(branchResult.branches).toContain("alt-1");
		});

		it("should accumulate multiple branches", async () => {
			await operation.execute({
				sessionState,
				parameters: {
					entry: "Branch 1",
					entryNumber: 1,
					totalEntries: 2,
					nextEntryNeeded: true,
					branchFromEntry: 1,
					branchId: "branch-1",
				},
			});

			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Branch 2",
					entryNumber: 1,
					totalEntries: 2,
					nextEntryNeeded: true,
					branchFromEntry: 1,
					branchId: "branch-2",
				},
			});

			expect(result.branches).toHaveLength(2);
			expect(result.branches).toContain("branch-1");
			expect(result.branches).toContain("branch-2");
		});
	});

	describe("Minimal Metadata Response", () => {
		it("should return metadata only, no content echoing", async () => {
			const entry = "This is a detailed entry about first principles thinking";
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry,
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					modelName: "first_principles",
				},
			});

			expect(result.status).toBe("success");
			expect(result.entryNumber).toBe(1);
			expect(result.totalEntries).toBe(3);
			expect(result.nextEntryNeeded).toBe(true);
			expect(result.modelName).toBe("first_principles");
			expect(result.historyLength).toBe(1);

			// Should NOT echo the entry content
			expect(JSON.stringify(result)).not.toContain(entry);
		});

		it("should return metadata under 100 tokens (excluding error cases)", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Test entry",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					modelName: "pareto_principle",
				},
			});

			const resultString = JSON.stringify(result);
			// Rough token estimate: ~4 chars per token
			const estimatedTokens = resultString.length / 4;
			expect(estimatedTokens).toBeLessThan(100);
		});
	});

	describe("Revision Support", () => {
		it("should handle revision entries", async () => {
			await operation.execute({
				sessionState,
				parameters: {
					entry: "Original thought",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			});

			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Revised thought",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
					isRevision: true,
					revisesEntry: 1,
				},
			});

			expect(result.status).toBe("success");
			expect(result.historyLength).toBe(2);
		});
	});

	describe("Session State Integration", () => {
		it("should store in session state for persistence", async () => {
			await operation.execute({
				sessionState,
				parameters: {
					entry: "Mental model entry",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					modelName: "first_principles",
					reasoning: "Starting from fundamentals",
				},
			});

			const models = sessionState.getMentalModels();
			expect(models).toHaveLength(1);
			expect(models[0].modelName).toBe("first_principles");
		});
	});

	describe("Tool Description", () => {
		it("should provide comprehensive tool description", () => {
			const toolDesc = operation.getToolDescription();

			expect(toolDesc.name).toBe("mental_model");
			expect(toolDesc.description).toContain("mental models");
			expect(toolDesc.description).toContain("first_principles");
			expect(toolDesc.description).toContain("pareto_principle");
			expect(toolDesc.inputSchema.type).toBe("object");
			expect(toolDesc.inputSchema.required).toContain("entry");
			expect(toolDesc.inputSchema.required).toContain("nextEntryNeeded");
			expect(toolDesc.inputSchema.required).toContain("entryNumber");
			expect(toolDesc.inputSchema.required).toContain("totalEntries");
		});

		it("should list all supported mental models in description", () => {
			const toolDesc = operation.getToolDescription();
			const models = [
				"first_principles",
				"pareto_principle",
				"inversion",
				"circle_of_competence",
				"second_order_thinking",
				"occams_razor",
				"opportunity_cost",
				"error_propagation",
				"rubber_duck",
			];

			models.forEach((model) => {
				expect(toolDesc.description).toContain(model);
			});
		});
	});

	describe("Anti-Patterns Check", () => {
		it("should NOT return placeholder dispatch messages", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Test",
					entryNumber: 1,
					totalEntries: 1,
					nextEntryNeeded: false,
				},
			});

			const resultStr = JSON.stringify(result).toLowerCase();
			expect(resultStr).not.toContain("would dispatch");
			expect(resultStr).not.toContain("placeholder");
		});

		it("should NOT perform fake pattern selection", async () => {
			const result = await operation.execute({
				sessionState,
				parameters: {
					entry: "Test",
					entryNumber: 1,
					totalEntries: 1,
					nextEntryNeeded: false,
				},
			});

			const resultStr = JSON.stringify(result).toLowerCase();
			expect(resultStr).not.toContain("selected pattern");
			expect(resultStr).not.toContain("choosing");
		});
	});
});
