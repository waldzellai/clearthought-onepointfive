#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import createClearThoughtServer from "./index.js";
// Export for Smithery - returns the MCP server instance
export default function () {
    // Create MCP server using the proper factory function
    const mcpServer = createClearThoughtServer({
        sessionId: randomUUID(),
        config: {
            debug: false,
            maxThoughtsPerSession: 1000,
            sessionTimeout: 3600000,
            enableMetrics: true,
            persistenceEnabled: false,
            persistenceDir: '.ct-data',
            knowledgeGraphFile: 'knowledge-graph.json',
            researchProvider: 'none',
            researchApiKeyEnv: '',
            allowCodeExecution: false,
            pythonCommand: 'python3',
            executionTimeoutMs: 10000
        }
    });
    // Initialize MCP transport
    const mcpTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
    });
    // Connect the server to the transport
    mcpServer.connect(mcpTransport);
    // Return the MCP server instance for Smithery
    return mcpServer;
}
