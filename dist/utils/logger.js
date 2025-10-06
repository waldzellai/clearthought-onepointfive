/**
 * Terminal logging utility for Clear Thought operations
 * Logs to stderr for human monitoring while keeping stdout clean for MCP protocol
 */
import chalk from "chalk";
/**
 * Terminal logger for operation progress and debugging
 */
export class TerminalLogger {
    enableLogging;
    constructor() {
        this.enableLogging = process.env.DISABLE_LOGGING !== "true";
    }
    /**
     * Log operation start
     */
    logOperationStart(operation, params) {
        if (!this.enableLogging)
            return;
        const emoji = this.getOperationEmoji(operation);
        const formatted = this.formatOperationStart(emoji, operation, params);
        console.error(formatted);
    }
    /**
     * Log step progress
     */
    logStep(operation, step, total, description) {
        if (!this.enableLogging)
            return;
        const formatted = this.formatStep(operation, step, total, description);
        console.error(formatted);
    }
    /**
     * Log operation completion
     */
    logOperationComplete(operation, result) {
        if (!this.enableLogging)
            return;
        const formatted = this.formatCompletion(operation, result);
        console.error(formatted);
    }
    /**
     * Log error
     */
    logError(operation, error) {
        if (!this.enableLogging)
            return;
        const emoji = this.getOperationEmoji(operation);
        const errorMsg = error instanceof Error ? error.message : error;
        const formatted = `\n${emoji} ${chalk.red("ERROR")} in ${operation}\n  ${chalk.gray("└─")} ${errorMsg}\n`;
        console.error(formatted);
    }
    /**
     * Log debug information
     */
    logDebug(operation, message, data) {
        if (!this.enableLogging)
            return;
        const emoji = this.getOperationEmoji(operation);
        let formatted = `${emoji} ${chalk.gray("DEBUG")} ${message}`;
        if (data) {
            formatted += `\n  ${chalk.gray(JSON.stringify(data, null, 2))}`;
        }
        console.error(formatted);
    }
    /**
     * Get emoji for operation
     */
    getOperationEmoji(operation) {
        const emojiMap = {
            sequential_thinking: "💭",
            tree_of_thought: "🌳",
            mcts: "🎲",
            beam_search: "🔦",
            graph_of_thought: "🕸️",
            mental_model: "🧠",
            decision_framework: "⚖️",
            socratic_method: "❓",
            debugging_approach: "🐛",
            scientific_method: "🔬",
            collaborative_reasoning: "🤝",
            creative_thinking: "💡",
            metacognitive_monitoring: "🔍",
            visual_reasoning: "👁️",
            systems_thinking: "🔄",
            structured_argumentation: "📊",
            analogical_reasoning: "🔗",
            causal_analysis: "⚡",
            ethical_analysis: "⚖️",
            statistical_reasoning: "📈",
            optimization: "🎯",
            simulation: "🎮",
            research: "📚",
            decision_networks: "🕸️",
            mdp_planning: "🗺️",
            ooda_loop: "🔁",
            ulysses_protocol: "🧭",
        };
        return emojiMap[operation] || "⚙️";
    }
    /**
     * Format operation start message
     */
    formatOperationStart(emoji, operation, params) {
        const header = `${emoji} ${operation}`;
        const border = "═".repeat(header.length + 4);
        let formatted = `\n╔${border}╗\n║ ${chalk.cyan(header)} ║\n╚${border}╝`;
        // Add parameters if present and not too large
        if (params && typeof params === "object") {
            const paramStr = JSON.stringify(params, null, 2);
            if (paramStr.length < 200) {
                formatted += `\n  ${chalk.gray("Parameters:")} ${chalk.dim(paramStr)}`;
            }
        }
        return formatted;
    }
    /**
     * Format step progress message
     */
    formatStep(operation, step, total, description) {
        const emoji = this.getOperationEmoji(operation);
        const progress = `${emoji} Step ${step}/${total}`;
        const bar = this.createProgressBar(step, total);
        return `\n  ${chalk.blue(progress)} ${bar}\n  ${chalk.gray("└─")} ${description}`;
    }
    /**
     * Format completion message
     */
    formatCompletion(operation, result) {
        const statusEmoji = result.status === "success" ? "✓" : "✗";
        const header = `${statusEmoji} ${operation} ${result.status}`;
        const border = "═".repeat(header.length + 4);
        let formatted = `\n╔${border}╗\n║ ${chalk.green(header)} ║\n╚${border}╝`;
        // Add error message if present
        if (result.error) {
            formatted += `\n  ${chalk.red("Error:")} ${result.error}`;
        }
        return `${formatted}\n`;
    }
    /**
     * Create progress bar
     */
    createProgressBar(current, total, width = 20) {
        const filled = Math.floor((current / total) * width);
        const empty = width - filled;
        const bar = "█".repeat(filled) + "░".repeat(empty);
        return `[${chalk.green(bar)}]`;
    }
}
/**
 * Singleton instance
 */
export const logger = new TerminalLogger();
