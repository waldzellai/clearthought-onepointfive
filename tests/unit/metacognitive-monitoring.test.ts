/**
 * Unit tests for Metacognitive Monitoring Operation - Structured Journal Pattern
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MetacognitiveMonitoringOperation } from "../../src/tools/operations/core/metacognitive-monitoring.js";
import { SessionState } from "../../src/state/SessionState.js";
import type { OperationContext } from "../../src/tools/operations/base.js";

describe("MetacognitiveMonitoring Structured Journal", () => {
	let operation: MetacognitiveMonitoringOperation;
	let sessionState: SessionState;

	beforeEach(() => {
		operation = new MetacognitiveMonitoringOperation();
		sessionState = new SessionState("test-session", {
			maxSteps: 100,
			debug: false,
			telemetryProvider: "none" as any,
			telemetryEndpointEnv: "",
			telemetryTokenEnv: "",
		});
	});

	describe("Parameter Validation", () => {
		it("should validate required parameters", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entry");
		});

		it("should reject missing entryNumber", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Reflecting on my approach",
					totalEntries: 5,
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid entryNumber");
		});

		it("should reject missing totalEntries", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Reflecting on my approach",
					entryNumber: 1,
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid totalEntries");
		});

		it("should reject missing nextEntryNeeded", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Reflecting on my approach",
					entryNumber: 1,
					totalEntries: 5,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toContain("Invalid nextEntryNeeded");
		});

		it("should validate confidence range", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Reflecting on my approach",
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
					confidence: 1.5, // Invalid: > 1
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toContain("confidence: must be a number between 0 and 1");
		});

		it("should validate biasCheck is array of strings", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Reflecting on my approach",
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
					biasCheck: [123, 456], // Invalid: not strings
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toContain("biasCheck: must be an array of strings");
		});
	});

	describe("Entry Storage", () => {
		it("should store entries in history", async () => {
			const context1: OperationContext = {
				sessionState,
				parameters: {
					entry: "First reflection",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			};

			const result1 = await operation.execute(context1);
			expect(result1.status).toBe("success");
			expect(result1.historyLength).toBe(1);

			const context2: OperationContext = {
				sessionState,
				parameters: {
					entry: "Second reflection",
					entryNumber: 2,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			};

			const result2 = await operation.execute(context2);
			expect(result2.status).toBe("success");
			expect(result2.historyLength).toBe(2);
		});

		it("should auto-adjust totalEntries", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Exceeded estimate",
					entryNumber: 10,
					totalEntries: 5, // Will be adjusted to 10
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("success");
			expect(result.totalEntries).toBe(10);
		});
	});

	describe("Branch Tracking", () => {
		it("should track branches correctly", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Exploring alternative perspective",
					entryNumber: 3,
					totalEntries: 5,
					nextEntryNeeded: true,
					branchFromEntry: 2,
					branchId: "alternative-bias-check",
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("success");
			expect(result.branches).toContain("alternative-bias-check");
		});

		it("should track multiple branches", async () => {
			const context1: OperationContext = {
				sessionState,
				parameters: {
					entry: "Branch A",
					entryNumber: 2,
					totalEntries: 5,
					nextEntryNeeded: true,
					branchFromEntry: 1,
					branchId: "branch-a",
				},
			};

			await operation.execute(context1);

			const context2: OperationContext = {
				sessionState,
				parameters: {
					entry: "Branch B",
					entryNumber: 2,
					totalEntries: 5,
					nextEntryNeeded: true,
					branchFromEntry: 1,
					branchId: "branch-b",
				},
			};

			const result = await operation.execute(context2);

			expect(result.status).toBe("success");
			expect(result.branches).toHaveLength(2);
			expect(result.branches).toContain("branch-a");
			expect(result.branches).toContain("branch-b");
		});
	});

	describe("Minimal Metadata Response", () => {
		it("should return metadata only, not content", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "This is a long reflection about my thinking process and biases",
					entryNumber: 1,
					totalEntries: 5,
					nextEntryNeeded: true,
					confidence: 0.7,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("success");
			// Should NOT include the entry content
			expect(result).not.toHaveProperty("entry");
			// Should include metadata
			expect(result.entryNumber).toBe(1);
			expect(result.totalEntries).toBe(5);
			expect(result.nextEntryNeeded).toBe(true);
			expect(result.confidence).toBe(0.7);
			expect(result.historyLength).toBe(1);

			// Response should be minimal (< 100 tokens)
			const responseText = JSON.stringify(result);
			const approximateTokens = responseText.length / 4; // Rough estimate
			expect(approximateTokens).toBeLessThan(100);
		});

		it("should include confidence in metadata when provided", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "High confidence reflection",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					confidence: 0.9,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("success");
			expect(result.confidence).toBe(0.9);
		});
	});

	describe("Confidence KPI Tracking", () => {
		it("should update confidence KPI when confidence is provided", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Confident reflection",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
					confidence: 0.85,
				},
			};

			await operation.execute(context);

			const kpis = sessionState.getKPIs();
			const confidenceKPI = kpis.find((kpi) => kpi.name === "metacognitive_confidence");

			expect(confidenceKPI).toBeDefined();
			expect(confidenceKPI?.value).toBe(0.85);
		});

		it("should not update KPI when confidence is not provided", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "No confidence specified",
					entryNumber: 1,
					totalEntries: 3,
					nextEntryNeeded: true,
				},
			};

			await operation.execute(context);

			const kpis = sessionState.getKPIs();
			const confidenceKPI = kpis.find((kpi) => kpi.name === "metacognitive_confidence");

			expect(confidenceKPI).toBeUndefined();
		});
	});

	describe("Error Handling", () => {
		it("should handle errors gracefully", async () => {
			const context: OperationContext = {
				sessionState,
				parameters: {
					entry: "Valid entry",
					entryNumber: "invalid", // Invalid type
					totalEntries: 5,
					nextEntryNeeded: true,
				},
			};

			const result = await operation.execute(context);

			expect(result.status).toBe("error");
			expect(result.error).toBeDefined();
			expect(typeof result.error).toBe("string");
		});
	});

	describe("Tool Description", () => {
		it("should provide comprehensive tool description", () => {
			const description = operation.getToolDescription();

			expect(description.name).toBe("metacognitive_monitoring");
			expect(description.description).toContain("metacognitive");
			expect(description.description).toContain("evaluate");
			expect(description.description).toContain("biases");
			expect(description.description).toContain("confidence");
		});

		it("should define proper input schema", () => {
			const description = operation.getToolDescription();

			expect(description.inputSchema.type).toBe("object");
			expect(description.inputSchema.required).toContain("entry");
			expect(description.inputSchema.required).toContain("entryNumber");
			expect(description.inputSchema.required).toContain("totalEntries");
			expect(description.inputSchema.required).toContain("nextEntryNeeded");

			// Check optional fields
			expect(description.inputSchema.properties).toHaveProperty("confidence");
			expect(description.inputSchema.properties).toHaveProperty("biasCheck");
			expect(description.inputSchema.properties).toHaveProperty("awareness");
			expect(description.inputSchema.properties).toHaveProperty("evaluation");
		});
	});
});
