#!/usr/bin/env node
import { createStatefulServer } from "@smithery/sdk";
import type { ServerConfig } from "../src/config.js";
import { ServerConfigSchema } from "../src/config.js";
import createClearThoughtServer from "../src/index.js";

// Parse command line arguments
const args = process.argv.slice(2);
const port = args[0] ? parseInt(args[0], 10) : 3000;

if (Number.isNaN(port)) {
	console.error("Invalid port number. Usage: cli/server.ts [port]");
	process.exit(1);
}

// Create the stateful server using the SDK pattern
const { app } = createStatefulServer(
	({ sessionId, config }) => {
		// Create and return the Clear Thought server for this session
		return createClearThoughtServer({
			sessionId,
			config: config as ServerConfig,
		});
	},
	{
		// Use the Clear Thought config schema for validation
		schema: ServerConfigSchema,
	},
);

// Start the HTTP server
app.listen(port, () => {
	console.log(`🧠 Clear Thought server running at http://localhost:${port}`);
	console.log(`📝 MCP endpoint: http://localhost:${port}/mcp`);
	console.log(
		`🔧 Config schema: http://localhost:${port}/.well-known/mcp-config`,
	);
	console.log("\nPress Ctrl+C to stop the server");
});

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log("\n👋 Shutting down Clear Thought server...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\n👋 Received SIGTERM, shutting down...");
	process.exit(0);
});
