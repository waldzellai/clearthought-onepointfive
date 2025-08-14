/**
 * Ephemeral Notebook Implementation for ClearThought
 *
 * Provides in-memory notebook functionality for reasoning patterns
 * with JavaScript execution and srcmd export capabilities.
 */
import { randomUUID } from 'crypto';
import vm from 'vm';
const DEFAULT_CONFIG = {
    enableTypescript: false,
    defaultTimeoutMs: 5000,
    maxCells: 200,
    maxExecutions: 200,
    maxOutputBytesPerExec: 262144, // 256KB
    idleTtlMs: 30 * 60 * 1000 // 30 minutes
};
export class EphemeralNotebookStore {
    constructor(config = {}) {
        this.notebooks = new Map();
        this.cleanupInterval = null;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startCleanupInterval();
    }
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            const ttl = this.config.idleTtlMs;
            for (const [id, notebook] of this.notebooks.entries()) {
                if (now - notebook.lastAccessedAt > ttl) {
                    this.notebooks.delete(id);
                }
            }
        }, 60000); // Check every minute
    }
    createNotebook(sessionId) {
        const existingNotebook = this.getNotebookBySession(sessionId);
        if (existingNotebook) {
            return existingNotebook;
        }
        const notebook = {
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
    getNotebook(notebookId) {
        const notebook = this.notebooks.get(notebookId);
        if (notebook) {
            notebook.lastAccessedAt = Date.now();
        }
        return notebook;
    }
    getNotebookBySession(sessionId) {
        for (const notebook of this.notebooks.values()) {
            if (notebook.sessionId === sessionId) {
                notebook.lastAccessedAt = Date.now();
                return notebook;
            }
        }
        return undefined;
    }
    addCell(notebookId, type, source, language, index) {
        const notebook = this.getNotebook(notebookId);
        if (!notebook)
            return null;
        if (notebook.cells.length >= this.config.maxCells) {
            throw new Error(`Maximum number of cells (${this.config.maxCells}) reached`);
        }
        const cell = {
            id: randomUUID(),
            type,
            source,
            language: type === 'code' ? (language || 'javascript') : undefined,
            status: type === 'code' ? 'idle' : undefined,
            outputs: type === 'code' ? [] : undefined
        };
        if (index !== undefined && index >= 0 && index <= notebook.cells.length) {
            notebook.cells.splice(index, 0, cell);
        }
        else {
            notebook.cells.push(cell);
        }
        return cell;
    }
    updateCell(notebookId, cellId, updates) {
        const notebook = this.getNotebook(notebookId);
        if (!notebook)
            return null;
        const cellIndex = notebook.cells.findIndex(c => c.id === cellId);
        if (cellIndex === -1)
            return null;
        notebook.cells[cellIndex] = {
            ...notebook.cells[cellIndex],
            ...updates,
            id: cellId // Preserve ID
        };
        return notebook.cells[cellIndex];
    }
    deleteCell(notebookId, cellId) {
        const notebook = this.getNotebook(notebookId);
        if (!notebook)
            return false;
        const cellIndex = notebook.cells.findIndex(c => c.id === cellId);
        if (cellIndex === -1)
            return false;
        notebook.cells.splice(cellIndex, 1);
        return true;
    }
    async executeCell(notebookId, cellId, timeoutMs) {
        const notebook = this.getNotebook(notebookId);
        if (!notebook) {
            throw new Error('Notebook not found');
        }
        const cell = notebook.cells.find(c => c.id === cellId);
        if (!cell || cell.type !== 'code') {
            throw new Error('Cell not found or not a code cell');
        }
        if (notebook.executions.size >= this.config.maxExecutions) {
            throw new Error(`Maximum number of executions (${this.config.maxExecutions}) reached`);
        }
        const execution = {
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
            const result = await this.runInSandbox(cell.source, timeoutMs || this.config.defaultTimeoutMs);
            execution.outputs = result.outputs;
            execution.status = 'complete';
            execution.completedAt = Date.now();
            cell.status = 'idle';
            cell.outputs = result.outputs;
        }
        catch (error) {
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
    async runInSandbox(code, timeoutMs) {
        const outputs = [];
        let outputSize = 0;
        const maxSize = this.config.maxOutputBytesPerExec;
        const sandbox = {
            console: {
                log: (...args) => {
                    const text = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
                    if (outputSize + text.length <= maxSize) {
                        outputs.push({ type: 'stdout', data: text });
                        outputSize += text.length;
                    }
                },
                error: (...args) => {
                    const text = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
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
            }
            catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }
    exportToSrcMd(notebookId) {
        const notebook = this.getNotebook(notebookId);
        if (!notebook)
            return null;
        let srcmd = '';
        for (const cell of notebook.cells) {
            if (cell.type === 'markdown') {
                srcmd += cell.source + '\n\n';
            }
            else if (cell.type === 'code') {
                srcmd += `\`\`\`${cell.language || 'javascript'}\n`;
                srcmd += cell.source + '\n';
                srcmd += '```\n';
                if (cell.outputs && cell.outputs.length > 0) {
                    srcmd += '\n**Output:**\n```\n';
                    for (const output of cell.outputs) {
                        if (output.type === 'stdout') {
                            srcmd += output.data + '\n';
                        }
                        else if (output.type === 'stderr') {
                            srcmd += `Error: ${output.data}\n`;
                        }
                        else if (output.type === 'result') {
                            srcmd += `Result: ${output.data}\n`;
                        }
                    }
                    srcmd += '```\n\n';
                }
            }
        }
        return srcmd;
    }
    exportToJson(notebookId) {
        const notebook = this.getNotebook(notebookId);
        if (!notebook)
            return null;
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
    deleteNotebook(notebookId) {
        return this.notebooks.delete(notebookId);
    }
    cleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.notebooks.clear();
    }
}
