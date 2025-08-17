/**
 * Notebook Add Cell Operation
 * 
 * Adds new cells to existing notebooks
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { NotebookCreateOperation } from './notebook-create.js';

export class NotebookAddCellOperation extends BaseOperation {
  name = 'notebook_add_cell';
  category = 'notebook';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract cell configuration
    const notebookId = this.getParam(parameters, 'notebookId', '');
    const cellType = this.getParam(parameters, 'type', 'markdown') as 'markdown' | 'code';
    const source = this.getParam(parameters, 'source', prompt);
    const language = this.getParam(parameters, 'language', 'javascript');
    const index = this.getParam(parameters, 'index', undefined);
    
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
    
    // Validate cell type and content
    if (!source.trim()) {
      throw new Error('Cell source content cannot be empty');
    }
    
    // Add cell to notebook
    const cell = notebookStore.addCell(
      notebook.id,
      cellType,
      source,
      cellType === 'code' ? language : undefined,
      index
    );
    
    if (!cell) {
      throw new Error('Failed to add cell to notebook');
    }
    
    // Generate cell metadata
    const cellMetadata = this.generateCellMetadata(cellType, source, language);
    
    // Update session tracking
    const notebooks = sessionState.getFromSession('notebooks') || [];
    const notebookRef = notebooks.find((nb: any) => nb.notebookId === notebook.id);
    if (notebookRef) {
      notebookRef.cellCount = notebook.cells.length;
      notebookRef.lastUpdated = new Date().toISOString();
    }
    
    return this.createResult({
      cellId: cell.id,
      notebookId: notebook.id,
      cellType: cell.type,
      cellIndex: notebook.cells.length - 1,
      language: cell.language,
      preview: this.getCellPreview(cell.source),
      metadata: cellMetadata,
      notebook: {
        id: notebook.id,
        title: notebook.metadata?.title || 'Untitled Notebook',
        totalCells: notebook.cells.length,
        codeExecutions: notebook.executions.size
      },
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        notebookCount: notebooks.length
      },
      instructions: {
        execution: cellType === 'code' ? 'Use notebook-run-cell to execute this code cell' : 'Cell added as documentation',
        editing: 'Cell content can be updated by adding another cell or recreating',
        organization: 'Use index parameter to insert cells at specific positions'
      }
    });
  }
  
  /**
   * Generate metadata for the cell
   */
  private generateCellMetadata(cellType: string, source: string, language?: string) {
    const metadata: any = {
      type: cellType,
      wordCount: source.split(/\s+/).length,
      lineCount: source.split('\n').length,
      createdAt: new Date().toISOString(),
      contentType: this.detectContentType(source, cellType)
    };
    
    if (cellType === 'code') {
      metadata.language = language;
      metadata.complexity = this.analyzeCodeComplexity(source);
      metadata.dependencies = this.extractDependencies(source);
    } else {
      metadata.headingLevel = this.extractHeadingLevel(source);
      metadata.hasCodeBlocks = source.includes('```');
      metadata.hasLinks = source.includes('[') && source.includes('](');
    }
    
    return metadata;
  }
  
  /**
   * Detect the content type of the cell
   */
  private detectContentType(source: string, cellType: string): string {
    if (cellType === 'code') {
      if (source.includes('console.log') || source.includes('console.')) {
        return 'debugging';
      }
      if (source.includes('function') || source.includes('=>')) {
        return 'function-definition';
      }
      if (source.includes('=') && !source.includes('==')) {
        return 'variable-assignment';
      }
      if (source.includes('for') || source.includes('while') || source.includes('forEach')) {
        return 'iteration';
      }
      return 'computation';
    } else {
      if (source.startsWith('#')) {
        return 'heading';
      }
      if (source.includes('```')) {
        return 'documentation-with-code';
      }
      if (source.includes('- ') || source.includes('* ')) {
        return 'list';
      }
      if (source.includes('|') && source.includes('---')) {
        return 'table';
      }
      return 'text';
    }
  }
  
  /**
   * Analyze code complexity (basic)
   */
  private analyzeCodeComplexity(source: string): string {
    const lines = source.split('\n').filter(line => line.trim());
    const controlFlow = (source.match(/\b(if|for|while|switch|try)\b/g) || []).length;
    const functions = (source.match(/\bfunction\b|=>/g) || []).length;
    
    if (lines.length <= 5 && controlFlow === 0 && functions === 0) {
      return 'simple';
    }
    if (lines.length <= 20 && controlFlow <= 3 && functions <= 2) {
      return 'moderate';
    }
    return 'complex';
  }
  
  /**
   * Extract dependencies from code
   */
  private extractDependencies(source: string): string[] {
    const dependencies = new Set<string>();
    
    // Look for common patterns
    const patterns = [
      /require\(['"`]([^'"`]+)['"`]\)/g,
      /import.*from\s+['"`]([^'"`]+)['"`]/g,
      /import\s+['"`]([^'"`]+)['"`]/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(source)) !== null) {
        dependencies.add(match[1]);
      }
    });
    
    return Array.from(dependencies);
  }
  
  /**
   * Extract heading level from markdown
   */
  private extractHeadingLevel(source: string): number | null {
    const match = source.match(/^(#{1,6})\s/);
    return match ? match[1].length : null;
  }
  
  /**
   * Get preview of cell content
   */
  private getCellPreview(source: string): string {
    const cleaned = source.trim().replace(/\n+/g, ' ');
    return cleaned.length > 100 ? cleaned.substring(0, 97) + '...' : cleaned;
  }
}

export default new NotebookAddCellOperation();