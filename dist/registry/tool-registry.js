import { zodToJsonSchema } from 'zod-to-json-schema';
export class ToolRegistry {
    static instance;
    tools = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new ToolRegistry();
        }
        return this.instance;
    }
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    getAll() {
        return Array.from(this.tools.values());
    }
    get(name) {
        return this.tools.get(name);
    }
    getByCategory(category) {
        return this.getAll().filter(tool => tool.category === category);
    }
    // Generate MCP tool format
    toMCPTools() {
        return this.getAll().map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: zodToJsonSchema(tool.schema)
        }));
    }
    // Validate arguments using tool's schema
    validate(name, args) {
        const tool = this.get(name);
        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }
        return tool.schema.parse(args);
    }
    // Execute tool with validation and session
    async execute(name, args, session) {
        const tool = this.get(name);
        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }
        // Validate with Zod (single validation point)
        const validated = tool.schema.parse(args);
        // Execute with session
        return tool.handler(validated, session);
    }
    // Get tool names for autocomplete
    getToolNames() {
        return Array.from(this.tools.keys());
    }
    // Check if tool exists
    has(name) {
        return this.tools.has(name);
    }
    // Clear registry (useful for testing)
    clear() {
        this.tools.clear();
    }
}
//# sourceMappingURL=tool-registry.js.map