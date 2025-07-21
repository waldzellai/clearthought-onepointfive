import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { ServerConfigSchema } from './config.js';
export { ServerConfigSchema as configSchema } from './config.js';
/**
 * Creates a Clear Thought MCP server instance for a specific session
 * @param sessionId - Unique identifier for this session
 * @param config - Server configuration
 * @returns Server instance configured for this session
 */
export default function createClearThoughtServer({ sessionId, config }: {
    sessionId: string;
    config: z.infer<typeof ServerConfigSchema>;
}): Server;
//# sourceMappingURL=index.d.ts.map