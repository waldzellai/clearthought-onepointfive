/**
 * Metacognitive Monitoring Operation
 * 
 * Monitors and evaluates thinking processes
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class MetacognitiveMonitoringOperation extends BaseOperation {
  name = 'metacognitive_monitoring';
  category = 'core';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const monitoringData = {
      currentThinking: prompt,
      awareness: this.getParam(parameters, 'awareness', ''),
      evaluation: this.getParam(parameters, 'evaluation', ''),
      strategies: this.getParam(parameters, 'strategies', []),
      adjustments: this.getParam(parameters, 'adjustments', []),
      confidence: this.getParam(parameters, 'confidence', 0.5),
      biasCheck: this.getParam(parameters, 'biasCheck', []),
    };
    
    // Update confidence KPI
    sessionState.updateKPI(
      'metacognitive_confidence',
      monitoringData.confidence,
      'Thinking Confidence',
      0.8,
      'up'
    );
    
    return this.createResult({
      ...monitoringData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        kpis: sessionState.getKPIs(),
      },
    });
  }
}

export default new MetacognitiveMonitoringOperation();