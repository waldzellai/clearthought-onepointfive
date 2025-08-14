#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import createClearThoughtServer from '../src/index.js';
import { defaultConfig } from '../src/config.js';
async function main() {
    try {
        // Create the Clear Thought server instance
        const server = createClearThoughtServer({
            sessionId: 'stdio-session-' + Date.now(),
            config: defaultConfig
        });
        // Create stdio transport
        const transport = new StdioServerTransport();
        // Connect server to transport
        await server.connect(transport);
        // Log to stderr (stdout is reserved for MCP communication)
        console.error('Clear Thought MCP server running in stdio mode');
        console.error('Ready to receive commands...');
    }
    catch (error) {
        console.error('Failed to start Clear Thought stdio server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.error('\nShutting down Clear Thought stdio server...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down...');
    process.exit(0);
});
// Start the server
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
