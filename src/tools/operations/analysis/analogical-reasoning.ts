/**
 * Analogical Reasoning Operation - Structured Journal Pattern
 *
 * A structured tool for finding and applying analogies to understand complex problems
 * through familiar domains. This tool provides scaffolding for analogical thinking,
 * enforcing discipline through required parameters while allowing flexibility in approach.
 *
 * The AI discovers and refines analogical mappings, while the server tracks and validates them.
 */

import type { AnalogyMapping } from "../../../types/index.js";
import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

export interface AnalogyEntry {
	entry: string; // The analogy description or insight
	entryNumber: number;
	totalEntries: number;
	nextEntryNeeded: boolean;
	analogy: {
		sourceDomain: string;
		targetDomain: string;
		mappings: Array<{
			from: string;
			to: string;
			strength: number; // 0.0-1.0
			mappingType?: "role" | "structure" | "behavior" | "constraint";
		}>;
		reasoning: string;
	};
	isRefinement?: boolean;
	refinesEntry?: number;
}

export class AnalogicalReasoningOperation extends BaseOperation {
	name = "analogical_reasoning";
	category = "analysis";

	private disableLogging = false;

	constructor() {
		super();
		// Check environment variable for logging control
		this.disableLogging = (process.env.DISABLE_ANALOGY_LOGGING || "").toLowerCase() === "true";
	}

	/**
	 * Validate input data with strict type checking and descriptive errors
	 */
	private validateData(input: unknown): AnalogyEntry {
		const data = input as Record<string, unknown>;

		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing the analogy or insight");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current position");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number estimating total analogies needed");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error(
				"Invalid nextEntryNeeded: must be a boolean indicating if more analogies are needed",
			);
		}

		// Validate analogy structure
		const analogy = data.analogy as Record<string, unknown>;
		if (!analogy || typeof analogy !== "object") {
			throw new Error(
				"Invalid analogy: must be an object with sourceDomain, targetDomain, mappings, and reasoning",
			);
		}
		if (!analogy.sourceDomain || typeof analogy.sourceDomain !== "string") {
			throw new Error("Invalid analogy.sourceDomain: must be a string (e.g., 'water_flow')");
		}
		if (!analogy.targetDomain || typeof analogy.targetDomain !== "string") {
			throw new Error(
				"Invalid analogy.targetDomain: must be a string (e.g., 'electrical_current')",
			);
		}
		if (!Array.isArray(analogy.mappings)) {
			throw new Error("Invalid analogy.mappings: must be an array of mapping objects");
		}
		if (!analogy.reasoning || typeof analogy.reasoning !== "string") {
			throw new Error("Invalid analogy.reasoning: must be a string explaining the analogy");
		}

		// Validate each mapping
		for (const mapping of analogy.mappings as Array<Record<string, unknown>>) {
			if (!mapping.from || typeof mapping.from !== "string") {
				throw new Error("Invalid mapping.from: must be a string");
			}
			if (!mapping.to || typeof mapping.to !== "string") {
				throw new Error("Invalid mapping.to: must be a string");
			}
			if (typeof mapping.strength !== "number" || mapping.strength < 0 || mapping.strength > 1) {
				throw new Error("Invalid mapping.strength: must be a number between 0 and 1");
			}
			if (
				mapping.mappingType &&
				!["role", "structure", "behavior", "constraint"].includes(mapping.mappingType as string)
			) {
				throw new Error(
					"Invalid mapping.mappingType: must be 'role', 'structure', 'behavior', or 'constraint'",
				);
			}
		}

		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			totalEntries: data.totalEntries,
			nextEntryNeeded: data.nextEntryNeeded,
			analogy: {
				sourceDomain: analogy.sourceDomain as string,
				targetDomain: analogy.targetDomain as string,
				mappings: analogy.mappings as Array<{
					from: string;
					to: string;
					strength: number;
					mappingType?: "role" | "structure" | "behavior" | "constraint";
				}>,
				reasoning: analogy.reasoning as string,
			},
			isRefinement: data.isRefinement as boolean | undefined,
			refinesEntry: data.refinesEntry as number | undefined,
		};
	}

	/**
	 * Format entry for terminal logging with visual indicators
	 */
	private formatEntry(data: AnalogyEntry): string {
		const { entryNumber, totalEntries, entry, analogy, isRefinement, refinesEntry } = data;

		let prefix = "";
		let context = "";

		if (isRefinement) {
			prefix = "🔄 Refinement";
			context = ` (refining analogy ${refinesEntry})`;
		} else {
			prefix = "🔗 Analogy";
			context = "";
		}

		const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
		const domains = `${analogy.sourceDomain} → ${analogy.targetDomain}`;
		const mappingCount = `${analogy.mappings.length} mapping(s)`;
		const avgStrength = (
			analogy.mappings.reduce((sum, m) => sum + m.strength, 0) / analogy.mappings.length
		).toFixed(2);

		const border = "─".repeat(80);

		let mappingDetails = "";
		for (const mapping of analogy.mappings) {
			const typeLabel = mapping.mappingType ? ` [${mapping.mappingType}]` : "";
			mappingDetails += `\n│   • ${mapping.from} → ${mapping.to} (${mapping.strength.toFixed(2)})${typeLabel}`;
		}

		return `
┌${border}┐
│ ${header.padEnd(78)} │
├${border}┤
│ ${entry.padEnd(78)} │
│                                                                                │
│ Source: ${analogy.sourceDomain.padEnd(67)} │
│ Target: ${analogy.targetDomain.padEnd(67)} │
│ Mappings: ${mappingCount.padEnd(65)} │
│ Avg Strength: ${avgStrength.padEnd(62)} │
│                                                                                │
│ Mappings:${mappingDetails
			.split("\n")
			.slice(1)
			.map((line) => line.padEnd(78))
			.join("\n")}
│                                                                                │
│ Reasoning: ${analogy.reasoning.substring(0, 64).padEnd(64)} │
└${border}┘`;
	}

	/**
	 * Calculate analogy quality metrics
	 */
	private calculateAnalygyMetrics(data: AnalogyEntry) {
		const { mappings } = data.analogy;

		const avgStrength = mappings.reduce((sum, m) => sum + m.strength, 0) / mappings.length;
		const strongMappings = mappings.filter((m) => m.strength > 0.7).length;
		const mappingTypes = new Set(mappings.map((m) => m.mappingType).filter(Boolean));

		return {
			averageStrength: avgStrength,
			strongMappingCount: strongMappings,
			mappingTypeCount: mappingTypes.size,
			totalMappings: mappings.length,
		};
	}

	/**
	 * Generate insights from the analogy
	 */
	private generateInsights(data: AnalogyEntry): string[] {
		const insights: string[] = [];
		const { mappings, sourceDomain, targetDomain } = data.analogy;

		// Overall strength assessment
		const avgStrength = mappings.reduce((sum, m) => sum + m.strength, 0) / mappings.length;
		if (avgStrength > 0.7) {
			insights.push(`Strong parallels exist between ${sourceDomain} and ${targetDomain}`);
		} else if (avgStrength > 0.5) {
			insights.push(`Moderate parallels exist between ${sourceDomain} and ${targetDomain}`);
		} else {
			insights.push(
				`Weak parallels exist between ${sourceDomain} and ${targetDomain} - consider alternative analogies`,
			);
		}

		// Type-specific insights
		const roleCount = mappings.filter((m) => m.mappingType === "role").length;
		const structureCount = mappings.filter((m) => m.mappingType === "structure").length;
		const behaviorCount = mappings.filter((m) => m.mappingType === "behavior").length;
		const constraintCount = mappings.filter((m) => m.mappingType === "constraint").length;

		if (roleCount > 0) {
			insights.push(`Found ${roleCount} role mapping(s) - key entities correspond between domains`);
		}
		if (structureCount > 0) {
			insights.push(
				`Found ${structureCount} structural mapping(s) - organizational principles align`,
			);
		}
		if (behaviorCount > 0) {
			insights.push(`Found ${behaviorCount} behavioral mapping(s) - dynamic patterns are similar`);
		}
		if (constraintCount > 0) {
			insights.push(
				`Found ${constraintCount} constraint mapping(s) - limitations and boundaries match`,
			);
		}

		// Mapping diversity
		const mappingTypes = new Set(mappings.map((m) => m.mappingType).filter(Boolean));
		if (mappingTypes.size >= 3) {
			insights.push("High diversity in mapping types suggests a robust analogy");
		}

		return insights;
	}

	/**
	 * Suggest next steps for analogy exploration
	 */
	private generateNextSteps(data: AnalogyEntry, allMappings: AnalogyEntry[]): string[] {
		const steps: string[] = [];
		const { mappings } = data.analogy;

		// Strengthen weak mappings
		const weakMappings = mappings.filter((m) => m.strength < 0.5);
		if (weakMappings.length > 0) {
			steps.push(
				`Strengthen ${weakMappings.length} weak mapping(s) by finding more correspondences`,
			);
		}

		// Add missing mapping types
		const existingTypes = new Set(mappings.map((m) => m.mappingType).filter(Boolean));
		const allTypes: Array<"role" | "structure" | "behavior" | "constraint"> = [
			"role",
			"structure",
			"behavior",
			"constraint",
		];
		const missingTypes = allTypes.filter((t) => !existingTypes.has(t));
		if (missingTypes.length > 0) {
			steps.push(`Explore ${missingTypes.join(", ")} mappings to deepen the analogy`);
		}

		// Validate with counter-examples
		if (mappings.length > 0) {
			steps.push("Test the analogy by looking for counter-examples or exceptions");
		}

		// Apply to predictions
		const avgStrength = mappings.reduce((sum, m) => sum + m.strength, 0) / mappings.length;
		if (avgStrength > 0.6) {
			steps.push("Apply the analogy to make predictions about the target domain");
		}

		// Compare with other analogies
		if (allMappings.length > 1) {
			steps.push("Compare this analogy with previous ones to identify patterns");
		}

		return steps;
	}

	/**
	 * Convert internal format to legacy format for compatibility
	 */
	private convertToLegacyFormat(entries: AnalogyEntry[]): AnalogyMapping[] {
		const allMappings: AnalogyMapping[] = [];

		for (const entry of entries) {
			for (const mapping of entry.analogy.mappings) {
				allMappings.push({
					sourceConcept: `${entry.analogy.sourceDomain}: ${mapping.from}`,
					targetConcept: `${entry.analogy.targetDomain}: ${mapping.to}`,
					mappingType: mapping.mappingType || "structure",
					strength: mapping.strength,
				});
			}
		}

		return allMappings;
	}

	async execute(context: OperationContext): Promise<OperationResult> {
		const { parameters, sessionState } = context;
		const store = sessionState.getStore();

		try {
			// Validate input data
			const validatedInput = this.validateData({
				entry: parameters.entry,
				entryNumber: parameters.entryNumber,
				totalEntries: parameters.totalEntries,
				nextEntryNeeded: parameters.nextEntryNeeded,
				analogy: parameters.analogy,
				isRefinement: parameters.isRefinement,
				refinesEntry: parameters.refinesEntry,
			});

			// Auto-adjust totalEntries if current entry exceeds estimate
			if (validatedInput.entryNumber > validatedInput.totalEntries) {
				validatedInput.totalEntries = validatedInput.entryNumber;
			}

			// Retrieve history from session, update it, and store it back
			const historyItems = store.getByType("analogy_entry");
			const entryHistory = historyItems.map((item) => item.data as AnalogyEntry);
			entryHistory.push(validatedInput);
			const entryId = `analogy-${validatedInput.entryNumber}-${sessionState.sessionId}`;
			store.add(entryId, { type: "analogy_entry", data: validatedInput });

			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedEntry = this.formatEntry(validatedInput);
				console.error(formattedEntry);
			}

			// Calculate metrics
			const metrics = this.calculateAnalygyMetrics(validatedInput);
			const insights = this.generateInsights(validatedInput);
			const nextSteps = this.generateNextSteps(validatedInput, entryHistory);

			// Convert to legacy format for compatibility
			const legacyMappings = this.convertToLegacyFormat(entryHistory);

			// Return minimal metadata - NEVER echo the full entry
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				historyLength: entryHistory.length,
				metrics,
				insights,
				nextSteps,
				// Legacy compatibility
				sourceDomain: validatedInput.analogy.sourceDomain,
				targetDomain: validatedInput.analogy.targetDomain,
				mappings: legacyMappings,
				mappingStrength: metrics.averageStrength,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
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
			description: `A structured tool for finding and applying analogies to understand complex problems through familiar domains.

This tool provides scaffolding for analogical thinking, enforcing discipline through required parameters while allowing flexibility in approach. The AI discovers and refines analogical mappings between source and target domains.

When to use this tool:
- Understanding complex or abstract concepts through familiar analogies
- Finding patterns and correspondences between different domains
- Transferring knowledge from one domain to another
- Generating creative insights by connecting disparate ideas
- Explaining difficult concepts using relatable examples

Key features:
- Map concepts between source (familiar) and target (complex) domains
- Track multiple types of mappings: role, structure, behavior, constraint
- Assess mapping strength (0.0-1.0) to validate analogies
- Refine and strengthen weak mappings through exploration
- Generate insights from the analogical relationships
- Build progressively stronger analogies through iteration

Parameters explained:
- entry: A description of the analogy or insight you're exploring
- entryNumber: Current analogy number (can increase beyond initial estimate)
- totalEntries: Estimate of total analogies needed (adjustable)
- nextEntryNeeded: Whether more analogies are needed
- analogy: The core analogy structure:
  * sourceDomain: The familiar domain (e.g., "water_flow")
  * targetDomain: The complex domain to understand (e.g., "electrical_current")
  * mappings: Array of correspondences:
    - from: Concept in source domain (e.g., "pressure")
    - to: Concept in target domain (e.g., "voltage")
    - strength: How strong the mapping is (0.0-1.0)
    - mappingType: Optional type ("role", "structure", "behavior", "constraint")
  * reasoning: Explanation of why the analogy works
- isRefinement: Optional boolean if refining a previous analogy
- refinesEntry: Optional entry number being refined

Example usage:
{
  "entry": "Water flow is analogous to electrical current",
  "entryNumber": 1,
  "totalEntries": 3,
  "nextEntryNeeded": true,
  "analogy": {
    "sourceDomain": "water_flow",
    "targetDomain": "electrical_current",
    "mappings": [
      {"from": "pressure", "to": "voltage", "strength": 0.9, "mappingType": "role"},
      {"from": "flow_rate", "to": "current", "strength": 0.95, "mappingType": "behavior"},
      {"from": "pipe_resistance", "to": "electrical_resistance", "strength": 0.85, "mappingType": "constraint"}
    ],
    "reasoning": "Both involve movement of particles through a medium with resistance"
  }
}

You should:
1. Start with clear, strong analogies where you understand both domains
2. Identify multiple mappings (aim for 3-5) across different types
3. Assign honest strength values based on how well concepts correspond
4. Provide clear reasoning for why the analogy is valid
5. Refine weak analogies in subsequent entries
6. Add complementary analogies if one isn't sufficient
7. Use analogies to generate predictions or insights about the target domain

Remember: Good analogies balance similarity with meaningful differences. The goal is understanding, not perfect equivalence.`,
			inputSchema: {
				type: "object" as const,
				properties: {
					entry: {
						type: "string",
						description: "Description of the analogy or insight",
					},
					entryNumber: {
						type: "number",
						description: "Current analogy number in the sequence",
					},
					totalEntries: {
						type: "number",
						description: "Estimated total analogies needed (adjustable)",
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether more analogies are needed",
					},
					analogy: {
						type: "object",
						properties: {
							sourceDomain: {
								type: "string",
								description: "The familiar domain for comparison",
							},
							targetDomain: {
								type: "string",
								description: "The complex domain to understand",
							},
							mappings: {
								type: "array",
								items: {
									type: "object",
									properties: {
										from: {
											type: "string",
											description: "Concept in source domain",
										},
										to: {
											type: "string",
											description: "Concept in target domain",
										},
										strength: {
											type: "number",
											description: "Mapping strength (0.0-1.0)",
											minimum: 0,
											maximum: 1,
										},
										mappingType: {
											type: "string",
											enum: ["role", "structure", "behavior", "constraint"],
											description: "Type of mapping (optional)",
										},
									},
									required: ["from", "to", "strength"],
								},
							},
							reasoning: {
								type: "string",
								description: "Explanation of why the analogy works",
							},
						},
						required: ["sourceDomain", "targetDomain", "mappings", "reasoning"],
					},
					isRefinement: {
						type: "boolean",
						description: "Whether this refines a previous analogy",
					},
					refinesEntry: {
						type: "number",
						description: "Entry number being refined (if isRefinement is true)",
					},
				},
				required: ["entry", "entryNumber", "totalEntries", "nextEntryNeeded", "analogy"],
			},
		};
	}
}

export default new AnalogicalReasoningOperation();
