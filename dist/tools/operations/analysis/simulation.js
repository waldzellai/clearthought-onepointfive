/**
 * Simulation Operation - Structured Journal Pattern
 *
 * Tracks simulation steps provided by AI reasoning.
 * AI provides simulation steps through journal entries - we don't run simulations,
 * we validate and track what the AI has reasoned about.
 */
import { BaseOperation } from "../base.js";
export class SimulationOperation extends BaseOperation {
	name = "simulation";
	category = "analysis";
	async execute(context) {
		const { sessionState, parameters } = context;
		const prompt = this.getParam(parameters, "prompt", "");
		// Get simulation configuration from parameters
		const simulationType = this.getParam(parameters, "simulationType", "system-dynamics");
		// Get journal entries from AI
		const journalEntries = this.getParam(parameters, "journalEntries", []);
		// Validate we have entries
		if (journalEntries.length === 0) {
			return this.createResult({
				error: "No simulation journal entries provided",
				prompt: this.buildSimulationPrompt(simulationType, prompt),
				simulationType,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
			});
		}
		// Process and validate journal entries
		const processedResults = this.processJournalEntries(journalEntries, simulationType);
		// Build simulation result from journal entries
		const simulationResult = this.buildSimulationResult(
			processedResults.validatedEntries,
			simulationType,
		);
		// Generate analysis and insights
		const analysis = this.analyzeSimulationResults(simulationResult);
		const insights = this.generateInsights(simulationResult, simulationType, processedResults);
		const recommendations = this.generateRecommendations(
			simulationResult,
			simulationType,
			processedResults,
		);
		return this.createResult({
			simulationType,
			result: simulationResult,
			journalEntries: processedResults.validatedEntries,
			validation: processedResults.validation,
			analysis,
			insights,
			recommendations,
			sessionContext: {
				sessionId: sessionState.sessionId,
				stats: sessionState.getStats(),
			},
		});
	}
	/**
	 * Build prompt to guide AI in providing simulation journal entries
	 */
	buildSimulationPrompt(simulationType, userPrompt) {
		const basePrompt = `# Simulation Journal Entry Format

You are running a ${simulationType} simulation. For each simulation step, provide a journal entry in this format:

\`\`\`json
{
  "entry": "Population grows from 1000 to 1020 in step 1",
  "entryNumber": 1,
  "simulationStep": {
    "stepNumber": 1,
    "state": {
      "population": 1020,
      "growth_rate": 0.02,
      "resources": 990
    },
    "changes": {
      "population": +20,
      "resources": -10
    },
    "reasoning": "Applied exponential growth formula: pop * (1 + rate). Resources consumed at 0.01 per capita.",
    "metadata": {
      "formula": "pop_new = pop_old * (1 + growth_rate)",
      "constraints": ["resources >= 0", "population >= 0"]
    }
  }
}
\`\`\`

## Key Requirements:

1. **entry**: Natural language description of what happened in this step
2. **entryNumber**: Sequential numbering of journal entries
3. **simulationStep**: Contains:
   - **stepNumber**: The simulation step number
   - **state**: Complete state after this step (all variables)
   - **changes**: What changed from previous step (delta values, use +/- prefix)
   - **reasoning**: WHY these changes occurred (formulas, rules applied)
   - **metadata** (optional): Additional context (formulas used, constraints, events)

## Simulation Type: ${simulationType}

${this.getSimulationTypeGuidance(simulationType)}

## Your Task:

${userPrompt}

Provide simulation journal entries following the format above.`;
		return basePrompt;
	}
	/**
	 * Get simulation-type-specific guidance
	 */
	getSimulationTypeGuidance(simulationType) {
		const guidance = {
			"system-dynamics": `
**System Dynamics Simulation:**
- Track continuous variables over time
- Apply differential equations or difference equations
- Show feedback loops and accumulations
- Include stock and flow relationships`,
			"agent-based": `
**Agent-Based Simulation:**
- Track individual agent states and behaviors
- Show agent interactions and emergent patterns
- Include spatial information if relevant
- Report aggregate statistics (averages, counts)`,
			"monte-carlo": `
**Monte Carlo Simulation:**
- Run multiple iterations with random variations
- Track probability distributions
- Report mean, standard deviation, confidence intervals
- Show range of possible outcomes`,
			"discrete-event": `
**Discrete Event Simulation:**
- Process events at specific time points
- Track event queue and system state changes
- Show causality between events
- Include event timing and ordering`,
			"cellular-automata": `
**Cellular Automata Simulation:**
- Track grid/cell states over time
- Show rule applications and pattern evolution
- Include spatial statistics (density, clusters)
- Report emergent structures`,
		};
		return guidance[simulationType] || "";
	}
	/**
	 * Process and validate journal entries from AI
	 */
	processJournalEntries(entries, simulationType) {
		const validatedEntries = [];
		const issues = [];
		let validCount = 0;
		let invalidCount = 0;
		let warningCount = 0;
		// Sort entries by entry number
		const sortedEntries = [...entries].sort((a, b) => a.entryNumber - b.entryNumber);
		let previousStep = null;
		for (const entry of sortedEntries) {
			const validation = this.validateJournalEntry(entry, previousStep, simulationType);
			// Add validation status to entry
			const validatedEntry = {
				...entry,
				validationStatus: validation.isValid
					? "valid"
					: validation.warnings.length > 0
						? "warning"
						: "invalid",
				validationMessages: [...validation.messages, ...validation.warnings],
			};
			validatedEntries.push(validatedEntry);
			if (validation.isValid) {
				validCount++;
				previousStep = entry.simulationStep;
			} else {
				invalidCount++;
				issues.push(`Entry ${entry.entryNumber}: ${validation.messages.join("; ")}`);
			}
			if (validation.warnings.length > 0) {
				warningCount++;
			}
		}
		return {
			validatedEntries,
			validation: {
				totalEntries: entries.length,
				validEntries: validCount,
				invalidEntries: invalidCount,
				warnings: warningCount,
			},
			issues,
		};
	}
	/**
	 * Validate a single journal entry
	 */
	validateJournalEntry(entry, previousStep, simulationType) {
		const messages = [];
		const warnings = [];
		// Check required fields
		if (!entry.entry || typeof entry.entry !== "string") {
			messages.push("Missing or invalid 'entry' field");
		}
		if (typeof entry.entryNumber !== "number" || entry.entryNumber < 1) {
			messages.push("Invalid 'entryNumber': must be positive number");
		}
		if (!entry.simulationStep) {
			messages.push("Missing 'simulationStep' object");
			return { isValid: false, messages, warnings };
		}
		const step = entry.simulationStep;
		// Validate simulation step
		if (typeof step.stepNumber !== "number" || step.stepNumber < 1) {
			messages.push("Invalid 'stepNumber': must be positive number");
		}
		if (!step.state || typeof step.state !== "object") {
			messages.push("Missing or invalid 'state' object");
		}
		if (!step.changes || typeof step.changes !== "object") {
			messages.push("Missing or invalid 'changes' object");
		}
		if (!step.reasoning || typeof step.reasoning !== "string") {
			messages.push("Missing or invalid 'reasoning' string");
		}
		// Validate state values are numbers
		if (step.state) {
			for (const [key, value] of Object.entries(step.state)) {
				if (typeof value !== "number") {
					messages.push(`State variable '${key}' must be a number`);
				}
			}
		}
		// Validate changes match state (if we have previous step)
		if (previousStep && step.state && step.changes) {
			for (const [key, change] of Object.entries(step.changes)) {
				if (typeof change !== "number") {
					messages.push(`Change value for '${key}' must be a number`);
					continue;
				}
				const previousValue = previousStep.state[key] ?? 0;
				const currentValue = step.state[key] ?? 0;
				const expectedValue = previousValue + change;
				// Allow small floating point errors
				if (Math.abs(currentValue - expectedValue) > 0.0001) {
					warnings.push(
						`Change inconsistency for '${key}': ` +
							`previous=${previousValue}, change=${change}, ` +
							`expected=${expectedValue}, actual=${currentValue}`,
					);
				}
			}
		}
		// Type-specific validation
		this.validateSimulationType(step, simulationType, messages, warnings);
		return {
			isValid: messages.length === 0,
			messages,
			warnings,
		};
	}
	/**
	 * Validation specific to simulation type
	 */
	validateSimulationType(step, simulationType, messages, warnings) {
		switch (simulationType) {
			case "agent-based":
				// Should have agent-related metrics
				if (step.state) {
					const hasAgentMetrics =
						"agent_count" in step.state ||
						"active_agents" in step.state ||
						"total_agents" in step.state;
					if (!hasAgentMetrics) {
						warnings.push("Agent-based simulation should include agent count metrics");
					}
				}
				break;
			case "monte-carlo":
				// Should have statistical measures
				if (step.state && step.stepNumber > 10) {
					const hasStats =
						Object.keys(step.state).some((k) => k.includes("_mean")) ||
						Object.keys(step.state).some((k) => k.includes("_std"));
					if (!hasStats) {
						warnings.push("Monte Carlo simulation should include statistical measures (mean, std)");
					}
				}
				break;
			case "cellular-automata":
				// Should have grid/cell metrics
				if (step.state) {
					const hasCellMetrics =
						"alive_cells" in step.state || "density" in step.state || "cell_count" in step.state;
					if (!hasCellMetrics) {
						warnings.push("Cellular automata simulation should include cell/grid metrics");
					}
				}
				break;
			case "discrete-event":
				// Should have event-related info
				if (step.metadata && !("event" in step.metadata) && !("events" in step.metadata)) {
					warnings.push("Discrete-event simulation should include event information in metadata");
				}
				break;
		}
	}
	/**
	 * Build simulation result from validated journal entries
	 */
	buildSimulationResult(entries, simulationType) {
		const validEntries = entries.filter((e) => e.validationStatus === "valid");
		if (validEntries.length === 0) {
			return {
				steps: 0,
				trajectory: [],
				finalState: {},
			};
		}
		// Build trajectory from entries
		const trajectory = validEntries.map((entry) => ({
			time: entry.simulationStep.stepNumber,
			...entry.simulationStep.state,
		}));
		const finalStep = validEntries[validEntries.length - 1].simulationStep;
		return {
			steps: validEntries.length,
			trajectory,
			finalState: finalStep.state,
		};
	}
	/**
	 * Analyze simulation results from journal entries
	 */
	analyzeSimulationResults(result) {
		const analysis = {};
		if (result.trajectory.length === 0) {
			return { error: "No trajectory data to analyze" };
		}
		// Find trends in key variables
		const firstState = result.trajectory[0];
		const lastState = result.trajectory[result.trajectory.length - 1];
		analysis.trends = {};
		for (const key of Object.keys(firstState)) {
			if (typeof firstState[key] === "number" && key !== "time") {
				const initial = firstState[key];
				const final = lastState[key];
				const change = final - initial;
				const percentChange = initial !== 0 ? (change / initial) * 100 : 0;
				analysis.trends[key] = {
					initial,
					final,
					change,
					percentChange,
					direction: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
				};
			}
		}
		// Identify equilibrium
		analysis.equilibrium = this.checkEquilibrium(result.trajectory);
		// Find peaks and valleys
		analysis.extremes = this.findExtremes(result.trajectory);
		// Calculate rates of change
		analysis.ratesOfChange = this.calculateRatesOfChange(result.trajectory);
		return analysis;
	}
	/**
	 * Check if variables have reached equilibrium
	 */
	checkEquilibrium(trajectory) {
		const equilibrium = {};
		if (trajectory.length < 10) return equilibrium;
		const windowSize = Math.min(10, Math.floor(trajectory.length / 3));
		const lastStates = trajectory.slice(-windowSize);
		for (const key of Object.keys(trajectory[0])) {
			if (typeof trajectory[0][key] === "number" && key !== "time") {
				const values = lastStates.map((state) => state[key]);
				const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
				const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
				const stdDev = Math.sqrt(variance);
				// Consider equilibrium if coefficient of variation is very small
				const coefficientOfVariation = mean !== 0 ? stdDev / Math.abs(mean) : 0;
				equilibrium[key] = coefficientOfVariation < 0.05;
			}
		}
		return equilibrium;
	}
	/**
	 * Find extreme values in trajectory
	 */
	findExtremes(trajectory) {
		const extremes = {};
		for (const key of Object.keys(trajectory[0])) {
			if (typeof trajectory[0][key] === "number" && key !== "time") {
				const values = trajectory.map((state) => state[key]);
				const minValue = Math.min(...values);
				const maxValue = Math.max(...values);
				const minIndex = values.indexOf(minValue);
				const maxIndex = values.indexOf(maxValue);
				extremes[key] = {
					min: minValue,
					max: maxValue,
					minTime: trajectory[minIndex].time,
					maxTime: trajectory[maxIndex].time,
					range: maxValue - minValue,
				};
			}
		}
		return extremes;
	}
	/**
	 * Calculate rates of change for variables
	 */
	calculateRatesOfChange(trajectory) {
		const rates = {};
		if (trajectory.length < 2) return rates;
		for (const key of Object.keys(trajectory[0])) {
			if (typeof trajectory[0][key] === "number" && key !== "time") {
				const changes = [];
				for (let i = 1; i < trajectory.length; i++) {
					const prev = trajectory[i - 1][key];
					const curr = trajectory[i][key];
					const timeDiff = trajectory[i].time - trajectory[i - 1].time;
					if (timeDiff > 0) {
						changes.push((curr - prev) / timeDiff);
					}
				}
				if (changes.length > 0) {
					const meanRate = changes.reduce((sum, r) => sum + r, 0) / changes.length;
					const maxRate = Math.max(...changes);
					const minRate = Math.min(...changes);
					rates[key] = {
						meanRate,
						maxRate,
						minRate,
						accelerating: changes[changes.length - 1] > changes[0],
					};
				}
			}
		}
		return rates;
	}
	/**
	 * Generate insights from simulation results and journal entries
	 */
	generateInsights(result, simulationType, processedResults) {
		const insights = [];
		if (result.trajectory.length === 0) {
			insights.push("Simulation produced no valid data to analyze");
			return insights;
		}
		const analysis = this.analyzeSimulationResults(result);
		// Validation insights
		if (processedResults.validation.invalidEntries > 0) {
			insights.push(
				`${processedResults.validation.invalidEntries} invalid journal entries were found and excluded`,
			);
		}
		if (processedResults.validation.warnings > 0) {
			insights.push(`${processedResults.validation.warnings} entries had validation warnings`);
		}
		// Equilibrium insights
		if (analysis.equilibrium) {
			const equilibriumVars = Object.entries(analysis.equilibrium)
				.filter(([, isEquilibrium]) => isEquilibrium)
				.map(([key]) => key);
			if (equilibriumVars.length > 0) {
				insights.push(`Variables reaching equilibrium: ${equilibriumVars.join(", ")}`);
			}
		}
		// Trend insights
		if (analysis.trends) {
			for (const [key, trend] of Object.entries(analysis.trends)) {
				const t = trend;
				if (Math.abs(t.percentChange) > 50) {
					insights.push(
						`${key} ${t.direction} significantly: ${t.percentChange.toFixed(1)}% change`,
					);
				}
			}
		}
		// Type-specific insights
		switch (simulationType) {
			case "system-dynamics":
				insights.push("System dynamics simulation tracks continuous variable evolution over time");
				if (analysis.ratesOfChange) {
					const accelerating = Object.entries(analysis.ratesOfChange)
						.filter(([, r]) => r.accelerating)
						.map(([key]) => key);
					if (accelerating.length > 0) {
						insights.push(`Accelerating growth detected in: ${accelerating.join(", ")}`);
					}
				}
				break;
			case "agent-based":
				insights.push("Agent-based simulation reveals emergent collective behavior");
				break;
			case "monte-carlo":
				insights.push("Monte Carlo simulation provides statistical distributions");
				break;
			case "discrete-event":
				insights.push("Discrete-event simulation shows state changes at event boundaries");
				break;
			case "cellular-automata":
				insights.push("Cellular automata simulation shows spatial pattern evolution");
				break;
		}
		return insights;
	}
	/**
	 * Generate recommendations based on results
	 */
	generateRecommendations(result, simulationType, processedResults) {
		const recommendations = [];
		// Data quality recommendations
		if (processedResults.validation.invalidEntries > 0) {
			recommendations.push(
				"Review and correct invalid journal entries to improve simulation accuracy",
			);
		}
		if (processedResults.validation.warnings > 0) {
			recommendations.push(
				"Investigate validation warnings - they may indicate inconsistencies in reasoning",
			);
		}
		// General recommendations
		recommendations.push("Validate simulation results against real-world data if available");
		recommendations.push("Consider sensitivity analysis by varying key parameters");
		if (result.steps < 50) {
			recommendations.push(
				"Consider running longer simulations to observe long-term behavior and equilibrium states",
			);
		}
		// Type-specific recommendations
		switch (simulationType) {
			case "system-dynamics":
				recommendations.push("Examine feedback loops and their stability");
				recommendations.push("Check for conservation laws (energy, mass, etc.)");
				break;
			case "agent-based":
				recommendations.push("Experiment with different agent behaviors and interaction rules");
				recommendations.push("Analyze emergent patterns at different scales");
				break;
			case "monte-carlo":
				if (result.steps < 1000) {
					recommendations.push(
						"Increase number of iterations for more stable statistical estimates",
					);
				}
				recommendations.push("Report confidence intervals with all estimates");
				break;
			case "discrete-event":
				recommendations.push("Verify event ordering and causality");
				recommendations.push("Check for race conditions between concurrent events");
				break;
			case "cellular-automata":
				recommendations.push("Explore different initial conditions");
				recommendations.push("Analyze pattern stability and periodicity");
				break;
		}
		return recommendations;
	}
}
export default new SimulationOperation();
