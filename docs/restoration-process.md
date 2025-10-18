# Clear Thought Server Restoration Process

**Version**: 1.0
**Date**: 2025-10-18
**Status**: In Progress

## Overview

This document outlines the systematic process for restoring functionality to the Clear Thought MCP server, transforming "vaporware" operations into fully functional model enhancement tools.

## Critical Principle: The Server Does NOT Reason

**Remember**: The agent performs reasoning. The server provides structure.

Model enhancement servers are **scaffolding, not reasoning engines**. They:
- ✅ Record reasoning steps (journaling)
- ✅ Maintain state and history
- ✅ Validate input format
- ✅ Return metadata and progress indicators
- ❌ **DO NOT** generate thoughts or reasoning
- ❌ **DO NOT** evaluate quality of agent's reasoning

## Restoration Philosophy

Each Clear Thought operation follows the **Structured Journal Pattern**:

1. **Validation**: Strict type checking with descriptive errors
2. **Storage**: Maintain history and branches
3. **Logging**: Formatted output to stderr for humans
4. **Metadata Response**: Return progress indicators, NOT content
5. **Tool Description**: Rich guidance that teaches the AI how to use the tool

## Restoration Checklist Per Operation

### Phase 1: Interface Audit
- [ ] Operation extends `BaseOperation`
- [ ] Has `name` and `category` properties
- [ ] Implements `execute(context: OperationContext)` method
- [ ] Has proper TypeScript interface for operation-specific data

### Phase 2: Core Implementation
- [ ] `validateData()` private method with strict type checking
- [ ] Clear, descriptive error messages for validation failures
- [ ] State storage (entryHistory, branches, etc.)
- [ ] `formatEntry()` for human-readable stderr logging
- [ ] Logging control via environment variable
- [ ] Auto-adjustment of totalEntries when exceeded

### Phase 3: Tool Description (CRITICAL)
- [ ] Implements `getToolDescription()` method
- [ ] Returns `ToolDescription` interface:
  - `name`: string
  - `description`: Comprehensive guidance (see template below)
  - `inputSchema`: Full JSON schema with all parameters

### Phase 4: Testing & Integration
- [ ] Registered in `src/tools/operations/index.ts`
- [ ] Listed in `src/tools/index-refactored.ts` enum
- [ ] Manual test with MCP inspector
- [ ] Automated test coverage

## Tool Description Template

Every `getToolDescription()` should follow this structure:

```typescript
getToolDescription(): ToolDescription {
  return {
    name: this.name,
    description: `A structured tool for [PRIMARY PURPOSE] through [METHODOLOGY].

This tool provides scaffolding for [WORKFLOW TYPE], enforcing discipline through
required parameters while allowing flexibility in [FLEXIBLE ASPECTS]. It does NOT
perform computational reasoning - it provides structure for the AI to [REASONING GOAL].

When to use this tool:
- [USE CASE 1: Specific scenario]
- [USE CASE 2: Problem type]
- [USE CASE 3: Workflow requirement]
- [USE CASE 4: Context need]
- [USE CASE 5: Iterative process]

Key features:
- Adjust totalEntries as understanding evolves
- [FEATURE 2: Specific to this operation]
- [FEATURE 3: Advanced capability]
- Revise entries when [REVISION TRIGGER]
- Branch to explore [BRANCHING PURPOSE]
- Express uncertainty naturally

Parameters explained:
- entry: Your current step in [PROCESS TYPE] (required)
- nextEntryNeeded: True if more entries needed to [COMPLETION CRITERIA] (required)
- entryNumber: Current position in sequence (1, 2, 3, ...) (required)
- totalEntries: Current estimate of total entries needed (adjustable) (required)
- [OPTIONAL PARAM 1]: [When and why to use]
- [OPTIONAL PARAM 2]: [Purpose and examples]
- isRevision: Boolean indicating if this revises previous thinking (optional)
- revisesEntry: Which entry number is being reconsidered (optional)
- branchFromEntry: Branching point for [BRANCH PURPOSE] (optional)
- branchId: Identifier for exploration branch (optional)

You should:
1. [STEP 1: Initial action or setup]
2. [STEP 2: Main process]
3. [STEP 3: Handling uncertainty]
4. [STEP 4: Revision criteria]
5. [STEP 5: Branching guidelines]
6. [STEP 6: Advanced features]
7. Only set nextEntryNeeded to false when [COMPLETION CRITERIA]`,
    inputSchema: {
      type: "object" as const,
      properties: {
        entry: {
          type: "string",
          description: "Current step description",
        },
        nextEntryNeeded: {
          type: "boolean",
          description: "Whether another entry is needed",
        },
        entryNumber: {
          type: "integer",
          description: "Current entry number (1, 2, 3, ...)",
          minimum: 1,
        },
        totalEntries: {
          type: "integer",
          description: "Estimated total entries needed",
          minimum: 1,
        },
        // ... operation-specific parameters
        isRevision: {
          type: "boolean",
          description: "Whether this revises previous thinking",
        },
        revisesEntry: {
          type: "integer",
          description: "Which entry is being reconsidered",
          minimum: 1,
        },
        branchFromEntry: {
          type: "integer",
          description: "Branching point entry number",
          minimum: 1,
        },
        branchId: {
          type: "string",
          description: "Branch identifier",
        },
      },
      required: ["entry", "nextEntryNeeded", "entryNumber", "totalEntries"],
    },
  };
}
```

## Standard Operation Structure

```typescript
/**
 * [OPERATION NAME] Operation - Structured Journal Pattern
 *
 * [PURPOSE STATEMENT]
 * [METHODOLOGY DESCRIPTION]
 */

import chalk from "chalk";
import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

interface [OperationName]Data {
  // Required fields
  entry: string;
  entryNumber: number;
  totalEntries: number;
  nextEntryNeeded: boolean;

  // Optional revision/branching
  isRevision?: boolean;
  revisesEntry?: number;
  branchFromEntry?: number;
  branchId?: string;

  // Operation-specific fields
  [customField]?: [type];
}

export class [OperationName]Operation extends BaseOperation {
  name = "[operation_name]";
  category = "[category]"; // core | collaborative | analysis | patterns | etc.

  // Storage
  private entryHistory: [OperationName]Data[] = [];
  private branches: Record<string, [OperationName]Data[]> = {};

  // Logging control
  private disableLogging = (process.env.DISABLE_[OPERATION]_LOGGING || "").toLowerCase() === "true";

  /**
   * Validate input with strict type checking
   */
  private validateData(input: unknown): [OperationName]Data {
    const data = input as Record<string, unknown>;

    // Required field validation
    if (!data.entry || typeof data.entry !== "string") {
      throw new Error("Invalid entry: must be a string describing [WHAT]");
    }
    if (typeof data.entryNumber !== "number") {
      throw new Error("Invalid entryNumber: must be a number");
    }
    if (typeof data.totalEntries !== "number") {
      throw new Error("Invalid totalEntries: must be a number");
    }
    if (typeof data.nextEntryNeeded !== "boolean") {
      throw new Error("Invalid nextEntryNeeded: must be a boolean");
    }

    // Optional field validation
    // ... validate operation-specific fields

    return {
      entry: data.entry,
      entryNumber: data.entryNumber,
      totalEntries: data.totalEntries,
      nextEntryNeeded: data.nextEntryNeeded,
      isRevision: data.isRevision as boolean | undefined,
      revisesEntry: data.revisesEntry as number | undefined,
      branchFromEntry: data.branchFromEntry as number | undefined,
      branchId: data.branchId as string | undefined,
      // ... map operation-specific fields
    };
  }

  /**
   * Format entry for terminal display
   */
  private formatEntry(data: [OperationName]Data): string {
    const { entryNumber, totalEntries, entry, isRevision, revisesEntry, branchId } = data;

    let prefix = "";
    let context = "";

    if (isRevision) {
      prefix = chalk.yellow("🔄 Revision");
      context = ` (revising entry ${revisesEntry})`;
    } else if (branchId) {
      prefix = chalk.green("🌿 Branch");
      context = ` (${branchId})`;
    } else {
      prefix = chalk.[color]("[EMOJI] [Name]");
      context = "";
    }

    const header = `${prefix} ${entryNumber}/${totalEntries}${context}`;
    const border = "─".repeat(Math.max(header.length, entry.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │
└${border}┘`;
  }

  /**
   * Execute operation - Storage + Metadata Response
   */
  async execute(context: OperationContext): Promise<OperationResult> {
    const { parameters } = context;

    try {
      // Validate
      const validatedInput = this.validateData(parameters);

      // Auto-adjust totalEntries
      if (validatedInput.entryNumber > validatedInput.totalEntries) {
        validatedInput.totalEntries = validatedInput.entryNumber;
      }

      // Store
      this.entryHistory.push(validatedInput);

      // Track branches
      if (validatedInput.branchFromEntry && validatedInput.branchId) {
        if (!this.branches[validatedInput.branchId]) {
          this.branches[validatedInput.branchId] = [];
        }
        this.branches[validatedInput.branchId].push(validatedInput);
      }

      // Log to stderr
      if (!this.disableLogging) {
        const formattedEntry = this.formatEntry(validatedInput);
        console.error(formattedEntry);
      }

      // Return ONLY metadata (<100 tokens)
      return this.createResult({
        entryNumber: validatedInput.entryNumber,
        totalEntries: validatedInput.totalEntries,
        nextEntryNeeded: validatedInput.nextEntryNeeded,
        branches: Object.keys(this.branches),
        historyLength: this.entryHistory.length,
      });
    } catch (error) {
      return this.createError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Tool description - AI guidance
   */
  getToolDescription() {
    return {
      // ... see template above
    };
  }
}

export default new [OperationName]Operation();
```

## Conversion Examples

### Example 1: Sequential Thinking (Missing getToolDescription)

**Before**: Has implementation but no tool description
**After**: Add comprehensive getToolDescription() based on the original mcp-sequentialthinking server

### Example 2: Creative Thinking (Wrong Method Name)

**Before**: Uses `getDescription()` instead of `getToolDescription()`
**After**: Rename method and ensure it returns proper `ToolDescription` interface

### Example 3: Visual Reasoning (No Tool Description)

**Before**: Has execute logic but no guidance for AI
**After**: Add getToolDescription() explaining spatial/visual reasoning workflow

## Validation Process

For each restored operation:

1. **Code Review**:
   - All required methods present
   - Follows standard structure
   - Proper TypeScript types
   - Error messages are descriptive

2. **Tool Description Quality**:
   - "When to use" section is clear
   - Parameters are explained in context
   - Workflow steps are numbered
   - Completion criteria are explicit

3. **Testing**:
   - Use MCP Inspector to call operation
   - Verify error messages guide toward correct usage
   - Check stderr logging is readable
   - Confirm metadata-only responses

4. **Documentation**:
   - Operation appears in operation registry
   - Listed in main tool enum
   - Examples added to docs if needed

## Progress Tracking

Use this checklist as operations are restored:

### Core Operations (7 total)
- [x] scientific-method
- [x] debugging-approach
- [x] mental-model
- [x] metacognitive-monitoring
- [ ] sequential-thinking
- [ ] creative-thinking
- [ ] visual-reasoning

### Collaborative Operations (5 total)
- [ ] collaborative-reasoning
- [ ] decision-framework
- [ ] socratic-method
- [ ] structured-argumentation
- [ ] systems-thinking

### Analysis Operations (9 total)
- [ ] research
- [ ] analogical-reasoning
- [ ] causal-analysis
- [ ] statistical-reasoning
- [ ] simulation
- [ ] optimization
- [ ] ethical-analysis
- [ ] mdp-planning
- [ ] decision-networks

### Pattern Operations (5 total)
- [ ] tree-of-thought
- [ ] beam-search
- [ ] mcts
- [ ] graph-of-thought
- [ ] orchestration-suggest

### Other Categories
- [ ] Notebook operations (4)
- [ ] Session operations (3)
- [ ] Metagame operations (2)
- [ ] UI operations (2)
- [ ] Special operations (3)

## Maintenance Guidelines

### When Adding New Operations

1. Copy the standard structure from this document
2. Implement all required methods before registration
3. Write getToolDescription() with rich AI guidance
4. Test with MCP Inspector before committing
5. Update all relevant documentation

### When Modifying Existing Operations

1. Never remove getToolDescription() - operations become useless to AI
2. Maintain backward compatibility in parameter schemas
3. Update tool descriptions if behavior changes
4. Test thoroughly - especially if changing validation logic

### Code Quality Standards

- **Validation**: Every parameter must be validated with descriptive errors
- **Logging**: Always provide human-readable stderr output (toggleable)
- **Metadata**: Return only progress/status info, never echo prompts
- **Descriptions**: Front-load "when to use", explain parameters in context
- **Structure**: Follow the standard template - makes codebase maintainable

## Tools and Resources

### MCP Inspector
```bash
npx @modelcontextprotocol/inspector npx -y clearthought-onepointfive
```

### Environment Variables
```bash
# Disable logging for specific operations
export DISABLE_THOUGHT_LOGGING=true
export DISABLE_MENTAL_MODEL_LOGGING=true
export DISABLE_VISUAL_LOGGING=true
export DISABLE_METACOGNITIVE_LOGGING=true
```

### Reference Implementations
- Model Enhancement MCP Guide: `/.claude/skills/model-enhancement-mcp/`
- Working examples: `src/tools/operations/core/scientific-method.ts`
- Base classes: `src/tools/operations/base.ts`

## Next Steps

1. Complete core operations restoration (3 remaining)
2. Audit collaborative operations
3. Audit analysis operations
4. Create automated test suite
5. Update main documentation with all operations

---

**Document Owner**: Clear Thought Development Team
**Last Updated**: 2025-10-18
**Next Review**: After core operations restoration
