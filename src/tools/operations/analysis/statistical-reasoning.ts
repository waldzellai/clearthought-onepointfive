/**
 * Statistical Reasoning Operation - Structured Journal Pattern
 *
 * Tracks statistical analysis performed by AI, providing structured format
 * for recording statistical computations, interpretations, and insights.
 * Does NOT perform calculations - the AI provides them.
 */

import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

/**
 * Statistical analysis types
 */
export type StatisticalAnalysisType =
	| "descriptive"
	| "inferential"
	| "bayesian"
	| "hypothesis-test"
	| "correlation"
	| "regression"
	| "monte-carlo"
	| "time-series"
	| "distribution";

/**
 * Descriptive statistics tracked by AI
 */
export interface DescriptiveStatistic {
	type: "descriptive";
	measures: {
		mean?: number;
		median?: number;
		mode?: number;
		variance?: number;
		stddev?: number;
		min?: number;
		max?: number;
		range?: number;
		quartiles?: {
			q1?: number;
			q2?: number;
			q3?: number;
		};
		skewness?: number;
		kurtosis?: number;
	};
	dataset?: number[] | string; // Can reference dataset or provide inline
	sampleSize: number;
	reasoning: string;
}

/**
 * Inferential statistics (hypothesis tests, confidence intervals)
 */
export interface InferentialStatistic {
	type: "inferential";
	test: string; // e.g., "t-test", "chi-square", "ANOVA", "z-test"
	hypotheses: {
		null: string;
		alternative: string;
	};
	results: {
		statistic: number;
		pValue: number;
		criticalValue?: number;
		confidenceInterval?: {
			lower: number;
			upper: number;
			level: number; // e.g., 0.95 for 95%
		};
		degreesOfFreedom?: number;
		effectSize?: {
			measure: string; // e.g., "Cohen's d", "eta-squared"
			value: number;
		};
	};
	conclusion: string;
	assumptions: string[];
	reasoning: string;
}

/**
 * Bayesian analysis results
 */
export interface BayesianStatistic {
	type: "bayesian";
	prior: {
		distribution: string;
		parameters: Record<string, number>;
		belief: string;
	};
	likelihood: {
		model: string;
		evidence: string;
	};
	posterior: {
		distribution: string;
		parameters: Record<string, number>;
		updated_belief: string;
	};
	credibleInterval?: {
		lower: number;
		upper: number;
		probability: number;
	};
	bayesFactor?: number;
	reasoning: string;
}

/**
 * Correlation analysis
 */
export interface CorrelationStatistic {
	type: "correlation";
	method: string; // "pearson", "spearman", "kendall"
	variables: string[];
	coefficient: number;
	pValue?: number;
	confidenceInterval?: {
		lower: number;
		upper: number;
		level: number;
	};
	interpretation: string;
	scatterplotPattern?: string;
	reasoning: string;
}

/**
 * Regression analysis
 */
export interface RegressionStatistic {
	type: "regression";
	model: string; // "linear", "logistic", "polynomial", "multiple"
	equation: string;
	coefficients: Array<{
		variable: string;
		coefficient: number;
		standardError?: number;
		tValue?: number;
		pValue?: number;
	}>;
	goodnessOfFit: {
		rSquared?: number;
		adjustedRSquared?: number;
		aic?: number;
		bic?: number;
	};
	residuals?: {
		summary: string;
		diagnostics: string[];
	};
	predictions?: Array<{
		input: Record<string, number>;
		predicted: number;
		interval?: { lower: number; upper: number };
	}>;
	reasoning: string;
}

/**
 * Monte Carlo simulation results
 */
export interface MonteCarloStatistic {
	type: "monte-carlo";
	scenario: string;
	simulations: number;
	distribution: string;
	parameters: Record<string, number | string>;
	results: {
		mean: number;
		median: number;
		stddev: number;
		percentiles: Record<string, number>; // e.g., {"5": 10, "95": 90}
	};
	convergence?: {
		achieved: boolean;
		iterations: number;
	};
	interpretation: string;
	reasoning: string;
}

/**
 * Time series analysis
 */
export interface TimeSeriesStatistic {
	type: "time-series";
	components: {
		trend?: string;
		seasonality?: {
			period: number;
			strength: number;
		};
		cyclical?: string;
		irregular?: string;
	};
	stationarity?: {
		isStationary: boolean;
		test: string;
		pValue?: number;
	};
	autocorrelation?: {
		lag: number;
		coefficient: number;
	}[];
	forecast?: {
		model: string;
		horizon: number;
		predictions: Array<{
			time: string | number;
			value: number;
			interval?: { lower: number; upper: number };
		}>;
	};
	reasoning: string;
}

/**
 * Distribution analysis
 */
export interface DistributionStatistic {
	type: "distribution";
	distribution: string; // "normal", "binomial", "poisson", "exponential", etc.
	parameters: Record<string, number>;
	goodnessOfFit?: {
		test: string;
		statistic: number;
		pValue: number;
		conclusion: string;
	};
	probability?: {
		description: string;
		value: number;
	};
	quantiles?: Record<string, number>;
	reasoning: string;
}

/**
 * Union type for all statistical analyses
 */
export type StatisticalAnalysis =
	| DescriptiveStatistic
	| InferentialStatistic
	| BayesianStatistic
	| CorrelationStatistic
	| RegressionStatistic
	| MonteCarloStatistic
	| TimeSeriesStatistic
	| DistributionStatistic;

/**
 * Journal entry structure for statistical reasoning
 */
export interface StatisticalReasoningEntry {
	entry: string; // Human-readable description of the analysis
	entryNumber: number;
	totalEntries: number;
	nextEntryNeeded: boolean;
	statistic: StatisticalAnalysis;
	metadata?: {
		dataSource?: string;
		context?: string;
		timestamp?: string;
		references?: string[];
	};
}

/**
 * Statistical Reasoning Operation
 * Tracks AI's statistical analysis in structured journal format
 */
export class StatisticalReasoningOperation extends BaseOperation {
	name = "statistical_reasoning";
	category = "analysis";

	private journal: StatisticalReasoningEntry[] = [];
	private disableLogging = false;

	constructor() {
		super();
		this.disableLogging = (process.env.DISABLE_STATISTICAL_LOGGING || "").toLowerCase() === "true";
	}

	/**
	 * Validate statistical reasoning input
	 */
	private validateEntry(input: unknown): StatisticalReasoningEntry {
		const data = input as Record<string, unknown>;

		if (!data.entry || typeof data.entry !== "string") {
			throw new Error("Invalid entry: must be a string describing the statistical analysis");
		}
		if (!data.entryNumber || typeof data.entryNumber !== "number") {
			throw new Error("Invalid entryNumber: must be a number indicating current position");
		}
		if (!data.totalEntries || typeof data.totalEntries !== "number") {
			throw new Error("Invalid totalEntries: must be a number estimating total analyses needed");
		}
		if (typeof data.nextEntryNeeded !== "boolean") {
			throw new Error(
				"Invalid nextEntryNeeded: must be a boolean indicating if more analysis is needed",
			);
		}
		if (!data.statistic || typeof data.statistic !== "object") {
			throw new Error(
				"Invalid statistic: must be an object containing statistical analysis details",
			);
		}

		const statistic = data.statistic as Record<string, unknown>;
		if (!statistic.type || typeof statistic.type !== "string") {
			throw new Error(
				"Invalid statistic.type: must be one of descriptive, inferential, bayesian, correlation, regression, monte-carlo, time-series, or distribution",
			);
		}

		return {
			entry: data.entry,
			entryNumber: data.entryNumber,
			totalEntries: data.totalEntries,
			nextEntryNeeded: data.nextEntryNeeded,
			statistic: statistic as StatisticalAnalysis,
			metadata: data.metadata as StatisticalReasoningEntry["metadata"],
		};
	}

	/**
	 * Format entry for terminal logging
	 */
	private formatEntry(entry: StatisticalReasoningEntry): string {
		const { entryNumber, totalEntries, entry: description, statistic } = entry;

		const header = `📊 Statistical Analysis ${entryNumber}/${totalEntries} [${statistic.type}]`;
		const border = "═".repeat(Math.max(header.length, 60));

		let details = "";
		switch (statistic.type) {
			case "descriptive": {
				const measures = Object.entries(statistic.measures)
					.filter(([_, v]) => v !== undefined)
					.map(([k, v]) => `${k}: ${typeof v === "number" ? v.toFixed(3) : JSON.stringify(v)}`)
					.join(", ");
				details = `Measures: ${measures}\nSample size: ${statistic.sampleSize}`;
				break;
			}
			case "inferential":
				details = `Test: ${statistic.test}\nStatistic: ${statistic.results.statistic.toFixed(4)}, p-value: ${statistic.results.pValue.toFixed(4)}\nConclusion: ${statistic.conclusion}`;
				break;
			case "bayesian":
				details = `Prior: ${statistic.prior.distribution}\nPosterior: ${statistic.posterior.distribution}\nUpdated belief: ${statistic.posterior.updated_belief}`;
				break;
			case "correlation":
				details = `Method: ${statistic.method}\nCoefficient: ${statistic.coefficient.toFixed(4)}\nInterpretation: ${statistic.interpretation}`;
				break;
			case "regression":
				details = `Model: ${statistic.model}\nEquation: ${statistic.equation}\nR²: ${statistic.goodnessOfFit.rSquared?.toFixed(4) || "N/A"}`;
				break;
			case "monte-carlo":
				details = `Simulations: ${statistic.simulations}\nMean: ${statistic.results.mean.toFixed(4)}, StdDev: ${statistic.results.stddev.toFixed(4)}\nInterpretation: ${statistic.interpretation}`;
				break;
			case "time-series":
				details = `Trend: ${statistic.components.trend || "N/A"}\nStationary: ${statistic.stationarity?.isStationary ? "Yes" : "No"}`;
				if (statistic.forecast) {
					details += `\nForecast model: ${statistic.forecast.model}`;
				}
				break;
			case "distribution":
				details = `Distribution: ${statistic.distribution}\nParameters: ${JSON.stringify(statistic.parameters)}`;
				if (statistic.goodnessOfFit) {
					details += `\nGoodness of fit: ${statistic.goodnessOfFit.conclusion}`;
				}
				break;
		}

		return `
╔${border}╗
║ ${header.padEnd(border.length - 2)} ║
╠${border}╣
║ ${description.padEnd(border.length - 2)} ║
╟${"─".repeat(border.length)}╢
║ ${details
			.split("\n")
			.join(`\n║ `)
			.padEnd(border.length - 2)} ║
╚${border}╝`;
	}

	async execute(context: OperationContext): Promise<OperationResult> {
		const { parameters } = context;

		try {
			// Validate input
			const validatedEntry = this.validateEntry(parameters);

			// Auto-adjust totalEntries if needed
			if (validatedEntry.entryNumber > validatedEntry.totalEntries) {
				validatedEntry.totalEntries = validatedEntry.entryNumber;
			}

			// Store in journal
			this.journal.push(validatedEntry);

			// Terminal logging
			if (!this.disableLogging) {
				const formatted = this.formatEntry(validatedEntry);
				console.error(formatted);
			}

			// Generate summary insights if this is the final entry
			const insights = !validatedEntry.nextEntryNeeded ? this.generateInsights() : undefined;

			// Return minimal metadata
			return this.createResult({
				entryNumber: validatedEntry.entryNumber,
				totalEntries: validatedEntry.totalEntries,
				nextEntryNeeded: validatedEntry.nextEntryNeeded,
				analysisType: validatedEntry.statistic.type,
				journalLength: this.journal.length,
				insights,
			});
		} catch (error) {
			return this.createResult({
				error: error instanceof Error ? error.message : String(error),
				status: "failed",
			});
		}
	}

	/**
	 * Generate summary insights from the complete journal
	 */
	private generateInsights(): Record<string, unknown> {
		const analysisTypes = this.journal.map((e) => e.statistic.type);
		const typeCount: Record<string, number> = {};
		for (const type of analysisTypes) {
			typeCount[type] = (typeCount[type] || 0) + 1;
		}

		return {
			totalAnalyses: this.journal.length,
			analysisTypeBreakdown: typeCount,
			journalComplete: true,
		};
	}

	/**
	 * Tool description for AI guidance
	 */
	getToolDescription() {
		return {
			name: this.name,
			description: `A structured journal for tracking statistical reasoning and analysis.

This tool provides a framework for recording statistical computations, interpretations, and insights
in a structured format. The AI performs the statistical analysis and provides the results - this tool
tracks and organizes those results.

When to use this tool:
- Performing statistical analysis on datasets
- Testing hypotheses with inferential statistics
- Bayesian inference and probability updating
- Correlation and regression analysis
- Monte Carlo simulations
- Time series analysis and forecasting
- Distribution fitting and analysis
- Multi-step statistical investigations

Key features:
- Structured format for different types of statistical analysis
- Tracks descriptive, inferential, Bayesian, and other statistical methods
- Records assumptions, interpretations, and reasoning
- Supports complex multi-step statistical investigations
- Allows revision and branching of analytical approaches

Analysis types supported:
1. descriptive - Summary statistics (mean, median, variance, etc.)
2. inferential - Hypothesis tests, confidence intervals, effect sizes
3. bayesian - Prior/posterior distributions, Bayesian updating
4. correlation - Correlation coefficients between variables
5. regression - Linear, logistic, polynomial, multiple regression
6. monte-carlo - Simulation-based statistical analysis
7. time-series - Trend, seasonality, forecasting
8. distribution - Distribution fitting and probability calculations

Parameters:
- entry: Human-readable description of the statistical analysis performed
- entryNumber: Current analysis step number
- totalEntries: Estimated total number of analyses needed
- nextEntryNeeded: Whether more statistical analysis is required
- statistic: Structured data containing the statistical analysis results
  - type: The type of statistical analysis (see list above)
  - [type-specific fields]: Results, interpretations, and reasoning
- metadata: Optional context (data source, references, timestamp)

Example usage:
{
  "entry": "Computed descriptive statistics for response times dataset",
  "entryNumber": 1,
  "totalEntries": 3,
  "nextEntryNeeded": true,
  "statistic": {
    "type": "descriptive",
    "measures": {
      "mean": 45.3,
      "median": 44.0,
      "stddev": 8.2,
      "min": 30.1,
      "max": 68.5
    },
    "sampleSize": 100,
    "reasoning": "Central tendency indicates average response time around 45ms with moderate variability"
  }
}

The AI should:
1. Perform the statistical computations
2. Provide results in the appropriate structured format
3. Include reasoning and interpretation
4. Track assumptions and limitations
5. Set nextEntryNeeded appropriately for multi-step analyses`,
			inputSchema: {
				type: "object" as const,
				properties: {
					entry: {
						type: "string",
						description: "Description of the statistical analysis performed",
					},
					entryNumber: {
						type: "integer",
						description: "Current analysis step number",
						minimum: 1,
					},
					totalEntries: {
						type: "integer",
						description: "Estimated total analyses needed",
						minimum: 1,
					},
					nextEntryNeeded: {
						type: "boolean",
						description: "Whether more analysis is needed",
					},
					statistic: {
						type: "object",
						description: "Statistical analysis results with type-specific structure",
						properties: {
							type: {
								type: "string",
								enum: [
									"descriptive",
									"inferential",
									"bayesian",
									"correlation",
									"regression",
									"monte-carlo",
									"time-series",
									"distribution",
								],
								description: "Type of statistical analysis",
							},
						},
						required: ["type"],
					},
					metadata: {
						type: "object",
						description: "Optional metadata about the analysis",
						properties: {
							dataSource: { type: "string" },
							context: { type: "string" },
							timestamp: { type: "string" },
							references: { type: "array", items: { type: "string" } },
						},
					},
				},
				required: ["entry", "entryNumber", "totalEntries", "nextEntryNeeded", "statistic"],
			},
		};
	}
}

// Export singleton instance
export default new StatisticalReasoningOperation();
