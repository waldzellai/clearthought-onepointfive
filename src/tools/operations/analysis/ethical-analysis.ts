/**
 * Ethical Analysis Operation - Structured Journal Pattern
 *
 * Provides structured ethical analysis using multiple ethical frameworks.
 * AI provides complete analysis entries with framework-specific assessments.
 */

import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

export interface EthicalAnalysisData {
	entry: string; // Description of what's being analyzed
	entryNumber: number;
	framework: "utilitarian" | "rights" | "fairness" | "compliance";
	assessment: {
		benefits?: string[]; // Positive consequences
		harms?: string[]; // Negative consequences
		stakeholders: string[]; // Affected parties
		rights?: string[]; // Rights considerations (for rights framework)
		fairnessIssues?: string[]; // Justice/equity concerns (for fairness framework)
		regulations?: string[]; // Legal/regulatory requirements (for compliance framework)
		reasoning: string; // Framework-specific ethical reasoning
		score?: number; // Optional 0-1 score
	};
	mitigations?: string[]; // Optional risk mitigation strategies
	recommendations?: string[]; // Optional recommendations
	compareTo?: number; // Optional: compare to another analysis entry
	nextEntryNeeded: boolean;
}

export class EthicalAnalysisOperation extends BaseOperation {
	name = "ethical_analysis";
	category = "analysis";

	private analysisHistory: EthicalAnalysisData[] = [];
	private disableLogging = false;

	constructor() {
		super();
		this.disableLogging =
			(process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
	}

	/**
	 * Validate input data with strict type checking and descriptive errors
	 */
	private validateData(input: unknown): EthicalAnalysisData {
		const data = input as Record<string, unknown>;

		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing what's being analyzed");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current analysis step");
		}
		if (!data.framework || typeof data.framework !== "string") {
			throw new Error(
				"Invalid framework: must be one of 'utilitarian', 'rights', 'fairness', or 'compliance'",
			);
		}
		if (!["utilitarian", "rights", "fairness", "compliance"].includes(data.framework)) {
			throw new Error(
				`Invalid framework '${data.framework}': must be one of 'utilitarian', 'rights', 'fairness', or 'compliance'`,
			);
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error(
				"Invalid nextEntryNeeded: must be a boolean indicating if more analysis is needed",
			);
		}

		// Validate assessment object
		const assessment = data.assessment as Record<string, unknown>;
		if (!assessment || typeof assessment !== "object") {
			throw new Error("Invalid assessment: must be an object containing analysis results");
		}
		if (!Array.isArray(assessment.stakeholders) || assessment.stakeholders.length === 0) {
			throw new Error("Invalid assessment.stakeholders: must be a non-empty array of strings");
		}
		if (!assessment.reasoning || typeof assessment.reasoning !== "string") {
			throw new Error(
				"Invalid assessment.reasoning: must be a string explaining the ethical analysis",
			);
		}

		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			framework: data.framework as "utilitarian" | "rights" | "fairness" | "compliance",
			assessment: {
				benefits: assessment.benefits as string[] | undefined,
				harms: assessment.harms as string[] | undefined,
				stakeholders: assessment.stakeholders as string[],
				rights: assessment.rights as string[] | undefined,
				fairnessIssues: assessment.fairnessIssues as string[] | undefined,
				regulations: assessment.regulations as string[] | undefined,
				reasoning: assessment.reasoning as string,
				score: assessment.score as number | undefined,
			},
			mitigations: data.mitigations as string[] | undefined,
			recommendations: data.recommendations as string[] | undefined,
			compareTo: data.compareTo as number | undefined,
			nextEntryNeeded: data.nextEntryNeeded as boolean,
		};
	}

	/**
	 * Format analysis for terminal logging with visual indicators
	 */
	private formatAnalysis(data: EthicalAnalysisData): string {
		const { entryNumber, entry, framework, assessment, mitigations, recommendations } = data;

		const frameworkEmoji = {
			utilitarian: "⚖️",
			rights: "🛡️",
			fairness: "⚖️",
			compliance: "📋",
		};

		const header = `${frameworkEmoji[framework]} Analysis ${entryNumber} [${framework.toUpperCase()}]`;
		const border = "═".repeat(Math.max(header.length, 60));

		let output = `
╔${border}╗
║ ${header.padEnd(border.length - 2)} ║
╠${border}╣
║ ${entry.padEnd(border.length - 2)} ║
╠${border}╣`;

		// Framework-specific content
		if (assessment.benefits && assessment.benefits.length > 0) {
			output += `\n║ Benefits:`.padEnd(border.length + 3) + "║";
			for (const benefit of assessment.benefits) {
				output += `\n║   • ${benefit}`.padEnd(border.length + 3) + "║";
			}
		}

		if (assessment.harms && assessment.harms.length > 0) {
			output += `\n║ Harms:`.padEnd(border.length + 3) + "║";
			for (const harm of assessment.harms) {
				output += `\n║   • ${harm}`.padEnd(border.length + 3) + "║";
			}
		}

		if (assessment.rights && assessment.rights.length > 0) {
			output += `\n║ Rights Considerations:`.padEnd(border.length + 3) + "║";
			for (const right of assessment.rights) {
				output += `\n║   • ${right}`.padEnd(border.length + 3) + "║";
			}
		}

		if (assessment.fairnessIssues && assessment.fairnessIssues.length > 0) {
			output += `\n║ Fairness Issues:`.padEnd(border.length + 3) + "║";
			for (const issue of assessment.fairnessIssues) {
				output += `\n║   • ${issue}`.padEnd(border.length + 3) + "║";
			}
		}

		if (assessment.regulations && assessment.regulations.length > 0) {
			output += `\n║ Regulations:`.padEnd(border.length + 3) + "║";
			for (const reg of assessment.regulations) {
				output += `\n║   • ${reg}`.padEnd(border.length + 3) + "║";
			}
		}

		output += `\n║ Stakeholders: ${assessment.stakeholders.join(", ")}`.padEnd(border.length + 3) + "║";

		if (assessment.score !== undefined) {
			output += `\n║ Score: ${(assessment.score * 100).toFixed(1)}%`.padEnd(border.length + 3) + "║";
		}

		output += `\n║ Reasoning:`.padEnd(border.length + 3) + "║";
		const reasoningLines = this.wrapText(assessment.reasoning, border.length - 6);
		for (const line of reasoningLines) {
			output += `\n║   ${line.padEnd(border.length - 4)} ║`;
		}

		if (mitigations && mitigations.length > 0) {
			output += `\n╠${border}╣`;
			output += `\n║ Mitigations:`.padEnd(border.length + 3) + "║";
			for (const mitigation of mitigations) {
				output += `\n║   • ${mitigation}`.padEnd(border.length + 3) + "║";
			}
		}

		if (recommendations && recommendations.length > 0) {
			output += `\n╠${border}╣`;
			output += `\n║ Recommendations:`.padEnd(border.length + 3) + "║";
			for (const rec of recommendations) {
				output += `\n║   • ${rec}`.padEnd(border.length + 3) + "║";
			}
		}

		output += `\n╚${border}╝`;

		return output;
	}

	/**
	 * Wrap text to fit within specified width
	 */
	private wrapText(text: string, width: number): string[] {
		const words = text.split(" ");
		const lines: string[] = [];
		let currentLine = "";

		for (const word of words) {
			if ((currentLine + " " + word).length <= width) {
				currentLine = currentLine ? currentLine + " " + word : word;
			} else {
				if (currentLine) lines.push(currentLine);
				currentLine = word;
			}
		}
		if (currentLine) lines.push(currentLine);

		return lines;
	}

	async execute(context: OperationContext): Promise<OperationResult> {
		const { parameters } = context;

		try {
			// Validate input data
			const validatedInput = this.validateData({
				entry: parameters.entry,
				entryNumber: parameters.entryNumber,
				framework: parameters.framework,
				assessment: parameters.assessment,
				mitigations: parameters.mitigations,
				recommendations: parameters.recommendations,
				compareTo: parameters.compareTo,
				nextEntryNeeded: parameters.nextEntryNeeded,
			});

			// Store in history
			this.analysisHistory.push(validatedInput);

			// Terminal logging (stderr)
			if (!this.disableLogging) {
				const formattedAnalysis = this.formatAnalysis(validatedInput);
				console.error(formattedAnalysis);
			}

			// Comparison logic if requested
			let comparison: Record<string, any> | undefined;
			if (validatedInput.compareTo !== undefined) {
				const compareToEntry = this.analysisHistory.find(
					(entry) => entry.entryNumber === validatedInput.compareTo,
				);
				if (compareToEntry) {
					comparison = this.compareAnalyses(compareToEntry, validatedInput);
				}
			}

			// Generate summary if this is the final entry
			let summary: Record<string, any> | undefined;
			if (!validatedInput.nextEntryNeeded) {
				summary = this.generateSummary();
			}

			// Return minimal metadata - NEVER echo the prompt
			return this.createResult({
				entryNumber: validatedInput.entryNumber,
				framework: validatedInput.framework,
				score: validatedInput.assessment.score,
				nextEntryNeeded: validatedInput.nextEntryNeeded,
				historyLength: this.analysisHistory.length,
				comparison,
				summary,
			});
		} catch (error) {
			return this.createResult({
				error: error instanceof Error ? error.message : String(error),
				status: "failed",
			});
		}
	}

	/**
	 * Compare two analyses (different frameworks or same scenario)
	 */
	private compareAnalyses(
		entry1: EthicalAnalysisData,
		entry2: EthicalAnalysisData,
	): Record<string, any> {
		return {
			frameworks: [entry1.framework, entry2.framework],
			scores: [entry1.assessment.score, entry2.assessment.score],
			stakeholderOverlap: this.calculateOverlap(
				entry1.assessment.stakeholders,
				entry2.assessment.stakeholders,
			),
			agreement:
				entry1.assessment.score !== undefined && entry2.assessment.score !== undefined
					? Math.abs(entry1.assessment.score - entry2.assessment.score) < 0.2
					: undefined,
		};
	}

	/**
	 * Calculate overlap between two arrays
	 */
	private calculateOverlap(arr1: string[], arr2: string[]): number {
		const set1 = new Set(arr1.map((s) => s.toLowerCase()));
		const set2 = new Set(arr2.map((s) => s.toLowerCase()));
		const intersection = new Set([...set1].filter((x) => set2.has(x)));
		return intersection.size / Math.max(set1.size, set2.size);
	}

	/**
	 * Generate summary of all analyses
	 */
	private generateSummary(): Record<string, any> {
		if (this.analysisHistory.length === 0) {
			return { message: "No analyses completed" };
		}

		const frameworks = new Set(this.analysisHistory.map((a) => a.framework));
		const allStakeholders = new Set<string>();
		const scores: number[] = [];

		for (const analysis of this.analysisHistory) {
			for (const stakeholder of analysis.assessment.stakeholders) {
				allStakeholders.add(stakeholder);
			}
			if (analysis.assessment.score !== undefined) {
				scores.push(analysis.assessment.score);
			}
		}

		const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;
		const minScore = scores.length > 0 ? Math.min(...scores) : undefined;
		const maxScore = scores.length > 0 ? Math.max(...scores) : undefined;

		return {
			totalAnalyses: this.analysisHistory.length,
			frameworksUsed: Array.from(frameworks),
			uniqueStakeholders: Array.from(allStakeholders),
			scoreRange:
				minScore !== undefined && maxScore !== undefined ? [minScore, maxScore] : undefined,
			averageScore: avgScore,
			overallRecommendation: this.getOverallRecommendation(avgScore, minScore),
		};
	}

	/**
	 * Generate overall recommendation based on scores
	 */
	private getOverallRecommendation(avgScore?: number, minScore?: number): string {
		if (minScore === undefined) {
			return "Insufficient data for recommendation";
		}

		if (minScore < 0.3) {
			return "Strong ethical concerns identified - consider alternative approaches";
		} else if (avgScore !== undefined && avgScore < 0.5) {
			return "Moderate ethical concerns - implement strong safeguards and monitoring";
		} else if (avgScore !== undefined && avgScore < 0.7) {
			return "Some ethical considerations - address identified risks before proceeding";
		} else {
			return "Ethically acceptable with proper implementation of recommended safeguards";
		}
	}

	/**
	 * Tool description that guides AI behavior
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `Structured ethical analysis tool using multiple ethical frameworks.

This tool provides scaffolding for systematic ethical analysis. The AI should provide
complete ethical assessments for each framework, including stakeholder analysis,
consequences, rights considerations, fairness issues, and reasoning.

Available frameworks:
- utilitarian: Focuses on consequences, benefits, and harms (maximizing overall well-being)
- rights: Focuses on fundamental rights, dignity, and individual protections
- fairness: Focuses on justice, equity, and fair distribution of benefits/burdens
- compliance: Focuses on legal requirements, regulations, and standards

When to use this tool:
- Analyzing ethical implications of decisions or actions
- Comparing multiple ethical perspectives on the same issue
- Identifying stakeholders and potential impacts
- Developing ethically-informed recommendations
- Ensuring comprehensive ethical consideration

Process:
1. Analyze the scenario using one framework at a time
2. Identify all relevant stakeholders
3. Assess benefits, harms, rights, fairness, or compliance issues
4. Provide clear reasoning based on the framework
5. Optionally compare across frameworks
6. Generate recommendations and mitigations

The AI should provide complete analysis entries, not generate partial content.`,
			inputSchema: {
				type: "object" as const,
				properties: {
					entry: {
						type: "string",
						description: "Description of what's being ethically analyzed",
					},
					entryNumber: {
						type: "integer",
						description: "Current analysis step number",
						minimum: 1,
					},
					framework: {
						type: "string",
						enum: ["utilitarian", "rights", "fairness", "compliance"],
						description: "Ethical framework for this analysis",
					},
					assessment: {
						type: "object",
						description: "The ethical assessment results",
						properties: {
							benefits: {
								type: "array",
								items: { type: "string" },
								description:
									"Positive consequences or benefits (especially for utilitarian framework)",
							},
							harms: {
								type: "array",
								items: { type: "string" },
								description: "Negative consequences or harms (especially for utilitarian framework)",
							},
							stakeholders: {
								type: "array",
								items: { type: "string" },
								description: "All affected parties and stakeholder groups (required)",
							},
							rights: {
								type: "array",
								items: { type: "string" },
								description: "Rights considerations (for rights framework)",
							},
							fairnessIssues: {
								type: "array",
								items: { type: "string" },
								description: "Justice and equity concerns (for fairness framework)",
							},
							regulations: {
								type: "array",
								items: { type: "string" },
								description: "Legal and regulatory requirements (for compliance framework)",
							},
							reasoning: {
								type: "string",
								description:
									"Framework-specific ethical reasoning explaining the analysis (required)",
							},
							score: {
								type: "number",
								description: "Optional ethical assessment score (0-1, where 1 is most ethical)",
								minimum: 0,
								maximum: 1,
							},
						},
						required: ["stakeholders", "reasoning"],
					},
					mitigations: {
						type: "array",
						items: { type: "string" },
						description: "Optional risk mitigation strategies",
					},
					recommendations: {
						type: "array",
						items: { type: "string" },
						description: "Optional recommendations for ethical decision-making",
					},
					compareTo: {
						type: "integer",
						description: "Optional: entry number to compare this analysis to",
						minimum: 1,
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether more analysis entries are needed",
					},
				},
				required: ["entry", "entryNumber", "framework", "assessment", "nextEntryNeeded"],
			},
		};
	}
}

// Export singleton instance
export default new EthicalAnalysisOperation();
