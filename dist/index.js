#!/usr/bin/env node
/**
 * Clear Thought MCP Server - Main Entry Point
 *
 * Unified server supporting stdio and HTTP transports
 */
import { ClearThoughtUnifiedServer } from "./unified-server.js";
// Export factory function for programmatic use
export default function createClearThoughtServer(options) {
	const server = new ClearThoughtUnifiedServer(options ?? {});
	// For host-managed HTTP environments, return the MCP server instance
	if (options?.returnMcpServer) {
		return server.getMcpServer();
	}
	return server;
}
// Auto-start if executed directly
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
	const server = new ClearThoughtUnifiedServer();
	server.start().catch((error) => {
		console.error("Failed to start server:", error);
		process.exit(1);
	});
}

export { ToolRegistry } from "./registry/tool-registry.js";
export { SessionManager } from "./state/SessionManager.js";
export { SessionState } from "./state/SessionState.js";
export { ClearThoughtUnifiedServer } from "./unified-server.js";
//# sourceMappingURL=index.js.map
