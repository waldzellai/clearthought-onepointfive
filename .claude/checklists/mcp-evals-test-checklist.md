# MCP Evals Test Checklist

This checklist defines what to test when validating a Clear-Thought operation with MCPJam Evals CLI.

Use this checklist to generate comprehensive `tests.json` configurations for MCPJam Evals.

## Test Categories

### 1. Basic Usage Test

**Purpose**: Verify the operation works for simple, straightforward cases

**What to test**:
- [ ] Tool is called correctly by Claude
- [ ] Required parameters are provided
- [ ] Basic functionality works
- [ ] Response is minimal (<100 tokens)
- [ ] Response contains only metadata (no prompt echoing)

**Test configuration**:
- Runs: 3 (for consistency)
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [simple, clear task description]
```

### 2. Multi-step Test

**Purpose**: Verify the operation handles complex, multi-turn workflows

**What to test**:
- [ ] Multiple entries can be created
- [ ] State persists across turns
- [ ] History accumulates correctly
- [ ] `totalEntries` auto-adjusts properly
- [ ] Each entry is stored independently

**Test configuration**:
- Runs: 2
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [complex task requiring multiple steps/entries]
```

### 3. Revision Test

**Purpose**: Verify revision functionality works correctly

**What to test**:
- [ ] Can revise existing entries
- [ ] `parentEntry` is set correctly
- [ ] `branchFromEntry` is set correctly
- [ ] Revised entry is stored separately
- [ ] Original entry remains unchanged
- [ ] History tracks the revision

**Test configuration**:
- Runs: 2
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [task]. Make [N] entries, then revise entry [X] to [improvement].
```

### 4. Branching Test

**Purpose**: Verify branching/exploration functionality works

**What to test**:
- [ ] Can branch from existing entries
- [ ] `branchFromEntry` is set correctly
- [ ] `parentEntry` is set correctly
- [ ] Branch is stored as new entry
- [ ] Original entry remains unchanged
- [ ] History tracks the branch

**Test configuration**:
- Runs: 2
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [task]. Make [N] entries, then explore an alternative from entry [X].
```

### 5. Error Handling Test

**Purpose**: Verify error messages are clear and actionable

**What to test**:
- [ ] Invalid parameters are caught
- [ ] Error messages are descriptive
- [ ] Error messages suggest fixes
- [ ] Server doesn't crash
- [ ] Claude can understand and recover from errors

**Test configuration**:
- Runs: 1
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] but [do something invalid, e.g., skip entries, use invalid parameters]
```

### 6. Parameter Validation Test

**Purpose**: Verify parameter validation works correctly

**What to test**:
- [ ] Required parameters are enforced
- [ ] Type checking works
- [ ] Range validation works (e.g., `entryNumber >= 1`)
- [ ] Auto-adjustment works (e.g., `totalEntries = max(totalEntries, entryNumber)`)
- [ ] Validation errors are descriptive

**Test configuration**:
- Runs: 1
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] with [invalid parameter values]
```

### 7. Terminal Logging Test

**Purpose**: Verify terminal logging is present and useful

**What to test**:
- [ ] Logs appear in eval output
- [ ] Logs are formatted clearly
- [ ] Logs show progress
- [ ] Logs use colors/formatting appropriately
- [ ] Logs are written to stderr (not stdout)

**Test configuration**:
- Runs: 1
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [task] and verify logging appears
```

### 8. Tool Description Test

**Purpose**: Verify tool description guides Claude correctly

**What to test**:
- [ ] Claude understands when to use the tool
- [ ] Claude provides appropriate parameters
- [ ] Claude understands the tool's purpose
- [ ] Claude doesn't misuse the tool
- [ ] Tool description is clear and unambiguous

**Test configuration**:
- Runs: 2
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
[Ambiguous request that requires Claude to interpret tool description correctly]
```

### 9. Token Efficiency Test

**Purpose**: Verify responses are minimal and token-efficient

**What to test**:
- [ ] Response size < 100 tokens
- [ ] No prompt echoing
- [ ] Only metadata returned
- [ ] No explanatory text
- [ ] JSON is compact

**Test configuration**:
- Runs: 3
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [task] and verify response is minimal
```

### 10. State Persistence Test

**Purpose**: Verify state persists correctly across turns

**What to test**:
- [ ] History accumulates
- [ ] State doesn't reset between turns
- [ ] Branches are tracked
- [ ] Revisions are tracked
- [ ] `totalEntries` is maintained

**Test configuration**:
- Runs: 2
- Model: `anthropic/claude-sonnet-4.5`
- Provider: `openrouter`
- Expected tool calls: `[operation-tool-name]`

**Query template**:
```
Use [operation-name] to [task requiring multiple turns], then verify state persisted
```

## Minimum Required Tests

At minimum, every operation should have:

1. ✅ **Basic Usage Test** (3 runs)
2. ✅ **Multi-step Test** (2 runs)
3. ✅ **Revision Test** (2 runs)
4. ✅ **Branching Test** (2 runs)
5. ✅ **Error Handling Test** (1 run)

**Total minimum**: 5 tests, 10 runs

## Recommended Additional Tests

For comprehensive coverage, add:

6. ✅ **Parameter Validation Test** (1 run)
7. ✅ **Terminal Logging Test** (1 run)
8. ✅ **Tool Description Test** (2 runs)
9. ✅ **Token Efficiency Test** (3 runs)
10. ✅ **State Persistence Test** (2 runs)

**Total recommended**: 10 tests, 19 runs

## Success Criteria

A test passes if:

- ✅ Expected tool is called
- ✅ Tool executes without errors (unless testing error handling)
- ✅ Response is minimal (<100 tokens)
- ✅ Terminal logging appears
- ✅ State persists correctly
- ✅ Validation works as expected

## Failure Indicators

A test fails if:

- ❌ Wrong tool is called
- ❌ Tool crashes or throws unexpected errors
- ❌ Response is too large (>100 tokens)
- ❌ Prompt is echoed in response
- ❌ No terminal logging
- ❌ State doesn't persist
- ❌ Validation doesn't work

## Example Test Suite Structure

```json
[
  {
    "title": "[Operation] - Basic Usage",
    "query": "Use [operation] to [simple task]",
    "runs": 3,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation] - Multi-step",
    "query": "Use [operation] to [complex multi-step task]",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation] - Revision",
    "query": "Use [operation] to [task]. Make 3 entries, then revise entry 2.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation] - Branching",
    "query": "Use [operation] to [task]. Make 3 entries, then explore alternative from entry 2.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  },
  {
    "title": "[Operation] - Error Handling",
    "query": "Use [operation] but [do something invalid]",
    "runs": 1,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation-tool-name]"]
  }
]
```

## Notes

- Always use `anthropic/claude-sonnet-4.5` model for consistency
- Always use `openrouter` provider (or configure in `llms.json`)
- Run basic tests 3 times for consistency
- Run complex tests 2 times to catch intermittent issues
- Run error tests 1 time (errors should be deterministic)
- Use descriptive test titles that explain what's being tested
- Use clear, specific queries that match real user intent

