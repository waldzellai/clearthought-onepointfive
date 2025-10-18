/**
 * Research Operation - Structured Journal Pattern
 *
 * Tracks research findings discovered by AI through methodical investigation.
 * This tool provides scaffolding for systematic research, enforcing discipline
 * through required parameters while allowing flexibility in exploration.
 */

import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

export interface ResearchSource {
	title: string;
	url: string;
	credibility: number; // 0-1 scale
	accessed?: string;
	author?: string;
}

export interface ResearchFinding {
	topic: string;
	summary: string;
	sources: ResearchSource[];
	reasoning: string;
	confidence?: number; // 0-1 scale
	keyInsights?: string[];
}

export interface ResearchData {
	entry: string; // Description of what was found
	entryNumber: number;
	totalEntries: number;
	nextEntryNeeded: boolean;
	finding: ResearchFinding;
	isRevision?: boolean;
	revisesEntry?: number;
	synthesisNeeded?: boolean;
}

export class ResearchOperation extends BaseOperation {
	name = "research";
	category = "analysis";

	private entryHistory: ResearchData[] = [];
	private findingsByTopic: Record<string, ResearchFinding[]> = {};
	private disableLogging = false;

	constructor() {
		super();
		// Check environment variable for logging control
		this.disableLogging = (process.env.DISABLE_RESEARCH_LOGGING || "").toLowerCase() === "true";
	}

	/**
	 * Validate input data with strict type checking and descriptive errors
	 */
	private validateData(input: unknown): ResearchData {
		const data = input as Record<string, unknown>;

		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing what was found");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current position");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number estimating total findings needed");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error(
				"Invalid nextEntryNeeded: must be a boolean indicating if more research is needed",
			);
		}

		// Validate finding structure
		const finding = data.finding as Record<string, unknown>;
		if (!finding || typeof finding !== "object") {
			throw new Error("Invalid finding: must be an object with research details");
		}
		if (!finding.topic || typeof finding.topic !== "string") {
			throw new Error("Invalid finding.topic: must be a string");
		}
		if (!finding.summary || typeof finding.summary !== "string") {
			throw new Error("Invalid finding.summary: must be a string");
		}
		if (!Array.isArray(finding.sources)) {
			throw new Error("Invalid finding.sources: must be an array of sources");
		}
		if (!finding.reasoning || typeof finding.reasoning !== "string") {
			throw new Error("Invalid finding.reasoning: must explain why this finding is relevant");
		}

		// Validate sources
		for (const source of finding.sources as unknown[]) {
			const src = source as Record<string, unknown>;
			if (!src.title || typeof src.title !== "string") {
				throw new Error("Invalid source.title: must be a string");
			}
			if (!src.url || typeof src.url !== "string") {
				throw new Error("Invalid source.url: must be a string");
			}
			if (typeof src.credibility !== "number" || src.credibility < 0 || src.credibility > 1) {
				throw new Error("Invalid source.credibility: must be a number between 0 and 1");
			}
		}

		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			totalEntries: data.totalEntries,
			nextEntryNeeded: data.nextEntryNeeded,
			finding: finding as ResearchFinding,
			isRevision: data.isRevision as boolean | undefined,
			revisesEntry: data.revisesEntry as number | undefined,
			synthesisNeeded: data.synthesisNeeded as boolean | undefined,
		};
	}

	/**
	 * Format finding for terminal logging with visual indicators
	 */
	private formatFinding(data: ResearchData): string {
		const { entryNumber, totalEntries, entry, finding, isRevision, revisesEntry } = data;

		const prefix = isRevision ? "🔄 Revised Finding" : "🔍 Finding";
		const context = isRevision ? ` (revising finding ${revisesEntry})` : "";

		const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
		const border = "═".repeat(Math.max(header.length, 60));

		const sourceLines = finding.sources
			.map(
				(s) =>
					`    - ${s.title} (credibility: ${s.credibility.toFixed(2)})
      ${s.url}`,
			)
			.join("\n");

		return `
┌${border}┐
│ ${header.padEnd(border.length - 2)} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │
├${border}┤
│ Topic: ${finding.topic.padEnd(border.length - 9)} │
│ Summary: ${finding.summary.substring(0, border.length - 11).padEnd(border.length - 11)} │
│ Sources: │
${sourceLines}
│ Reasoning: ${finding.reasoning.substring(0, border.length - 13).padEnd(border.length - 13)} │
└${border}┘`;
	}

	async execute(context: OperationContext): Promise<OperationResult> {
		const { parameters } = context;

		try {
			// Validate input data
			const validatedInput = this.validateData({
				entry: parameters.entry,
				entryNumber: parameters.entryNumber,
				totalEntries: parameters.totalEntries,
				nextEntryNeeded: parameters.nextEntryNeeded,
				finding: parameters.finding,
				isRevision: parameters.isRevision,
				revisesEntry: parameters.revisesEntry,
				synthesisNeeded: parameters.synthesisNeeded,
			});

			// Auto-adjust totalEntries if current entry exceeds estimate
			if (validatedInput.entryNumber > validatedInput.totalEntries) {
				validatedInput.totalEntries = validatedInput.entryNumber;
			}

			// Store in history
			this.entryHistory.push(validatedInput);

			// Organize findings by topic
			const topic = validatedInput.finding.topic;
			if (!this.findingsByTopic[topic]) {
				this.findingsByTopic[topic] = [];
			}
			this.findingsByTopic[topic].push(validatedInput.finding);

			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedFinding = this.formatFinding(validatedInput);
				console.error(formattedFinding);
			}

			// Return minimal metadata - NEVER echo the prompt
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				totalEntries: validatedInput.totalEntries,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				topicsCovered: Object.keys(this.findingsByTopic),
				totalFindings: this.entryHistory.length,
				synthesisNeeded: validatedInput.synthesisNeeded,
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
			description: `A structured tool for systematic research and knowledge discovery.
This tool tracks research findings as AI discovers them through methodical investigation.
Each finding represents actual research, not placeholders or generated content.

This tool provides scaffolding for systematic research, enforcing discipline through
required parameters while allowing flexibility in exploration. It does NOT perform
actual web searches or data gathering - it structures the research process for the AI.

When to use this tool:
- Conducting systematic research on a topic
- Tracking findings from multiple sources
- Building evidence-based conclusions
- Investigating complex questions requiring multiple sources
- Synthesizing information from diverse sources
- Documenting research methodology and reasoning

Key features:
- Track actual findings discovered through research
- Record sources with credibility assessments
- Document reasoning for each finding's relevance
- Organize findings by topic
- Support revision of previous findings with new information
- Signal when synthesis of findings is needed

Parameters explained:
- entry: Description of what was found (e.g., "Found key research on neural architectures")
- entryNumber: Current finding number in sequence
- totalEntries: Estimated total findings needed (can be adjusted)
- nextEntryNeeded: True if more research is needed
- finding: The actual research finding with:
  * topic: The specific topic or subtopic this finding addresses
  * summary: Summary of the finding
  * sources: Array of sources with title, url, and credibility (0-1)
  * reasoning: Explanation of why this finding is relevant
  * confidence: Optional confidence level in the finding (0-1)
  * keyInsights: Optional array of key insights extracted
- isRevision: Boolean indicating if this revises a previous finding
- revisesEntry: If isRevision is true, which entry number is being reconsidered
- synthesisNeeded: Boolean indicating if findings should be synthesized

Research Process:
1. Start with an initial estimate of needed findings
2. Discover and document actual findings with real sources
3. Assess credibility of each source (academic papers > established publications > blogs)
4. Explain reasoning for including each finding
5. Revise previous findings if new information contradicts or enhances them
6. Signal when enough findings exist for synthesis
7. Only set nextEntryNeeded to false when research is complete

Source Credibility Guidelines:
- 0.9-1.0: Peer-reviewed academic papers, authoritative textbooks
- 0.7-0.9: Established technical publications, official documentation
- 0.5-0.7: Reputable blogs, conference talks, industry reports
- 0.3-0.5: Personal blogs, forum posts, unverified claims
- 0.0-0.3: Unreliable or unverified sources`,
			inputSchema: {
				type: "object" as const,
				properties: {
					entry: {
						type: "string",
						description: "Description of what was found in this research step",
					},
					entryNumber: {
						type: "integer",
						description: "Current finding number",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total findings needed",
						minimum: 1,
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether more research is needed",
					},
					finding: {
						type: "object",
						description: "The research finding details",
						properties: {
							topic: {
								type: "string",
								description: "The specific topic this finding addresses",
							},
							summary: {
								type: "string",
								description: "Summary of the finding",
							},
							sources: {
								type: "array",
								description: "Array of sources for this finding",
								items: {
									type: "object",
									properties: {
										title: {
											type: "string",
											description: "Source title",
										},
										url: {
											type: "string",
											description: "Source URL",
										},
										credibility: {
											type: "number",
											description: "Credibility score 0-1",
											minimum: 0,
											maximum: 1,
										},
										accessed: {
											type: "string",
											description: "Optional access date",
										},
										author: {
											type: "string",
											description: "Optional author name",
										},
									},
									required: ["title", "url", "credibility"],
								},
							},
							reasoning: {
								type: "string",
								description: "Explanation of why this finding is relevant",
							},
							confidence: {
								type: "number",
								description: "Optional confidence level 0-1",
								minimum: 0,
								maximum: 1,
							},
							keyInsights: {
								type: "array",
								description: "Optional key insights extracted",
								items: {
									type: "string",
								},
							},
						},
						required: ["topic", "summary", "sources", "reasoning"],
					},
					isRevision: {
						type: "boolean",
						description: "Whether this revises previous research",
					},
					revisesEntry: {
						type: "integer",
						description: "Which finding is being reconsidered",
						minimum: 1,
					},
					synthesisNeeded: {
						type: "boolean",
						description: "Whether findings should be synthesized",
					},
				},
				required: ["entry", "entryNumber", "totalEntries", "nextEntryNeeded", "finding"],
			},
		};
	}
}

// Export singleton instance
export default new ResearchOperation();
