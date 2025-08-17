/**
 * Notebook Create Operation
 * 
 * Creates new ephemeral notebooks for reasoning and analysis
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { EphemeralNotebookStore } from '../../../notebook/EphemeralNotebook.js';

export class NotebookCreateOperation extends BaseOperation {
  name = 'notebook_create';
  category = 'notebook';
  
  private static notebookStore = new EphemeralNotebookStore();
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract notebook configuration
    const title = this.getParam(parameters, 'title', 'Clear Thought Notebook');
    const description = this.getParam(parameters, 'description', prompt);
    const initialContent = this.getParam(parameters, 'initialContent', []);
    const enableTypescript = this.getParam(parameters, 'enableTypescript', false);
    
    // Create notebook
    const notebook = NotebookCreateOperation.notebookStore.createNotebook(sessionState.sessionId);
    
    // Add initial metadata
    notebook.metadata = {
      title,
      description,
      createdFor: prompt,
      enableTypescript,
      tags: this.extractTags(prompt),
      version: '1.0'
    };
    
    // Add initial content if provided
    if (initialContent.length > 0) {
      for (const content of initialContent) {
        this.addInitialCell(notebook.id, content);
      }
    } else {
      // Add default introduction cell
      this.addDefaultIntroduction(notebook.id, title, description);
    }
    
    // Store notebook reference in session
    sessionState.addToSession('notebooks', {
      notebookId: notebook.id,
      title,
      createdAt: notebook.createdAt,
      cellCount: notebook.cells.length
    });
    
    return this.createResult({
      notebookId: notebook.id,
      title,
      description,
      cellCount: notebook.cells.length,
      enableTypescript,
      sessionId: notebook.sessionId,
      createdAt: new Date(notebook.createdAt).toISOString(),
      cells: notebook.cells.map(cell => ({
        id: cell.id,
        type: cell.type,
        language: cell.language,
        preview: this.getCellPreview(cell.source)
      })),
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        notebookCount: sessionState.getFromSession('notebooks')?.length || 1
      },
      instructions: {
        usage: 'Use notebook-add-cell to add content, notebook-run-cell to execute code',
        export: 'Use notebook-export to save notebook in various formats',
        persistence: 'Notebook is ephemeral and will be cleaned up after inactivity'
      }
    });
  }
  
  /**
   * Add initial cell with content specification
   */
  private addInitialCell(notebookId: string, content: any) {
    const type = content.type || 'markdown';
    const source = content.source || content.content || '';
    const language = content.language || 'javascript';
    
    NotebookCreateOperation.notebookStore.addCell(
      notebookId,
      type,
      source,
      type === 'code' ? language : undefined
    );
  }
  
  /**
   * Add default introduction cell
   */
  private addDefaultIntroduction(notebookId: string, title: string, description: string) {
    const introContent = `# ${title}

${description}

## Overview
This notebook was created to explore and analyze the following:

> ${description}

## Structure
- **Analysis Cells**: Markdown cells for documentation and insights
- **Code Cells**: JavaScript execution for calculations and data processing
- **Results**: Output from code execution and analysis

## Usage
Use this notebook to:
1. Document your reasoning process
2. Perform calculations and data analysis
3. Visualize results and insights
4. Export findings for future reference

---
*Created: ${new Date().toLocaleDateString()} | Session: ${notebookId.split('-')[0]}*
`;
    
    NotebookCreateOperation.notebookStore.addCell(
      notebookId,
      'markdown',
      introContent
    );
  }
  
  /**
   * Extract relevant tags from prompt
   */
  private extractTags(prompt: string): string[] {
    const tags = new Set<string>();
    
    // Common reasoning keywords
    const keywords = [
      'analysis', 'decision', 'problem', 'solution', 'strategy',
      'research', 'evaluation', 'comparison', 'optimization',
      'design', 'planning', 'review', 'assessment'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        tags.add(keyword);
      }
    });
    
    // Add domain-specific tags
    if (lowerPrompt.includes('business') || lowerPrompt.includes('market')) {
      tags.add('business');
    }
    if (lowerPrompt.includes('technical') || lowerPrompt.includes('engineering')) {
      tags.add('technical');
    }
    if (lowerPrompt.includes('scientific') || lowerPrompt.includes('research')) {
      tags.add('research');
    }
    if (lowerPrompt.includes('creative') || lowerPrompt.includes('design')) {
      tags.add('creative');
    }
    
    return Array.from(tags);
  }
  
  /**
   * Get preview of cell content (first 100 characters)
   */
  private getCellPreview(source: string): string {
    const cleaned = source.trim().replace(/\n+/g, ' ');
    return cleaned.length > 100 ? cleaned.substring(0, 97) + '...' : cleaned;
  }
  
  /**
   * Get the notebook store instance
   */
  static getNotebookStore(): EphemeralNotebookStore {
    return NotebookCreateOperation.notebookStore;
  }
}

export default new NotebookCreateOperation();