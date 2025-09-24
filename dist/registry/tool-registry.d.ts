import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionState } from '../state/SessionState.js';
export interface ToolDefinition<T = any> {
    name: string;
    description: string;
    schema: z.ZodSchema<T>;
    handler: (args: T, session: SessionState) => Promise<CallToolResult>;
    category?: 'reasoning' | 'metacognitive' | 'collaborative' | 'creative' | 'session';
    annotations?: {
        audience?: string[];
        priority?: number;
        available_operations?: string[];
        docs?: string;
        quickstart?: string;
    };
}
export interface ToolResult {
    content: Array<{
        type: string;
        text: string;
    }>;
}
export declare class ToolRegistry {
    private static instance;
    private tools;
    static getInstance(): ToolRegistry;
    register<T>(tool: ToolDefinition<T>): void;
    getAll(): ToolDefinition[];
    get(name: string): ToolDefinition | undefined;
    getByCategory(category: string): ToolDefinition[];
    toMCPTools(): {
        name: string;
        description: string;
        inputSchema: import("zod-to-json-schema").JsonSchema7Type & {
            $schema?: string | undefined;
            definitions?: {
                [key: string]: import("zod-to-json-schema").JsonSchema7Type;
            } | undefined;
        };
    }[];
    validate(name: string, args: any): any;
    execute(name: string, args: any, session: SessionState): Promise<CallToolResult>;
    getToolNames(): string[];
    has(name: string): boolean;
    clear(): void;
}
//# sourceMappingURL=tool-registry.d.ts.map