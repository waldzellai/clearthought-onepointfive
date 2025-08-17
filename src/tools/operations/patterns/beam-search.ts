/**
 * Beam Search Operation
 * 
 * Implements beam search pattern for exploring top-k candidates
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { operationRegistry } from '../registry.js';
import { getPresetForPattern } from '../../../notebook/presets.js';
import { EphemeralNotebookStore } from '../../../notebook/EphemeralNotebook.js';

const notebookStore = new EphemeralNotebookStore();

export class BeamSearchOperation extends BaseOperation {
  name = 'beam_search';
  category = 'patterns';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Create notebook with preset if needed
    const sessionId = sessionState.sessionId;
    let notebook = notebookStore.getNotebookBySession(sessionId);
    
    if (!notebook && this.getParam(parameters, 'createNotebook', true)) {
      notebook = notebookStore.createNotebook(sessionId);
      const preset = getPresetForPattern('beam_search');
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
    
    // Delegate to sequential_thinking with beam pattern
    const sequentialOp = operationRegistry.get('sequential_thinking');
    if (sequentialOp) {
      return await sequentialOp.execute({
        sessionState,
        prompt,
        parameters: {
          pattern: 'beam',
          patternParams: {
            beamWidth: this.getParam(parameters, 'beamWidth', 3),
            candidates: this.getParam(parameters, 'candidates', []),
            scores: this.getParam(parameters, 'scores', []),
            iterations: this.getParam(parameters, 'iterations', 5),
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

export default new BeamSearchOperation();