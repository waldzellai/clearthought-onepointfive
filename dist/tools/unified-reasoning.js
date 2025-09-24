import { z } from 'zod';
import { ToolRegistry } from '../registry/tool-registry.js';
import { handleSequentialThinking } from './sequential-thinking.js';
import { handleMentalModel } from './mental-model.js';
import { handleDebuggingApproach } from './debugging-approach.js';
import { handleCollaborativeReasoning } from './collaborative-reasoning.js';
import { handleDecisionFramework } from './decision-framework.js';
import { handleMetacognitive } from './metacognitive.js';
import { handleSocraticMethod } from './socratic-method.js';
import { handleCreativeThinking } from './creative-thinking.js';
import { handleSystemsThinking } from './systems-thinking.js';
import { handleScientificMethod } from './scientific-method.js';
import { handleStructuredArgumentation } from './structured-argumentation.js';
import { handleVisualReasoning } from './visual-reasoning.js';
import TreeOfThoughtHandler from '../handlers/reasoning-patterns/tree-of-thought.js';
import GraphOfThoughtHandler from '../handlers/reasoning-patterns/graph-of-thought.js';
import BeamSearchHandler from '../handlers/reasoning-patterns/beam-search.js';
import MCTSHandler from '../handlers/reasoning-patterns/mcts.js';
// ToolHost Pattern: Single dispatcher for all Clear Thought operations
const UnifiedReasoningSchema = z.object({
    // Core dispatcher fields
    operation: z.enum([
        // Basic thinking operations
        'sequential_thinking', 'mental_model', 'debugging_approach',
        'collaborative_reasoning', 'decision_framework', 'metacognitive',
        'socratic_method', 'creative_thinking', 'systems_thinking',
        'scientific_method', 'structured_argumentation', 'visual_reasoning',
        // Advanced reasoning patterns
        'tree_of_thought', 'graph_of_thought', 'beam_search', 'mcts',
        // Pattern operations
        'create', 'continue', 'evaluate', 'branch', 'merge', 'prune', 'analyze', 'iterate', 'export'
    ]).describe('Operation to perform'),
    // Content and session management
    content: z.string().optional().describe('Content for the operation'),
    prompt: z.string().optional().describe('Prompt for thinking operations'),
    thought: z.string().optional().describe('Thought content for sequential thinking'),
    sessionId: z.string().optional().describe('Session ID for continuing existing session'),
    // Advanced reasoning pattern fields
    pattern: z.enum(['chain', 'tree', 'graph', 'beam', 'mcts', 'recursive', 'dialectical']).optional()
        .describe('Advanced reasoning pattern to use'),
    nodeId: z.string().optional().describe('Node ID for operations on existing nodes'),
    // Operation-specific parameters
    thoughtNumber: z.number().optional().describe('Current thought number in sequence'),
    totalThoughts: z.number().optional().describe('Total expected thoughts in sequence'),
    nextThoughtNeeded: z.boolean().optional().describe('Whether the next thought is needed'),
    isRevision: z.boolean().optional().describe('Whether this is a revision'),
    revisesThought: z.number().optional().describe('Which thought number this revises'),
    branchFromThought: z.number().optional().describe('Which thought this branches from'),
    branchId: z.string().optional().describe('Unique identifier for this branch'),
    needsMoreThoughts: z.boolean().optional().describe('Whether more thoughts are needed'),
    // Advanced pattern parameters
    parameters: z.object({
        maxDepth: z.number().optional(),
        beamWidth: z.number().optional(),
        explorationConstant: z.number().optional(),
        pruningThreshold: z.number().optional()
    }).optional().describe('Pattern-specific parameters')
});
// Simple in-memory session pools per pattern
const pools = {
    tree: new Map(),
    graph: new Map(),
    beam: new Map(),
    mcts: new Map()
};
const handlers = {
    tree: new TreeOfThoughtHandler(),
    graph: new GraphOfThoughtHandler(),
    beam: new BeamSearchHandler(),
    mcts: new MCTSHandler()
};
async function handleUnifiedReasoning(args, session) {
    const stats = session.getStats();
    // ToolHost Pattern: Route to appropriate handler based on operation
    switch (args.operation) {
        // Basic thinking operations - route to individual handlers
        case 'sequential_thinking':
            return handleSequentialThinking({
                thought: args.thought || args.content || '',
                thoughtNumber: args.thoughtNumber || 1,
                totalThoughts: args.totalThoughts || 1,
                nextThoughtNeeded: args.nextThoughtNeeded || false,
                sessionId: args.sessionId,
                isRevision: args.isRevision,
                revisesThought: args.revisesThought,
                branchFromThought: args.branchFromThought,
                branchId: args.branchId,
                needsMoreThoughts: args.needsMoreThoughts
            }, session);
        case 'mental_model':
            return handleMentalModel({
                modelName: 'first_principles', // Default model
                problem: args.prompt || args.content || '',
                steps: ['Apply first principles thinking'],
                reasoning: 'Breaking down to fundamental components',
                conclusion: 'Analysis complete',
                sessionId: args.sessionId
            }, session);
        case 'debugging_approach':
            return handleDebuggingApproach({
                approachName: 'binary_search',
                issue: args.prompt || args.content || '',
                steps: ['Identify problem', 'Analyze symptoms', 'Apply debugging approach'],
                findings: 'Analysis in progress',
                resolution: 'Resolution pending'
            }, session);
        case 'collaborative_reasoning':
            return handleCollaborativeReasoning({
                topic: args.prompt || args.content || '',
                perspectives: [{
                        agent: 'Agent1',
                        viewpoint: 'Initial perspective',
                        reasoning: 'Reasoning being developed'
                    }],
                synthesis: 'Collaborative synthesis in progress',
                consensus: 'Consensus being reached',
                sessionId: args.sessionId
            }, session);
        case 'decision_framework':
            return handleDecisionFramework({
                decisionStatement: args.prompt || args.content || '',
                options: [{
                        name: 'Option 1',
                        description: 'First available option'
                    }],
                analysisType: 'framework_analysis',
                stage: 'initial',
                decisionId: `decision-${Date.now()}`,
                iteration: 1,
                nextStageNeeded: false
            }, session);
        case 'metacognitive':
            return handleMetacognitive({
                thinkingProcess: args.prompt || args.content || 'Metacognitive analysis',
                observations: ['Observing thinking patterns'],
                adjustments: ['Adjustments being identified'],
                effectiveness: 5,
                insights: 'Insights being developed'
            }, session);
        case 'socratic_method':
            return handleSocraticMethod({
                initialStatement: args.prompt || args.content || '',
                questions: [],
                assumptions: [],
                refinedUnderstanding: 'Analysis in progress'
            }, session);
        case 'creative_thinking':
            return handleCreativeThinking({
                technique: 'brainstorming',
                problem: args.prompt || args.content || '',
                ideas: ['Initial idea generation in progress'],
                connections: [],
                evaluation: 'Ideas being evaluated'
            }, session);
        case 'systems_thinking':
            return handleSystemsThinking({
                systemName: args.prompt || args.content || 'System Analysis',
                components: [{
                        name: 'Primary Component',
                        function: 'Core system function',
                        interactions: ['System interaction analysis']
                    }],
                boundaries: 'System boundaries definition',
                inputs: ['System inputs'],
                outputs: ['System outputs'],
                feedbackLoops: [],
                emergentProperties: []
            }, session);
        case 'scientific_method':
            return handleScientificMethod({
                hypothesis: args.prompt || args.content || '',
                experimentDesign: 'Experimental design in progress',
                variables: {
                    independent: ['Independent variables'],
                    dependent: ['Dependent variables'],
                    controlled: ['Controlled variables']
                },
                methodology: 'Methodology being developed',
                expectedResults: 'Expected results analysis',
                conclusion: 'Analysis in progress'
            }, session);
        case 'structured_argumentation':
            return handleStructuredArgumentation({
                claim: args.prompt || args.content || '',
                premises: [{
                        statement: 'Supporting premise',
                        support: 'Evidence and reasoning',
                        strength: 'moderate'
                    }],
                counterarguments: [],
                conclusion: 'Argument analysis in progress',
                validity: 'uncertain'
            }, session);
        case 'visual_reasoning':
            return handleVisualReasoning({
                visualType: 'diagram',
                elements: [{
                        id: 'element1',
                        type: 'node',
                        label: 'Primary Element',
                        position: { x: 0, y: 0 }
                    }],
                connections: [],
                insights: args.prompt || args.content || 'Visual analysis in progress'
            }, session);
        // Advanced reasoning patterns - existing logic
        case 'tree_of_thought':
        case 'graph_of_thought':
        case 'beam_search':
        case 'mcts':
            return handleAdvancedPattern(args, session);
        // Pattern operations for advanced reasoning
        case 'create':
        case 'continue':
        case 'evaluate':
        case 'branch':
        case 'merge':
        case 'prune':
        case 'analyze':
        case 'iterate':
        case 'export':
            return handleAdvancedPattern(args, session);
        default:
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            status: 'error',
                            message: `Unknown operation: ${args.operation}`,
                            availableOperations: [
                                'sequential_thinking', 'mental_model', 'debugging_approach',
                                'collaborative_reasoning', 'decision_framework', 'metacognitive',
                                'socratic_method', 'creative_thinking', 'systems_thinking',
                                'scientific_method', 'structured_argumentation', 'visual_reasoning',
                                'tree_of_thought', 'graph_of_thought', 'beam_search', 'mcts'
                            ]
                        })
                    }]
            };
    }
}
// Advanced pattern handler (existing logic refactored)
async function handleAdvancedPattern(args, session) {
    const nowId = args.sessionId || `unified-${args.pattern}-${Date.now()}`;
    const stats = session.getStats();
    // Map operation to pattern if needed
    const pattern = args.pattern || (args.operation === 'tree_of_thought' ? 'tree' :
        args.operation === 'graph_of_thought' ? 'graph' :
            args.operation === 'beam_search' ? 'beam' :
                args.operation === 'mcts' ? 'mcts' :
                    'chain');
    if (pattern === 'chain') {
        // Chain falls back to sequential thoughts
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'success',
                        pattern: 'chain',
                        operation: args.operation,
                        sessionId: session.sessionId,
                        message: 'Handled via sequential thinking store',
                        sessionContext: { sessionId: session.sessionId, stats }
                    })
                }]
        };
    }
    // Prepare pool and handler
    const pool = pools[pattern];
    const handler = handlers[pattern];
    if (!pool || !handler) {
        return {
            content: [{ type: 'text', text: JSON.stringify({ status: 'error', message: 'unsupported_pattern', pattern }) }]
        };
    }
    let patternSession = pool.get(nowId);
    if (!patternSession || args.operation === 'create') {
        switch (pattern) {
            case 'tree':
                patternSession = handlers.tree.initializeSession({ maxDepth: args.parameters?.maxDepth, pruningThreshold: args.parameters?.pruningThreshold });
                break;
            case 'graph':
                patternSession = handlers.graph.initializeSession();
                break;
            case 'beam':
                patternSession = handlers.beam.initializeSession(args.parameters?.beamWidth);
                break;
            case 'mcts':
                patternSession = handlers.mcts.initializeSession(args.parameters?.explorationConstant);
                break;
        }
        pool.set(patternSession.sessionId, patternSession);
    }
    // Import current sequential chain if operation is continue/analyze and no prior data
    if ((args.operation === 'continue' || args.operation === 'analyze' || args.operation === 'iterate') && patternSession) {
        const seq = session.getThoughts();
        if (seq.length > 0) {
            switch (pattern) {
                case 'tree':
                    patternSession = handlers.tree.importFromSequentialFormat(seq);
                    break;
                case 'graph':
                    patternSession = handlers.graph.importFromSequentialFormat(seq);
                    break;
                case 'beam':
                    patternSession = handlers.beam.importFromSequentialFormat(seq);
                    break;
                case 'mcts':
                    patternSession = handlers.mcts.importFromSequentialFormat(seq);
                    break;
            }
            pool.set(patternSession.sessionId, patternSession);
        }
    }
    // Execute operation
    try {
        switch (pattern) {
            case 'tree': {
                if (args.operation === 'iterate')
                    handlers.tree.runIteration(patternSession);
                if (args.operation === 'prune' && args.nodeId)
                    handlers.tree.prune(args.nodeId, 'unified-prune', patternSession);
                break;
            }
            case 'graph': {
                if (args.operation === 'analyze') {
                    handlers.graph.calculateCentrality(patternSession);
                    handlers.graph.detectCommunities(patternSession);
                }
                break;
            }
            case 'beam': {
                if (args.operation === 'iterate')
                    handlers.beam.runIteration(patternSession);
                if (args.operation === 'evaluate')
                    handlers.beam.evaluatePaths(patternSession);
                if (args.operation === 'prune')
                    handlers.beam.prunePaths(patternSession);
                break;
            }
            case 'mcts': {
                if (args.operation === 'iterate')
                    handlers.mcts.runIteration(patternSession);
                if (args.operation === 'evaluate')
                    handlers.mcts.getActionProbabilities(patternSession.rootNodeId, patternSession);
                break;
            }
        }
    }
    catch (err) {
        return { content: [{ type: 'text', text: JSON.stringify({ status: 'error', message: err?.message }) }] };
    }
    // Build export
    let exportSequential = [];
    let summary = {};
    switch (pattern) {
        case 'tree':
            exportSequential = handlers.tree.exportToSequentialFormat(patternSession);
            summary = { stats: patternSession.stats, bestPath: handlers.tree.getBestPath(patternSession) };
            break;
        case 'graph':
            exportSequential = handlers.graph.exportToSequentialFormat(patternSession);
            summary = { stats: patternSession.stats, analysis: patternSession.analysisMetrics };
            break;
        case 'beam':
            exportSequential = handlers.beam.exportToSequentialFormat(patternSession);
            summary = { stats: patternSession.stats, generation: patternSession.currentGeneration };
            break;
        case 'mcts':
            exportSequential = handlers.mcts.exportToSequentialFormat(patternSession);
            summary = { stats: patternSession.stats, simulations: patternSession.totalSimulations, bestAction: handlers.mcts.getBestAction(patternSession) };
            break;
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    status: 'success',
                    pattern,
                    operation: args.operation,
                    sessionId: patternSession.sessionId,
                    summary,
                    exportSequential,
                    sessionContext: { sessionId: session.sessionId, stats }
                })
            }]
    };
}
// Self-register with ToolHost pattern description and annotations
ToolRegistry.getInstance().register({
    name: 'unifiedreasoning',
    description: 'Unified ToolHost dispatcher for all Clear Thought cognitive operations and advanced reasoning patterns',
    schema: UnifiedReasoningSchema,
    handler: handleUnifiedReasoning,
    category: 'reasoning',
    annotations: {
        audience: ['assistant'],
        priority: 0.9,
        available_operations: [
            'sequential_thinking', 'mental_model', 'debugging_approach',
            'collaborative_reasoning', 'decision_framework', 'metacognitive',
            'socratic_method', 'creative_thinking', 'systems_thinking',
            'scientific_method', 'structured_argumentation', 'visual_reasoning',
            'tree_of_thought', 'graph_of_thought', 'beam_search', 'mcts'
        ],
        docs: 'system://operations',
        quickstart: 'prompt://list_mcp_assets'
    }
});
export { handleUnifiedReasoning };
//# sourceMappingURL=unified-reasoning.js.map