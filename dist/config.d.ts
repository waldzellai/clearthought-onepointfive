/**
 * Configuration schema and types for the Clear Thought MCP server
 */
import { z } from 'zod';
/**
 * Configuration schema for the Clear Thought MCP server
 *
 * @property debug - Enable debug logging (default: false)
 * @property maxThoughtsPerSession - Maximum number of thoughts allowed per session (default: 100)
 * @property sessionTimeout - Session timeout in milliseconds (default: 3600000 - 1 hour)
 * @property enableMetrics - Enable metrics collection (default: false)
 */
export declare const ServerConfigSchema: z.ZodObject<{
    debug: z.ZodDefault<z.ZodBoolean>;
    maxThoughtsPerSession: z.ZodDefault<z.ZodNumber>;
    sessionTimeout: z.ZodDefault<z.ZodNumber>;
    enableMetrics: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    debug: boolean;
    maxThoughtsPerSession: number;
    sessionTimeout: number;
    enableMetrics: boolean;
}, {
    debug?: boolean | undefined;
    maxThoughtsPerSession?: number | undefined;
    sessionTimeout?: number | undefined;
    enableMetrics?: boolean | undefined;
}>;
/**
 * Inferred type from the configuration schema
 */
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
/**
 * Default configuration values
 */
export declare const defaultConfig: ServerConfig;
/**
 * Validates and parses configuration
 * @param config - Raw configuration object
 * @returns Validated configuration
 * @throws {z.ZodError} If configuration is invalid
 */
export declare function parseConfig(config: unknown): ServerConfig;
/**
 * Safely parses configuration with fallback to defaults
 * @param config - Raw configuration object
 * @returns Validated configuration or default configuration
 */
export declare function safeParseConfig(config: unknown): ServerConfig;
//# sourceMappingURL=config.d.ts.map