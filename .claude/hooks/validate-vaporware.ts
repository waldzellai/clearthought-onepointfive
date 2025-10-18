#!/usr/bin/env tsx

/**
 * Vaporware Detection Hook
 *
 * This hook uses the Claude Agent SDK to validate that operation implementations
 * follow the structured journal pattern and don't fall into vaporware anti-patterns.
 *
 * Triggered on PostToolUse for Write/Edit operations in src/tools/operations/
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

interface HookInput {
	session_id: string;
	transcript_path: string;
	cwd: string;
	hook_event_name: string;
	tool_name: string;
	tool_input: {
		file_path?: string;
		content?: string;
		[key: string]: unknown;
	};
	tool_response?: {
		filePath?: string;
		success?: boolean;
		[key: string]: unknown;
	};
}

interface ValidationResult {
	passed: boolean;
	issues: string[];
	warnings: string[];
	score: number;
}

const VAPORWARE_CHECKLIST = `
# Vaporware Detection Checklist

Analyze the provided TypeScript operation file for vaporware anti-patterns.

## Critical Failures (Auto-Fail)

1. **Placeholder Returns**: Does the code return objects with \`placeholder: true\` or messages like "Would dispatch..."?
2. **Prompt Echoing**: Does the response include the user's input/prompt verbatim?
3. **Fake Pattern Selection**: Does it select patterns/strategies that don't actually execute?
4. **Vaporware Claims**: Does it claim to do tree search, MCTS, beam search, or other algorithms without implementation?
5. **Missing Implementation**: Are there TODO comments, empty functions, or unimplemented code paths?

## Token Efficiency Failures

6. **Response Size**: Are responses larger than 100 tokens (excluding error messages)?
7. **Unnecessary Verbosity**: Does it return explanatory text instead of minimal metadata?

## Transparency Failures

8. **Silent Storage**: Does it store data without logging to stderr/terminal?
9. **Weak Validation**: Does it silently fail or return success without proper validation?
10. **Missing Error Messages**: Are validation errors descriptive and actionable?

## Structural Issues

11. **Unused Parameters**: Are there parameters that are accepted but never used?
12. **Circular Dependencies**: Does it delegate to other operations that delegate back?
13. **State Confusion**: Is there unclear or inconsistent state management?

## Scoring

- Each critical failure: -20 points
- Each token efficiency failure: -15 points
- Each transparency failure: -10 points
- Each structural issue: -5 points
- Starting score: 100 points
- Passing score: ≥ 70 points

## Output Format

Return a JSON object with:

\`\`\`json
{
  "passed": boolean,
  "score": number,
  "issues": [
    {
      "category": "critical" | "token_efficiency" | "transparency" | "structural",
      "description": "Specific issue found",
      "location": "Line number or function name",
      "severity": number
    }
  ],
  "warnings": [
    {
      "description": "Potential concern",
      "location": "Line number or function name"
    }
  ]
}
\`\`\`

Be specific about line numbers and code snippets when identifying issues.
`;

async function validateWithClaude(filePath: string, content: string): Promise<ValidationResult> {
	const prompt = `
Analyze this TypeScript operation file for vaporware anti-patterns.

File: ${filePath}

\`\`\`typescript
${content}
\`\`\`

${VAPORWARE_CHECKLIST}

Provide detailed analysis with specific line numbers and code examples.
`;

	let result: ValidationResult = {
		passed: true,
		issues: [],
		warnings: [],
		score: 100,
	};

	try {
		// Use Claude Agent SDK to analyze the file
		for await (const message of query({
			prompt,
			options: {
				maxTurns: 3,
				model: "claude-opus-4-20250514",
			},
		})) {
			if (message.type === "text") {
				// Parse the response for JSON
				const jsonMatch = message.text.match(/```json\s*([\s\S]*?)\s*```/);
				if (jsonMatch) {
					const parsed = JSON.parse(jsonMatch[1]);
					result = {
						passed: parsed.passed,
						issues: parsed.issues?.map((i: any) => i.description) || [],
						warnings: parsed.warnings?.map((w: any) => w.description) || [],
						score: parsed.score || 0,
					};
				}
			}
		}
	} catch (error) {
		console.error(chalk.red("Error during Claude validation:"), error);
		result.passed = false;
		result.issues.push(
			`Validation error: ${error instanceof Error ? error.message : String(error)}`,
		);
		result.score = 0;
	}

	return result;
}

function performStaticAnalysis(content: string): ValidationResult {
	const issues: string[] = [];
	const warnings: string[] = [];
	let score = 100;

	// Check for placeholder returns
	if (/placeholder\s*:\s*true/i.test(content) || /would dispatch/i.test(content)) {
		issues.push("CRITICAL: Found placeholder returns or 'would dispatch' messages");
		score -= 20;
	}

	// Check for prompt echoing (looking for prompt/input being returned)
	if (/return.*prompt|response.*input.*prompt/i.test(content)) {
		issues.push("CRITICAL: Possible prompt echoing detected");
		score -= 20;
	}

	// Check for TODO/FIXME/unimplemented
	const todoMatches = content.match(/TODO|FIXME|unimplemented|not implemented/gi);
	if (todoMatches && todoMatches.length > 0) {
		issues.push(`CRITICAL: Found ${todoMatches.length} TODO/unimplemented markers`);
		score -= 20;
	}

	// Check for vaporware algorithm claims
	const algorithmClaims = /tree.?search|MCTS|monte.?carlo|beam.?search|A\*|dijkstra/gi;
	if (algorithmClaims.test(content) && !/class.*implements.*Search/i.test(content)) {
		warnings.push("WARNING: Claims algorithmic search but no implementation class found");
		score -= 10;
	}

	// Check for response size (look for large string returns)
	const largeStringReturns = content.match(/text:\s*`[\s\S]{200,}`/g);
	if (largeStringReturns && largeStringReturns.length > 0) {
		issues.push("TOKEN EFFICIENCY: Found large string returns (>200 chars)");
		score -= 15;
	}

	// Check for terminal logging
	if (!/console\.(error|warn|log)\(/i.test(content)) {
		issues.push("TRANSPARENCY: No terminal logging found");
		score -= 10;
	}

	// Check for validation
	if (!/throw new Error|throw Error/i.test(content)) {
		warnings.push("WARNING: No validation errors thrown");
		score -= 5;
	}

	// Check for unused parameters (basic heuristic)
	const paramMatches = content.match(/(\w+)\s*:\s*\w+/g);
	if (paramMatches) {
		paramMatches.forEach((param) => {
			const paramName = param.split(":")[0].trim();
			const usageCount = (content.match(new RegExp(`\\b${paramName}\\b`, "g")) || []).length;
			if (usageCount === 1) {
				warnings.push(`WARNING: Parameter '${paramName}' may be unused`);
				score -= 5;
			}
		});
	}

	return {
		passed: score >= 70,
		issues,
		warnings,
		score,
	};
}

async function main() {
	try {
		// Read hook input from stdin
		const input = await new Promise<string>((resolve) => {
			let data = "";
			process.stdin.on("data", (chunk) => (data += chunk));
			process.stdin.on("end", () => resolve(data));
		});

		const hookInput: HookInput = JSON.parse(input);

		// Only validate operations in src/tools/operations/
		const filePath = hookInput.tool_input.file_path || hookInput.tool_response?.filePath;
		if (!(filePath && filePath.includes("src/tools/operations/"))) {
			console.error(chalk.gray(`Skipping validation for ${filePath} (not an operation file)`));
			process.exit(0);
		}

		console.error(
			chalk.blue(`\n🔍 Validating ${path.basename(filePath)} for vaporware patterns...\n`),
		);

		// Read the file content
		const content = hookInput.tool_input.content || fs.readFileSync(filePath, "utf-8");

		// Perform static analysis first (fast)
		console.error(chalk.cyan("Running static analysis..."));
		const staticResult = performStaticAnalysis(content);

		console.error(chalk.cyan(`Static analysis score: ${staticResult.score}/100`));

		if (staticResult.issues.length > 0) {
			console.error(chalk.red("\n❌ Issues found:"));
			staticResult.issues.forEach((issue) => console.error(chalk.red(`  • ${issue}`)));
		}

		if (staticResult.warnings.length > 0) {
			console.error(chalk.yellow("\n⚠️  Warnings:"));
			staticResult.warnings.forEach((warning) => console.error(chalk.yellow(`  • ${warning}`)));
		}

		// If static analysis fails badly, run Claude validation
		if (staticResult.score < 70) {
			console.error(chalk.cyan("\n🤖 Running Claude Agent SDK validation...\n"));
			const claudeResult = await validateWithClaude(filePath, content);

			console.error(chalk.cyan(`Claude validation score: ${claudeResult.score}/100`));

			if (claudeResult.issues.length > 0) {
				console.error(chalk.red("\n❌ Claude found additional issues:"));
				claudeResult.issues.forEach((issue) => console.error(chalk.red(`  • ${issue}`)));
			}

			if (claudeResult.warnings.length > 0) {
				console.error(chalk.yellow("\n⚠️  Claude warnings:"));
				claudeResult.warnings.forEach((warning) => console.error(chalk.yellow(`  • ${warning}`)));
			}

			// Use the worse score
			const finalScore = Math.min(staticResult.score, claudeResult.score);
			const finalPassed = finalScore >= 70;

			if (!finalPassed) {
				console.error(chalk.red(`\n❌ VALIDATION FAILED (score: ${finalScore}/100)`));
				console.error(chalk.red("Please address the issues above before proceeding.\n"));
				process.exit(2); // Exit code 2 blocks the operation
			}
		}

		console.error(chalk.green(`\n✅ Validation passed (score: ${staticResult.score}/100)\n`));
		process.exit(0);
	} catch (error) {
		console.error(chalk.red("Hook execution error:"), error);
		process.exit(1);
	}
}

main();
