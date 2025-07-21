#!/usr/bin/env node
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { handleListResources, handleResourceCall } from "./handlers/resource-handlers.js";
import { handleListTools, handleToolCall } from "./handlers/tool-handlers.js";
import { serverConfig, serverCapabilities } from "./config/server-config.js";
config();
export class ClearThoughtMCPServer {
    app;
    mcpServer;
    mcpTransport;
    constructor() {
        // Initialize MCP server
        this.mcpServer = new Server(serverConfig, serverCapabilities);
        this.setupMCPHandlers();
        // Initialize MCP transport
        this.mcpTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
        });
        this.setupMCPTransport();
        // Initialize Express app
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMCPHandlers() {
        this.mcpServer.setRequestHandler(ListResourcesRequestSchema, handleListResources);
        this.mcpServer.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
        this.mcpServer.setRequestHandler(ListToolsRequestSchema, handleListTools);
        this.mcpServer.setRequestHandler(CallToolRequestSchema, handleToolCall);
    }
    setupMCPTransport() {
        this.mcpServer.connect(this.mcpTransport);
    }
    setupMiddleware() {
        this.app.use(cors({ origin: true, credentials: true }));
        this.app.use(cookieParser());
    }
    setupRoutes() {
        // MCP endpoint using SDK transport
        this.app.all("/mcp", async (req, res) => {
            await this.mcpTransport.handleRequest(req, res);
        });
        // Health check
        this.app.get("/health", (req, res) => {
            res.json({
                status: "ok",
                service: "clear-thought-mcp-server",
                transport: "http",
                capabilities: {
                    mcp: true,
                    tools: [
                        "sequentialthinking",
                        "mentalmodel",
                        "debuggingapproach",
                        "collaborativereasoning",
                        "decisionframework",
                        "metacognitivemonitoring",
                        "scientificmethod",
                        "structuredargumentation",
                        "visualreasoning"
                    ]
                },
            });
        });
        // Root endpoint
        this.app.get("/", (req, res) => {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            res.json({
                service: "Clear Thought MCP Server",
                version: "0.0.5",
                transport: "http",
                endpoints: {
                    mcp: `${baseUrl}/mcp`,
                    health: `${baseUrl}/health`,
                },
            });
        });
    }
    async start(port = 3000) {
        this.app.listen(port, () => {
            const baseHost = `localhost:${port}`;
            console.log(`🚀 Clear Thought MCP Server (HTTP Transport) running on port ${port}`);
            console.log(`📡 MCP endpoint: http://${baseHost}/mcp`);
            console.log(`❤️  Health: http://${baseHost}/health`);
        });
    }
}
// Main execution for standalone mode
async function main() {
    const server = new ClearThoughtMCPServer();
    await server.start(parseInt(process.env.PORT || "3000", 10));
}
// Run the server in standalone mode if executed directly
// Use process.argv to check if this is the main module
const isMainModule = process.argv[1] && process.argv[1].endsWith('smithery-entry.ts');
if (isMainModule) {
    main().catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
}
// Export for Smithery - returns the MCP server instance
export default function () {
    // Create MCP server
    const mcpServer = new Server(serverConfig, serverCapabilities);
    // Set up handlers
    mcpServer.setRequestHandler(ListResourcesRequestSchema, handleListResources);
    mcpServer.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
    mcpServer.setRequestHandler(ListToolsRequestSchema, handleListTools);
    mcpServer.setRequestHandler(CallToolRequestSchema, handleToolCall);
    // For HTTP support, we need to start the HTTP server in the background
    const httpServer = new ClearThoughtMCPServer();
    httpServer.start(parseInt(process.env.PORT || "3000", 10)).catch((error) => {
        console.error("Failed to start HTTP server:", error);
    });
    // Return the MCP server instance for Smithery
    return mcpServer;
}
//# sourceMappingURL=smithery-entry.js.map