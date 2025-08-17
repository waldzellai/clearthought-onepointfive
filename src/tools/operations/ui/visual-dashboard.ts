/**
 * Visual Dashboard Operation
 * 
 * Creates interactive visual dashboards for data exploration and analysis
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { generateDashboardHTML, generateRemoteDomScript } from '../../helpers/ui-generation.js';

export class VisualDashboardOperation extends BaseOperation {
  name = 'visual_dashboard';
  category = 'ui';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract dashboard configuration
    const title = this.getParam(parameters, 'title', 'Clear Thought Dashboard');
    const visualizationType = this.getParam(parameters, 'visualizationType', 'chart');
    const layout = this.getParam(parameters, 'layout', 'grid');
    const interactive = this.getParam(parameters, 'interactive', true);
    const data = this.getParam(parameters, 'data', {});
    const panels = this.getParam(parameters, 'panels', []);
    
    // Generate default panels if none provided
    const defaultPanels = panels.length > 0 ? panels : this.generateDefaultPanels(prompt, sessionState);
    
    // Generate dashboard HTML
    const dashboardHTML = generateDashboardHTML({
      title,
      visualizationType,
      data,
      panels: defaultPanels,
      layout,
      interactive
    });
    
    // Generate remote DOM script for dynamic updates
    const remoteDomScript = generateRemoteDomScript({
      visualizationType,
      data,
      panels: defaultPanels,
      interactive
    });
    
    // Store dashboard state in session
    const dashboardId = `dashboard_${Date.now()}`;
    sessionState.addToSession('dashboards', {
      id: dashboardId,
      title,
      createdAt: new Date().toISOString(),
      configuration: {
        visualizationType,
        layout,
        interactive,
        panels: defaultPanels
      }
    });
    
    return this.createResult({
      dashboardId,
      title,
      visualizationType,
      layout,
      interactive,
      panels: defaultPanels,
      html: dashboardHTML,
      remoteDomScript,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        dashboardCount: sessionState.getFromSession('dashboards')?.length || 1
      },
      instructions: {
        usage: 'Dashboard HTML can be saved to file or displayed in browser',
        interactivity: interactive ? 'Dashboard supports click interactions and real-time updates' : 'Static dashboard for display only',
        customization: 'Modify panels array to add custom metrics, charts, or content'
      }
    });
  }
  
  /**
   * Generate default panels based on prompt and session state
   */
  private generateDefaultPanels(prompt: string, sessionState: any): any[] {
    const stats = sessionState.getStats();
    const panels = [];
    
    // Overview panel
    panels.push({
      title: 'Session Overview',
      type: 'metric',
      content: `<p>Analysis of: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}</p>`,
      value: `${Object.keys(stats).length} data types`
    });
    
    // Statistics panels
    Object.entries(stats).forEach(([type, count]) => {
      panels.push({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`,
        type: 'metric',
        content: `<p>Reasoning operations of type: ${type}</p>`,
        value: count
      });
    });
    
    // Analysis insights panel
    panels.push({
      title: 'Key Insights',
      type: 'content',
      content: `
        <ul>
          <li>Total reasoning operations: ${Object.values(stats).reduce((a, b) => (a as number) + (b as number), 0)}</li>
          <li>Most used operation: ${this.getMostUsedOperation(stats)}</li>
          <li>Session complexity: ${this.calculateComplexity(stats)}</li>
        </ul>
      `
    });
    
    return panels;
  }
  
  private getMostUsedOperation(stats: Record<string, unknown>): string {
    const entries = Object.entries(stats);
    if (entries.length === 0) return 'None';
    
    const max = entries.reduce((a, b) => 
      (a[1] as number) > (b[1] as number) ? a : b
    );
    return max[0];
  }
  
  private calculateComplexity(stats: Record<string, unknown>): string {
    const total = Object.values(stats).reduce((a, b) => (a as number) + (b as number), 0) as number;
    const types = Object.keys(stats).length;
    
    if (total < 5) return 'Low';
    if (total < 15) return 'Medium';
    if (types > 5) return 'High';
    return 'Very High';
  }
}

export default new VisualDashboardOperation();