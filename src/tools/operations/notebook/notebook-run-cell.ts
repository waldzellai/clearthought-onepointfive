/**
 * Notebook Run Cell Operation
 * 
 * Executes code cells in notebooks and captures output
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { NotebookCreateOperation } from './notebook-create.js';

export class NotebookRunCellOperation extends BaseOperation {
  name = 'notebook_run_cell';
  category = 'notebook';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract execution parameters
    const notebookId = this.getParam(parameters, 'notebookId', '');
    const cellId = this.getParam(parameters, 'cellId', '');
    const timeoutMs = this.getParam(parameters, 'timeoutMs', 5000);
    
    // Validate notebook exists
    const notebookStore = NotebookCreateOperation.getNotebookStore();
    let notebook = notebookStore.getNotebook(notebookId);
    
    // If no notebook ID provided or notebook not found, try to find by session
    if (!notebook) {
      notebook = notebookStore.getNotebookBySession(sessionState.sessionId);
      if (!notebook) {
        throw new Error('No notebook found. Create a notebook first using notebook_create.');
      }
    }
    
    // Find cell to execute
    let targetCell;
    if (cellId) {
      targetCell = notebook.cells.find(cell => cell.id === cellId);
      if (!targetCell) {
        throw new Error(`Cell with ID ${cellId} not found in notebook`);
      }
    } else {
      // If no cell ID provided, try to infer from prompt or use last code cell
      targetCell = this.findTargetCell(notebook, prompt);
      if (!targetCell) {
        throw new Error('No executable code cell found. Please specify cellId or add a code cell first.');
      }
    }
    
    // Validate cell is executable
    if (targetCell.type !== 'code') {
      throw new Error(`Cell ${targetCell.id} is not a code cell (type: ${targetCell.type})`);
    }
    
    // Execute cell
    const execution = await notebookStore.executeCell(
      notebook.id,
      targetCell.id,
      timeoutMs
    );
    
    // Analyze execution results
    const analysis = this.analyzeExecution(execution, targetCell);
    
    // Update session tracking
    const notebooks = sessionState.getFromSession('notebooks') || [];
    const notebookRef = notebooks.find((nb: any) => nb.notebookId === notebook.id);
    if (notebookRef) {
      notebookRef.lastExecuted = new Date().toISOString();
      notebookRef.executionCount = (notebookRef.executionCount || 0) + 1;
    }
    
    return this.createResult({
      executionId: execution.id,
      cellId: targetCell.id,
      notebookId: notebook.id,
      status: execution.status,
      duration: execution.completedAt ? execution.completedAt - execution.startedAt : null,
      outputs: execution.outputs,
      error: execution.error,
      analysis,
      cell: {
        id: targetCell.id,
        type: targetCell.type,
        language: targetCell.language,
        source: targetCell.source,
        status: targetCell.status
      },
      notebook: {
        id: notebook.id,
        title: notebook.metadata?.title || 'Untitled Notebook',
        totalExecutions: notebook.executions.size,
        cellCount: notebook.cells.length
      },
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        notebookCount: notebooks.length
      },
      instructions: {
        outputs: 'Check outputs array for stdout, stderr, and result data',
        debugging: execution.error ? 'Review error message and check code syntax' : 'Execution completed successfully',
        continuation: 'Add more cells or modify existing ones to continue analysis'
      }
    });
  }
  
  /**
   * Find target cell when cellId not specified
   */
  private findTargetCell(notebook: any, prompt: string) {
    const codeCells = notebook.cells.filter((cell: any) => cell.type === 'code');
    
    if (codeCells.length === 0) {
      return null;
    }
    
    // If prompt mentions running specific code, try to find matching cell
    if (prompt.toLowerCase().includes('run') || prompt.toLowerCase().includes('execute')) {
      // Look for keywords in cell source
      const keywords = this.extractKeywords(prompt);
      for (const cell of codeCells) {
        if (keywords.some(keyword => cell.source.toLowerCase().includes(keyword))) {
          return cell;
        }
      }
    }
    
    // Default to last code cell
    return codeCells[codeCells.length - 1];
  }
  
  /**
   * Extract keywords from prompt for cell matching
   */
  private extractKeywords(prompt: string): string[] {
    const words = prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been'].includes(word));
    
    return words.slice(0, 5); // Limit to first 5 meaningful words
  }
  
  /**
   * Analyze execution results
   */
  private analyzeExecution(execution: any, cell: any) {
    const analysis: any = {
      success: execution.status === 'complete',
      duration: execution.completedAt - execution.startedAt,
      outputCount: execution.outputs.length,
      outputTypes: this.categorizeOutputs(execution.outputs),
      codeMetrics: this.analyzeCode(cell.source)
    };
    
    if (execution.error) {
      analysis.errorAnalysis = this.analyzeError(execution.error, cell.source);
    }
    
    if (execution.outputs.length > 0) {
      analysis.outputSummary = this.summarizeOutputs(execution.outputs);
    }
    
    return analysis;
  }
  
  /**
   * Categorize outputs by type
   */
  private categorizeOutputs(outputs: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    outputs.forEach(output => {
      categories[output.type] = (categories[output.type] || 0) + 1;
    });
    
    return categories;
  }
  
  /**
   * Analyze code characteristics
   */
  private analyzeCode(source: string) {
    return {
      lineCount: source.split('\n').length,
      characterCount: source.length,
      hasLoops: /\b(for|while|forEach)\b/.test(source),
      hasFunctions: /\b(function|=>)\b/.test(source),
      hasVariables: /\b(let|const|var)\b/.test(source),
      hasConsoleOutput: /console\.(log|error|warn|info)/.test(source)
    };
  }
  
  /**
   * Analyze error for common issues
   */
  private analyzeError(error: string, source: string) {
    const analysis: any = {
      errorType: this.classifyError(error),
      likelyIssues: [],
      suggestions: []
    };
    
    // Common error patterns
    if (error.includes('ReferenceError')) {
      analysis.likelyIssues.push('Undefined variable or function');
      analysis.suggestions.push('Check variable names and declarations');
    }
    
    if (error.includes('SyntaxError')) {
      analysis.likelyIssues.push('Invalid JavaScript syntax');
      analysis.suggestions.push('Review code syntax, brackets, and semicolons');
    }
    
    if (error.includes('TypeError')) {
      analysis.likelyIssues.push('Type mismatch or null/undefined access');
      analysis.suggestions.push('Check data types and null checks');
    }
    
    if (error.includes('timeout')) {
      analysis.likelyIssues.push('Code execution took too long');
      analysis.suggestions.push('Optimize loops or increase timeout');
    }
    
    return analysis;
  }
  
  /**
   * Classify error type
   */
  private classifyError(error: string): string {
    if (error.includes('ReferenceError')) return 'reference';
    if (error.includes('SyntaxError')) return 'syntax';
    if (error.includes('TypeError')) return 'type';
    if (error.includes('timeout')) return 'timeout';
    if (error.includes('RangeError')) return 'range';
    return 'unknown';
  }
  
  /**
   * Summarize outputs
   */
  private summarizeOutputs(outputs: any[]) {
    const summary: any = {
      totalLines: 0,
      hasResults: false,
      hasErrors: false,
      hasConsoleOutput: false
    };
    
    outputs.forEach(output => {
      summary.totalLines += output.data.split('\n').length;
      
      switch (output.type) {
        case 'result':
          summary.hasResults = true;
          break;
        case 'stderr':
          summary.hasErrors = true;
          break;
        case 'stdout':
          summary.hasConsoleOutput = true;
          break;
      }
    });
    
    return summary;
  }
}

export default new NotebookRunCellOperation();