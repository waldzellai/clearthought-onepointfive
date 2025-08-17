/**
 * Tree of Thought Operation
 * 
 * Implements tree-based reasoning with branching exploration
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { operationRegistry } from '../registry.js';
import { getPresetForPattern } from '../../../notebook/presets.js';
import { EphemeralNotebookStore } from '../../../notebook/EphemeralNotebook.js';

const notebookStore = new EphemeralNotebookStore();

export class TreeOfThoughtOperation extends BaseOperation {
  name = 'tree_of_thought';
  category = 'patterns';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Create notebook with preset if needed
    const sessionId = sessionState.sessionId;
    let notebook = notebookStore.getNotebookBySession(sessionId);
    
    if (!notebook && this.getParam(parameters, 'createNotebook', true)) {
      notebook = notebookStore.createNotebook(sessionId);
      const preset = getPresetForPattern('tree_of_thought');
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
    
    // Delegate to sequential_thinking with tree pattern
    const sequentialOp = operationRegistry.get('sequential_thinking');
    if (sequentialOp) {
      return await sequentialOp.execute({
        sessionState,
        prompt,
        parameters: {
          pattern: 'tree',
          patternParams: {
            depth: this.getParam(parameters, 'depth', 3),
            breadth: this.getParam(parameters, 'breadth', 3),
            branches: this.getParam(parameters, 'branches', []),
            evaluations: this.getParam(parameters, 'evaluations', []),
            selectedPath: this.getParam(parameters, 'selectedPath', null),
          },
          thoughtNumber: this.getParam(parameters, 'thoughtNumber', 1),
          totalThoughts: this.getParam(parameters, 'totalThoughts', 3),
          nextThoughtNeeded: this.getParam(parameters, 'nextThoughtNeeded', true),
          needsMoreThoughts: this.getParam(parameters, 'needsMoreThoughts', true),
          __disablePatternDispatch: true,
          notebookId: notebook?.id,
        },
      });
    }
    
    return this.createResult({
      error: 'Sequential thinking operation not found',
    });
  }
}

export default new TreeOfThoughtOperation();