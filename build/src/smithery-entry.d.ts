#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
export declare class ClearThoughtMCPServer {
    private app;
    private mcpServer;
    private mcpTransport;
    constructor();
    private setupMCPHandlers;
    private setupMCPTransport;
    private setupMiddleware;
    private setupRoutes;
    start(port?: number): Promise<void>;
}
export default function (): Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;
//# sourceMappingURL=smithery-entry.d.ts.map