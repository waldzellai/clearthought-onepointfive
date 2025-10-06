/**
 * Tool Index - All tools self-register on import
 * This file serves as the central import point for tool registration
 */
// Intentionally do NOT import tool modules here to avoid eager loading.
// The unified server performs Smithery-style lazy loading on demand.
// Export registry for programmatic access
export { ToolRegistry } from "../registry/tool-registry.js";
// Dynamic tool loading function
export async function loadAllTools() {
	// No-op: tools are lazily loaded by the server
}
// Get tool statistics
export function getToolStats() {
	const { ToolRegistry } = require("../registry/tool-registry.js");
	const registry = ToolRegistry.getInstance();
	const tools = registry.getAll();
	return {
		total: tools.length,
		byCategory: tools.reduce((acc, tool) => {
			const category = tool.category || "uncategorized";
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {}),
		names: registry.getToolNames(),
	};
}
//# sourceMappingURL=index.js.map
