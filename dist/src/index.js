import fs from "node:fs";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ErrorCode, ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ListToolsRequestSchema, McpError, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { SessionState } from "./state/SessionState.js";
import { ClearThoughtParamsSchema, handleClearThoughtTool, } from "./tools/index.js";
import { parseSrcbook, srcbookToResource, } from "./utils/srcbookParser.js";
/**
 * Creates a Clear Thought MCP server instance for a specific session
 * @param sessionId - Unique identifier for this session
 * @param config - Server configuration
 * @returns Server instance configured for this session
 */
export default function createClearThoughtServer({ sessionId, config, }) {
    // Create a new low-level MCP Server instance for each session
    const server = new Server({
        name: "clear-thought",
        version: "0.0.5",
    }, {
        capabilities: {
            tools: { listChanged: true },
            resources: { listChanged: true },
        },
    });
    // Initialize session state
    const sessionState = new SessionState(sessionId, config);
    // Register request handlers for tools/list and tools/call
    server.setRequestHandler(ListToolsRequestSchema, () => ({
        tools: [
            {
                name: "clear_thought",
                title: "Clear Thought",
                description: "Unified Clear Thought reasoning tool. Operations: sequential_thinking (chain or patterns via pattern/patternParams), mental_model, debugging_approach, creative_thinking, visual_reasoning, metacognitive_monitoring, scientific_method, collaborative_reasoning, decision_framework, socratic_method, structured_argumentation, systems_thinking, research, analogical_reasoning, causal_analysis, statistical_reasoning, simulation, optimization, ethical_analysis, visual_dashboard, custom_framework, code_execution, tree_of_thought, beam_search, mcts, graph_of_thought, orchestration_suggest. See resource guide://clear-thought-operations for details.",
                inputSchema: zodToJsonSchema(ClearThoughtParamsSchema, {
                    strictUnions: true,
                }),
            },
        ],
    }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: toolArgs } = request.params;
        // Handle clear_thought tool
        if (name === "clear_thought") {
            const parse = await ClearThoughtParamsSchema.safeParseAsync(toolArgs ?? {});
            if (!parse.success) {
                throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for clear_thought: ${parse.error.message}`);
            }
            const result = await handleClearThoughtTool(sessionState, parse.data);
            return result;
        }
        throw new McpError(ErrorCode.InvalidParams, `Tool ${name} not found`);
    });
    // Discover available notebooks
    const notebooksDir = path.resolve(process.cwd(), "../srcbook-examples");
    const notebooks = [];
    const notebookContents = new Map();
    try {
        if (fs.existsSync(notebooksDir)) {
            const files = fs.readdirSync(notebooksDir);
            for (const file of files) {
                if (file.endsWith(".src.md")) {
                    const filePath = path.join(notebooksDir, file);
                    const contents = fs.readFileSync(filePath, "utf-8");
                    const notebookName = file.replace(".src.md", "");
                    try {
                        const parsed = parseSrcbook(contents, file);
                        const resource = srcbookToResource(parsed, notebookName);
                        notebooks.push(resource);
                        notebookContents.set(notebookName, contents);
                    }
                    catch (e) {
                        console.error(`Failed to parse notebook ${file}:`, e);
                    }
                }
            }
        }
    }
    catch (e) {
        console.error("Failed to discover notebooks:", e);
    }
    // Expose operation documentation as a resource for transparency
    const operationsGuideUri = "guide://clear-thought-operations";
    // Prefer external markdown file if present; fall back to embedded guide
    const docsPath = path.resolve(process.cwd(), "docs/clear-thought-operations.md");
    let operationsGuideMarkdown = `# Clear Thought Operations Guide\n\nThis server exposes a single tool 'clear_thought' with many operations.\n\n- sequential_thinking: Chain-of-thought. Optional pattern selection via parameters.pattern ('chain'|'tree'|'beam'|'mcts'|'graph'|'auto') and parameters.patternParams (pattern-specific settings).\n- mental_model: Apply a mental model (parameters: model, steps, reasoning, conclusion).\n- debugging_approach: Structured debugging (parameters: approach, steps, findings, resolution).\n- creative_thinking: Idea generation (parameters: ideas, techniques, connections, insights, iteration, nextIdeaNeeded).\n- visual_reasoning: Diagram operations (parameters: diagramId, diagramType, iteration, nextOperationNeeded).\n- metacognitive_monitoring: Monitor reasoning (parameters: stage, overallConfidence, uncertaintyAreas, recommendedApproach, iteration, nextAssessmentNeeded).\n- scientific_method: Inquiry workflow (parameters: stage, iteration, nextStageNeeded).\n- collaborative_reasoning: Multi-persona thinking (parameters: personas, contributions, stage, activePersonaId, iteration, nextContributionNeeded).\n- decision_framework: Options, criteria, outcomes (parameters: options, criteria, stakeholders, constraints, analysisType, stage, iteration, nextStageNeeded).\n- socratic_method: Question-driven argumentation (parameters: claim, premises, conclusion, argumentType, confidence, stage, iteration, nextArgumentNeeded).\n- structured_argumentation: Formal arguments (parameters: premises, conclusion, argumentType, confidence, respondsTo, supports, contradicts, strengths, weaknesses, relevance, iteration, nextArgumentNeeded).\n- systems_thinking: System mapping (parameters: components, relationships, feedbackLoops, emergentProperties, leveragePoints, iteration, nextAnalysisNeeded).\n- research: Returns structured placeholders for findings/citations (parameters: none defined).\n- analogical_reasoning: Map between domains (parameters: sourceDomain, targetDomain, mappings, inferredInsights).\n- causal_analysis: Causal graphs and interventions (parameters: graph, intervention, predictedEffects, counterfactual, notes).\n- statistical_reasoning: modes: summary|bayes|hypothesis_test|monte_carlo (parameters vary by mode).\n- simulation: Simple simulation shell (parameters: steps).\n- optimization: Simple optimization shell (parameters: none defined).\n- ethical_analysis: Evaluate with a framework (parameters: framework, score?).\n- visual_dashboard: Dashboard skeleton (parameters: panels, layout, refreshRate).\n- custom_framework: Define custom stages/rules/metrics (parameters: stages, rules, metrics).\n- code_execution: Restricted; only Python when enabled (parameters: language, code).\n- tree_of_thought | beam_search | mcts | graph_of_thought: Pattern-specific structures for exploration (parameters are pattern-specific).\n- orchestration_suggest: Suggests tool combinations (parameters: none defined).\n\nNote: Many operations accept a generic 'parameters' object; see field names above. For 'sequential_thinking', you can choose patterns or set pattern: 'auto' to let the server select based on prompt/params.`;
    try {
        if (fs.existsSync(docsPath)) {
            operationsGuideMarkdown = fs.readFileSync(docsPath, "utf-8");
        }
    }
    catch { }
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [
            {
                uri: operationsGuideUri,
                name: "Clear Thought Operations",
                description: "Documentation for all clear_thought operations and parameters",
                mimeType: "text/markdown",
            },
            ...notebooks,
            // Add a guide for notebook interaction
            {
                uri: "guide://notebook-interaction",
                name: "Notebook Interaction Guide",
                description: "Instructions for working with Srcbook notebooks in MCP",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.9,
                },
            },
            // Example data resources for each operation
            {
                uri: "examples://systems-thinking",
                name: "Systems Thinking Examples",
                description: "Example parameter structures for systems thinking analysis",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://decision-framework",
                name: "Decision Framework Examples",
                description: "Multi-criteria and expected utility decision examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://causal-analysis",
                name: "Causal Analysis Examples",
                description: "Causal graph structures with intervention examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://creative-thinking",
                name: "Creative Thinking Examples",
                description: "SCAMPER and brainstorming technique examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://scientific-method",
                name: "Scientific Method Examples",
                description: "Hypothesis testing and experiment structure examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://simulation",
                name: "Simulation Examples",
                description: "Discrete-time simulation model examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://optimization",
                name: "Optimization Examples",
                description: "Resource allocation and optimization examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://ethical-analysis",
                name: "Ethical Analysis Examples",
                description: "Ethical framework analysis examples",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.8,
                },
            },
            {
                uri: "examples://visual-dashboard",
                name: "Visual Dashboard Examples",
                description: "Interactive dashboard creation with MCP UI patterns",
                mimeType: "text/markdown",
                annotations: {
                    audience: ["assistant"],
                    priority: 0.9,
                },
            },
        ],
    }));
    // Add resource templates for dynamic notebook access
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
        resourceTemplates: [
            {
                uriTemplate: "notebook:///{name}",
                name: "Srcbook Notebooks",
                title: "📓 Interactive Notebooks",
                description: "Access Srcbook notebooks by name for interactive TypeScript/JavaScript execution",
                mimeType: "text/markdown",
            },
            {
                uriTemplate: "notebook:///{name}#cell-{index}",
                name: "Notebook Cells",
                title: "📝 Specific Notebook Cell",
                description: "Access a specific cell within a Srcbook notebook",
                mimeType: "text/plain",
            },
        ],
    }));
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        // Handle operations guide
        if (uri === operationsGuideUri) {
            return {
                contents: [{
                        uri: operationsGuideUri,
                        mimeType: "text/markdown",
                        text: operationsGuideMarkdown
                    }],
            };
        }
        // Handle example resources
        if (uri.startsWith("examples://")) {
            const exampleType = uri.replace("examples://", "");
            // Try multiple possible locations for the resources
            const possiblePaths = [
                path.join(process.cwd(), `dist/resources/examples/${exampleType}.md`), // dist from cwd
                path.join(process.cwd(), `src/resources/examples/${exampleType}.md`), // src from cwd
                path.join(process.cwd(), `resources/examples/${exampleType}.md`), // resources from cwd
            ];
            for (const examplePath of possiblePaths) {
                try {
                    if (fs.existsSync(examplePath)) {
                        const content = fs.readFileSync(examplePath, "utf-8");
                        return {
                            contents: [{
                                    uri: uri,
                                    mimeType: "text/markdown",
                                    text: content
                                }],
                        };
                    }
                }
                catch (error) {
                    // Continue to next path
                }
            }
            throw new McpError(ErrorCode.InvalidParams, `Example resource not found: ${uri}. Tried paths: ${possiblePaths.join(", ")}`);
        }
        // Handle notebook interaction guide
        if (uri === "guide://notebook-interaction") {
            const interactionGuide = `# Notebook Interaction Guide

## Working with Srcbook Notebooks in MCP

Srcbook notebooks (.src.md files) are interactive documents that combine:
- **Markdown cells** for documentation and explanations
- **Code cells** with JavaScript/TypeScript that can be executed
- **Package.json** for dependencies
- **tsconfig.json** for TypeScript configuration (when applicable)

## How to Execute Code Cells

When you encounter a code cell in a notebook resource:

1. **Identify code cells** - Look for:
   - Sections starting with \`###### filename.js\` or \`###### filename.ts\`
   - Standalone code blocks marked as javascript/typescript

2. **Execute the code** using the appropriate tool:
   - Use \`mcp__ide__executeCode\` for TypeScript/JavaScript execution
   - Pass the extracted source code from the cell

3. **Process cells sequentially** for educational notebooks to maintain the learning flow

## Example Interaction Pattern

\`\`\`typescript
// When you see a code cell like this:
###### example.ts
console.log("Hello from notebook!");

// Extract and execute:
mcp__ide__executeCode({ 
  code: 'console.log("Hello from notebook!");' 
})
\`\`\`

## Available Notebooks

The following notebooks are available as resources:
${notebooks.map((n) => `- **${n.name}** (${n.uri}): ${n.description}`).join("\n")}

## Tips for AI Assistants

- Read notebooks sequentially for the best learning experience
- Execute code cells to demonstrate concepts interactively
- Use the annotations in each resource to understand capabilities
- Reference specific cells using URI fragments like \`notebook:///name#cell-3\`
`;
            return {
                contents: [{
                        uri: uri,
                        mimeType: "text/markdown",
                        text: interactionGuide
                    }],
            };
        }
        // Handle notebook resources
        if (uri.startsWith("notebook:///")) {
            const notebookName = uri.replace("notebook:///", "").split("#")[0];
            const content = notebookContents.get(notebookName);
            if (!content) {
                throw new McpError(ErrorCode.InvalidParams, `Notebook not found: ${uri}`);
            }
            return {
                contents: [{
                        uri: uri,
                        mimeType: "text/markdown",
                        text: content
                    }],
            };
        }
        throw new McpError(ErrorCode.InvalidParams, `Resource not found: ${uri}`);
    });
    // Return the low-level Server instance
    return server;
}
// Re-export config schema so Smithery CLI can adapt a single entry for dev/build/run
export { ServerConfigSchema as configSchema } from "./config.js";
