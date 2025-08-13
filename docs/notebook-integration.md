# Notebook Integration for ClearThought

## Overview

ClearThought now includes ephemeral notebook support for advanced reasoning patterns. When you use patterns like `tree_of_thought`, `beam_search`, `mcts`, `graph_of_thought`, or `orchestration_suggest`, an interactive JavaScript notebook is automatically created in memory to help visualize and experiment with the reasoning process.

## Features

- **Automatic Notebook Creation**: Notebooks are automatically created when using supported reasoning patterns
- **JavaScript Execution**: Run JavaScript code in a secure VM sandbox
- **Markdown Support**: Mix documentation with executable code
- **Pattern Presets**: Each reasoning pattern comes with a pre-configured notebook template
- **Export Capabilities**: Export notebooks to srcbook markdown format or JSON
- **Session-Based Lifecycle**: Notebooks are tied to sessions and auto-cleanup after 30 minutes of inactivity

## Supported Operations

### Reasoning Patterns with Notebooks

When you call these operations, a notebook is automatically created with relevant presets:

- `tree_of_thought` - Systematic exploration with branching paths
- `beam_search` - Parallel exploration with periodic pruning
- `mcts` - Monte Carlo Tree Search with UCB1 selection
- `graph_of_thought` - Non-hierarchical thought connections
- `orchestration_suggest` - Task decomposition and tool suggestions

### Notebook Operations

You can also directly manage notebooks:

#### notebook_create
Creates a new notebook for the current session.

```json
{
  "operation": "notebook_create",
  "prompt": "Create a notebook for algorithm exploration",
  "parameters": {
    "pattern": "tree_of_thought"  // Optional: loads preset for this pattern
  }
}
```

#### notebook_add_cell
Adds a cell to an existing notebook.

```json
{
  "operation": "notebook_add_cell",
  "prompt": "Add implementation code",
  "parameters": {
    "notebookId": "notebook-id",
    "cellType": "code",  // or "markdown"
    "source": "console.log('Hello, notebook!');",
    "language": "javascript",
    "index": 0  // Optional: position to insert
  }
}
```

#### notebook_run_cell
Executes a code cell in the notebook.

```json
{
  "operation": "notebook_run_cell",
  "prompt": "Run the algorithm implementation",
  "parameters": {
    "notebookId": "notebook-id",
    "cellId": "cell-id",
    "timeoutMs": 5000  // Optional: execution timeout
  }
}
```

#### notebook_export
Exports the notebook contents.

```json
{
  "operation": "notebook_export",
  "prompt": "Export notebook to markdown",
  "parameters": {
    "notebookId": "notebook-id",
    "format": "srcmd"  // or "json"
  }
}
```

## Example Usage

### Using Tree of Thought with Notebook

```typescript
// Call tree_of_thought - notebook is created automatically
const result = await mcp.callTool("clear_thought", {
  operation: "tree_of_thought",
  prompt: "Design a distributed caching system",
  parameters: {
    depth: 3,
    breadth: 2
  }
});

// The response includes a notebookId
const notebookId = result.notebookId;

// Add custom analysis code
await mcp.callTool("clear_thought", {
  operation: "notebook_add_cell",
  prompt: "Add cache analysis",
  parameters: {
    notebookId,
    cellType: "code",
    source: `
      // Analyze cache hit ratio
      const hits = 850;
      const misses = 150;
      const hitRatio = hits / (hits + misses);
      console.log(\`Hit ratio: \${(hitRatio * 100).toFixed(2)}%\`);
    `
  }
});

// Run the analysis
await mcp.callTool("clear_thought", {
  operation: "notebook_run_cell",
  prompt: "Execute analysis",
  parameters: {
    notebookId,
    cellId: "cell-id-from-previous-response"
  }
});

// Export results
const exported = await mcp.callTool("clear_thought", {
  operation: "notebook_export",
  prompt: "Export notebook",
  parameters: {
    notebookId,
    format: "srcmd"
  }
});
```

## Preset Examples

Each reasoning pattern includes a comprehensive preset with:

### Tree of Thought
- TreeNode class implementation
- Recursive exploration logic
- Path evaluation and selection
- Mermaid diagram visualization

### Beam Search
- BeamSearchPath class
- Candidate generation and scoring
- Iterative pruning logic
- Progress logging

### MCTS
- MCTSNode with UCB1 selection
- Four-phase algorithm (Selection, Expansion, Simulation, Backpropagation)
- Visit count and value tracking
- Statistics display

### Graph of Thought
- GraphNode and GraphEdge classes
- Path finding algorithms
- Centrality analysis
- Relationship visualization

### Orchestration Suggest
- TaskOrchestrator class
- Task decomposition
- Tool suggestion logic
- Dependency management
- Topological sorting for execution order

## Security

- **VM Sandbox**: All code execution happens in a restricted VM context
- **Limited Globals**: Only safe JavaScript globals are available (no fs, network, etc.)
- **Timeout Protection**: Execution automatically terminates after timeout
- **Memory Limits**: Output size and cell count limits prevent resource exhaustion
- **No Persistence**: Notebooks exist only in memory during the session

## Configuration

Default configuration can be adjusted when initializing the notebook store:

```typescript
const notebookStore = new EphemeralNotebookStore({
  enableTypescript: false,      // TypeScript support (future)
  defaultTimeoutMs: 5000,        // Default execution timeout
  maxCells: 200,                 // Maximum cells per notebook
  maxExecutions: 200,             // Maximum execution history
  maxOutputBytesPerExec: 262144, // 256KB output limit
  idleTtlMs: 1800000             // 30 minutes idle timeout
});
```

## Limitations

- **JavaScript Only**: Currently only JavaScript execution is supported
- **No External Dependencies**: Cannot import npm packages or external modules
- **Session-Based**: Notebooks are lost when the session ends
- **Memory Only**: No persistent storage (by design for security)
- **Output Limits**: Large outputs are truncated to prevent memory issues

## Future Enhancements

- TypeScript support with type checking
- Python execution integration
- Collaborative notebook sharing
- Visual output rendering (charts, graphs)
- Import/export from actual srcbook files
- Persistent storage options