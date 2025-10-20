---
allowed-tools: mcp__clear-thought-two__clear_thought, Read, Write, Glob, Grep, Edit
argument-hint: [benchmark-suite] [exploration-constant]
description: MCTS-based pattern effectiveness validation
model: claude-sonnet-4-5-20250929
---

# Monte Carlo Tree Search for Pattern-Problem Validation

You are executing adaptive pattern discovery using MCTS with semantic enhancements.

## Your Mission
Build a validated capability matrix showing which reasoning patterns excel for which problem classes.

## Parameters
- **Benchmark Suite**: $1 (or use default 15 from CAPABILITY_DISCOVERY_PLAN.md)
- **Exploration Constant**: $2 (default: sqrt(2) ≈ 1.414 for UCB1)

## Agentic MCTS vs Deterministic MCTS

**Deterministic MCTS**:
```
action = argmax(Q[s,a] + c * sqrt(log(N[s]) / N[s,a]))
```
Mechanically selects highest UCB value.

**Agentic MCTS** adds:
- **Semantic state representation**: Problems categorized by meaningful attributes (not just IDs)
- **Pattern similarity awareness**: Recognize when patterns overlap in capability space
- **Quality metrics beyond binary**: Assess elegance, efficiency, coherence holistically
- **Adaptive stopping**: Recognize convergence without exhaustive search
- **Cross-problem transfer**: Apply insights from similar problems to unexplored ones
- **Explanatory modeling**: Generate theories about WHY patterns work where they do

## Benchmark Problems (from CAPABILITY_DISCOVERY_PLAN.md)

| ID | Problem | Complexity | Structure | Domain | Recommended Pattern |
|----|---------|------------|-----------|--------|---------------------|
| 1 | Prove Pythagorean theorem | Moderate | Linear | Math | Backward thinking |
| 2 | Debug failing unit test | Simple | Tree | Code | Forward + hypothesis |
| 3 | Design REST API for e-commerce | Complex | DAG | Code | Backward + branching |
| 4 | Plan 6-month product roadmap | Complex | Linear | Planning | Backward thinking |
| 5 | Compare SQL vs NoSQL for use case | Moderate | Branching | Analysis | Branching + synthesis |
| 6 | Root cause production outage | Moderate | Linear | Debug | Causal chain (5 Whys) |
| 7 | Write creative short story | Simple | Non-linear | Creative | Forward + jumping |
| 8 | Optimize sorting algorithm | Moderate | Linear | Code | Constraint analysis |
| 9 | Make strategic acquisition decision | Complex | Branching | Business | Scenario planning |
| 10 | Refactor legacy codebase | Moderate | Linear | Code | First principles |
| 11 | Design system for 10M users | Complex | DAG | Architecture | Backward + constraint |
| 12 | Resolve team conflict | Moderate | Branching | Social | Dialectical reasoning |
| 13 | Optimize database query performance | Simple | Linear | Performance | Binary search pattern |
| 14 | Research AI safety approaches | Complex | Graph | Research | Forward + meta-cognition |
| 15 | Design experiment to test hypothesis | Moderate | Linear | Scientific | Hypothesis testing |

## Workflow

### Phase 1: Initialize Tree
Create `test_logs/mcts_tree.json`:
```json
{
  "nodes": {
    "root": {
      "problem_classes": ["math", "code", "planning", "debug", "creative"],
      "visits": 0
    }
  },
  "edges": {},
  "Q_values": {},
  "N_visits": {},
  "metadata": {
    "exploration_constant": $2,
    "problems_tested": 0,
    "patterns_discovered": [],
    "pattern_similarity": {}
  }
}
```

### Phase 2: MCTS Loop
For each iteration (until convergence):

1. **Selection (with semantic awareness)**
   - Traverse tree using UCB1: `Q(problem, pattern) + c*sqrt(log(N_problem)/N_pattern)`
   - **Agentic enhancement**: Add semantic similarity boost:
     - If pattern worked well on similar problem, increase UCB by 0.1-0.3
     - Similarity based on problem features (complexity, structure, domain)
   - **Agentic enhancement**: Recognize pattern aliases
     - If "forward thinking" and "sequential thinking" show identical performance, flag as potential aliases

2. **Expansion (intelligent problem selection)**
   - Select next problem to test from benchmark suite
   - **Agentic enhancement**: Choose problems that maximally disambiguate pattern effectiveness
     - Prefer problems where patterns have divergent predicted performance
     - Skip problems obviously similar to well-tested ones
   - **Agentic enhancement**: Generate adversarial problems if needed
     - If two patterns seem identical, design minimal test to distinguish them

3. **Simulation (multi-dimensional quality assessment)**
   - Execute selected pattern on selected problem using clear_thought
   - Track execution metrics:
     - Total thoughts used
     - Branches created (if applicable)
     - Revisions made (if applicable)
     - Time to solution
   - **Agentic quality evaluation** across four dimensions:
     - **Correctness (0-10)**: Did it solve the problem correctly?
     - **Efficiency (0-10)**: Thoughts used vs optimal path (fewer is better)
     - **Coherence (0-10)**: Maintained clear reasoning flow throughout?
     - **Elegance (0-10)**: Found insightful/creative solution path?
   - **Overall quality score**: Average of four dimensions

4. **Backpropagation (belief update with transfer)**
   - Update Q(problem, pattern) using incremental mean:
     - Q_new = Q_old + (quality - Q_old) / N_visits
   - **Agentic enhancement**: Transfer learning to similar problems
     - Update beliefs about similar (untested) problems based on this result
     - Weight by similarity: Q_similar += α * similarity(p1, p2) * (quality - Q_similar)
   - **Agentic enhancement**: Update pattern similarity matrix
     - If unexpected result (pattern performed differently than similar pattern), adjust similarity

5. **Convergence Check**
   - Calculate exploration bonus for all (problem, pattern) pairs
   - **Agentic stopping criteria**:
     - If max(exploration_bonus) < 0.1: All pairs well-explored (converged)
     - If new samples change Q-values by < 0.05: Beliefs stabilized
     - If top 3 patterns per problem class haven't changed in 5 iterations: Converged
   - If not converged, select next (problem, pattern) with highest UCB

### Phase 3: Pattern Validation & Explanation

After MCTS convergence:

1. **Validate Pattern Distinctions**
   - For each pattern pair with correlation > 0.9 (suspected aliases):
     - Design minimal adversarial problem where you hypothesize they'll differ
     - Execute both patterns
     - If performance identical → patterns are aliases (merge)
     - If performance differs → patterns are distinct (explain difference)

2. **Build Explanatory Model**
   - For each problem class, identify top 3 patterns
   - **Agentic enhancement**: Explain WHY these patterns work
     - Backward thinking works for planning because: [causal explanation]
     - Branching works for architecture because: [structural explanation]
   - Generate decision tree: problem_features → recommended_pattern

3. **Create Capability Matrix**
   Output `CAPABILITY_MATRIX.md`:
   ```markdown
   # Clear Thought Pattern Effectiveness Matrix

   ## Problem Class: [name]
   **Top Patterns**:
   1. [Pattern A]: Q=X.XX ± 0.XX (N=Y tests)
      - **Why it works**: [explanation]
      - **When to use**: [conditions]
   2. [Pattern B]: Q=X.XX ± 0.XX (N=Y tests)
      - **Why it works**: [explanation]
      - **When to use**: [conditions]

   **Decision Rule**:
   If [problem features] → use [pattern]
   ```

## Output Format

Maintain `test_logs/mcts_discovery_log.md`:
```markdown
## Iteration N
**Selected**: [problem_class] × [pattern]
**UCB Score**: X.XX (Q: X.X, exploration: X.X, semantic boost: X.X)

**Execution Metrics**:
- Total thoughts: X
- Branches created: X
- Revisions made: X
- Time to solution: X min

**Quality Assessment**:
- Correctness: X/10 [rationale]
- Efficiency: X/10 [thoughts used vs optimal]
- Coherence: X/10 [flow quality]
- Elegance: X/10 [insight quality]
- **Overall**: X.X/10

**Belief Updates**:
- Q(problem, pattern): X.X → X.X
- N(problem, pattern): X → X
- Transfer to similar problems: [list with adjustment amounts]
- Pattern similarity adjustments: [if any]

**Convergence Check**:
- Max exploration bonus: X.XX [threshold: 0.1]
- Q-value stability: X.XX [threshold: 0.05]
- Top patterns stable: [yes/no]
- **Status**: [exploring / settling / converged]

**Next Selection**: [problem × pattern with highest UCB = X.XX]
```

Final deliverables:
- `CAPABILITY_MATRIX.md`: Problem class → pattern recommendations with confidence intervals
- `PATTERN_EXPLANATIONS.md`: WHY patterns work for problem classes (causal/structural theories)
- `PATTERN_ALIASES.md`: Validated pattern distinctions (which are truly different vs synonyms)

## Success Criteria
- Test ≤12 problems (vs 15 exhaustive) via intelligent selection
- Achieve 90% confidence on pattern recommendations
- Discover 3+ unexpected pattern-problem affinities
- Generate explanatory theory of pattern effectiveness (not just "it works")
- Validate all suspected pattern aliases (merge or distinguish)
- Complete Phase 3 in <2 hours (vs 3-4 hours exhaustive testing)

## Meta-Cognitive Notes
- If UCB keeps selecting same patterns, your exploration constant is too low
- If quality assessments seem arbitrary, define clearer rubrics
- If patterns show identical performance everywhere, they're likely aliases
- The goal is not just a matrix, but an explanatory model of pattern effectiveness
