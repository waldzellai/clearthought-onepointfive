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
      const { operation, prompt, parameters = {} } = args;
      
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
          
          const added = sessionState.addThought(thoughtData);
          const allThoughts = sessionState.getThoughts();
          const recentThoughts = allThoughts.slice(-3);
          
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
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
              }, null, 2)
            }]
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
        
        case 'visual_reasoning': {
          const visualData = {
            operation: 'create' as const,
            diagramId: parameters.diagramId || `diagram-${Date.now()}`,
            diagramType: parameters.diagramType || 'flowchart',
            iteration: parameters.iteration || 1,
            nextOperationNeeded: parameters.nextOperationNeeded || false
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
        
        case 'metacognitive_monitoring': {
          const metaData = {
            task: prompt,
            stage: parameters.stage || 'monitoring',
            overallConfidence: parameters.overallConfidence || 0.5,
            uncertaintyAreas: parameters.uncertaintyAreas || [],
            recommendedApproach: parameters.recommendedApproach || '',
            monitoringId: `meta-${Date.now()}`,
            iteration: parameters.iteration || 1,
            nextAssessmentNeeded: parameters.nextAssessmentNeeded || false
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
        
        case 'scientific_method': {
          const scientificData = {
            stage: parameters.stage || 'hypothesis',
            inquiryId: `sci-${Date.now()}`,
            iteration: parameters.iteration || 1,
            nextStageNeeded: parameters.nextStageNeeded || false
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
        
        case 'collaborative_reasoning':
        case 'decision_framework':
        case 'socratic_method':
        case 'structured_argumentation':
        case 'systems_thinking': {
          // Placeholder implementations for operations that don't have full data structures yet
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                toolOperation: operation,
                prompt: prompt,
                parameters: parameters,
                result: `${operation} operation completed`,
                sessionContext: {
                  sessionId: sessionState.sessionId,
                  stats: sessionState.getStats()
                }
              }, null, 2)
            }]
          };
        }
        
        case 'session_info': {
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
        }
        
        case 'session_export': {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                toolOperation: 'session_export',
                sessionData: sessionState.export()
              }, null, 2)
            }]
          };
        }
        
        case 'session_import': {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                toolOperation: 'session_import',
                result: 'Session import completed'
              }, null, 2)
            }]
          };
        }
        
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }
  );
}