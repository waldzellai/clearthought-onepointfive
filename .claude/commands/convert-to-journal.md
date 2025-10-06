---
description: Convert a Clear-Thought operation to use structured journal pattern
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: claude-sonnet-4-5-20250929
---

# Convert Operation to Structured Journal Pattern

You are converting a Clear-Thought MCP operation to use the **structured journal** implementation pattern from the Sequential Thinking MCP server.

## Reference Documents

**CRITICAL**: Before starting, read these documents in full:

1. `@reports/how-sequentialthinking-actually-works.md` - Complete technical analysis of the structured journal pattern
2. `@docs/sequential-thinking-mcp-index.ts` - Reference implementation
3. `@reports/analysis-clear-thought-actually-does-nothing.md` - Anti-patterns to avoid

## Core Principles

The structured journal pattern is **NOT** an AI reasoning engine. It is:

✅ **Structured journaling interface** that enforces methodical thinking through parameter discipline
✅ **Validation + Storage + Logging + Metadata** - no computational reasoning
✅ **Tool description is the implementation** - guides AI client behavior
✅ **Minimal response** - return only metadata, never echo prompts
✅ **Terminal logging** - human-readable progress on stderr
✅ **Type validation** - strict parameter checking with descriptive errors

❌ **NOT** computational reasoning or algorithmic search
❌ **NOT** generating thoughts or making decisions
❌ **NOT** analyzing quality or providing insights

## Conversion Workflow

### Phase 1: Analysis & Planning

1. **Read the target operation file** in `src/tools/operations/`
2. **Identify current implementation**:
   - What parameters does it accept?
   - What does it claim to do vs. what it actually does?
   - Are there placeholder returns or "would dispatch" messages?
   - Does it echo the prompt back?
3. **Map to journal pattern**:
   - What are the "journal entries" for this operation?
   - What metadata tracks progress?
   - What validation is needed?
   - What terminal output would be helpful?

### Phase 2: Define the Interface

Create the operation's **structured journal schema**:

```typescript
interface [OperationName]Data {
  // Required fields that structure the thinking
  entry: string;              // The actual content (like "thought" in sequential thinking)
  entryNumber: number;        // Progress tracking
  totalEntries: number;       // Estimated total
  nextEntryNeeded: boolean;   // Continuation flag
  
  // Optional fields for operation-specific features
  isRevision?: boolean;
  revisesEntry?: number;
  branchFromEntry?: number;
  branchId?: string;
  
  // Operation-specific metadata
  [operationSpecificField]?: any;
}
```

### Phase 3: Implement Validation

```typescript
private validateData(input: unknown): [OperationName]Data {
  const data = input as Record<string, unknown>;
  
  // Strict type checking with descriptive errors
  if (!data.entry || typeof data.entry !== 'string') {
    throw new Error('Invalid entry: must be a string');
  }
  if (!data.entryNumber || typeof data.entryNumber !== 'number') {
    throw new Error('Invalid entryNumber: must be a number');
  }
  // ... validate all required fields
  
  return {
    entry: data.entry,
    entryNumber: data.entryNumber,
    totalEntries: data.totalEntries,
    nextEntryNeeded: data.nextEntryNeeded,
    // ... map all fields
  };
}
```

### Phase 4: Implement Storage

```typescript
private entryHistory: [OperationName]Data[] = [];
private branches: Record<string, [OperationName]Data[]> = {};

public processEntry(input: unknown): OperationResult {
  try {
    const validatedInput = this.validateData(input);
    
    // Auto-adjust if needed
    if (validatedInput.entryNumber > validatedInput.totalEntries) {
      validatedInput.totalEntries = validatedInput.entryNumber;
    }
    
    // Store in history
    this.entryHistory.push(validatedInput);
    
    // Track branches if applicable
    if (validatedInput.branchFromEntry && validatedInput.branchId) {
      if (!this.branches[validatedInput.branchId]) {
        this.branches[validatedInput.branchId] = [];
      }
      this.branches[validatedInput.branchId].push(validatedInput);
    }
    
    // Terminal logging (stderr)
    if (!this.disableLogging) {
      const formattedEntry = this.formatEntry(validatedInput);
      console.error(formattedEntry);
    }
    
    // Return minimal metadata
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          entryNumber: validatedInput.entryNumber,
          totalEntries: validatedInput.totalEntries,
          nextEntryNeeded: validatedInput.nextEntryNeeded,
          branches: Object.keys(this.branches),
          historyLength: this.entryHistory.length
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
          status: 'failed'
        }, null, 2)
      }],
      isError: true
    };
  }
}
```

### Phase 5: Terminal Formatting

```typescript
private formatEntry(data: [OperationName]Data): string {
  const { entryNumber, totalEntries, entry, isRevision, revisesEntry } = data;
  
  let prefix = '';
  let context = '';
  
  if (isRevision) {
    prefix = chalk.yellow('🔄 Revision');
    context = ` (revising entry ${revisesEntry})`;
  } else {
    prefix = chalk.blue('📝 Entry');  // Use operation-appropriate emoji
    context = '';
  }
  
  const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
  const border = '─'.repeat(Math.max(header.length, entry.length) + 4);
  
  return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │
└${border}┘`;
}
```

### Phase 6: Tool Description

**THIS IS THE MOST IMPORTANT PART** - The description guides AI behavior:

```typescript
const TOOL_DESCRIPTION = `
A structured tool for [operation purpose] through systematic entries.

This tool provides scaffolding for [specific methodology], enforcing discipline
through required parameters while allowing flexibility in approach.

When to use this tool:
- [Specific use case 1]
- [Specific use case 2]
- [Specific use case 3]

Key features:
- Adjust totalEntries as understanding evolves
- Mark revisions explicitly when reconsidering
- Branch to explore alternatives
- Express uncertainty naturally

Parameters explained:
- entry: Your current [operation-specific content]
- nextEntryNeeded: True if more entries needed
- entryNumber: Current position in sequence
- totalEntries: Current estimate (adjustable)
- isRevision: Boolean indicating reconsideration
- revisesEntry: Which entry number is being revised
- branchFromEntry: Branching point for alternatives
- branchId: Identifier for exploration branch

You should:
1. Start with initial estimate, adjust as needed
2. Mark revisions explicitly
3. Branch when exploring alternatives
4. Express uncertainty when present
5. Only set nextEntryNeeded to false when truly complete
`;
```

### Phase 7: Remove Vaporware

**CRITICAL CHECKS**:

- [ ] No "would dispatch" messages
- [ ] No placeholder returns
- [ ] No prompt echoing in responses
- [ ] No claims of computational reasoning
- [ ] No unused parameters
- [ ] No fake pattern selection
- [ ] All code paths are functional
- [ ] Terminal logging works
- [ ] Validation throws descriptive errors
- [ ] Storage actually stores data

### Phase 8: Testing

#### 8.1 Unit Tests

Create a unit test file that verifies:

```typescript
describe('[OperationName] Structured Journal', () => {
  it('validates required parameters', () => {
    // Test missing parameters throw errors
  });

  it('stores entries in history', () => {
    // Test history accumulation
  });

  it('auto-adjusts totalEntries', () => {
    // Test max() logic
  });

  it('tracks branches correctly', () => {
    // Test branch storage
  });

  it('returns minimal metadata', () => {
    // Test response size < 100 tokens
  });

  it('logs to stderr', () => {
    // Test terminal output
  });

  it('handles errors gracefully', () => {
    // Test error responses
  });
});
```

#### 8.2 MCP Integration Tests (MCPJam Evals CLI)

**CRITICAL**: Test the dynamic server-client MCP experience using MCPJam Evals CLI.

**Reference**: Read `.claude/checklists/mcp-evals-test-checklist.md` for the complete test checklist.

**Setup**:

1. **Read the checklist**: Open `.claude/checklists/mcp-evals-test-checklist.md` and review all test categories

2. **Generate tests.json**: Using the checklist, create test configuration in `evals-cli-starter/tests.json`

**Minimum required tests** (from checklist):

```json
[
  {
    "title": "[Operation Name] - Basic Usage",
    "query": "Use [operation-name] to [simple, clear task description]",
    "runs": 3,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation Name] - Multi-step",
    "query": "Use [operation-name] to [complex task requiring multiple steps/entries]",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation Name] - Revision",
    "query": "Use [operation-name] to [task]. Make [N] entries, then revise entry [X] to [improvement].",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation Name] - Branching",
    "query": "Use [operation-name] to [task]. Make [N] entries, then explore an alternative from entry [X].",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation Name] - Error Handling",
    "query": "Use [operation-name] but [do something invalid]",
    "runs": 1,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  }
]
```

**IMPORTANT**: The checklist defines 10 test categories. Use ALL of them for comprehensive coverage.

3. Ensure `evals-cli-starter/environment.json` is configured:

```json
{
  "servers": {
    "clear-thought": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {}
    }
  }
}
```

4. Run the evals:

```bash
# Build the server first
npm run build

# Run MCPJam evals
cd evals-cli-starter
mcpjam evals run -t tests.json -e environment.json -l llms.json

# Or use the full command
mcpjam evals run --tests tests.json --environment environment.json --llms llms.json
```

**What to verify**:

- [ ] Tool is called correctly by Claude
- [ ] Parameters are validated properly
- [ ] Responses are minimal (<100 tokens)
- [ ] Terminal logging appears in eval output
- [ ] Multi-turn conversations work
- [ ] Revisions are handled correctly
- [ ] Branching works as expected
- [ ] Error messages are clear and actionable

**Expected output**:

```
✓ [Operation Name] - Basic Usage (3/3 runs passed)
✓ [Operation Name] - Multi-step (2/2 runs passed)
✓ [Operation Name] - Revision (2/2 runs passed)
✓ [Operation Name] - Branching (2/2 runs passed)

Summary:
- Total tests: 4
- Passed: 4
- Failed: 0
- Success rate: 100%
```

**If tests fail**:

1. Check the eval output for specific errors
2. Verify tool description guides AI correctly
3. Check parameter validation is working
4. Ensure responses are minimal
5. Verify terminal logging is present
6. Test manually with MCP Inspector if needed

## Anti-Patterns to Avoid

Based on `@reports/analysis-clear-thought-actually-does-nothing.md`:

1. **Placeholder Dispatch**: Never return `{ placeholder: true, message: "Would dispatch..." }`
2. **Prompt Echoing**: Never include the user's input in the response
3. **Fake Pattern Selection**: Don't select patterns that don't execute
4. **Vaporware Claims**: Don't claim to do tree search/MCTS/beam search unless actually implemented
5. **Token Waste**: Keep responses under 100 tokens
6. **Silent Storage**: Always log to terminal for transparency
7. **Weak Validation**: Throw descriptive errors, don't silently fail

## Success Criteria

✅ Response size < 100 tokens (excluding errors)
✅ No prompt echoing
✅ Terminal logging works
✅ Validation throws descriptive errors
✅ All code paths functional (no placeholders)
✅ Tests pass
✅ Tool description guides AI behavior
✅ Storage actually stores data
✅ Branches tracked correctly
✅ Auto-adjustment works

## Checkpoint After Each Phase

After completing each phase, create a checkpoint commit:

```bash
git add -A && git commit --no-verify -m "checkpoint: [operation-name] phase [N] - [brief description]"
```

## Final Validation

Before marking complete, run the vaporware detection hook (automatically triggered on file write).

The hook will check for:
- Placeholder returns
- Prompt echoing
- Fake pattern selection
- Missing implementations
- Token waste
- Silent failures

If the hook fails, address the issues before proceeding.

