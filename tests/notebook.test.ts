import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EphemeralNotebookStore } from '../src/notebook/EphemeralNotebook.js';
import { getPresetForPattern, NOTEBOOK_PRESETS } from '../src/notebook/presets.js';

describe('EphemeralNotebook', () => {
  let store: EphemeralNotebookStore;
  
  beforeEach(() => {
    store = new EphemeralNotebookStore({
      defaultTimeoutMs: 1000,
      maxCells: 10
    });
  });
  
  afterEach(() => {
    store.cleanup();
  });
  
  describe('Notebook Management', () => {
    it('should create a notebook for a session', () => {
      const notebook = store.createNotebook('test-session');
      expect(notebook).toBeDefined();
      expect(notebook.sessionId).toBe('test-session');
      expect(notebook.cells).toHaveLength(0);
    });
    
    it('should return existing notebook for same session', () => {
      const notebook1 = store.createNotebook('test-session');
      const notebook2 = store.createNotebook('test-session');
      expect(notebook1.id).toBe(notebook2.id);
    });
    
    it('should retrieve notebook by ID', () => {
      const notebook = store.createNotebook('test-session');
      const retrieved = store.getNotebook(notebook.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(notebook.id);
    });
    
    it('should delete a notebook', () => {
      const notebook = store.createNotebook('test-session');
      const deleted = store.deleteNotebook(notebook.id);
      expect(deleted).toBe(true);
      expect(store.getNotebook(notebook.id)).toBeUndefined();
    });
  });
  
  describe('Cell Operations', () => {
    it('should add a markdown cell', () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'markdown', '# Test Heading');
      
      expect(cell).toBeDefined();
      expect(cell?.type).toBe('markdown');
      expect(cell?.source).toBe('# Test Heading');
    });
    
    it('should add a code cell', () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'console.log("test");', 'javascript');
      
      expect(cell).toBeDefined();
      expect(cell?.type).toBe('code');
      expect(cell?.language).toBe('javascript');
      expect(cell?.status).toBe('idle');
    });
    
    it('should update a cell', () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'console.log("old");');
      
      const updated = store.updateCell(notebook.id, cell!.id, {
        source: 'console.log("new");'
      });
      
      expect(updated?.source).toBe('console.log("new");');
    });
    
    it('should delete a cell', () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'console.log("test");');
      
      const deleted = store.deleteCell(notebook.id, cell!.id);
      expect(deleted).toBe(true);
      
      const updatedNotebook = store.getNotebook(notebook.id);
      expect(updatedNotebook?.cells).toHaveLength(0);
    });
    
    it('should respect max cells limit', () => {
      const notebook = store.createNotebook('test-session');
      
      // Add cells up to the limit
      for (let i = 0; i < 10; i++) {
        store.addCell(notebook.id, 'code', `console.log(${i});`);
      }
      
      // Should throw when exceeding limit
      expect(() => {
        store.addCell(notebook.id, 'code', 'console.log("overflow");');
      }).toThrow('Maximum number of cells');
    });
  });
  
  describe('Code Execution', () => {
    it('should execute simple JavaScript code', async () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'console.log("Hello, World!");');
      
      const execution = await store.executeCell(notebook.id, cell!.id);
      
      expect(execution.status).toBe('complete');
      expect(execution.outputs).toHaveLength(1);
      expect(execution.outputs[0].type).toBe('stdout');
      expect(execution.outputs[0].data).toBe('Hello, World!');
    });
    
    it('should capture return values', async () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', '2 + 2');
      
      const execution = await store.executeCell(notebook.id, cell!.id);
      
      expect(execution.status).toBe('complete');
      expect(execution.outputs).toContainEqual({
        type: 'result',
        data: '4'
      });
    });
    
    it('should handle errors gracefully', async () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'throw new Error("Test error");');
      
      const execution = await store.executeCell(notebook.id, cell!.id);
      
      expect(execution.status).toBe('failed');
      expect(execution.error).toContain('Test error');
    });
    
    it('should respect timeout', async () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'while(true) {}');
      
      const execution = await store.executeCell(notebook.id, cell!.id, 100);
      
      expect(execution.status).toBe('failed');
      expect(execution.error).toContain('timed out');
    });
    
    it('should handle console.error', async () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'console.error("Error message");');
      
      const execution = await store.executeCell(notebook.id, cell!.id);
      
      expect(execution.outputs).toContainEqual({
        type: 'stderr',
        data: 'Error message'
      });
    });
  });
  
  describe('Export Functionality', () => {
    it('should export to srcmd format', () => {
      const notebook = store.createNotebook('test-session');
      store.addCell(notebook.id, 'markdown', '# Test Notebook');
      store.addCell(notebook.id, 'code', 'const x = 42;');
      
      const srcmd = store.exportToSrcMd(notebook.id);
      
      expect(srcmd).toContain('# Test Notebook');
      expect(srcmd).toContain('```javascript');
      expect(srcmd).toContain('const x = 42;');
    });
    
    it('should export to JSON format', () => {
      const notebook = store.createNotebook('test-session');
      store.addCell(notebook.id, 'markdown', '# Test');
      
      const json = store.exportToJson(notebook.id);
      
      expect(json).toBeDefined();
      expect((json as any).sessionId).toBe('test-session');
      expect((json as any).cells).toHaveLength(1);
    });
    
    it('should include outputs in srcmd export', async () => {
      const notebook = store.createNotebook('test-session');
      const cell = store.addCell(notebook.id, 'code', 'console.log("Output test");');
      
      await store.executeCell(notebook.id, cell!.id);
      
      const srcmd = store.exportToSrcMd(notebook.id);
      
      expect(srcmd).toContain('**Output:**');
      expect(srcmd).toContain('Output test');
    });
  });
});

describe('Notebook Presets', () => {
  it('should have presets for all supported patterns', () => {
    const patterns = ['tree_of_thought', 'beam_search', 'mcts', 'graph_of_thought', 'orchestration_suggest'];
    
    for (const pattern of patterns) {
      const preset = getPresetForPattern(pattern);
      expect(preset).toBeDefined();
      expect(preset?.cells.length).toBeGreaterThan(0);
    }
  });
  
  it('should return undefined for unknown pattern', () => {
    const preset = getPresetForPattern('unknown_pattern');
    expect(preset).toBeUndefined();
  });
  
  it('tree_of_thought preset should have TreeNode implementation', () => {
    const preset = NOTEBOOK_PRESETS.tree_of_thought;
    const codeCell = preset.cells.find(c => c.type === 'code');
    
    expect(codeCell?.source).toContain('class TreeNode');
    expect(codeCell?.source).toContain('class TreeOfThought');
  });
  
  it('beam_search preset should have BeamSearchPath implementation', () => {
    const preset = NOTEBOOK_PRESETS.beam_search;
    const codeCell = preset.cells.find(c => c.type === 'code');
    
    expect(codeCell?.source).toContain('class BeamSearchPath');
    expect(codeCell?.source).toContain('class BeamSearch');
  });
  
  it('mcts preset should have MCTSNode implementation', () => {
    const preset = NOTEBOOK_PRESETS.mcts;
    const codeCell = preset.cells.find(c => c.type === 'code');
    
    expect(codeCell?.source).toContain('class MCTSNode');
    expect(codeCell?.source).toContain('ucb1');
    expect(codeCell?.source).toContain('backpropagate');
  });
  
  it('graph_of_thought preset should have GraphNode implementation', () => {
    const preset = NOTEBOOK_PRESETS.graph_of_thought;
    const codeCell = preset.cells.find(c => c.type === 'code');
    
    expect(codeCell?.source).toContain('class GraphNode');
    expect(codeCell?.source).toContain('class GraphEdge');
    expect(codeCell?.source).toContain('class GraphOfThought');
  });
  
  it('orchestration_suggest preset should have TaskOrchestrator', () => {
    const preset = NOTEBOOK_PRESETS.orchestration_suggest;
    const codeCell = preset.cells.find(c => c.type === 'code');
    
    expect(codeCell?.source).toContain('class TaskOrchestrator');
    expect(codeCell?.source).toContain('decomposeTask');
    expect(codeCell?.source).toContain('suggestTools');
  });
});