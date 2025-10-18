# UI Operations - Audit Results

## Overview
This directory contains 2 operations for UI generation. **Status**: TypeScript errors and potential model enhancement violations.

## TypeScript Errors

Both operations have the same error:

### 1. **visual-dashboard.ts**
```
Line 15: Property 'prompt' does not exist on type 'OperationContext'
```

### 2. **custom-framework.ts**
```
Line 14: Property 'prompt' does not exist on type 'OperationContext'
```

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

### ❌ **LIKELY VIOLATIONS** - Both Operations

These operations appear to generate UI/visualizations instead of tracking AI's design decisions.

#### 1. **visual-dashboard.ts** - ❌ Probable Violation
**Concern**: Does it generate dashboards or track AI's dashboard design?

**Investigation Needed**:
```typescript
// ❌ BAD (likely current):
private generateDashboard(data) {
  // Server creates visualization
  const charts = this.createCharts(data);
  const panels = this.layoutPanels(charts);
  return dashboard;
}

// ✅ GOOD (should be):
interface DashboardEntry {
  entry: string;           // AI's reasoning
  entryNumber: number;
  component: {
    type: string;          // AI decides: chart, panel, metric
    data: unknown;         // AI provides data structure
    config: unknown;       // AI configures visualization
    reasoning: string;     // AI explains why this visualization
  };
}
```

#### 2. **custom-framework.ts** - ❌ Probable Violation
**Concern**: Does it build frameworks or track AI's framework design?

**Similar Pattern Expected**:
- Server shouldn't generate framework structure
- Should track AI's framework design decisions
- Should validate structure, not evaluate quality

---

## The UI Dilemma

UI operations face a special challenge:

### The Question:
Should the server generate visualizations, or should it track the AI's visualization design?

### Model Enhancement Perspective:
According to the skill, the server should **NOT** generate visualizations itself.

**Instead**:
1. AI designs the visualization (type, data, configuration)
2. Server validates the design structure
3. Server stores the design specification
4. Server returns metadata about what was stored
5. **Actual rendering happens elsewhere** (client-side, external service, etc.)

### Example Flow:
```typescript
// AI calls: visual_dashboard
{
  "entry": "Display revenue trends with line chart showing growth over 4 quarters",
  "entryNumber": 1,
  "visualization": {
    "type": "line_chart",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [{"label": "Revenue", "data": [150, 180, 210, 250]}]
    },
    "config": {
      "title": "Revenue Trends",
      "yAxis": "USD (thousands)",
      "colors": ["#4CAF50"]
    }
  }
}

// Server responds:
{
  "operation": "visual_dashboard",
  "status": "success",
  "entryNumber": 1,
  "visualizationType": "line_chart",
  "historyLength": 1
}

// Visualization specification is logged to stderr for humans
// Actual rendering happens in client that consumes the specification
```

---

## Required Actions

### 🔍 **Phase 1: Investigation** (Priority: HIGH)

Review both operations to determine:
1. Do they generate UI/visualizations themselves?
2. Do they make design decisions (colors, layouts, chart types)?
3. Do they evaluate visualization quality?

### 🏗️ **Phase 2: Refactoring** (Priority: HIGH if violations found)

If violations found, refactor to:
1. Accept visualization specifications from AI
2. Validate specification structure only
3. Store specifications in history
4. Return metadata only
5. Log specifications to stderr

### 🔧 **Phase 3: TypeScript Fixes** (Priority: HIGH)

Fix `prompt` access in both files

### 📚 **Phase 4: Documentation** (Priority: MEDIUM)

Document:
- How to design visualizations with AI
- Specification format for each visualization type
- How to render specifications (separate concern)
- Examples of dashboard design workflows

---

## Visualization Specification Pattern

**Recommended Approach**:

```typescript
interface VisualizationEntry {
  entry: string;              // AI's design reasoning
  entryNumber: number;
  specification: {
    type: "chart" | "dashboard" | "custom";
    format: "rawHtml" | "remoteDom" | "externalUrl";
    components: Array<{
      id: string;
      type: string;           // AI chooses type
      data: unknown;          // AI provides data
      config: unknown;        // AI configures
      reasoning: string;      // AI explains
    }>;
  };
  nextEntryNeeded: boolean;
}

// Server validates structure, tracks in history, returns metadata
// Rendering happens in separate client/service
```

---

## Integration Considerations

If these operations generate UI:

### Option 1: Keep as Infrastructure
**If**: They're more like `code-execution` - taking specifications and rendering them
**Then**: Document clearly that they execute visualization specs, don't design them

### Option 2: Refactor to Structured Journal
**If**: They currently make design decisions
**Then**: Refactor to track AI's design process instead

### Option 3: Hybrid Approach
**Pattern**: AI designs → Server validates → External service renders
```
AI → visual_dashboard (validate spec) → Store spec → Render service → Display
```

---

## Status Summary

| Metric | Value |
|--------|-------|
| **Total Operations** | 2 |
| **TypeScript Errors** | 2 (100%) |
| **Needs Investigation** | 2 (100%) |
| **Likely Violations** | 2 (100%) |
| **Ready for Production** | 0 |

**Overall Status**: 🔴 **Critical** - Likely violations, needs investigation and refactoring

---

## Priority Actions

1. **Investigate both operations** - Do they generate or track?
2. **Review against skill principles** - Server structure vs. agent reasoning
3. **Decide on pattern** - Infrastructure execution vs. design tracking
4. **Refactor if needed** - Convert to Structured Journal if they design
5. **Fix TypeScript errors** - After architecture is confirmed

---

## Key Questions

Before proceeding, answer:
1. Should the server generate visualizations?
2. Or should it track AI's visualization design decisions?
3. Is rendering separate from design?
4. How should specifications be validated?
5. Where does actual rendering happen?

These answers will determine the correct implementation approach.
