# Collaborative Operations - Audit Results

## Overview
This directory contains 5 operations for collaborative reasoning tasks. **Critical Issue**: All operations violate model enhancement principles by performing reasoning themselves.

## TypeScript Errors

All 5 operations have the same error:
```
error TS2339: Property 'prompt' does not exist on type 'OperationContext'
```

### Files Affected:
1. `collaborative-reasoning.ts` (line 14)
2. `decision-framework.ts` (line 14)
3. `socratic-method.ts` (line 14)
4. `structured-argumentation.ts` (line 14)
5. `systems-thinking.ts` (line 14)

### Fix Required:
```typescript
// WRONG:
const { sessionState, prompt, parameters } = context;

// RIGHT:
const { sessionState, parameters } = context;
const prompt = this.getParam(parameters, "prompt", "");
```

---

## Model Enhancement Compliance

### ❌ **MAJOR VIOLATIONS** - All 5 Operations

These operations perform reasoning and analysis instead of providing structured frameworks.

#### 1. **decision-framework.ts**
**Current Behavior**: ❌ Server does the decision-making
- Generates alternatives automatically (lines 66-82)
- Generates criteria (lines 84-103)
- Applies frameworks and calculates scores
- Generates recommendations with reasoning

**Should Be**: ✅ Structured journal for AI's decision process
```typescript
interface DecisionEntry {
  entry: string;               // AI's reasoning at this step
  entryNumber: number;
  phase: "identify_alternatives" | "define_criteria" | "evaluate" | "decide";
  alternative?: {
    name: string;
    pros: string[];           // AI provides
    cons: string[];           // AI provides
    score: number;            // AI evaluates
    reasoning: string;
  };
}
```

#### 2. **systems-thinking.ts**
**Violation**: Builds system models automatically instead of tracking AI's systems analysis

#### 3. **structured-argumentation.ts**
**Violation**: Structures arguments itself instead of tracking AI's argumentation

#### 4. **socratic-method.ts**
**Violation**: Generates questions instead of tracking AI's Socratic exploration

#### 5. **collaborative-reasoning.ts**
**Violation**: Performs collaborative reasoning instead of tracking it

---

## Required Changes

### 🔧 Phase 1: TypeScript Fixes (All 5 files)
- [ ] Remove `prompt` from context destructuring
- [ ] Get prompt from parameters
- [ ] Add proper `getToolDescription()` methods

### 🏗️ Phase 2: Refactor to Structured Journal Pattern

Each operation should:
1. Accept AI's reasoning as input
2. Validate structure (not quality)
3. Track progress through phases
4. Return metadata only
5. Log to stderr for humans

**Example Refactoring** (`decision-framework.ts`):
```typescript
// Current (WRONG):
async execute(context) {
  const alternatives = this.generateAlternatives(prompt);  // ❌ Server generates
  const criteria = this.generateCriteria(framework);       // ❌ Server generates
  const analysis = this.applyFramework(...);               // ❌ Server analyzes
  return { alternatives, criteria, analysis };
}

// Should Be (RIGHT):
async execute(context) {
  const validated = this.validateEntry(parameters);        // ✅ Validate structure
  this.history.push(validated);                            // ✅ Track in journal
  this.logToStderr(validated);                             // ✅ Human visibility
  return { entryNumber, phase, historyLength };            // ✅ Metadata only
}
```

---

## Implementation Priority

| Operation | Priority | Reason |
|-----------|----------|--------|
| `decision-framework` | **HIGH** | Most commonly used, clear violation |
| `structured-argumentation` | **HIGH** | Core collaborative pattern |
| `systems-thinking` | **MEDIUM** | Complex but important |
| `socratic-method` | **MEDIUM** | Unique pattern |
| `collaborative-reasoning` | **LOW** | Generic, refactor last |

---

## Reference Implementations

### ✅ Good Examples to Follow:
- `/src/tools/operations/core/sequential-thinking.ts` - Structured Journal pattern
- `/src/tools/operations/core/creative-thinking.ts` - Proper tracking without reasoning
- `/src/tools/operations/metagame/ooda-loop.ts` - Phase-based structured journal
- `/src/tools/operations/metagame/ulysses-protocol.ts` - Gates and constraints

### ❌ What NOT to Do:
- Don't generate content (alternatives, questions, arguments)
- Don't calculate scores or evaluate quality
- Don't make decisions or recommendations
- Don't perform analysis

---

## Status Summary

| Metric | Count |
|--------|-------|
| **Total Operations** | 5 |
| **TypeScript Errors** | 5 (100%) |
| **Model Enhancement Violations** | 5 (100%) |
| **Missing Tool Descriptions** | 5 (100%) |
| **Ready for Production** | 0 (0%) |

**Overall Status**: 🔴 **Critical** - Complete refactoring required
