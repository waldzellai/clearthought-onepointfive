#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { ServerConfig } from "./config.js";
export interface UnifiedServerOptions {
	transport?: "stdio" | "http";
	port?: number;
	config?: ServerConfig;
}
export declare class ClearThoughtUnifiedServer {
	private mcpServer;
	private sessionManager;
	private toolRegistry;
	private options;
	constructor(options?: UnifiedServerOptions);
	private detectTransport;
	private setupHandlers;
	start(): Promise<void>;
	private startStdio;
	getMcpServer(): Server;
}
export default function createServer(options?: UnifiedServerOptions): ClearThoughtUnifiedServer;
//# sourceMappingURL=unified-server.d.ts.map
