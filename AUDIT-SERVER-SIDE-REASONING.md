# Server-Side Reasoning Audit Report

## Executive Summary

**Status**: ❌ **CRITICAL VIOLATIONS FOUND**

Multiple operations in `/src/tools/operations/` are performing **server-side reasoning, evaluation, and decision-making** instead of serving as lightweight scaffolding for agent reasoning. This violates the core principle of Model Enhancement MCP servers as outlined in `.claude/skills/model-enhancement-mcp/SKILL.md`.

---

## Core Principle (from SKILL.md)

> **⚠️ CRITICAL PRINCIPLE: The Server Does NOT Reason**
> 
> ### The agent performs reasoning. The server provides structure.
> 
> **What the server does:**
> - ✅ Records reasoning steps (journaling)
> - ✅ Maintains state and history
> - ✅ Validates input format
> - ✅ Returns metadata and progress indicators
> 
> **What the server does NOT do:**
> - ❌ Generate thoughts or reasoning
> - ❌ Decide what the next step should be
> - ❌ Evaluate the quality of the agent's reasoning
> - ❌ Make decisions about problem-solving approaches

---

## Critical Violations

### 1. **Socratic Method Operation** (`src/tools/operations/collaborative/socratic-method.ts`)

**Violation Type**: Server generates questions and reasoning

**Evidence**:
- Lines 67-88: `generateQuestionSequence()` - Server generates questions
- Lines 90-226: Multiple `generate*Questions()` methods - Server creates clarification, assumption, evidence, perspective, implication, and meta questions
- Lines 228-236: `analyzeAssumptions()` - Server categorizes and evaluates assumptions with random scoring
- Lines 238-251: `extractAssumptions()` - Server extracts assumptions from topic

**Example Code**:
```typescript
private generateClarificationQuestions(topic: string, depth: number): any[] {
    return [
        {
            type: "clarification",
            question: `What do you mean when you say "${topic}"?`,
            purpose: "Define key terms and concepts",
            level: 1,
        },
        // ... more generated questions
    ];
}

private analyzeAssumptions(assumptions: string[]): any[] {
    return assumptions.map((assumption, index) => ({
        assumption,
        type: this.categorizeAssumption(assumption),
        questionable: Math.random() > 0.3, // 70% are questionable
        evidence: `Evidence level: ${Math.floor(Math.random() * 5) + 1}/5`,
        alternative: `Alternative to: ${assumption}`,
    }));
}
```

**Why This Violates**: The server is generating the Socratic questions and evaluating assumptions. The agent should be formulating its own questions and the server should only record them.

**Correct Approach**: Agent provides the questions it wants to ask, server records them in a structured format.

---

### 2. **Decision Networks Operation** (`src/tools/operations/analysis/decision-networks.ts`)

**Violation Type**: Server performs probabilistic inference and decision optimization

**Evidence**:
- Lines 56-71: Server computes expected utilities for all decisions
- Lines 63-71: Server selects the best decision based on utility maximization
- Lines 231-280: `computeExpectedUtility()` - Full probabilistic inference algorithm
- Lines 243-267: Recursive enumeration over probability distributions

**Example Code**:
```typescript
for (const decision of params.decision.states) {
    const { expectedUtility, rawUtility, evidenceProbability, enumerationCount } =
        this.computeExpectedUtility(decision, params);
    expectedUtilities[decision] = expectedUtility;
    traces.push({ decision, expectedUtility, rawUtility, evidenceProbability, enumerationCount });
}

const bestDecision = Object.entries(expectedUtilities).reduce(
    (best, [decision, utility]) => {
        if (!best || utility > best.utility) {
            return { decision, utility };
        }
        return best;
    },
    undefined as { decision: string; utility: number } | undefined,
);
```

**Why This Violates**: The server is running a complete decision-theoretic solver with probabilistic inference. This is computational reasoning that should be done by the agent or an external tool.

**Correct Approach**: Agent provides its own utility calculations and decision analysis, server records the decision network structure.

---

### 3. **Systems Thinking Operation** (`src/tools/operations/collaborative/systems-thinking.ts`)

**Violation Type**: Server detects feedback loops and analyzes system structure

**Evidence**:
- Lines 24-26: Server automatically detects feedback loops if not provided
- Lines 54-90: `detectFeedbackLoops()` - Graph cycle detection algorithm

**Example Code**:
```typescript
// Simple feedback loop detection from relationships if not provided
if (feedbackLoops.length === 0 && relationships.length > 0) {
    feedbackLoops = this.detectFeedbackLoops(relationships);
}

private detectFeedbackLoops(relationships: any[]): any[] {
    const feedbackLoops: any[] = [];
    const graph = new Map<string, Set<string>>();
    
    // Build adjacency graph
    relationships.forEach((rel: any) => {
        if (!graph.has(rel.from)) graph.set(rel.from, new Set());
        graph.get(rel.from)!.add(rel.to);
    });
    
    // Simple cycle detection (depth 2-3)
    for (const [start, targets] of graph.entries()) {
        // ... cycle detection logic
    }
}
```

**Why This Violates**: The server is performing graph analysis to identify system patterns. The agent should identify feedback loops through its own reasoning.

**Correct Approach**: Agent identifies and describes feedback loops, server records them.

---

### 4. **Analogical Reasoning Operation** (`src/tools/operations/analysis/analogical-reasoning.ts`)

**Violation Type**: Server generates insights and suggests next steps

**Evidence**:
- Lines 220-252: `generateInsights()` - Server analyzes mapping patterns and generates insights
- Lines 254-299: `generateNextSteps()` - Server decides what the agent should do next

**Example Code**:
```typescript
private generateNextSteps(data: AnalogyEntry, allMappings: AnalogyEntry[]): string[] {
    const steps: string[] = [];
    const { mappings } = data.analogy;
    
    // Strengthen weak mappings
    const weakMappings = mappings.filter((m) => m.strength < 0.5);
    if (weakMappings.length > 0) {
        steps.push(
            `Strengthen ${weakMappings.length} weak mapping(s) by finding more correspondences`,
        );
    }
    
    // Add missing mapping types
    const existingTypes = new Set(mappings.map((m) => m.mappingType).filter(Boolean));
    const allTypes: Array<"role" | "structure" | "behavior" | "constraint"> = [
        "role", "structure", "behavior", "constraint",
    ];
    const missingTypes = allTypes.filter((t) => !existingTypes.has(t));
    if (missingTypes.length > 0) {
        steps.push(`Explore ${missingTypes.join(", ")} mappings to deepen the analogy`);
    }
    
    // Apply to predictions
    const avgStrength = mappings.reduce((sum, m) => sum + m.strength, 0) / mappings.length;
    if (avgStrength > 0.6) {
        steps.push("Apply the analogy to make predictions about the target domain");
    }
}
```

**Why This Violates**: The server is evaluating the quality of analogies (weak vs strong mappings) and prescribing what the agent should do next. This is reasoning about the reasoning process.

**Correct Approach**: Server records analogies as provided by agent, returns metadata (counts, IDs), agent decides its own next steps.

---

### 5. **Orchestration Suggest Operation** (`src/tools/operations/patterns/orchestration-suggest.ts`)

**Violation Type**: Server analyzes tasks and recommends tools

**Evidence**:
- Lines 54-55: Server suggests tools based on task analysis
- Lines 67-99: `suggestTools()` - Keyword-based tool recommendation engine

**Example Code**:
```typescript
private suggestTools(prompt: string): string[] {
    const promptLower = prompt.toLowerCase();
    const tools: string[] = [];
    
    // Start with sequential thinking for most tasks
    tools.push("sequential_thinking");
    
    // Add specialized tools based on keywords
    if (promptLower.includes("debug") || promptLower.includes("error")) {
        tools.push("debugging_approach");
    }
    if (promptLower.includes("system") || promptLower.includes("complex")) {
        tools.push("systems_thinking");
    }
    if (promptLower.includes("decide") || promptLower.includes("choice")) {
        tools.push("decision_framework");
    }
    // ... more keyword matching
}
```

**Why This Violates**: The server is analyzing the task and making strategic decisions about which tools to use. This is meta-reasoning that should be done by the agent.

**Correct Approach**: This operation should not exist. The agent should decide which tools to use based on tool descriptions.

---

## Operations That Are Compliant ✅

### **Sequential Thinking Operation** (`src/tools/operations/core/sequential-thinking.ts`)

**Why It's Correct**:
- Records thoughts provided by the agent
- Validates input format only
- Returns metadata (entry counts, history length)
- Does NOT generate thoughts or evaluate quality
- Logs to stderr for human inspection (optional)

**Example**:
```typescript
// Agent provides the thought
const validatedInput = this.validateData(context.parameters);

// Server records it
this.entryHistory.push(validatedInput);

// Server returns metadata only
return this.createResult({
    entryNumber: validatedInput.entryNumber,
    totalEntries: validatedInput.totalEntries,
    nextEntryNeeded: validatedInput.nextEntryNeeded,
    historyLength: this.entryHistory.length,
});
```

This is the **gold standard** for how operations should work.

---

## Summary of Violations by Category

| Category | Operation | Violation |
|----------|-----------|-----------|
| collaborative | socratic-method | Generates questions, evaluates assumptions |
| collaborative | systems-thinking | Detects feedback loops automatically |
| analysis | decision-networks | Performs probabilistic inference, selects best decision |
| analysis | analogical-reasoning | Generates insights, suggests next steps |
| patterns | orchestration-suggest | Analyzes tasks, recommends tools |

---

## Recommendations

### Immediate Actions Required

1. **Refactor Violating Operations** to follow the Sequential Thinking pattern:
   - Remove all server-side generation of content (questions, insights, suggestions)
   - Remove all server-side evaluation logic (scoring, quality assessment)
   - Remove all server-side decision-making (best decision selection, tool recommendation)
   - Keep only: validation, recording, metadata return

2. **Update Tool Descriptions** to make clear that:
   - Agent provides ALL reasoning content
   - Server only validates format and records data
   - Agent is responsible for quality and next steps

3. **Remove or Redesign** `orchestration-suggest` operation entirely - this is fundamentally incompatible with the model enhancement pattern

### Pattern to Follow

```typescript
async execute(context: OperationContext): Promise<OperationResult> {
    // 1. Validate input format (structure only, not quality)
    const validatedInput = this.validateData(context.parameters);
    
    // 2. Record the data
    this.history.push(validatedInput);
    
    // 3. Optional: Log to stderr for humans
    if (!this.disableLogging) {
        this.logToStderr(validatedInput);
    }
    
    // 4. Return metadata ONLY (counts, IDs, status)
    return this.createResult({
        entryNumber: validatedInput.entryNumber,
        historyLength: this.history.length,
        // NO insights, NO suggestions, NO evaluations
    });
}
```

---

## Conclusion

The codebase contains **significant violations** of the model enhancement server principles. Multiple operations are acting as reasoning engines rather than structured journals. This needs to be corrected to align with the MCP model enhancement pattern where:

- **Server = Notebook/Whiteboard** (passive recording)
- **Agent = Thinker** (active reasoning)

The server should be "pen and paper" for the AI, not a tutor or collaborator.

