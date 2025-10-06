#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createStatefulServer } from "@smithery/sdk";
import type { ServerConfig } from "./config.js";
import { ServerConfigSchema, defaultConfig } from "./config.js";
import createClearThoughtServer from "./index.js";

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args[0] === "http" ? "http" : "stdio";
const port = mode === "http" && args[1] ? parseInt(args[1], 10) : 3000;

if (mode === "http" && Number.isNaN(port)) {
	console.error("Invalid port number. Usage: clear-thought http [port]");
	process.exit(1);
}

async function startStdio() {
	try {
		// Parse environment variables for diagnostic configuration
		const diagnosticEnabled =
			process.env.DIAGNOSTIC_ENABLED === "true" || process.env.CT_DIAGNOSTIC_ENABLED === "true";
		const diagnosticVerbosity =
			process.env.DIAGNOSTIC_VERBOSITY || process.env.CT_DIAGNOSTIC_VERBOSITY || "standard";

		// Create config with diagnostic settings from environment
		const config = {
			...defaultConfig,
			diagnosticEnabled,
			diagnosticVerbosity: diagnosticVerbosity as "minimal" | "standard" | "verbose",
		};

		// Log diagnostic status to stderr
		if (diagnosticEnabled) {
			console.error(`🔍 Glass Box Diagnostic Tracing ENABLED (verbosity: ${diagnosticVerbosity})`);
		}

		// Create the Clear Thought server instance
		const server = createClearThoughtServer({
			sessionId: `stdio-session-${Date.now()}`,
			config,
		});

		// Create stdio transport
		const transport = new StdioServerTransport();

		// Connect server to transport
		await server.connect(transport);

		// Log to stderr (stdout is reserved for MCP communication)
		console.error("Clear Thought MCP server running in stdio mode");
		console.error("Ready to receive commands...");
	} catch (error) {
		console.error("Failed to start Clear Thought stdio server:", error);
		process.exit(1);
	}
}

function startHttp() {
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
		console.log(`🔧 Config schema: http://localhost:${port}/.well-known/mcp-config`);
		console.log("\nPress Ctrl+C to stop the server");
	});
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	const msg = mode === "stdio" ? "\nShutting down Clear Thought stdio server..." : "\n👋 Shutting down Clear Thought server...";
	if (mode === "stdio") {
		console.error(msg);
	} else {
		console.log(msg);
	}
	process.exit(0);
});

process.on("SIGTERM", () => {
	const msg = mode === "stdio" ? "Received SIGTERM, shutting down..." : "👋 Received SIGTERM, shutting down...";
	if (mode === "stdio") {
		console.error(msg);
	} else {
		console.log(msg);
	}
	process.exit(0);
});

// Start the appropriate server
if (mode === "http") {
	startHttp();
} else {
	startStdio().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(1);
	});
}
