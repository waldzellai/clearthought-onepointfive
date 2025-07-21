import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';
import type {
  ThoughtData,
  MentalModelData,
  CreativeData,
  VisualData,
  DebuggingApproachData,
  MetacognitiveData,
  ScientificInquiryData,
  CollaborativeSession,
  PersonaData,
  ContributionData,
  SocraticData,
  ArgumentData,
  DecisionData,
  DecisionOption,
  SystemsData
} from '../types/index.js';

/**
 * Unified Clear Thought Manager Tool
 * 
 * A single tool that handles all Clear Thought reasoning operations with natural language descriptions
 * and simplified parameter structure. This reduces cognitive load compared to having 14+ separate tools.
 * 
 * Following the proven pattern from exa-mcp-server-websets/src/tools/websetsManager.ts
 */

/**
 * Create a request logger for tracking operations
 */
function createRequestLogger(requestId: string, operation: string) {
  return {
    start: (message: string) => console.log(`[${requestId}] Starting ${operation}: ${message}`),
    log: (message: string) => console.log(`[${requestId}] ${message}`),
    error: (error: any) => console.error(`[${requestId}] Error:`, error)
  };
}

/**
 * Get operation-specific help
 */
function getOperationHelp(operation: string): string[] {
  const helpMap: Record<string, string[]> = {
    "sequential_thinking": [
      "Provide 'thought', 'thoughtNumber', 'totalThoughts', and 'nextThoughtNeeded' parameters",
      "Use 'isRevision' and 'revisesThought' for revising previous thoughts",
      "Use 'branchFromThought' and 'branchId' for creating thought branches"
    ],
    "apply_mental_model": [
      "Specify 'modelName' from available models: first_principles, opportunity_cost, error_propagation, rubber_duck, pareto_principle, occams_razor",
      "Provide 'problem' description",
      "Optionally include 'steps', 'reasoning', and 'conclusion'"
    ],
    "creative_thinking": [
      "Provide 'prompt' for the creative challenge",
      "Include 'ideas', 'techniques', 'connections', and 'insights' arrays",
      "Specify 'sessionId', 'iteration', and 'nextIdeaNeeded'"
    ],
    "visual_reasoning": [
      "Specify 'operation', 'diagramId', 'diagramType'",
      "Include 'iteration' and 'nextOperationNeeded' parameters"
    ],
    "debugging_approach": [
      "Choose 'approachName' from: binary_search, reverse_engineering, divide_conquer, backtracking, cause_elimination, program_slicing",
      "Provide 'issue', 'steps', 'findings', and 'resolution'"
    ],
    "metacognitive_monitoring": [
      "Specify 'task', 'stage', 'overallConfidence', 'uncertaintyAreas'",
      "Include 'recommendedApproach', 'monitoringId', 'iteration', 'nextAssessmentNeeded'"
    ],
    "scientific_method": [
      "Specify 'stage' from: observation, question, hypothesis, experiment, analysis, conclusion, iteration",
      "Include relevant stage-specific data and 'inquiryId', 'iteration', 'nextStageNeeded'"
    ],
    "collaborative_reasoning": [
      "Provide 'topic', 'personas' array, 'contributions' array",
      "Specify 'stage', 'activePersonaId', 'sessionId', 'iteration', 'nextContributionNeeded'"
    ],
    "socratic_dialogue": [
      "Include 'claim', 'premises', 'conclusion', 'question'",
      "Specify 'stage', 'argumentType', 'confidence', 'sessionId', 'iteration', 'nextArgumentNeeded'"
    ],
    "structured_argumentation": [
      "Provide 'claim', 'premises', 'conclusion', 'argumentType'",
      "Include 'confidence' and 'nextArgumentNeeded'"
    ],
    "decision_framework": [
      "Specify 'decisionStatement', 'options' array, 'analysisType'",
      "Include 'stage', 'decisionId', 'iteration', 'nextStageNeeded'"
    ],
    "systems_thinking": [
      "Provide 'system', 'components', 'relationships', 'feedbackLoops'",
      "Include 'emergentProperties', 'leveragePoints', 'sessionId', 'iteration', 'nextAnalysisNeeded'"
    ],
    "get_session_info": [
      "No additional parameters required",
      "Returns comprehensive session statistics"
    ],
    "export_session": [
      "Optionally specify 'format' (json or summary)"
    ],
    "import_session": [
      "Provide 'sessionData' as JSON string",
      "Use 'merge' to combine with existing data"
    ]
  };
  
  return helpMap[operation] || ["Check operation name and required parameters"];
}

/**
 * Get troubleshooting steps for error codes
 */
function getTroubleshootingSteps(errorCode: string): string[] {
  const troubleshootingMap: Record<string, string[]> = {
    "MISSING_PARAMETER": [
      "Check that all required parameters are provided",
      "Verify parameter names match the schema exactly"
    ],
    "SESSION_ERROR": [
      "Verify session is active and accessible",
      "Check session ID if provided"
    ],
    "UNKNOWN_ERROR": [
      "Check parameter formatting and types",
      "Verify operation name is correct"
    ]
  };
  
  return troubleshootingMap[errorCode] || ["Contact support for assistance"];
}

/**
 * Centralized error handler
 */
function handleError(error: unknown, operation: string, logger: any) {
  logger.error(error);
  
  let errorMessage: string;
  let errorCode: string = "UNKNOWN_ERROR";
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Categorize common errors
    if (error.message.includes("required")) {
      errorCode = "MISSING_PARAMETER";
    } else if (error.message.includes("session")) {
      errorCode = "SESSION_ERROR";
    }
  } else {
    errorMessage = String(error);
  }
  
  logger.log(`Operation failed: ${errorMessage}`);
  
  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        success: false,
        operation,
        error: errorMessage,
        errorCode,
        help: getOperationHelp(operation),
        troubleshooting: getTroubleshootingSteps(errorCode)
      }, null, 2)
    }],
    isError: true
  };
}

/**
 * Handle sequential thinking operations
 */
async function handleSequentialThinking(
  session: SessionState, 
  params: any, 
  logger: any
) {
  if (!params?.thought) {
    throw new Error("thought parameter is required for sequential thinking");
  }
  
  logger.log(`Processing thought ${params.thoughtNumber}/${params.totalThoughts}`);
  
  const thoughtData: ThoughtData = {
    thought: params.thought,
    thoughtNumber: params.thoughtNumber,
    totalThoughts: params.totalThoughts,
    nextThoughtNeeded: params.nextThoughtNeeded,
    isRevision: params.isRevision,
    revisesThought: params.revisesThought,
    branchFromThought: params.branchFromThought,
    branchId: params.branchId,
    needsMoreThoughts: params.needsMoreThoughts
  };
  
  const added = session.addThought(thoughtData);
  const stats = session.getStats();
  const allThoughts = session.getThoughts();
  const recentThoughts = allThoughts.slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "sequential_thinking",
        thoughtData,
        status: added ? 'success' : 'limit_reached',
        sessionContext: {
          sessionId: session.sessionId,
          totalThoughts: allThoughts.length,
          remainingThoughts: session.getRemainingThoughts(),
          recentThoughts: recentThoughts.map(t => ({
            thoughtNumber: t.thoughtNumber,
            isRevision: t.isRevision
          }))
        },
        nextSteps: params.nextThoughtNeeded ? [
          `Continue with thought ${params.thoughtNumber + 1}/${params.totalThoughts}`
        ] : [
          "Sequence complete. Review thoughts or start new sequence."
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle mental model operations
 */
async function handleMentalModel(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.modelName || !params?.problem) {
    throw new Error("modelName and problem parameters are required");
  }
  
  logger.log(`Applying ${params.modelName} model to: "${params.problem}"`);
  
  const modelData: MentalModelData = {
    modelName: params.modelName,
    problem: params.problem,
    steps: params.steps || [],
    reasoning: params.reasoning || "",
    conclusion: params.conclusion || ""
  };
  
  session.addMentalModel(modelData);
  
  const stats = session.getStats();
  const allModels = session.getMentalModels();
  const recentModels = allModels.slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "apply_mental_model",
        modelName: params.modelName,
        problem: params.problem,
        hasSteps: params.steps && params.steps.length > 0,
        hasConclusion: !!params.conclusion,
        sessionContext: {
          sessionId: session.sessionId,
          totalMentalModels: allModels.length,
          recentModels: recentModels.map(m => ({
            modelName: m.modelName,
            problem: m.problem
          }))
        },
        nextSteps: [
          "Review the analysis and conclusions",
          "Apply additional mental models if needed",
          "Use insights for decision making"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle session info operations
 */
async function handleGetSessionInfo(session: SessionState, logger: any) {
  logger.log("Retrieving session information");
  
  const stats = session.getStats();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "get_session_info",
        sessionInfo: stats,
        summary: {
          sessionId: stats.sessionId,
          totalOperations: stats.totalOperations,
          toolsUsed: stats.toolsUsed,
          thoughtCount: stats.thoughtCount,
          isActive: stats.isActive,
          createdAt: stats.createdAt,
          lastAccessedAt: stats.lastAccessedAt
        }
      }, null, 2)
    }]
  };
}

/**
 * Handle session export operations
 */
async function handleExportSession(session: SessionState, params: any, logger: any) {
  logger.log(`Exporting session in ${params?.format || 'json'} format`);
  
  const exportData = session.export();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "export_session",
        format: params?.format || 'json',
        exportData,
        sessionId: session.sessionId,
        exportedAt: new Date().toISOString()
      }, null, 2)
    }]
  };
}

/**
 * Handle session import operations
 */
async function handleImportSession(session: SessionState, params: any, logger: any) {
  if (!params?.sessionData) {
    throw new Error("sessionData parameter is required for import");
  }
  
  const shouldMerge = params?.merge || false;
  logger.log(`Importing session data (merge: ${shouldMerge})`);
  
  try {
    const sessionData = typeof params.sessionData === 'string'
      ? JSON.parse(params.sessionData)
      : params.sessionData;
    
    // Get stats before import for comparison
    const statsBefore = session.getStats();
    
    if (shouldMerge) {
      // For merge mode, we import the data which adds to existing data
      session.import(sessionData);
      logger.log("Session data merged with existing data");
    } else {
      // For replace mode, we would need to clear existing data first
      // Note: SessionState doesn't have a clear method, so we just import
      // In a full implementation, you might want to add a clear method
      session.import(sessionData);
      logger.log("Session data imported (replace mode - note: existing data not cleared)");
    }
    
    // Get stats after import for comparison
    const statsAfter = session.getStats();
    
    const result = {
      success: true,
      merged: shouldMerge,
      operationsAdded: statsAfter.totalOperations - statsBefore.totalOperations,
      beforeImport: {
        totalOperations: statsBefore.totalOperations,
        toolsUsed: statsBefore.toolsUsed
      },
      afterImport: {
        totalOperations: statsAfter.totalOperations,
        toolsUsed: statsAfter.toolsUsed
      }
    };
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          operation: "import_session",
          result,
          sessionId: session.sessionId,
          importedAt: new Date().toISOString(),
          sessionContext: {
            sessionId: session.sessionId,
            totalOperations: statsAfter.totalOperations,
            toolsUsed: statsAfter.toolsUsed
          },
          nextSteps: [
            "Review imported session data",
            "Continue with thinking operations",
            "Export session if needed for backup"
          ]
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to import session data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Handle creative thinking operations
 */
async function handleCreativeThinking(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.prompt) {
    throw new Error("prompt parameter is required for creative thinking");
  }
  
  logger.log(`Processing creative prompt: "${params.prompt}"`);
  
  const creativeData: CreativeData = {
    prompt: params.prompt,
    ideas: params.ideas || [],
    techniques: params.techniques || [],
    connections: params.connections || [],
    insights: params.insights || [],
    sessionId: params.sessionId,
    iteration: params.iteration,
    nextIdeaNeeded: params.nextIdeaNeeded
  };
  
  session.addCreativeSession(creativeData);
  
  const stats = session.getStats();
  const creativeSessions = session.getCreativeSessions();
  const recentSessions = creativeSessions.slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "creative_thinking",
        prompt: params.prompt,
        ideasGenerated: params.ideas?.length || 0,
        techniquesUsed: params.techniques || [],
        connectionsFound: params.connections?.length || 0,
        insights: params.insights || [],
        nextIdeaNeeded: params.nextIdeaNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalCreativeSessions: creativeSessions.length,
          recentPrompts: recentSessions.map(s => ({
            prompt: s.prompt,
            ideasCount: s.ideas.length,
            iteration: s.iteration
          }))
        },
        nextSteps: params.nextIdeaNeeded ? [
          "Continue generating more ideas",
          "Explore new creative techniques",
          "Make additional connections"
        ] : [
          "Review and evaluate generated ideas",
          "Select most promising concepts",
          "Develop chosen ideas further"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle visual reasoning operations
 */
async function handleVisualReasoning(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.operation || !params?.diagramId) {
    throw new Error("operation and diagramId parameters are required for visual reasoning");
  }
  
  logger.log(`Processing visual operation: ${params.operation} on diagram ${params.diagramId}`);
  
  const visualData: VisualData = {
    operation: params.operation,
    diagramId: params.diagramId,
    diagramType: params.diagramType,
    iteration: params.iteration,
    nextOperationNeeded: params.nextOperationNeeded
  };
  
  session.addVisualOperation(visualData);
  
  const stats = session.getStats();
  const recentVisuals = session.getVisualOperations();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "visual_reasoning",
        diagramId: params.diagramId,
        diagramType: params.diagramType,
        operationPerformed: params.operation,
        iteration: params.iteration,
        nextOperationNeeded: params.nextOperationNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalOperations: stats.totalOperations,
          visualStoreStats: stats.stores?.visual || {},
          recentOperations: recentVisuals.slice(-3).map(v => ({
            diagramId: v.diagramId,
            operation: v.operation,
            iteration: v.iteration
          }))
        },
        nextSteps: params.nextOperationNeeded ? [
          "Continue with next visual operation",
          "Analyze current diagram state",
          "Apply additional transformations"
        ] : [
          "Review final diagram state",
          "Extract insights from visual analysis",
          "Document findings"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle debugging approach operations
 */
async function handleDebuggingApproach(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.approachName || !params?.issue) {
    throw new Error("approachName and issue parameters are required for debugging approach");
  }
  
  logger.log(`Applying ${params.approachName} debugging approach to: "${params.issue}"`);
  
  const debugData: DebuggingApproachData = {
    approachName: params.approachName,
    issue: params.issue,
    steps: params.steps || [],
    findings: params.findings || "",
    resolution: params.resolution || ""
  };
  
  session.addDebuggingSession(debugData);
  
  const stats = session.getStats();
  const recentDebugging = session.getDebuggingSessions().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "debugging_approach",
        approachName: params.approachName,
        issue: params.issue,
        hasSteps: params.steps && params.steps.length > 0,
        hasFindings: !!params.findings,
        hasResolution: !!params.resolution,
        sessionContext: {
          sessionId: session.sessionId,
          totalDebuggingApproaches: stats.stores?.debugging?.count || 0,
          recentApproaches: recentDebugging.map(d => ({
            approachName: d.approachName,
            resolved: !!d.resolution
          }))
        },
        nextSteps: !params.resolution ? [
          "Continue debugging with current approach",
          "Document findings as they emerge",
          "Consider alternative debugging methods if needed"
        ] : [
          "Review resolution effectiveness",
          "Document lessons learned",
          "Apply insights to prevent similar issues"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle metacognitive monitoring operations
 */
async function handleMetacognitiveMonitoring(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.task || !params?.stage) {
    throw new Error("task and stage parameters are required for metacognitive monitoring");
  }
  
  logger.log(`Monitoring task: "${params.task}" at stage: ${params.stage}`);
  
  const metacognitiveData: MetacognitiveData = {
    task: params.task,
    stage: params.stage,
    overallConfidence: params.overallConfidence,
    uncertaintyAreas: params.uncertaintyAreas || [],
    recommendedApproach: params.recommendedApproach,
    monitoringId: params.monitoringId,
    iteration: params.iteration,
    nextAssessmentNeeded: params.nextAssessmentNeeded
  };
  
  session.addMetacognitive(metacognitiveData);
  
  const stats = session.getStats();
  const recentMonitoring = session.getMetacognitiveSessions().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "metacognitive_monitoring",
        task: params.task,
        stage: params.stage,
        overallConfidence: params.overallConfidence,
        uncertaintyAreasCount: params.uncertaintyAreas?.length || 0,
        recommendedApproach: params.recommendedApproach,
        nextAssessmentNeeded: params.nextAssessmentNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalMonitoringSessions: stats.stores?.metacognitive?.count || 0,
          recentSessions: recentMonitoring.map(m => ({
            task: m.task,
            stage: m.stage,
            confidence: m.overallConfidence
          }))
        },
        nextSteps: params.nextAssessmentNeeded ? [
          "Continue monitoring current task",
          "Assess knowledge gaps",
          "Adjust approach based on findings"
        ] : [
          "Review monitoring insights",
          "Apply lessons learned",
          "Document metacognitive patterns"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle scientific method operations
 */
async function handleScientificMethod(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.stage || !params?.inquiryId) {
    throw new Error("stage and inquiryId parameters are required for scientific method");
  }
  
  logger.log(`Scientific method stage: ${params.stage} for inquiry ${params.inquiryId}`);
  
  const scientificData: ScientificInquiryData = {
    stage: params.stage,
    observation: params.observation,
    question: params.question,
    hypothesis: params.hypothesis,
    experiment: params.experiment,
    analysis: params.analysis,
    conclusion: params.conclusion,
    inquiryId: params.inquiryId,
    iteration: params.iteration,
    nextStageNeeded: params.nextStageNeeded
  };
  
  session.addScientificInquiry(scientificData);
  
  const stats = session.getStats();
  const recentInquiries = session.getScientificInquiries().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "scientific_method",
        stage: params.stage,
        inquiryId: params.inquiryId,
        hasObservation: !!params.observation,
        hasQuestion: !!params.question,
        hasHypothesis: !!params.hypothesis,
        hasExperiment: !!params.experiment,
        hasAnalysis: !!params.analysis,
        hasConclusion: !!params.conclusion,
        nextStageNeeded: params.nextStageNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalInquiries: stats.stores?.scientific?.count || 0,
          recentInquiries: recentInquiries.map(i => ({
            inquiryId: i.inquiryId,
            stage: i.stage,
            iteration: i.iteration
          }))
        },
        nextSteps: params.nextStageNeeded ? [
          `Proceed to next stage of scientific method`,
          "Gather additional data if needed",
          "Refine hypothesis based on findings"
        ] : [
          "Review complete scientific inquiry",
          "Document conclusions and insights",
          "Consider follow-up investigations"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle collaborative reasoning operations
 */
async function handleCollaborativeReasoning(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.topic || !params?.personas || !params?.activePersonaId) {
    throw new Error("topic, personas, and activePersonaId parameters are required for collaborative reasoning");
  }
  
  logger.log(`Collaborative reasoning on: "${params.topic}" with ${params.personas.length} personas`);
  
  const collaborativeData: CollaborativeSession = {
    topic: params.topic,
    personas: params.personas,
    contributions: params.contributions || [],
    stage: params.stage,
    activePersonaId: params.activePersonaId,
    sessionId: params.sessionId,
    iteration: params.iteration,
    nextContributionNeeded: params.nextContributionNeeded
  };
  
  session.addCollaborativeSession(collaborativeData);
  
  const stats = session.getStats();
  const recentCollaborative = session.getCollaborativeSessions().slice(-2);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "collaborative_reasoning",
        topic: params.topic,
        stage: params.stage,
        activePersonaId: params.activePersonaId,
        personasCount: params.personas.length,
        contributionsCount: params.contributions?.length || 0,
        nextContributionNeeded: params.nextContributionNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalCollaborativeSessions: stats.stores?.collaborative?.count || 0,
          recentSessions: recentCollaborative.map(c => ({
            topic: c.topic,
            stage: c.stage,
            contributionsCount: c.contributions.length
          }))
        },
        nextSteps: params.nextContributionNeeded ? [
          "Continue collaborative discussion",
          "Gather more perspectives",
          "Build on existing contributions"
        ] : [
          "Synthesize collaborative insights",
          "Reach consensus or decision",
          "Document collaborative outcomes"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle socratic dialogue operations
 */
async function handleSocraticDialogue(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.claim || !params?.question) {
    throw new Error("claim and question parameters are required for socratic dialogue");
  }
  
  logger.log(`Socratic dialogue on claim: "${params.claim}"`);
  
  const socraticData: SocraticData = {
    claim: params.claim,
    premises: params.premises || [],
    conclusion: params.conclusion,
    question: params.question,
    stage: params.stage,
    argumentType: params.argumentType,
    confidence: params.confidence,
    sessionId: params.sessionId,
    iteration: params.iteration,
    nextArgumentNeeded: params.nextArgumentNeeded
  };
  
  // Note: Socratic sessions use argument data structure
  session.addArgumentation(socraticData);
  
  const stats = session.getStats();
  const recentSocratic = session.getCreativeSessions().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "socratic_dialogue",
        claim: params.claim,
        question: params.question,
        stage: params.stage,
        argumentType: params.argumentType,
        confidence: params.confidence,
        premisesCount: params.premises?.length || 0,
        nextArgumentNeeded: params.nextArgumentNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalSocraticSessions: stats.stores?.creative?.count || 0,
          recentSessions: recentSocratic.map((s: any) => ({
            claim: s.prompt,
            stage: 'socratic',
            confidence: 0.8
          }))
        },
        nextSteps: params.nextArgumentNeeded ? [
          "Continue socratic questioning",
          "Explore deeper assumptions",
          "Challenge current reasoning"
        ] : [
          "Review socratic insights",
          "Synthesize understanding",
          "Apply learned principles"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle structured argumentation operations
 */
async function handleStructuredArgumentation(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.claim || !params?.premises) {
    throw new Error("claim and premises parameters are required for structured argumentation");
  }
  
  logger.log(`Structured argument for claim: "${params.claim}"`);
  
  const argumentData: ArgumentData = {
    claim: params.claim,
    premises: params.premises,
    conclusion: params.conclusion,
    argumentType: params.argumentType,
    confidence: params.confidence,
    sessionId: params.sessionId || session.sessionId,
    iteration: params.iteration || 1,
    nextArgumentNeeded: params.nextArgumentNeeded
  };
  
  session.addArgumentation(argumentData);
  
  const stats = session.getStats();
  const recentArguments = session.getCreativeSessions().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "structured_argumentation",
        claim: params.claim,
        premisesCount: params.premises.length,
        conclusion: params.conclusion,
        argumentType: params.argumentType,
        confidence: params.confidence,
        nextArgumentNeeded: params.nextArgumentNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalArguments: stats.stores?.creative?.count || 0,
          recentArguments: recentArguments.map((a: any) => ({
            claim: a.prompt,
            argumentType: 'structured',
            confidence: 0.8
          }))
        },
        nextSteps: params.nextArgumentNeeded ? [
          "Develop additional arguments",
          "Strengthen logical connections",
          "Address potential counterarguments"
        ] : [
          "Review argument structure",
          "Evaluate logical validity",
          "Consider practical implications"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle decision framework operations
 */
async function handleDecisionFramework(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.decisionStatement || !params?.options) {
    throw new Error("decisionStatement and options parameters are required for decision framework");
  }
  
  logger.log(`Decision framework for: "${params.decisionStatement}"`);
  
  const decisionData: DecisionData = {
    decisionStatement: params.decisionStatement,
    options: params.options,
    analysisType: params.analysisType,
    stage: params.stage,
    decisionId: params.decisionId,
    iteration: params.iteration,
    nextStageNeeded: params.nextStageNeeded
  };
  
  session.addDecision(decisionData);
  
  const stats = session.getStats();
  const recentDecisions = session.getDecisions().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "decision_framework",
        decisionStatement: params.decisionStatement,
        optionsCount: params.options.length,
        analysisType: params.analysisType,
        stage: params.stage,
        nextStageNeeded: params.nextStageNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalDecisions: stats.stores?.decisions?.count || 0,
          recentDecisions: recentDecisions.map(d => ({
            decisionStatement: d.decisionStatement,
            stage: d.stage,
            optionsCount: d.options.length
          }))
        },
        nextSteps: params.nextStageNeeded ? [
          "Continue decision analysis",
          "Evaluate additional criteria",
          "Gather more information"
        ] : [
          "Review decision analysis",
          "Make final recommendation",
          "Plan implementation"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Handle systems thinking operations
 */
async function handleSystemsThinking(
  session: SessionState,
  params: any,
  logger: any
) {
  if (!params?.system || !params?.components) {
    throw new Error("system and components parameters are required for systems thinking");
  }
  
  logger.log(`Systems analysis of: "${params.system}"`);
  
  const systemsData: SystemsData = {
    system: params.system,
    components: params.components,
    relationships: params.relationships || [],
    feedbackLoops: params.feedbackLoops || [],
    emergentProperties: params.emergentProperties || [],
    leveragePoints: params.leveragePoints || [],
    sessionId: params.sessionId,
    iteration: params.iteration,
    nextAnalysisNeeded: params.nextAnalysisNeeded
  };
  
  session.addSystemsAnalysis(systemsData);
  
  const stats = session.getStats();
  const recentSystems = session.getSystemsAnalyses().slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: true,
        operation: "systems_thinking",
        system: params.system,
        componentsCount: params.components.length,
        relationshipsCount: params.relationships?.length || 0,
        feedbackLoopsCount: params.feedbackLoops?.length || 0,
        emergentPropertiesCount: params.emergentProperties?.length || 0,
        leveragePointsCount: params.leveragePoints?.length || 0,
        nextAnalysisNeeded: params.nextAnalysisNeeded,
        sessionContext: {
          sessionId: session.sessionId,
          totalSystemsAnalyses: stats.stores?.systems?.count || 0,
          recentAnalyses: recentSystems.map(s => ({
            system: s.system,
            componentsCount: s.components.length,
            iteration: s.iteration
          }))
        },
        nextSteps: params.nextAnalysisNeeded ? [
          "Continue systems analysis",
          "Identify additional relationships",
          "Explore more leverage points"
        ] : [
          "Review systems insights",
          "Identify intervention opportunities",
          "Plan systems improvements"
        ]
      }, null, 2)
    }]
  };
}

/**
 * Register the unified Clear Thought Manager tool
 */
export function registerClearThoughtManager(server: McpServer, sessionState: SessionState) {
  server.tool(
    'clear_thought_manager',
    'Unified tool for all Clear Thought reasoning operations. Handles sequential thinking, mental models, collaborative reasoning, debugging, creative thinking, and session management through a single interface.',
    {
      operation: z.enum([
        // Core Thinking Operations
        "sequential_thinking",
        "apply_mental_model", 
        "creative_thinking",
        "visual_reasoning",
        "debugging_approach",
        "metacognitive_monitoring",
        "scientific_method",
        
        // Collaborative Operations
        "collaborative_reasoning",
        "socratic_dialogue", 
        "structured_argumentation",
        "decision_framework",
        
        // Systems Operations
        "systems_thinking",
        
        // Session Operations
        "get_session_info",
        "export_session",
        "import_session"
      ]).describe("What type of thinking operation you want to perform"),
      
      // Common context parameters
      context: z.string().optional().describe("Additional context or background information"),
      sessionId: z.string().optional().describe("Specific session ID to work with (defaults to current)"),
      
      // Sequential Thinking Parameters
      sequentialThinking: z.object({
        thought: z.string().describe("The thought content"),
        thoughtNumber: z.number().describe("Current thought number in sequence"),
        totalThoughts: z.number().describe("Total expected thoughts in sequence"),
        nextThoughtNeeded: z.boolean().describe("Whether the next thought is needed"),
        isRevision: z.boolean().optional().describe("Whether this is a revision"),
        revisesThought: z.number().optional().describe("Which thought number this revises"),
        branchFromThought: z.number().optional().describe("Which thought this branches from"),
        branchId: z.string().optional().describe("Unique identifier for this branch"),
        needsMoreThoughts: z.boolean().optional().describe("Whether more thoughts are needed")
      }).optional(),
      
      // Mental Model Parameters
      mentalModel: z.object({
        modelName: z.enum([
          "first_principles", 
          "opportunity_cost", 
          "error_propagation", 
          "rubber_duck", 
          "pareto_principle", 
          "occams_razor"
        ]).describe("Name of the mental model to apply"),
        problem: z.string().describe("The problem being analyzed"),
        steps: z.array(z.string()).optional().describe("Steps to apply the model"),
        reasoning: z.string().optional().describe("Reasoning process"),
        conclusion: z.string().optional().describe("Conclusions drawn")
      }).optional(),
      
      // Creative Thinking Parameters
      creativeThinking: z.object({
        prompt: z.string().describe("Creative prompt or challenge"),
        ideas: z.array(z.string()).describe("Ideas generated"),
        techniques: z.array(z.string()).describe("Techniques used"),
        connections: z.array(z.string()).describe("Connections made"),
        insights: z.array(z.string()).describe("Novel insights"),
        sessionId: z.string().describe("Session identifier"),
        iteration: z.number().describe("Current iteration"),
        nextIdeaNeeded: z.boolean().describe("Whether more creativity is needed")
      }).optional(),

      // Visual Reasoning Parameters
      visualReasoning: z.object({
        operation: z.string().describe("Operation being performed"),
        diagramId: z.string().describe("Diagram identifier"),
        diagramType: z.string().describe("Type of diagram"),
        iteration: z.number().describe("Current iteration"),
        nextOperationNeeded: z.boolean().describe("Whether next operation is needed")
      }).optional(),

      // Debugging Approach Parameters
      debuggingApproach: z.object({
        approachName: z.enum([
          "binary_search", "reverse_engineering", "divide_conquer",
          "backtracking", "cause_elimination", "program_slicing"
        ]).describe("Debugging approach"),
        issue: z.string().describe("Description of the issue being debugged"),
        steps: z.array(z.string()).describe("Steps taken to debug"),
        findings: z.string().describe("Findings discovered during debugging"),
        resolution: z.string().describe("How the issue was resolved")
      }).optional(),

      // Metacognitive Monitoring Parameters
      metacognitiveMonitoring: z.object({
        task: z.string().describe("Task being monitored"),
        stage: z.string().describe("Current stage"),
        overallConfidence: z.number().describe("Overall confidence level"),
        uncertaintyAreas: z.array(z.string()).describe("Areas of uncertainty"),
        recommendedApproach: z.string().describe("Recommended approach"),
        monitoringId: z.string().describe("Monitoring session ID"),
        iteration: z.number().describe("Current iteration"),
        nextAssessmentNeeded: z.boolean().describe("Whether next assessment is needed")
      }).optional(),

      // Scientific Method Parameters
      scientificMethod: z.object({
        stage: z.enum([
          "observation", "question", "hypothesis", "experiment",
          "analysis", "conclusion", "iteration"
        ]).describe("Current stage"),
        observation: z.string().optional().describe("Initial observation"),
        question: z.string().optional().describe("Research question"),
        hypothesis: z.object({
          statement: z.string(),
          variables: z.array(z.object({
            name: z.string(),
            type: z.enum(["independent", "dependent", "controlled", "confounding"]),
            operationalization: z.string().optional()
          })),
          assumptions: z.array(z.string()),
          hypothesisId: z.string(),
          confidence: z.number(),
          domain: z.string(),
          iteration: z.number(),
          alternativeTo: z.array(z.string()).optional(),
          refinementOf: z.string().optional(),
          status: z.enum(["proposed", "testing", "supported", "refuted", "refined"])
        }).optional().describe("Hypothesis data"),
        experiment: z.object({
          design: z.string(),
          methodology: z.string(),
          predictions: z.array(z.object({
            if: z.string(),
            then: z.string(),
            else: z.string().optional()
          })),
          experimentId: z.string(),
          hypothesisId: z.string(),
          controlMeasures: z.array(z.string()),
          results: z.string().optional(),
          outcomeMatched: z.boolean().optional(),
          unexpectedObservations: z.array(z.string()).optional(),
          limitations: z.array(z.string()).optional(),
          nextSteps: z.array(z.string()).optional()
        }).optional().describe("Experiment data"),
        analysis: z.string().optional().describe("Analysis results"),
        conclusion: z.string().optional().describe("Conclusions drawn"),
        inquiryId: z.string().describe("Inquiry ID"),
        iteration: z.number().describe("Current iteration"),
        nextStageNeeded: z.boolean().describe("Whether next stage is needed")
      }).optional(),

      // Collaborative Reasoning Parameters
      collaborativeReasoning: z.object({
        topic: z.string(),
        personas: z.array(z.object({
          id: z.string(),
          name: z.string(),
          expertise: z.array(z.string()),
          background: z.string(),
          perspective: z.string(),
          biases: z.array(z.string()),
          communication: z.object({
            style: z.enum(["formal", "casual", "technical", "creative"]),
            tone: z.enum(["analytical", "supportive", "challenging", "neutral"])
          })
        })),
        contributions: z.array(z.object({
          personaId: z.string(),
          content: z.string(),
          type: z.enum(["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"]),
          confidence: z.number().min(0).max(1),
          referenceIds: z.array(z.string()).optional()
        })),
        stage: z.enum(["problem-definition", "ideation", "critique", "integration", "decision", "reflection"]),
        activePersonaId: z.string(),
        sessionId: z.string(),
        iteration: z.number(),
        nextContributionNeeded: z.boolean()
      }).optional(),

      // Socratic Dialogue Parameters
      socraticDialogue: z.object({
        claim: z.string().describe("The main claim or topic being explored"),
        premises: z.array(z.string()).describe("Supporting premises or assumptions"),
        conclusion: z.string().describe("Conclusion or insight reached"),
        question: z.string().describe("Socratic question being asked"),
        stage: z.enum([
          "clarification", "assumptions", "evidence",
          "perspectives", "implications", "questions"
        ]).describe("Method stage"),
        argumentType: z.enum([
          "deductive", "inductive", "abductive", "analogical"
        ]).describe("Type of argument"),
        confidence: z.number().min(0).max(1).describe("Confidence level (0.0-1.0)"),
        sessionId: z.string().describe("Session identifier"),
        iteration: z.number().describe("Current iteration"),
        nextArgumentNeeded: z.boolean().describe("Whether next argument is needed")
      }).optional(),

      // Structured Argumentation Parameters
      structuredArgumentation: z.object({
        claim: z.string(),
        premises: z.array(z.string()),
        conclusion: z.string(),
        argumentType: z.string(),
        confidence: z.number(),
        nextArgumentNeeded: z.boolean()
      }).optional(),

      // Decision Framework Parameters
      decisionFramework: z.object({
        decisionStatement: z.string(),
        options: z.array(z.object({
          name: z.string(),
          description: z.string()
        })),
        analysisType: z.string(),
        stage: z.string(),
        decisionId: z.string(),
        iteration: z.number(),
        nextStageNeeded: z.boolean()
      }).optional(),

      // Systems Thinking Parameters
      systemsThinking: z.object({
        system: z.string().describe("System being analyzed"),
        components: z.array(z.string()).describe("Components identified"),
        relationships: z.array(z.object({
          from: z.string(),
          to: z.string(),
          type: z.string(),
          strength: z.number().optional()
        })).describe("Relationships between components"),
        feedbackLoops: z.array(z.object({
          components: z.array(z.string()),
          type: z.enum(["positive", "negative"]),
          description: z.string()
        })).describe("Feedback loops identified"),
        emergentProperties: z.array(z.string()).describe("Emergent properties"),
        leveragePoints: z.array(z.string()).describe("Leverage points"),
        sessionId: z.string().describe("Session ID"),
        iteration: z.number().describe("Current iteration"),
        nextAnalysisNeeded: z.boolean().describe("Whether more analysis is needed")
      }).optional(),

      // Session Management Parameters
      sessionManagement: z.object({
        format: z.enum(["json", "summary"]).optional().describe("Export format"),
        sessionData: z.string().optional().describe("JSON string of session data for import"),
        merge: z.boolean().optional().describe("Whether to merge with existing session data")
      }).optional()
    },
    async (args) => {
      const { operation, context, sessionId, ...operationParams } = args;
      
      const requestId = `clear_thought_manager-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'clear_thought_manager');
      
      logger.start(`${operation} operation`);
      
      try {
        // Get or validate session
        const session = sessionState;
        
        if (!session) {
          throw new Error("No active session found");
        }
        
        // Route to appropriate operation handler
        switch (operation) {
          case "sequential_thinking":
            return await handleSequentialThinking(session, operationParams.sequentialThinking, logger);
          
          case "apply_mental_model":
            return await handleMentalModel(session, operationParams.mentalModel, logger);
          
          case "get_session_info":
            return await handleGetSessionInfo(session, logger);
          
          case "export_session":
            return await handleExportSession(session, operationParams.sessionManagement, logger);
          
          case "import_session":
            return await handleImportSession(session, operationParams.sessionManagement, logger);
          
          case "creative_thinking":
            return await handleCreativeThinking(session, operationParams.creativeThinking, logger);
          
          case "visual_reasoning":
            return await handleVisualReasoning(session, operationParams.visualReasoning, logger);
          
          case "debugging_approach":
            return await handleDebuggingApproach(session, operationParams.debuggingApproach, logger);
          
          case "metacognitive_monitoring":
            return await handleMetacognitiveMonitoring(session, operationParams.metacognitiveMonitoring, logger);
          
          case "scientific_method":
            return await handleScientificMethod(session, operationParams.scientificMethod, logger);
          
          case "collaborative_reasoning":
            return await handleCollaborativeReasoning(session, operationParams.collaborativeReasoning, logger);
          
          case "socratic_dialogue":
            return await handleSocraticDialogue(session, operationParams.socraticDialogue, logger);
          
          case "structured_argumentation":
            return await handleStructuredArgumentation(session, operationParams.structuredArgumentation, logger);
          
          case "decision_framework":
            return await handleDecisionFramework(session, operationParams.decisionFramework, logger);
          
          case "systems_thinking":
            return await handleSystemsThinking(session, operationParams.systemsThinking, logger);
          
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        
      } catch (error) {
        return handleError(error, operation, logger);
      }
    }
  );
}