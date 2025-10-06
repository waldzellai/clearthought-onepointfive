/**
 * Scientific Method Operation Tests
 *
 * Verifies the structured journal pattern implementation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ScientificMethodOperation } from "../../src/tools/operations/core/scientific-method.js";
import type { OperationContext } from "../../src/tools/operations/base.js";
import { SessionState } from "../../src/state/SessionState.js";

describe("ScientificMethodOperation - Structured Journal Pattern", () => {
	let operation: ScientificMethodOperation;
	let sessionState: SessionState;

	beforeEach(() => {
		operation = new ScientificMethodOperation();
		sessionState = new SessionState("test-session", {
			persistenceEnabled: false,
			maxThoughts: 1000,
		});
	});

	describe("Validation", () => {
		it("validates required parameters", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					// Missing all required fields
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entry");
		});

		it("validates entry is a string", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: 123, // Wrong type
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("must be a string");
		});

		it("validates entryNumber is a number", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Observing the phenomenon",
					entryNumber: "1", // Wrong type
					totalEntries: 5,
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("must be a number");
		});

		it("validates phase enum values", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Testing something",
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "invalid_phase", // Invalid phase
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("must be one of observation, hypothesis, experiment");
		});

		it("accepts valid phase values", async () => {
			const phases = ["observation", "hypothesis", "experiment", "analysis", "conclusion"];

			for (const phase of phases) {
				const context: OperationContext = {
					sessionState,
					parameters: {
						entry: `Testing ${phase} phase`,
						entryNumber: 1,
						totalEntries: 5,
						nextEntryNeeded: true,
						phase,
					},
				};

				const result = await operation.execute(context);
				expect(result.status).toBe("success");
				expect(result.phase).toBe(phase);
			}
		});
	});

	describe("Storage", () => {
		it("stores entries in history", async () => {
			const context1: OperationContext = {
				sessionState,
				parameters: {
					entry: "First observation",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					phase: "observation",
				},
			};

			const result1 = await operation.execute(context1);
			expect(result1.historyLength).toBe(1);

			const context2: OperationContext = {
				sessionState,
				parameters: {
					entry: "Forming hypothesis",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
					phase: "hypothesis",
				},
			};

			const result2 = await operation.execute(context2);
			expect(result2.historyLength).toBe(2);
		});

		it("tracks branches correctly", async () => {
			const context1: OperationContext = {
				sessionState,
				parameters: {
					entry: "Main hypothesis",
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "hypothesis",
				},
			};

			await operation.execute(context1);

			const context2: OperationContext = {
				sessionState,
				parameters: {
					entry: "Alternative hypothesis",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
					branchFromEntry: 1,
					branchId: "alt-hypothesis-1",
					phase: "hypothesis",
				},
			};

			const result = await operation.execute(context2);
			expect(result.branches).toContain("alt-hypothesis-1");
		});
	});

	describe("Auto-adjustment", () => {
		it("auto-adjusts totalEntries when exceeded", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Unexpected finding requires more analysis",
					entryNumber: 6, // Exceeds original estimate
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "analysis",
				},
			};

			const result = await operation.execute(context);
			expect(result.totalEntries).toBe(6); // Auto-adjusted
		});
	});

	describe("Response Format", () => {
		it("returns minimal metadata only", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "This is a long entry that should NOT be echoed back in the response",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					phase: "observation",
				},
			};

			const result = await operation.execute(context);

			// Verify metadata fields
			expect(result).toHaveProperty("entryNumber");
			expect(result).toHaveProperty("totalEntries");
			expect(result).toHaveProperty("nextEntryNeeded");
			expect(result).toHaveProperty("phase");
			expect(result).toHaveProperty("branches");
			expect(result).toHaveProperty("historyLength");

			// Verify entry is NOT echoed
			expect(JSON.stringify(result)).not.toContain(
				"This is a long entry that should NOT be echoed",
			);

			// Response should be small (<100 tokens estimate)
			const responseSize = JSON.stringify(result).length;
			expect(responseSize).toBeLessThan(500); // Rough estimate
		});
	});

	describe("Scientific Method Phases", () => {
		it("tracks observation phase", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Observing water boils at different temperatures",
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "observation",
					observationData: { temperature: 100, pressure: 1 },
				},
			};

			const result = await operation.execute(context);
			expect(result.phase).toBe("observation");
		});

		it("tracks hypothesis phase", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Hypothesis: Altitude affects boiling point",
					entryNumber: 2,
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "hypothesis",
				},
			};

			const result = await operation.execute(context);
			expect(result.phase).toBe("hypothesis");
		});

		it("tracks experiment phase", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Conducting experiment at different altitudes",
					entryNumber: 3,
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "experiment",
					experimentData: { trials: 10, locations: ["sea-level", "mountain"] },
				},
			};

			const result = await operation.execute(context);
			expect(result.phase).toBe("experiment");
		});

		it("tracks analysis phase", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Analyzing results: correlation confirmed",
					entryNumber: 4,
					totalEntries: 5,
					nextEntryNeeded: true,
					phase: "analysis",
					analysisResults: { correlation: 0.95, pValue: 0.001 },
				},
			};

			const result = await operation.execute(context);
			expect(result.phase).toBe("analysis");
		});

		it("tracks conclusion phase", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Conclusion: Altitude affects boiling point as hypothesized",
					entryNumber: 5,
					totalEntries: 5,
					nextEntryNeeded: false,
					phase: "conclusion",
					reproducibilityCheck: { attempts: 5, successes: 5 },
				},
			};

			const result = await operation.execute(context);
			expect(result.phase).toBe("conclusion");
			expect(result.nextEntryNeeded).toBe(false);
		});
	});

	describe("Revision Support", () => {
		it("handles revisions correctly", async () => {
			const context1: OperationContext = {
				sessionState,
				parameters: {
					entry: "Initial hypothesis: Temperature is constant",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					phase: "hypothesis",
				},
			};

			await operation.execute(context1);

			const context2: OperationContext = {
				sessionState,
				parameters: {
					entry: "Revised hypothesis: Temperature varies with pressure",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
					isRevision: true,
					revisesEntry: 1,
					phase: "hypothesis",
				},
			};

			const result = await operation.execute(context2);
			expect(result.historyLength).toBe(2); // Both stored
		});
	});

	describe("Tool Description", () => {
		it("provides proper tool description", () => {
			const toolDesc = operation.getToolDescription();

			expect(toolDesc.name).toBe("scientific_method");
			expect(toolDesc.description).toContain("scientific methodology");
			expect(toolDesc.description).toContain("observation");
			expect(toolDesc.description).toContain("hypothesis");
			expect(toolDesc.description).toContain("experiment");

			// Verify required parameters
			expect(toolDesc.inputSchema.required).toContain("entry");
			expect(toolDesc.inputSchema.required).toContain("entryNumber");
			expect(toolDesc.inputSchema.required).toContain("totalEntries");
			expect(toolDesc.inputSchema.required).toContain("nextEntryNeeded");
		});
	});

	describe("Error Handling", () => {
		it("handles errors gracefully", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					// Completely invalid data
					invalid: "data",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toBeTruthy();
		});

		it("provides descriptive error messages", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Valid entry",
					entryNumber: "not a number", // Wrong type
					totalEntries: 5,
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);
			expect(result.error).toContain("entryNumber");
			expect(result.error).toContain("must be a number");
		});
	});
});
