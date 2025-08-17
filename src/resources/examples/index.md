# Clear Thought Operation Examples

This directory contains example parameter structures for all Clear Thought operations. These resources are served by the MCP server to help models understand the expected data formats.

## Available Resources

Each resource is accessible via the MCP protocol using the `resources/read` operation with the corresponding URI:

### Core Operations

- **`examples://systems-thinking`** - Systems analysis with components, relationships, and feedback loops
- **`examples://causal-analysis`** - Causal graphs with intervention modeling
- **`examples://creative-thinking`** - Idea generation using SCAMPER and other techniques
- **`examples://decision-framework`** - Multi-criteria and expected utility decision analysis
- **`examples://simulation`** - Discrete-time simulation models
- **`examples://scientific-method`** - Hypothesis testing and experimental design

## How to Use These Examples

When using the Clear Thought MCP server, you can:

1. **List available resources:**
   ```json
   {
     "method": "resources/list"
   }
   ```

2. **Read a specific example:**
   ```json
   {
     "method": "resources/read",
     "params": {
       "uri": "examples://systems-thinking"
     }
   }
   ```

3. **Use the examples as templates:**
   - Copy the parameter structure from an example
   - Modify the values for your specific use case
   - Call the `clear_thought` tool with your customized parameters

## Example Workflow

1. **Discover available examples:**
   ```
   MCP Client → resources/list → Server
   Server → [list of resources including examples] → Client
   ```

2. **Retrieve an example:**
   ```
   MCP Client → resources/read("examples://decision-framework") → Server
   Server → [markdown with JSON examples] → Client
   ```

3. **Use the example structure:**
   ```json
   {
     "method": "tools/call",
     "params": {
       "name": "clear_thought",
       "arguments": {
         "operation": "decision_framework",
         "prompt": "Choose the best database for our application",
         "parameters": {
           // Structure copied and modified from the example
           "options": [...],
           "criteria": [...],
           "analysisType": "multi-criteria"
         }
       }
     }
   }
   ```

## Benefits

- **Consistency**: All models using the server get the same structural guidance
- **Learning**: Models can learn the expected formats through examples
- **Validation**: Examples show valid parameter combinations
- **Documentation**: Each example includes explanatory context

## Adding New Examples

To add examples for new operations:

1. Create a new markdown file in `src/resources/examples/`
2. Include multiple examples showing different use cases
3. Add the resource to the server's `ListResourcesRequestSchema` handler
4. Rebuild and deploy the server

## Schema Reference

Each example follows the operation's schema defined in:
- Type definitions: `src/types/index.ts`
- Tool implementation: `src/tools/index.ts`
- Validation schemas: `ClearThoughtParamsSchema`