# Notebook Enhancement Proposals

Based on analysis of srcbook implementations, here are proposed enhancements for the ClearThought notebook integration.

## Priority 1: High-Value, Low-Risk Features

### 1. Named Cells with Filenames
**Current State**: Cells have auto-generated IDs
**Proposed Enhancement**: Add optional `filename` field to cells
```typescript
interface Cell {
  id: string;
  filename?: string; // e.g., "helper-functions.js"
  // ... existing fields
}
```
**Benefits**:
- Better organization and readability
- Easier cell referencing
- Export to actual file structure

### 2. Cell Import/Export System
**Current State**: Cells execute in isolation
**Proposed Enhancement**: Shared execution context with module-like exports
```javascript
// Cell 1: math-utils.js
export const sum = (a, b) => a + b;

// Cell 2: calculator.js
import { sum } from './math-utils.js';
console.log(sum(2, 3)); // 5
```
**Implementation**:
- Maintain a shared context object across cell executions
- Parse exports and make them available to other cells
- Use VM context sharing for imports

### 3. Package.json Cell Type
**Current State**: No dependency management
**Proposed Enhancement**: Special cell type for dependencies
```typescript
interface PackageJsonCell extends Cell {
  type: 'package.json';
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
```
**Benefits**:
- Clear dependency declaration
- Version management
- Export compatibility with npm projects

## Priority 2: Medium-Value Features

### 4. TypeScript Support
**Current State**: JavaScript only
**Proposed Enhancement**: Add TypeScript compilation
- Use TypeScript compiler API for type checking
- Support `.ts` extensions on cells
- Provide type hints and IntelliSense data

### 5. Environment Variables
**Current State**: No environment variable support
**Proposed Enhancement**: Controlled environment variable access
```typescript
interface NotebookConfig {
  // ... existing config
  allowedEnvVars?: string[]; // Whitelist specific env vars
}
```
**Security**: Only allow explicitly whitelisted environment variables

### 6. Persistent Outputs
**Current State**: Outputs cleared on re-execution
**Proposed Enhancement**: Maintain output history
```typescript
interface Cell {
  // ... existing fields
  outputHistory?: Output[][]; // Keep last N execution outputs
}
```

## Priority 3: Advanced Features (Future Consideration)

### 7. Long-Running Process Support
**Current State**: Synchronous execution with timeout
**Proposed Enhancement**: Background process management
- Support for WebSocket servers
- Process lifecycle management
- Inter-process communication

### 8. External HTTP Requests
**Current State**: No network access
**Proposed Enhancement**: Controlled HTTP client
- Whitelist allowed domains
- Rate limiting
- Request/response logging

### 9. Multi-Language Support
**Current State**: JavaScript only
**Proposed Enhancement**: Python, SQL, etc.
- Language-specific execution engines
- Cross-language data sharing
- Polyglot notebooks

## Implementation Roadmap

### Phase 1 (Immediate)
- [ ] Named cells with filenames
- [ ] Cell import/export system
- [ ] Package.json cell type

### Phase 2 (Near-term)
- [ ] TypeScript support
- [ ] Environment variables (whitelisted)
- [ ] Output history

### Phase 3 (Long-term)
- [ ] Long-running processes
- [ ] External HTTP (with restrictions)
- [ ] Multi-language support

## Security Considerations

All enhancements must maintain security:
1. **No filesystem access** - All operations remain in-memory
2. **No unrestricted network** - Whitelist-only approach
3. **No arbitrary code execution** - VM sandbox remains
4. **No credential exposure** - Secrets handled securely
5. **Resource limits** - CPU, memory, and time bounds

## Migration Path

These enhancements would be backward compatible:
1. Existing notebooks continue to work
2. New features are opt-in via configuration
3. Export formats support both old and new structures

## Testing Strategy

Each enhancement requires:
1. Unit tests for new functionality
2. Integration tests with existing features
3. Security audit for attack vectors
4. Performance benchmarks
5. Documentation updates

## Example Enhanced Notebook

```typescript
// Create notebook with enhanced features
const notebook = notebookStore.createNotebook(sessionId, {
  enableImports: true,
  enableTypeScript: true,
  allowedEnvVars: ['API_KEY', 'DEBUG_MODE']
});

// Add package.json cell
notebookStore.addCell(notebook.id, 'package.json', JSON.stringify({
  dependencies: {
    'lodash': '^4.17.21'
  }
}));

// Add TypeScript cell with filename
notebookStore.addCell(notebook.id, 'code', `
  export interface User {
    name: string;
    age: number;
  }
  
  export const createUser = (name: string, age: number): User => ({
    name, age
  });
`, 'typescript', 0, { filename: 'user-model.ts' });

// Add cell that imports from previous
notebookStore.addCell(notebook.id, 'code', `
  import { createUser } from './user-model.ts';
  
  const user = createUser('Alice', 30);
  console.log(user);
`, 'typescript', 1, { filename: 'main.ts' });
```

## Conclusion

These enhancements would bring ClearThought's notebook functionality closer to full srcbook parity while maintaining security and simplicity. The phased approach allows incremental improvement based on user needs and feedback.