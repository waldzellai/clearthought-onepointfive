/**
 * Monte Carlo Tree Search Operation
 * 
 * Implements MCTS pattern for decision-making under uncertainty
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { operationRegistry } from '../registry.js';
import { getPresetForPattern } from '../../../notebook/presets.js';
import { EphemeralNotebookStore } from '../../../notebook/EphemeralNotebook.js';

const notebookStore = new EphemeralNotebookStore();

export class MCTSOperation extends BaseOperation {
  name = 'mcts';
  category = 'patterns';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Create notebook with preset if needed
    const sessionId = sessionState.sessionId;
    let notebook = notebookStore.getNotebookBySession(sessionId);
    
    if (!notebook && this.getParam(parameters, 'createNotebook', true)) {
      notebook = notebookStore.createNotebook(sessionId);
      const preset = getPresetForPattern('mcts');
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
    
    // Delegate to sequential_thinking with MCTS pattern
    const sequentialOp = operationRegistry.get('sequential_thinking');
    if (sequentialOp) {
      return await sequentialOp.execute({
        sessionState,
        prompt,
        parameters: {
          pattern: 'mcts',
          patternParams: {
            simulations: this.getParam(parameters, 'simulations', 100),
            explorationConstant: this.getParam(parameters, 'explorationConstant', Math.SQRT2),
            tree: this.getParam(parameters, 'tree', {
              root: { visits: 0, value: 0, children: [] },
            }),
            bestAction: this.getParam(parameters, 'bestAction', null),
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

export default new MCTSOperation();