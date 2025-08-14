# Clear Thought 1.5 MCP Server

[![smithery badge](https://smithery.ai/badge/@waldzellai/clear-thought-onepointfive)](https://smithery.ai/server/@waldzellai/clear-thought-onepointfive)

A Model Context Protocol (MCP) server that provides a unified reasoning tool with multiple operations, including systematic thinking, mental models, and debugging approaches for enhanced problem-solving capabilities. This server exposes a single `clear_thought` tool with a variety of operations to facilitate complex reasoning tasks.

## Operations

The `clear_thought` tool provides the following operations. For detailed information on parameters, please refer to the operations guide resource at `guide://clear-thought-operations`.

- **sequential_thinking**: Executes a chain-of-thought process. Can be configured to use different reasoning patterns like 'tree', 'beam', 'mcts', 'graph', or 'auto'.
- **mental_model**: Applies a specified mental model to a problem.
- **debugging_approach**: Guides through a structured debugging process.
- **creative_thinking**: Facilitates idea generation and exploration.
- **visual_reasoning**: Works with diagrams and visual structures.
- **metacognitive_monitoring**: Monitors and assesses the reasoning process itself.
- **scientific_method**: Follows the steps of the scientific method for inquiry.
- **collaborative_reasoning**: Simulates a multi-persona discussion to explore a topic from different viewpoints.
- **decision_framework**: Uses a structured framework to analyze options and make decisions.
- **socratic_method**: Employs a question-driven approach to challenge and refine arguments.
- **structured_argumentation**: Constructs and analyzes formal arguments.
- **systems_thinking**: Models a problem as a system with interconnected components.
- **research**: Generates placeholders for research findings and citations.
- **analogical_reasoning**: Draws parallels and maps insights between different domains.
- **causal_analysis**: Investigates cause-and-effect relationships.
- **statistical_reasoning**: Performs statistical analysis.
- **simulation**: Runs simple simulations.
- **optimization**: Finds the best solution from a set of alternatives.
- **ethical_analysis**: Evaluates a situation using an ethical framework.
- **visual_dashboard**: Creates a skeleton for a visual dashboard.
- **custom_framework**: Allows defining a custom reasoning framework.
- **code_execution**: Executes code in a restricted environment (currently Python only).
- **tree_of_thought, beam_search, mcts, graph_of_thought**: Aliases for `sequential_thinking` with a fixed reasoning pattern.
- **orchestration_suggest**: Suggests a sequence of tools to use for a complex task.

## Choosing an Operation

With a wide range of operations available, it's helpful to have a guide for selecting the best one for your task.

- For **general problem-solving** and step-by-step reasoning, start with `sequential_thinking`.
- To **analyze a problem from a specific viewpoint**, use `mental_model`.
- When **troubleshooting issues**, `debugging_approach` provides a structured workflow.
- To **generate new ideas**, use `creative_thinking`.
- For **complex decisions**, `decision_framework` can help you weigh your options.
- To **simulate a discussion** with multiple perspectives, use `collaborative_reasoning`.
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

### Example: Debugging Approach
```typescript
const response = await mcp.callTool("clear_thought", {
  operation: "debugging_approach",
  prompt: "Investigate performance degradation in the system.",
  parameters: {
    approach: "binary_search"
  }
});
```

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details.

## Acknowledgments

- Based on the Model Context Protocol (MCP) by Anthropic, and uses the code for the sequentialthinking server
- Mental Models framework inspired by [James Clear's comprehensive guide to mental models](https://jamesclear.com/mental-models), which provides an excellent overview of how these thinking tools can enhance decision-making and problem-solving capabilities
