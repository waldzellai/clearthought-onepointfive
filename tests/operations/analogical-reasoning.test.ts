/**
 * Tests for Analogical Reasoning Operation - Structured Journal Pattern
 */

import { beforeEach, describe, expect, it } from "@jest/globals";
import { SessionStateManager } from "../../src/state/SessionState.js";
import { AnologicalReasoningOperation } from "../../src/tools/operations/analysis/analogical-reasoning.js";
import type { OperationContext } from "../../src/tools/operations/base.js";

describe("AnologicalReasoningOperation - Structured Journal Pattern", () => {
	let operation: AnologicalReasoningOperation;
	let sessionState: SessionStateManager;
	let context: OperationContext;

	beforeEach(() => {
		operation = new AnologicalReasoningOperation();
		sessionState = new SessionStateManager();
		context = {
			sessionState,
			parameters: {},
		};
	});

	describe("Validation", () => {
		it("should require entry parameter", async () => {
			context.parameters = {
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid entry");
		});

		it("should require entryNumber parameter", async () => {
			context.parameters = {
				entry: "Test analogy",
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid entryNumber");
		});

		it("should require totalEntries parameter", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid totalEntries");
		});

		it("should require nextEntryNeeded parameter", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid nextEntryNeeded");
		});

		it("should require analogy object", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid analogy");
		});

		it("should require sourceDomain in analogy", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					targetDomain: "electrical_current",
					mappings: [],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid analogy.sourceDomain");
		});

		it("should require targetDomain in analogy", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					mappings: [],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid analogy.targetDomain");
		});

		it("should require mappings array in analogy", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid analogy.mappings");
		});

		it("should require reasoning in analogy", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [],
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid analogy.reasoning");
		});

		it("should validate mapping structure", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [{ from: "pressure" }], // Missing 'to' and 'strength'
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toMatch(/Invalid mapping\./);
		});

		it("should validate mapping strength range", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [{ from: "pressure", to: "voltage", strength: 1.5 }],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid mapping.strength");
		});

		it("should validate mappingType values", async () => {
			context.parameters = {
				entry: "Test analogy",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [{ from: "pressure", to: "voltage", strength: 0.9, mappingType: "invalid" }],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);
			expect(result.status).toBe("failed");
			expect(result.error).toContain("Invalid mapping.mappingType");
		});
	});

	describe("Execution", () => {
		it("should execute with valid water-electricity analogy", async () => {
			context.parameters = {
				entry: "Water flow is analogous to electrical current",
				entryNumber: 1,
				totalEntries: 3,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "water_flow",
					targetDomain: "electrical_current",
					mappings: [
						{ from: "pressure", to: "voltage", strength: 0.9, mappingType: "role" },
						{ from: "flow_rate", to: "current", strength: 0.95, mappingType: "behavior" },
						{
							from: "pipe_resistance",
							to: "electrical_resistance",
							strength: 0.85,
							mappingType: "constraint",
						},
					],
					reasoning: "Both involve movement of particles through a medium with resistance",
				},
			};

			const result = await operation.execute(context);

			expect(result.status).not.toBe("failed");
			expect(result.entryNumber).toBe(1);
			expect(result.totalEntries).toBe(3);
			expect(result.nextEntryNeeded).toBe(true);
			expect(result.historyLength).toBe(1);
			expect(result.sourceDomain).toBe("water_flow");
			expect(result.targetDomain).toBe("electrical_current");
		});

		it("should calculate metrics correctly", async () => {
			context.parameters = {
				entry: "Test analogy with strong mappings",
				entryNumber: 1,
				totalEntries: 1,
				nextEntryNeeded: false,
				analogy: {
					sourceDomain: "test_source",
					targetDomain: "test_target",
					mappings: [
						{ from: "a", to: "x", strength: 0.9 },
						{ from: "b", to: "y", strength: 0.8 },
						{ from: "c", to: "z", strength: 0.75 },
					],
					reasoning: "test reasoning",
				},
			};

			const result = await operation.execute(context);

			expect(result.metrics).toBeDefined();
			expect(result.metrics.totalMappings).toBe(3);
			expect(result.metrics.averageStrength).toBeCloseTo(0.817, 2);
			expect(result.metrics.strongMappingCount).toBe(2); // strength > 0.7
		});

		it("should generate insights based on mapping strength", async () => {
			context.parameters = {
				entry: "Strong analogy example",
				entryNumber: 1,
				totalEntries: 1,
				nextEntryNeeded: false,
				analogy: {
					sourceDomain: "strong_source",
					targetDomain: "strong_target",
					mappings: [
						{ from: "a", to: "x", strength: 0.95, mappingType: "role" },
						{ from: "b", to: "y", strength: 0.9, mappingType: "structure" },
						{ from: "c", to: "z", strength: 0.85, mappingType: "behavior" },
					],
					reasoning: "Very strong analogy",
				},
			};

			const result = await operation.execute(context);

			expect(result.insights).toBeDefined();
			expect(result.insights.length).toBeGreaterThan(0);
			expect(result.insights[0]).toContain("Strong parallels");
		});

		it("should auto-adjust totalEntries if exceeded", async () => {
			context.parameters = {
				entry: "Entry beyond estimate",
				entryNumber: 5,
				totalEntries: 3,
				nextEntryNeeded: false,
				analogy: {
					sourceDomain: "source",
					targetDomain: "target",
					mappings: [{ from: "a", to: "x", strength: 0.8 }],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);

			expect(result.totalEntries).toBe(5); // Auto-adjusted
		});

		it("should track refinements", async () => {
			// First entry
			context.parameters = {
				entry: "Initial analogy",
				entryNumber: 1,
				totalEntries: 2,
				nextEntryNeeded: true,
				analogy: {
					sourceDomain: "source",
					targetDomain: "target",
					mappings: [{ from: "a", to: "x", strength: 0.5 }],
					reasoning: "weak initial analogy",
				},
			};
			await operation.execute(context);

			// Refinement
			context.parameters = {
				entry: "Refined analogy with stronger mapping",
				entryNumber: 2,
				totalEntries: 2,
				nextEntryNeeded: false,
				analogy: {
					sourceDomain: "source",
					targetDomain: "target",
					mappings: [{ from: "a", to: "x", strength: 0.9 }],
					reasoning: "strengthened analogy",
				},
				isRefinement: true,
				refinesEntry: 1,
			};

			const result = await operation.execute(context);

			expect(result.historyLength).toBe(2);
		});

		it("should convert to legacy format for compatibility", async () => {
			context.parameters = {
				entry: "Test legacy compatibility",
				entryNumber: 1,
				totalEntries: 1,
				nextEntryNeeded: false,
				analogy: {
					sourceDomain: "water",
					targetDomain: "electricity",
					mappings: [{ from: "pressure", to: "voltage", strength: 0.9, mappingType: "role" }],
					reasoning: "test",
				},
			};

			const result = await operation.execute(context);

			expect(result.mappings).toBeDefined();
			expect(Array.isArray(result.mappings)).toBe(true);
			expect(result.mappings.length).toBe(1);
			expect(result.mappings[0].sourceConcept).toContain("water");
			expect(result.mappings[0].targetConcept).toContain("electricity");
		});
	});

	describe("Tool Description", () => {
		it("should provide valid tool description", () => {
			const description = operation.getToolDescription();

			expect(description.name).toBe("analogical_reasoning");
			expect(description.description).toContain("analogies");
			expect(description.inputSchema.type).toBe("object");
			expect(description.inputSchema.properties.entry).toBeDefined();
			expect(description.inputSchema.properties.analogy).toBeDefined();
			expect(description.inputSchema.required).toContain("entry");
			expect(description.inputSchema.required).toContain("analogy");
		});
	});
});
