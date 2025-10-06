import { describe, expect, it, beforeEach } from "vitest";
import { SessionState } from "../../src/state/SessionState.js";
import { ServerConfigSchema } from "../../src/config.js";
import { TreeOfThoughtOperation } from "../../src/tools/operations/patterns/tree-of-thought.js";

describe("TreeOfThought Operation", () => {
	let sessionState: SessionState;
	let operation: TreeOfThoughtOperation;

	beforeEach(() => {
		const config = ServerConfigSchema.parse({});
		sessionState = new SessionState("test-session", config);
		operation = new TreeOfThoughtOperation();
	});

	it("should initialize with generation phase", async () => {
		const result = await operation.execute({
			sessionState,
			prompt: "How can we solve climate change?",
			parameters: {
				depth: 3,
				breadth: 3,
			},
		});

		expect(result.operation).toBe("tree_of_thought");
		expect(result.status).toBe("requires_input");
		expect(result.nextStep.action).toBe("generate_branches");
		expect(result.progress.currentPhase).toBe("generation");
		expect(result.progress.stepsCompleted).toBe(0);
		expect(result.progress.stepsRequired).toBe(6); // depth * 2
	});

	it("should accept branch submissions and move to evaluation", async () => {
		// First call - request branches
		await operation.execute({
			sessionState,
			prompt: "How can we solve climate change?",
			parameters: { depth: 2, breadth: 3 },
		});

		// Second call - submit branches
		const result = await operation.execute({
			sessionState,
			prompt: "How can we solve climate change?",
			parameters: {
				depth: 2,
				breadth: 3,
				branches: [
					"Approach 1: Renewable energy transition",
					"Approach 2: Carbon capture technology",
					"Approach 3: Reforestation programs",
				],
			},
		});

		expect(result.status).toBe("requires_input");
		expect(result.nextStep.action).toBe("evaluate_branches");
		expect(result.progress.currentPhase).toBe("evaluation");
	});

	it("should accept evaluations and move to selection", async () => {
		// Initialize and submit branches
		await operation.execute({
			sessionState,
			prompt: "Test problem",
			parameters: { depth: 2, breadth: 2 },
		});

		await operation.execute({
			sessionState,
			prompt: "Test problem",
			parameters: {
				depth: 2,
				breadth: 2,
				branches: ["Branch 1", "Branch 2"],
			},
		});

		// Submit evaluations
		const result = await operation.execute({
			sessionState,
			prompt: "Test problem",
			parameters: {
				depth: 2,
				breadth: 2,
				evaluations: [
					{
						branchId: "branch_0",
						feasibility: 8,
						completeness: 7,
						innovation: 6,
						reasoning: "Good approach",
					},
					{
						branchId: "branch_1",
						feasibility: 6,
						completeness: 8,
						innovation: 9,
						reasoning: "Very innovative",
					},
				],
			},
		});

		expect(result.status).toBe("requires_input");
		expect(result.nextStep.action).toBe("select_branches");
		expect(result.progress.currentPhase).toBe("selection");
	});

	it("should track progress correctly through phases", async () => {
		// Phase 1: Generation
		const gen1 = await operation.execute({
			sessionState,
			prompt: "Test",
			parameters: { depth: 2, breadth: 2 },
		});
		expect(gen1.progress.stepsCompleted).toBe(0);

		// Submit branches
		const eval1 = await operation.execute({
			sessionState,
			prompt: "Test",
			parameters: {
				depth: 2,
				breadth: 2,
				branches: ["B1", "B2"],
			},
		});
		expect(eval1.progress.stepsCompleted).toBe(1);
		expect(eval1.progress.currentPhase).toBe("evaluation");

		// Submit evaluations
		const sel1 = await operation.execute({
			sessionState,
			prompt: "Test",
			parameters: {
				depth: 2,
				breadth: 2,
				evaluations: [
					{ branchId: "branch_0", feasibility: 8, completeness: 7, innovation: 6, reasoning: "Good" },
					{ branchId: "branch_1", feasibility: 7, completeness: 8, innovation: 7, reasoning: "Better" },
				],
			},
		});
		expect(sel1.progress.stepsCompleted).toBe(2);
		expect(sel1.progress.currentPhase).toBe("selection");
	});

	it("should provide proper tool description", () => {
		const description = operation.getToolDescription();

		expect(description.name).toBe("tree_of_thought");
		expect(description.description).toContain("tree-based exploration");
		expect(description.inputSchema.properties).toHaveProperty("prompt");
		expect(description.inputSchema.properties).toHaveProperty("depth");
		expect(description.inputSchema.properties).toHaveProperty("breadth");
		expect(description.inputSchema.properties).toHaveProperty("branches");
		expect(description.inputSchema.properties).toHaveProperty("evaluations");
		expect(description.inputSchema.properties).toHaveProperty("selectedBranches");
	});

	it("should provide next step guidance based on current phase", () => {
		const guidance = operation.getNextStep(sessionState);

		expect(guidance.action).toBe("generate_branches");
		expect(guidance.prompt).toContain("Generate");
	});

	it("should track operation history in session state", async () => {
		await operation.execute({
			sessionState,
			prompt: "Test",
			parameters: { depth: 1, breadth: 2 },
		});

		const history = sessionState.getOperationHistoryStrings();
		expect(history.length).toBeGreaterThan(0);
		expect(history.some((h) => h.includes("tree_of_thought"))).toBe(true);
	});
});

