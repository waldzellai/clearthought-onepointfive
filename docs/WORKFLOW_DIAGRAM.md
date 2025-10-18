# Agentic Workflow Diagrams

## High-Level Workflow

```mermaid
graph TD
    A[Developer] -->|/convert-to-journal| B[Claude Code Slash Command]
    B -->|8-Phase Workflow| C[Edit Operation File]
    C -->|Save File| D[PostToolUse Hook Triggered]
    D -->|Validate| E{Static Analysis}
    E -->|Score >= 70| F[✅ Pass]
    E -->|Score < 70| G[Claude Agent SDK Analysis]
    G -->|Score >= 70| F
    G -->|Score < 70| H[❌ Fail - Exit Code 2]
    H -->|Fix Issues| C
    F -->|Checkpoint| I[Git Commit]
```

## Detailed Validation Flow

```mermaid
flowchart TD
    Start([File Saved]) --> Detect{File in<br/>operations/?}
    Detect -->|No| Skip[Skip Validation]
    Detect -->|Yes| Static[Static Analysis]
    
    Static --> Check1[Check Placeholders]
    Static --> Check2[Check Prompt Echo]
    Static --> Check3[Check TODOs]
    Static --> Check4[Check Logging]
    Static --> Check5[Check Validation]
    
    Check1 --> Score1{Score}
    Check2 --> Score1
    Check3 --> Score1
    Check4 --> Score1
    Check5 --> Score1
    
    Score1 -->|>= 70| Pass[✅ Pass]
    Score1 -->|< 70| Claude[Claude Agent SDK]
    
    Claude --> Semantic[Semantic Analysis]
    Semantic --> LineByLine[Line-by-Line Review]
    LineByLine --> Issues[Identify Issues]
    Issues --> Score2{Final Score}
    
    Score2 -->|>= 70| Pass
    Score2 -->|< 70| Fail[❌ Fail]
    
    Pass --> Exit0[Exit Code 0]
    Fail --> Report[Show Issues]
    Report --> Exit2[Exit Code 2<br/>Block Operation]
    Skip --> Exit0
```

## Validation Scoring System

```mermaid
graph LR
    Start[100 Points] --> Critical{Critical<br/>Failures?}
    Critical -->|Yes| Minus20[-20 per issue]
    Critical -->|No| Token{Token<br/>Efficiency?}
    
    Minus20 --> Token
    Token -->|Issues| Minus15[-15 per issue]
    Token -->|OK| Trans{Transparency?}
    
    Minus15 --> Trans
    Trans -->|Issues| Minus10[-10 per issue]
    Trans -->|OK| Struct{Structural?}
    
    Minus10 --> Struct
    Struct -->|Issues| Minus5[-5 per issue]
    Struct -->|OK| Final{Final Score}
    
    Minus5 --> Final
    Final -->|>= 70| Pass[✅ Pass]
    Final -->|< 70| Fail[❌ Fail]
```

## Anti-Pattern Detection

```mermaid
mindmap
  root((Vaporware<br/>Detection))
    Critical Failures
      Placeholder Returns
        placeholder: true
        Would dispatch
      Prompt Echoing
        Including user input
        Token waste
      Fake Pattern Selection
        Selects but never executes
      Vaporware Claims
        MCTS without implementation
        Tree search without code
      Missing Implementation
        TODO comments
        Unimplemented functions
    Token Efficiency
      Response Size
        > 100 tokens
        Verbose explanations
      Unnecessary Verbosity
        Explanatory text
        Not just metadata
    Transparency
      Silent Storage
        No terminal logging
        No console.error
      Weak Validation
        Silent failures
        No error throwing
      Missing Errors
        Non-descriptive messages
    Structural
      Unused Parameters
        Accepted but not used
      Circular Dependencies
        Operations calling each other
      State Confusion
        Unclear management
```

## Structured Journal Pattern

```mermaid
sequenceDiagram
    participant AI as AI Client
    participant Tool as Operation Tool
    participant Validate as Validation
    participant Storage as History Storage
    participant Terminal as Terminal (stderr)
    participant Response as Response (stdout)
    
    AI->>Tool: Call with parameters
    Tool->>Validate: Validate input
    
    alt Invalid Input
        Validate-->>AI: Throw descriptive error
    else Valid Input
        Validate->>Storage: Store in history
        Storage->>Terminal: Log formatted entry
        Terminal-->>User: Human-readable output
        Storage->>Response: Generate metadata
        Response-->>AI: Minimal JSON (~20 tokens)
    end
```

## Conversion Workflow Phases

```mermaid
gantt
    title Operation Conversion Workflow
    dateFormat X
    axisFormat %s
    
    section Phase 1
    Analysis & Planning           :a1, 0, 1
    
    section Phase 2
    Define Interface              :a2, 1, 1
    
    section Phase 3
    Implement Validation          :a3, 2, 1
    
    section Phase 4
    Implement Storage             :a4, 3, 1
    
    section Phase 5
    Terminal Formatting           :a5, 4, 1
    
    section Phase 6
    Tool Description              :a6, 5, 1
    
    section Phase 7
    Remove Vaporware              :a7, 6, 1
    
    section Phase 8
    Testing                       :a8, 7, 1
```

## Component Architecture

```mermaid
graph TB
    subgraph "Claude Code"
        SC[Slash Command<br/>/convert-to-journal]
        Editor[File Editor]
    end
    
    subgraph "Hook System"
        Config[settings.json]
        Hook[validate-vaporware.ts]
    end
    
    subgraph "Validation"
        Static[Static Analysis<br/>~100ms]
        SDK[Claude Agent SDK<br/>~10-30s]
    end
    
    subgraph "Documentation"
        Guide[AGENTIC_WORKFLOW_GUIDE.md]
        Quick[QUICK_REFERENCE.md]
        Summary[WORKFLOW_SUMMARY.md]
    end
    
    subgraph "Reference"
        SeqThink[sequential-thinking-mcp-index.ts]
        Analysis[how-sequentialthinking-actually-works.md]
        AntiPattern[analysis-clear-thought-actually-does-nothing.md]
    end
    
    SC -->|Guides| Editor
    Editor -->|Save| Config
    Config -->|Triggers| Hook
    Hook -->|Runs| Static
    Static -->|If needed| SDK
    
    SC -.->|References| Guide
    Guide -.->|Links to| Quick
    Guide -.->|Links to| Summary
    
    SC -.->|References| SeqThink
    SC -.->|References| Analysis
    Hook -.->|Checks against| AntiPattern
```

## Data Flow

```mermaid
flowchart LR
    subgraph Input
        Params[Operation Parameters]
    end
    
    subgraph Validation
        TypeCheck[Type Checking]
        RangeCheck[Range Validation]
        Required[Required Fields]
    end
    
    subgraph Processing
        AutoAdj[Auto-Adjustment]
        Storage[History Storage]
        Branch[Branch Tracking]
    end
    
    subgraph Output
        Terminal[Terminal Logging<br/>stderr]
        Response[Metadata Response<br/>stdout]
    end
    
    Params --> TypeCheck
    TypeCheck --> RangeCheck
    RangeCheck --> Required
    Required --> AutoAdj
    AutoAdj --> Storage
    Storage --> Branch
    Branch --> Terminal
    Branch --> Response
```

## Success Criteria Checklist

```mermaid
graph TD
    Start{Operation<br/>Implementation} --> V1{Response<br/>< 100 tokens?}
    V1 -->|No| Fail1[❌ Fail]
    V1 -->|Yes| V2{No prompt<br/>echoing?}
    V2 -->|No| Fail2[❌ Fail]
    V2 -->|Yes| V3{Terminal<br/>logging?}
    V3 -->|No| Fail3[❌ Fail]
    V3 -->|Yes| V4{Descriptive<br/>errors?}
    V4 -->|No| Fail4[❌ Fail]
    V4 -->|Yes| V5{No<br/>placeholders?}
    V5 -->|No| Fail5[❌ Fail]
    V5 -->|Yes| V6{Tests<br/>pass?}
    V6 -->|No| Fail6[❌ Fail]
    V6 -->|Yes| V7{Tool description<br/>guides AI?}
    V7 -->|No| Fail7[❌ Fail]
    V7 -->|Yes| V8{Storage<br/>works?}
    V8 -->|No| Fail8[❌ Fail]
    V8 -->|Yes| V9{Branches<br/>tracked?}
    V9 -->|No| Fail9[❌ Fail]
    V9 -->|Yes| V10{Auto-adjustment<br/>works?}
    V10 -->|No| Fail10[❌ Fail]
    V10 -->|Yes| Pass[✅ Pass]
    
    Fail1 --> Fix[Fix Issues]
    Fail2 --> Fix
    Fail3 --> Fix
    Fail4 --> Fix
    Fail5 --> Fix
    Fail6 --> Fix
    Fail7 --> Fix
    Fail8 --> Fix
    Fail9 --> Fix
    Fail10 --> Fix
    
    Fix --> Start
```

## Hook Execution Timeline

```mermaid
gantt
    title Hook Execution Timeline
    dateFormat X
    axisFormat %Lms
    
    section Detection
    File Change Detected          :0, 10
    
    section Static Analysis
    Read File                     :10, 20
    Regex Checks                  :30, 30
    Structural Analysis           :60, 20
    Score Calculation             :80, 10
    
    section Decision
    Check Score                   :90, 5
    
    section Claude SDK (if needed)
    Initialize SDK                :95, 500
    Send to Claude                :595, 5000
    Receive Analysis              :5595, 2000
    Parse Results                 :7595, 100
    
    section Output
    Format Results                :7695, 50
    Display to User               :7745, 50
    Exit                          :7795, 5
```

## Integration Points

```mermaid
graph LR
    subgraph "Developer Tools"
        VSCode[VS Code]
        Terminal[Terminal]
        Git[Git]
    end
    
    subgraph "Claude Code"
        CC[Claude Code]
        Hooks[Hook System]
    end
    
    subgraph "External Services"
        Anthropic[Anthropic API]
        NPM[NPM Registry]
    end
    
    VSCode -->|Edits| CC
    CC -->|Triggers| Hooks
    Hooks -->|Calls| Anthropic
    Terminal -->|Runs| CC
    Git -->|Commits| VSCode
    NPM -->|Provides| Hooks
```

## Legend

- 🟢 **Green**: Success/Pass
- 🔴 **Red**: Failure/Block
- 🟡 **Yellow**: Warning/Review
- 🔵 **Blue**: Process/Action
- ⚪ **White**: Decision Point

