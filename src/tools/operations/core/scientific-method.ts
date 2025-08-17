/**
 * Scientific Method Operation
 * 
 * Applies scientific methodology to problem-solving
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class ScientificMethodOperation extends BaseOperation {
  name = 'scientific_method';
  category = 'core';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const scientificData = {
      observation: prompt,
      hypothesis: this.getParam(parameters, 'hypothesis', ''),
      experiment: this.getParam(parameters, 'experiment', {}),
      data: this.getParam(parameters, 'data', []),
      analysis: this.getParam(parameters, 'analysis', ''),
      conclusion: this.getParam(parameters, 'conclusion', ''),
      reproducibility: this.getParam(parameters, 'reproducibility', {}),
      peerReview: this.getParam(parameters, 'peerReview', []),
    };
    
    return this.createResult({
      ...scientificData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
}

export default new ScientificMethodOperation();