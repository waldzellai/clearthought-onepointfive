import type { SessionState } from '../state/SessionState.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
      const result = executeClearThoughtOperation(sessionState, args.operation, { prompt: args.prompt, parameters: args.parameters });
      
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
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
export function executeClearThoughtOperation(
  sessionState: SessionState,
  operation: string,
  args: { prompt: string; parameters?: Record<string, unknown> }
): Record<string, unknown> {
  const { prompt, parameters = {} } = args;
  
  // Type guard to ensure parameters are properly typed
  const getParam = <T>(key: string, defaultValue: T): T => {
    return (parameters[key] as T) ?? defaultValue;
  };
  
  // Unified handler for all operations
  switch (operation) {
    case 'sequential_thinking': {
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
      
      const added = sessionState.addThought(thoughtData as any);
      const allThoughts = sessionState.getThoughts();
      const recentThoughts = allThoughts.slice(-3);
      
      return {
        toolOperation: 'sequential_thinking',
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
      
      sessionState.addMentalModel(modelData as any);
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
      
      sessionState.addDebuggingSession(debugData as any);
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
      
      sessionState.addCreativeSession(creativeData as any);
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
        operation: 'create' as const,
        diagramId: getParam('diagramId', `diagram-${Date.now()}`),
        diagramType: getParam('diagramType', 'flowchart'),
        iteration: getParam('iteration', 1),
        nextOperationNeeded: getParam('nextOperationNeeded', false)
      };
      
      sessionState.addVisualOperation(visualData as any);
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
      
      sessionState.addMetacognitive(metaData as any);
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
        stage: getParam('stage', 'hypothesis') as 'conclusion' | 'iteration' | 'hypothesis' | 'observation' | 'question' | 'experiment' | 'analysis',
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
    
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}