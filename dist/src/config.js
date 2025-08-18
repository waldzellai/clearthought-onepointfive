/**
 * Configuration schema and types for the Clear Thought MCP server
 */
import { z } from "zod";
/**
 * Configuration schema for the Clear Thought MCP server
 *
 * @property debug - Enable debug logging (default: false)
 * @property maxThoughtsPerSession - Maximum number of thoughts allowed per session (default: 100)
 * @property sessionTimeout - Session timeout in milliseconds (default: 3600000 - 1 hour)
 * @property enableMetrics - Enable metrics collection (default: false)
 * @property persistenceEnabled - Enable persistent storage across sessions
 * @property persistenceDir - Directory path for persistence files
 * @property knowledgeGraphFile - Knowledge graph JSON file path (within persistenceDir if relative)
 * @property researchProvider - External research provider identifier (e.g., 'exa', 'serpapi')
 * @property researchApiKeyEnv - Name of env var containing API key for research provider
 * @property allowCodeExecution - Allow code execution tools
 * @property pythonCommand - Python executable name/path
 * @property executionTimeoutMs - Max milliseconds for a code execution
 */
export const ServerConfigSchema = z.object({
    debug: z.boolean().default(false).describe("Enable debug logging"),
    maxThoughtsPerSession: z
        .number()
        .min(1)
        .max(1000)
        .default(100)
        .describe("Maximum number of thoughts allowed per session"),
    sessionTimeout: z
        .number()
        .min(60000)
        .default(3600000)
        .describe("Session timeout in milliseconds"),
    enableMetrics: z
        .boolean()
        .default(false)
        .describe("Enable metrics collection"),
    // Persistence & knowledge graph
    persistenceEnabled: z
        .boolean()
        .default(false)
        .describe("Enable persistent storage across sessions"),
    persistenceDir: z
        .string()
        .default(".ct-data")
        .describe("Directory to store persistent data"),
    knowledgeGraphFile: z
        .string()
        .default("knowledge-graph.json")
        .describe("Knowledge graph storage file"),
    // Research provider
    researchProvider: z
        .enum(["none", "exa", "serpapi"])
        .default("none")
        .describe("External research provider to use"),
    researchApiKeyEnv: z
        .string()
        .default("")
        .describe("Env var name that contains the API key for the research provider"),
    // Code execution
    allowCodeExecution: z
        .boolean()
        .default(false)
        .describe("Allow code execution tools"),
    pythonCommand: z
        .string()
        .default("python3")
        .describe("Python executable to use"),
    executionTimeoutMs: z
        .number()
        .min(1000)
        .default(10000)
        .describe("Maximum duration for code execution jobs in milliseconds"),
});
/**
 * Default configuration values
 */
export const defaultConfig = {
    debug: false,
    maxThoughtsPerSession: 100,
    sessionTimeout: 3600000, // 1 hour
    enableMetrics: false,
    persistenceEnabled: false,
    persistenceDir: ".ct-data",
    knowledgeGraphFile: "knowledge-graph.json",
    researchProvider: "none",
    researchApiKeyEnv: "",
    allowCodeExecution: false,
    pythonCommand: "python3",
    executionTimeoutMs: 10000,
};
/**
 * Validates and parses configuration
 * @param config - Raw configuration object
 * @returns Validated configuration
 * @throws {z.ZodError} If configuration is invalid
 */
export function parseConfig(config) {
    return ServerConfigSchema.parse(config);
}
/**
 * Safely parses configuration with fallback to defaults
 * @param config - Raw configuration object
 * @returns Validated configuration or default configuration
 */
export function safeParseConfig(config) {
    const result = ServerConfigSchema.safeParse(config);
    if (result.success) {
        return result.data;
    }
    console.warn("Invalid configuration provided, using defaults:", result.error.issues);
    return defaultConfig;
}
