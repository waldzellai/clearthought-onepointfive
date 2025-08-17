/**
 * Mental Model Operation
 * 
 * Provides structured mental models like First Principles, Pareto, etc.
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class MentalModelOperation extends BaseOperation {
  name = 'mental_model';
  category = 'core';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const modelData = {
      modelName: this.getParam(parameters, 'model', 'first_principles'),
      problem: prompt,
      steps: this.getParam(parameters, 'steps', []),
      reasoning: this.getParam(parameters, 'reasoning', ''),
      conclusion: this.getParam(parameters, 'conclusion', ''),
    };
    
    // Add to session state
    sessionState.addMentalModel(modelData as any);
    const allModels = sessionState.getMentalModels();
    
    return this.createResult({
      ...modelData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        totalModels: allModels.length,
        recentModels: allModels
          .slice(-3)
          .map((m) => ({ modelName: m.modelName, problem: m.problem })),
      },
    });
  }
}

export default new MentalModelOperation();