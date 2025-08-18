/**
 * Notebook Export Operation
 * 
 * Exports notebooks in various formats (SrcMD, JSON, HTML)
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import { NotebookCreateOperation } from './notebook-create.js';

export class NotebookExportOperation extends BaseOperation {
  name = 'notebook_export';
  category = 'notebook';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract export parameters
    const notebookId = this.getParam(parameters, 'notebookId', '');
    const format = this.getParam(parameters, 'format', 'srcmd') as 'srcmd' | 'json' | 'html' | 'markdown';
    const includeMetadata = this.getParam(parameters, 'includeMetadata', true);
    const includeOutputs = this.getParam(parameters, 'includeOutputs', true);
    const filename = this.getParam(parameters, 'filename', '');
    
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
    
    // Generate export content based on format
    let exportContent: string;
    let mimeType: string;
    let suggestedFilename: string;
    
    switch (format) {
      case 'srcmd':
        exportContent = this.exportToSrcMd(notebook, includeOutputs);
        mimeType = 'text/markdown';
        suggestedFilename = filename || `${this.sanitizeFilename(notebook.metadata?.title || 'notebook')}.srcmd`;
        break;
        
      case 'json':
        exportContent = this.exportToJson(notebook, includeMetadata, includeOutputs);
        mimeType = 'application/json';
        suggestedFilename = filename || `${this.sanitizeFilename(notebook.metadata?.title || 'notebook')}.json`;
        break;
        
      case 'html':
        exportContent = this.exportToHtml(notebook, includeMetadata, includeOutputs);
        mimeType = 'text/html';
        suggestedFilename = filename || `${this.sanitizeFilename(notebook.metadata?.title || 'notebook')}.html`;
        break;
        
      case 'markdown':
        exportContent = this.exportToMarkdown(notebook, includeOutputs);
        mimeType = 'text/markdown';
        suggestedFilename = filename || `${this.sanitizeFilename(notebook.metadata?.title || 'notebook')}.md`;
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    // Generate export statistics
    const exportStats = this.generateExportStats(notebook, exportContent);
    
    // Session tracking is managed by notebook store
    
    return this.createResult({
      notebookId: notebook.id,
      format,
      filename: suggestedFilename,
      mimeType,
      content: exportContent,
      size: exportContent.length,
      stats: exportStats,
      notebook: {
        id: notebook.id,
        title: notebook.metadata?.title || 'Untitled Notebook',
        cellCount: notebook.cells.length,
        executionCount: notebook.executions.size,
        createdAt: new Date(notebook.createdAt).toISOString()
      },
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        notebookCount: 1 // Using notebook store's internal tracking
      },
      instructions: {
        usage: 'Save content to file using suggested filename',
        formats: 'SrcMD for sourcebook, JSON for data exchange, HTML for viewing, Markdown for documentation',
        sharing: 'Exported content can be shared or imported into other tools'
      }
    });
  }
  
  /**
   * Export to SrcMD format using notebook's built-in method
   */
  private exportToSrcMd(notebook: any, includeOutputs: boolean): string {
    const notebookStore = NotebookCreateOperation.getNotebookStore();
    const srcmdContent = notebookStore.exportToSrcMd(notebook.id);
    
    if (!srcmdContent) {
      throw new Error('Failed to export notebook to SrcMD format');
    }
    
    // Add header with metadata
    const header = this.generateSrcMdHeader(notebook);
    
    if (!includeOutputs) {
      // Remove output sections
      return header + srcmdContent.replace(/\n\*\*Output:\*\*\n```[\s\S]*?```\n/g, '\n');
    }
    
    return header + srcmdContent;
  }
  
  /**
   * Export to JSON format
   */
  private exportToJson(notebook: any, includeMetadata: boolean, includeOutputs: boolean): string {
    const notebookStore = NotebookCreateOperation.getNotebookStore();
    const jsonData = notebookStore.exportToJson(notebook.id) as any;
    
    if (!jsonData) {
      throw new Error('Failed to export notebook to JSON format');
    }
    
    // Filter content based on options
    if (!includeMetadata) {
      delete jsonData.metadata;
    }
    
    if (!includeOutputs) {
      jsonData.cells = jsonData.cells.map((cell: any) => {
        const { outputs, ...cellWithoutOutputs } = cell;
        return cellWithoutOutputs;
      });
      delete jsonData.executions;
    }
    
    return JSON.stringify(jsonData, null, 2);
  }
  
  /**
   * Export to HTML format
   */
  private exportToHtml(notebook: any, includeMetadata: boolean, includeOutputs: boolean): string {
    const title = notebook.metadata?.title || 'Clear Thought Notebook';
    const description = notebook.metadata?.description || '';
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .notebook-header {
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .cell {
            margin-bottom: 30px;
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
        }
        .cell-header {
            background: #f8f9fa;
            padding: 10px 15px;
            font-size: 12px;
            color: #666;
            border-bottom: 1px solid #eee;
        }
        .cell-content {
            padding: 15px;
        }
        .markdown-cell {
            background: #fff;
        }
        .code-cell {
            background: #f8f9fa;
        }
        .code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
        }
        .output {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-family: monospace;
            font-size: 12px;
        }
        .output-stdout { border-left: 4px solid #38a169; }
        .output-stderr { border-left: 4px solid #e53e3e; }
        .output-result { border-left: 4px solid #3182ce; }
    </style>
</head>
<body>
    <div class="notebook-header">
        <h1>${this.escapeHtml(title)}</h1>
        ${description ? `<p>${this.escapeHtml(description)}</p>` : ''}
        ${includeMetadata ? this.generateHtmlMetadata(notebook) : ''}
    </div>
`;

    // Add cells
    notebook.cells.forEach((cell: any, index: number) => {
      html += this.renderCellAsHtml(cell, index, includeOutputs);
    });

    html += `
</body>
</html>`;

    return html;
  }
  
  /**
   * Export to Markdown format
   */
  private exportToMarkdown(notebook: any, includeOutputs: boolean): string {
    const title = notebook.metadata?.title || 'Clear Thought Notebook';
    const description = notebook.metadata?.description || '';
    
    let markdown = `# ${title}\n\n`;
    
    if (description) {
      markdown += `${description}\n\n`;
    }
    
    markdown += `---\n\n`;
    
    // Add cells
    notebook.cells.forEach((cell: any, index: number) => {
      if (cell.type === 'markdown') {
        markdown += `${cell.source}\n\n`;
      } else if (cell.type === 'code') {
        markdown += `\`\`\`${cell.language || 'javascript'}\n${cell.source}\n\`\`\`\n\n`;
        
        if (includeOutputs && cell.outputs && cell.outputs.length > 0) {
          markdown += '**Output:**\n```\n';
          cell.outputs.forEach((output: any) => {
            markdown += `${output.data}\n`;
          });
          markdown += '```\n\n';
        }
      }
    });
    
    return markdown;
  }
  
  /**
   * Generate SrcMD header
   */
  private generateSrcMdHeader(notebook: any): string {
    return `---
title: ${notebook.metadata?.title || 'Clear Thought Notebook'}
created: ${new Date(notebook.createdAt).toISOString()}
session: ${notebook.sessionId}
cells: ${notebook.cells.length}
executions: ${notebook.executions.size}
---

`;
  }
  
  /**
   * Generate HTML metadata section
   */
  private generateHtmlMetadata(notebook: any): string {
    return `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 15px;">
            <strong>Notebook Metadata:</strong><br>
            <small>
                Created: ${new Date(notebook.createdAt).toLocaleDateString()}<br>
                Session: ${notebook.sessionId}<br>
                Cells: ${notebook.cells.length}<br>
                Executions: ${notebook.executions.size}
            </small>
        </div>
    `;
  }
  
  /**
   * Render cell as HTML
   */
  private renderCellAsHtml(cell: any, index: number, includeOutputs: boolean): string {
    const cellClass = cell.type === 'code' ? 'code-cell' : 'markdown-cell';
    
    let html = `
    <div class="cell ${cellClass}">
        <div class="cell-header">
            Cell ${index + 1} (${cell.type}${cell.language ? ` - ${cell.language}` : ''})
        </div>
        <div class="cell-content">
    `;
    
    if (cell.type === 'markdown') {
      // Simple markdown to HTML conversion
      html += this.markdownToHtml(cell.source);
    } else {
      html += `<div class="code">${this.escapeHtml(cell.source)}</div>`;
      
      if (includeOutputs && cell.outputs && cell.outputs.length > 0) {
        cell.outputs.forEach((output: any) => {
          html += `<div class="output output-${output.type}">${this.escapeHtml(output.data)}</div>`;
        });
      }
    }
    
    html += `
        </div>
    </div>
    `;
    
    return html;
  }
  
  /**
   * Simple markdown to HTML conversion
   */
  private markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  }
  
  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Sanitize filename for safe file saving
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
  
  /**
   * Generate export statistics
   */
  private generateExportStats(notebook: any, content: string) {
    return {
      originalCells: notebook.cells.length,
      contentSize: content.length,
      wordCount: content.split(/\s+/).length,
      lineCount: content.split('\n').length,
      codeBlocks: (content.match(/```/g) || []).length / 2,
      executionCount: notebook.executions.size,
      exportedAt: new Date().toISOString()
    };
  }
}

export default new NotebookExportOperation();