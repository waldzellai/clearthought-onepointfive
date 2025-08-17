/**
 * Orchestration Suggest Operation
 * 
 * Analyzes context and suggests optimal operation orchestration
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { operationRegistry } from '../registry.js';
import { getPresetForPattern } from '../../../notebook/presets.js';
import { EphemeralNotebookStore } from '../../../notebook/EphemeralNotebook.js';

const notebookStore = new EphemeralNotebookStore();

export class OrchestrationSuggestOperation extends BaseOperation {
  name = 'orchestration_suggest';
  category = 'patterns';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Create notebook with preset if needed
    const sessionId = sessionState.sessionId;
    let notebook = notebookStore.getNotebookBySession(sessionId);
    
    if (!notebook && this.getParam(parameters, 'createNotebook', true)) {
      notebook = notebookStore.createNotebook(sessionId);
      const preset = getPresetForPattern('orchestration_suggest');
      if (preset) {
        for (const cell of preset.cells) {
          notebookStore.addCell(
            notebook.id,
            cell.type,
            cell.source,
            cell.language,
          );
        }
      }
    }
    
    // Kick off a brief sequential_thinking step to seed orchestration
    const sequentialOp = operationRegistry.get('sequential_thinking');
    let initialThought = null;
    
    if (sequentialOp) {
      initialThought = await sequentialOp.execute({
        sessionState,
        prompt: `Plan approach for task: ${prompt}`,
        parameters: {
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          needsMoreThoughts: true,
          pattern: 'chain',
        },
      });
    }
    
    // Analyze task and suggest operations
    const suggestedTools = this.suggestTools(prompt);
    const workflow = this.createWorkflow(suggestedTools);
    
    return this.createResult({
      task: prompt,
      suggestedTools,
      reasoning: 'Analyzed task complexity and selected appropriate tools',
      initialThought,
      workflow,
      notebookId: notebook?.id,
    });
  }
  
  private suggestTools(prompt: string): string[] {
    const promptLower = prompt.toLowerCase();
    const tools: string[] = [];
    
    // Start with sequential thinking for most tasks
    tools.push('sequential_thinking');
    
    // Add specialized tools based on keywords
    if (promptLower.includes('debug') || promptLower.includes('error')) {
      tools.push('debugging_approach');
    }
    if (promptLower.includes('system') || promptLower.includes('complex')) {
      tools.push('systems_thinking');
    }
    if (promptLower.includes('decide') || promptLower.includes('choice')) {
      tools.push('decision_framework');
    }
    if (promptLower.includes('create') || promptLower.includes('innovative')) {
      tools.push('creative_thinking');
    }
    if (promptLower.includes('analyze') || promptLower.includes('data')) {
      tools.push('statistical_reasoning');
    }
    if (promptLower.includes('research') || promptLower.includes('investigate')) {
      tools.push('research');
    }
    
    // Add mental model for framing
    if (tools.length > 2) {
      tools.push('mental_model');
    }
    
    return tools;
  }
  
  private createWorkflow(tools: string[]): Array<{ step: string; purpose: string }> {
    return tools.map(tool => ({
      step: tool,
      purpose: this.getToolPurpose(tool),
    }));
  }
  
  private getToolPurpose(tool: string): string {
    const purposes: Record<string, string> = {
      sequential_thinking: 'break down problem into steps',
      mental_model: 'apply appropriate framework',
      debugging_approach: 'systematic problem isolation',
      systems_thinking: 'analyze system interactions',
      decision_framework: 'evaluate options systematically',
      creative_thinking: 'generate innovative solutions',
      statistical_reasoning: 'analyze data patterns',
      research: 'gather relevant information',
    };
    
    return purposes[tool] || 'process information';
  }
}

export default new OrchestrationSuggestOperation();