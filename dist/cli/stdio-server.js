#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { defaultConfig } from "../src/config.js";
import createClearThoughtServer from "../src/index.js";
// Single idempotent shutdown path. Multiple lifecycle events can fire for one
// disconnect (stdin end/close, transport/server close, SIGINT, SIGTERM); the
// guard ensures only the first one shuts the process down.
let shuttingDown = false;
function shutdown(exitCode = 0) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    process.exit(exitCode);
}
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
            diagnosticVerbosity: diagnosticVerbosity,
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
        // MCP stdio lifecycle: when a client disconnects it closes stdin, so this
        // process sees EOF on its input even though no signal is ever delivered.
        // Exit on stdin end/close so we never linger as an orphaned process.
        process.stdin.on("end", () => shutdown(0));
        process.stdin.on("close", () => shutdown(0));
        // Verified against @modelcontextprotocol/sdk@1.17.x: Protocol.connect()
        // wraps the transport's onclose callback, and Protocol._onclose() invokes
        // this server-level callback whenever the transport connection closes.
        server.onclose = () => shutdown(0);
        // Create stdio transport
        const transport = new StdioServerTransport();
        // Connect server to transport
        await server.connect(transport);
        // Log to stderr (stdout is reserved for MCP communication)
        console.error("Clear Thought MCP server running in stdio mode");
        console.error("Ready to receive commands...");
    }
    catch (error) {
        console.error("Failed to start Clear Thought stdio server:", error);
        process.exit(1);
    }
}
// Handle graceful shutdown (routed through the shared idempotent guard)
process.on("SIGINT", () => {
    console.error("\nShutting down Clear Thought stdio server...");
    shutdown(0);
});
process.on("SIGTERM", () => {
    console.error("Received SIGTERM, shutting down...");
    shutdown(0);
});
// Start the server
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
