/**
 * Visual Reasoning Operation
 * 
 * Analyzes visual and spatial relationships
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class VisualReasoningOperation extends BaseOperation {
  name = 'visual_reasoning';
  category = 'core';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const visualData = {
      description: prompt,
      spatialRelations: this.getParam(parameters, 'spatialRelations', []),
      patterns: this.getParam(parameters, 'patterns', []),
      transformations: this.getParam(parameters, 'transformations', []),
      inference: this.getParam(parameters, 'inference', ''),
    };
    
    return this.createResult({
      ...visualData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
}

export default new VisualReasoningOperation();