# Vaporware Pattern Analysis

**Date**: 2025-10-18
**Analysis**: Complete
**Operations Affected**: ~22 files

## The Common Anti-Pattern

### What We Found

Approximately 22 operations follow this EXACT vaporware pattern:

```typescript
async execute(context: OperationContext): Promise<OperationResult> {
  // ❌ PROBLEM 1: Destructuring non-existent 'prompt'
  const { sessionState, prompt, parameters } = context;

  // ❌ PROBLEM 2: Server generates content instead of AI
  if (findings.length === 0 && prompt) {
    findings = this.generatePlaceholderFindings(prompt);
  }

  // ❌ PROBLEM 3: Prompt echoing
  return this.createResult({
    query: prompt,  // Echoing user input
    findings,       // Server-generated, not AI-generated
    ...verboseContent  // Large response
  });
}

// ❌ PROBLEM 4: Server "reasoning" methods
private generatePlaceholderFindings(prompt: string): Finding[] {
  // Server creating content instead of AI
}
```

### Why This is Vaporware

1. **Server is reasoning** - The server generates perspectives, findings, alternatives, etc.
2. **Prompt echoing** - Returns user's input verbatim
3. **Placeholder content** - Methods literally named "generatePlaceholder"
4. **Large responses** - Verbose output instead of minimal metadata
5. **No validation** - No strict type checking of inputs
6. **No storage** - Just passing through generated content
7. **TypeScript error** - `prompt` doesn't exist in `OperationContext`

**Critical violation**: The server does the reasoning instead of the AI!

---

## The Mechanical Fix

The fix is **identical** for all affected operations:

### Step 1: Remove Prompt Destructuring

```typescript
// BEFORE
const { sessionState, prompt, parameters } = context;

// AFTER
const { parameters } = context;
// OR
const { sessionState, parameters } = context;  // if sessionState is needed
```

### Step 2: Delete All generate* Methods

**Remove entirely**:
- `generatePlaceholderFindings()`
- `generatePerspectives()`
- `generateDefaultPanels()`
- `generateAlternatives()`
- `generatePremises()`
- `generateSubqueries()`
- Any method that creates content from the prompt

**Why**: The AI should generate this content, not the server!

### Step 3: Add Structured Journal Pattern

```typescript
// Add interface
interface [OperationName]Data {
  entry: string;
  entryNumber: number;
  totalEntries: number;
  nextEntryNeeded: boolean;
  // operation-specific fields
  isRevision?: boolean;
  revisesEntry?: number;
  branchFromEntry?: number;
  branchId?: string;
}

// Add storage
private entryHistory: [OperationName]Data[] = [];
private branches: Record<string, [OperationName]Data[]> = {};
private disableLogging = false;

// Add validation
private validateData(input: unknown): [OperationName]Data {
  const data = input as Record<string, unknown>;

  if (!data.entry || typeof data.entry !== "string") {
    throw new Error("Invalid entry: must be a string");
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

  return {
    entry: data.entry,
    entryNumber: data.entryNumber,
    totalEntries: data.totalEntries,
    nextEntryNeeded: data.nextEntryNeeded,
    // ... map other fields
  };
}

// Add formatting
private formatEntry(data: [OperationName]Data): string {
  const { entryNumber, totalEntries, entry, isRevision } = data;

  let prefix = chalk.[color]("[EMOJI] [Name]");
  if (isRevision) {
    prefix = chalk.yellow("🔄 Revision");
  }

  const header = `${prefix} ${entryNumber}/${totalEntries}`;
  const border = "─".repeat(Math.max(header.length, entry.length) + 4);

  return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${entry.padEnd(border.length - 2)} │
└${border}┘`;
}

// Rewrite execute
async execute(context: OperationContext): Promise<OperationResult> {
  const { parameters } = context;

  try {
    const validated = this.validateData(parameters);

    if (validated.entryNumber > validated.totalEntries) {
      validated.totalEntries = validated.entryNumber;
    }

    this.entryHistory.push(validated);

    if (validated.branchFromEntry && validated.branchId) {
      if (!this.branches[validated.branchId]) {
        this.branches[validated.branchId] = [];
      }
      this.branches[validated.branchId].push(validated);
    }

    if (!this.disableLogging) {
      console.error(this.formatEntry(validated));
    }

    return this.createResult({
      entryNumber: validated.entryNumber,
      totalEntries: validated.totalEntries,
      nextEntryNeeded: validated.nextEntryNeeded,
      branches: Object.keys(this.branches),
      historyLength: this.entryHistory.length
    });
  } catch (error) {
    return this.createError(error.message);
  }
}
```

### Step 4: Add getToolDescription()

```typescript
getToolDescription() {
  return {
    name: this.name,
    description: `A structured tool for [PURPOSE] through systematic entries.

This tool provides scaffolding for [METHODOLOGY]. It does NOT generate [CONTENT] -
it provides structure for the AI to [ACTION] step-by-step.

When to use this tool:
- [Use case 1]
- [Use case 2]
- [Use case 3]

Parameters explained:
- entry: Your [OPERATION-SPECIFIC CONTENT]
- entryNumber: Current step number
- totalEntries: Estimated total steps
- nextEntryNeeded: Whether more entries needed

You should:
1. [Workflow step 1]
2. [Workflow step 2]
...`,
    inputSchema: {
      type: "object" as const,
      properties: {
        entry: { type: "string", description: "..." },
        entryNumber: { type: "integer", minimum: 1, description: "..." },
        totalEntries: { type: "integer", minimum: 1, description: "..." },
        nextEntryNeeded: { type: "boolean", description: "..." },
        // ... operation-specific fields
      },
      required: ["entry", "entryNumber", "totalEntries", "nextEntryNeeded"]
    }
  };
}
```

---

## Affected Operations by Category

### Analysis Operations (9)
- `analogical-reasoning.ts` - Generates mappings and insights
- `causal-analysis.ts` - Uses prompt
- `decision-networks.ts` - Uses prompt
- `ethical-analysis.ts` - Uses prompt
- `mdp-planning.ts` - Uses prompt
- `optimization.ts` - Uses prompt
- `research.ts` - **Generates placeholder findings from prompt!**
- `simulation.ts` - Uses prompt
- `statistical-reasoning.ts` - Uses prompt

### Collaborative Operations (5)
- `collaborative-reasoning.ts` - **Generates perspectives from prompt!**
- `decision-framework.ts` - **Generates alternatives from prompt!**
- `socratic-method.ts` - Uses prompt
- `structured-argumentation.ts` - **Generates premises from prompt!**
- `systems-thinking.ts` - Uses prompt

### Pattern Operations (4)
- `beam-search.ts` - Uses prompt
- `graph-of-thought.ts` - Uses prompt
- `mcts.ts` - Uses prompt
- `orchestration-suggest.ts` - Uses prompt

### Notebook Operations (4)
- `notebook-add-cell.ts` - Uses prompt
- `notebook-create.ts` - Uses prompt
- `notebook-export.ts` - Uses prompt
- `notebook-run-cell.ts` - Uses prompt

### UI Operations (2)
- `custom-framework.ts` - **Generates default steps from prompt!**
- `visual-dashboard.ts` - **Generates default panels from prompt!**

### Special Operations (3)
- `code-execution.ts` - Uses prompt
- `orchestration-suggest.ts` - Uses prompt (duplicate)
- `pdr-reasoning.ts` - Uses prompt

### Metagame Operations (2)
- `ooda-loop.ts` - Uses prompt
- `ulysses-protocol.ts` - Uses prompt

---

## Conversion Priorities

### Tier 1: Core Operations (Already Complete!)
- ✅ sequential-thinking
- ✅ debugging-approach
- ✅ mental-model
- ✅ metacognitive-monitoring
- ✅ scientific-method

### Tier 2: High-Value Operations (Iterations 2-5)
- [ ] creative-thinking (almost done, just needs method rename)
- [ ] visual-reasoning (needs full conversion)
- [ ] collaborative-reasoning (common use case)
- [ ] research (frequently used)
- [ ] systems-thinking (valuable framework)

### Tier 3: Specialized Operations
- Pattern operations (tree-of-thought, beam-search, mcts, graph-of-thought)
- Analysis operations (analogical-reasoning, causal-analysis, etc.)
- Notebook operations
- UI operations

---

## Conversion Checklist Template

For each operation:

- [ ] Remove `prompt` from destructuring
- [ ] Delete all `generate*` methods
- [ ] Add `[OperationName]Data` interface
- [ ] Add `entryHistory` and `branches` storage
- [ ] Add `disableLogging` with env variable
- [ ] Implement `validateData()` with strict type checking
- [ ] Implement `formatEntry()` with chalk colors
- [ ] Rewrite `execute()` to use structured journal pattern
- [ ] Add `getToolDescription()` with comprehensive AI guidance
- [ ] TypeScript compiles (for this file)
- [ ] Vaporware detection passes
- [ ] Checkpoint commit created

---

## Estimated Effort

- **Per operation**: 15-30 minutes (with workflow)
- **22 operations**: 5.5 - 11 hours total
- **5 iterations manually**: ~2 hours
- **Batch command**: ~1 hour to create
- **Remaining 17 operations with batch**: ~2-3 hours

**Total estimated time**: ~5-6 hours to restore all operations

---

## Next Actions

1. ✅ Sequential-thinking complete (iteration 1/5)
2. Convert creative-thinking (iteration 2/5)
3. Convert visual-reasoning (iteration 3/5)
4. Convert collaborative-reasoning (iteration 4/5)
5. Convert research (iteration 5/5)
6. Create `/batch-convert-to-journal` command
7. Batch convert remaining 17 operations

**Ready to start iteration 2?**
