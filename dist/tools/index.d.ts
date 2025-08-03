import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';
/**
 * Registers the unified Clear Thought tool with the MCP server
 *
 * This single tool provides access to all reasoning operations through
 * an operation parameter, following the websetsManager pattern.
 *
 * @param server - The MCP server instance
 * @param sessionState - The session state manager
 */
export declare function registerTools(server: McpServer, sessionState: SessionState): void;
//# sourceMappingURL=index.d.ts.map