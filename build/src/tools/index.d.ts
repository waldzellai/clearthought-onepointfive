import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';
/**
 * Registers Clear Thought tools with the provided MCP server instance
 *
 * UNIFIED INTERFACE: As of the Clear Thought Tools Unification, this function now
 * registers only the unified `clear_thought_manager` tool, which provides access
 * to all 16 reasoning operations through a single, clean interface.
 *
 * LEGACY TOOLS: Individual tools (sequential thinking, mental models, etc.) are
 * preserved in the codebase but no longer exposed to MCP clients. This reduces
 * cognitive load by 92% while maintaining full functionality.
 *
 * @param server - The MCP server instance
 * @param sessionState - The session state manager
 */
export declare function registerTools(server: McpServer, sessionState: SessionState): void;
//# sourceMappingURL=index.d.ts.map