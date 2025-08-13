# Notebook Resources Specification for MCP

## Overview

This specification defines how ephemeral notebooks in ClearThought are exposed as MCP (Model Context Protocol) resources. Notebooks can be discovered, listed, and read through standard MCP resource operations, making them accessible to any MCP-compatible client.

## URI Scheme

We use a custom URI scheme for notebook resources:

```
notebook://[session-id]/[notebook-id]/[format]
```

### URI Components

- **scheme**: `notebook://` - Custom scheme for notebook resources
- **session-id**: The session identifier that owns the notebook
- **notebook-id**: Unique identifier for the specific notebook
- **format**: Optional format specifier (`srcmd`, `json`, `cells`, or omitted for default)

### URI Examples

```
notebook://session-123/nb-456          # Default notebook view (srcmd)
notebook://session-123/nb-456/srcmd    # Srcbook markdown format
notebook://session-123/nb-456/json     # JSON representation
notebook://session-123/nb-456/cells    # Individual cells as sub-resources
notebook://current                     # Current session's notebook
```

## Resource Types

### 1. Notebook List Resource

**URI**: `notebook://list`

**Response**:
```json
{
  "uri": "notebook://list",
  "name": "Active Notebooks",
  "description": "List of all active notebooks in the system",
  "mimeType": "application/json",
  "contents": [
    {
      "type": "text",
      "text": "[{\"id\": \"nb-123\", \"sessionId\": \"session-456\", \"cellCount\": 5, \"pattern\": \"tree_of_thought\"}]"
    }
  ]
}
```

### 2. Individual Notebook Resource

**URI**: `notebook://[session-id]/[notebook-id]`

**Response**:
```json
{
  "uri": "notebook://session-123/nb-456",
  "name": "Tree of Thought Notebook",
  "description": "Ephemeral notebook for tree_of_thought reasoning pattern",
  "mimeType": "text/markdown",
  "metadata": {
    "sessionId": "session-123",
    "notebookId": "nb-456",
    "pattern": "tree_of_thought",
    "cellCount": 8,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastModified": "2024-01-15T10:45:00Z"
  },
  "contents": [
    {
      "type": "text",
      "text": "# Tree of Thought Reasoning\n\n## Problem Statement\n..."
    }
  ]
}
```

### 3. Notebook Cells Resource

**URI**: `notebook://[session-id]/[notebook-id]/cells`

**Response**:
```json
{
  "uri": "notebook://session-123/nb-456/cells",
  "name": "Notebook Cells",
  "description": "Individual cells from the notebook",
  "mimeType": "application/json",
  "contents": [
    {
      "type": "text",
      "text": "[{\"id\": \"cell-1\", \"type\": \"markdown\", \"source\": \"# Title\"}, ...]"
    }
  ]
}
```

### 4. Single Cell Resource

**URI**: `notebook://[session-id]/[notebook-id]/cells/[cell-id]`

**Response**:
```json
{
  "uri": "notebook://session-123/nb-456/cells/cell-789",
  "name": "Cell: TreeNode Implementation",
  "description": "Code cell containing TreeNode class",
  "mimeType": "application/javascript",
  "metadata": {
    "cellId": "cell-789",
    "cellType": "code",
    "language": "javascript",
    "filename": "tree-node.js",
    "status": "idle",
    "hasOutputs": true
  },
  "contents": [
    {
      "type": "text",
      "text": "class TreeNode {\n  constructor(state, thought, value = null) {\n    ...\n  }\n}"
    }
  ]
}
```

## Implementation

### Resource Registration

```typescript
// In the MCP server setup
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const notebooks = notebookStore.getAllNotebooks();
  const resources = [];
  
  // Add list resource
  resources.push({
    uri: 'notebook://list',
    name: 'Active Notebooks',
    description: `${notebooks.length} active notebooks`,
    mimeType: 'application/json'
  });
  
  // Add individual notebook resources
  for (const notebook of notebooks) {
    const pattern = notebook.metadata?.pattern || 'generic';
    resources.push({
      uri: `notebook://${notebook.sessionId}/${notebook.id}`,
      name: `${pattern} Notebook`,
      description: `Notebook for session ${notebook.sessionId}`,
      mimeType: 'text/markdown'
    });
    
    // Add cells collection resource
    resources.push({
      uri: `notebook://${notebook.sessionId}/${notebook.id}/cells`,
      name: `${pattern} Notebook Cells`,
      description: `${notebook.cells.length} cells`,
      mimeType: 'application/json'
    });
  }
  
  return { resources };
});
```

### Resource Reading

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (!uri.startsWith('notebook://')) {
    throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${uri}`);
  }
  
  const parts = uri.slice('notebook://'.length).split('/');
  
  // Handle notebook://list
  if (parts[0] === 'list') {
    const notebooks = notebookStore.getAllNotebooks();
    const summary = notebooks.map(nb => ({
      id: nb.id,
      sessionId: nb.sessionId,
      cellCount: nb.cells.length,
      pattern: nb.metadata?.pattern,
      createdAt: new Date(nb.createdAt).toISOString()
    }));
    
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify(summary, null, 2)
      }]
    };
  }
  
  // Handle notebook://current (current session's notebook)
  if (parts[0] === 'current') {
    const notebook = notebookStore.getNotebookBySession(sessionState.sessionId);
    if (!notebook) {
      throw new McpError(ErrorCode.InvalidParams, 'No notebook for current session');
    }
    
    const srcmd = notebookStore.exportToSrcMd(notebook.id);
    return {
      contents: [{
        type: 'text',
        text: srcmd || 'Empty notebook'
      }]
    };
  }
  
  // Handle notebook://[session-id]/[notebook-id]/[format]
  const [sessionId, notebookId, ...subpath] = parts;
  const notebook = notebookStore.getNotebook(notebookId);
  
  if (!notebook || notebook.sessionId !== sessionId) {
    throw new McpError(ErrorCode.InvalidParams, 'Notebook not found');
  }
  
  // Handle different formats/subpaths
  if (subpath.length === 0 || subpath[0] === 'srcmd') {
    // Return srcbook markdown
    const srcmd = notebookStore.exportToSrcMd(notebookId);
    return {
      contents: [{
        type: 'text',
        text: srcmd || 'Empty notebook'
      }]
    };
  }
  
  if (subpath[0] === 'json') {
    // Return JSON representation
    const json = notebookStore.exportToJson(notebookId);
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify(json, null, 2)
      }]
    };
  }
  
  if (subpath[0] === 'cells') {
    if (subpath[1]) {
      // Return specific cell
      const cell = notebook.cells.find(c => c.id === subpath[1]);
      if (!cell) {
        throw new McpError(ErrorCode.InvalidParams, 'Cell not found');
      }
      return {
        contents: [{
          type: 'text',
          text: cell.source
        }]
      };
    }
    
    // Return all cells
    return {
      contents: [{
        type: 'text',
        text: JSON.stringify(notebook.cells, null, 2)
      }]
    };
  }
  
  throw new McpError(ErrorCode.InvalidParams, `Unknown format: ${subpath[0]}`);
});
```

## Resource Discovery

Clients can discover available notebooks through:

1. **List all resources** - Standard MCP `resources/list` request
2. **Filter by URI pattern** - Look for `notebook://` scheme
3. **Read notebook list** - Access `notebook://list` for summary

## Use Cases

### 1. Notebook Inspection
```typescript
// Client code
const resources = await mcp.listResources();
const notebooks = resources.filter(r => r.uri.startsWith('notebook://'));

for (const notebook of notebooks) {
  const content = await mcp.readResource(notebook.uri);
  console.log(`Notebook ${notebook.name}:`, content);
}
```

### 2. Export Current Session's Notebook
```typescript
const currentNotebook = await mcp.readResource('notebook://current');
fs.writeFileSync('session-notebook.src.md', currentNotebook.contents[0].text);
```

### 3. Access Specific Cell
```typescript
const cellContent = await mcp.readResource(
  'notebook://session-123/nb-456/cells/cell-789'
);
console.log('Cell source:', cellContent.contents[0].text);
```

### 4. Monitor Notebook Changes
Clients can periodically check the notebook list or specific notebook resources to detect changes:

```typescript
// Poll for changes
setInterval(async () => {
  const list = await mcp.readResource('notebook://list');
  const notebooks = JSON.parse(list.contents[0].text);
  console.log(`Active notebooks: ${notebooks.length}`);
}, 5000);
```

## Security Considerations

1. **Session Isolation**: Notebooks are tied to sessions; URIs include session IDs to prevent cross-session access
2. **Read-Only Access**: Resources are read-only through the MCP protocol
3. **No Execution**: Reading notebook resources doesn't trigger cell execution
4. **Ephemeral Nature**: Resources disappear when notebooks are cleaned up after session timeout
5. **Content Sanitization**: Cell outputs are sanitized before being exposed as resources

## Future Enhancements

### 1. Resource Subscriptions
Support MCP resource change notifications when notebooks are modified:
```typescript
{
  "method": "notifications/resources/list_changed"
}
```

### 2. Virtual Filesystem URIs
Use standard `file://` scheme for exported notebooks:
```
file:///notebooks/session-123/notebook.src.md
file:///notebooks/session-123/cells/cell-1.js
```

### 3. Resource Templates
Provide template resources for creating new notebooks:
```
notebook://templates/tree_of_thought
notebook://templates/beam_search
notebook://templates/mcts
```

### 4. Execution Results as Resources
Expose execution results as separate resources:
```
notebook://session-123/nb-456/executions/exec-789
```

## Metadata Schema

Resources can include standardized metadata:

```typescript
interface NotebookResourceMetadata {
  sessionId: string;
  notebookId: string;
  pattern?: string;
  cellCount: number;
  createdAt: string;
  lastModified: string;
  lastExecuted?: string;
  totalExecutions?: number;
  hasErrors?: boolean;
}
```

## Error Handling

Standard MCP error codes apply:

- `InvalidParams` - Invalid URI format or notebook not found
- `InternalError` - Server error accessing notebook store
- `MethodNotFound` - Unsupported resource operation

## Conclusion

By exposing notebooks as MCP resources, we enable:
- Discovery of active notebooks
- Inspection of notebook contents
- Export to various formats
- Integration with MCP-compatible tools
- Monitoring and debugging capabilities

This approach maintains the ephemeral, session-based nature of notebooks while providing standard MCP access patterns.