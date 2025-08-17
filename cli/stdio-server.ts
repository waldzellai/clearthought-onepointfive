#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { defaultConfig } from "../src/config.js";
import createClearThoughtServer from "../src/index.js";

async function main() {
	try {
		// Parse environment variables for diagnostic configuration
		const diagnosticEnabled = process.env.DIAGNOSTIC_ENABLED === 'true' || 
		                         process.env.CT_DIAGNOSTIC_ENABLED === 'true';
		const diagnosticVerbosity = process.env.DIAGNOSTIC_VERBOSITY || 
		                           process.env.CT_DIAGNOSTIC_VERBOSITY || 'standard';
		
		// Create config with diagnostic settings from environment
		const config = {
			...defaultConfig,
			diagnosticEnabled,
			diagnosticVerbosity: diagnosticVerbosity as 'minimal' | 'standard' | 'verbose',
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

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.error("\nShutting down Clear Thought stdio server...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.error("Received SIGTERM, shutting down...");
	process.exit(0);
});

// Start the server
main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
