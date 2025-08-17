/**
 * Debugging Approach Operation
 * 
 * Implements debugging methodologies like Binary Search, Root Cause Analysis, etc.
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class DebuggingApproachOperation extends BaseOperation {
  name = 'debugging_approach';
  category = 'core';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const debugData = {
      approachName: this.getParam(parameters, 'approach', 'binary_search'),
      issue: prompt,
      steps: this.getParam(parameters, 'steps', []),
      findings: this.getParam(parameters, 'findings', ''),
      resolution: this.getParam(parameters, 'resolution', ''),
    };
    
    sessionState.addDebuggingSession(debugData as any);
    const allSessions = sessionState.getDebuggingSessions();
    
    return this.createResult({
      ...debugData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        totalSessions: allSessions.length,
        recentSessions: allSessions
          .slice(-3)
          .map((s) => ({ approachName: s.approachName, issue: s.issue })),
      },
    });
  }
}

export default new DebuggingApproachOperation();