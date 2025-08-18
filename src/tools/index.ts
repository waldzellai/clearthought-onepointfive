import { z } from "zod";
import { EphemeralNotebookStore } from "../notebook/EphemeralNotebook.js";
import { getPresetForPattern } from "../notebook/presets.js";
import type { SessionState } from "../state/SessionState.js";
import type {
	AnalogicalReasoningData,
	AnalogyMapping,
	BayesianUpdateResult,
	CausalAnalysisResult,
	CausalEdge,
	CausalGraph,
	EthicalAssessment,
	HypothesisTestResult,
	Intervention,
	MonteCarloResult,
	OptimizationResult,
	ResearchFinding,
	ResearchResult,
	ResearchSource,
	SimulationResult,
	SummaryStats,
} from "../types/index.js";
import { executePython } from "../utils/execution.js";
import { enhanceResponseWithNotebook } from "./notebookEnhancement.js";

// Initialize notebook store
const notebookStore = new EphemeralNotebookStore();

/**
 * Helper function to generate dashboard HTML content
 */
function generateDashboardHTML(options: {
	title: string;
	visualizationType: string;
	data: any;
	panels: any[];
	layout: string;
	interactive: boolean;
}): string {
	const { title, visualizationType, data, panels, layout, interactive } = options;
	
	// Generate HTML with embedded Chart.js or D3.js visualization
	const chartScript = visualizationType === "chart" ? `
		<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
		<script>
			const ctx = document.getElementById('mainChart').getContext('2d');
			const chart = new Chart(ctx, {
				type: '${data.chartType || "bar"}',
				data: ${JSON.stringify(data.chartData || {
					labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
					datasets: [{
						label: 'Dataset',
						data: [12, 19, 3, 5, 2],
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						borderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 1
					}]
				})},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: true },
						tooltip: { enabled: ${interactive} }
					}
				}
			});
		</script>
	` : "";
	
	const panelsHTML = panels.map((panel, index) => `
		<div class="panel" style="
			padding: 15px;
			margin: 10px;
			border: 1px solid #ddd;
			border-radius: 8px;
			background: white;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		">
			<h3>${panel.title || `Panel ${index + 1}`}</h3>
			<div class="panel-content">
				${panel.content || `<p>Panel content for ${panel.type || 'metric'}</p>`}
				${panel.value ? `<div class="metric-value" style="font-size: 2em; font-weight: bold; color: #2196F3;">${panel.value}</div>` : ''}
			</div>
		</div>
	`).join('');
	
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>${title}</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					margin: 0;
					padding: 20px;
					background: #f5f5f5;
				}
				.dashboard {
					max-width: 1200px;
					margin: 0 auto;
				}
				.header {
					background: white;
					padding: 20px;
					border-radius: 8px;
					margin-bottom: 20px;
					box-shadow: 0 2px 4px rgba(0,0,0,0.1);
				}
				.panels-container {
					display: ${layout === 'grid' ? 'grid' : 'flex'};
					grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
					gap: 20px;
					flex-wrap: ${layout === 'flex' ? 'wrap' : 'nowrap'};
				}
				.chart-container {
					background: white;
					padding: 20px;
					border-radius: 8px;
					box-shadow: 0 2px 4px rgba(0,0,0,0.1);
					height: 400px;
					margin-bottom: 20px;
				}
				canvas {
					width: 100% !important;
					height: 100% !important;
				}
			</style>
		</head>
		<body>
			<div class="dashboard">
				<div class="header">
					<h1>${title}</h1>
					<p>Interactive Dashboard - ${new Date().toLocaleString()}</p>
				</div>
				${visualizationType === 'chart' ? `
					<div class="chart-container">
						<canvas id="mainChart"></canvas>
					</div>
				` : ''}
				<div class="panels-container">
					${panelsHTML}
				</div>
			</div>
			${chartScript}
			${interactive ? `
				<script>
					// Enable interactive features
					window.parent.postMessage({
						type: 'ui-lifecycle-iframe-ready',
						payload: { ready: true }
					}, '*');
					
					// Handle clicks on panels
					document.querySelectorAll('.panel').forEach((panel, index) => {
						panel.style.cursor = 'pointer';
						panel.addEventListener('click', () => {
							window.parent.postMessage({
								type: 'notify',
								payload: { 
									message: 'Panel ' + (index + 1) + ' clicked'
								}
							}, '*');
						});
					});
				</script>
			` : ''}
		</body>
		</html>
	`;
}

/**
 * Helper function to generate remote DOM script for dynamic content
 */
function generateRemoteDomScript(options: {
	visualizationType: string;
	data: any;
	panels: any[];
	interactive: boolean;
}): string {
	const { visualizationType, data, panels, interactive } = options;
	
	return `
		// Create dashboard container
		const container = document.createElement('ui-container');
		container.style.padding = '20px';
		
		// Add title
		const title = document.createElement('ui-text');
		title.textContent = 'Dynamic Dashboard';
		title.style.fontSize = '24px';
		title.style.fontWeight = 'bold';
		title.style.marginBottom = '20px';
		container.appendChild(title);
		
		// Add panels
		${panels.map((panel, index) => `
			const panel${index} = document.createElement('ui-panel');
			panel${index}.style.padding = '15px';
			panel${index}.style.margin = '10px';
			panel${index}.style.border = '1px solid #ddd';
			panel${index}.style.borderRadius = '8px';
			
			const panelTitle${index} = document.createElement('ui-text');
			panelTitle${index}.textContent = '${panel.title || `Panel ${index + 1}`}';
			panelTitle${index}.style.fontWeight = 'bold';
			panel${index}.appendChild(panelTitle${index});
			
			${panel.value ? `
				const panelValue${index} = document.createElement('ui-text');
				panelValue${index}.textContent = '${panel.value}';
				panelValue${index}.style.fontSize = '2em';
				panelValue${index}.style.color = '#2196F3';
				panel${index}.appendChild(panelValue${index});
			` : ''}
			
			${interactive ? `
				panel${index}.style.cursor = 'pointer';
				panel${index}.onclick = () => {
					window.parent.postMessage({
						type: 'tool',
						payload: {
							toolName: 'handlePanelClick',
							params: { panelId: ${index} }
						}
					}, '*');
				};
			` : ''}
			
			container.appendChild(panel${index});
		`).join('\n')}
		
		// Append to root
		root.appendChild(container);
		
		// Send ready signal
		window.parent.postMessage({
			type: 'ui-lifecycle-iframe-ready',
			payload: { ready: true }
		}, '*');
	`;
}

/**
 * Registers the unified Clear Thought tool with the MCP server
 *
 * This single tool provides access to all reasoning operations through
 * an operation parameter, following the Toolhost pattern.
 *
 * @param server - The MCP server instance
 * @param sessionState - The session state manager
 */
export const ClearThoughtParamsSchema = z.object({
	operation: z
		.enum([
			// Core thinking operations
			"sequential_thinking",
			"mental_model",
			"debugging_approach",
			"creative_thinking",
			"visual_reasoning",
			"metacognitive_monitoring",
			"scientific_method",
			// Collaborative operations
			"collaborative_reasoning",
			"decision_framework",
			"socratic_method",
			"structured_argumentation",
			// Systems and session operations
			"systems_thinking",
			"session_info",
			"session_export",
			"session_import",
			// Deep reasoning operations
			"pdr_reasoning",
			// New modules
			"research",
			"analogical_reasoning",
			"causal_analysis",
			"statistical_reasoning",
			"simulation",
			"optimization",
			"ethical_analysis",
			"visual_dashboard",
			"custom_framework",
			"code_execution",
			// Reasoning pattern operations
			"tree_of_thought",
			"beam_search",
			"mcts",
			"graph_of_thought",
			"orchestration_suggest",
			// Metagame operations
			"ooda_loop",
			"ulysses_protocol",
			// Notebook operations
			"notebook_create",
			"notebook_add_cell",
			"notebook_run_cell",
			"notebook_export",
		])
		.describe("What type of reasoning operation to perform"),
	// Common parameters
	prompt: z.string().describe("The problem, question, or challenge to work on"),
	context: z
		.string()
		.optional()
		.describe("Additional context or background information"),
	sessionId: z
		.string()
		.optional()
		.describe("Session identifier for continuity"),
	// Operation-specific parameters (will be validated based on operation)
	parameters: z
		.record(z.string(), z.unknown())
		.optional()
		.describe("Operation-specific parameters"),
	// Advanced options
	advanced: z
		.object({
			autoProgress: z
				.boolean()
				.optional()
				.describe("Automatically progress through stages when applicable"),
			saveToSession: z
				.boolean()
				.default(true)
				.describe("Save results to session state"),
			generateNextSteps: z
				.boolean()
				.default(true)
				.describe("Generate recommended next steps"),
		})
		.optional()
		.describe("Advanced reasoning options"),
});

export async function handleClearThoughtTool(
	sessionState: SessionState,
	args: z.infer<typeof ClearThoughtParamsSchema>,
): Promise<{
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
}> {
	const startTime = Date.now();
	
	try {
		// Special handling for code execution to allow real run
		if (args.operation === "code_execution") {
			const params = (args.parameters || {}) as any;
			const lang = (params.language as string) || "python";
			const code = String(params.code || "");
			const cfg = sessionState.getConfig();
			if (lang !== "python" || !cfg.allowCodeExecution) {
				const preview = await executeClearThoughtOperation(
					sessionState,
					args.operation,
					{ prompt: args.prompt, parameters: args.parameters },
				);
				
				return {
					content: [{ type: "text" as const, text: JSON.stringify(preview, null, 2) }],
				};
			}
			const result = await executePython(
				code,
				cfg.pythonCommand,
				cfg.executionTimeoutMs,
			);
			
			const executionResult: any = { toolOperation: "code_execution", ...result };
			
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(executionResult, null, 2),
					},
				],
			};
		}

		// Auto-seed most operations with a brief sequential_thinking step
		const seedExclusions = new Set([
			"sequential_thinking",
			"code_execution",
			"session_info",
			"session_export",
			"session_import",
		]);

		const shouldSeed = !seedExclusions.has(args.operation);

		// Handle async operations
		if (args.operation === "notebook_run_cell") {
			const params = (args.parameters || {}) as any;
			try {
				const execution = await notebookStore.executeCell(
					params.notebookId || "",
					params.cellId || "",
					params.timeoutMs || 5000,
				);
				
				
				const notebookResult: any = {
					toolOperation: "notebook_run_cell",
					notebookId: params.notebookId,
					cellId: params.cellId,
					execution: {
						id: execution.id,
						status: execution.status,
						outputs: execution.outputs,
						error: execution.error,
						duration: execution.completedAt
							? execution.completedAt - execution.startedAt
							: undefined,
					},
				};
				
				
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(notebookResult, null, 2),
						},
					],
				};
			} catch (error: any) {
				
				const errorResult: any = {
					toolOperation: "notebook_run_cell",
					notebookId: params.notebookId,
					cellId: params.cellId,
					error: error.message,
					success: false,
				};
				
				
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(errorResult, null, 2),
						},
					],
				};
			}
		}

		// Execute the main operation
		const result = await executeClearThoughtOperation(
			sessionState,
			args.operation,
			{ prompt: args.prompt, parameters: args.parameters },
		);
		
		const enriched = shouldSeed
			? {
					...result,
					initialThought: await executeClearThoughtOperation(
						sessionState,
						"sequential_thinking",
						{
							prompt: `Plan approach for: ${args.prompt}`,
							parameters: {
								thoughtNumber: 1,
								totalThoughts: 3,
								nextThoughtNeeded: true,
								needsMoreThoughts: true,
								pattern: "chain",
							},
						},
					),
				}
			: result;


		// Enhance response with notebook resources if applicable
		const baseResponse = {
			content: [{ type: "text" as const, text: JSON.stringify(enriched, null, 2) }],
		};

		const enhancedResponse = enhanceResponseWithNotebook(
			baseResponse,
			args.operation,
			args.prompt,
		);
		return enhancedResponse;
		
	} catch (error: any) {
		const errorResponse = {
			toolOperation: args.operation,
			error: error.message,
			success: false
		};
		
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(errorResponse, null, 2),
				},
			],
			isError: true,
		};
	}
}

// Backwards-compatible registration helper (kept for compatibility; unused by low-level Server)
export function registerTools(
	server: { tool: Function },
	sessionState: SessionState,
): void {
	server.tool(
		"clear_thought",
		"Unified Clear Thought reasoning tool - provides all reasoning operations through a single interface",
		ClearThoughtParamsSchema.shape,
		async (args: z.infer<typeof ClearThoughtParamsSchema>) =>
			handleClearThoughtTool(sessionState, args),
	);
}

/**
 * Unified Clear Thought reasoning operations
 *
 * This module provides all reasoning operations through a single interface,
 * following the websetsManager pattern without external dependencies.
 *
 * @param sessionState - The session state manager
 * @param operation - The operation to perform
 * @param args - Operation arguments
 */
export async function executeClearThoughtOperation(
	sessionState: SessionState,
	operation: string,
	args: { prompt: string; parameters?: Record<string, unknown> },
): Promise<Record<string, unknown>> {
	const { prompt, parameters = {} } = args;

	// Optional reasoning pattern selection for sequential_thinking
	const specifiedPattern = (parameters as any).pattern as
		| "chain"
		| "tree"
		| "beam"
		| "mcts"
		| "graph"
		| "auto"
		| undefined;
	const patternParams =
		((parameters as any).patternParams as Record<string, unknown>) || {};

	const selectReasoningPattern = ():
		| "chain"
		| "tree"
		| "beam"
		| "mcts"
		| "graph" => {
		if (specifiedPattern && specifiedPattern !== "auto")
			return specifiedPattern;
		// Heuristic selection from prompt/params
		const ptext = `${prompt}`.toLowerCase();
		if (
			"depth" in patternParams ||
			"breadth" in patternParams ||
			ptext.includes("branch") ||
			ptext.includes("options")
		) {
			return "tree";
		}
		if (
			"beamWidth" in patternParams ||
			ptext.includes("candidates") ||
			ptext.includes("top-k")
		) {
			return "beam";
		}
		if (
			"simulations" in patternParams ||
			ptext.includes("uncertain") ||
			ptext.includes("probability") ||
			ptext.includes("stochastic")
		) {
			return "mcts";
		}
		if (
			"nodes" in patternParams ||
			"edges" in patternParams ||
			ptext.includes("dependencies") ||
			ptext.includes("graph")
		) {
			return "graph";
		}
		return "chain";
	};

	// Type guard to ensure parameters are properly typed
	const getParam = <T>(key: string, defaultValue: T): T => {
		return (parameters[key] as T) ?? defaultValue;
	};

	// Unified handler for all operations
	switch (operation) {
		case "sequential_thinking": {
			// Choose reasoning pattern (default 'chain') and optionally dispatch
			const chosenPattern = selectReasoningPattern();
			const thoughtData = {
				thought: prompt,
				thoughtNumber: parameters.thoughtNumber || 1,
				totalThoughts: parameters.totalThoughts || 1,
				nextThoughtNeeded: parameters.nextThoughtNeeded || false,
				isRevision: parameters.isRevision,
				revisesThought: parameters.revisesThought,
				branchFromThought: parameters.branchFromThought,
				branchId: parameters.branchId,
				needsMoreThoughts: parameters.needsMoreThoughts,
			};

			const added = sessionState.addThought(thoughtData as any);
			const allThoughts = sessionState.getThoughts();
			const recentThoughts = allThoughts.slice(-3);

			// If a non-chain pattern is selected, optionally execute the corresponding pattern operation
			let patternResult: Record<string, unknown> | undefined;
			if (
				chosenPattern !== "chain" &&
				!(parameters as any).__disablePatternDispatch
			) {
				const opMap: Record<string, string> = {
					tree: "tree_of_thought",
					beam: "beam_search",
					mcts: "mcts",
					graph: "graph_of_thought",
				};
				const mappedOp = opMap[chosenPattern];
				if (mappedOp) {
					patternResult = await executeClearThoughtOperation(
						sessionState,
						mappedOp,
						{ prompt, parameters: patternParams },
					);
				}
			}

			return {
				toolOperation: "sequential_thinking",
				selectedPattern: chosenPattern,
				patternResult,
				...thoughtData,
				status: added ? "success" : "limit_reached",
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalThoughts: allThoughts.length,
					remainingThoughts: sessionState.getRemainingThoughts(),
					recentThoughts: recentThoughts.map((t) => ({
						thoughtNumber: t.thoughtNumber,
						isRevision: t.isRevision,
					})),
				},
			};
		}

		case "mental_model": {
			const modelData = {
				modelName: parameters.model || "first_principles",
				problem: prompt,
				steps: parameters.steps || [],
				reasoning: parameters.reasoning || "",
				conclusion: parameters.conclusion || "",
			};

			sessionState.addMentalModel(modelData as any);
			const allModels = sessionState.getMentalModels();

			return {
				toolOperation: "mental_model",
				...modelData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalModels: allModels.length,
					recentModels: allModels
						.slice(-3)
						.map((m) => ({ modelName: m.modelName, problem: m.problem })),
				},
			};
		}

		case "debugging_approach": {
			const debugData = {
				approachName: parameters.approach || "binary_search",
				issue: prompt,
				steps: parameters.steps || [],
				findings: parameters.findings || "",
				resolution: parameters.resolution || "",
			};

			sessionState.addDebuggingSession(debugData as any);
			const allSessions = sessionState.getDebuggingSessions();

			return {
				toolOperation: "debugging_approach",
				...debugData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalSessions: allSessions.length,
					recentSessions: allSessions
						.slice(-3)
						.map((s) => ({ approachName: s.approachName, issue: s.issue })),
				},
			};
		}

		case "creative_thinking": {
			/**
			 * Creative Thinking Operation
			 * 
			 * Generates idea seeds and connections using simple combinatorial techniques.
			 * 
			 * Expected in prompt: Creative challenge or problem to brainstorm
			 * 
			 * Expected in parameters (model should provide these or they'll be generated):
			 * - techniques?: string[] - Creative techniques to apply (default: ["brainstorming", "SCAMPER"])
			 * - numIdeas?: number - Number of ideas to generate (default: 8)
			 * - ideas?: string[] - Pre-existing ideas to build upon
			 * 
			 * The model should either provide structured ideas or the system will generate them using combinatorial techniques.
			 */
			
			// Use provided parameters or generate ideas
			let ideas = (parameters.ideas as string[]) || [];
			const techniques = (parameters.techniques as string[]) || ["brainstorming", "SCAMPER"];
			const numIdeas = getParam("numIdeas", 8);
			
			// Generate ideas if none provided
			if (ideas.length === 0 && prompt) {
				// Extract key tokens from prompt
				const tokens = prompt.toLowerCase()
					.replace(/[^a-z\s]/g, '')
					.split(/\s+/)
					.filter(t => t.length > 2);
				
				// SCAMPER verbs for idea generation
				const scamperVerbs = [
					"substitute", "combine", "adapt", "modify", 
					"put to other use", "eliminate", "reverse"
				];
				
				// Generate ideas by combining tokens with techniques
				for (let i = 0; i < numIdeas && tokens.length > 0; i++) {
					const token = tokens[i % tokens.length];
					const verb = scamperVerbs[i % scamperVerbs.length];
					const otherToken = tokens[(i + 1) % tokens.length];
					
					ideas.push(`${verb} ${token} with ${otherToken}`);
				}
			}
			
			// Generate connections between concepts
			let connections = (parameters.connections as string[]) || [];
			if (connections.length === 0 && ideas.length > 1) {
				// Create connections between ideas
				for (let i = 0; i < Math.min(ideas.length - 1, 3); i++) {
					connections.push(`${ideas[i]} could lead to ${ideas[i + 1]}`);
				}
			}
			
			// Generate insights (top-ranked ideas by novelty and coverage)
			let insights = (parameters.insights as string[]) || [];
			if (insights.length === 0 && ideas.length > 0) {
				// Simple ranking: pick ideas with rare tokens (novelty) and prompt overlap (coverage)
				const promptTokens = new Set(prompt.toLowerCase().split(/\s+/));
				
				const rankedIdeas = ideas
					.map(idea => {
						const ideaTokens = idea.toLowerCase().split(/\s+/);
						const coverage = ideaTokens.filter(t => promptTokens.has(t)).length / ideaTokens.length;
						const novelty = 1 - coverage; // Simple novelty heuristic
						const score = (coverage + novelty) / 2;
						return { idea, score };
					})
					.sort((a, b) => b.score - a.score)
					.slice(0, 3)
					.map(item => item.idea);
				
				insights = rankedIdeas;
			}
			
			const creativeData = {
				prompt: prompt,
				ideas,
				techniques,
				connections,
				insights,
				sessionId: `creative-${Date.now()}`,
				iteration: getParam("iteration", 1),
				nextIdeaNeeded: getParam("nextIdeaNeeded", false),
			};

			sessionState.addCreativeSession(creativeData as any);
			const allSessions = sessionState.getCreativeSessions();

			return {
				toolOperation: "creative_thinking",
				...creativeData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalSessions: allSessions.length,
					recentSessions: allSessions
						.slice(-3)
						.map((s) => ({ prompt: s.prompt, techniques: s.techniques })),
				},
			};
		}

		case "visual_reasoning": {
			const visualData = {
				operation: "create" as const,
				diagramId: getParam("diagramId", `diagram-${Date.now()}`),
				diagramType: getParam("diagramType", "flowchart"),
				iteration: getParam("iteration", 1),
				nextOperationNeeded: getParam("nextOperationNeeded", false),
			};

			sessionState.addVisualOperation(visualData as any);
			const allOperations = sessionState.getVisualOperations();

			return {
				toolOperation: "visual_reasoning",
				...visualData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalOperations: allOperations.length,
					recentOperations: allOperations
						.slice(-3)
						.map((v) => ({
							diagramType: v.diagramType,
							operation: v.operation,
						})),
				},
			};
		}

		case "metacognitive_monitoring": {
			/**
			 * Metacognitive Monitoring Operation
			 * 
			 * Records stage, uncertainty areas, and recommended approach; suggests assessments.
			 * 
			 * Expected in prompt: Task or problem being monitored
			 * 
			 * Expected in parameters:
			 * - stage?: 'planning' | 'monitoring' | 'evaluating' | 'reflecting'
			 * - uncertaintyAreas?: string[] - Areas of uncertainty
			 * - overallConfidence?: number - Confidence level (0-1)
			 * - recommendedApproach?: string - Suggested approach
			 */
			
			const stage = getParam("stage", "monitoring") as string;
			const uncertaintyAreas = getParam("uncertaintyAreas", []) as string[];
			const overallConfidence = getParam("overallConfidence", 0.5) as number;
			const recommendedApproach = getParam("recommendedApproach", "") as string;
			
			// Suggest assessments based on stage
			let suggestedAssessments: string[] = [];
			if (stage === "monitoring") {
				suggestedAssessments = ["knowledge", "progress", "overall"];
			} else if (stage === "evaluating") {
				suggestedAssessments = ["effectiveness", "efficiency", "completeness"];
			} else if (stage === "reflecting") {
				suggestedAssessments = ["lessons-learned", "improvements", "next-steps"];
			}
			
			const metaData = {
				task: prompt,
				stage,
				overallConfidence,
				uncertaintyAreas,
				recommendedApproach,
				suggestedAssessments,
				monitoringId: `meta-${Date.now()}`,
				iteration: getParam("iteration", 1),
				nextAssessmentNeeded: suggestedAssessments.length > 0,
			};

			sessionState.addMetacognitive(metaData as any);
			sessionState.updateKPI('overall_confidence', overallConfidence);
			const allSessions = sessionState.getMetacognitiveSessions();

			return {
				toolOperation: "metacognitive_monitoring",
				...metaData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalSessions: allSessions.length,
					recentSessions: allSessions
						.slice(-3)
						.map((m) => ({ task: m.task, stage: m.stage })),
				},
			};
		}

		case "scientific_method": {
			const scientificData = {
				stage: getParam("stage", "hypothesis") as
					| "conclusion"
					| "iteration"
					| "hypothesis"
					| "observation"
					| "question"
					| "experiment"
					| "analysis",
				inquiryId: `sci-${Date.now()}`,
				iteration: getParam("iteration", 1),
				nextStageNeeded: getParam("nextStageNeeded", false),
			};

			sessionState.addScientificInquiry(scientificData);
			const allInquiries = sessionState.getScientificInquiries();

			return {
				toolOperation: "scientific_method",
				...scientificData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					totalInquiries: allInquiries.length,
					recentInquiries: allInquiries
						.slice(-3)
						.map((s) => ({ stage: s.stage })),
				},
			};
		}

		case "collaborative_reasoning": {
			/**
			 * Collaborative Reasoning Operation
			 * 
			 * Maintains personas and contributions; suggests next contribution types.
			 * 
			 * Expected in prompt: Topic or problem for collaborative analysis
			 * 
			 * Expected in parameters:
			 * - personas?: Array<{id: string, name: string, expertise: string[]}>
			 * - contributions?: Array<{personaId: string, content: string, type: string}>
			 * - stage?: 'problem-definition' | 'exploration' | 'synthesis' | 'conclusion'
			 */
			
			const personas = (parameters.personas as any[]) || [];
			let contributions = (parameters.contributions as any[]) || [];
			const stage = getParam("stage", "problem-definition") as string;
			
			// Append a synthetic contribution from prompt if none provided
			if (contributions.length === 0 && prompt) {
				contributions.push({
					personaId: "system",
					content: prompt,
					type: "observation",
					confidence: 0.8
				});
			}
			
			// Suggest next contribution types based on stage
			let suggestedContributionTypes: string[] = [];
			switch (stage) {
				case "problem-definition":
					suggestedContributionTypes = ["question", "concern", "observation"];
					break;
				case "exploration":
					suggestedContributionTypes = ["insight", "suggestion", "challenge"];
					break;
				case "synthesis":
					suggestedContributionTypes = ["synthesis", "insight", "question"];
					break;
				case "conclusion":
					suggestedContributionTypes = ["synthesis", "concern", "observation"];
					break;
			}
			
			const collaborativeData = {
				topic: prompt,
				personas,
				contributions,
				stage,
				suggestedContributionTypes,
				nextContributionNeeded: contributions.length < 3,
				sessionId: `collab-${Date.now()}`,
			};

			return {
				toolOperation: "collaborative_reasoning",
				...collaborativeData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
			};
		}

		case "decision_framework": {
			/**
			 * Decision Framework Operation
			 * 
			 * Accepts options/criteria and computes expected-utility or multi-criteria scores.
			 * 
			 * Expected in prompt: Decision to be made
			 * 
			 * Expected in parameters:
			 * - options: Array<{id: string, name: string, attributes?: Record<string, any>}>
			 * - criteria: Array<{name: string, weight: number, type: 'maximize'|'minimize'}>
			 * - possibleOutcomes?: Array<{option: string, probability: number, value: number}>
			 * - analysisType: 'expected-utility' | 'multi-criteria'
			 */
			
			const options = (parameters.options as any[]) || [];
			const criteria = (parameters.criteria as any[]) || [];
			const possibleOutcomes = (parameters.possibleOutcomes as any[]) || [];
			const analysisType = getParam("analysisType", "multi-criteria") as string;
			
			let result: any = {};
			
			if (analysisType === "expected-utility" && possibleOutcomes.length > 0) {
				// Calculate expected values for each option
				const expectedValues: Record<string, number> = {};
				options.forEach(opt => {
					const outcomes = possibleOutcomes.filter(o => o.option === opt.id || o.option === opt.name);
					expectedValues[opt.id || opt.name] = outcomes.reduce((sum, o) => sum + (o.probability * o.value), 0);
				});
				result.expectedValues = expectedValues;
				const bestOption = Object.entries(expectedValues).reduce((best, [key, val]) => 
					val > best.value ? {id: key, value: val} : best, {id: "", value: -Infinity});
				result.recommendation = bestOption.id;
			} else if (analysisType === "multi-criteria" && criteria.length > 0) {
				// Multi-criteria scoring
				const scores: Record<string, number> = {};
				const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 1), 0);
				
				options.forEach(opt => {
					let score = 0;
					criteria.forEach(criterion => {
						const value = opt.attributes?.[criterion.name] || 0;
						const normalizedWeight = (criterion.weight || 1) / totalWeight;
						score += value * normalizedWeight;
					});
					scores[opt.id || opt.name] = score;
				});
				result.multiCriteriaScores = scores;
				const bestOption = Object.entries(scores).reduce((best, [key, val]) => 
					val > best.value ? {id: key, value: val} : best, {id: "", value: -Infinity});
				result.recommendation = bestOption.id;
			}
			
			const decisionData = {
				decisionStatement: prompt,
				options,
				criteria,
				possibleOutcomes,
				analysisType,
				...result,
				suggestedNextStage: result.recommendation ? "implementation" : "gather-more-data",
				decisionId: `decision-${Date.now()}`,
			};

			return {
				toolOperation: "decision_framework",
				...decisionData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
			};
		}

		case "socratic_method": {
			/**
			 * Socratic Method Operation
			 * 
			 * Builds claims/premises/conclusion structures through questioning.
			 * 
			 * Expected in prompt: Initial question or claim to examine
			 * 
			 * Expected in parameters:
			 * - claim?: string - The claim being examined
			 * - premises?: string[] - Supporting premises
			 * - stage?: 'clarification' | 'assumptions' | 'reasons' | 'viewpoints' | 'consequences'
			 */
			
			const claim = getParam("claim", "");
			let premises = (parameters.premises as string[]) || [];
			const stage = getParam("stage", "clarification");
			
			// Extract premises from prompt if not provided
			if (premises.length === 0 && prompt) {
				// Look for numbered or bulleted reasons
				const lines = prompt.split(/\n/);
				lines.forEach(line => {
					if (/^[\d\-\*•]/.test(line.trim())) {
						premises.push(line.replace(/^[\d\-\*•\.\)]+\s*/, '').trim());
					}
				});
			}
			
			// Calculate confidence based on premise strength
			const strengthKeywords = ['clearly', 'obviously', 'certainly', 'definitely'];
			const weaknessKeywords = ['maybe', 'perhaps', 'possibly', 'might'];
			let confidence = 0.5;
			const allText = `${claim} ${premises.join(' ')}`.toLowerCase();
			strengthKeywords.forEach(word => {
				if (allText.includes(word)) confidence += 0.1;
			});
			weaknessKeywords.forEach(word => {
				if (allText.includes(word)) confidence -= 0.1;
			});
			confidence = Math.max(0, Math.min(1, confidence));
			
			const socraticData = {
				question: prompt,
				claim,
				premises,
				conclusion: parameters.conclusion || "",
				argumentType: parameters.argumentType || "deductive",
				confidence,
				stage,
				nextArgumentNeeded: premises.length < 2,
				sessionId: `socratic-${Date.now()}`,
			};

			return {
				toolOperation: "socratic_method",
				...socraticData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
			};
		}

		case "structured_argumentation": {
			const argumentData = {
				claim: prompt,
				premises: parameters.premises || [],
				conclusion: parameters.conclusion || "",
				argumentType: parameters.argumentType || "deductive",
				confidence: parameters.confidence || 0.5,
				respondsTo: parameters.respondsTo,
				supports: parameters.supports || [],
				contradicts: parameters.contradicts || [],
				strengths: parameters.strengths || [],
				weaknesses: parameters.weaknesses || [],
				relevance: parameters.relevance || 0.5,
				sessionId: `arg-${Date.now()}`,
				iteration: parameters.iteration || 1,
				nextArgumentNeeded: parameters.nextArgumentNeeded || false,
			};

			return {
				toolOperation: "structured_argumentation",
				...argumentData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
			};
		}

		case "systems_thinking": {
			/**
			 * Systems Thinking Operation
			 * 
			 * Analyzes complex systems by identifying components, relationships, and feedback loops.
			 * 
			 * Expected in prompt: A description of the system to analyze
			 * 
			 * Expected in parameters (model should provide these based on analysis):
			 * - components: string[] - Key elements/entities in the system
			 * - relationships: Array<{from: string, to: string, type: string, strength?: number}> - How components interact
			 * - feedbackLoops: Array<{components: string[], type: 'positive'|'negative', description: string}> - Reinforcing or balancing loops
			 * - emergentProperties: string[] - Properties that arise from system interactions
			 * - leveragePoints: string[] - High-impact intervention opportunities
			 * 
			 * The model should analyze the system described in the prompt and structure it into these components.
			 */
			
			// Use provided parameters or default to empty arrays
			const components = (parameters.components as string[]) || [];
			const relationships = (parameters.relationships as any[]) || [];
			const feedbackLoops = (parameters.feedbackLoops as any[]) || [];
			const emergentProperties = (parameters.emergentProperties as string[]) || [];
			const leveragePoints = (parameters.leveragePoints as string[]) || [];

			// Validate and detect feedback loops from relationships if not provided
			if (feedbackLoops.length === 0 && relationships.length > 0) {
				const graph = new Map<string, Set<string>>();
				
				relationships.forEach((rel: any) => {
					if (!graph.has(rel.from)) graph.set(rel.from, new Set());
					graph.get(rel.from)!.add(rel.to);
				});

				// Simple cycle detection (depth 2-3)
				for (const [start, targets] of graph.entries()) {
					for (const mid of targets) {
						if (graph.has(mid)) {
							for (const end of graph.get(mid)!) {
								if (end === start) {
									// Found 2-cycle
									feedbackLoops.push({
										components: [start, mid],
										type: 'negative',
										description: `${start} -> ${mid} -> ${start}`
									});
								} else if (graph.has(end) && graph.get(end)!.has(start)) {
									// Found 3-cycle
									feedbackLoops.push({
										components: [start, mid, end],
										type: 'positive',
										description: `${start} -> ${mid} -> ${end} -> ${start}`
									});
								}
							}
						}
					}
				}
			}

			const systemsData = {
				system: prompt,
				components,
				relationships,
				feedbackLoops,
				emergentProperties,
				leveragePoints,
				sessionId: `systems-${Date.now()}`,
				iteration: parameters.iteration || 1,
				nextAnalysisNeeded: parameters.nextAnalysisNeeded || false,
			};

			// Update KPI for systems components
			if (components.length > 0) {
				sessionState.updateKPI('systems_components_count', components.length);
			}

			return {
				toolOperation: "systems_thinking",
				...systemsData,
				sessionContext: {
					sessionId: sessionState.sessionId,
					stats: sessionState.getStats(),
				},
			};
		}

		case "session_info": {
			return {
				toolOperation: "session_info",
				sessionId: sessionState.sessionId,
				stats: sessionState.getStats(),
			};
		}

		case "session_export": {
			return {
				toolOperation: "session_export",
				sessionData: sessionState.export(),
			};
		}

		case "session_import": {
			return {
				toolOperation: "session_import",
				result: "Session import completed",
			};
		}

		// -------------------- New modules --------------------
		case "pdr_reasoning": {
			// PDR uses sequential thinking with progressive refinement pattern
			return await executeClearThoughtOperation(
				sessionState,
				"sequential_thinking",
				{
					prompt,
					parameters: {
						...parameters,
						pattern: "chain",
						patternParams: {
							depth: 3,
							breadth: 2,
						},
					},
				},
			);
		}

		case "research": {
			/**
			 * Research Operation
			 * 
			 * Structures research intent and placeholders for downstream web tooling (no external calls here).
			 * 
			 * Expected in prompt: Research question or topic to investigate
			 * 
			 * Expected in parameters (model should provide these):
			 * - subqueries?: string[] - Specific sub-questions to research
			 * - findings?: ResearchFinding[] - Any pre-existing findings
			 * - citations?: ResearchSource[] - Any pre-existing sources
			 * 
			 * The model should break down the research prompt into specific, searchable questions.
			 */
			
			const subqueries = (parameters.subqueries as string[]) || [];
			let findings = (parameters.findings as ResearchFinding[]) || [];
			let citations = (parameters.citations as ResearchSource[]) || [];
			
			// If no structured input, create placeholder findings from prompt
			if (findings.length === 0 && prompt) {
				// Split prompt into claims and questions
				const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
				
				for (const sentence of sentences.slice(0, 3)) { // Limit to first 3 sentences
					const trimmed = sentence.trim();
					if (trimmed) {
						// Create placeholder finding
						findings.push({
							claim: `Research needed: ${trimmed}`,
							evidence: "[Evidence to be gathered]",
							confidence: 0.0, // No evidence yet
							sources: [] // No sources yet
						});
					}
				}
			}
			
			// Generate sub-queries if none provided
			let derivedSubqueries = subqueries;
			if (derivedSubqueries.length === 0 && prompt) {
				// Simple heuristic: look for question words and create variants
				const questionStarters = ['What', 'How', 'Why', 'When', 'Where', 'Who'];
				const keywords = prompt.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
				
				for (const starter of questionStarters.slice(0, 3)) {
					for (const keyword of keywords.slice(0, 2)) {
						derivedSubqueries.push(`${starter} ${keyword.toLowerCase()}?`);
					}
				}
				derivedSubqueries = derivedSubqueries.slice(0, 5); // Limit to 5 subqueries
			}
			
			const result: ResearchResult = {
				query: prompt,
				findings,
				citations,
			};
			
			return { 
				toolOperation: "research", 
				...result,
				subqueries: derivedSubqueries,
				note: "This operation structures research intent. Use external tools for actual web search and data gathering."
			};
		}

		case "analogical_reasoning": {
			/**
			 * Analogical Reasoning Operation
			 * 
			 * Maps source→target concept roles using pattern templates.
			 * 
			 * Expected in prompt: Description of analogy or domains to compare
			 * 
			 * Expected in parameters (model should provide these):
			 * - sourceDomain: string - The familiar domain to map from
			 * - targetDomain: string - The unfamiliar domain to map to
			 * - mappings?: AnalogyMapping[] - Explicit concept mappings
			 * - inferredInsights?: string[] - Insights derived from the analogy
			 * 
			 * The model should identify the two domains being compared and map concepts between them.
			 */
			
			let sourceDomain = getParam("sourceDomain", "");
			let targetDomain = getParam("targetDomain", "");
			let mappings = (parameters.mappings as AnalogyMapping[]) || [];
			let inferredInsights = (parameters.inferredInsights as string[]) || [];
			
			// If domains not provided, try to extract from prompt
			if (!sourceDomain || !targetDomain) {
				// Look for "X is like Y" patterns
				const analogyPatterns = [
					/([\w\s]+)\s+is\s+like\s+([\w\s]+)/gi,
					/([\w\s]+)\s+resembles\s+([\w\s]+)/gi,
					/([\w\s]+)\s+similar\s+to\s+([\w\s]+)/gi,
					/compare\s+([\w\s]+)\s+(?:to|with)\s+([\w\s]+)/gi
				];
				
				for (const pattern of analogyPatterns) {
					const match = pattern.exec(prompt);
					if (match) {
						sourceDomain = match[1].trim();
						targetDomain = match[2].trim();
						break;
					}
				}
				
				// Fallback: split on common separators
				if (!sourceDomain || !targetDomain) {
					const parts = prompt.split(/\s+(?:and|vs|versus|compared to)\s+/i);
					if (parts.length >= 2) {
						sourceDomain = parts[0].trim();
						targetDomain = parts[1].trim();
					}
				}
			}
			
			// Generate mappings if none provided and both domains exist
			if (mappings.length === 0 && sourceDomain && targetDomain) {
				// Extract core nouns from both domains
				const extractNouns = (text: string): string[] => {
					return text.toLowerCase()
						.replace(/[^a-z\s]/g, '')
						.split(/\s+/)
						.filter(word => word.length > 2 && word.length < 15)
						.slice(0, 5); // Limit to 5 concepts
				};
				
				const sourceNouns = extractNouns(sourceDomain);
				const targetNouns = extractNouns(targetDomain);
				
				// Create mappings by position and similarity
				for (let i = 0; i < Math.min(sourceNouns.length, targetNouns.length); i++) {
					mappings.push({
						sourceConcept: sourceNouns[i],
						targetConcept: targetNouns[i],
						mappingType: i === 0 ? "role" : "structure", // First mapping is role, others structure
						strength: 0.7 - (i * 0.1) // Decreasing confidence
					});
				}
				
				// Create cross-mappings for semantic similarity
				for (const sourceNoun of sourceNouns.slice(0, 2)) {
					for (const targetNoun of targetNouns.slice(0, 2)) {
						// Simple heuristic: similar starting letters or length
						if (sourceNoun[0] === targetNoun[0] || 
							Math.abs(sourceNoun.length - targetNoun.length) <= 1) {
							mappings.push({
								sourceConcept: sourceNoun,
								targetConcept: targetNoun,
								mappingType: "behavior",
								strength: 0.5
							});
							break; // Only one cross-mapping per source
						}
					}
				}
			}
			
			// Generate insights if none provided
			if (inferredInsights.length === 0 && mappings.length > 0) {
				// Generate insights based on mappings
				for (const mapping of mappings.slice(0, 3)) {
					switch (mapping.mappingType) {
						case "role":
							inferredInsights.push(`${mapping.targetConcept} plays a similar role to ${mapping.sourceConcept}`);
							break;
						case "structure":
							inferredInsights.push(`The structure of ${mapping.targetConcept} mirrors ${mapping.sourceConcept}`);
							break;
						case "behavior":
							inferredInsights.push(`${mapping.targetConcept} behaves similarly to ${mapping.sourceConcept}`);
							break;
						case "constraint":
							inferredInsights.push(`${mapping.targetConcept} has similar constraints as ${mapping.sourceConcept}`);
							break;
					}
				}
				
				// Add general insight
				if (sourceDomain && targetDomain) {
					inferredInsights.push(`Understanding ${sourceDomain} can help explain ${targetDomain}`);
				}
			}
			
			const data: AnalogicalReasoningData = {
				sourceDomain,
				targetDomain,
				mappings,
				inferredInsights,
				sessionId: `analogy-${Date.now()}`,
			};
			
			return { toolOperation: "analogical_reasoning", ...data };
		}

		case "causal_analysis": {
			/**
			 * Causal Analysis Operation
			 * 
			 * Builds a lightweight causal graph and calculates intervention effects from text.
			 * 
			 * Expected in prompt: Description of causal relationships in natural language
			 * 
			 * Expected in parameters (model should provide these based on analysis):
			 * - graph?: { nodes: string[], edges: Array<{from: string, to: string, weight?: number}> } - Causal graph structure
			 * - intervention?: { variable: string, setTo?: number|string|boolean, delta?: number } - Intervention to analyze
			 * - notes?: string[] - Additional observations
			 * 
			 * The model should extract causal relationships from the prompt and structure them into a graph.
			 * If an intervention is specified, the model should predict downstream effects.
			 */
			
			// Use provided graph or extract from prompt
			let graph = getParam("graph", { nodes: [], edges: [] }) as CausalGraph;
			
			// If no graph provided, extract from prompt using heuristics
			if (graph.nodes.length === 0 && prompt) {
				const text = prompt.toLowerCase();
				
				// Extract nodes via noun phrases (simple heuristic)
				const nodeMatches = text.match(/\b[a-z]+(?:\s+[a-z]+){0,2}\b/g) || [];
				const candidateNodes = [...new Set(nodeMatches.filter(n => n.length > 2))];
				
				// Extract edges via causal templates
				const causalPatterns = [
					/([\w\s]+)\s+(?:causes?|increases?|boosts?|improves?)\s+([\w\s]+)/g,
					/([\w\s]+)\s+(?:reduces?|decreases?|hurts?|harms?)\s+([\w\s]+)/g,
					/([\w\s]+)\s*->\s*([\w\s]+)/g,
					/([\w\s]+)\s+leads to\s+([\w\s]+)/g
				];
				
				const edges: CausalEdge[] = [];
				const nodes = new Set<string>();
				
				for (const pattern of causalPatterns) {
					let match;
					while ((match = pattern.exec(text)) !== null) {
						const from = match[1].trim();
						const to = match[2].trim();
						
						if (from && to && from !== to) {
							nodes.add(from);
							nodes.add(to);
							
							// Determine polarity from pattern
							const weight = pattern.source.includes('reduces?|decreases?|hurts?|harms?') ? -1 : 1;
							edges.push({ from, to, weight });
						}
					}
				}
				
				graph = {
					nodes: Array.from(nodes),
					edges
				};
			}
			
			// Calculate intervention effects if intervention provided
			const intervention = parameters.intervention as Intervention | undefined;
			let predictedEffects: Record<string, number> | undefined;
			let counterfactual: Record<string, number> | undefined;
			
			if (intervention && graph.edges.length > 0) {
				predictedEffects = {};
				
				// Simple propagation: for each outgoing edge from intervention variable
				for (const edge of graph.edges) {
					if (edge.from === intervention.variable) {
						const weight = edge.weight || 1;
						const delta = intervention.delta || (intervention.setTo ? 1 : 0);
						
						predictedEffects[edge.to] = (predictedEffects[edge.to] || 0) + (weight * delta);
					}
				}
				
				// Simple counterfactual: negate the intervention
				if (Object.keys(predictedEffects).length > 0) {
					counterfactual = {};
					for (const [target, effect] of Object.entries(predictedEffects)) {
						counterfactual[target] = -effect;
					}
				}
			}
			
			const result: CausalAnalysisResult = {
				graph,
				intervention,
				predictedEffects,
				counterfactual,
				notes: (parameters.notes as string[]) || []
			};
			
			// Update KPIs
			if (graph.nodes.length > 0) {
				sessionState.updateKPI('causal_nodes', graph.nodes.length);
			}
			if (graph.edges.length > 0) {
				sessionState.updateKPI('causal_edges', graph.edges.length);
			}
			
			return { toolOperation: "causal_analysis", ...result };
		}

		case "statistical_reasoning": {
			const mode = getParam("mode", "summary");
			let out: Record<string, unknown> = { mode };
			if (mode === "summary") {
				const arr = (parameters.data as number[]) || [];
				const n = arr.length;
				const mean = n ? arr.reduce((a, b) => a + b, 0) / n : 0;
				const variance = n
					? arr.reduce((s, x) => s + (x - mean) ** 2, 0) / n
					: 0;
				const stddev = Math.sqrt(variance);
				const stats: SummaryStats = {
					mean,
					variance,
					stddev,
					min: n ? Math.min(...arr) : 0,
					max: n ? Math.max(...arr) : 0,
					n,
				};
				out = { toolOperation: "statistical_reasoning", stats };
			} else if (mode === "bayes") {
				const prior = (parameters.prior as Record<string, number>) || {
					true: 0.5,
					false: 0.5,
				};
				const likelihood = (parameters.likelihood as Record<
					string,
					number
				>) || { true: 0.6, false: 0.4 };
				// Normalize prior if needed
				const priorSum = Object.values(prior).reduce((a, b) => a + b, 0) || 1;
				const normalizedPrior: Record<string, number> = Object.fromEntries(
					Object.entries(prior).map(([k, v]) => [k, v / priorSum]),
				);
				// Compute evidence and posterior
				const evidence =
					Object.keys(likelihood).reduce(
						(acc, h) => acc + (normalizedPrior[h] ?? 0) * (likelihood[h] ?? 0),
						0,
					) || 1;
				const posterior: Record<string, number> = Object.fromEntries(
					Object.keys(likelihood).map((h) => [
						h,
						((normalizedPrior[h] ?? 0) * (likelihood[h] ?? 0)) / evidence,
					]),
				);
				const bayesianResult: BayesianUpdateResult<string> = {
					prior: normalizedPrior,
					likelihood,
					posterior,
					evidence,
				};
				out = { toolOperation: "statistical_reasoning", bayesianResult };
			} else if (mode === "hypothesis_test") {
				const testResult: HypothesisTestResult = {
					test: getParam("test", "z"),
					statistic: getParam("testStatistic", 0),
					pValue: getParam("pValue", 0.05),
					dof: getParam("dof", undefined as unknown as number | undefined),
					effectSize: getParam(
						"effectSize",
						undefined as unknown as number | undefined,
					),
				};
				out = { toolOperation: "statistical_reasoning", testResult };
			} else if (mode === "monte_carlo") {
				const samplesArr = (parameters.samples as number[]) || [];
				const n = samplesArr.length;
				const mean = n ? samplesArr.reduce((a, b) => a + b, 0) / n : 0;
				const variance = n
					? samplesArr.reduce((s, x) => s + (x - mean) ** 2, 0) / n
					: 0;
				const stddev = Math.sqrt(variance);
				const sorted = [...samplesArr].sort((a, b) => a - b);
				const percentile = {
					p05: sorted.length
						? sorted[Math.floor(0.05 * (sorted.length - 1))]
						: 0,
					p50: sorted.length
						? sorted[Math.floor(0.5 * (sorted.length - 1))]
						: 0,
					p95: sorted.length
						? sorted[Math.floor(0.95 * (sorted.length - 1))]
						: 0,
				} as Record<string, number>;
				const mcResult: MonteCarloResult = {
					samples: n,
					mean,
					stddev,
					percentile,
				};
				out = { toolOperation: "statistical_reasoning", mcResult };
			}
			return out;
		}

		case "simulation": {
			/**
			 * Simulation Operation
			 * 
			 * Runs a toy discrete-time state update for named variables.
			 * 
			 * Expected in prompt: Description of the system to simulate
			 * 
			 * Expected in parameters (model should provide these):
			 * - initial?: Record<string,number> - Initial state variables
			 * - updateRules?: Array<{target: string, rule: string}> - Update rules like "x = x + 1"
			 * - steps?: number - Number of simulation steps (default: 10)
			 * 
			 * The model should define initial conditions and update rules for the simulation.
			 */
			
			const steps = getParam("steps", 10);
			const initial = (parameters.initial as Record<string, number>) || {};
			const updateRules = (parameters.updateRules as Array<{target: string, rule: string}>) || [];
			
			// Initialize state
			let currentState = { ...initial };
			const trajectory: Array<Record<string, number>> = [];
			
			// If no initial state provided, try to extract from prompt
			if (Object.keys(currentState).length === 0 && prompt) {
				// Simple heuristic: look for "x=5" patterns
				const initMatches = prompt.match(/([a-zA-Z]\w*)\s*=\s*([\d\.]+)/g);
				if (initMatches) {
					for (const match of initMatches) {
						const [, variable, value] = match.match(/([a-zA-Z]\w*)\s*=\s*([\d\.]+)/) || [];
						if (variable && value) {
							currentState[variable] = parseFloat(value);
						}
					}
				}
			}
			
			// If no update rules provided, create simple increment rules
			let rules = updateRules;
			if (rules.length === 0 && Object.keys(currentState).length > 0) {
				rules = Object.keys(currentState).map(variable => ({
					target: variable,
					rule: `${variable} + 1`
				}));
			}
			
			// Run simulation
			for (let step = 0; step < steps; step++) {
				// Record current state
				trajectory.push({ ...currentState });
				
				// Apply update rules
				const newState = { ...currentState };
				
				for (const rule of rules) {
					try {
						// Safe evaluation of simple expressions
						const expression = rule.rule;
						
						// Replace variables with current values
						let evaluatedExpression = expression;
						for (const [variable, value] of Object.entries(currentState)) {
							const regex = new RegExp(`\\b${variable}\\b`, 'g');
							evaluatedExpression = evaluatedExpression.replace(regex, value.toString());
						}
						
						// Simple safe evaluation (only allows basic math)
						if (/^[\d\s+\-*/().]+$/.test(evaluatedExpression)) {
							const result = Function(`"use strict"; return (${evaluatedExpression})`)();
							if (typeof result === 'number' && !isNaN(result)) {
								newState[rule.target] = result;
							}
						}
					} catch (error) {
						// Skip invalid rules
						continue;
					}
				}
				
				currentState = newState;
			}
			
			const simResult: SimulationResult = {
				steps,
				trajectory,
				finalState: currentState,
			};
			
			return { toolOperation: "simulation", ...simResult };
		}

		case "optimization": {
			/**
			 * Optimization Operation
			 * 
			 * Simple hill-climb or grid search over bounded variables with objective callback.
			 * 
			 * Expected in prompt: Description of optimization problem
			 * 
			 * Expected in parameters (model should provide these):
			 * - variables: Record<string,{min:number,max:number,step?:number}> - Variables to optimize
			 * - objective: string - Objective function expression
			 * - iterations?: number - Number of iterations for hill climbing (default: 100)
			 * - method?: "grid"|"hill" - Optimization method (default: "grid")
			 * 
			 * The model should define the optimization problem structure.
			 */
			
			const variables = (parameters.variables as Record<string, {min: number, max: number, step?: number}>) || {};
			const objective = (parameters.objective as string) || "";
			const iterations = getParam("iterations", 100);
			const method = getParam("method", "grid") as "grid" | "hill";
			
			let bestDecisionVector: number[] = [];
			let bestObjective = -Infinity;
			let actualIterations = 0;
			let constraintsSatisfied = false;
			
			// Validate inputs
			if (Object.keys(variables).length === 0 || !objective) {
				return {
					toolOperation: "optimization",
					bestDecisionVector: [],
					bestObjective: 0,
					iterations: 0,
					constraintsSatisfied: false,
					error: "Variables and objective function required"
				};
			}
			
			// Helper function to evaluate objective safely
			const evaluateObjective = (assignment: Record<string, number>): number => {
				try {
					// Replace variables in objective with values
					let expression = objective;
					for (const [variable, value] of Object.entries(assignment)) {
						const regex = new RegExp(`\\b${variable}\\b`, 'g');
						expression = expression.replace(regex, value.toString());
					}
					
					// Safe evaluation (only basic math)
					if (/^[\d\s+\-*/().]+$/.test(expression)) {
						const result = Function(`"use strict"; return (${expression})`)();
						return typeof result === 'number' && !isNaN(result) ? result : -Infinity;
					}
					return -Infinity;
				} catch {
					return -Infinity;
				}
			};
			
			const variableNames = Object.keys(variables);
			
			if (method === "grid") {
				// Grid search: cartesian product over steps
				const generateGridPoints = (varIndex: number, currentAssignment: Record<string, number>): void => {
					if (varIndex >= variableNames.length) {
						// Evaluate this point
						const objectiveValue = evaluateObjective(currentAssignment);
						actualIterations++;
						
						if (objectiveValue > bestObjective) {
							bestObjective = objectiveValue;
							bestDecisionVector = variableNames.map(name => currentAssignment[name]);
							constraintsSatisfied = true;
						}
						return;
					}
					
					const varName = variableNames[varIndex];
					const varSpec = variables[varName];
					const step = varSpec.step || 1;
					
					for (let value = varSpec.min; value <= varSpec.max; value += step) {
						currentAssignment[varName] = value;
						generateGridPoints(varIndex + 1, currentAssignment);
					}
				};
				
				generateGridPoints(0, {});
				
			} else if (method === "hill") {
				// Hill climbing: random start then coordinate ascent
				const assignment: Record<string, number> = {};
				
				// Random start
				for (const [name, spec] of Object.entries(variables)) {
					assignment[name] = spec.min + Math.random() * (spec.max - spec.min);
				}
				
				let currentObjective = evaluateObjective(assignment);
				bestObjective = currentObjective;
				bestDecisionVector = variableNames.map(name => assignment[name]);
				
				for (let iter = 0; iter < iterations; iter++) {
					actualIterations++;
					let improved = false;
					
					// Try improving each variable
					for (const [name, spec] of Object.entries(variables)) {
						const step = spec.step || (spec.max - spec.min) / 10;
						const originalValue = assignment[name];
						
						// Try step up
						if (originalValue + step <= spec.max) {
							assignment[name] = originalValue + step;
							const newObjective = evaluateObjective(assignment);
							
							if (newObjective > currentObjective) {
								currentObjective = newObjective;
								improved = true;
								continue;
							}
						}
						
						// Try step down
						if (originalValue - step >= spec.min) {
							assignment[name] = originalValue - step;
							const newObjective = evaluateObjective(assignment);
							
							if (newObjective > currentObjective) {
								currentObjective = newObjective;
								improved = true;
								continue;
							}
						}
						
						// Restore original value if no improvement
						assignment[name] = originalValue;
					}
					
					// Update best if improved
					if (currentObjective > bestObjective) {
						bestObjective = currentObjective;
						bestDecisionVector = variableNames.map(name => assignment[name]);
						constraintsSatisfied = true;
					}
					
					// Stop if no improvement
					if (!improved) break;
				}
			}
			
			const optResult: OptimizationResult = {
				bestDecisionVector,
				bestObjective: bestObjective === -Infinity ? 0 : bestObjective,
				iterations: actualIterations,
				constraintsSatisfied,
			};
			
			return { toolOperation: "optimization", ...optResult };
		}

		case "ethical_analysis": {
			/**
			 * Ethical Analysis Operation
			 * 
			 * Scores findings/risks/mitigations based on selected ethical framework.
			 * 
			 * Expected in prompt: Description of situation or decision to analyze ethically
			 * 
			 * Expected in parameters (model should provide these):
			 * - framework?: "utilitarian"|"rights"|"fairness"|"compliance" - Ethical framework to apply
			 * - findings?: string[] - Pre-identified ethical considerations
			 * - risks?: string[] - Pre-identified ethical risks
			 * - mitigations?: string[] - Pre-identified mitigations
			 * 
			 * The model should analyze the prompt through the lens of the specified ethical framework.
			 */
			
			// Handle "multiple" framework by defaulting to utilitarian for base analysis
			let framework = getParam("framework", "utilitarian") as string;
			const multiFramework = framework === "multiple";
			if (multiFramework) {
				framework = "utilitarian"; // Default to utilitarian for base analysis
			}
			let findings = (parameters.findings as string[]) || [];
			let risks = (parameters.risks as string[]) || [];
			let mitigations = (parameters.mitigations as string[]) || [];
			
			// If no structured input provided, extract from prompt
			if (findings.length === 0 && risks.length === 0 && prompt) {
				const text = prompt.toLowerCase();
				
				// Framework-specific keyword extraction
				const frameworkKeywords: Record<string, {positive: string[], negative: string[], mitigation: string[]}> = {
					utilitarian: {
						positive: ['benefit', 'happiness', 'welfare', 'utility', 'wellbeing', 'satisfaction'],
						negative: ['harm', 'suffering', 'pain', 'damage', 'cost', 'negative impact'],
						mitigation: ['compensate', 'offset', 'balance', 'optimize', 'maximize benefit']
					},
					rights: {
						positive: ['rights', 'freedom', 'autonomy', 'consent', 'dignity', 'respect'],
						negative: ['violation', 'coercion', 'discrimination', 'exploitation', 'unfair'],
						mitigation: ['consent', 'transparency', 'due process', 'appeal', 'protection']
					},
					fairness: {
						positive: ['equal', 'fair', 'just', 'equitable', 'impartial', 'unbiased'],
						negative: ['bias', 'unfair', 'discrimination', 'inequality', 'prejudice'],
						mitigation: ['diverse', 'inclusive', 'representative', 'balanced', 'audit']
					},
					compliance: {
						positive: ['legal', 'compliant', 'regulation', 'standard', 'policy', 'guideline'],
						negative: ['illegal', 'violation', 'breach', 'non-compliant', 'regulatory risk'],
						mitigation: ['audit', 'review', 'documentation', 'training', 'oversight']
					}
				};
				
				const keywords = frameworkKeywords[framework] || frameworkKeywords.utilitarian; // Fallback to utilitarian if framework not found
				
				// Extract findings (positive indicators)
				for (const keyword of keywords.positive) {
					if (text.includes(keyword)) {
						findings.push(`Identified ${keyword} considerations`);
					}
				}
				
				// Extract risks (negative indicators)
				for (const keyword of keywords.negative) {
					if (text.includes(keyword)) {
						risks.push(`Risk of ${keyword}`);
					}
				}
				
				// Extract mitigations
				for (const keyword of keywords.mitigation) {
					if (text.includes(keyword)) {
						mitigations.push(`Consider ${keyword} measures`);
					}
				}
				
				// Add default framework-specific suggestions if none found
				if (findings.length === 0) {
					switch (framework) {
						case 'utilitarian':
							findings.push('Consider overall welfare impact', 'Evaluate benefits vs costs');
							break;
						case 'rights':
							findings.push('Assess impact on individual rights', 'Consider autonomy and dignity');
							break;
						case 'fairness':
							findings.push('Evaluate equitable treatment', 'Check for bias or discrimination');
							break;
						case 'compliance':
							findings.push('Review regulatory requirements', 'Ensure legal compliance');
							break;
					}
				}
			}
			
			// Calculate score based on framework
			let score = getParam("score", undefined) as number | undefined;
			if (score === undefined) {
				// Simple scoring: positive findings vs risks
				const positiveWeight = findings.length;
				const negativeWeight = risks.length;
				const mitigationWeight = mitigations.length;
				
				// Score from 0 to 1, where 1 is most ethical
				if (positiveWeight + negativeWeight + mitigationWeight === 0) {
					score = 0.5; // Neutral if no information
				} else {
					score = Math.min(1, Math.max(0, 
						(positiveWeight + mitigationWeight * 0.5) / 
						(positiveWeight + negativeWeight + mitigationWeight)
					));
				}
			}
			
			const ethicalResult: EthicalAssessment = {
				framework: framework as EthicalAssessment["framework"],
				findings,
				risks,
				mitigations,
				score,
			};
			
			return { toolOperation: "ethical_analysis", ...ethicalResult };
		}

		case "visual_dashboard": {
			/**
			 * Visual Dashboard Operation
			 * 
			 * Creates interactive visual dashboards using MCP UI patterns.
			 * Supports HTML, external URLs, and remote DOM components.
			 * 
			 * Expected in prompt: Description of what to visualize
			 * 
			 * Expected in parameters:
			 * - visualizationType: 'chart' | 'graph' | 'metrics' | 'custom'
			 * - data: Object containing the data to visualize
			 * - panels: Array of dashboard panels with their configurations
			 * - layout: 'grid' | 'flex' | 'tabs' | 'stack'
			 * - interactive: boolean - Enable interactive features
			 * - uiType: 'rawHtml' | 'externalUrl' | 'remoteDom'
			 * - refreshRate: number - Auto-refresh interval in milliseconds
			 */
			
			const visualizationType = getParam("visualizationType", "chart");
			const data = parameters.data || {};
			const panels = (parameters.panels as Array<any>) || [];
			const layout = getParam("layout", "grid");
			const interactive = getParam("interactive", true);
			const uiType = getParam("uiType", "rawHtml");
			const refreshRate = getParam("refreshRate", 0);
			
			// Generate content based on type
			let uiResource;
			
			try {
				if (uiType === "rawHtml") {
					// Generate inline HTML with charts/graphs
					const htmlContent = generateDashboardHTML({
						title: prompt,
						visualizationType,
						data,
						panels,
						layout,
						interactive,
					});
					
					// Note: createUIResource is not available in current setup
					uiResource = {
						uri: `ui://dashboard/${Date.now()}`,
						content: {
							type: "rawHtml",
							htmlString: htmlContent,
						},
						encoding: "blob", // Use blob encoding like graphing-calculator
					};
				} else if (uiType === "externalUrl") {
					// Use external visualization service
					const externalUrl = String(parameters.externalUrl || "https://example.com/dashboard");
					
					// Note: createUIResource is not available in current setup
					uiResource = {
						uri: `ui://dashboard/${Date.now()}`,
						content: {
							type: "externalUrl",
							iframeUrl: externalUrl,
						},
						encoding: "text",
					};
				} else if (uiType === "remoteDom") {
					// Generate remote DOM script for dynamic content
					const remoteDomScript = generateRemoteDomScript({
						visualizationType,
						data,
						panels,
						interactive,
					});
					
					// Note: createUIResource is not available in current setup
					uiResource = {
						uri: `ui://dashboard/${Date.now()}`,
						content: {
							type: "remoteDom",
							script: remoteDomScript,
							framework: "react",
						},
						encoding: "blob",
					};
				} else {
					// Fallback to simple HTML
					// Note: createUIResource is not available in current setup
					uiResource = {
						uri: `ui://dashboard/${Date.now()}`,
						content: {
							type: "rawHtml",
							htmlString: "<h1>Dashboard</h1><p>No visualization type specified</p>",
						},
						encoding: "text",
					};
				}
			} catch (error) {
				// Error handling with error UI resource
				// Note: createUIResource is not available in current setup
				uiResource = {
					uri: `ui://dashboard-error/${Date.now()}`,
					content: {
						type: "rawHtml",
						htmlString: `
							<div style="padding: 20px; font-family: system-ui;">
								<h2 style="color: #dc3545;">Dashboard Creation Error</h2>
								<p>${error instanceof Error ? error.message : "Unknown error occurred"}</p>
							</div>
						`,
					},
					encoding: "text",
				};
			}
			
			// Return format matching graphing-calculator pattern
			return {
				content: [uiResource],
			};
		}

		case "custom_framework": {
			return {
				toolOperation: "custom_framework",
				framework: {
					name: prompt,
					stages: parameters.stages || [],
					rules: parameters.rules || [],
					metrics: parameters.metrics || [],
				},
			};
		}

		case "code_execution": {
			// Handled above in the main function
			return {
				toolOperation: "code_execution",
				result: "Code execution requires special handling",
			};
		}

		// Reasoning pattern operations
		case "tree_of_thought": {
			// Create notebook with preset if not exists
			const sessionId = sessionState.sessionId;
			let notebook = notebookStore.getNotebookBySession(sessionId);
			if (!notebook && getParam("createNotebook", true)) {
				notebook = notebookStore.createNotebook(sessionId);
				const preset = getPresetForPattern("tree_of_thought");
				if (preset) {
					for (const cell of preset.cells) {
						notebookStore.addCell(
							notebook.id,
							cell.type,
							cell.source,
							cell.language,
						);
					}
				}
			}

			// Alias to sequential_thinking with tree pattern
			return await executeClearThoughtOperation(
				sessionState,
				"sequential_thinking",
				{
					prompt,
					parameters: {
						pattern: "tree",
						patternParams: {
							depth: (parameters as any).depth || 3,
							breadth: (parameters as any).breadth || 3,
							branches: (parameters as any).branches || [],
							evaluations: (parameters as any).evaluations || [],
							selectedPath: (parameters as any).selectedPath || null,
						},
						thoughtNumber: (parameters as any).thoughtNumber || 1,
						totalThoughts: (parameters as any).totalThoughts || 3,
						nextThoughtNeeded: (parameters as any).nextThoughtNeeded ?? true,
						needsMoreThoughts: (parameters as any).needsMoreThoughts ?? true,
						__disablePatternDispatch: true,
						notebookId: notebook?.id,
					} as Record<string, unknown>,
				},
			);
		}

		case "beam_search": {
			// Create notebook with preset if not exists
			const sessionId = sessionState.sessionId;
			let notebook = notebookStore.getNotebookBySession(sessionId);
			if (!notebook && getParam("createNotebook", true)) {
				notebook = notebookStore.createNotebook(sessionId);
				const preset = getPresetForPattern("beam_search");
				if (preset) {
					for (const cell of preset.cells) {
						notebookStore.addCell(
							notebook.id,
							cell.type,
							cell.source,
							cell.language,
						);
					}
				}
			}

			// Alias to sequential_thinking with beam pattern
			return await executeClearThoughtOperation(
				sessionState,
				"sequential_thinking",
				{
					prompt,
					parameters: {
						pattern: "beam",
						patternParams: {
							beamWidth: (parameters as any).beamWidth || 3,
							candidates: (parameters as any).candidates || [],
							scores: (parameters as any).scores || [],
							iterations: (parameters as any).iterations || 5,
						},
						thoughtNumber: (parameters as any).thoughtNumber || 1,
						totalThoughts: (parameters as any).totalThoughts || 3,
						nextThoughtNeeded: (parameters as any).nextThoughtNeeded ?? true,
						needsMoreThoughts: (parameters as any).needsMoreThoughts ?? true,
						__disablePatternDispatch: true,
						notebookId: notebook?.id,
					} as Record<string, unknown>,
				},
			);
		}

		case "mcts": {
			// Create notebook with preset if not exists
			const sessionId = sessionState.sessionId;
			let notebook = notebookStore.getNotebookBySession(sessionId);
			if (!notebook && getParam("createNotebook", true)) {
				notebook = notebookStore.createNotebook(sessionId);
				const preset = getPresetForPattern("mcts");
				if (preset) {
					for (const cell of preset.cells) {
						notebookStore.addCell(
							notebook.id,
							cell.type,
							cell.source,
							cell.language,
						);
					}
				}
			}

			// Alias to sequential_thinking with mcts pattern
			return await executeClearThoughtOperation(
				sessionState,
				"sequential_thinking",
				{
					prompt,
					parameters: {
						pattern: "mcts",
						patternParams: {
							simulations: (parameters as any).simulations || 100,
							explorationConstant:
								(parameters as any).explorationConstant || Math.SQRT2,
							tree: (parameters as any).tree || {
								root: { visits: 0, value: 0, children: [] },
							},
							bestAction: (parameters as any).bestAction || null,
						},
						thoughtNumber: (parameters as any).thoughtNumber || 1,
						totalThoughts: (parameters as any).totalThoughts || 3,
						nextThoughtNeeded: (parameters as any).nextThoughtNeeded ?? true,
						needsMoreThoughts: (parameters as any).needsMoreThoughts ?? true,
						__disablePatternDispatch: true,
						notebookId: notebook?.id,
					} as Record<string, unknown>,
				},
			);
		}

		case "graph_of_thought": {
			// Create notebook with preset if not exists
			const sessionId = sessionState.sessionId;
			let notebook = notebookStore.getNotebookBySession(sessionId);
			if (!notebook && getParam("createNotebook", true)) {
				notebook = notebookStore.createNotebook(sessionId);
				const preset = getPresetForPattern("graph_of_thought");
				if (preset) {
					for (const cell of preset.cells) {
						notebookStore.addCell(
							notebook.id,
							cell.type,
							cell.source,
							cell.language,
						);
					}
				}
			}

			// Alias to sequential_thinking with graph pattern
			return await executeClearThoughtOperation(
				sessionState,
				"sequential_thinking",
				{
					prompt,
					parameters: {
						pattern: "graph",
						patternParams: {
							nodes: (parameters as any).nodes || [],
							edges: (parameters as any).edges || [],
							paths: (parameters as any).paths || [],
							optimalPath: (parameters as any).optimalPath || null,
						},
						thoughtNumber: (parameters as any).thoughtNumber || 1,
						totalThoughts: (parameters as any).totalThoughts || 3,
						nextThoughtNeeded: (parameters as any).nextThoughtNeeded ?? true,
						needsMoreThoughts: (parameters as any).needsMoreThoughts ?? true,
						__disablePatternDispatch: true,
						notebookId: notebook?.id,
					} as Record<string, unknown>,
				},
			);
		}

		case "orchestration_suggest": {
			// Create notebook with preset if not exists
			const sessionId = sessionState.sessionId;
			let notebook = notebookStore.getNotebookBySession(sessionId);
			if (!notebook && getParam("createNotebook", true)) {
				notebook = notebookStore.createNotebook(sessionId);
				const preset = getPresetForPattern("orchestration_suggest");
				if (preset) {
					for (const cell of preset.cells) {
						notebookStore.addCell(
							notebook.id,
							cell.type,
							cell.source,
							cell.language,
						);
					}
				}
			}

			// Kick off a brief sequential_thinking step to seed orchestration with context
			const initialThought = await executeClearThoughtOperation(
				sessionState,
				"sequential_thinking",
				{
					prompt: `Plan approach for task: ${prompt}`,
					parameters: {
						thoughtNumber: 1,
						totalThoughts: 3,
						nextThoughtNeeded: true,
						needsMoreThoughts: true,
						pattern: "chain",
					},
				},
			);

			return {
				toolOperation: "orchestration_suggest",
				task: prompt,
				suggestedTools: ["sequential_thinking", "mental_model"],
				reasoning:
					"Initialized with a short sequential_thinking pass to decompose the task, then apply a mental model for framing.",
				initialThought,
				workflow: [
					{
						step: "sequential_thinking",
						purpose: "quick task decomposition (1-3 thoughts)",
					},
					{
						step: "mental_model",
						purpose: "apply appropriate model to frame solution",
					},
				],
				notebookId: notebook?.id,
			};
		}

		// Notebook operations
		case "notebook_create": {
			const sessionId = sessionState.sessionId;
			const notebook = notebookStore.createNotebook(sessionId);

			// Add preset if pattern specified
			const pattern = getParam("pattern", "") as string;
			if (pattern) {
				const preset = getPresetForPattern(pattern);
				if (preset) {
					for (const cell of preset.cells) {
						notebookStore.addCell(
							notebook.id,
							cell.type,
							cell.source,
							cell.language,
						);
					}
				}
			}

			return {
				toolOperation: "notebook_create",
				notebookId: notebook.id,
				sessionId: notebook.sessionId,
				createdAt: new Date(notebook.createdAt).toISOString(),
				pattern: pattern || "blank",
			};
		}

		case "notebook_add_cell": {
			const notebookId = getParam("notebookId", "") as string;
			const cellType = getParam("cellType", "code") as "markdown" | "code";
			const source = getParam("source", "") as string;
			const language = getParam("language", "javascript") as
				| "javascript"
				| "typescript";
			const index = getParam("index", undefined) as number | undefined;

			const cell = notebookStore.addCell(
				notebookId,
				cellType,
				source,
				language,
				index,
			);

			return {
				toolOperation: "notebook_add_cell",
				notebookId,
				cell: cell
					? {
							id: cell.id,
							type: cell.type,
							source: cell.source,
							language: cell.language,
							status: cell.status,
						}
					: null,
				success: cell !== null,
			};
		}

		case "notebook_run_cell": {
			// This is handled in handleClearThoughtTool due to async requirements
			return {
				toolOperation: "notebook_run_cell",
				message:
					"This operation is handled asynchronously in handleClearThoughtTool",
			};
		}

		case "notebook_export": {
			const notebookId = getParam("notebookId", "") as string;
			const format = getParam("format", "srcmd") as "srcmd" | "json";

			if (format === "srcmd") {
				const srcmd = notebookStore.exportToSrcMd(notebookId);
				return {
					toolOperation: "notebook_export",
					notebookId,
					format: "srcmd",
					content: srcmd,
					success: srcmd !== null,
				};
			} else {
				const json = notebookStore.exportToJson(notebookId);
				return {
					toolOperation: "notebook_export",
					notebookId,
					format: "json",
					content: json,
					success: json !== null,
				};
			}
		}

		// =============== Metagame Operations ===============

		case "ooda_loop": {
			const {
				createOODASession,
				advancePhase,
				createOODANode,
				suggestNextActions,
				evaluateEvidenceQuality,
				exportToMarkdown,
			} = await import("../types/reasoning-patterns/ooda-loop.js");

			// Get or create session
			const oodaSessionId = getParam(
				"sessionId",
				`ooda-${Date.now()}`,
			) as string;
			let oodaSession = sessionState.getOODASession(oodaSessionId);

			if (!oodaSession) {
				oodaSession = createOODASession({
					maxLoopTimeMs: getParam("maxLoopTimeMs", 15 * 60 * 1000) as number,
					autoAdvance: getParam("autoAdvance", true) as boolean,
					minEvidence: getParam("minEvidence", 2) as number,
				});
				sessionState.setOODASession(oodaSessionId, oodaSession);
			}

			// Process the current phase
			const evidence = getParam("evidence", []) as string[];

			// Create node for current phase
			const node = createOODANode(prompt, oodaSession.currentPhase, evidence);

			// Add hypotheses if provided
			const hypotheses = getParam("hypotheses", []) as Array<{
				statement: string;
				confidence: number;
			}>;

			for (const hyp of hypotheses) {
				const hypId = `hyp-${Date.now()}-${Math.random()}`;
				oodaSession.hypotheses.set(hypId, {
					id: hypId,
					statement: hyp.statement,
					confidence: hyp.confidence,
					status: "proposed",
					carriedForward: false,
				});
			}

			// Calculate metrics
			node.phaseTimeMs =
				Date.now() -
				new Date(oodaSession.loopStartTime || oodaSession.createdAt).getTime();
			oodaSession.metrics.evidenceQuality = evaluateEvidenceQuality(node);

			// Add node to session
			oodaSession.nodes.push(node);
			oodaSession.iteration++;

			// Track KPIs
			sessionState.updateKPI(
				"ooda_loop_time",
				oodaSession.metrics.avgLoopTimeMs,
				"Avg Loop Time (ms)",
				5 * 60 * 1000,
				"down",
			);
			sessionState.updateKPI(
				"ooda_learning_rate",
				oodaSession.metrics.learningRate,
				"Learning Rate",
				0.7,
				"up",
			);
			sessionState.updateKPI(
				"ooda_evidence_quality",
				oodaSession.metrics.evidenceQuality,
				"Evidence Quality",
				0.8,
				"up",
			);

			// Auto-advance if configured
			if (
				oodaSession.config.autoAdvance &&
				evidence.length >= oodaSession.config.minEvidence
			) {
				oodaSession = advancePhase(oodaSession);
			}

			// Get suggestions
			const suggestions = suggestNextActions(oodaSession);

			// Save session
			sessionState.setOODASession(oodaSessionId, oodaSession);

			return {
				toolOperation: "ooda_loop",
				sessionId: oodaSessionId,
				currentPhase: oodaSession.currentPhase,
				loopNumber: oodaSession.loopNumber,
				metrics: oodaSession.metrics,
				suggestions,
				hypotheses: Array.from(oodaSession.hypotheses.values()),
				export: getParam("includeExport", false)
					? exportToMarkdown(oodaSession)
					: undefined,
				sessionContext: {
					sessionId: sessionState.sessionId,
					kpis: sessionState.getKPIs(),
				},
			};
		}

		case "ulysses_protocol": {
			const {
				createUlyssesSession,
				advancePhase,
				createUlyssesNode,
				checkConstraints,
				suggestNextActions,
				makeFinalDecision,
				exportToMarkdown,
			} = await import("../types/reasoning-patterns/ulysses-protocol.js");

			// Get or create session
			const ulyssesSessionId = getParam(
				"sessionId",
				`ulysses-${Date.now()}`,
			) as string;
			let ulyssesSession = sessionState.getUlyssesSession(ulyssesSessionId);

			if (!ulyssesSession) {
				ulyssesSession = createUlyssesSession({
					constraints: {
						timeboxMs: getParam("timeboxMs", 4 * 60 * 60 * 1000) as number,
						maxIterations: getParam("maxIterations", 3) as number,
						minConfidence: getParam("minConfidence", 0.8) as number,
						maxScopeDrift: getParam("maxScopeDrift", 1) as number,
					},
					policy: {
						autoEscalate: getParam("autoEscalate", true) as boolean,
						notifyWhen: getParam("notifyWhen", [
							"gateFail",
							"timeboxNear",
						]) as any,
						allowOverride: getParam("allowOverride", false) as boolean,
					},
				});
				sessionState.setUlyssesSession(ulyssesSessionId, ulyssesSession);
			}

			// Process the current phase
			const confidence = getParam("confidence", 0.5) as number;
			const evidence = getParam("evidence", []) as string[];
			const iteration =
				ulyssesSession.currentPhase === "implementation"
					? ulyssesSession.implementationIteration
					: undefined;

			// Create node
			const node = createUlyssesNode(
				prompt,
				ulyssesSession.currentPhase,
				confidence,
				iteration,
			);
			node.evidence = evidence;
			node.timeSpentMs =
				Date.now() - new Date(ulyssesSession.startTime).getTime();

			// Check for scope changes
			const scopeChange = getParam("scopeChange", null) as any;
			if (scopeChange) {
				node.scopeChange = scopeChange;
			}

			// Add node to session
			ulyssesSession.nodes.push(node);
			ulyssesSession.iteration++;

			// Increment implementation iteration if in that phase
			if (ulyssesSession.currentPhase === "implementation") {
				ulyssesSession.implementationIteration++;
				ulyssesSession.metrics.iterations =
					ulyssesSession.implementationIteration;
			}

			// Check constraints and escalate if needed
			const constraintCheck = checkConstraints(ulyssesSession);
			if (constraintCheck.escalation) {
				node.escalated = constraintCheck.escalation;
			}

			// Track KPIs
			sessionState.updateKPI(
				"ulysses_confidence",
				ulyssesSession.metrics.confidence,
				"Confidence",
				0.8,
				"up",
			);
			sessionState.updateKPI(
				"ulysses_iterations",
				ulyssesSession.metrics.iterations,
				"Iterations",
				3,
				"down",
			);
			sessionState.updateKPI(
				"ulysses_scope_drift",
				ulyssesSession.metrics.scopeDrift,
				"Scope Drift",
				1,
				"down",
			);
			sessionState.updateKPI(
				"ulysses_time_remaining",
				ulyssesSession.metrics.timeRemainingMs,
				"Time Remaining (ms)",
				0,
				"up",
			);

			// Try to advance phase if requested
			const attemptAdvance = getParam("attemptAdvance", false) as boolean;
			let phaseAdvanced = false;
			if (attemptAdvance) {
				const result = advancePhase(ulyssesSession, evidence);
				phaseAdvanced = result.success;
				if (result.success && result.newPhase) {
					ulyssesSession.currentPhase = result.newPhase;
				}
			}

			// Make final decision if in ship_or_abort phase
			if (
				ulyssesSession.currentPhase === "ship_or_abort" &&
				getParam("makeFinalDecision", false)
			) {
				const rationale = getParam(
					"decisionRationale",
					"Based on current metrics and constraints",
				) as string;
				ulyssesSession.finalDecision = makeFinalDecision(
					ulyssesSession,
					rationale,
				);
			}

			// Get suggestions
			const suggestions = suggestNextActions(ulyssesSession);

			// Save session
			sessionState.setUlyssesSession(ulyssesSessionId, ulyssesSession);

			return {
				toolOperation: "ulysses_protocol",
				sessionId: ulyssesSessionId,
				currentPhase: ulyssesSession.currentPhase,
				gates: ulyssesSession.gates,
				metrics: ulyssesSession.metrics,
				constraints: ulyssesSession.constraints,
				constraintViolations: constraintCheck.violations,
				escalation: constraintCheck.escalation,
				suggestions,
				phaseAdvanced,
				finalDecision: ulyssesSession.finalDecision,
				export: getParam("includeExport", false)
					? exportToMarkdown(ulyssesSession)
					: undefined,
				sessionContext: {
					sessionId: sessionState.sessionId,
					kpis: sessionState.getKPIs(),
				},
			};
		}

		default:
			return {
				toolOperation: "unknown",
				error: `Unknown operation: ${operation}`,
				availableOperations: [
					"sequential_thinking",
					"mental_model",
					"debugging_approach",
					"creative_thinking",
					"visual_reasoning",
					"metacognitive_monitoring",
					"scientific_method",
					"collaborative_reasoning",
					"decision_framework",
					"socratic_method",
					"structured_argumentation",
					"systems_thinking",
					"session_info",
					"session_export",
					"session_import",
					"pdr_reasoning",
					"research",
					"analogical_reasoning",
					"causal_analysis",
					"statistical_reasoning",
					"simulation",
					"optimization",
					"ethical_analysis",
					"visual_dashboard",
					"custom_framework",
					"code_execution",
					"tree_of_thought",
					"beam_search",
					"mcts",
					"graph_of_thought",
					"orchestration_suggest",
					"notebook_create",
					"notebook_add_cell",
					"notebook_run_cell",
					"notebook_export",
				],
			};
	}
}
