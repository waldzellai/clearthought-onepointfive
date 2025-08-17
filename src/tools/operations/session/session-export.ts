/**
 * Session Export Operation
 * 
 * Exports session data for persistence or analysis
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class SessionExportOperation extends BaseOperation {
  name = 'session_export';
  category = 'session';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState } = context;
    
    return this.createResult({
      sessionData: sessionState.export(),
    });
  }
}

export default new SessionExportOperation();