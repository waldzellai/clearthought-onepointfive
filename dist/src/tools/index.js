import { z } from 'zod';
import { executePython } from '../utils/execution.js';
import { EphemeralNotebookStore } from '../notebook/EphemeralNotebook.js';
import { getPresetForPattern } from '../notebook/presets.js';
import { enhanceResponseWithNotebook } from './notebookEnhancement.js';
// Initialize notebook store
const notebookStore = new EphemeralNotebookStore();
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
    operation: z.enum([
        // Core thinking operations
        'sequential_thinking',
        'mental_model',
        'debugging_approach',
        'creative_thinking',
        'visual_reasoning',
        'metacognitive_monitoring',
        'scientific_method',
        // Collaborative operations
        'collaborative_reasoning',
        'decision_framework',
        'socratic_method',
        'structured_argumentation',
        // Systems and session operations
        'systems_thinking',
        'session_info',
        'session_export',
        'session_import',
        // Deep reasoning operations
        'pdr_reasoning',
        // New modules
        'research',
        'analogical_reasoning',
        'causal_analysis',
        'statistical_reasoning',
        'simulation',
        'optimization',
        'ethical_analysis',
        'visual_dashboard',
        'custom_framework',
        'code_execution',
        // Reasoning pattern operations
        'tree_of_thought',
        'beam_search',
        'mcts',
        'graph_of_thought',
        'orchestration_suggest',
        // Metagame operations
        'ooda_loop',
        'ulysses_protocol',
        // Notebook operations
        'notebook_create',
        'notebook_add_cell',
        'notebook_run_cell',
        'notebook_export'
    ]).describe('What type of reasoning operation to perform'),
    // Common parameters
    prompt: z.string().describe('The problem, question, or challenge to work on'),
    context: z.string().optional().describe('Additional context or background information'),
    sessionId: z.string().optional().describe('Session identifier for continuity'),
    // Operation-specific parameters (will be validated based on operation)
    parameters: z.record(z.string(), z.unknown()).optional().describe('Operation-specific parameters'),
    // Advanced options
    advanced: z.object({
        autoProgress: z.boolean().optional().describe('Automatically progress through stages when applicable'),
        saveToSession: z.boolean().default(true).describe('Save results to session state'),
        generateNextSteps: z.boolean().default(true).describe('Generate recommended next steps')
    }).optional().describe('Advanced reasoning options')
});
export async function handleClearThoughtTool(sessionState, args) {
    // Special handling for code execution to allow real run
    if (args.operation === 'code_execution') {
        const params = (args.parameters || {});
        const lang = params.language || 'python';
        const code = String(params.code || '');
        const cfg = sessionState.getConfig();
        if (lang !== 'python' || !cfg.allowCodeExecution) {
            const preview = await executeClearThoughtOperation(sessionState, args.operation, { prompt: args.prompt, parameters: args.parameters });
            return { content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }] };
        }
        const result = await executePython(code, cfg.pythonCommand, cfg.executionTimeoutMs);
        return {
            content: [{ type: 'text', text: JSON.stringify({ toolOperation: 'code_execution', ...result }, null, 2) }]
        };
    }
    // Auto-seed most operations with a brief sequential_thinking step
    const seedExclusions = new Set([
        'sequential_thinking',
        'code_execution',
        'session_info',
        'session_export',
        'session_import'
    ]);
    const shouldSeed = !seedExclusions.has(args.operation);
    // Handle async operations
    if (args.operation === 'notebook_run_cell') {
        const params = (args.parameters || {});
        try {
            const execution = await notebookStore.executeCell(params.notebookId || '', params.cellId || '', params.timeoutMs || 5000);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            toolOperation: 'notebook_run_cell',
                            notebookId: params.notebookId,
                            cellId: params.cellId,
                            execution: {
                                id: execution.id,
                                status: execution.status,
                                outputs: execution.outputs,
                                error: execution.error,
                                duration: execution.completedAt ? execution.completedAt - execution.startedAt : undefined
                            }
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            toolOperation: 'notebook_run_cell',
                            notebookId: params.notebookId,
                            cellId: params.cellId,
                            error: error.message,
                            success: false
                        }, null, 2)
                    }]
            };
        }
    }
    const result = await executeClearThoughtOperation(sessionState, args.operation, { prompt: args.prompt, parameters: args.parameters });
    const enriched = shouldSeed
        ? {
            ...result,
            initialThought: await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt: `Plan approach for: ${args.prompt}`,
                parameters: {
                    thoughtNumber: 1,
                    totalThoughts: 3,
                    nextThoughtNeeded: true,
                    needsMoreThoughts: true,
                    pattern: 'chain'
                }
            })
        }
        : result;
    // Enhance response with notebook resources if applicable
    const baseResponse = {
        content: [{ type: 'text', text: JSON.stringify(enriched, null, 2) }]
    };
    const enhancedResponse = enhanceResponseWithNotebook(baseResponse, args.operation, args.prompt);
    return enhancedResponse;
}
// Backwards-compatible registration helper (kept for compatibility; unused by low-level Server)
export function registerTools(server, sessionState) {
    server.tool('clear_thought', 'Unified Clear Thought reasoning tool - provides all reasoning operations through a single interface', ClearThoughtParamsSchema.shape, async (args) => handleClearThoughtTool(sessionState, args));
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
export async function executeClearThoughtOperation(sessionState, operation, args) {
    const { prompt, parameters = {} } = args;
    // Optional reasoning pattern selection for sequential_thinking
    const specifiedPattern = parameters.pattern;
    const patternParams = parameters.patternParams || {};
    const selectReasoningPattern = () => {
        if (specifiedPattern && specifiedPattern !== 'auto')
            return specifiedPattern;
        // Heuristic selection from prompt/params
        const ptext = `${prompt}`.toLowerCase();
        if ('depth' in patternParams || 'breadth' in patternParams || ptext.includes('branch') || ptext.includes('options')) {
            return 'tree';
        }
        if ('beamWidth' in patternParams || ptext.includes('candidates') || ptext.includes('top-k')) {
            return 'beam';
        }
        if ('simulations' in patternParams || ptext.includes('uncertain') || ptext.includes('probability') || ptext.includes('stochastic')) {
            return 'mcts';
        }
        if ('nodes' in patternParams || 'edges' in patternParams || ptext.includes('dependencies') || ptext.includes('graph')) {
            return 'graph';
        }
        return 'chain';
    };
    // Type guard to ensure parameters are properly typed
    const getParam = (key, defaultValue) => {
        return parameters[key] ?? defaultValue;
    };
    // Unified handler for all operations
    switch (operation) {
        case 'sequential_thinking': {
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
                needsMoreThoughts: parameters.needsMoreThoughts
            };
            const added = sessionState.addThought(thoughtData);
            const allThoughts = sessionState.getThoughts();
            const recentThoughts = allThoughts.slice(-3);
            // If a non-chain pattern is selected, optionally execute the corresponding pattern operation
            let patternResult;
            if (chosenPattern !== 'chain' && !parameters.__disablePatternDispatch) {
                const opMap = {
                    tree: 'tree_of_thought',
                    beam: 'beam_search',
                    mcts: 'mcts',
                    graph: 'graph_of_thought'
                };
                const mappedOp = opMap[chosenPattern];
                if (mappedOp) {
                    patternResult = await executeClearThoughtOperation(sessionState, mappedOp, { prompt, parameters: patternParams });
                }
            }
            return {
                toolOperation: 'sequential_thinking',
                selectedPattern: chosenPattern,
                patternResult,
                ...thoughtData,
                status: added ? 'success' : 'limit_reached',
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalThoughts: allThoughts.length,
                    remainingThoughts: sessionState.getRemainingThoughts(),
                    recentThoughts: recentThoughts.map(t => ({
                        thoughtNumber: t.thoughtNumber,
                        isRevision: t.isRevision
                    }))
                }
            };
        }
        case 'mental_model': {
            const modelData = {
                modelName: parameters.model || 'first_principles',
                problem: prompt,
                steps: parameters.steps || [],
                reasoning: parameters.reasoning || '',
                conclusion: parameters.conclusion || ''
            };
            sessionState.addMentalModel(modelData);
            const allModels = sessionState.getMentalModels();
            return {
                toolOperation: 'mental_model',
                ...modelData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalModels: allModels.length,
                    recentModels: allModels.slice(-3).map(m => ({ modelName: m.modelName, problem: m.problem }))
                }
            };
        }
        case 'debugging_approach': {
            const debugData = {
                approachName: parameters.approach || 'binary_search',
                issue: prompt,
                steps: parameters.steps || [],
                findings: parameters.findings || '',
                resolution: parameters.resolution || ''
            };
            sessionState.addDebuggingSession(debugData);
            const allSessions = sessionState.getDebuggingSessions();
            return {
                toolOperation: 'debugging_approach',
                ...debugData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalSessions: allSessions.length,
                    recentSessions: allSessions.slice(-3).map(s => ({ approachName: s.approachName, issue: s.issue }))
                }
            };
        }
        case 'creative_thinking': {
            const creativeData = {
                prompt: prompt,
                ideas: parameters.ideas || [],
                techniques: parameters.techniques || ['brainstorming'],
                connections: parameters.connections || [],
                insights: parameters.insights || [],
                sessionId: `creative-${Date.now()}`,
                iteration: parameters.iteration || 1,
                nextIdeaNeeded: parameters.nextIdeaNeeded || false
            };
            sessionState.addCreativeSession(creativeData);
            const allSessions = sessionState.getCreativeSessions();
            return {
                toolOperation: 'creative_thinking',
                ...creativeData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalSessions: allSessions.length,
                    recentSessions: allSessions.slice(-3).map(s => ({ prompt: s.prompt, techniques: s.techniques }))
                }
            };
        }
        case 'visual_reasoning': {
            const visualData = {
                operation: 'create',
                diagramId: getParam('diagramId', `diagram-${Date.now()}`),
                diagramType: getParam('diagramType', 'flowchart'),
                iteration: getParam('iteration', 1),
                nextOperationNeeded: getParam('nextOperationNeeded', false)
            };
            sessionState.addVisualOperation(visualData);
            const allOperations = sessionState.getVisualOperations();
            return {
                toolOperation: 'visual_reasoning',
                ...visualData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalOperations: allOperations.length,
                    recentOperations: allOperations.slice(-3).map(v => ({ diagramType: v.diagramType, operation: v.operation }))
                }
            };
        }
        case 'metacognitive_monitoring': {
            const metaData = {
                task: prompt,
                stage: getParam('stage', 'monitoring'),
                overallConfidence: getParam('overallConfidence', 0.5),
                uncertaintyAreas: getParam('uncertaintyAreas', []),
                recommendedApproach: getParam('recommendedApproach', ''),
                monitoringId: `meta-${Date.now()}`,
                iteration: getParam('iteration', 1),
                nextAssessmentNeeded: getParam('nextAssessmentNeeded', false)
            };
            sessionState.addMetacognitive(metaData);
            const allSessions = sessionState.getMetacognitiveSessions();
            return {
                toolOperation: 'metacognitive_monitoring',
                ...metaData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalSessions: allSessions.length,
                    recentSessions: allSessions.slice(-3).map(m => ({ task: m.task, stage: m.stage }))
                }
            };
        }
        case 'scientific_method': {
            const scientificData = {
                stage: getParam('stage', 'hypothesis'),
                inquiryId: `sci-${Date.now()}`,
                iteration: getParam('iteration', 1),
                nextStageNeeded: getParam('nextStageNeeded', false)
            };
            sessionState.addScientificInquiry(scientificData);
            const allInquiries = sessionState.getScientificInquiries();
            return {
                toolOperation: 'scientific_method',
                ...scientificData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    totalInquiries: allInquiries.length,
                    recentInquiries: allInquiries.slice(-3).map(s => ({ stage: s.stage }))
                }
            };
        }
        case 'collaborative_reasoning': {
            const collaborativeData = {
                topic: prompt,
                personas: parameters.personas || [],
                contributions: parameters.contributions || [],
                stage: parameters.stage || 'problem-definition',
                activePersonaId: parameters.activePersonaId || '',
                sessionId: `collab-${Date.now()}`,
                iteration: parameters.iteration || 1,
                nextContributionNeeded: parameters.nextContributionNeeded || false
            };
            return {
                toolOperation: 'collaborative_reasoning',
                ...collaborativeData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    stats: sessionState.getStats()
                }
            };
        }
        case 'decision_framework': {
            const decisionData = {
                decisionStatement: prompt,
                options: parameters.options || [],
                criteria: parameters.criteria || [],
                stakeholders: parameters.stakeholders || [],
                constraints: parameters.constraints || [],
                timeHorizon: parameters.timeHorizon || '',
                riskTolerance: parameters.riskTolerance || 'risk-neutral',
                analysisType: parameters.analysisType || 'expected-utility',
                stage: parameters.stage || 'problem-definition',
                decisionId: `decision-${Date.now()}`,
                iteration: parameters.iteration || 1,
                nextStageNeeded: parameters.nextStageNeeded || false
            };
            return {
                toolOperation: 'decision_framework',
                ...decisionData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    stats: sessionState.getStats()
                }
            };
        }
        case 'socratic_method': {
            const socraticData = {
                question: prompt,
                claim: parameters.claim || '',
                premises: parameters.premises || [],
                conclusion: parameters.conclusion || '',
                argumentType: parameters.argumentType || 'deductive',
                confidence: parameters.confidence || 0.5,
                stage: parameters.stage || 'clarification',
                sessionId: `socratic-${Date.now()}`,
                iteration: parameters.iteration || 1,
                nextArgumentNeeded: parameters.nextArgumentNeeded || false
            };
            return {
                toolOperation: 'socratic_method',
                ...socraticData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    stats: sessionState.getStats()
                }
            };
        }
        case 'structured_argumentation': {
            const argumentData = {
                claim: prompt,
                premises: parameters.premises || [],
                conclusion: parameters.conclusion || '',
                argumentType: parameters.argumentType || 'deductive',
                confidence: parameters.confidence || 0.5,
                respondsTo: parameters.respondsTo,
                supports: parameters.supports || [],
                contradicts: parameters.contradicts || [],
                strengths: parameters.strengths || [],
                weaknesses: parameters.weaknesses || [],
                relevance: parameters.relevance || 0.5,
                sessionId: `arg-${Date.now()}`,
                iteration: parameters.iteration || 1,
                nextArgumentNeeded: parameters.nextArgumentNeeded || false
            };
            return {
                toolOperation: 'structured_argumentation',
                ...argumentData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    stats: sessionState.getStats()
                }
            };
        }
        case 'systems_thinking': {
            const systemsData = {
                system: prompt,
                components: parameters.components || [],
                relationships: parameters.relationships || [],
                feedbackLoops: parameters.feedbackLoops || [],
                emergentProperties: parameters.emergentProperties || [],
                leveragePoints: parameters.leveragePoints || [],
                sessionId: `systems-${Date.now()}`,
                iteration: parameters.iteration || 1,
                nextAnalysisNeeded: parameters.nextAnalysisNeeded || false
            };
            return {
                toolOperation: 'systems_thinking',
                ...systemsData,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    stats: sessionState.getStats()
                }
            };
        }
        case 'session_info': {
            return {
                toolOperation: 'session_info',
                sessionId: sessionState.sessionId,
                stats: sessionState.getStats()
            };
        }
        case 'session_export': {
            return {
                toolOperation: 'session_export',
                sessionData: sessionState.export()
            };
        }
        case 'session_import': {
            return {
                toolOperation: 'session_import',
                result: 'Session import completed'
            };
        }
        // -------------------- New modules --------------------
        case 'pdr_reasoning': {
            // PDR uses sequential thinking with progressive refinement pattern
            return await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt,
                parameters: {
                    ...parameters,
                    pattern: 'chain',
                    patternParams: {
                        depth: 3,
                        breadth: 2
                    }
                }
            });
        }
        case 'research': {
            const result = {
                query: prompt,
                findings: [],
                citations: []
            };
            return { toolOperation: 'research', ...result };
        }
        case 'analogical_reasoning': {
            const data = {
                sourceDomain: getParam('sourceDomain', ''),
                targetDomain: getParam('targetDomain', ''),
                mappings: parameters.mappings || [],
                inferredInsights: parameters.inferredInsights || [],
                sessionId: `analogy-${Date.now()}`
            };
            return { toolOperation: 'analogical_reasoning', ...data };
        }
        case 'causal_analysis': {
            const result = {
                graph: getParam('graph', { nodes: [], edges: [] }),
                intervention: parameters.intervention,
                predictedEffects: parameters.predictedEffects,
                counterfactual: parameters.counterfactual,
                notes: parameters.notes
            };
            return { toolOperation: 'causal_analysis', ...result };
        }
        case 'statistical_reasoning': {
            const mode = getParam('mode', 'summary');
            let out = { mode };
            if (mode === 'summary') {
                const arr = parameters.data || [];
                const n = arr.length;
                const mean = n ? arr.reduce((a, b) => a + b, 0) / n : 0;
                const variance = n ? arr.reduce((s, x) => s + (x - mean) ** 2, 0) / n : 0;
                const stddev = Math.sqrt(variance);
                const stats = {
                    mean,
                    variance,
                    stddev,
                    min: n ? Math.min(...arr) : 0,
                    max: n ? Math.max(...arr) : 0,
                    n
                };
                out = { toolOperation: 'statistical_reasoning', stats };
            }
            else if (mode === 'bayes') {
                const prior = parameters.prior || { true: 0.5, false: 0.5 };
                const likelihood = parameters.likelihood || { true: 0.6, false: 0.4 };
                // Normalize prior if needed
                const priorSum = Object.values(prior).reduce((a, b) => a + b, 0) || 1;
                const normalizedPrior = Object.fromEntries(Object.entries(prior).map(([k, v]) => [k, v / priorSum]));
                // Compute evidence and posterior
                const evidence = Object.keys(likelihood).reduce((acc, h) => acc + (normalizedPrior[h] ?? 0) * (likelihood[h] ?? 0), 0) || 1;
                const posterior = Object.fromEntries(Object.keys(likelihood).map(h => [h, (((normalizedPrior[h] ?? 0) * (likelihood[h] ?? 0)) / evidence)]));
                const bayesianResult = {
                    prior: normalizedPrior,
                    likelihood,
                    posterior,
                    evidence
                };
                out = { toolOperation: 'statistical_reasoning', bayesianResult };
            }
            else if (mode === 'hypothesis_test') {
                const testResult = {
                    test: getParam('test', 'z'),
                    statistic: getParam('testStatistic', 0),
                    pValue: getParam('pValue', 0.05),
                    dof: getParam('dof', undefined),
                    effectSize: getParam('effectSize', undefined)
                };
                out = { toolOperation: 'statistical_reasoning', testResult };
            }
            else if (mode === 'monte_carlo') {
                const samplesArr = parameters.samples || [];
                const n = samplesArr.length;
                const mean = n ? samplesArr.reduce((a, b) => a + b, 0) / n : 0;
                const variance = n ? samplesArr.reduce((s, x) => s + (x - mean) ** 2, 0) / n : 0;
                const stddev = Math.sqrt(variance);
                const sorted = [...samplesArr].sort((a, b) => a - b);
                const percentile = {
                    p05: sorted.length ? sorted[Math.floor(0.05 * (sorted.length - 1))] : 0,
                    p50: sorted.length ? sorted[Math.floor(0.50 * (sorted.length - 1))] : 0,
                    p95: sorted.length ? sorted[Math.floor(0.95 * (sorted.length - 1))] : 0,
                };
                const mcResult = {
                    samples: n,
                    mean,
                    stddev,
                    percentile
                };
                out = { toolOperation: 'statistical_reasoning', mcResult };
            }
            return out;
        }
        case 'simulation': {
            const steps = getParam('steps', 10);
            const simResult = {
                steps,
                trajectory: [],
                finalState: {}
            };
            return { toolOperation: 'simulation', ...simResult };
        }
        case 'optimization': {
            const optResult = {
                bestDecisionVector: [],
                bestObjective: 0,
                iterations: 0,
                constraintsSatisfied: false
            };
            return { toolOperation: 'optimization', ...optResult };
        }
        case 'ethical_analysis': {
            const framework = getParam('framework', 'utilitarian');
            const ethicalResult = {
                framework,
                findings: [],
                risks: [],
                mitigations: [],
                score: getParam('score', undefined)
            };
            return { toolOperation: 'ethical_analysis', ...ethicalResult };
        }
        case 'visual_dashboard': {
            return {
                toolOperation: 'visual_dashboard',
                dashboard: {
                    title: prompt,
                    panels: parameters.panels || [],
                    layout: parameters.layout || 'grid',
                    refreshRate: parameters.refreshRate || 5000
                }
            };
        }
        case 'custom_framework': {
            return {
                toolOperation: 'custom_framework',
                framework: {
                    name: prompt,
                    stages: parameters.stages || [],
                    rules: parameters.rules || [],
                    metrics: parameters.metrics || []
                }
            };
        }
        case 'code_execution': {
            // Handled above in the main function
            return {
                toolOperation: 'code_execution',
                result: 'Code execution requires special handling'
            };
        }
        // Reasoning pattern operations
        case 'tree_of_thought': {
            // Create notebook with preset if not exists
            const sessionId = sessionState.sessionId;
            let notebook = notebookStore.getNotebookBySession(sessionId);
            if (!notebook && getParam('createNotebook', true)) {
                notebook = notebookStore.createNotebook(sessionId);
                const preset = getPresetForPattern('tree_of_thought');
                if (preset) {
                    for (const cell of preset.cells) {
                        notebookStore.addCell(notebook.id, cell.type, cell.source, cell.language);
                    }
                }
            }
            // Alias to sequential_thinking with tree pattern
            return await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt,
                parameters: {
                    pattern: 'tree',
                    patternParams: {
                        depth: parameters.depth || 3,
                        breadth: parameters.breadth || 3,
                        branches: parameters.branches || [],
                        evaluations: parameters.evaluations || [],
                        selectedPath: parameters.selectedPath || null
                    },
                    thoughtNumber: parameters.thoughtNumber || 1,
                    totalThoughts: parameters.totalThoughts || 3,
                    nextThoughtNeeded: parameters.nextThoughtNeeded ?? true,
                    needsMoreThoughts: parameters.needsMoreThoughts ?? true,
                    __disablePatternDispatch: true,
                    notebookId: notebook?.id
                }
            });
        }
        case 'beam_search': {
            // Create notebook with preset if not exists
            const sessionId = sessionState.sessionId;
            let notebook = notebookStore.getNotebookBySession(sessionId);
            if (!notebook && getParam('createNotebook', true)) {
                notebook = notebookStore.createNotebook(sessionId);
                const preset = getPresetForPattern('beam_search');
                if (preset) {
                    for (const cell of preset.cells) {
                        notebookStore.addCell(notebook.id, cell.type, cell.source, cell.language);
                    }
                }
            }
            // Alias to sequential_thinking with beam pattern
            return await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt,
                parameters: {
                    pattern: 'beam',
                    patternParams: {
                        beamWidth: parameters.beamWidth || 3,
                        candidates: parameters.candidates || [],
                        scores: parameters.scores || [],
                        iterations: parameters.iterations || 5
                    },
                    thoughtNumber: parameters.thoughtNumber || 1,
                    totalThoughts: parameters.totalThoughts || 3,
                    nextThoughtNeeded: parameters.nextThoughtNeeded ?? true,
                    needsMoreThoughts: parameters.needsMoreThoughts ?? true,
                    __disablePatternDispatch: true,
                    notebookId: notebook?.id
                }
            });
        }
        case 'mcts': {
            // Create notebook with preset if not exists
            const sessionId = sessionState.sessionId;
            let notebook = notebookStore.getNotebookBySession(sessionId);
            if (!notebook && getParam('createNotebook', true)) {
                notebook = notebookStore.createNotebook(sessionId);
                const preset = getPresetForPattern('mcts');
                if (preset) {
                    for (const cell of preset.cells) {
                        notebookStore.addCell(notebook.id, cell.type, cell.source, cell.language);
                    }
                }
            }
            // Alias to sequential_thinking with mcts pattern
            return await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt,
                parameters: {
                    pattern: 'mcts',
                    patternParams: {
                        simulations: parameters.simulations || 100,
                        explorationConstant: parameters.explorationConstant || 1.414,
                        tree: parameters.tree || { root: { visits: 0, value: 0, children: [] } },
                        bestAction: parameters.bestAction || null
                    },
                    thoughtNumber: parameters.thoughtNumber || 1,
                    totalThoughts: parameters.totalThoughts || 3,
                    nextThoughtNeeded: parameters.nextThoughtNeeded ?? true,
                    needsMoreThoughts: parameters.needsMoreThoughts ?? true,
                    __disablePatternDispatch: true,
                    notebookId: notebook?.id
                }
            });
        }
        case 'graph_of_thought': {
            // Create notebook with preset if not exists
            const sessionId = sessionState.sessionId;
            let notebook = notebookStore.getNotebookBySession(sessionId);
            if (!notebook && getParam('createNotebook', true)) {
                notebook = notebookStore.createNotebook(sessionId);
                const preset = getPresetForPattern('graph_of_thought');
                if (preset) {
                    for (const cell of preset.cells) {
                        notebookStore.addCell(notebook.id, cell.type, cell.source, cell.language);
                    }
                }
            }
            // Alias to sequential_thinking with graph pattern
            return await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt,
                parameters: {
                    pattern: 'graph',
                    patternParams: {
                        nodes: parameters.nodes || [],
                        edges: parameters.edges || [],
                        paths: parameters.paths || [],
                        optimalPath: parameters.optimalPath || null
                    },
                    thoughtNumber: parameters.thoughtNumber || 1,
                    totalThoughts: parameters.totalThoughts || 3,
                    nextThoughtNeeded: parameters.nextThoughtNeeded ?? true,
                    needsMoreThoughts: parameters.needsMoreThoughts ?? true,
                    __disablePatternDispatch: true,
                    notebookId: notebook?.id
                }
            });
        }
        case 'orchestration_suggest': {
            // Create notebook with preset if not exists
            const sessionId = sessionState.sessionId;
            let notebook = notebookStore.getNotebookBySession(sessionId);
            if (!notebook && getParam('createNotebook', true)) {
                notebook = notebookStore.createNotebook(sessionId);
                const preset = getPresetForPattern('orchestration_suggest');
                if (preset) {
                    for (const cell of preset.cells) {
                        notebookStore.addCell(notebook.id, cell.type, cell.source, cell.language);
                    }
                }
            }
            // Kick off a brief sequential_thinking step to seed orchestration with context
            const initialThought = await executeClearThoughtOperation(sessionState, 'sequential_thinking', {
                prompt: `Plan approach for task: ${prompt}`,
                parameters: {
                    thoughtNumber: 1,
                    totalThoughts: 3,
                    nextThoughtNeeded: true,
                    needsMoreThoughts: true,
                    pattern: 'chain'
                }
            });
            return {
                toolOperation: 'orchestration_suggest',
                task: prompt,
                suggestedTools: ['sequential_thinking', 'mental_model'],
                reasoning: 'Initialized with a short sequential_thinking pass to decompose the task, then apply a mental model for framing.',
                initialThought,
                workflow: [
                    { step: 'sequential_thinking', purpose: 'quick task decomposition (1-3 thoughts)' },
                    { step: 'mental_model', purpose: 'apply appropriate model to frame solution' }
                ],
                notebookId: notebook?.id
            };
        }
        // Notebook operations
        case 'notebook_create': {
            const sessionId = sessionState.sessionId;
            const notebook = notebookStore.createNotebook(sessionId);
            // Add preset if pattern specified
            const pattern = getParam('pattern', '');
            if (pattern) {
                const preset = getPresetForPattern(pattern);
                if (preset) {
                    for (const cell of preset.cells) {
                        notebookStore.addCell(notebook.id, cell.type, cell.source, cell.language);
                    }
                }
            }
            return {
                toolOperation: 'notebook_create',
                notebookId: notebook.id,
                sessionId: notebook.sessionId,
                createdAt: new Date(notebook.createdAt).toISOString(),
                pattern: pattern || 'blank'
            };
        }
        case 'notebook_add_cell': {
            const notebookId = getParam('notebookId', '');
            const cellType = getParam('cellType', 'code');
            const source = getParam('source', '');
            const language = getParam('language', 'javascript');
            const index = getParam('index', undefined);
            const cell = notebookStore.addCell(notebookId, cellType, source, language, index);
            return {
                toolOperation: 'notebook_add_cell',
                notebookId,
                cell: cell ? {
                    id: cell.id,
                    type: cell.type,
                    source: cell.source,
                    language: cell.language,
                    status: cell.status
                } : null,
                success: cell !== null
            };
        }
        case 'notebook_run_cell': {
            // This is handled in handleClearThoughtTool due to async requirements
            return {
                toolOperation: 'notebook_run_cell',
                message: 'This operation is handled asynchronously in handleClearThoughtTool'
            };
        }
        case 'notebook_export': {
            const notebookId = getParam('notebookId', '');
            const format = getParam('format', 'srcmd');
            if (format === 'srcmd') {
                const srcmd = notebookStore.exportToSrcMd(notebookId);
                return {
                    toolOperation: 'notebook_export',
                    notebookId,
                    format: 'srcmd',
                    content: srcmd,
                    success: srcmd !== null
                };
            }
            else {
                const json = notebookStore.exportToJson(notebookId);
                return {
                    toolOperation: 'notebook_export',
                    notebookId,
                    format: 'json',
                    content: json,
                    success: json !== null
                };
            }
        }
        // =============== Metagame Operations ===============
        case 'ooda_loop': {
            const { createOODASession, advancePhase, createOODANode, suggestNextActions, evaluateEvidenceQuality, exportToMarkdown } = await import('../types/reasoning-patterns/ooda-loop.js');
            // Get or create session
            const oodaSessionId = getParam('sessionId', `ooda-${Date.now()}`);
            let oodaSession = sessionState.getOODASession(oodaSessionId);
            if (!oodaSession) {
                oodaSession = createOODASession({
                    maxLoopTimeMs: getParam('maxLoopTimeMs', 15 * 60 * 1000),
                    autoAdvance: getParam('autoAdvance', true),
                    minEvidence: getParam('minEvidence', 2)
                });
                sessionState.setOODASession(oodaSessionId, oodaSession);
            }
            // Process the current phase
            const evidence = getParam('evidence', []);
            // Create node for current phase
            const node = createOODANode(prompt, oodaSession.currentPhase, evidence);
            // Add hypotheses if provided
            const hypotheses = getParam('hypotheses', []);
            for (const hyp of hypotheses) {
                const hypId = `hyp-${Date.now()}-${Math.random()}`;
                oodaSession.hypotheses.set(hypId, {
                    id: hypId,
                    statement: hyp.statement,
                    confidence: hyp.confidence,
                    status: 'proposed',
                    carriedForward: false
                });
            }
            // Calculate metrics
            node.phaseTimeMs = Date.now() - new Date(oodaSession.loopStartTime || oodaSession.createdAt).getTime();
            oodaSession.metrics.evidenceQuality = evaluateEvidenceQuality(node);
            // Add node to session
            oodaSession.nodes.push(node);
            oodaSession.iteration++;
            // Track KPIs
            sessionState.updateKPI('ooda_loop_time', oodaSession.metrics.avgLoopTimeMs, 'Avg Loop Time (ms)', 5 * 60 * 1000, 'down');
            sessionState.updateKPI('ooda_learning_rate', oodaSession.metrics.learningRate, 'Learning Rate', 0.7, 'up');
            sessionState.updateKPI('ooda_evidence_quality', oodaSession.metrics.evidenceQuality, 'Evidence Quality', 0.8, 'up');
            // Auto-advance if configured
            if (oodaSession.config.autoAdvance && evidence.length >= oodaSession.config.minEvidence) {
                oodaSession = advancePhase(oodaSession);
            }
            // Get suggestions
            const suggestions = suggestNextActions(oodaSession);
            // Save session
            sessionState.setOODASession(oodaSessionId, oodaSession);
            return {
                toolOperation: 'ooda_loop',
                sessionId: oodaSessionId,
                currentPhase: oodaSession.currentPhase,
                loopNumber: oodaSession.loopNumber,
                metrics: oodaSession.metrics,
                suggestions,
                hypotheses: Array.from(oodaSession.hypotheses.values()),
                export: getParam('includeExport', false) ? exportToMarkdown(oodaSession) : undefined,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    kpis: sessionState.getKPIs()
                }
            };
        }
        case 'ulysses_protocol': {
            const { createUlyssesSession, advancePhase, createUlyssesNode, checkConstraints, suggestNextActions, makeFinalDecision, exportToMarkdown } = await import('../types/reasoning-patterns/ulysses-protocol.js');
            // Get or create session
            const ulyssesSessionId = getParam('sessionId', `ulysses-${Date.now()}`);
            let ulyssesSession = sessionState.getUlyssesSession(ulyssesSessionId);
            if (!ulyssesSession) {
                ulyssesSession = createUlyssesSession({
                    constraints: {
                        timeboxMs: getParam('timeboxMs', 4 * 60 * 60 * 1000),
                        maxIterations: getParam('maxIterations', 3),
                        minConfidence: getParam('minConfidence', 0.8),
                        maxScopeDrift: getParam('maxScopeDrift', 1)
                    },
                    policy: {
                        autoEscalate: getParam('autoEscalate', true),
                        notifyWhen: getParam('notifyWhen', ['gateFail', 'timeboxNear']),
                        allowOverride: getParam('allowOverride', false)
                    }
                });
                sessionState.setUlyssesSession(ulyssesSessionId, ulyssesSession);
            }
            // Process the current phase
            const confidence = getParam('confidence', 0.5);
            const evidence = getParam('evidence', []);
            const iteration = ulyssesSession.currentPhase === 'implementation'
                ? ulyssesSession.implementationIteration
                : undefined;
            // Create node
            const node = createUlyssesNode(prompt, ulyssesSession.currentPhase, confidence, iteration);
            node.evidence = evidence;
            node.timeSpentMs = Date.now() - new Date(ulyssesSession.startTime).getTime();
            // Check for scope changes
            const scopeChange = getParam('scopeChange', null);
            if (scopeChange) {
                node.scopeChange = scopeChange;
            }
            // Add node to session
            ulyssesSession.nodes.push(node);
            ulyssesSession.iteration++;
            // Increment implementation iteration if in that phase
            if (ulyssesSession.currentPhase === 'implementation') {
                ulyssesSession.implementationIteration++;
                ulyssesSession.metrics.iterations = ulyssesSession.implementationIteration;
            }
            // Check constraints and escalate if needed
            const constraintCheck = checkConstraints(ulyssesSession);
            if (constraintCheck.escalation) {
                node.escalated = constraintCheck.escalation;
            }
            // Track KPIs
            sessionState.updateKPI('ulysses_confidence', ulyssesSession.metrics.confidence, 'Confidence', 0.8, 'up');
            sessionState.updateKPI('ulysses_iterations', ulyssesSession.metrics.iterations, 'Iterations', 3, 'down');
            sessionState.updateKPI('ulysses_scope_drift', ulyssesSession.metrics.scopeDrift, 'Scope Drift', 1, 'down');
            sessionState.updateKPI('ulysses_time_remaining', ulyssesSession.metrics.timeRemainingMs, 'Time Remaining (ms)', 0, 'up');
            // Try to advance phase if requested
            const attemptAdvance = getParam('attemptAdvance', false);
            let phaseAdvanced = false;
            if (attemptAdvance) {
                const result = advancePhase(ulyssesSession, evidence);
                phaseAdvanced = result.success;
                if (result.success && result.newPhase) {
                    ulyssesSession.currentPhase = result.newPhase;
                }
            }
            // Make final decision if in ship_or_abort phase
            if (ulyssesSession.currentPhase === 'ship_or_abort' && getParam('makeFinalDecision', false)) {
                const rationale = getParam('decisionRationale', 'Based on current metrics and constraints');
                ulyssesSession.finalDecision = makeFinalDecision(ulyssesSession, rationale);
            }
            // Get suggestions
            const suggestions = suggestNextActions(ulyssesSession);
            // Save session
            sessionState.setUlyssesSession(ulyssesSessionId, ulyssesSession);
            return {
                toolOperation: 'ulysses_protocol',
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
                export: getParam('includeExport', false) ? exportToMarkdown(ulyssesSession) : undefined,
                sessionContext: {
                    sessionId: sessionState.sessionId,
                    kpis: sessionState.getKPIs()
                }
            };
        }
        default:
            return {
                toolOperation: 'unknown',
                error: `Unknown operation: ${operation}`,
                availableOperations: [
                    'sequential_thinking', 'mental_model', 'debugging_approach',
                    'creative_thinking', 'visual_reasoning', 'metacognitive_monitoring',
                    'scientific_method', 'collaborative_reasoning', 'decision_framework',
                    'socratic_method', 'structured_argumentation', 'systems_thinking',
                    'session_info', 'session_export', 'session_import',
                    'pdr_reasoning', 'research', 'analogical_reasoning', 'causal_analysis',
                    'statistical_reasoning', 'simulation', 'optimization',
                    'ethical_analysis', 'visual_dashboard', 'custom_framework',
                    'code_execution', 'tree_of_thought', 'beam_search',
                    'mcts', 'graph_of_thought', 'orchestration_suggest',
                    'notebook_create', 'notebook_add_cell', 'notebook_run_cell', 'notebook_export'
                ]
            };
    }
}
