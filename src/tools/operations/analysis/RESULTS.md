# Analysis Operations - Audit Results

## Overview
This directory contains 9 operations for analytical reasoning tasks. **Critical Issue**: All operations violate model enhancement principles by performing analysis themselves instead of providing structured frameworks for the AI to use.

## TypeScript Errors

All operations have the same error:
```
error TS2339: Property 'prompt' does not exist on type 'OperationContext'
```

### Files Affected:
1. `analogical-reasoning.ts` (line 15)
2. `causal-analysis.ts` (line 20)
3. `decision-networks.ts` (line 74)
4. `ethical-analysis.ts` (line 15)
5. `mdp-planning.ts` (line 55)
6. `optimization.ts` (line 15)
7. `research.ts` (line 15)
8. `simulation.ts` (line 15)
9. `statistical-reasoning.ts` (line 20)

### Fix Required:
Replace all instances of:
```typescript
const { sessionState, prompt, parameters } = context;
```

With:
```typescript
const { sessionState, parameters } = context;
```

Then get prompt from parameters if needed:
```typescript
const prompt = this.getParam(parameters, "prompt", "");
```

---

## Model Enhancement Compliance

### ❌ **MAJOR VIOLATIONS** - All Operations

**Problem**: These operations perform analysis and reasoning themselves, violating the fundamental principle:

> "The agent performs reasoning. The server provides structure."

### Examples of Violations:

#### 1. **causal-analysis.ts**
- ❌ Generates causal graphs automatically (line 96-139)
- ❌ Analyzes interventions itself (line 166-192)
- ❌ Calculates path strengths (line 305-316)
- ❌ Identifies confounders (line 225-237)
- ❌ Generates recommendations (line 346-366)

**What it should do**: Provide structured journal for tracking causal relationships that the AI discovers

#### 2. **decision-framework.ts** (collaborative/)
- ❌ Generates alternatives automatically (line 66-82)
- ❌ Generates criteria (line 84-103)
- ❌ Applies frameworks and scores (line 105-210)
- ❌ Generates recommendations (line 212-246)

**What it should do**: Structured journal for decision-making process

#### 3. **optimization.ts**
- ❌ Performs actual optimization calculations
- ❌ Runs grid/hill climbing algorithms
- ❌ Evaluates objective functions

**What it should do**: Track optimization hypotheses and results from AI's reasoning

---

## Recommended Actions

### 🔧 **Immediate Fixes** (All Operations)

1. **Fix TypeScript errors**:
   - Remove `prompt` from context destructuring
   - Get prompt from parameters instead

2. **Add proper tool descriptions**:
   - Implement `getToolDescription()` method (currently using default stub)
   - Provide rich guidance on when/how to use
   - Explain parameter meanings in context

### 🏗️ **Architectural Refactoring** (Required for Model Enhancement Compliance)

Each operation needs to be refactored from **"doing the analysis"** to **"tracking the analysis"**:

#### Pattern: Structured Journal
```typescript
// WRONG (current):
private analyzeIntervention(graph, intervention) {
  // Server calculates effects
  const effects = this.calculateEffects(...);
  return effects;
}

// RIGHT (model enhancement):
interface CausalAnalysisEntry {
  entry: string;              // AI's reasoning about the causal relationship
  entryNumber: number;
  relationship: {             // Structure for what AI discovered
    from: string;
    to: string;
    strength: number;         // AI provides this
    reasoning: string;        // AI explains why
  };
  intervention?: {
    variable: string;
    expectedEffect: string;   // AI predicts
    reasoning: string;
  };
}
```

### 📋 **Specific Changes Needed**

| Operation | Current Behavior | Should Be |
|-----------|------------------|-----------|
| `causal-analysis` | Builds graphs, calculates effects | Tracks AI's causal discoveries |
| `decision-framework` | Generates & scores alternatives | Tracks AI's decision reasoning |
| `optimization` | Runs optimization algorithms | Tracks AI's optimization attempts |
| `simulation` | Executes simulations | Tracks AI's simulation design & results |
| `analogical-reasoning` | Finds analogies | Tracks AI's analogy exploration |
| `ethical-analysis` | Applies ethical frameworks | Tracks AI's ethical reasoning |
| `statistical-reasoning` | Performs calculations | Tracks AI's statistical interpretations |
| `research` | Conducts research | Tracks AI's research process |
| `decision-networks` | Builds decision networks | Tracks AI's decision modeling |

---

## Implementation Priority

### Phase 1: Critical Fixes (Do First)
- [ ] Fix all TypeScript `prompt` errors (9 files)
- [ ] Add `getToolDescription()` to all operations

### Phase 2: Model Enhancement Refactoring
- [ ] Convert `causal-analysis` to Structured Journal pattern
- [ ] Convert `decision-framework` to Structured Journal pattern
- [ ] Convert remaining 7 operations

### Phase 3: Documentation
- [ ] Update examples in `/src/resources/examples/` to match actual operations
- [ ] Add examples showing proper usage of refactored operations

---

## Reference Implementation

See `/src/tools/operations/core/sequential-thinking.ts` for a correct implementation of the Structured Journal pattern:
- ✅ Validates structure only, not quality
- ✅ Returns metadata only, not content
- ✅ Logs to stderr for human visibility
- ✅ Tracks state without reasoning
- ✅ Rich tool description with guidance

---

## Status Summary

| Metric | Count |
|--------|-------|
| **Total Operations** | 9 |
| **TypeScript Errors** | 9 (100%) |
| **Model Enhancement Violations** | 9 (100%) |
| **Missing Tool Descriptions** | 9 (100%) |
| **Ready for Production** | 0 (0%) |

**Overall Status**: 🔴 **Critical** - Requires complete refactoring
