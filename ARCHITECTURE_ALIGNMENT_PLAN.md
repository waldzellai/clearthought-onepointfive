# Architecture Alignment Plan
## Clear-Thought MCP Server Refactoring

**Branch:** `refactor/operation-scaffolding`  
**Specification:** `specs/clear-thought-aligned-architecture.md`  
**Status:** Ready for approval

---

## Executive Summary

This plan aligns the Clear-Thought MCP server with the architecture specification to transform it from a **prompt storage system** into **structured scaffolding for AI reasoning workflows**.

### Key Changes
1. **Remove placeholder implementations** - Replace "would dispatch" stubs with real operations
2. **Eliminate prompt echoing** - Return only metadata (90% token reduction target)
3. **Add terminal logging** - Human-readable progress on stderr
4. **Implement full operations** - Complete multi-phase workflows with next-step guidance
5. **Unify state management** - Single operation history instead of separate stores

---

## Current State Analysis

### Critical Issues Identified

#### 1. Placeholder Dispatch (sequential-thinking.ts:144-148)
```typescript
// ❌ Current: Does nothing
return {
  placeholder: true,
  message: `Would dispatch to ${mappedOp} operation`,
  pattern,
};
```

#### 2. Prompt Echoing (sequential-thinking.ts:52-66)
```typescript
// ❌ Current: Wastes tokens
return this.createResult({
  selectedPattern: chosenPattern,
  thought: prompt,  // ← Echoes entire prompt back
  ...thoughtData,
  // ... more redundant data
});
```

#### 3. No Terminal Logging
- No stderr output for human monitoring
- No visual progress indicators
- No operation-specific feedback

#### 4. Incomplete Pattern Operations
- `tree_of_thought` → just calls `sequential_thinking` with flag
- `mcts` → just calls `sequential_thinking` with flag  
- `beam_search` → just calls `sequential_thinking` with flag
- `graph_of_thought` → just calls `sequential_thinking` with flag
- **None perform actual algorithmic reasoning**

#### 5. Fragmented State Management
```typescript
// ❌ Current: Separate arrays for everything
private thoughtHistory: ThoughtData[] = [];
private mentalModels: MentalModelData[] = [];
private debuggingSessions: DebuggingSession[] = [];
// ... 10+ more separate arrays
```

---

## Target Architecture

### 1. Enhanced Operation Interface

```typescript
interface Operation {
  name: string;
  category: 'core' | 'patterns' | 'analysis' | 'collaborative' | 'metagame';
  
  execute(context: OperationContext): Promise<OperationResult>;
  getProgress(sessionState: SessionState): ProgressMetadata;
  getNextStep(sessionState: SessionState): NextStepGuidance;
  getToolDescription(): ToolDescription;
}

interface OperationResult {
  operation: string;
  progress: ProgressMetadata;
  nextStep: NextStepGuidance;
  sessionContext: {
    sessionId: string;
    operationHistory: string[];
    remainingBudget: number;
  };
  status: 'in_progress' | 'completed' | 'requires_input' | 'error';
}
```

### 2. Terminal Logger

```typescript
class TerminalLogger {
  logOperationStart(operation: string, params: Record<string, any>): void;
  logStep(operation: string, step: number, total: number, description: string): void;
  logOperationComplete(operation: string, result: OperationResult): void;
}
```

**Example Output:**
```
╔══════════════════════════╗
║ 🌳 tree_of_thought       ║
╚══════════════════════════╝

  🌳 Step 1/3 [████████░░░░░░░░░░░░]
  └─ Generate 3 initial branches at depth 1

  🌳 Step 2/3 [████████████████░░░░]
  └─ Evaluate branch quality (feasibility, completeness, innovation)
```

### 3. Unified Session State

```typescript
interface OperationHistoryEntry {
  id: string;
  timestamp: string;
  operation: string;
  phase: string;
  data: Record<string, any>;
  metadata: {
    stepsCompleted: number;
    status: string;
  };
}

class SessionState {
  private operationHistory: OperationHistoryEntry[] = [];
  private activeOperations: Map<string, OperationState> = new Map();
}
```

---

## Implementation Plan

### Phase 1: Foundation & Infrastructure (5 tasks)

1. **Update base Operation interface** (`src/tools/operations/base.ts`)
   - Add `getProgress()`, `getNextStep()`, `getToolDescription()` methods
   - Update `OperationResult` interface to match spec

2. **Create TerminalLogger utility** (`src/utils/logger.ts`)
   - Implement emoji mapping for operations
   - Add formatted output methods
   - Support `DISABLE_LOGGING` env variable

3. **Update SessionState for unified history** (`src/state/SessionState.ts`)
   - Replace separate arrays with `OperationHistoryEntry[]`
   - Add `activeOperations` Map
   - Implement `addEntry()`, `getOperationState()`, `getHistoryForOperation()`

4. **Remove prompt echoing from all operations**
   - Update all `execute()` methods to return metadata only
   - Remove `thought`, `prompt`, and other redundant fields

5. **Add chalk dependency**
   - `npm install chalk`

### Phase 2: Core Pattern Operations (5 tasks)

1. **Implement TreeOfThought operation fully**
   - Phase 1: Branch Generation (generate N branches)
   - Phase 2: Branch Evaluation (score on feasibility, completeness, innovation)
   - Phase 3: Branch Selection (select top branches for next depth)
   - State: `TreeOfThoughtState` with branches, evaluations, selectedPath

2. **Implement MCTS operation fully**
   - Phase 1: Selection (UCT algorithm)
   - Phase 2: Expansion (generate child actions)
   - Phase 3: Simulation (rollout from node)
   - Phase 4: Backpropagation (update node values)
   - State: `MCTSState` with tree, simulations, history

3. **Implement BeamSearch operation fully**
   - Phase 1: Candidate Generation (generate 2x beam width)
   - Phase 2: Candidate Scoring (score each candidate)
   - Phase 3: Pruning (keep top-k candidates)
   - State: `BeamSearchState` with beam, candidateHistory, pruned

4. **Implement GraphOfThought operation fully**
   - Phase 1: Node Creation (add thought nodes)
   - Phase 2: Relationship Mapping (supports, contradicts, requires, enables, questions)
   - Phase 3: Coherence Analysis (identify contradictions, gaps, clusters)
   - State: `GraphOfThoughtState` with nodes, edges, clusters

5. **Remove placeholder dispatch from sequential_thinking**
   - Replace placeholder with real registry lookup
   - Execute actual operation and return result

### Phase 3: Cognitive Framework Operations (4 tasks)

1. **Implement MentalModel operation with phases**
   - First Principles: identify_assumptions → break_down_to_fundamentals → reconstruct_from_basics → verify_reconstruction
   - Pareto 80/20: identify_inputs → measure_impact → rank_by_leverage → focus_on_vital_few
   - Second Order Thinking: immediate_effects → second_order_effects → nth_order_effects → evaluate_cascades
   - Inversion: state_goal → invert_to_failure → identify_failure_modes → avoid_failure_paths

2. **Implement DecisionFramework operation with phases**
   - Phase 1: Define Options (enumerate all viable options)
   - Phase 2: Identify Criteria (define evaluation factors)
   - Phase 3: Weight Criteria (assign relative importance)
   - Phase 4: Evaluate Options (score each option on each criterion)
   - Phase 5: Analysis & Decision (calculate weighted scores, make recommendation)

3. **Implement SocraticMethod operation**
   - Phase 1: Initial (state claim)
   - Phase 2: Questioning (generate probing questions)
   - Phase 3: Examining (reveal assumptions, find contradictions)
   - Phase 4: Synthesizing (integrate insights)

4. **Implement ScientificMethod operation**
   - Phase 1: Hypothesis (formulate testable hypothesis)
   - Phase 2: Experiment Design (design experiment to test hypothesis)
   - Phase 3: Data Collection (gather observations/data)
   - Phase 4: Analysis (analyze results)
   - Phase 5: Conclusion (accept/reject hypothesis, iterate)

### Phase 4: Testing & Validation (4 tasks)

1. **Create operation functional tests**
   - Complete workflow execution tests
   - Response structure validation
   - Guidance quality verification
   - State management tests
   - Error handling tests

2. **Create integration tests**
   - Multi-operation workflows
   - Terminal logging verification
   - State isolation tests

3. **Validate token efficiency**
   - Measure average response size (target: <100 tokens)
   - Measure max response size (target: <200 tokens)
   - Verify 90% reduction from current state

4. **Update documentation**
   - Update README with new architecture
   - Document each operation's phases
   - Add example sessions
   - Update tool descriptions

---

## Success Criteria

### Quantitative Metrics
- ✅ Average response size: <100 tokens
- ✅ 90% reduction from current state
- ✅ No responses >200 tokens (excluding errors)
- ✅ 0 placeholder returns
- ✅ 100% of operations have functional tests
- ✅ 90%+ code coverage

### Qualitative Metrics
- ✅ Clear next-step guidance in every response
- ✅ Prompts are specific and actionable
- ✅ Terminal logging shows reasoning flow
- ✅ Operations are self-contained
- ✅ Easy to add new operations

---

## Files to Create

1. `src/utils/logger.ts` - TerminalLogger implementation
2. `src/types/operation-state.ts` - State interfaces for all operations
3. `tests/operations/tree-of-thought.test.ts` - TreeOfThought tests
4. `tests/operations/mcts.test.ts` - MCTS tests
5. `tests/operations/beam-search.test.ts` - BeamSearch tests
6. `tests/operations/graph-of-thought.test.ts` - GraphOfThought tests
7. `tests/operations/mental-model.test.ts` - MentalModel tests
8. `tests/operations/decision-framework.test.ts` - DecisionFramework tests
9. `tests/integration/token-efficiency.test.ts` - Token efficiency tests
10. `tests/integration/terminal-logging.test.ts` - Logging tests

## Files to Modify

1. `src/tools/operations/base.ts` - Update Operation interface
2. `src/state/SessionState.ts` - Unified history implementation
3. `src/tools/operations/core/sequential-thinking.ts` - Remove placeholder, remove echoing
4. `src/tools/operations/patterns/tree-of-thought.ts` - Full implementation
5. `src/tools/operations/patterns/mcts.ts` - Full implementation
6. `src/tools/operations/patterns/beam-search.ts` - Full implementation
7. `src/tools/operations/patterns/graph-of-thought.ts` - Full implementation
8. `src/tools/operations/core/mental-model.ts` - Multi-phase implementation
9. `src/tools/operations/collaborative/decision-framework.ts` - Multi-phase implementation
10. `src/tools/operations/collaborative/socratic-method.ts` - Full implementation
11. `src/tools/operations/core/scientific-method.ts` - Full implementation
12. `package.json` - Add chalk dependency

## Files to Delete

None - all existing files will be enhanced, not removed.

---

## Estimated Effort

- **Phase 1:** 4-6 hours
- **Phase 2:** 8-12 hours
- **Phase 3:** 6-8 hours
- **Phase 4:** 4-6 hours
- **Total:** 22-32 hours

---

## Risk Assessment

### Low Risk
- Adding TerminalLogger (new utility, no breaking changes)
- Adding chalk dependency (widely used, stable)
- Creating new test files

### Medium Risk
- Updating Operation interface (affects all operations, but backward compatible)
- Removing prompt echoing (changes response format, but improves it)

### High Risk
- Refactoring SessionState (core state management, needs careful migration)
- Replacing placeholder dispatch (changes execution flow)

### Mitigation Strategies
1. Implement changes incrementally, one phase at a time
2. Run tests after each phase
3. Keep existing functionality working during transition
4. Add feature flags for new behavior if needed

---

## Next Steps

**Awaiting your approval to proceed with implementation.**

Once approved, I will:
1. Start with Phase 1 (Foundation)
2. Implement each task systematically
3. Run tests after each major change
4. Provide progress updates
5. Request your review at phase boundaries

