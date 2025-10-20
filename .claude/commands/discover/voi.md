---
allowed-tools: mcp__clear-thought-two__clear_thought, Read, Write, Edit
argument-hint: [phase] [uncertainty-threshold]
description: VOI-guided discovery of Clear Thought capabilities
model: claude-sonnet-4-5-20250929
---

# Value-of-Information Guided Capability Discovery

You are conducting systematic capability discovery using Value of Information theory with agentic enhancements.

## Your Mission
Execute adaptive hypothesis testing where you:
1. **Maintain uncertainty model**: Track confidence levels for each capability boundary
2. **Compute semantic VOI**: For each potential test, estimate information gain considering:
   - Statistical uncertainty reduction (standard VOI)
   - Semantic impact (does this boundary matter for real use cases?)
   - Interaction potential (could this reveal parameter interactions?)
3. **Select highest-VOI test**: Choose the test that maximally reduces meaningful uncertainty
4. **Execute and update**: Run test, observe results, update belief model
5. **Adapt strategy**: If tests reveal unexpected patterns, generate new hypotheses

## Current Phase: $1
## Uncertainty Threshold: $2 (stop when all boundaries below this confidence level)

## Agentic Enhancements Over Deterministic VOI
- **Contextual prioritization**: You understand which boundaries affect real-world usage
- **Pattern recognition**: You detect when parameter combinations show emergent behavior
- **Adaptive test generation**: You create novel tests based on observed anomalies
- **Early stopping**: You recognize when further testing provides diminishing insight
- **Hypothesis-driven exploration**: You form theories about capability limits and test them

## Workflow

### Initialize Uncertainty Model
Create `test_logs/voi_uncertainty_model.json` with current beliefs about:
- Max thought depth: [50% confidence: 150-250 thoughts]
- Max branches: [30% confidence: 3-8 branches]
- Revision chain depth: [40% confidence: 2-5 revisions]
- Thought number jump size: [20% confidence: 10-1000]
- Parameter validation strictness: [60% confidence: moderate]
- Branch synthesis capability: [35% confidence: 3-5 branches max]
- Revision context preservation: [45% confidence: degrades after 3-4 deep]

### Iterative Discovery Loop
For each iteration:

1. **Compute VOI for candidate tests**
   - List 3-5 potential tests
   - For each, estimate:
     - Uncertainty reduction (0-1 scale): How much does this narrow the confidence interval?
     - Practical relevance (0-1 scale): Do users care about this boundary?
     - Discovery potential (0-1 scale): Could this reveal unexpected interactions?
   - VOI = uncertainty_reduction × relevance × discovery_potential

2. **Select & Execute Highest VOI Test**
   - Clearly state which test and why
   - Use clear_thought to execute
   - Record: test parameters, results, observations, subjective quality assessment

3. **Update Belief Model**
   - Adjust confidence intervals based on results
   - Note any unexpected behaviors
   - Generate new hypotheses if anomalies detected
   - Update interaction suspicions if parameter combinations show non-additive effects

4. **Decide: Continue or Stop?**
   - If max(uncertainty) < threshold: STOP (convergence achieved)
   - If insights suggest new hypothesis space: CONTINUE with adapted strategy
   - If diminishing returns detected: RECOMMEND stopping with rationale
   - If major anomaly discovered: PIVOT to investigate

## Output Format
After each test, update `test_logs/voi_discovery_log.md`:
```markdown
## Test N: [description]
**VOI Score**: X.XX (uncertainty: X.X, relevance: X.X, discovery: X.X)
**Hypothesis**: [what you expect to learn]
**Execution**: [parameters used]
**Result**: [observed behavior - quality, coherence, success/failure]
**Belief Update**: [how this changes confidence intervals]
**New Insights**: [unexpected patterns, generated hypotheses]
**Anomalies**: [any surprising behaviors that warrant investigation]
**Next Best Test**: [highest VOI test for next iteration]
```

## Success Criteria
- Achieve <$2 uncertainty on all critical boundaries
- Discover at least 3 unexpected capability patterns
- Generate validated hypotheses about WHY limits exist where they do
- Complete Phase 1 in <1.5 hours (vs 2-3 hours with binary search)
- Build predictive model of where quality degrades and why

## Meta-Cognitive Notes
- If you find yourself testing boundaries no user would care about, STOP and refocus
- If multiple tests yield similar information, your model needs refinement
- If you're surprised by results, that's HIGH value - investigate why your model was wrong
- The goal is not exhaustive coverage but actionable understanding
