# MCP Workflow Commands

Commands for orchestrating tool calls across multiple MCP servers.

## Available Commands

### [mcp-workflow](./mcp-workflow.md)

Execute YAML-based workflows with structured steps and error handling.

### [mcp-chain](./mcp-chain.md)

Simple linear tool chains with basic variable passing between steps.

### [mcp-orchestrate](./mcp-orchestrate.md)

Advanced DSL with parallel execution, conditionals, loops, and complex logic.

### [mcp-recipe](./mcp-recipe.md)

Pre-defined common patterns and custom recipe support for reusable workflows.

## Common Patterns

- **Research & Save**: Search → Scrape → Store to memory
- **Multi-source Aggregation**: Parallel searches → Merge results → Analyze
- **Progressive Enhancement**: Basic search → Deep dive → Extract patterns
- **Cross-reference**: GitHub + Web + Docs → Correlate findings

## Example Usage

```bash
# Simple chain
/mcp-chain mcp__exa__web_search_exa | query="OpenTelemetry", numResults=5

# Complex orchestration
/mcp-orchestrate .claude/workflows/research-plan.md

# Quick recipe
/mcp-recipe research-and-save query="React patterns"
```
