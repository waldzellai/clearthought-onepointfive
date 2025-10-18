# Analogical Reasoning Operation - Structured Journal Conversion

**Date**: 2025-10-18
**Status**: ✅ Complete
**Operation**: `analogical_reasoning`
**Category**: Analysis

## Problem Identified

The original implementation had a **minor violation**:
- Used `prompt` as default value for `targetDomain` parameter (line 19)
- This created a fallback to user input rather than requiring explicit AI reasoning

## Solution: Structured Journal Pattern

Converted to structured journal pattern where:
- AI provides complete analogy structure with explicit domains
- Server validates, tracks, and provides insights
- No default values from user input
- Clear separation: AI discovers, server tracks

## New Interface

```typescript
interface AnalogyEntry {
  entry: string;                    // Description of the analogy
  entryNumber: number;              // Current analogy number
  totalEntries: number;             // Estimated total analogies
  nextEntryNeeded: boolean;         // Whether more analogies needed
  analogy: {
    sourceDomain: string;           // Familiar domain (e.g., "water_flow")
    targetDomain: string;           // Complex domain (e.g., "electrical_current")
    mappings: Array<{
      from: string;                 // Source concept
      to: string;                   // Target concept
      strength: number;             // 0.0-1.0
      mappingType?: "role" | "structure" | "behavior" | "constraint";
    }>;
    reasoning: string;              // Why the analogy works
  };
  isRefinement?: boolean;           // Refining previous analogy
  refinesEntry?: number;            // Entry being refined
}
```

## Example Usage

```typescript
{
  "entry": "Water flow is analogous to electrical current",
  "entryNumber": 1,
  "totalEntries": 3,
  "nextEntryNeeded": true,
  "analogy": {
    "sourceDomain": "water_flow",
    "targetDomain": "electrical_current",
    "mappings": [
      {
        "from": "pressure",
        "to": "voltage",
        "strength": 0.9,
        "mappingType": "role"
      },
      {
        "from": "flow_rate",
        "to": "current",
        "strength": 0.95,
        "mappingType": "behavior"
      },
      {
        "from": "pipe_resistance",
        "to": "electrical_resistance",
        "strength": 0.85,
        "mappingType": "constraint"
      }
    ],
    "reasoning": "Both involve movement of particles through a medium with resistance"
  }
}
```

## Key Changes

### 1. Removed Prompt Dependency
**Before**:
```typescript
const targetDomain = this.getParam(parameters, "targetDomain", prompt);
```

**After**:
```typescript
if (!analogy.targetDomain || typeof analogy.targetDomain !== "string") {
  throw new Error("Invalid analogy.targetDomain: must be a string");
}
```

### 2. Added Structured Validation
- Required entry description
- Required analogy object with all fields
- Validated each mapping structure
- Enforced strength range (0.0-1.0)
- Validated mapping types

### 3. Enhanced Metrics
```typescript
{
  averageStrength: number;
  strongMappingCount: number;      // mappings with strength > 0.7
  mappingTypeCount: number;        // diversity of mapping types
  totalMappings: number;
}
```

### 4. Automatic Insights Generation
- Strength-based assessment (strong/moderate/weak)
- Type-specific insights (role, structure, behavior, constraint)
- Diversity analysis
- Quality indicators

### 5. Terminal Logging
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🔗 Analogy 1/3                                                                 │
├────────────────────────────────────────────────────────────────────────────────┤
│ Water flow is analogous to electrical current                                 │
│                                                                                │
│ Source: water_flow                                                             │
│ Target: electrical_current                                                     │
│ Mappings: 3 mapping(s)                                                         │
│ Avg Strength: 0.90                                                             │
│                                                                                │
│ Mappings:                                                                      │
│   • pressure → voltage (0.90) [role]                                           │
│   • flow_rate → current (0.95) [behavior]                                      │
│   • pipe_resistance → electrical_resistance (0.85) [constraint]                │
│                                                                                │
│ Reasoning: Both involve movement of particles through a medium with...        │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Benefits

### 1. **Explicit Domain Discovery**
- AI must identify both source and target domains
- No fallback to user input
- Forces reasoning about analogy choice

### 2. **Rich Mapping Structure**
- Multiple mapping types supported
- Quantified strength for each mapping
- Clear from→to relationships

### 3. **Quality Assessment**
- Automatic strength calculation
- Type diversity analysis
- Weak mapping identification

### 4. **Progressive Refinement**
- Track refinement relationships
- Build stronger analogies iteratively
- Compare multiple analogies

### 5. **Legacy Compatibility**
- Converts to old `AnalogyMapping` format
- Maintains backward compatibility
- Smooth migration path

## Validation Features

### Required Parameters
- `entry`: Description of the analogy
- `entryNumber`: Current position in sequence
- `totalEntries`: Estimated total (adjustable)
- `nextEntryNeeded`: Whether to continue
- `analogy`: Complete analogy structure

### Analogy Validation
- `sourceDomain`: Must be non-empty string
- `targetDomain`: Must be non-empty string
- `mappings`: Must be array of valid mappings
- `reasoning`: Must be non-empty string

### Mapping Validation
- `from`: Must be string (source concept)
- `to`: Must be string (target concept)
- `strength`: Must be number 0.0-1.0
- `mappingType`: Optional, must be valid type

## Next Steps Generated

The operation automatically suggests:
1. Strengthen weak mappings (< 0.5)
2. Explore missing mapping types
3. Test with counter-examples
4. Apply to predictions (if avg > 0.6)
5. Compare with other analogies

## Testing

Comprehensive test suite covers:
- ✅ All parameter validation
- ✅ Mapping structure validation
- ✅ Strength range validation
- ✅ Type enumeration validation
- ✅ Metrics calculation
- ✅ Insight generation
- ✅ Auto-adjustment of totals
- ✅ Refinement tracking
- ✅ Legacy format conversion

## Files Modified

1. `/workspaces/clearthought-onepointfive/src/tools/operations/analysis/analogical-reasoning.ts`
   - Complete rewrite using structured journal pattern
   - 520 lines of well-documented code

2. `/workspaces/clearthought-onepointfive/tests/operations/analogical-reasoning.test.ts`
   - New comprehensive test suite
   - 450+ lines of tests

## Prompt Violations Resolved

### Original Issue
```typescript
// Line 19: Using prompt as default for targetDomain
const targetDomain = this.getParam(parameters, "targetDomain", prompt);
```

### Resolution
```typescript
// AI must explicitly provide targetDomain
if (!analogy.targetDomain || typeof analogy.targetDomain !== "string") {
  throw new Error("Invalid analogy.targetDomain: must be a string");
}
```

**Result**: ✅ No more prompt defaults. AI must reason about domains explicitly.

## Integration Notes

- Operation is already registered in `/src/tools/operations/index.ts`
- Maintains backward compatibility through legacy format conversion
- Environment variable `DISABLE_ANALOGY_LOGGING` controls terminal output
- Session state integration preserved

## AI Guidance

The tool description guides AI to:
1. Choose clear, relatable source domains
2. Identify 3-5 mappings per analogy
3. Assign honest strength values
4. Provide reasoning for validity
5. Refine weak analogies iteratively
6. Compare multiple analogies
7. Generate predictions from strong analogies

## Success Criteria

- ✅ No prompt parameter defaults
- ✅ AI provides complete analogy structure
- ✅ Server validates all inputs
- ✅ Rich terminal feedback
- ✅ Quality metrics calculated
- ✅ Insights automatically generated
- ✅ Next steps suggested
- ✅ Comprehensive test coverage
- ✅ TypeScript compilation passes
- ✅ Legacy compatibility maintained

## Conclusion

The analogical reasoning operation now follows the structured journal pattern perfectly. The AI discovers analogical relationships and provides complete analogy structures with explicit domains, while the server validates, tracks, and provides rich feedback and insights. The minor violation of using prompt as a default has been eliminated.
