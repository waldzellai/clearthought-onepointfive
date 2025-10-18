# Quick Reference: Vaporware Detection & Structured Journal Conversion

## TL;DR

```bash
# 1. Start conversion workflow
/convert-to-journal

# 2. Edit operation file
# (Automatic validation runs on save)

# 3. If validation fails, fix issues and save again
# (Hook re-runs automatically)

# 4. When validation passes, checkpoint
git add -A && git commit --no-verify -m "checkpoint: converted [operation] to structured journal"
```

## Validation Scoring

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | Excellent | ✅ Ready to commit |
| 70-89 | Good | ✅ Passes validation |
| 50-69 | Needs work | ❌ Fix issues |
| 0-49 | Critical | ❌ Major refactor needed |

## Critical Anti-Patterns (Auto-Fail)

### 1. Placeholder Returns (-20 pts)

```typescript
// ❌ FAIL
return { placeholder: true, message: "Would dispatch..." };

// ✅ PASS
return { 
  content: [{ 
    type: "text", 
    text: JSON.stringify({ entryNumber: 1, nextEntryNeeded: true }) 
  }] 
};
```

### 2. Prompt Echoing (-20 pts)

```typescript
// ❌ FAIL
return { text: `You said: ${input.prompt}. Here's my analysis...` };

// ✅ PASS
return { text: JSON.stringify({ entryNumber: 1, historyLength: 1 }) };
```

### 3. Fake Pattern Selection (-20 pts)

```typescript
// ❌ FAIL
const pattern = selectPattern(input); // Never executes
return { selectedPattern: pattern.name };

// ✅ PASS
// No pattern selection - just structured journaling
```

### 4. Vaporware Claims (-20 pts)

```typescript
// ❌ FAIL
description: "Uses Monte Carlo Tree Search to explore solutions"
// (But actually just stores data)

// ✅ PASS
description: "Structured journaling for systematic exploration"
```

### 5. Missing Implementation (-20 pts)

```typescript
// ❌ FAIL
// TODO: Implement tree search
function search() { /* unimplemented */ }

// ✅ PASS
// Fully implemented validation, storage, logging
```

## Token Efficiency (-15 pts)

```typescript
// ❌ FAIL (200+ tokens)
return { 
  text: `I've analyzed your request and here's what I found. 
         First, I considered the context... Then I evaluated...` 
};

// ✅ PASS (~20 tokens)
return { 
  text: JSON.stringify({ 
    entryNumber: 1, 
    totalEntries: 5, 
    nextEntryNeeded: true 
  }) 
};
```

## Transparency (-10 pts each)

### Silent Storage

```typescript
// ❌ FAIL
this.history.push(entry);

// ✅ PASS
this.history.push(entry);
console.error(this.formatEntry(entry)); // Terminal logging
```

### Weak Validation

```typescript
// ❌ FAIL
if (!input.entry) return { success: false };

// ✅ PASS
if (!input.entry || typeof input.entry !== 'string') {
  throw new Error('Invalid entry: must be a non-empty string');
}
```

## Structured Journal Pattern Checklist

### Required Components

- [ ] **Validation** - Strict type checking with descriptive errors
- [ ] **Storage** - History tracking with branch support
- [ ] **Terminal Logging** - Human-readable output on stderr
- [ ] **Minimal Response** - JSON metadata only, <100 tokens
- [ ] **Tool Description** - Guides AI behavior, not implementation
- [ ] **Auto-adjustment** - `totalEntries = Math.max(entryNumber, totalEntries)`
- [ ] **Error Handling** - Graceful failures with clear messages

### Required Interface

```typescript
interface OperationData {
  entry: string;              // The actual content
  entryNumber: number;        // Current position
  totalEntries: number;       // Estimated total
  nextEntryNeeded: boolean;   // Continuation flag
  
  // Optional
  isRevision?: boolean;
  revisesEntry?: number;
  branchFromEntry?: number;
  branchId?: string;
}
```

### Required Methods

```typescript
class OperationServer {
  private validateData(input: unknown): OperationData;
  private formatEntry(data: OperationData): string;
  public processEntry(input: unknown): OperationResult;
}
```

## Hook Behavior

### Trigger Conditions

- **Event**: PostToolUse
- **Tools**: Write, Edit
- **Path**: `src/tools/operations/*.ts`
- **Timeout**: 120 seconds

### Validation Flow

1. **Static Analysis** (Fast, ~100ms)
   - Regex pattern matching
   - Structural checks
   - Immediate feedback

2. **Claude Agent SDK** (If score < 70, ~10-30s)
   - Semantic analysis
   - Line-specific feedback
   - Detailed issue descriptions

### Exit Codes

- `0` - Validation passed, continue
- `1` - Hook error, continue with warning
- `2` - Validation failed, **block operation**

## Common Issues & Fixes

### Issue: "Found placeholder returns"

**Problem**: Code returns `{ placeholder: true }` or "Would dispatch" messages

**Fix**: Implement actual logic or remove the operation

```typescript
// Before
return { placeholder: true, message: "Would dispatch to tree search" };

// After
this.history.push(validatedInput);
console.error(this.formatEntry(validatedInput));
return { 
  content: [{ 
    type: "text", 
    text: JSON.stringify({ entryNumber: 1, nextEntryNeeded: true }) 
  }] 
};
```

### Issue: "Response size > 100 tokens"

**Problem**: Returning verbose explanations instead of metadata

**Fix**: Return only JSON metadata

```typescript
// Before
return { 
  text: `I've processed your entry. Here's what I found: ${analysis}` 
};

// After
return { 
  text: JSON.stringify({ 
    entryNumber: data.entryNumber,
    totalEntries: data.totalEntries,
    nextEntryNeeded: data.nextEntryNeeded,
    historyLength: this.history.length
  }) 
};
```

### Issue: "No terminal logging found"

**Problem**: Missing `console.error()` for transparency

**Fix**: Add terminal logging

```typescript
// Before
this.history.push(entry);
return { ... };

// After
this.history.push(entry);
console.error(this.formatEntry(entry)); // Add this
return { ... };
```

### Issue: "No validation errors thrown"

**Problem**: Silent failures or weak validation

**Fix**: Add descriptive error throwing

```typescript
// Before
if (!input.entry) return { success: false };

// After
if (!input.entry || typeof input.entry !== 'string') {
  throw new Error('Invalid entry: must be a non-empty string');
}
if (input.entryNumber < 1) {
  throw new Error('Invalid entryNumber: must be >= 1');
}
```

## Testing Your Implementation

### Unit Tests

```bash
# Run unit tests
npm test

# Run specific test file
npm test tests/unit/[operation].test.ts
```

### MCP Integration Tests (MCPJam Evals)

**CRITICAL**: Test the real MCP server-client experience!

```bash
# 1. Build server
npm run build

# 2. Create test config in evals-cli-starter/tests.json
# See docs/MCPJAM_EVALS_TESTING_GUIDE.md

# 3. Run evals
cd evals-cli-starter
mcpjam evals run -t tests.json -e environment.json -l llms.json

# 4. Verify all tests pass
```

### Validation Hook Test

```bash
# 1. Save the file
# 2. Watch terminal for validation output
# 3. If fails, read issues and fix
# 4. Save again (hook re-runs)
```

### Expected Output (Success)

```
🔍 Validating analogical-reasoning.ts for vaporware patterns...

Running static analysis...
Static analysis score: 85/100

✅ Validation passed (score: 85/100)
```

### Expected Output (Failure)

```
🔍 Validating analogical-reasoning.ts for vaporware patterns...

Running static analysis...
Static analysis score: 45/100

❌ Issues found:
  • CRITICAL: Found placeholder returns or 'would dispatch' messages
  • TOKEN EFFICIENCY: Found large string returns (>200 chars)
  • TRANSPARENCY: No terminal logging found

🤖 Running Claude Agent SDK validation...

Claude validation score: 40/100

❌ Claude found additional issues:
  • Line 45: Returns placeholder object instead of executing logic
  • Line 78: Echoes user prompt in response (token waste)
  • Line 102: Missing console.error() for transparency

❌ VALIDATION FAILED (score: 40/100)
Please address the issues above before proceeding.
```

## Reference Files

- **Pattern Guide**: `reports/how-sequentialthinking-actually-works.md`
- **Reference Implementation**: `docs/sequential-thinking-mcp-index.ts`
- **Anti-Patterns**: `reports/analysis-clear-thought-actually-does-nothing.md`
- **Full Guide**: `docs/AGENTIC_WORKFLOW_GUIDE.md`
- **MCPJam Evals Guide**: `docs/MCPJAM_EVALS_TESTING_GUIDE.md`

## Emergency Bypass

If you need to bypass validation temporarily:

```bash
# Disable hook temporarily
mv .claude/settings.json .claude/settings.json.bak

# Make your changes

# Re-enable hook
mv .claude/settings.json.bak .claude/settings.json
```

**⚠️ WARNING**: Only use this for debugging. Always re-enable validation before committing.

## Getting Help

1. Read the full guide: `docs/AGENTIC_WORKFLOW_GUIDE.md`
2. Check reference implementation: `docs/sequential-thinking-mcp-index.ts`
3. Review anti-patterns: `reports/analysis-clear-thought-actually-does-nothing.md`
4. Ask for help with specific line numbers from validation output

