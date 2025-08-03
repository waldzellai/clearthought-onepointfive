import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SessionState } from './state/SessionState.js';
import { registerTools } from './tools/index.js';
/**
 * Creates a Clear Thought MCP server instance for a specific session
 * @param sessionId - Unique identifier for this session
 * @param config - Server configuration
 * @returns Server instance configured for this session
 */
export default function createClearThoughtServer({ sessionId, config }) {
    // Create a new MCP server instance for each session
    const mcpServer = new McpServer({
        name: 'clear-thought',
        version: '0.0.5'
    });
    // Initialize session state
    const sessionState = new SessionState(sessionId, config);
    // Register all tools for this session
    registerTools(mcpServer, sessionState);
    // Return the MCP server instance
    return mcpServer;
}
