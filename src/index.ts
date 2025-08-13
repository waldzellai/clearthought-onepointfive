import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { SessionState } from './state/SessionState.js';
import { ServerConfigSchema } from './config.js';
import { ClearThoughtParamsSchema, handleClearThoughtTool } from './tools/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ListToolsRequestSchema, CallToolRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

/**
 * Creates a Clear Thought MCP server instance for a specific session
 * @param sessionId - Unique identifier for this session
 * @param config - Server configuration
 * @returns Server instance configured for this session
 */
export default function createClearThoughtServer({
  sessionId,
  config
}: {
  sessionId: string;
  config: z.infer<typeof ServerConfigSchema>
}): Server {
  // Create a new low-level MCP Server instance for each session
  const server = new Server({
    name: 'clear-thought',
    version: '0.0.5'
  }, {
    capabilities: {
      tools: { listChanged: true },
      resources: { listChanged: true }
    }
  });

  // Initialize session state
  const sessionState = new SessionState(sessionId, config);

  // Register request handlers for tools/list and tools/call
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      {
        name: 'clear_thought',
        title: 'Clear Thought',
        description: 'Unified Clear Thought reasoning tool. Operations: sequential_thinking (chain or patterns via pattern/patternParams), mental_model, debugging_approach, creative_thinking, visual_reasoning, metacognitive_monitoring, scientific_method, collaborative_reasoning, decision_framework, socratic_method, structured_argumentation, systems_thinking, research, analogical_reasoning, causal_analysis, statistical_reasoning, simulation, optimization, ethical_analysis, visual_dashboard, custom_framework, code_execution, tree_of_thought, beam_search, mcts, graph_of_thought, orchestration_suggest. See resource guide://clear-thought-operations for details.',
        inputSchema: zodToJsonSchema(ClearThoughtParamsSchema, { strictUnions: true }) as any
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: toolArgs } = request.params;

    if (name !== 'clear_thought') {
      throw new McpError(ErrorCode.InvalidParams, `Tool ${name} not found`);
    }

    const parse = await ClearThoughtParamsSchema.safeParseAsync(toolArgs ?? {});
    if (!parse.success) {
      throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for tool ${name}: ${parse.error.message}`);
    }

    const result = await handleClearThoughtTool(sessionState, parse.data);
    return result;
  });

  // Expose operation documentation as a resource for transparency
  const operationsGuideUri = 'guide://clear-thought-operations';
  const operationsGuideMarkdown = `# Clear Thought Operations Guide\n\nThis server exposes a single tool \'clear_thought\' with many operations.\n\n- sequential_thinking: Chain-of-thought. Optional pattern selection via parameters.pattern ('chain'|'tree'|'beam'|'mcts'|'graph'|'auto') and parameters.patternParams (pattern-specific settings).\n- mental_model: Apply a mental model (parameters: model, steps, reasoning, conclusion).\n- debugging_approach: Structured debugging (parameters: approach, steps, findings, resolution).\n- creative_thinking: Idea generation (parameters: ideas, techniques, connections, insights, iteration, nextIdeaNeeded).\n- visual_reasoning: Diagram operations (parameters: diagramId, diagramType, iteration, nextOperationNeeded).\n- metacognitive_monitoring: Monitor reasoning (parameters: stage, overallConfidence, uncertaintyAreas, recommendedApproach, iteration, nextAssessmentNeeded).\n- scientific_method: Inquiry workflow (parameters: stage, iteration, nextStageNeeded).\n- collaborative_reasoning: Multi-persona thinking (parameters: personas, contributions, stage, activePersonaId, iteration, nextContributionNeeded).\n- decision_framework: Options, criteria, outcomes (parameters: options, criteria, stakeholders, constraints, analysisType, stage, iteration, nextStageNeeded).\n- socratic_method: Question-driven argumentation (parameters: claim, premises, conclusion, argumentType, confidence, stage, iteration, nextArgumentNeeded).\n- structured_argumentation: Formal arguments (parameters: premises, conclusion, argumentType, confidence, respondsTo, supports, contradicts, strengths, weaknesses, relevance, iteration, nextArgumentNeeded).\n- systems_thinking: System mapping (parameters: components, relationships, feedbackLoops, emergentProperties, leveragePoints, iteration, nextAnalysisNeeded).\n- research: Returns structured placeholders for findings/citations (parameters: none defined).\n- analogical_reasoning: Map between domains (parameters: sourceDomain, targetDomain, mappings, inferredInsights).\n- causal_analysis: Causal graphs and interventions (parameters: graph, intervention, predictedEffects, counterfactual, notes).\n- statistical_reasoning: modes: summary|bayes|hypothesis_test|monte_carlo (parameters vary by mode).\n- simulation: Simple simulation shell (parameters: steps).\n- optimization: Simple optimization shell (parameters: none defined).\n- ethical_analysis: Evaluate with a framework (parameters: framework, score?).\n- visual_dashboard: Dashboard skeleton (parameters: panels, layout, refreshRate).\n- custom_framework: Define custom stages/rules/metrics (parameters: stages, rules, metrics).\n- code_execution: Restricted; only Python when enabled (parameters: language, code).\n- tree_of_thought | beam_search | mcts | graph_of_thought: Pattern-specific structures for exploration (parameters are pattern-specific).\n- orchestration_suggest: Suggests tool combinations (parameters: none defined).\n\nNote: Many operations accept a generic 'parameters' object; see field names above. For \'sequential_thinking\', you can choose patterns or set pattern: 'auto' to let the server select based on prompt/params.`;

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: operationsGuideUri,
        name: 'Clear Thought Operations',
        description: 'Documentation for all clear_thought operations and parameters',
        mimeType: 'text/markdown'
      }
    ]
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== operationsGuideUri) {
      throw new McpError(ErrorCode.InvalidParams, `Resource not found: ${request.params.uri}`);
    }
    return {
      contents: [
        { type: 'text', text: operationsGuideMarkdown }
      ]
    };
  });

  // Return the low-level Server instance
  return server;
}

// Re-export config schema so Smithery CLI can adapt a single entry for dev/build/run
export { ServerConfigSchema as configSchema } from './config.js'
