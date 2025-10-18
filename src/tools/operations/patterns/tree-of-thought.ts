/**
 * Tree of Thought Operation
 *
 * Implements tree-based reasoning with branching exploration, evaluation, and selection
 */

import type { SessionState } from "../../../state/SessionState.js";
import { logger } from "../../../utils/logger.js";
import {
	BaseOperation,
	type NextStepGuidance,
	type OperationContext,
	type OperationResult,
	type ProgressMetadata,
	type ToolDescription,
} from "../base.js";

/**
 * Branch node in the tree
 */
interface BranchNode {
	id: string;
	depth: number;
	parentId: string | null;
	content: string;
	children: string[];
	evaluation?: BranchEvaluation;
}

/**
 * Branch evaluation scores
 */
interface BranchEvaluation {
	feasibility: number; // 1-10
	completeness: number; // 1-10
	innovation: number; // 1-10
	overall: number; // Average
	reasoning: string;
}

/**
 * Tree of Thought state
 */
interface TreeOfThoughtState {
	depth: number; // Max depth to explore
	breadth: number; // Branches per level
	currentDepth: number; // Current depth being explored
	currentPhase: "generation" | "evaluation" | "selection" | "complete";
	branches: BranchNode[];
	evaluations: Map<string, BranchEvaluation>;
	selectedPath: string[];
	branchCounter: number;
}

export class TreeOfThoughtOperation extends BaseOperation {
	name = "tree_of_thought";
	category = "patterns";

	async execute(context: OperationContext): Promise<OperationResult> {
		const { sessionState, prompt, parameters } = context;

		// Get or initialize state
		const state = this.getOrInitializeState(sessionState, parameters);

		// Log operation start
		if (state.currentDepth === 0 && state.currentPhase === "generation") {
			logger.logOperationStart("tree_of_thought", {
				depth: state.depth,
				breadth: state.breadth,
				prompt: prompt.substring(0, 100),
			});
		}

		// Execute current phase
		const result = await this.executePhase(context, state);

		// Update session state with full state
		sessionState.addOperationEntry(
			"tree_of_thought",
			state.currentPhase,
			state as unknown as Record<string, unknown>,
		);

		// Log completion if done
		if (result.status === "completed") {
			logger.logOperationComplete("tree_of_thought", result);
		}

		return result;
	}

	/**
	 * Get or initialize tree state from session
	 */
	private getOrInitializeState(
		sessionState: SessionState,
		parameters: Record<string, unknown>,
	): TreeOfThoughtState {
		const existingState = sessionState.getOperationState("tree_of_thought");

		if (existingState && existingState.data) {
			// Reconstruct Map from plain object if needed
			const data = existingState.data as unknown as TreeOfThoughtState;
			if (data.evaluations && !(data.evaluations instanceof Map)) {
				data.evaluations = new Map(
					Object.entries(data.evaluations as Record<string, BranchEvaluation>),
				);
			}
			return data;
		}

		// Initialize new state
		const depth = this.getParam(parameters, "depth", 3) as number;
		const breadth = this.getParam(parameters, "breadth", 3) as number;

		return {
			depth,
			breadth,
			currentDepth: 0,
			currentPhase: "generation",
			branches: [],
			evaluations: new Map(),
			selectedPath: [],
			branchCounter: 0,
		};
	}

	/**
	 * Execute the current phase of tree exploration
	 */
	private async executePhase(
		context: OperationContext,
		state: TreeOfThoughtState,
	): Promise<OperationResult> {
		switch (state.currentPhase) {
			case "generation":
				return this.handleBranchGeneration(context, state);
			case "evaluation":
				return this.handleBranchEvaluation(context, state);
			case "selection":
				return this.handleBranchSelection(context, state);
			case "complete":
				return this.handleCompletion(context, state);
			default:
				throw new Error(`Unknown phase: ${state.currentPhase}`);
		}
	}

	/**
	 * Handle branch generation phase
	 */
	private handleBranchGeneration(
		context: OperationContext,
		state: TreeOfThoughtState,
	): OperationResult {
		const branchesAtCurrentDepth = state.branches.filter((b) => b.depth === state.currentDepth);

		// Check if we have submitted branches
		const submittedBranches = this.getParam(context.parameters, "branches", []) as string[];

		if (submittedBranches.length > 0) {
			// Process submitted branches
			for (const branchContent of submittedBranches) {
				const branchId = `branch_${state.branchCounter++}`;
				const parentId = state.currentDepth > 0 ? state.selectedPath[state.currentDepth - 1] : null;

				state.branches.push({
					id: branchId,
					depth: state.currentDepth,
					parentId,
					content: branchContent,
					children: [],
				});

				// Update parent's children
				if (parentId) {
					const parent = state.branches.find((b) => b.id === parentId);
					if (parent) {
						parent.children.push(branchId);
					}
				}
			}

			logger.logStep(
				"tree_of_thought",
				state.currentDepth * 2 + 1,
				state.depth * 2,
				`Generated ${submittedBranches.length} branches at depth ${state.currentDepth}`,
			);

			// Move to evaluation phase
			state.currentPhase = "evaluation";
			return this.handleBranchEvaluation(context, state);
		}

		// Request branch generation
		logger.logStep(
			"tree_of_thought",
			state.currentDepth * 2,
			state.depth * 2,
			`Requesting ${state.breadth} branches at depth ${state.currentDepth}`,
		);

		return {
			operation: "tree_of_thought",
			progress: this.getProgress(context.sessionState),
			nextStep: {
				action: "generate_branches",
				prompt: `Generate ${state.breadth} distinct approaches to: ${context.prompt}

For each branch, provide:
1. Approach description (2-3 sentences)
2. Key assumptions
3. Expected outcome

Each branch should explore a meaningfully different direction.

Return your response as a JSON array of strings, where each string is a complete branch description.`,
				parameters: {
					branches: [],
					expectedCount: state.breadth,
				},
			},
			sessionContext: {
				sessionId: context.sessionState.sessionId,
				operationHistory: context.sessionState.getOperationHistoryStrings(),
				remainingBudget: context.sessionState.getRemainingThoughts(),
			},
			status: "requires_input",
		};
	}

	/**
	 * Handle branch evaluation phase
	 */
	private handleBranchEvaluation(
		context: OperationContext,
		state: TreeOfThoughtState,
	): OperationResult {
		const branchesAtDepth = state.branches.filter((b) => b.depth === state.currentDepth);

		// Check if we have submitted evaluations
		const submittedEvaluations = this.getParam(context.parameters, "evaluations", []) as Array<{
			branchId: string;
			feasibility: number;
			completeness: number;
			innovation: number;
			reasoning: string;
		}>;

		if (submittedEvaluations.length > 0) {
			// Process submitted evaluations
			for (const evaluation of submittedEvaluations) {
				const overall =
					(evaluation.feasibility + evaluation.completeness + evaluation.innovation) / 3;
				state.evaluations.set(evaluation.branchId, {
					feasibility: evaluation.feasibility,
					completeness: evaluation.completeness,
					innovation: evaluation.innovation,
					overall,
					reasoning: evaluation.reasoning,
				});

				// Update branch with evaluation
				const branch = state.branches.find((b) => b.id === evaluation.branchId);
				if (branch) {
					branch.evaluation = state.evaluations.get(evaluation.branchId);
				}
			}

			logger.logStep(
				"tree_of_thought",
				state.currentDepth * 2 + 2,
				state.depth * 2,
				`Evaluated ${submittedEvaluations.length} branches`,
			);

			// Move to selection phase
			state.currentPhase = "selection";
			return this.handleBranchSelection(context, state);
		}

		// Request evaluations
		logger.logStep(
			"tree_of_thought",
			state.currentDepth * 2 + 1,
			state.depth * 2,
			`Requesting evaluation of ${branchesAtDepth.length} branches`,
		);

		return {
			operation: "tree_of_thought",
			progress: this.getProgress(context.sessionState),
			nextStep: {
				action: "evaluate_branches",
				prompt: `Evaluate each of the following branches on three dimensions (1-10 scale):

${branchesAtDepth
	.map(
		(b, i) => `Branch ${i + 1} (ID: ${b.id}):
${b.content}
`,
	)
	.join("\n")}

For each branch, provide:
1. Feasibility (1-10): Can this approach actually be implemented?
2. Completeness (1-10): Does this address the full problem?
3. Innovation (1-10): How novel/creative is this approach?
4. Reasoning: Brief explanation (1-2 sentences)

Return as JSON array: [{ branchId, feasibility, completeness, innovation, reasoning }, ...]`,
				parameters: {
					evaluations: [],
					branches: branchesAtDepth.map((b) => ({ id: b.id, content: b.content })),
				},
			},
			sessionContext: {
				sessionId: context.sessionState.sessionId,
				operationHistory: context.sessionState.getOperationHistoryStrings(),
				remainingBudget: context.sessionState.getRemainingThoughts(),
			},
			status: "requires_input",
		};
	}

	/**
	 * Handle branch selection phase
	 */
	private handleBranchSelection(
		context: OperationContext,
		state: TreeOfThoughtState,
	): OperationResult {
		const branchesAtDepth = state.branches.filter((b) => b.depth === state.currentDepth);

		// Rank branches by evaluation score
		const rankedBranches = branchesAtDepth
			.filter((b) => b.evaluation)
			.sort((a, b) => (b.evaluation?.overall || 0) - (a.evaluation?.overall || 0));

		// Select top branches for next depth
		const topCount = Math.ceil(state.breadth / 2);
		const topBranches = rankedBranches.slice(0, topCount);

		// Check if user has selected branches to continue
		const selectedBranches = this.getParam(context.parameters, "selectedBranches", []) as string[];

		if (selectedBranches.length > 0) {
			// Add selected branches to path
			for (const branchId of selectedBranches) {
				state.selectedPath.push(branchId);
			}

			// Move to next depth or complete
			state.currentDepth++;
			if (state.currentDepth >= state.depth) {
				state.currentPhase = "complete";
				return this.handleCompletion(context, state);
			}

			state.currentPhase = "generation";
			return this.handleBranchGeneration(context, state);
		}

		// Request selection
		logger.logStep(
			"tree_of_thought",
			state.currentDepth * 2 + 2,
			state.depth * 2,
			`Select top ${topCount} branches for depth ${state.currentDepth + 1}`,
		);

		return {
			operation: "tree_of_thought",
			progress: this.getProgress(context.sessionState),
			nextStep: {
				action: "select_branches",
				prompt: `Based on evaluations, select the top ${topCount} branches to explore further:

${topBranches
	.map(
		(b, i) => `${i + 1}. ${b.id}: ${b.content.substring(0, 100)}...
   Feasibility: ${b.evaluation?.feasibility}/10
   Completeness: ${b.evaluation?.completeness}/10
   Innovation: ${b.evaluation?.innovation}/10
   Overall: ${b.evaluation?.overall.toFixed(1)}/10
   ${b.evaluation?.reasoning}
`,
	)
	.join("\n")}

Return the IDs of branches to explore as JSON array: ["branch_id_1", "branch_id_2", ...]`,
				parameters: {
					selectedBranches: [],
					topBranches: topBranches.map((b) => ({
						id: b.id,
						content: b.content,
						score: b.evaluation?.overall,
					})),
				},
			},
			sessionContext: {
				sessionId: context.sessionState.sessionId,
				operationHistory: context.sessionState.getOperationHistoryStrings(),
				remainingBudget: context.sessionState.getRemainingThoughts(),
			},
			status: "requires_input",
		};
	}

	/**
	 * Handle completion phase
	 */
	private handleCompletion(context: OperationContext, state: TreeOfThoughtState): OperationResult {
		// Find the best path through the tree
		const bestPath = this.findBestPath(state);

		logger.logStep(
			"tree_of_thought",
			state.depth * 2,
			state.depth * 2,
			`Exploration complete. Best path: ${bestPath.map((b) => b.id).join(" → ")}`,
		);

		return {
			operation: "tree_of_thought",
			progress: this.getProgress(context.sessionState),
			nextStep: {
				action: "complete",
				prompt: "Tree exploration complete. Use the best path for your solution.",
			},
			sessionContext: {
				sessionId: context.sessionState.sessionId,
				operationHistory: context.sessionState.getOperationHistoryStrings(),
				remainingBudget: context.sessionState.getRemainingThoughts(),
			},
			status: "completed",
			bestPath: bestPath.map((b) => ({
				id: b.id,
				depth: b.depth,
				content: b.content,
				evaluation: b.evaluation,
			})),
			totalBranches: state.branches.length,
			exploredDepth: state.currentDepth,
		};
	}

	/**
	 * Find the best path through the tree based on evaluations
	 */
	private findBestPath(state: TreeOfThoughtState): BranchNode[] {
		const path: BranchNode[] = [];

		// Start from depth 0
		for (let depth = 0; depth < state.currentDepth; depth++) {
			const branchesAtDepth = state.branches.filter((b) => b.depth === depth);

			// Filter by parent if we have a path
			const candidates =
				path.length > 0
					? branchesAtDepth.filter((b) => b.parentId === path[path.length - 1].id)
					: branchesAtDepth;

			// Find best evaluated branch
			const best = candidates
				.filter((b) => b.evaluation)
				.sort((a, b) => (b.evaluation?.overall || 0) - (a.evaluation?.overall || 0))[0];

			if (best) {
				path.push(best);
			}
		}

		return path;
	}

	/**
	 * Get progress metadata
	 */
	getProgress(sessionState: SessionState): ProgressMetadata {
		const state = this.getOrInitializeState(sessionState, {});

		// Calculate steps: generation=0, evaluation=1, selection=2 per depth
		let stepsCompleted = state.currentDepth * 2;
		if (state.currentPhase === "evaluation") {
			stepsCompleted += 1;
		} else if (state.currentPhase === "selection") {
			stepsCompleted += 2;
		}
		const stepsRequired = state.depth * 2;

		return {
			stepsCompleted,
			stepsRequired,
			currentPhase: state.currentPhase,
			phaseSpecificMetrics: {
				currentDepth: state.currentDepth,
				totalBranches: state.branches.length,
				evaluatedBranches: state.evaluations.size,
			},
		};
	}

	/**
	 * Get next step guidance
	 */
	getNextStep(sessionState: SessionState): NextStepGuidance {
		const state = this.getOrInitializeState(sessionState, {});

		switch (state.currentPhase) {
			case "generation":
				return {
					action: "generate_branches",
					prompt: `Generate ${state.breadth} distinct branches at depth ${state.currentDepth}`,
				};
			case "evaluation":
				return {
					action: "evaluate_branches",
					prompt: "Evaluate the generated branches on feasibility, completeness, and innovation",
				};
			case "selection":
				return {
					action: "select_branches",
					prompt: "Select the top branches to explore further",
				};
			case "complete":
				return {
					action: "complete",
					prompt: "Tree exploration complete",
				};
			default:
				return {
					action: "unknown",
					prompt: "Unknown phase",
				};
		}
	}

	/**
	 * Get tool description for MCP registration
	 */
	getToolDescription(): ToolDescription {
		return {
			name: "tree_of_thought",
			description:
				"Systematic tree-based exploration with branching, evaluation, and selection. Guides AI through generating multiple approaches, evaluating them on feasibility/completeness/innovation, and selecting the best paths to explore further.",
			inputSchema: {
				type: "object",
				properties: {
					prompt: {
						type: "string",
						description: "The problem or question to explore",
					},
					depth: {
						type: "number",
						description: "Maximum depth of tree exploration (default: 3)",
						default: 3,
					},
					breadth: {
						type: "number",
						description: "Number of branches to generate at each level (default: 3)",
						default: 3,
					},
					branches: {
						type: "array",
						description: "Submitted branch descriptions (for generation phase)",
						items: { type: "string" },
					},
					evaluations: {
						type: "array",
						description: "Submitted branch evaluations (for evaluation phase)",
						items: {
							type: "object",
							properties: {
								branchId: { type: "string" },
								feasibility: { type: "number" },
								completeness: { type: "number" },
								innovation: { type: "number" },
								reasoning: { type: "string" },
							},
						},
					},
					selectedBranches: {
						type: "array",
						description: "Selected branch IDs to explore further (for selection phase)",
						items: { type: "string" },
					},
				},
				required: ["prompt"],
			},
		};
	}
}

export default new TreeOfThoughtOperation();
