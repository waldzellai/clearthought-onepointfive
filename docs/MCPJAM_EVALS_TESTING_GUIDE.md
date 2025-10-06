# MCPJam Evals Testing Guide for Clear-Thought Operations

## Overview

This guide explains how to use the MCPJam Evals CLI to test Clear-Thought operations in a real MCP server-client environment. This is **critical** for validating that operations work correctly in the dynamic context of Model Context Protocol.

## Why MCPJam Evals?

Unit tests verify code logic, but **MCPJam Evals** tests the actual MCP experience:

✅ **Real server-client interaction** - Tests how Claude actually uses your tool
✅ **Tool discovery** - Verifies tool descriptions guide AI correctly
✅ **Multi-turn conversations** - Tests complex workflows
✅ **Parameter validation** - Ensures AI provides correct inputs
✅ **Response handling** - Validates minimal metadata responses
✅ **Error scenarios** - Tests error messages are actionable

## Installation

```bash
# Install MCPJam CLI globally
npm install -g @mcpjam/cli

# Verify installation
mcpjam --version
```

## Configuration Files

### 1. Environment Configuration

**File**: `evals-cli-starter/environment.json`

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

This configures how to start your MCP server.

### 2. LLM API Keys

**File**: `evals-cli-starter/llms.json`

```json
{
  "anthropic": "<ANTHROPIC_API_KEY>",
  "openai": "<OPENAI_API_KEY>",
  "openrouter": "<OPENROUTER_API_KEY>"
}
```

**⚠️ IMPORTANT**: Never commit this file! It's already in `.gitignore`.

### 3. Test Configuration

**File**: `evals-cli-starter/tests.json`

This is where you define your test cases.

## Test Structure

Each test has:

```json
{
  "title": "Human-readable test name",
  "query": "Natural language prompt for Claude",
  "runs": 3,  // Number of times to run (for consistency)
  "model": "anthropic/claude-sonnet-4.5",
  "provider": "openrouter",  // or "anthropic" or "openai"
  "expectedToolCalls": ["tool-name"]  // Tools that should be called
}
```

## Example Test Suite for an Operation

### Analogical Reasoning Example

```json
[
  {
    "title": "Analogical Reasoning - Basic Usage",
    "query": "Use analogical reasoning to compare how a cell is like a factory",
    "runs": 3,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "Analogical Reasoning - Multi-step",
    "query": "Use analogical reasoning to explore how photosynthesis is like a solar panel, then refine your comparison",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "Analogical Reasoning - Revision",
    "query": "Use analogical reasoning to compare DNA to a blueprint. Then revise your second entry to be more specific.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "Analogical Reasoning - Branching",
    "query": "Use analogical reasoning to compare the internet to a highway system. Then explore an alternative analogy from entry 2.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "Analogical Reasoning - Error Handling",
    "query": "Use analogical reasoning but skip entry 2 and go straight to entry 5",
    "runs": 1,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  }
]
```

## Test Categories

### 1. Basic Usage Tests

**Purpose**: Verify the operation works for simple cases

```json
{
  "title": "[Operation] - Basic Usage",
  "query": "Use [operation] to [simple task]",
  "runs": 3,
  "model": "anthropic/claude-sonnet-4.5",
  "provider": "openrouter",
  "expectedToolCalls": ["[operation-tool-name]"]
}
```

### 2. Multi-step Tests

**Purpose**: Verify the operation handles complex workflows

```json
{
  "title": "[Operation] - Multi-step",
  "query": "Use [operation] to [complex task requiring multiple entries]",
  "runs": 2,
  "model": "anthropic/claude-sonnet-4.5",
  "provider": "openrouter",
  "expectedToolCalls": ["[operation-tool-name]"]
}
```

### 3. Revision Tests

**Purpose**: Verify revision functionality works

```json
{
  "title": "[Operation] - Revision",
  "query": "Use [operation] to [task]. Then revise entry 2 to [improvement].",
  "runs": 2,
  "model": "anthropic/claude-sonnet-4.5",
  "provider": "openrouter",
  "expectedToolCalls": ["[operation-tool-name]"]
}
```

### 4. Branching Tests

**Purpose**: Verify branching/exploration works

```json
{
  "title": "[Operation] - Branching",
  "query": "Use [operation] to [task]. Then explore an alternative from entry 3.",
  "runs": 2,
  "model": "anthropic/claude-sonnet-4.5",
  "provider": "openrouter",
  "expectedToolCalls": ["[operation-tool-name]"]
}
```

### 5. Error Handling Tests

**Purpose**: Verify error messages are clear

```json
{
  "title": "[Operation] - Error Handling",
  "query": "Use [operation] but [do something invalid]",
  "runs": 1,
  "model": "anthropic/claude-sonnet-4.5",
  "provider": "openrouter",
  "expectedToolCalls": ["[operation-tool-name]"]
}
```

## Running Tests

### Step 1: Build the Server

```bash
npm run build
```

### Step 2: Run Evals

```bash
cd evals-cli-starter

# Run all tests
mcpjam evals run -t tests.json -e environment.json -l llms.json

# Or with full flags
mcpjam evals run --tests tests.json --environment environment.json --llms llms.json
```

### Step 3: Review Results

Expected output:

```
Running tests...

✓ Analogical Reasoning - Basic Usage (3/3 runs passed)
  - Average response time: 2.3s
  - Tool calls: analogical_reasoning (3/3)
  
✓ Analogical Reasoning - Multi-step (2/2 runs passed)
  - Average response time: 4.1s
  - Tool calls: analogical_reasoning (2/2)
  
✓ Analogical Reasoning - Revision (2/2 runs passed)
  - Average response time: 3.8s
  - Tool calls: analogical_reasoning (2/2)
  
✓ Analogical Reasoning - Branching (2/2 runs passed)
  - Average response time: 3.5s
  - Tool calls: analogical_reasoning (2/2)
  
✗ Analogical Reasoning - Error Handling (0/1 runs passed)
  - Error: Invalid entryNumber: must be >= 1
  - This is expected! Error handling is working.

Summary:
- Total tests: 5
- Passed: 4
- Failed: 1 (expected)
- Success rate: 80%
```

## What to Verify

### ✅ Tool Discovery

- [ ] Claude finds and calls your tool
- [ ] Tool description guides AI correctly
- [ ] AI provides appropriate parameters

### ✅ Parameter Validation

- [ ] Required parameters are enforced
- [ ] Type checking works
- [ ] Range validation works
- [ ] Error messages are descriptive

### ✅ Response Quality

- [ ] Responses are minimal (<100 tokens)
- [ ] No prompt echoing
- [ ] Only metadata returned
- [ ] JSON is well-formed

### ✅ Terminal Logging

- [ ] Logs appear in eval output
- [ ] Formatting is readable
- [ ] Progress is clear

### ✅ Multi-turn Behavior

- [ ] State persists across turns
- [ ] History accumulates correctly
- [ ] Branches are tracked
- [ ] Revisions work

### ✅ Error Handling

- [ ] Validation errors are caught
- [ ] Error messages are actionable
- [ ] Server doesn't crash
- [ ] AI can recover from errors

## Debugging Failed Tests

### Issue: Tool Not Called

**Symptoms**: Claude doesn't use your tool

**Fixes**:
1. Check tool description is clear
2. Verify tool name matches
3. Ensure tool is registered in server
4. Test query is specific enough

### Issue: Wrong Parameters

**Symptoms**: AI provides incorrect parameter values

**Fixes**:
1. Improve parameter descriptions
2. Add examples to tool description
3. Make required fields explicit
4. Simplify parameter structure

### Issue: Response Too Large

**Symptoms**: Responses exceed 100 tokens

**Fixes**:
1. Return only metadata
2. Remove explanatory text
3. Use JSON.stringify for responses
4. Check for prompt echoing

### Issue: Terminal Logging Missing

**Symptoms**: No logs in eval output

**Fixes**:
1. Add console.error() calls
2. Verify logging isn't disabled
3. Check stderr is being captured
4. Test logging locally first

### Issue: State Not Persisting

**Symptoms**: History resets between turns

**Fixes**:
1. Check server instance is singleton
2. Verify state isn't being cleared
3. Test with MCP Inspector
4. Review session management

## Best Practices

### 1. Test Coverage

Create tests for:
- ✅ Happy path (basic usage)
- ✅ Complex workflows (multi-step)
- ✅ Edge cases (revision, branching)
- ✅ Error scenarios (invalid inputs)
- ✅ Performance (response times)

### 2. Run Multiple Times

Use `"runs": 3` for consistency:
- Catches intermittent issues
- Validates AI behavior is stable
- Measures average performance

### 3. Use Realistic Queries

Write queries that:
- Match real user intent
- Test actual use cases
- Cover different complexity levels
- Include edge cases

### 4. Verify Expected Behavior

Check that:
- Tool is called when expected
- Parameters are correct
- Responses are minimal
- Errors are handled gracefully

### 5. Iterate Based on Results

If tests fail:
1. Review eval output
2. Identify root cause
3. Fix implementation
4. Re-run tests
5. Repeat until passing

## Integration with Workflow

### In Phase 8 of Conversion

After unit tests, run MCPJam evals:

```bash
# 1. Build server
npm run build

# 2. Create test configuration
# Edit evals-cli-starter/tests.json

# 3. Run evals
cd evals-cli-starter
mcpjam evals run -t tests.json -e environment.json -l llms.json

# 4. Review results and fix issues

# 5. Re-run until all tests pass

# 6. Checkpoint
git add -A && git commit --no-verify -m "checkpoint: [operation] passes MCPJam evals"
```

## Example: Complete Test Suite

**File**: `evals-cli-starter/tests-analogical-reasoning.json`

```json
[
  {
    "title": "AR - Basic cell/factory analogy",
    "query": "Use analogical reasoning to compare how a cell is like a factory",
    "runs": 3,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "AR - Photosynthesis/solar panel with refinement",
    "query": "Use analogical reasoning to explore how photosynthesis is like a solar panel, then refine your comparison in a second entry",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "AR - DNA/blueprint with revision",
    "query": "Use analogical reasoning to compare DNA to a blueprint. Make 3 entries, then revise entry 2 to be more specific.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  },
  {
    "title": "AR - Internet/highway with branching",
    "query": "Use analogical reasoning to compare the internet to a highway system. Make 3 entries, then explore an alternative analogy from entry 2.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["analogical_reasoning"]
  }
]
```

Run with:

```bash
mcpjam evals run -t tests-analogical-reasoning.json -e environment.json -l llms.json
```

## Troubleshooting

### MCPJam CLI Not Found

```bash
npm install -g @mcpjam/cli
```

### Server Won't Start

```bash
# Check build
npm run build

# Test server manually
node dist/server.js
```

### API Key Issues

```bash
# Verify llms.json has valid keys
cat evals-cli-starter/llms.json

# Test with curl
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models
```

### Tests Timeout

Increase timeout in test configuration (if supported) or simplify queries.

## References

- **MCPJam Evals CLI**: `inspector/evals-cli/README.md`
- **Example Tests**: `evals-cli-starter/tests.json`
- **MCP Inspector**: `inspector/README.md`
- **Workflow Guide**: `docs/AGENTIC_WORKFLOW_GUIDE.md`

## Conclusion

MCPJam Evals testing is **essential** for validating that your operation works correctly in the real MCP server-client environment. It catches issues that unit tests miss and ensures Claude can actually use your tool effectively.

Always run evals before marking an operation complete! ✅

