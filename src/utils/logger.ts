/**
 * Terminal logging utility for Clear Thought operations
 * Logs to stderr for human monitoring while keeping stdout clean for MCP protocol
 */

import chalk from "chalk";
import type { OperationResult } from "../tools/operations/base.js";

/**
 * Terminal logger for operation progress and debugging
 */
export class TerminalLogger {
	private enableLogging: boolean;

	constructor() {
		this.enableLogging = process.env.DISABLE_LOGGING !== "true";
	}

	/**
	 * Log operation start
	 */
	logOperationStart(operation: string, params: Record<string, unknown>): void {
		if (!this.enableLogging) return;

		const emoji = this.getOperationEmoji(operation);
		const formatted = this.formatOperationStart(emoji, operation, params);
		console.error(formatted);
	}

	/**
	 * Log step progress
	 */
	logStep(operation: string, step: number, total: number, description: string): void {
		if (!this.enableLogging) return;

		const formatted = this.formatStep(operation, step, total, description);
		console.error(formatted);
	}

	/**
	 * Log operation completion
	 */
	logOperationComplete(operation: string, result: OperationResult): void {
		if (!this.enableLogging) return;

		const formatted = this.formatCompletion(operation, result);
		console.error(formatted);
	}

	/**
	 * Log error
	 */
	logError(operation: string, error: Error | string): void {
		if (!this.enableLogging) return;

		const emoji = this.getOperationEmoji(operation);
		const errorMsg = error instanceof Error ? error.message : error;
		const formatted = `\n${emoji} ${chalk.red("ERROR")} in ${operation}\n  ${chalk.gray("└─")} ${errorMsg}\n`;
		console.error(formatted);
	}

	/**
	 * Log debug information
	 */
	logDebug(operation: string, message: string, data?: Record<string, unknown>): void {
		if (!this.enableLogging) return;

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
	private getOperationEmoji(operation: string): string {
		const emojiMap: Record<string, string> = {
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
	private formatOperationStart(emoji: string, operation: string, params: unknown): string {
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
	private formatStep(operation: string, step: number, total: number, description: string): string {
		const emoji = this.getOperationEmoji(operation);
		const progress = `${emoji} Step ${step}/${total}`;
		const bar = this.createProgressBar(step, total);

		return `\n  ${chalk.blue(progress)} ${bar}\n  ${chalk.gray("└─")} ${description}`;
	}

	/**
	 * Format completion message
	 */
	private formatCompletion(operation: string, result: OperationResult): string {
		const emoji = this.getOperationEmoji(operation);
		const statusEmoji = result.status === "completed" ? "✓" : result.status === "error" ? "✗" : "⏸";
		const header = `${statusEmoji} ${operation} ${result.status}`;
		const border = "═".repeat(header.length + 4);

		let formatted = `\n╔${border}╗\n║ ${chalk.green(header)} ║\n╚${border}╝`;

		// Add progress summary
		if (result.progress) {
			formatted += `\n  ${chalk.gray("Progress:")} ${result.progress.stepsCompleted}/${result.progress.stepsRequired} steps`;
			formatted += `\n  ${chalk.gray("Phase:")} ${result.progress.currentPhase}`;
		}

		// Add next step if present
		if (result.nextStep && result.status !== "completed") {
			formatted += `\n  ${chalk.gray("Next:")} ${result.nextStep.action}`;
		}

		return formatted + "\n";
	}

	/**
	 * Create progress bar
	 */
	private createProgressBar(current: number, total: number, width = 20): string {
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

