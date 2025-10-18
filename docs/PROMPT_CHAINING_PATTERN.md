# Prompt Chaining Pattern: Slash Commands + Checklists

## Overview

This document describes the **prompt chaining pattern** used in the Clear-Thought agentic workflow, where Claude Code slash commands reference external checklists to generate structured outputs.

## Pattern: Slash Command → Checklist → Generated Output

### The Problem

When creating complex workflows, embedding all instructions directly in slash commands leads to:

- ❌ **Bloated slash commands** - Hard to read and maintain
- ❌ **Duplication** - Same instructions repeated across commands
- ❌ **Inconsistency** - Different commands use different criteria
- ❌ **Hard to update** - Changes require editing multiple files

### The Solution

**Separate concerns** using a two-layer architecture:

1. **Slash Command** (`.claude/commands/*.md`) - High-level workflow orchestration
2. **Checklist** (`.claude/checklists/*.md`) - Detailed criteria and templates

The slash command **references** the checklist, instructing Claude to read it and use it to generate the output.

## Implementation in Clear-Thought

### Example: MCPJam Evals Test Generation

**Slash Command**: `.claude/commands/convert-to-journal.md`

```markdown
#### 8.2 MCP Integration Tests (MCPJam Evals CLI)

**Reference**: Read `.claude/checklists/mcp-evals-test-checklist.md` for the complete test checklist.

**Setup**:

1. **Read the checklist**: Open `.claude/checklists/mcp-evals-test-checklist.md` and review all test categories

2. **Generate tests.json**: Using the checklist, create test configuration in `evals-cli-starter/tests.json`

**IMPORTANT**: The checklist defines 10 test categories. Use ALL of them for comprehensive coverage.
```

**Checklist**: `.claude/checklists/mcp-evals-test-checklist.md`

```markdown
# MCP Evals Test Checklist

## Test Categories

### 1. Basic Usage Test
**Purpose**: Verify the operation works for simple, straightforward cases
**What to test**:
- [ ] Tool is called correctly by Claude
- [ ] Required parameters are provided
...

### 2. Multi-step Test
...

### 3. Revision Test
...
```

### How It Works

1. **User invokes slash command**: `/convert-to-journal`
2. **Slash command instructs Claude**: "Read `.claude/checklists/mcp-evals-test-checklist.md`"
3. **Claude reads checklist**: Loads all test categories, templates, and criteria
4. **Claude generates output**: Creates `tests.json` using checklist as reference
5. **Result**: Comprehensive, consistent test configuration

## Benefits

### 1. Modularity

✅ **Single source of truth** - Checklist is the authoritative reference
✅ **Reusable** - Multiple commands can reference the same checklist
✅ **Maintainable** - Update checklist once, affects all commands

### 2. Clarity

✅ **Separation of concerns** - Workflow vs. criteria
✅ **Easier to read** - Slash command focuses on orchestration
✅ **Self-documenting** - Checklist explains what and why

### 3. Consistency

✅ **Same criteria everywhere** - All commands use same checklist
✅ **No drift** - Changes propagate automatically
✅ **Quality assurance** - Comprehensive coverage guaranteed

### 4. Flexibility

✅ **Easy to extend** - Add new test categories to checklist
✅ **Easy to customize** - Override specific items per operation
✅ **Version control** - Track changes to criteria over time

## Best Practices

### 1. Use Explicit References

**Good**:
```markdown
**Reference**: Read `.claude/checklists/mcp-evals-test-checklist.md`
```

**Bad**:
```markdown
Use the test checklist
```

### 2. Instruct Claude to Read

**Good**:
```markdown
1. **Read the checklist**: Open `.claude/checklists/mcp-evals-test-checklist.md` and review all test categories
```

**Bad**:
```markdown
The checklist has test categories
```

### 3. Emphasize Completeness

**Good**:
```markdown
**IMPORTANT**: The checklist defines 10 test categories. Use ALL of them for comprehensive coverage.
```

**Bad**:
```markdown
Use the checklist
```

### 4. Provide Context

**Good**:
```markdown
**Reference**: Read `.claude/checklists/mcp-evals-test-checklist.md` for the complete test checklist.

This checklist defines:
- 10 test categories
- What to test in each category
- Query templates
- Success criteria
```

**Bad**:
```markdown
See checklist
```

## File Organization

```
.claude/
├── commands/
│   ├── convert-to-journal.md       # Slash command (orchestration)
│   └── other-command.md
├── checklists/
│   ├── mcp-evals-test-checklist.md # Checklist (criteria)
│   └── other-checklist.md
└── settings.json
```

### Naming Conventions

- **Commands**: `verb-noun.md` (e.g., `convert-to-journal.md`)
- **Checklists**: `noun-checklist.md` (e.g., `mcp-evals-test-checklist.md`)

## Example Workflow

### Step 1: User Invokes Command

```bash
/convert-to-journal
Convert src/tools/operations/analogical-reasoning.ts
```

### Step 2: Command Guides Through Phases

```
Phase 1: Analysis & Planning
Phase 2: Define Interface
...
Phase 8: Testing
  8.1: Unit Tests
  8.2: MCP Integration Tests
```

### Step 3: Command References Checklist

```markdown
**Reference**: Read `.claude/checklists/mcp-evals-test-checklist.md`
```

### Step 4: Claude Reads Checklist

Claude opens and reads:
- 10 test categories
- Query templates
- Success criteria
- Example structure

### Step 5: Claude Generates Output

Claude creates `evals-cli-starter/tests.json`:

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
  ...
]
```

## Anthropic's Guidance

From [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents):

> **Workflow: Prompt chaining**
> 
> Prompt chaining decomposes a task into a sequence of steps, where each LLM call processes the output of the previous one.

From [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices):

> **c. Use custom slash commands**
> 
> For repeated workflows—debugging loops, log analysis, etc.—store prompt templates in Markdown files within the .claude/commands folder.

## Related Patterns

### 1. Prompt Chaining

Our pattern is a form of **prompt chaining** where:
- Slash command = Orchestrator prompt
- Checklist = Reference data
- Generated output = Next step input

### 2. Retrieval-Augmented Generation (RAG)

Similar to RAG, but:
- Instead of vector search, we use explicit file references
- Instead of embedding chunks, we reference complete checklists
- Instead of semantic similarity, we use structured criteria

### 3. Agent-Computer Interface (ACI)

From Anthropic's guidance:

> Put as much effort into the Agent–Computer Interface (ACI) as you would in Human–Computer Interface (HCI).

Our checklists are part of the ACI—they help Claude understand what to generate.

## Future Enhancements

Potential improvements to this pattern:

- [ ] **Checklist validation** - Verify checklist format before use
- [ ] **Checklist versioning** - Track changes to criteria over time
- [ ] **Checklist composition** - Combine multiple checklists
- [ ] **Checklist templates** - Generate checklists from templates
- [ ] **Checklist inheritance** - Base checklists with overrides
- [ ] **Checklist metrics** - Track usage and effectiveness

## Conclusion

The **Slash Command → Checklist → Generated Output** pattern provides:

✅ **Modularity** - Separate orchestration from criteria
✅ **Clarity** - Clear separation of concerns
✅ **Consistency** - Single source of truth
✅ **Flexibility** - Easy to extend and customize
✅ **Maintainability** - Update once, affect all commands

This pattern is inspired by Anthropic's guidance on:
- Prompt chaining workflows
- Custom slash commands
- Agent-Computer Interface design

Use this pattern whenever you need Claude to generate structured outputs based on comprehensive criteria.

## References

- **Anthropic**: [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
- **Anthropic**: [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- **BioErrorLog**: [AI Agent Patterns & Practices](https://en.bioerrorlog.work/entry/ai-agent-patterns)
- **Implementation**: `.claude/commands/convert-to-journal.md`
- **Implementation**: `.claude/checklists/mcp-evals-test-checklist.md`

