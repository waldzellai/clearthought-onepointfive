---
description: Convert a Clear-Thought operation to use structured journal pattern with automated validation
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, mcp__container-use__*
model: claude-sonnet-4-5-20250929
---

# Convert Operation to Structured Journal Pattern

**CRITICAL PRINCIPLE**: The server does NOT reason. The agent performs reasoning, the server provides structure.

You are converting a Clear-Thought MCP operation to use the **structured journal** implementation pattern. This command provides an **interactive, automated workflow** that:

- ✅ Uses container-use for isolated testing
- ✅ Runs vaporware detection automatically
- ✅ Creates checkpoint commits at each phase
- ✅ Validates with MCP Inspector
- ✅ Guides you through design decisions

## Workflow Overview

This is a **guided, interactive process** with automated validation at each step:

```
1. Setup Environment (automated)
2. Analysis & Design (interactive)
3. Implementation (automated scaffolding + your customization)
4. Validation (automated testing)
5. Integration (automated registration + manual review)
```

---

## Phase 1: Setup Environment (AUTOMATED)

### Step 1.1: Create Container Environment

**Action**: I will automatically create an isolated container-use environment for this operation.

```bash
# This happens automatically - you'll see:
# ✓ Environment created: <env_id>
# ✓ Working directory: /workspace
# ✓ Git repository cloned
```

### Step 1.2: Install Dependencies

**Action**: I will install all dependencies in the isolated environment.

### Step 1.3: Read Reference Materials

**Action**: I will read these files to understand the pattern:

- `src/tools/operations/core/scientific-method.ts` - Reference implementation
- `src/tools/operations/core/debugging-approach.ts` - Another working example
- `src/tools/operations/base.ts` - Base classes and interfaces
- `.claude/skills/model-enhancement-mcp/` - Core principles

---

## Phase 2: Analysis & Design (INTERACTIVE)

### Step 2.1: Analyze Current Operation

**Action**: I will read the target operation file and analyze:

**I need you to tell me which operation to convert:**
- What is the operation name? (e.g., "sequential-thinking", "creative-thinking")
- Where is it located? (path to the file)

**After you provide this, I will analyze:**

1. **Current State**:
   - What parameters does it accept?
   - What does it claim to do vs. what it actually does?
   - Are there vaporware anti-patterns? (placeholder returns, prompt echoing, fake pattern selection)

2. **Vaporware Detection** (automated):
   - [ ] Placeholder returns (`{ placeholder: true }`)
   - [ ] Prompt echoing (returning user input verbatim)
   - [ ] Fake pattern selection (selecting patterns that don't execute)
   - [ ] Large responses (>100 tokens)
   - [ ] Missing terminal logging
   - [ ] Weak validation

**Output**: Analysis report showing current state and required changes.

### Step 2.2: Design the Journal Schema (INTERACTIVE)

**This is where I need your input:**

For this operation, what are the "journal entries"? I'll ask you questions like:

- What is the primary content of each entry? (e.g., "thought", "hypothesis", "idea")
- What progress metadata do we track? (entry numbers, phases, states)
- What operation-specific fields are needed? (e.g., "technique" for creative-thinking, "approach" for debugging)
- Should it support revisions? Branching?

**Example**:
```typescript
interface VisualReasoningData {
  entry: string;              // The visual analysis description
  entryNumber: number;        // Progress: 1, 2, 3...
  totalEntries: number;       // Estimated total
  nextEntryNeeded: boolean;   // Continue flag

  // Operation-specific
  spatialRelations?: string[];
  patterns?: string[];
  transformations?: string[];

  // Standard journal features
  isRevision?: boolean;
  revisesEntry?: number;
  branchFromEntry?: number;
  branchId?: string;
}
```

**Output**: Finalized TypeScript interface for the operation data.

### Step 2.3: Design the Tool Description (INTERACTIVE)

**This is the MOST IMPORTANT PART** - it guides AI behavior.

I'll help you craft the description by asking:

1. **When to use this tool**: What specific scenarios/use cases?
2. **Key features**: What makes this operation unique?
3. **Parameters explained**: What does each parameter mean in context?
4. **Workflow steps**: How should the AI use this step-by-step?

**Template**:
```
A structured tool for [PURPOSE] through [METHODOLOGY].

When to use this tool:
- [Use case 1]
- [Use case 2]
- [Use case 3]

Key features:
- [Feature 1]
- [Feature 2]

Parameters explained:
- entry: [What it represents for this operation]
- [operation-specific params]

You should:
1. [Step-by-step workflow]
```

**Output**: Complete tool description ready to implement.

---

## Phase 3: Implementation (AUTOMATED SCAFFOLDING + YOUR CUSTOMIZATION)

### Step 3.1: Create Base Structure (AUTOMATED)

**Action**: I will generate the boilerplate code:

```typescript
/**
 * [Operation Name] Operation - Structured Journal Pattern
 */

import chalk from "chalk";
import { BaseOperation, type OperationContext, type OperationResult } from "../base.js";

interface [OperationName]Data {
  // [Generated from Step 2.2]
}

export class [OperationName]Operation extends BaseOperation {
  name = "[operation_name]";
  category = "[category]";

  private entryHistory: [OperationName]Data[] = [];
  private branches: Record<string, [OperationName]Data[]> = {};
  private disableLogging = (process.env.DISABLE_[OPERATION]_LOGGING || "").toLowerCase() === "true";

  // Methods will be generated...
}

export default new [OperationName]Operation();
```

### Step 3.2: Implement Validation (AUTOMATED)

**Action**: I will generate strict validation based on your schema:

```typescript
private validateData(input: unknown): [OperationName]Data {
  const data = input as Record<string, unknown>;

  if (!data.entry || typeof data.entry !== "string") {
    throw new Error("Invalid entry: must be a string describing [WHAT]");
  }
  // ... all field validation with descriptive errors

  return { /* validated data */ };
}
```

### Step 3.3: Implement Terminal Formatting (CUSTOMIZATION NEEDED)

**Action**: I will generate a template, but **you should customize**:
- Choose an emoji for the operation (🔬 for scientific, 🐛 for debugging, etc.)
- Choose chalk color (blue, magenta, cyan, etc.)
- Decide what metadata to show in the header

```typescript
private formatEntry(data: [OperationName]Data): string {
  // Generated template - customize emoji/colors
  let prefix = chalk.[COLOR]("[EMOJI] [Name]");
  // ... formatting logic
}
```

### Step 3.4: Implement Execute Method (AUTOMATED)

**Action**: I will implement the standard execute pattern:

```typescript
async execute(context: OperationContext): Promise<OperationResult> {
  try {
    const validatedInput = this.validateData(parameters);

    // Auto-adjust totalEntries
    // Store in history
    // Track branches
    // Log to stderr
    // Return metadata

  } catch (error) {
    return this.createError(/* ... */);
  }
}
```

### Step 3.5: Implement getToolDescription (AUTOMATED)

**Action**: I will implement using your design from Step 2.3.

---

## Phase 4: Validation (AUTOMATED TESTING)

### Step 4.1: Run Vaporware Detection (AUTOMATED - BLOCKING)

**Action**: I will run the vaporware detection hook:

```bash
npx tsx .claude/hooks/validate-vaporware.ts < hook-input.json
```

**Checks**:
- [ ] No placeholder returns
- [ ] No prompt echoing
- [ ] No fake pattern selection
- [ ] Response size < 100 tokens
- [ ] Terminal logging present
- [ ] Validation errors are descriptive
- [ ] All code paths functional

**This is BLOCKING** - if it fails, we fix issues before proceeding.

### Step 4.2: Run TypeScript Type Check (AUTOMATED)

**Action**: I will verify TypeScript compilation:

```bash
npm run typecheck
```

### Step 4.3: Manual Review Checkpoint (INTERACTIVE)

**Action**: I will show you the complete implementation and ask:

1. Does the terminal output look good?
2. Are the validation errors clear?
3. Is the tool description comprehensive?
4. Should we adjust anything before testing?

### Step 4.4: Test with MCP Inspector (SEMI-AUTOMATED)

**Action**: I will build the server and provide test commands:

```bash
npm run build
npx @modelcontextprotocol/inspector npx -y clearthought-onepointfive
```

**Test Cases** (I'll guide you through):
1. **Basic usage**: Call with valid parameters
2. **Validation**: Call with missing/invalid parameters
3. **Revision**: Test isRevision functionality
4. **Branching**: Test branch tracking
5. **Auto-adjustment**: Test totalEntries adjustment

**You will manually verify** in MCP Inspector that:
- Tool appears in list
- Tool description is clear
- Parameters are validated
- Responses are minimal (<100 tokens)
- Terminal logging appears in stderr
- Errors are descriptive

### Step 4.5: Run MCPJam Evals (AUTOMATED - CRITICAL)

**Action**: I will create and run MCPJam evals to test real server-client interaction.

**Reference**: See `docs/MCPJAM_EVALS_TESTING_GUIDE.md` and `.claude/checklists/mcp-evals-test-checklist.md`

**Step 4.5.1: Create Test Configuration**

I will create `evals-cli-starter/tests-[operation-name].json`:

```json
[
  {
    "title": "[Operation] - Basic Usage",
    "query": "Use [operation] to [simple task]",
    "runs": 3,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation_name]"]
  },
  {
    "title": "[Operation] - Multi-step",
    "query": "Use [operation] to [complex task requiring multiple entries]",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation_name]"]
  },
  {
    "title": "[Operation] - Revision",
    "query": "Use [operation] to [task]. Make 3 entries, then revise entry 2.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation_name]"]
  },
  {
    "title": "[Operation] - Branching",
    "query": "Use [operation] to [task]. Make 3 entries, then explore alternative from entry 2.",
    "runs": 2,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation_name]"]
  },
  {
    "title": "[Operation] - Error Handling",
    "query": "Use [operation] but skip entry 2 and go straight to entry 5",
    "runs": 1,
    "model": "anthropic/claude-sonnet-4.5",
    "provider": "openrouter",
    "expectedToolCalls": ["[operation_name]"]
  }
]
```

**Step 4.5.2: Run Evals**

```bash
cd evals-cli-starter
mcpjam evals run -t tests-[operation-name].json -e environment.json -l llms.json
```

**Expected Output**:
```
✓ [Operation] - Basic Usage (3/3 runs passed)
✓ [Operation] - Multi-step (2/2 runs passed)
✓ [Operation] - Revision (2/2 runs passed)
✓ [Operation] - Branching (2/2 runs passed)
✗ [Operation] - Error Handling (0/1 - expected error)

Summary:
- Total tests: 5
- Passed: 4
- Expected failures: 1
- Success rate: 100% (accounting for expected errors)
```

**What We Verify**:
- [ ] Claude discovers and uses the tool correctly
- [ ] Tool description guides AI behavior
- [ ] Parameters are provided correctly
- [ ] Responses are minimal (<100 tokens)
- [ ] Multi-turn state persists
- [ ] Revisions work
- [ ] Branching works
- [ ] Error messages are actionable

**This is BLOCKING** - if evals fail, we debug and fix before proceeding.

**Step 4.5.3: Debug Failures (if needed)**

If tests fail, I will:
1. Review eval output for specific errors
2. Identify root cause (tool description, validation, response format, etc.)
3. Fix the issue
4. Re-run evals
5. Repeat until all tests pass

---

## Phase 5: Integration (AUTOMATED + MANUAL REVIEW)

### Step 5.1: Register Operation (AUTOMATED)

**Action**: I will add the operation to the registry:

**File**: `src/tools/operations/index.ts`
```typescript
import [operationName] from "./[category]/[operation-name].js";

// In registerAllOperations():
operationRegistry.register([operationName]);
```

**File**: `src/tools/index-refactored.ts`
```typescript
export const ClearThoughtParamsSchema = z.object({
  operation: z.enum([
    // ... existing operations
    "[operation_name]",  // <-- Added
  ])
});
```

### Step 5.2: Update Documentation (AUTOMATED)

**Action**: I will update:
- `src/index.ts` tool description (add to operation list)
- Create example resource if applicable
- Update README if needed

### Step 5.3: Create Checkpoint Commit (AUTOMATED)

**Action**: I will create a checkpoint commit:

```bash
git add -A
git commit --no-verify -m "feat: convert [operation-name] to structured journal pattern

- Implemented structured journal with validation
- Added getToolDescription() with comprehensive AI guidance
- Terminal logging with formatted output
- Vaporware detection passed (score: [X]/100)
- Tested with MCP Inspector

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 5.4: Final Review (INTERACTIVE)

**Action**: I will show you a summary:

```
✅ Operation converted: [operation-name]
✅ Vaporware detection: PASSED (score: X/100)
✅ TypeScript: PASSING
✅ MCP Inspector: TESTED
✅ Registered: YES
✅ Documented: YES
✅ Committed: YES

📊 Statistics:
- Lines of code: X
- Response size: <100 tokens
- Validation errors: X descriptive messages
- Terminal output: ✓ Formatted
- Test coverage: Manual

📝 Next Steps:
1. Run full test suite: npm test
2. Update CHANGELOG if needed
3. Consider adding unit tests
4. Ready for PR!
```

---

## Anti-Patterns to Avoid (AUTOMATED DETECTION)

The vaporware detection hook automatically checks for:

1. **Placeholder Dispatch**: ❌ `{ placeholder: true, message: "Would dispatch..." }`
2. **Prompt Echoing**: ❌ Returning user's input verbatim
3. **Fake Pattern Selection**: ❌ Selecting patterns that don't execute
4. **Vaporware Claims**: ❌ Claiming algorithms without implementation
5. **Token Waste**: ❌ Responses >100 tokens
6. **Silent Storage**: ❌ No terminal logging
7. **Weak Validation**: ❌ Silent failures or unclear errors

**These will BLOCK the workflow if detected.**

---

## Container-Use Integration

**Throughout this workflow**, I will use container-use to:

1. **Isolate the environment**: Each conversion happens in a clean container
2. **Test safely**: Run vaporware detection without affecting your working directory
3. **Validate compilation**: Ensure TypeScript compiles in isolation
4. **Run MCP server**: Test the operation in a clean environment

**You'll see output like**:
```
🐳 Creating container environment...
✓ Environment: env-abc123
✓ Working directory: /workspace
✓ Dependencies installed
✓ Ready for conversion
```

**After completion**, the changes are applied to your actual repository.

---

## Usage

To use this command:

1. **Start the conversion**:
   ```
   /convert-to-journal
   ```

2. **Provide the operation name when prompted**:
   ```
   I'll convert: sequential-thinking
   Located at: src/tools/operations/core/sequential-thinking.ts
   ```

3. **Follow the interactive steps** - I'll guide you through:
   - Analysis
   - Design decisions
   - Customization points
   - Testing
   - Review

4. **Automated steps happen automatically**:
   - Environment setup
   - Code generation
   - Validation
   - Registration
   - Commits

**Estimated time**: 15-30 minutes per operation

---

## Success Criteria Checklist

At the end, this checklist must be ✅:

- [ ] Response size < 100 tokens (excluding errors)
- [ ] No prompt echoing
- [ ] Terminal logging works (stderr)
- [ ] Validation throws descriptive errors
- [ ] All code paths functional (no TODOs/placeholders)
- [ ] Tests pass (manual + vaporware detection)
- [ ] Tool description guides AI behavior effectively
- [ ] getToolDescription() method implemented
- [ ] Registered in operation registry
- [ ] Registered in ClearThoughtParamsSchema enum
- [ ] Storage actually stores data
- [ ] Branches tracked correctly
- [ ] Auto-adjustment works (entryNumber > totalEntries)
- [ ] TypeScript compiles without errors
- [ ] Vaporware detection passes (score ≥ 70/100)

---

## Emergency Rollback

If anything goes wrong, I can rollback using container-use:

```bash
# Discard changes and return to clean state
# (container-use environments are isolated)
```

Or git:
```bash
git reset --hard HEAD^
```

---

## Ready to Start?

When you're ready, tell me:
1. **Which operation to convert** (name and path)
2. **Any special considerations** (unique features, complex parameters, etc.)

I'll then begin the automated workflow, pausing at interactive decision points for your input.

Let's transform vaporware into a fully functional structured journal operation! 🚀
