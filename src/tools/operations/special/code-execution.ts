/**
 * Code Execution Operation
 * Executes code in various languages with safety constraints and result analysis
 */

import type { OperationContext, OperationResult } from '../base.js';
import { BaseOperation } from '../base.js';
import { executePython } from '../../../utils/execution.js';
import type { CodeExecutionResult } from '../../../types/index.js';

/**
 * Code execution operation with integrated analysis and safety features
 */
export class CodeExecutionOperation extends BaseOperation {
  name = 'code-execution';
  category = 'special';

  async execute(context: OperationContext): Promise<OperationResult> {
    const code = this.getParam(context.parameters, 'code', context.prompt);
    const language = this.getParam(context.parameters, 'language', 'python') as 'python' | 'shell' | 'javascript';
    const timeoutMs = this.getParam(context.parameters, 'timeoutMs', 30000);
    const pythonCommand = this.getParam(context.parameters, 'pythonCommand', 'python3');
    const analyze = this.getParam(context.parameters, 'analyze', true);
    const safetyCheck = this.getParam(context.parameters, 'safetyCheck', true);

    // Safety checks
    if (safetyCheck) {
      const safetyIssues = this.performSafetyCheck(code, language);
      if (safetyIssues.length > 0) {
        return this.createResult({
          error: 'Safety check failed',
          safetyIssues,
          code,
          language,
          executed: false,
          suggestions: [
            'Review the code for potentially dangerous operations',
            'Disable safety check with safetyCheck: false if you trust the code',
            'Modify the code to remove unsafe operations'
          ]
        });
      }
    }

    let result: CodeExecutionResult;

    try {
      switch (language) {
        case 'python':
          result = await executePython(code, pythonCommand, timeoutMs);
          break;
        
        case 'shell':
          // Note: Shell execution would require additional security measures
          // For now, return an error suggesting alternative approaches
          return this.createResult({
            error: 'Shell execution not supported for security reasons',
            suggestions: [
              'Use Python for system operations with subprocess module',
              'Use JavaScript for text processing and data manipulation',
              'Consider using specialized tools through MCP servers'
            ],
            code,
            language,
            executed: false
          });

        case 'javascript':
          // Note: JavaScript execution would require a secure sandbox
          // For now, return an error suggesting alternatives
          return this.createResult({
            error: 'JavaScript execution not yet implemented',
            suggestions: [
              'Use Python for most computational tasks',
              'Consider using Node.js for JavaScript if available',
              'Use Python\'s json module for JSON processing'
            ],
            code,
            language,
            executed: false
          });

        default:
          return this.createResult({
            error: `Unsupported language: ${language}`,
            supportedLanguages: ['python'],
            code,
            language,
            executed: false
          });
      }
    } catch (error) {
      return this.createResult({
        error: `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
        code,
        language,
        executed: false
      });
    }

    // Analyze results if requested
    let analysis: any = undefined;
    if (analyze) {
      analysis = this.analyzeExecutionResult(result, code);
    }

    // Update KPIs
    context.sessionState.updateKPI('code_executions_total', 1, 'Total Code Executions');
    context.sessionState.updateKPI('code_execution_avg_time', result.durationMs, 'Average Execution Time (ms)');
    
    if (result.exitCode === 0) {
      context.sessionState.updateKPI('code_executions_successful', 1, 'Successful Executions');
    } else {
      context.sessionState.updateKPI('code_executions_failed', 1, 'Failed Executions');
    }

    // Generate suggestions based on results
    const suggestions = this.generateSuggestions(result, analysis);

    return this.createResult({
      language: result.language,
      code,
      executed: true,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: result.durationMs,
      success: result.exitCode === 0,
      hasOutput: result.stdout.length > 0,
      hasErrors: result.stderr.length > 0,
      analysis,
      suggestions,
      nextStepNeeded: result.exitCode !== 0 || (analyze && analysis?.issues?.length > 0)
    });
  }

  /**
   * Performs basic safety checks on code before execution
   */
  private performSafetyCheck(code: string, language: string): string[] {
    const issues: string[] = [];
    const lowerCode = code.toLowerCase();

    // Common dangerous patterns
    const dangerousPatterns = [
      { pattern: /import\s+os|from\s+os\s+import/, message: 'OS module usage detected - potential system access' },
      { pattern: /subprocess|popen|system/, message: 'Subprocess execution detected - potential command injection' },
      { pattern: /eval\s*\(|exec\s*\(/, message: 'Dynamic code execution detected - potential code injection' },
      { pattern: /open\s*\(.*['"](\/|\\\\|\.\.)/g, message: 'File access outside current directory detected' },
      { pattern: /socket|urllib|requests\.get|requests\.post/i, message: 'Network access detected - potential data exfiltration' },
      { pattern: /\bfile\s*=|mode\s*=\s*['"]w/, message: 'File writing detected - potential data modification' },
      { pattern: /rm\s+|del\s+|unlink|remove\(/i, message: 'File deletion operations detected' },
      { pattern: /while\s+true|for.*range\(.*,.*,-1\)|while\s+1/, message: 'Potential infinite loop detected' }
    ];

    // Language-specific checks
    if (language === 'python') {
      dangerousPatterns.push(
        { pattern: /__import__|getattr|setattr|delattr/, message: 'Dynamic attribute access detected' },
        { pattern: /pickle\.loads|pickle\.load/, message: 'Pickle deserialization detected - potential code execution' },
        { pattern: /input\s*\((?!['"])/g, message: 'Unsafe input() usage detected' }
      );
    }

    // Check for dangerous patterns
    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        issues.push(message);
      }
    }

    // Check for excessively large numbers (potential DoS)
    const largeNumbers = code.match(/\b\d{8,}\b/g);
    if (largeNumbers && largeNumbers.length > 0) {
      issues.push('Large numbers detected - potential resource exhaustion');
    }

    // Check for very long strings (potential memory issues)
    const longStrings = code.match(/['"][^'"]{1000,}['"]/g);
    if (longStrings && longStrings.length > 0) {
      issues.push('Very long strings detected - potential memory issues');
    }

    return issues;
  }

  /**
   * Analyzes execution results for patterns, issues, and insights
   */
  private analyzeExecutionResult(result: CodeExecutionResult, code: string): any {
    const analysis: any = {
      performance: {
        executionTime: result.durationMs,
        performanceCategory: result.durationMs < 100 ? 'fast' : 
                           result.durationMs < 1000 ? 'moderate' : 'slow'
      },
      output: {
        hasStdout: result.stdout.length > 0,
        hasStderr: result.stderr.length > 0,
        outputLength: result.stdout.length,
        errorLength: result.stderr.length
      },
      issues: [] as string[],
      insights: [] as string[]
    };

    // Analyze exit code
    if (result.exitCode !== 0) {
      analysis.issues.push(`Non-zero exit code (${result.exitCode}) indicates execution error`);
    }

    // Analyze stderr for common error patterns
    if (result.stderr) {
      const errorPatterns = [
        { pattern: /SyntaxError/i, message: 'Syntax error detected - check code syntax' },
        { pattern: /NameError/i, message: 'Name error - undefined variable or function' },
        { pattern: /TypeError/i, message: 'Type error - incorrect data type usage' },
        { pattern: /ValueError/i, message: 'Value error - invalid value for operation' },
        { pattern: /IndexError/i, message: 'Index error - accessing invalid array/list index' },
        { pattern: /KeyError/i, message: 'Key error - accessing invalid dictionary key' },
        { pattern: /ImportError|ModuleNotFoundError/i, message: 'Import error - missing module or package' },
        { pattern: /MemoryError/i, message: 'Memory error - insufficient memory available' },
        { pattern: /RecursionError/i, message: 'Recursion error - maximum recursion depth exceeded' }
      ];

      for (const { pattern, message } of errorPatterns) {
        if (pattern.test(result.stderr)) {
          analysis.issues.push(message);
        }
      }
    }

    // Analyze stdout for patterns
    if (result.stdout) {
      // Check for data patterns
      if (/\d+\.\d+/.test(result.stdout)) {
        analysis.insights.push('Floating-point numbers detected in output');
      }
      if (/\[.*\]|\{.*\}/.test(result.stdout)) {
        analysis.insights.push('Structured data (lists/dicts) detected in output');
      }
      if (result.stdout.split('\n').length > 10) {
        analysis.insights.push('Multi-line output suggests iterative processing');
      }
    }

    // Analyze code structure
    const codeMetrics = this.analyzeCodeStructure(code);
    analysis.codeMetrics = codeMetrics;

    // Performance insights
    if (result.durationMs > 5000) {
      analysis.insights.push('Long execution time - consider optimization');
    }
    if (result.durationMs < 10) {
      analysis.insights.push('Very fast execution - simple computation or cached result');
    }

    return analysis;
  }

  /**
   * Analyzes code structure and complexity
   */
  private analyzeCodeStructure(code: string): any {
    const lines = code.split('\n');
    const metrics = {
      totalLines: lines.length,
      nonEmptyLines: lines.filter(line => line.trim().length > 0).length,
      comments: lines.filter(line => line.trim().startsWith('#')).length,
      functions: (code.match(/def\s+\w+/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      imports: (code.match(/^(import|from)\s+/gm) || []).length,
      loops: (code.match(/\b(for|while)\s+/g) || []).length,
      conditionals: (code.match(/\b(if|elif|else)\s+/g) || []).length,
      complexity: 'simple' as 'simple' | 'moderate' | 'complex'
    };

    // Estimate complexity
    const complexityScore = metrics.functions * 2 + metrics.classes * 3 + 
                          metrics.loops * 2 + metrics.conditionals + metrics.nonEmptyLines / 10;
    
    if (complexityScore > 20) {
      metrics.complexity = 'complex';
    } else if (complexityScore > 8) {
      metrics.complexity = 'moderate';
    }

    return metrics;
  }

  /**
   * Generates suggestions based on execution results and analysis
   */
  private generateSuggestions(result: CodeExecutionResult, analysis?: any): string[] {
    const suggestions: string[] = [];

    if (result.exitCode !== 0) {
      suggestions.push('Fix execution errors before proceeding');
      if (result.stderr) {
        suggestions.push('Check stderr output for specific error details');
      }
    }

    if (analysis) {
      if (analysis.performance.executionTime > 5000) {
        suggestions.push('Consider optimizing code for better performance');
        suggestions.push('Profile the code to identify bottlenecks');
      }

      if (analysis.codeMetrics.complexity === 'complex') {
        suggestions.push('Consider breaking down complex code into smaller functions');
        suggestions.push('Add comments to improve code readability');
      }

      if (analysis.issues.length > 0) {
        suggestions.push('Address the identified issues for robust execution');
      }
    }

    if (result.stdout && result.stdout.length > 1000) {
      suggestions.push('Large output detected - consider data summarization');
    }

    if (!result.stdout && !result.stderr && result.exitCode === 0) {
      suggestions.push('Silent execution - consider adding output statements for verification');
    }

    return suggestions;
  }
}