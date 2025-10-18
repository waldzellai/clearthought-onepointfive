/**
 * Causal Analysis Operation - Structured Journal Pattern
 *
 * A structured tool for analyzing causal relationships through iterative reasoning.
 * This tool provides scaffolding for methodical causal inference, enforcing discipline
 * through required parameters while allowing flexibility in approach.
 *
 * Based on the Structured Journal pattern from model-enhancement-mcp
 */
import { BaseOperation } from "../base.js";
export class CausalAnalysisOperation extends BaseOperation {
	name = "causal_analysis";
	category = "analysis";
	entryHistory = [];
	branches = {};
	disableLogging = false;
	causalGraph = { nodes: [], edges: [] };
	constructor() {
		super();
		// Check environment variable for logging control
		this.disableLogging =
			(
				process.env.DISABLE_CAUSAL_LOGGING ||
				process.env.DISABLE_THOUGHT_LOGGING ||
				""
			).toLowerCase() === "true";
	}
	/**
	 * Validate input data with strict type checking and descriptive errors
	 */
	validateData(input) {
		const data = input;
		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string representing the causal reasoning");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current position");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number estimating total entries needed");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error(
				"Invalid nextEntryNeeded: must be a boolean indicating if more entries are needed",
			);
		}
		if (!data.causalRelationship || typeof data.causalRelationship !== "object") {
			throw new Error(
				"Invalid causalRelationship: must be an object with from, to, weight, and reasoning",
			);
		}
		const relationship = data.causalRelationship;
		if (!relationship.from || typeof relationship.from !== "string") {
			throw new Error("Invalid causalRelationship.from: must be a string identifying the cause");
		}
		if (!relationship.to || typeof relationship.to !== "string") {
			throw new Error("Invalid causalRelationship.to: must be a string identifying the effect");
		}
		if (
			typeof relationship.weight !== "number" ||
			relationship.weight < 0 ||
			relationship.weight > 1
		) {
			throw new Error("Invalid causalRelationship.weight: must be a number between 0 and 1");
		}
		if (!relationship.reasoning || typeof relationship.reasoning !== "string") {
			throw new Error(
				"Invalid causalRelationship.reasoning: must be a string explaining the relationship",
			);
		}
		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			totalEntries: data.totalEntries,
			nextEntryNeeded: data.nextEntryNeeded,
			causalRelationship: {
				from: relationship.from,
				to: relationship.to,
				weight: relationship.weight,
				reasoning: relationship.reasoning,
				type: relationship.type,
				confidence: relationship.confidence,
			},
			analysisType: data.analysisType,
			isRevision: data.isRevision,
			revisesEntry: data.revisesEntry,
			branchFromEntry: data.branchFromEntry,
			branchId: data.branchId,
		};
	}
	/**
	 * Format entry for terminal logging with visual indicators
	 */
	formatEntry(data) {
		const {
			entryNumber,
			totalEntries,
			entry,
			causalRelationship,
			analysisType,
			isRevision,
			revisesEntry,
			branchFromEntry,
			branchId,
		} = data;
		let prefix = "";
		let context = "";
		if (isRevision) {
			prefix = "🔄 Revision";
			context = ` (revising entry ${revisesEntry})`;
		} else if (branchFromEntry) {
			prefix = "🌿 Branch";
			context = ` (from entry ${branchFromEntry}, ID: ${branchId})`;
		} else {
			prefix = "🔗 Causal Analysis";
			context = "";
		}
		const typeLabel = analysisType ? ` [${analysisType}]` : "";
		const header = `${prefix} ${entryNumber}/${totalEntries}${typeLabel}${context}`;
		const relationshipLabel = `${causalRelationship.from} → ${causalRelationship.to} (weight: ${causalRelationship.weight.toFixed(2)})`;
		const typeInfo = causalRelationship.type ? ` [${causalRelationship.type}]` : "";
		const confidenceInfo = causalRelationship.confidence
			? ` (confidence: ${causalRelationship.confidence.toFixed(2)})`
			: "";
		const maxWidth = Math.max(
			header.length,
			relationshipLabel.length + typeInfo.length + confidenceInfo.length,
			entry.length,
			causalRelationship.reasoning.length,
		);
		const border = "─".repeat(maxWidth + 4);
		return `
┌${border}┐
│ ${header.padEnd(maxWidth + 2)} │
├${border}┤
│ ${relationshipLabel}${typeInfo}${confidenceInfo.padEnd(maxWidth - relationshipLabel.length - typeInfo.length)} │
├${border}┤
│ Reasoning: ${entry.padEnd(maxWidth - 11)} │
│ ${(" " + causalRelationship.reasoning).padEnd(maxWidth + 2)} │
└${border}┘`;
	}
	/**
	 * Update causal graph with new relationship
	 */
	updateCausalGraph(relationship) {
		// Add nodes if they don't exist
		if (!this.causalGraph.nodes.includes(relationship.from)) {
			this.causalGraph.nodes.push(relationship.from);
		}
		if (!this.causalGraph.nodes.includes(relationship.to)) {
			this.causalGraph.nodes.push(relationship.to);
		}
		// Add edge
		const existingEdge = this.causalGraph.edges.find(
			(edge) => edge.from === relationship.from && edge.to === relationship.to,
		);
		if (existingEdge) {
			// Update existing edge (e.g., for revisions)
			existingEdge.weight = relationship.weight;
			existingEdge.reasoning = relationship.reasoning;
			existingEdge.type = relationship.type;
		} else {
			// Add new edge
			this.causalGraph.edges.push({
				from: relationship.from,
				to: relationship.to,
				weight: relationship.weight,
				reasoning: relationship.reasoning,
				type: relationship.type,
			});
		}
	}
	/**
	 * Compute graph statistics for metadata
	 */
	computeGraphStatistics() {
		const { nodes, edges } = this.causalGraph;
		// Find root causes (no incoming edges)
		const rootCauses = nodes.filter((node) => !edges.some((edge) => edge.to === node));
		// Find final effects (no outgoing edges)
		const finalEffects = nodes.filter((node) => !edges.some((edge) => edge.from === node));
		// Find mediators (both incoming and outgoing edges)
		const mediators = nodes.filter(
			(node) => edges.some((edge) => edge.to === node) && edges.some((edge) => edge.from === node),
		);
		// Find confounders (multiple outgoing edges)
		const confounders = nodes.filter(
			(node) => edges.filter((edge) => edge.from === node).length > 1,
		);
		// Check for cycles
		const hasCycles = this.detectCycles();
		// Calculate average edge weight
		const avgWeight =
			edges.length > 0 ? edges.reduce((sum, edge) => sum + edge.weight, 0) / edges.length : 0;
		return {
			nodeCount: nodes.length,
			edgeCount: edges.length,
			rootCauses,
			finalEffects,
			mediators,
			confounders,
			hasCycles,
			averageEdgeWeight: avgWeight,
		};
	}
	/**
	 * Detect cycles in the causal graph
	 */
	detectCycles() {
		const visited = new Set();
		const recursionStack = new Set();
		const dfs = (node) => {
			if (recursionStack.has(node)) return true;
			if (visited.has(node)) return false;
			visited.add(node);
			recursionStack.add(node);
			const neighbors = this.causalGraph.edges
				.filter((edge) => edge.from === node)
				.map((edge) => edge.to);
			for (const neighbor of neighbors) {
				if (dfs(neighbor)) return true;
			}
			recursionStack.delete(node);
			return false;
		};
		for (const node of this.causalGraph.nodes) {
			if (dfs(node)) return true;
		}
		return false;
	}
	async execute(context) {
		const { parameters } = context;
		try {
			// Validate input data
			const validatedInput = this.validateData({
				entry: parameters.entry,
				entryNumber: parameters.entryNumber,
				totalEntries: parameters.totalEntries,
				nextEntryNeeded: parameters.nextEntryNeeded,
				causalRelationship: parameters.causalRelationship,
				analysisType: parameters.analysisType,
				isRevision: parameters.isRevision,
				revisesEntry: parameters.revisesEntry,
				branchFromEntry: parameters.branchFromEntry,
				branchId: parameters.branchId,
			});
			// Auto-adjust totalEntries if current entry exceeds estimate
			if (validatedInput.entryNumber > validatedInput.totalEntries) {
				validatedInput.totalEntries = validatedInput.entryNumber;
			}
			// Update causal graph
			this.updateCausalGraph(validatedInput.causalRelationship);
			// Store in history
			this.entryHistory.push(validatedInput);
			// Track branches
			if (validatedInput.branchFromEntry && validatedInput.branchId) {
				if (!this.branches[validatedInput.branchId]) {
					this.branches[validatedInput.branchId] = [];
				}
				this.branches[validatedInput.branchId].push(validatedInput);
			}
			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}
			// Compute graph statistics
			const graphStats = this.computeGraphStatistics();
			// Return minimal metadata - NEVER echo the prompt
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				analysisType: validatedInput.analysisType,
				branches: Object.keys(this.branches),
				historyLength: this.entryHistory.length,
				graphStatistics: graphStats,
			});
		} catch (error) {
			return this.createResult({
				error: error instanceof Error ? error.message : String(error),
				status: "failed",
			});
		}
	}
	/**
	 * Tool description that guides AI behavior
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `A structured tool for analyzing causal relationships through iterative reasoning.
This tool helps discover and model cause-and-effect relationships through a flexible analysis process
that can adapt and evolve. Each entry can build on, question, or revise previous insights as
understanding deepens.

This tool provides scaffolding for methodical causal inference, enforcing discipline through required
parameters while allowing flexibility in approach. It does NOT perform the actual causal analysis -
it provides structure for the AI to think step-by-step through complex causal reasoning.

When to use this tool:
- Analyzing cause-and-effect relationships between variables
- Building causal models or diagrams
- Performing intervention analysis (what-if scenarios)
- Conducting counterfactual reasoning
- Identifying confounders and mediators
- Testing causal hypotheses
- Exploring indirect or mediated causal pathways
- Understanding feedback loops and cyclic causation

Key features:
- Build causal graphs iteratively, one relationship at a time
- Adjust totalEntries estimate as understanding evolves
- Revise previous causal relationships when new insights emerge
- Branch to explore alternative causal explanations
- Specify relationship types (direct, indirect, confounded, mediated)
- Track confidence levels for each relationship
- Support multiple analysis types (structure, intervention, counterfactual, mediation)
- Automatic detection of cycles, confounders, mediators, and root causes

Analysis Types:
- structure: Analyze the overall causal graph structure and identify key patterns
- intervention: Analyze what happens when you intervene on a variable (do-operator)
- counterfactual: Reason about what would have happened under different conditions
- mediation: Analyze how effects are transmitted through intermediate variables

Causal Relationship Types:
- direct: A directly causes B with no intermediaries
- indirect: A causes B through one or more mediating variables
- confounded: The relationship between A and B is influenced by a confounder
- mediated: A causes B through a specific mediating mechanism

Parameters explained:
- entry: Your reasoning about why this causal relationship exists or what you're analyzing
- entryNumber: Current entry number in sequence (can exceed initial total if needed)
- totalEntries: Current estimate of entries needed (adjust up/down as you go)
- nextEntryNeeded: True if more analysis is needed, false when complete
- causalRelationship: The causal relationship being analyzed
  * from: The cause/source variable (e.g., "scope_creep")
  * to: The effect/target variable (e.g., "delays")
  * weight: Strength of causal effect (0-1, where 1 is strongest)
  * reasoning: Why you believe this causal relationship exists
  * type: Optional relationship type (direct, indirect, confounded, mediated)
  * confidence: Optional confidence level (0-1)
- analysisType: Optional type of analysis (structure, intervention, counterfactual, mediation)
- isRevision: Boolean indicating if this revises a previous entry
- revisesEntry: If isRevision is true, which entry number is being reconsidered
- branchFromEntry: If branching, which entry number is the branching point
- branchId: Identifier for the current branch (if any)

You should:
1. Start with an initial estimate of relationships to analyze
2. Provide clear reasoning for each causal relationship
3. Assign weights based on the strength of causal influence
4. Revise relationships when new evidence or reasoning emerges
5. Branch to explore alternative causal explanations
6. Specify relationship types and confidence levels when known
7. Use appropriate analysis types for your investigation
8. Build up the causal graph iteratively
9. Set nextEntryNeeded to false only when the causal analysis is complete

Example workflow:
Entry 1: Identify root cause "scope_creep" → "resource_strain" (weight: 0.9)
Entry 2: Identify effect "resource_strain" → "delays" (weight: 0.8)
Entry 3: Identify confounder "poor_planning" → "scope_creep" (weight: 0.7)
Entry 4: Analyze intervention - what if we eliminate scope_creep?
Entry 5: Complete analysis with summary of key insights`,
			inputSchema: {
				type: "object",
				properties: {
					entry: {
						type: "string",
						description: "Your reasoning about the causal relationship being analyzed",
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether another analysis entry is needed",
					},
					entryNumber: {
						type: "integer",
						description: "Current entry number",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total entries needed",
						minimum: 1,
					},
					causalRelationship: {
						type: "object",
						description: "The causal relationship structure",
						properties: {
							from: {
								type: "string",
								description: "The cause/source variable",
							},
							to: {
								type: "string",
								description: "The effect/target variable",
							},
							weight: {
								type: "number",
								description: "Strength of causal effect (0-1)",
								minimum: 0,
								maximum: 1,
							},
							reasoning: {
								type: "string",
								description: "Explanation for why this causal relationship exists",
							},
							type: {
								type: "string",
								description: "Type of causal relationship",
								enum: ["direct", "indirect", "confounded", "mediated"],
							},
							confidence: {
								type: "number",
								description: "Confidence level in this relationship (0-1)",
								minimum: 0,
								maximum: 1,
							},
						},
						required: ["from", "to", "weight", "reasoning"],
					},
					analysisType: {
						type: "string",
						description: "Type of causal analysis",
						enum: ["structure", "intervention", "counterfactual", "mediation"],
					},
					isRevision: {
						type: "boolean",
						description: "Whether this revises previous analysis",
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
				},
				required: ["entry", "nextEntryNeeded", "entryNumber", "totalEntries", "causalRelationship"],
			},
		};
	}
}
// Export singleton instance
export default new CausalAnalysisOperation();
