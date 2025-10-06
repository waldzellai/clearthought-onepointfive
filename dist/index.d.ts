#!/usr/bin/env node
/**
 * Clear Thought MCP Server - Main Entry Point
 *
 * Unified server supporting stdio and HTTP transports
 */
import { ClearThoughtUnifiedServer } from "./unified-server.js";
import type { UnifiedServerOptions } from "./unified-server.js";
export interface CreateOptions extends UnifiedServerOptions {
	returnMcpServer?: boolean;
}
export default function createClearThoughtServer(options?: CreateOptions):
	| ClearThoughtUnifiedServer
	| import("@modelcontextprotocol/sdk/server/index.js").Server<
			{
				method: string;
				params?:
					| {
							[x: string]: unknown;
							_meta?:
								| {
										[x: string]: unknown;
										progressToken?: string | number | undefined;
								  }
								| undefined;
					  }
					| undefined;
			},
			{
				method: string;
				params?:
					| {
							[x: string]: unknown;
							_meta?:
								| {
										[x: string]: unknown;
								  }
								| undefined;
					  }
					| undefined;
			},
			{
				[x: string]: unknown;
				_meta?:
					| {
							[x: string]: unknown;
					  }
					| undefined;
			}
	  >;
export type { UnifiedServerOptions } from "./unified-server.js";
export { ClearThoughtUnifiedServer } from "./unified-server.js";
export { ToolRegistry } from "./registry/tool-registry.js";
export { SessionState } from "./state/SessionState.js";
export { SessionManager } from "./state/SessionManager.js";
//# sourceMappingURL=index.d.ts.map
