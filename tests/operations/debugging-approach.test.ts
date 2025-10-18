/**
 * Tests for DebuggingApproachOperation - Structured Journal Pattern
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { OperationContext } from "../../src/tools/operations/base.js";
import { DebuggingApproachOperation } from "../../src/tools/operations/core/debugging-approach.js";

describe("DebuggingApproachOperation - Structured Journal", () => {
	let operation: DebuggingApproachOperation;
	let context: OperationContext;

	beforeEach(() => {
		operation = new DebuggingApproachOperation();
		context = {
			sessionState: {
				sessionId: "test-session",
				addDebuggingSession: () => {},
				getDebuggingSessions: () => [],
			} as any,
			prompt: "Test debugging prompt",
			parameters: {},
		};
	});

	describe("Parameter Validation", () => {
		it("validates required parameters", async () => {
			context.parameters = {
				entry: "Checking database connection",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("success");
		});

		it("throws error for missing entry", async () => {
			context.parameters = {
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result).toHaveProperty("error");
			expect(result.error).toContain("Invalid entry");
		});

		it("throws error for missing entryNumber", async () => {
			context.parameters = {
				entry: "Test step",
				totalEntries: 5,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entryNumber");
		});

		it("throws error for missing totalEntries", async () => {
			context.parameters = {
				entry: "Test step",
				entryNumber: 1,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid totalEntries");
		});

		it("throws error for missing nextEntryNeeded", async () => {
			context.parameters = {
				entry: "Test step",
				entryNumber: 1,
				totalEntries: 5,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid nextEntryNeeded");
		});

		it("validates approach parameter type", async () => {
			context.parameters = {
				entry: "Binary search for error",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
				approach: "binary_search",
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("success");
			expect(result.approach).toBe("binary_search");
		});

		it("throws error for invalid approach type", async () => {
			context.parameters = {
				entry: "Test step",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
				approach: 123, // Invalid: number instead of string
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid approach");
		});
	});

	describe("Storage and History", () => {
		it("stores entries in history", async () => {
			// First entry
			context.parameters = {
				entry: "Step 1: Check logs",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
			};
			let result = await operation.execute(context);
			expect(result.historyLength).toBe(1);

			// Second entry
			context.parameters = {
				entry: "Step 2: Verify configuration",
				entryNumber: 2,
				totalEntries: 3,
				nextEntryNeeded: true,
			};
			result = await operation.execute(context);
			expect(result.historyLength).toBe(2);

			// Third entry
			context.parameters = {
				entry: "Step 3: Test fix",
				entryNumber: 3,
				totalEntries: 3,
				nextEntryNeeded: false,
			};
			result = await operation.execute(context);
			expect(result.historyLength).toBe(3);
		});

		it("auto-adjusts totalEntries when exceeded", async () => {
			context.parameters = {
				entry: "Unexpected complexity found",
				entryNumber: 8,
				totalEntries: 5,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.totalEntries).toBe(8);
		});
	});

	describe("Branching", () => {
		it("tracks branches correctly", async () => {
			// Main path
			context.parameters = {
				entry: "Main investigation path",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
			};
			await operation.execute(context);

			// Branch from entry 1
			context.parameters = {
				entry: "Alternative hypothesis",
				entryNumber: 2,
				totalEntries: 3,
				nextEntryNeeded: true,
				branchFromEntry: 1,
				branchId: "alternative-1",
			};
			const result = await operation.execute(context);

			expect(result.branches).toContain("alternative-1");
			expect(result.historyLength).toBe(2);
		});

		it("stores multiple entries in same branch", async () => {
			// Branch entry 1
			context.parameters = {
				entry: "Branch step 1",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				branchFromEntry: 1,
				branchId: "branch-a",
			};
			await operation.execute(context);

			// Branch entry 2
			context.parameters = {
				entry: "Branch step 2",
				entryNumber: 2,
				totalEntries: 3,
				nextEntryNeeded: false,
				branchFromEntry: 1,
				branchId: "branch-a",
			};
			const result = await operation.execute(context);

			expect(result.branches).toContain("branch-a");
			expect(result.historyLength).toBe(2);
		});
	});

	describe("Minimal Response", () => {
		it("returns only metadata without prompt echoing", async () => {
			context.parameters = {
				entry: "Debugging step with detailed description and findings",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
				approach: "root_cause",
				findings: "Database connection timeout",
			};

			const result = await operation.execute(context);

			// Check metadata fields
			expect(result).toHaveProperty("entryNumber");
			expect(result).toHaveProperty("totalEntries");
			expect(result).toHaveProperty("nextEntryNeeded");
			expect(result).toHaveProperty("approach");
			expect(result).toHaveProperty("findings");
			expect(result).toHaveProperty("branches");
			expect(result).toHaveProperty("historyLength");

			// Should NOT echo the entry content
			expect(result).not.toHaveProperty("entry");

			// Verify response is minimal
			const responseText = JSON.stringify(result);
			const tokenEstimate = responseText.length / 4; // Rough estimate: 4 chars per token
			expect(tokenEstimate).toBeLessThan(100);
		});

		it("includes approach and findings in metadata", async () => {
			context.parameters = {
				entry: "Binary search investigation",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
				approach: "binary_search",
				findings: "Error occurs in authentication module",
			};

			const result = await operation.execute(context);
			expect(result.approach).toBe("binary_search");
			expect(result.findings).toBe("Error occurs in authentication module");
		});
	});

	describe("Revisions", () => {
		it("handles revision parameters", async () => {
			// Original entry
			context.parameters = {
				entry: "Initial hypothesis",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
			};
			await operation.execute(context);

			// Revision
			context.parameters = {
				entry: "Revised hypothesis based on new evidence",
				entryNumber: 2,
				totalEntries: 5,
				nextEntryNeeded: true,
				isRevision: true,
				revisesEntry: 1,
			};
			const result = await operation.execute(context);

			expect(result.historyLength).toBe(2);
		});
	});

	describe("Error Handling", () => {
		it("returns error response for invalid data", async () => {
			context.parameters = {
				entry: "Valid entry",
				entryNumber: "invalid", // Should be number
				totalEntries: 5,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result).toHaveProperty("error");
		});

		it("provides descriptive error messages", async () => {
			context.parameters = {
				entry: 123, // Invalid: should be string
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entry");
			expect(result.error).toContain("must be a string");
		});
	});

	describe("Debugging Approaches", () => {
		it("supports binary search approach", async () => {
			context.parameters = {
				entry: "Testing middle of code path",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				approach: "binary_search",
			};

			const result = await operation.execute(context);
			expect(result.approach).toBe("binary_search");
		});

		it("supports root cause analysis", async () => {
			context.parameters = {
				entry: "Investigating root cause",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
				approach: "root_cause",
			};

			const result = await operation.execute(context);
			expect(result.approach).toBe("root_cause");
		});

		it("supports rubber duck debugging", async () => {
			context.parameters = {
				entry: "Explaining problem step by step",
				entryNumber: 1,
				totalEntries: 4,
				nextEntryNeeded: true,
				approach: "rubber_duck",
			};

			const result = await operation.execute(context);
			expect(result.approach).toBe("rubber_duck");
		});

		it("supports five whys approach", async () => {
			context.parameters = {
				entry: "Why did the error occur?",
				entryNumber: 1,
				totalEntries: 5,
				nextEntryNeeded: true,
				approach: "five_whys",
			};

			const result = await operation.execute(context);
			expect(result.approach).toBe("five_whys");
		});
	});
});
