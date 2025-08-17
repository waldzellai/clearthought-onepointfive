/**
 * Systems Thinking Operation
 * 
 * Analyzes complex systems by identifying components, relationships, and feedback loops
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class SystemsThinkingOperation extends BaseOperation {
  name = 'systems_thinking';
  category = 'collaborative';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Use provided parameters or default to empty arrays
    const components = (parameters.components as string[]) || [];
    const relationships = (parameters.relationships as any[]) || [];
    let feedbackLoops = (parameters.feedbackLoops as any[]) || [];
    const emergentProperties = (parameters.emergentProperties as string[]) || [];
    const leveragePoints = (parameters.leveragePoints as string[]) || [];
    
    // Simple feedback loop detection from relationships if not provided
    if (feedbackLoops.length === 0 && relationships.length > 0) {
      feedbackLoops = this.detectFeedbackLoops(relationships);
    }
    
    const systemsData = {
      system: prompt,
      components,
      relationships,
      feedbackLoops,
      emergentProperties,
      leveragePoints,
      sessionId: `systems-${Date.now()}`,
      iteration: this.getParam(parameters, 'iteration', 1),
      nextAnalysisNeeded: this.getParam(parameters, 'nextAnalysisNeeded', false),
    };
    
    // Update KPI for systems components
    if (components.length > 0) {
      sessionState.updateKPI('systems_components_count', components.length);
    }
    
    return this.createResult({
      ...systemsData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private detectFeedbackLoops(relationships: any[]): any[] {
    const feedbackLoops: any[] = [];
    const graph = new Map<string, Set<string>>();
    
    // Build adjacency graph
    relationships.forEach((rel: any) => {
      if (!graph.has(rel.from)) graph.set(rel.from, new Set());
      graph.get(rel.from)!.add(rel.to);
    });
    
    // Simple cycle detection (depth 2-3)
    for (const [start, targets] of graph.entries()) {
      for (const mid of targets) {
        if (graph.has(mid)) {
          for (const end of graph.get(mid)!) {
            if (end === start) {
              // Found 2-cycle
              feedbackLoops.push({
                components: [start, mid],
                type: 'negative',
                description: `${start} -> ${mid} -> ${start}`
              });
            } else if (graph.has(end) && graph.get(end)!.has(start)) {
              // Found 3-cycle
              feedbackLoops.push({
                components: [start, mid, end],
                type: 'positive',
                description: `${start} -> ${mid} -> ${end} -> ${start}`
              });
            }
          }
        }
      }
    }
    
    return feedbackLoops;
  }
}

export default new SystemsThinkingOperation();