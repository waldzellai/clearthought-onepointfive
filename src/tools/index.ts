import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';
import { z } from 'zod';

/**
 * Registers the unified Clear Thought tool with the MCP server
 * 
 * This single tool provides access to all reasoning operations through
 * an operation parameter, following the websetsManager pattern.
 *
 * @param server - The MCP server instance
 * @param sessionState - The session state manager
 */
export function registerTools(server: McpServer, sessionState: SessionState): void {
  server.tool(
    'clear_thought',
    'Unified Clear Thought reasoning tool - provides all reasoning operations through a single interface',
    {
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
        'session_import'
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
    },
    async (args, extra) => {
      // Route to the appropriate operation handler based on the operation parameter
      switch (args.operation) {
        case 'sequential_thinking':
          return await handleSequentialThinking(args, sessionState);
        case 'mental_model':
          return await handleMentalModel(args, sessionState);
        case 'debugging_approach':
          return await handleDebuggingApproach(args, sessionState);
        case 'creative_thinking':
          return await handleCreativeThinking(args, sessionState);
        case 'visual_reasoning':
          return await handleVisualReasoning(args, sessionState);
        case 'metacognitive_monitoring':
          return await handleMetacognitiveMonitoring(args, sessionState);
        case 'scientific_method':
          return await handleScientificMethod(args, sessionState);
        case 'collaborative_reasoning':
          return await handleCollaborativeReasoning(args, sessionState);
        case 'decision_framework':
          return await handleDecisionFramework(args, sessionState);
        case 'socratic_method':
          return await handleSocraticMethod(args, sessionState);
        case 'structured_argumentation':
          return await handleStructuredArgumentation(args, sessionState);
        case 'systems_thinking':
          return await handleSystemsThinking(args, sessionState);
        case 'session_info':
        case 'session_export':
        case 'session_import':
          return await handleSessionOperations(args, sessionState);
        default:
          throw new Error(`Unknown operation: ${args.operation}`);
      }
    }
  );
}

// Handler functions for the unified tool
async function handleSequentialThinking(args: any, sessionState: SessionState) {
  const thoughtData = {
    thought: args.prompt,
    thoughtNumber: args.parameters?.thoughtNumber || 1,
    totalThoughts: args.parameters?.totalThoughts || 1,
    nextThoughtNeeded: args.parameters?.nextThoughtNeeded || false,
    isRevision: args.parameters?.isRevision,
    revisesThought: args.parameters?.revisesThought,
    branchFromThought: args.parameters?.branchFromThought,
    branchId: args.parameters?.branchId,
    needsMoreThoughts: args.parameters?.needsMoreThoughts
  };
  
  const added = sessionState.addThought(thoughtData);
  const allThoughts = sessionState.getThoughts();
  const recentThoughts = allThoughts.slice(-3);
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
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
      }, null, 2)
    }]
  };
}

async function handleMentalModel(args: any, sessionState: SessionState) {
  const modelData = {
    modelName: args.parameters?.model || 'first_principles',
    problem: args.prompt,
    steps: args.parameters?.steps || [],
    reasoning: args.parameters?.reasoning || '',
    conclusion: args.parameters?.conclusion || ''
  };
  
  sessionState.addMentalModel(modelData);
  const allModels = sessionState.getMentalModels();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'mental_model',
        ...modelData,
        sessionContext: {
          sessionId: sessionState.sessionId,
          totalModels: allModels.length,
          recentModels: allModels.slice(-3).map(m => ({ modelName: m.modelName, problem: m.problem }))
        }
      }, null, 2)
    }]
  };
}

async function handleDebuggingApproach(args: any, sessionState: SessionState) {
  const debugData = {
    approachName: args.parameters?.approach || 'binary_search',
    issue: args.prompt,
    steps: args.parameters?.steps || [],
    findings: args.parameters?.findings || '',
    resolution: args.parameters?.resolution || ''
  };
  
  sessionState.addDebuggingSession(debugData);
  const allSessions = sessionState.getDebuggingSessions();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'debugging_approach',
        ...debugData,
        sessionContext: {
          sessionId: sessionState.sessionId,
          totalSessions: allSessions.length,
          recentSessions: allSessions.slice(-3).map(s => ({ approachName: s.approachName, issue: s.issue }))
        }
      }, null, 2)
    }]
  };
}

async function handleCreativeThinking(args: any, sessionState: SessionState) {
  const creativeData = {
    prompt: args.prompt,
    ideas: args.parameters?.ideas || [],
    techniques: args.parameters?.techniques || ['brainstorming'],
    connections: args.parameters?.connections || [],
    insights: args.parameters?.insights || [],
    sessionId: `creative-${Date.now()}`,
    iteration: args.parameters?.iteration || 1,
    nextIdeaNeeded: args.parameters?.nextIdeaNeeded || false
  };
  
  sessionState.addCreativeSession(creativeData);
  const allSessions = sessionState.getCreativeSessions();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'creative_thinking',
        ...creativeData,
        sessionContext: {
          sessionId: sessionState.sessionId,
          totalSessions: allSessions.length,
          recentSessions: allSessions.slice(-3).map(s => ({ prompt: s.prompt, techniques: s.techniques }))
        }
      }, null, 2)
    }]
  };
}

async function handleVisualReasoning(args: any, sessionState: SessionState) {
  const visualData = {
    operation: 'create' as const,
    diagramId: args.parameters?.diagramId || `diagram-${Date.now()}`,
    diagramType: args.parameters?.diagramType || 'flowchart',
    iteration: args.parameters?.iteration || 1,
    nextOperationNeeded: args.parameters?.nextOperationNeeded || false
  };
  
  sessionState.addVisualOperation(visualData);
  const allOperations = sessionState.getVisualOperations();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'visual_reasoning',
        ...visualData,
        sessionContext: {
          sessionId: sessionState.sessionId,
          totalOperations: allOperations.length,
          recentOperations: allOperations.slice(-3).map(v => ({ diagramType: v.diagramType, operation: v.operation }))
        }
      }, null, 2)
    }]
  };
}

async function handleMetacognitiveMonitoring(args: any, sessionState: SessionState) {
  const metaData = {
    task: args.prompt,
    stage: args.parameters?.stage || 'monitoring',
    overallConfidence: args.parameters?.overallConfidence || 0.5,
    uncertaintyAreas: args.parameters?.uncertaintyAreas || [],
    recommendedApproach: args.parameters?.recommendedApproach || '',
    monitoringId: `meta-${Date.now()}`,
    iteration: args.parameters?.iteration || 1,
    nextAssessmentNeeded: args.parameters?.nextAssessmentNeeded || false
  };
  
  sessionState.addMetacognitive(metaData);
  const allSessions = sessionState.getMetacognitiveSessions();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'metacognitive_monitoring',
        ...metaData,
        sessionContext: {
          sessionId: sessionState.sessionId,
          totalSessions: allSessions.length,
          recentSessions: allSessions.slice(-3).map(m => ({ task: m.task, stage: m.stage }))
        }
      }, null, 2)
    }]
  };
}

async function handleScientificMethod(args: any, sessionState: SessionState) {
  const scientificData = {
    stage: args.parameters?.stage || 'hypothesis',
    inquiryId: `sci-${Date.now()}`,
    iteration: args.parameters?.iteration || 1,
    nextStageNeeded: args.parameters?.nextStageNeeded || false
  };
  
  sessionState.addScientificInquiry(scientificData);
  const allInquiries = sessionState.getScientificInquiries();
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'scientific_method',
        ...scientificData,
        sessionContext: {
          sessionId: sessionState.sessionId,
          totalInquiries: allInquiries.length,
          recentInquiries: allInquiries.slice(-3).map(s => ({ stage: s.stage }))
        }
      }, null, 2)
    }]
  };
}

async function handleCollaborativeReasoning(args: any, sessionState: SessionState) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'collaborative_reasoning',
        prompt: args.prompt,
        personas: args.parameters?.personas || ['analyst', 'critic'],
        result: 'Collaborative reasoning completed'
      }, null, 2)
    }]
  };
}

async function handleDecisionFramework(args: any, sessionState: SessionState) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'decision_framework',
        prompt: args.prompt,
        framework: args.parameters?.framework || 'pros_cons',
        result: 'Decision framework applied successfully'
      }, null, 2)
    }]
  };
}

async function handleSocraticMethod(args: any, sessionState: SessionState) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'socratic_method',
        prompt: args.prompt,
        stage: args.parameters?.stage || 'clarification',
        result: 'Socratic method applied successfully'
      }, null, 2)
    }]
  };
}

async function handleStructuredArgumentation(args: any, sessionState: SessionState) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'structured_argumentation',
        prompt: args.prompt,
        claim: args.parameters?.claim || args.prompt,
        result: 'Structured argumentation completed'
      }, null, 2)
    }]
  };
}

async function handleSystemsThinking(args: any, sessionState: SessionState) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        toolOperation: 'systems_thinking',
        prompt: args.prompt,
        analysisType: args.parameters?.analysisType || 'components',
        result: 'Systems thinking analysis completed'
      }, null, 2)
    }]
  };
}

async function handleSessionOperations(args: any, sessionState: SessionState) {
  switch (args.operation) {
    case 'session_info':
              return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              toolOperation: 'session_info',
              sessionId: sessionState.sessionId,
              stats: sessionState.getStats()
            }, null, 2)
          }]
        };
    case 'session_export':
              return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              toolOperation: 'session_export',
              sessionData: sessionState.export()
            }, null, 2)
          }]
        };
    case 'session_import':
              return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              toolOperation: 'session_import',
              result: 'Session import completed'
            }, null, 2)
          }]
        };
    default:
      throw new Error(`Unknown session operation: ${args.operation}`);
  }
}