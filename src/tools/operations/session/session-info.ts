/**
 * Session Info Operation
 * 
 * Returns current session information and statistics
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class SessionInfoOperation extends BaseOperation {
  name = 'session_info';
  category = 'session';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState } = context;
    
    return this.createResult({
      sessionId: sessionState.sessionId,
      stats: sessionState.getStats(),
    });
  }
}

export default new SessionInfoOperation();