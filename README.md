# Clear Thought 1.5 MCP Server

[![smithery badge](https://smithery.ai/badge/@waldzellai/clear-thought-onepointfive)](https://smithery.ai/server/@waldzellai/clear-thought-onepointfive)

A Model Context Protocol (MCP) server that provides a unified reasoning tool with multiple operations, including systematic thinking, mental models, debugging approaches, and interactive notebook capabilities for enhanced problem-solving. This server exposes a single `clear_thought` tool with a comprehensive suite of operations to facilitate complex reasoning tasks, plus interactive Srcbook notebook resources.

## 🚀 New: Modular Architecture

The codebase has been completely refactored from a monolithic 2867-line file into a clean, modular architecture with 38 separate operations organized by category. Each operation is now self-contained, making the codebase more maintainable, testable, and extensible.

## Operations

The `clear_thought` tool provides the following operations. For detailed information on parameters, please refer to the operations guide resource at `guide://clear-thought-operations`.

### Core Thinking Operations
- **sequential_thinking**: Executes a chain-of-thought process. Can be configured to use different reasoning patterns like 'tree', 'beam', 'mcts', 'graph', or 'auto'.
- **mental_model**: Applies a specified mental model to a problem.
- **debugging_approach**: Guides through a structured debugging process.
- **creative_thinking**: Facilitates idea generation and exploration.
- **visual_reasoning**: Works with diagrams and visual structures.
- **metacognitive_monitoring**: Monitors and assesses the reasoning process itself.
- **scientific_method**: Follows the steps of the scientific method for inquiry.

### Collaborative & Decision Operations
- **collaborative_reasoning**: Simulates a multi-persona discussion to explore a topic from different viewpoints.
- **decision_framework**: Uses a structured framework to analyze options and make decisions.
- **socratic_method**: Employs a question-driven approach to challenge and refine arguments.
- **structured_argumentation**: Constructs and analyzes formal arguments.

### Systems & Analysis Operations
- **systems_thinking**: Models a problem as a system with interconnected components.
- **research**: Generates placeholders for research findings and citations.
- **analogical_reasoning**: Draws parallels and maps insights between different domains.
- **causal_analysis**: Investigates cause-and-effect relationships.
- **statistical_reasoning**: Performs statistical analysis (summary, bayes, hypothesis_test, monte_carlo modes).
- **simulation**: Runs simple simulations.
- **optimization**: Finds the best solution from a set of alternatives.
- **ethical_analysis**: Evaluates a situation using an ethical framework.

### Advanced Operations
- **visual_dashboard**: Creates a skeleton for a visual dashboard.
- **custom_framework**: Allows defining a custom reasoning framework.
- **code_execution**: Executes code in a restricted environment (currently Python only).
- **tree_of_thought, beam_search, mcts, graph_of_thought**: Aliases for `sequential_thinking` with a fixed reasoning pattern.
- **orchestration_suggest**: Suggests a sequence of tools to use for a complex task.

### Session Management
- **session_info**: Get information about the current reasoning session.
- **session_export**: Export session data for persistence.
- **session_import**: Import session data to restore state.

### Metagame Operations
- **ooda_loop**: Implements the OODA (Observe, Orient, Decide, Act) loop methodology.
- **ulysses_protocol**: High-stakes debugging and problem-solving framework.

### Notebook Operations
- **notebook_create**: Create a new interactive Srcbook notebook.
- **notebook_add_cell**: Add cells to an existing notebook.
- **notebook_run_cell**: Execute cells in a notebook.
- **notebook_export**: Export notebook content.

## Choosing an Operation

With a wide range of operations available, it's helpful to have a guide for selecting the best one for your task.

- For **general problem-solving** and step-by-step reasoning, start with `sequential_thinking`.
- To **analyze a problem from a specific viewpoint**, use `mental_model`.
- When **troubleshooting issues**, `debugging_approach` provides a structured workflow.
- To **generate new ideas**, use `creative_thinking`.
- For **complex decisions**, `decision_framework` can help you weigh your options.
- To **simulate a discussion** with multiple perspectives, use `collaborative_reasoning`.
- For **high-stakes debugging**, use `ulysses_protocol` with systematic phases and gates.
- For **rapid decision-making**, use `ooda_loop` for iterative observe-orient-decide-act cycles.
- For **interactive learning**, use notebook operations with Srcbook resources.
- If you're not sure where to start, `orchestration_suggest` can recommend a sequence of operations.

For a complete list of operations and their parameters, refer to the operations guide available as a resource at `guide://clear-thought-operations`.

## Installation

### Installing via Smithery

To install Clear Thought MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@waldzellai/clear-thought-onepointfive):

```bash
npx -y @smithery/cli install @waldzellai/clear-thought-onepointfive --client claude
```

### Manual Installation
```bash
npm install @waldzellai/clear-thought-onepointfive
```

Or run with npx:

```bash
npx @waldzellai/clear-thought-onepointfive
```

### Development Setup
```bash
git clone <repository-url>
cd clearthought-onepointfive
npm install
npx @smithery/cli dev
```

## Usage

All operations are accessed through the `clear_thought` tool. You specify the desired operation using the `operation` parameter.

### Example: Sequential Thinking
```typescript
const response = await mcp.callTool("clear_thought", {
  operation: "sequential_thinking",
  prompt: "How to implement a new feature?",
  parameters: {
    pattern: "chain"
  }
});
```

### Example: Mental Model
```typescript
const response = await mcp.callTool("clear_thought", {
  operation: "mental_model",
  prompt: "Analyze the trade-offs of using a microservices architecture.",
  parameters: {
    model: "first_principles"
  }
});
```

### Example: Ulysses Protocol (High-Stakes Debugging)
```typescript
const response = await mcp.callTool("clear_thought", {
  operation: "ulysses_protocol",
  prompt: "Fix critical authentication failure in production system",
  parameters: {
    stakes: "critical",
    budget: "4 hours"
  }
});
```

### Example: Notebook Operations
```typescript
// Create a new notebook
const createResponse = await mcp.callTool("clear_thought", {
  operation: "notebook_create",
  prompt: "Create a notebook for learning TypeScript",
  parameters: {
    name: "typescript-learning"
  }
});

// Add a cell to the notebook
const addCellResponse = await mcp.callTool("clear_thought", {
  operation: "notebook_add_cell",
  prompt: "Add a code cell demonstrating TypeScript interfaces",
  parameters: {
    notebookId: "typescript-learning",
    cellType: "code",
    content: "interface User { name: string; age: number; }"
  }
});
```

### Example: Statistical Reasoning
```typescript
const response = await mcp.callTool("clear_thought", {
  operation: "statistical_reasoning",
  prompt: "Analyze the performance data of our API endpoints",
  parameters: {
    mode: "summary",
    data: [/* your data here */]
  }
});
```

## Resources

The server provides several resources for enhanced functionality:

### Operations Guide
- **URI**: `guide://clear-thought-operations`
- **Description**: Complete documentation for all operations and their parameters
- **MIME Type**: `text/markdown`

### Interactive Notebooks
- **URI Template**: `notebook:///{name}`
- **Description**: Access Srcbook notebooks for interactive TypeScript/JavaScript execution
- **MIME Type**: `text/markdown`

### Notebook Interaction Guide
- **URI**: `guide://notebook-interaction`
- **Description**: Instructions for working with Srcbook notebooks in MCP
- **MIME Type**: `text/markdown`

## Docker

Build the Docker image:

```bash
docker build -t waldzellai/clear-thought-onepointfive .
```

Run the container:

```bash
docker run -it waldzellai/clear-thought-onepointfive
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Dev server (single entry via CLI): `npx @smithery/cli dev`
4. Build for deployment: `npx @smithery/cli build`

### Available Scripts
- `npm run build:stdio` - Build STDIO server
- `npm run build:http` - Build HTTP server
- `npm run build` - Build both servers
- `npm run dev` - Start development server
- `npm run typecheck` - TypeScript type checking
- `npm run check` - Biome linting and formatting
- `npm run test` - Run tests with Vitest

### Architecture

The codebase follows a modular architecture:

```
src/tools/
├── operations/           # All operations organized by category
│   ├── core/            # Core thinking operations (7)
│   ├── session/         # Session management (3)
│   ├── collaborative/   # Collaborative reasoning (5)
│   ├── analysis/        # Analysis operations (7)
│   ├── patterns/        # Reasoning patterns (5)
│   ├── ui/              # UI operations (2)
│   ├── notebook/        # Notebook operations (4)
│   ├── metagame/        # Advanced frameworks (2)
│   └── special/         # Special operations (3)
├── helpers/             # Helper utilities
│   └── ui-generation.ts # UI generation helpers
└── index.ts             # Main orchestrator
```

Each operation:
- Extends `BaseOperation` class
- Implements the `Operation` interface
- Is self-contained (~100-150 lines)
- Auto-registers on import
- Has consistent error handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details.

## Key Features

### 🧠 **Unified Reasoning Tool**
Single `clear_thought` tool with 30+ operations covering all aspects of systematic thinking and problem-solving.

### 📓 **Interactive Notebooks**
Srcbook notebook integration for interactive TypeScript/JavaScript execution and learning.

### 🎯 **Metagame Operations**
Advanced frameworks like Ulysses Protocol and OODA Loop for high-stakes problem-solving.

### 📊 **Statistical Analysis**
Multiple statistical reasoning modes including Bayesian analysis, hypothesis testing, and Monte Carlo simulation.

### 🔄 **Session Management**
Persistent session state with export/import capabilities for long-running reasoning tasks.

### 🛡️ **Code Execution**
Secure Python code execution in restricted environments.

## Acknowledgments

- Based on the Model Context Protocol (MCP) by Anthropic, and uses the code for the sequentialthinking server
- Mental Models framework inspired by [James Clear's comprehensive guide to mental models](https://jamesclear.com/mental-models), which provides an excellent overview of how these thinking tools can enhance decision-making and problem-solving capabilities
- Ulysses Protocol inspired by systematic debugging and problem-solving methodologies
- OODA Loop implementation based on John Boyd's military strategy framework
