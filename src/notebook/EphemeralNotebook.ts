/**
 * Ephemeral Notebook Implementation for ClearThought
 * 
 * Provides in-memory notebook functionality for reasoning patterns
 * with JavaScript execution and srcmd export capabilities.
 */

import { randomUUID } from 'crypto';
import vm from 'vm';

// Types
export interface NotebookConfig {
  enableTypescript?: boolean;
  defaultTimeoutMs?: number;
  maxCells?: number;
  maxExecutions?: number;
  maxOutputBytesPerExec?: number;
  idleTtlMs?: number;
}

export interface Cell {
  id: string;
  type: 'markdown' | 'code';
  source: string;
  language?: 'javascript' | 'typescript';
  status?: 'idle' | 'running' | 'failed';
  outputs?: Output[];
  metadata?: Record<string, any>;
}

export interface Output {
  type: 'stdout' | 'stderr' | 'result';
  data: string;
}

export interface Execution {
  id: string;
  cellId: string;
  status: 'running' | 'complete' | 'failed';
  startedAt: number;
  completedAt?: number;
  outputs: Output[];
  error?: string;
}

export interface Notebook {
  id: string;
  sessionId: string;
  createdAt: number;
  lastAccessedAt: number;
  cells: Cell[];
  executions: Map<string, Execution>;
  metadata?: Record<string, any>;
}

const DEFAULT_CONFIG: NotebookConfig = {
  enableTypescript: false,
  defaultTimeoutMs: 5000,
  maxCells: 200,
  maxExecutions: 200,
  maxOutputBytesPerExec: 262144, // 256KB
  idleTtlMs: 30 * 60 * 1000 // 30 minutes
};

export class EphemeralNotebookStore {
  private notebooks: Map<string, Notebook> = new Map();
  private config: NotebookConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<NotebookConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const ttl = this.config.idleTtlMs!;
      
      for (const [id, notebook] of this.notebooks.entries()) {
        if (now - notebook.lastAccessedAt > ttl) {
          this.notebooks.delete(id);
        }
      }
    }, 60000); // Check every minute
  }

  createNotebook(sessionId: string): Notebook {
    const existingNotebook = this.getNotebookBySession(sessionId);
    if (existingNotebook) {
      return existingNotebook;
    }

    const notebook: Notebook = {
      id: randomUUID(),
      sessionId,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      cells: [],
      executions: new Map()
    };

    this.notebooks.set(notebook.id, notebook);
    return notebook;
  }

  getNotebook(notebookId: string): Notebook | undefined {
    const notebook = this.notebooks.get(notebookId);
    if (notebook) {
      notebook.lastAccessedAt = Date.now();
    }
    return notebook;
  }

  getNotebookBySession(sessionId: string): Notebook | undefined {
    for (const notebook of this.notebooks.values()) {
      if (notebook.sessionId === sessionId) {
        notebook.lastAccessedAt = Date.now();
        return notebook;
      }
    }
    return undefined;
  }

  addCell(
    notebookId: string,
    type: 'markdown' | 'code',
    source: string,
    language?: 'javascript' | 'typescript',
    index?: number
  ): Cell | null {
    const notebook = this.getNotebook(notebookId);
    if (!notebook) return null;

    if (notebook.cells.length >= this.config.maxCells!) {
      throw new Error(`Maximum number of cells (${this.config.maxCells}) reached`);
    }

    const cell: Cell = {
      id: randomUUID(),
      type,
      source,
      language: type === 'code' ? (language || 'javascript') : undefined,
      status: type === 'code' ? 'idle' : undefined,
      outputs: type === 'code' ? [] : undefined
    };

    if (index !== undefined && index >= 0 && index <= notebook.cells.length) {
      notebook.cells.splice(index, 0, cell);
    } else {
      notebook.cells.push(cell);
    }

    return cell;
  }

  updateCell(notebookId: string, cellId: string, updates: Partial<Cell>): Cell | null {
    const notebook = this.getNotebook(notebookId);
    if (!notebook) return null;

    const cellIndex = notebook.cells.findIndex(c => c.id === cellId);
    if (cellIndex === -1) return null;

    notebook.cells[cellIndex] = {
      ...notebook.cells[cellIndex],
      ...updates,
      id: cellId // Preserve ID
    };

    return notebook.cells[cellIndex];
  }

  deleteCell(notebookId: string, cellId: string): boolean {
    const notebook = this.getNotebook(notebookId);
    if (!notebook) return false;

    const cellIndex = notebook.cells.findIndex(c => c.id === cellId);
    if (cellIndex === -1) return false;

    notebook.cells.splice(cellIndex, 1);
    return true;
  }

  async executeCell(
    notebookId: string,
    cellId: string,
    timeoutMs?: number
  ): Promise<Execution> {
    const notebook = this.getNotebook(notebookId);
    if (!notebook) {
      throw new Error('Notebook not found');
    }

    const cell = notebook.cells.find(c => c.id === cellId);
    if (!cell || cell.type !== 'code') {
      throw new Error('Cell not found or not a code cell');
    }

    if (notebook.executions.size >= this.config.maxExecutions!) {
      throw new Error(`Maximum number of executions (${this.config.maxExecutions}) reached`);
    }

    const execution: Execution = {
      id: randomUUID(),
      cellId,
      status: 'running',
      startedAt: Date.now(),
      outputs: []
    };

    notebook.executions.set(execution.id, execution);
    cell.status = 'running';
    cell.outputs = [];

    try {
      const result = await this.runInSandbox(
        cell.source,
        timeoutMs || this.config.defaultTimeoutMs!
      );
      
      execution.outputs = result.outputs;
      execution.status = 'complete';
      execution.completedAt = Date.now();
      
      cell.status = 'idle';
      cell.outputs = result.outputs;
    } catch (error: any) {
      execution.status = 'failed';
      execution.completedAt = Date.now();
      execution.error = error.message;
      
      cell.status = 'failed';
      cell.outputs = [{
        type: 'stderr',
        data: error.message
      }];
    }

    return execution;
  }

  private async runInSandbox(
    code: string,
    timeoutMs: number
  ): Promise<{ outputs: Output[] }> {
    const outputs: Output[] = [];
    let outputSize = 0;
    const maxSize = this.config.maxOutputBytesPerExec!;

    const sandbox = {
      console: {
        log: (...args: any[]) => {
          const text = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          if (outputSize + text.length <= maxSize) {
            outputs.push({ type: 'stdout', data: text });
            outputSize += text.length;
          }
        },
        error: (...args: any[]) => {
          const text = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          if (outputSize + text.length <= maxSize) {
            outputs.push({ type: 'stderr', data: text });
            outputSize += text.length;
          }
        }
      },
      // Limited set of safe globals
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      Promise,
      setTimeout: undefined, // Disable for security
      setInterval: undefined,
      setImmediate: undefined
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const script = new vm.Script(code);
        const context = vm.createContext(sandbox);
        const result = script.runInContext(context, {
          timeout: timeoutMs,
          displayErrors: true
        });

        if (result !== undefined) {
          const resultStr = typeof result === 'object' 
            ? JSON.stringify(result, null, 2) 
            : String(result);
          
          if (outputSize + resultStr.length <= maxSize) {
            outputs.push({ type: 'result', data: resultStr });
          }
        }

        clearTimeout(timer);
        resolve({ outputs });
      } catch (error: any) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  exportToSrcMd(notebookId: string): string | null {
    const notebook = this.getNotebook(notebookId);
    if (!notebook) return null;

    let srcmd = '';
    
    for (const cell of notebook.cells) {
      if (cell.type === 'markdown') {
        srcmd += cell.source + '\n\n';
      } else if (cell.type === 'code') {
        srcmd += `\`\`\`${cell.language || 'javascript'}\n`;
        srcmd += cell.source + '\n';
        srcmd += '```\n';
        
        if (cell.outputs && cell.outputs.length > 0) {
          srcmd += '\n**Output:**\n```\n';
          for (const output of cell.outputs) {
            if (output.type === 'stdout') {
              srcmd += output.data + '\n';
            } else if (output.type === 'stderr') {
              srcmd += `Error: ${output.data}\n`;
            } else if (output.type === 'result') {
              srcmd += `Result: ${output.data}\n`;
            }
          }
          srcmd += '```\n\n';
        }
      }
    }

    return srcmd;
  }

  exportToJson(notebookId: string): object | null {
    const notebook = this.getNotebook(notebookId);
    if (!notebook) return null;

    return {
      id: notebook.id,
      sessionId: notebook.sessionId,
      createdAt: new Date(notebook.createdAt).toISOString(),
      cells: notebook.cells,
      executions: Array.from(notebook.executions.entries()).map(([_id, exec]) => ({
        ...exec
      }))
    };
  }

  deleteNotebook(notebookId: string): boolean {
    return this.notebooks.delete(notebookId);
  }

  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.notebooks.clear();
  }
}