# Agentic Workflow Guide: Converting Operations to Structured Journal Pattern

This guide documents the agentic workflow for converting Clear-Thought operations to use the structured journal pattern, with automated vaporware detection.

## Overview

This workflow combines:
1. **Claude Code slash command** (`/convert-to-journal`) - Provides step-by-step conversion process
2. **Validation hook** - Automatically validates implementations against vaporware anti-patterns
3. **Claude Agent SDK** - Powers intelligent code analysis and validation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  /convert-to-journal slash command                          │
│  • Guides through 8-phase conversion process                │
│  • References Sequential Thinking implementation            │
│  • Enforces structured journal pattern                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Developer edits operation file                             │
│  • Implements validation                                    │
│  • Adds storage logic                                       │
│  • Creates terminal logging                                 │
│  • Writes minimal responses                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PostToolUse Hook Triggered (Write/Edit)                    │
│  • Detects operation file changes                           │
│  • Runs validation automatically                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Static Analysis (Fast)                                     │
│  • Checks for placeholder returns                           │
│  • Detects prompt echoing                                   │
│  • Finds TODO/unimplemented code                            │
│  • Validates terminal logging                               │
│  • Scores implementation (0-100)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Score >= 70?    │
                    └─────────────────┘
                       │           │
                      Yes          No
                       │           │
                       │           ▼
                       │  ┌─────────────────────────────────┐
                       │  │ Claude Agent SDK Validation     │
                       │  │ • Deep semantic analysis        │
                       │  │ • Line-by-line review           │
                       │  │ • Specific issue identification │
                       │  │ • Actionable feedback           │
                       │  └─────────────────────────────────┘
                       │           │
                       │           ▼
                       │  ┌─────────────────┐
                       │  │ Final Score?    │
                       │  └─────────────────┘
                       │           │
                       │      ┌────┴────┐
                       │     < 70     >= 70
                       │      │          │
                       ▼      ▼          │
              ┌──────────────────┐      │
              │ ✅ Pass          │◄─────┘
              │ Continue work    │
              └──────────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ ❌ Fail          │
              │ Exit code 2      │
              │ Block operation  │
              │ Show issues      │
              └──────────────────┘
```

## Components

### 1. Slash Command: `/convert-to-journal`

**Location**: `.claude/commands/convert-to-journal.md`

**Purpose**: Provides a repeatable, step-by-step process for converting operations to the structured journal pattern.

**Key Features**:
- 8-phase conversion workflow
- References to Sequential Thinking implementation
- Anti-pattern checklist
- Success criteria
- Automatic checkpoint reminders

**Usage**:
```bash
# In Claude Code
/convert-to-journal

# Then specify the operation to convert
Convert src/tools/operations/analogical-reasoning.ts
```

### 2. Validation Hook: `validate-vaporware.ts`

**Location**: `.claude/hooks/validate-vaporware.ts`

**Purpose**: Automatically validates operation implementations against vaporware anti-patterns.

**Trigger**: PostToolUse event for Write/Edit operations in `src/tools/operations/`

**Validation Layers**:

1. **Static Analysis** (Fast, ~100ms)
   - Regex-based pattern matching
   - Structural checks
   - Basic heuristics
   - Immediate feedback

2. **Claude Agent SDK Analysis** (Thorough, ~10-30s)
   - Semantic understanding
   - Context-aware validation
   - Line-specific feedback
   - Detailed issue descriptions

**Exit Codes**:
- `0` - Validation passed
- `1` - Hook execution error
- `2` - Validation failed (blocks operation in Claude Code)

### 3. Hook Configuration

**Location**: `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "tsx \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate-vaporware.ts",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## Validation Checklist

The hook validates against these anti-patterns:

### Critical Failures (-20 points each)

1. **Placeholder Returns**
   ```typescript
   // ❌ BAD
   return { placeholder: true, message: "Would dispatch to tree search" };
   
   // ✅ GOOD
   return { entryNumber: 1, totalEntries: 5, nextEntryNeeded: true };
   ```

2. **Prompt Echoing**
   ```typescript
   // ❌ BAD
   return { text: `You said: ${input.prompt}. Here's what I think...` };
   
   // ✅ GOOD
   return { text: JSON.stringify({ entryNumber: 1, historyLength: 1 }) };
   ```

3. **Fake Pattern Selection**
   ```typescript
   // ❌ BAD
   const pattern = selectPattern(input); // Returns but never executes
   return { selectedPattern: pattern.name };
   
   // ✅ GOOD
   // No pattern selection - just structured journaling
   ```

4. **Vaporware Claims**
   ```typescript
   // ❌ BAD
   // Claims to do MCTS but just stores data
   description: "Uses Monte Carlo Tree Search to explore solution space"
   
   // ✅ GOOD
   description: "Structured journaling for systematic exploration"
   ```

5. **Missing Implementation**
   ```typescript
   // ❌ BAD
   // TODO: Implement tree search
   function search() { /* unimplemented */ }
   
   // ✅ GOOD
   // Fully implemented validation, storage, logging
   ```

### Token Efficiency Failures (-15 points each)

6. **Response Size > 100 tokens**
   ```typescript
   // ❌ BAD
   return { text: `Here's a detailed explanation of what I did...` }; // 200+ tokens
   
   // ✅ GOOD
   return { text: JSON.stringify({ entryNumber: 1, nextEntryNeeded: true }) }; // ~20 tokens
   ```

### Transparency Failures (-10 points each)

7. **Silent Storage**
   ```typescript
   // ❌ BAD
   this.history.push(entry); // No logging
   
   // ✅ GOOD
   this.history.push(entry);
   console.error(this.formatEntry(entry)); // Terminal logging
   ```

8. **Weak Validation**
   ```typescript
   // ❌ BAD
   if (!input.entry) return { success: false };
   
   // ✅ GOOD
   if (!input.entry || typeof input.entry !== 'string') {
     throw new Error('Invalid entry: must be a non-empty string');
   }
   ```

### Structural Issues (-5 points each)

9. **Unused Parameters**
10. **Circular Dependencies**
11. **State Confusion**

## Workflow Example

### Step 1: Start Conversion

```bash
# In Claude Code
/convert-to-journal

# Specify operation
Convert src/tools/operations/analogical-reasoning.ts
```

### Step 2: Follow Guided Process

The slash command guides through 8 phases:

1. **Analysis & Planning** - Understand current implementation
2. **Define Interface** - Create structured journal schema
3. **Implement Validation** - Add strict type checking
4. **Implement Storage** - Add history tracking
5. **Terminal Formatting** - Create human-readable output
6. **Tool Description** - Write AI-guiding description
7. **Remove Vaporware** - Eliminate anti-patterns
8. **Testing** - Verify implementation

### Step 3: Automatic Validation

When you save the file (Write/Edit), the hook automatically:

1. Detects the operation file change
2. Runs static analysis
3. If score < 70, runs Claude Agent SDK validation
4. Reports issues with specific line numbers
5. Blocks operation if validation fails (exit code 2)

### Step 4: Address Issues

If validation fails:

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

### Step 5: Fix and Retry

Address the issues and save again. The hook re-runs automatically.

### Step 6: Success

```
🔍 Validating analogical-reasoning.ts for vaporware patterns...

Running static analysis...
Static analysis score: 85/100

✅ Validation passed (score: 85/100)
```

## Benefits

1. **Prevents Vaporware** - Catches anti-patterns before they're committed
2. **Enforces Consistency** - All operations follow the same pattern
3. **Automated Quality** - No manual review needed
4. **Fast Feedback** - Static analysis gives immediate results
5. **Deep Analysis** - Claude Agent SDK provides semantic understanding
6. **Actionable Feedback** - Specific line numbers and code examples
7. **Repeatable Process** - Slash command ensures consistency

## Dependencies

Install required packages:

```bash
npm install --save-dev @anthropic-ai/claude-agent-sdk tsx chalk
```

## Configuration

The hook is configured to:
- Run on PostToolUse for Write/Edit operations
- Only validate files in `src/tools/operations/`
- Timeout after 120 seconds
- Use Claude Opus 4 for deep analysis
- Exit with code 2 to block on failure

## Troubleshooting

### Hook Not Running

Check that:
1. `.claude/settings.json` exists and is valid JSON
2. Hook script is executable: `chmod +x .claude/hooks/validate-vaporware.ts`
3. `tsx` is installed: `npm install -g tsx`
4. File path matches pattern: `src/tools/operations/*.ts`

### Validation Always Fails

Check:
1. Static analysis output for specific issues
2. Claude Agent SDK feedback for detailed analysis
3. Reference implementation in `docs/sequential-thinking-mcp-index.ts`
4. Anti-pattern examples in `reports/analysis-clear-thought-actually-does-nothing.md`

### Hook Times Out

Increase timeout in `.claude/settings.json`:
```json
{
  "timeout": 180  // 3 minutes
}
```

## Future Enhancements

- [ ] Add pre-commit hook for CI/CD integration
- [ ] Generate validation reports
- [ ] Track validation scores over time
- [ ] Add auto-fix suggestions
- [ ] Create validation dashboard

## References

- [Sequential Thinking Analysis](../reports/how-sequentialthinking-actually-works.md)
- [Reference Implementation](./sequential-thinking-mcp-index.ts)
- [Vaporware Analysis](../reports/analysis-clear-thought-actually-does-nothing.md)
- [Claude Code Hooks Documentation](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Agent SDK Documentation](https://docs.claude.com/en/api/agent-sdk/todo-tracking)

