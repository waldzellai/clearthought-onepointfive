/**
 * Statistical Reasoning Operation
 *
 * Performs statistical analysis and probabilistic reasoning
 */
import { BaseOperation } from "../base.js";
export class StatisticalReasoningOperation extends BaseOperation {
	name = "statistical_reasoning";
	category = "analysis";
	async execute(context) {
		const { sessionState, prompt, parameters } = context;
		const analysisType = this.getParam(parameters, "analysisType", "descriptive");
		const data = parameters.data || this.extractNumericData(prompt);
		const confidence = this.getParam(parameters, "confidence", 0.95);
		const hypothesis = this.getParam(parameters, "hypothesis", "");
		let result = {};
		switch (analysisType) {
			case "descriptive":
				result = this.performDescriptiveAnalysis(data);
				break;
			case "hypothesis-test":
				result = this.performHypothesisTest(data, hypothesis, confidence);
				break;
			case "bayesian": {
				const prior = parameters.prior || {};
				const likelihood = parameters.likelihood || {};
				result = this.performBayesianUpdate(prior, likelihood);
				break;
			}
			case "monte-carlo": {
				const distribution = this.getParam(parameters, "distribution", "normal");
				const samples = this.getParam(parameters, "samples", 1000);
				result = this.performMonteCarloSimulation(distribution, samples, parameters);
				break;
			}
			case "correlation": {
				const dataY = parameters.dataY || [];
				result = this.analyzeCorrelation(data, dataY);
				break;
			}
			default:
				result = { error: `Unknown analysis type: ${analysisType}` };
		}
		return this.createResult({
			analysisType,
			result,
			dataSize: data.length,
			interpretation: this.generateInterpretation(analysisType, result),
			assumptions: this.listAssumptions(analysisType),
			recommendations: this.generateRecommendations(analysisType, result),
			sessionContext: {
				sessionId: sessionState.sessionId,
				stats: sessionState.getStats(),
			},
		});
	}
	extractNumericData(prompt) {
		const numbers = prompt.match(/\b\d+(?:\.\d+)?\b/g);
		return numbers ? numbers.map(Number).filter((n) => !isNaN(n)) : this.generateSampleData();
	}
	generateSampleData() {
		// Generate sample data for demonstration
		const data = [];
		for (let i = 0; i < 20; i++) {
			data.push(Math.random() * 100 + 50);
		}
		return data;
	}
	performDescriptiveAnalysis(data) {
		if (data.length === 0) {
			return { mean: 0, variance: 0, stddev: 0, min: 0, max: 0, n: 0 };
		}
		const n = data.length;
		const mean = data.reduce((sum, x) => sum + x, 0) / n;
		const variance = data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1);
		const stddev = Math.sqrt(variance);
		const min = Math.min(...data);
		const max = Math.max(...data);
		return { mean, variance, stddev, min, max, n };
	}
	performHypothesisTest(data, hypothesis, confidence) {
		const stats = this.performDescriptiveAnalysis(data);
		// Simple one-sample t-test against population mean of 0
		const populationMean = 0;
		const tStatistic = (stats.mean - populationMean) / (stats.stddev / Math.sqrt(stats.n));
		const dof = stats.n - 1;
		// Approximate p-value calculation (simplified)
		const pValue = this.approximateTTestPValue(Math.abs(tStatistic), dof);
		// Effect size (Cohen's d)
		const effectSize = Math.abs(stats.mean - populationMean) / stats.stddev;
		return {
			test: "t",
			statistic: tStatistic,
			pValue,
			dof,
			effectSize,
		};
	}
	approximateTTestPValue(tStat, dof) {
		// Very simplified p-value approximation
		if (tStat > 3) return 0.001;
		if (tStat > 2.5) return 0.01;
		if (tStat > 2) return 0.05;
		if (tStat > 1.5) return 0.1;
		return 0.2;
	}
	performBayesianUpdate(prior, likelihood) {
		const posterior = {};
		let evidence = 0;
		// Calculate evidence (marginal likelihood)
		for (const key in prior) {
			evidence += (prior[key] || 0) * (likelihood[key] || 0);
		}
		// Calculate posterior
		for (const key in prior) {
			if (evidence > 0) {
				posterior[key] = ((prior[key] || 0) * (Number(likelihood[key]) || 0)) / evidence;
			} else {
				posterior[key] = prior[key] || 0;
			}
		}
		return { prior, likelihood, posterior, evidence };
	}
	performMonteCarloSimulation(distribution, samples, parameters) {
		const results = [];
		for (let i = 0; i < samples; i++) {
			let sample;
			switch (distribution) {
				case "normal": {
					const mean = this.getParam(parameters, "mean", 0);
					const stddev = this.getParam(parameters, "stddev", 1);
					sample = this.normalRandom(mean, stddev);
					break;
				}
				case "uniform": {
					const min = this.getParam(parameters, "min", 0);
					const max = this.getParam(parameters, "max", 1);
					sample = Math.random() * (max - min) + min;
					break;
				}
				case "exponential": {
					const lambda = this.getParam(parameters, "lambda", 1);
					sample = -Math.log(Math.random()) / lambda;
					break;
				}
				default:
					sample = Math.random();
			}
			results.push(sample);
		}
		const stats = this.performDescriptiveAnalysis(results);
		const sorted = results.sort((a, b) => a - b);
		return {
			samples,
			mean: stats.mean,
			stddev: stats.stddev,
			percentile: {
				5: sorted[Math.floor(samples * 0.05)],
				25: sorted[Math.floor(samples * 0.25)],
				50: sorted[Math.floor(samples * 0.5)],
				75: sorted[Math.floor(samples * 0.75)],
				95: sorted[Math.floor(samples * 0.95)],
			},
		};
	}
	normalRandom(mean = 0, stddev = 1) {
		// Box-Muller transformation
		const u1 = Math.random();
		const u2 = Math.random();
		const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
		return z0 * stddev + mean;
	}
	analyzeCorrelation(dataX, dataY) {
		if (dataX.length !== dataY.length || dataX.length === 0) {
			return { correlation: 0, interpretation: "Invalid or mismatched data" };
		}
		const n = dataX.length;
		const meanX = dataX.reduce((sum, x) => sum + x, 0) / n;
		const meanY = dataY.reduce((sum, y) => sum + y, 0) / n;
		let numerator = 0;
		let denominatorX = 0;
		let denominatorY = 0;
		for (let i = 0; i < n; i++) {
			const xDiff = dataX[i] - meanX;
			const yDiff = dataY[i] - meanY;
			numerator += xDiff * yDiff;
			denominatorX += xDiff * xDiff;
			denominatorY += yDiff * yDiff;
		}
		const correlation = numerator / Math.sqrt(denominatorX * denominatorY);
		let interpretation;
		const absCorr = Math.abs(correlation);
		if (absCorr > 0.8) interpretation = "Strong correlation";
		else if (absCorr > 0.5) interpretation = "Moderate correlation";
		else if (absCorr > 0.3) interpretation = "Weak correlation";
		else interpretation = "Very weak or no correlation";
		return { correlation, interpretation };
	}
	generateInterpretation(analysisType, result) {
		const interpretations = [];
		switch (analysisType) {
			case "descriptive":
				if (result.stddev < result.mean * 0.1) {
					interpretations.push("Data shows low variability");
				}
				interpretations.push(`Average value is ${result.mean.toFixed(2)}`);
				break;
			case "hypothesis-test":
				if (result.pValue < 0.05) {
					interpretations.push("Statistically significant result (p < 0.05)");
				} else {
					interpretations.push("No significant evidence against null hypothesis");
				}
				if (result.effectSize > 0.8) {
					interpretations.push("Large effect size detected");
				}
				break;
			case "bayesian": {
				const maxPosterior = Math.max(
					...Object.values(result.posterior).map((v) => Number(v) || 0),
				);
				const mostLikely = Object.keys(result.posterior).find(
					(key) => result.posterior[key] === maxPosterior,
				);
				interpretations.push(`Most probable outcome: ${mostLikely}`);
				break;
			}
			case "monte-carlo":
				interpretations.push(`Simulation with ${result.samples} samples completed`);
				interpretations.push(
					`95% confidence interval: [${result.percentile["5"].toFixed(2)}, ${result.percentile["95"].toFixed(2)}]`,
				);
				break;
		}
		return interpretations;
	}
	listAssumptions(analysisType) {
		const assumptions = [];
		switch (analysisType) {
			case "hypothesis-test":
				assumptions.push("Data is normally distributed");
				assumptions.push("Observations are independent");
				assumptions.push("Equal variances (if comparing groups)");
				break;
			case "correlation":
				assumptions.push("Linear relationship between variables");
				assumptions.push("No extreme outliers");
				assumptions.push("Variables are continuous");
				break;
			case "monte-carlo":
				assumptions.push("Random number generator is adequate");
				assumptions.push("Sufficient number of samples for convergence");
				break;
			default:
				assumptions.push("Data quality is adequate for analysis");
		}
		return assumptions;
	}
	generateRecommendations(analysisType, result) {
		const recommendations = [];
		if (analysisType === "hypothesis-test" && result.pValue > 0.05) {
			recommendations.push("Consider increasing sample size for more power");
			recommendations.push("Check for violations of test assumptions");
		}
		if (analysisType === "descriptive" && result.n < 30) {
			recommendations.push("Small sample size - interpret results cautiously");
		}
		recommendations.push("Validate findings with additional data or methods");
		recommendations.push("Consider practical significance alongside statistical significance");
		return recommendations;
	}
}
export default new StatisticalReasoningOperation();
