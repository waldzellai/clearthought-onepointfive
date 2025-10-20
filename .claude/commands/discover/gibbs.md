---
allowed-tools: mcp__clear-thought-two__clear_thought, Read, Write, Edit
argument-hint: [num-samples] [burn-in]
description: Gibbs sampling for parameter interaction discovery
model: claude-sonnet-4-5-20250929
---

# Gibbs Sampling for Parameter Interaction Discovery

You are discovering parameter interactions using Gibbs sampling with semantic enhancements.

## Your Mission
Efficiently discover which Clear Thought parameters interact (vs act independently) using adaptive sampling that combines statistical exploration with semantic understanding.

## Parameters
- **Number of Samples**: $1 (default: 30 samples)
- **Burn-in Period**: $2 (default: 5 samples to reach steady state before analysis)

## Agentic Gibbs vs Deterministic Gibbs

**Deterministic Gibbs Sampling**:
```
For iteration t:
  For each parameter i:
    Sample X_i^(t) ~ P(X_i | X_{-i}^(t-1))
```
Mechanically samples from conditional distributions based purely on frequency.

**Agentic Gibbs Sampling** adds:
- **Semantic constraints**: Only sample parameter values that make conceptual sense together
- **Interaction hypothesis generation**: When anomalies detected, form causal theories about WHY
- **Adaptive focus**: Concentrate sampling effort on regions with suspected interactions
- **Emergent behavior recognition**: Distinguish genuine interaction effects from noise
- **Causal modeling**: Build causal graph of parameter dependencies (not just correlations)
- **Active learning**: Generate targeted tests to confirm/refute interaction hypotheses

## Clear Thought Parameters (9-dimensional space)

1. **thoughtNumber**: Position in reasoning sequence (1 to totalThoughts)
2. **totalThoughts**: Estimated total steps needed
3. **nextThoughtNeeded**: Boolean - continue thinking?
4. **isRevision**: Boolean - is this thought revising a previous one?
5. **revisesThought**: Number - which thought is being revised (if isRevision=true)
6. **branchFromThought**: Number - branching point (if creating branch)
7. **branchId**: String - branch identifier (if in branch)
8. **needsMoreThoughts**: Boolean - need to extend totalThoughts?
9. **thought_complexity**: Proxy measured by content length and reasoning depth markers

## Workflow

### Phase 1: Initialize State

Create `test_logs/gibbs_state.json`:
```json
{
  "current_sample": {
    "thoughtNumber": 10,
    "totalThoughts": 20,
    "nextThoughtNeeded": true,
    "isRevision": false,
    "revisesThought": null,
    "branchFromThought": null,
    "branchId": null,
    "needsMoreThoughts": false,
    "thought_complexity": "medium"
  },
  "samples": [],
  "interaction_matrix": {},
  "hypotheses": [],
  "burn_in_complete": false
}
```

### Phase 2: Burn-in Period

For first $2 samples:
- Sample parameters randomly from valid ranges
- Do NOT analyze for interactions yet (reaching steady state)
- Record outcomes but don't update interaction beliefs
- Purpose: Ensure sampling distribution has converged

### Phase 3: Gibbs Sampling Loop

For each sample (after burn-in):

1. **Randomly shuffle parameter order** (prevents systematic bias)

2. **For each parameter i** in shuffled order:

   **a. Condition on current values of all other parameters**
   - Current state: X_{-i} = {all other params with their current values}

   **b. Generate candidate values for parameter i**
   - **Agentic semantic filtering**: Only consider conceptually valid values
     - Example: If `isRevision=false`, set `revisesThought=null` (don't sample invalid values)
     - Example: If `branchFromThought!=null`, must have `branchId!=null`
     - Example: If `thoughtNumber > totalThoughts`, must have `needsMoreThoughts=true`

   **c. Compute conditional sampling distribution**
   - **Deterministic approach**: P(X_i | X_{-i}) based purely on historical frequency
   - **Agentic approach**: P(X_i | X_{-i}) weighted by:
     - **Semantic validity** (0 or 1): Is this combination conceptually valid?
     - **Conceptual likelihood** (0-1): How natural is this configuration?
     - **Exploration bonus** (0-0.3): Boost for under-sampled regions
     - **Interaction focus** (0-0.2): Boost if this helps test suspected interaction

   **d. Sample new value for parameter i**
   - Draw from weighted distribution
   - Update current_sample[i] = sampled_value

   **e. Execute test with complete configuration**
   - Use clear_thought with current parameter configuration
   - Measure outcomes:
     - **Quality** (1-10): How good was the reasoning?
     - **Coherence** (1-10): Did it maintain logical flow?
     - **Success** (boolean): Did it complete without errors?
     - **Observations**: Any notable behaviors?

   **f. Record sample and outcome**
   - Append to samples list: {config, outcomes, iteration}

3. **Interaction Detection** (every 5 samples after burn-in)

   Analyze collected samples for interactions:

   **a. Statistical tests for each parameter pair**:
   - χ² test for independence: Are param_i and param_j independent?
   - If p-value < 0.05: Suspected interaction, investigate further

   **b. Agentic pattern recognition**:
   - Look for conditional effects: "When X=a AND Y=b, outcome Z drops by 40%"
   - Examples to detect:
     - "When `isRevision=true` AND `branchFromThought!=null`, coherence drops significantly"
     - "When `totalThoughts > 50` AND `thought_complexity=high`, quality degrades"
     - "When `needsMoreThoughts=true` AND `revisesThought!=null`, success rate lower"

   **c. Generate causal hypotheses**:
   - For each detected interaction, hypothesize WHY:
     - "Revising within a branch may lose original branch context (context dilution)"
     - "High totalThoughts + complex thoughts may exceed working memory capacity"
     - "Extending while revising may create inconsistent thought history"

   **d. Adjust sampling strategy**:
   - If strong interaction detected: Concentrate next 3-5 samples in that region
   - Test edge cases of the interaction to confirm it's real
   - Vary one parameter at a time to isolate the effect

4. **Update Interaction Matrix**

   Maintain `interaction_strength[param_i][param_j]`:
   - **Strength** (0.0-1.0):
     - 0.0 = independent
     - 0.3 = weak interaction
     - 0.6 = moderate interaction
     - 1.0 = strong interaction

   **Agentic enhancement**: Include explanatory metadata:
   ```json
   {
     "isRevision × branchFromThought": {
       "strength": 0.73,
       "statistical_significance": 0.012,
       "hypothesis": "Revising within a branch loses original branch context",
       "evidence_samples": [12, 18, 24, 29],
       "effect_size": "quality drops 3.2 points (avg)",
       "validated": true
     }
   }
   ```

### Phase 4: Interaction Validation

After sampling complete:

1. **Isolate High-Confidence Interactions**
   - For each interaction with strength > 0.6:
   - Design minimal test that isolates ONLY this interaction
   - Hold all other parameters constant
   - Vary the two interacting parameters systematically
   - Verify effect is reproducible (not sampling artifact)

2. **Test Causal Hypotheses**
   - For each validated interaction:
   - Evaluate proposed causal mechanism
   - Design test to confirm/refute mechanism
   - Example: If hypothesis is "context dilution", test with varying context sizes

3. **Detect Higher-Order Interactions**
   - Check for three-way interactions (rarer but possible):
   - "When X=a AND Y=b AND Z=c, outcome unexpectedly changes"
   - Use conditional independence tests

4. **Build Causal Graph**
   - Nodes: Parameters
   - Edges: Confirmed interactions with labels
   - **Agentic enhancement**: Add causal direction when inferable
     - Example: totalThoughts → thought_complexity (causation, not just correlation)
     - Example: isRevision ⟷ branchFromThought (bidirectional interaction)

5. **Generate Usage Recommendations**
   - Positive recommendations: "Combine X with Y for optimal results"
   - Negative recommendations: "Avoid combining X with Y (causes Z problem)"
   - Conditional recommendations: "Use X with Y only when Z < threshold"

## Output Format

Maintain `test_logs/gibbs_sampling_log.md`:

```markdown
## Sample N (Iteration X, Parameter: Y)
**Current State Before**: {parameter: value, ...}
**Parameter Being Resampled**: Y
**Conditional Distribution**: P(Y | all others)
  - Candidate values: [list with probabilities]
  - **Semantic constraints applied**: [any invalid combinations filtered]
  - **Exploration/focus adjustments**: [any bonuses applied]
  - **Selected value**: [value] (probability: X.XX)

**Execution Result**:
  - Quality: X/10
  - Coherence: X/10
  - Success: true/false
  - Observations: [any notable behaviors]

**Interaction Detected?**: [yes/no]
  - If yes:
    - **Parameters**: [param_i × param_j]
    - **Statistical test**: χ² = X.XX, p = X.XXX
    - **Effect pattern**: [description - "when X and Y, outcome Z changes by W"]
    - **Causal hypothesis**: [why these parameters interact]
    - **Confidence**: [statistical: X%, semantic: X%]
    - **Action**: [how sampling strategy will adapt]

**Sampling Strategy Adjustment**: [if any based on discoveries]
```

Final deliverables:

1. **`PARAMETER_INTERACTION_MAP.md`**:
   - Interaction graph (visual description + JSON)
   - All validated interactions with:
     - Strength scores
     - Statistical significance
     - Effect sizes
     - Causal hypotheses
   - Higher-order interactions (if found)

2. **`USAGE_RECOMMENDATIONS.md`**:
   - **DO's**: Beneficial parameter combinations
   - **DON'Ts**: Harmful parameter combinations
   - **CONDITIONALS**: Context-dependent recommendations
   - **Explanations**: WHY each recommendation (based on causal model)

3. **`CAUSAL_MODEL.json`**:
   - Causal graph structure
   - Validated causal mechanisms
   - Predictive model: config → expected quality

## Success Criteria
- Discover all pairwise interactions with strength > 0.5
- Achieve statistical significance (p < 0.05) for all reported interactions
- Generate causal hypotheses for each validated interaction
- Detect at least 1 three-way interaction (if any exist)
- Validate top 3 interactions with isolated tests
- Complete Phase 2 in <1.5 hours (vs 2-3 hours exhaustive pairwise testing)
- **Bonus**: Build predictive model that estimates quality from parameter configuration

## Meta-Cognitive Notes
- If you detect an interaction, don't just report it—explain WHY you think it exists
- If sampling keeps returning invalid configs, your semantic constraints need refinement
- If no interactions found after 20 samples, parameters may be genuinely independent (good news!)
- If every parameter interacts with every other, you need better conceptual understanding
- The goal is not just correlation detection but causal mechanism understanding
