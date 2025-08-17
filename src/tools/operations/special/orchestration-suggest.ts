/**
 * Orchestration Suggest Operation
 * Analyzes context and suggests optimal operation orchestration patterns
 */

import type { OperationContext, OperationResult } from '../base.js';
import { BaseOperation } from '../base.js';

/**
 * Interface for operation suggestion
 */
interface OperationSuggestion {
  operation: string;
  category: string;
  priority: number;
  rationale: string;
  parameters?: Record<string, unknown>;
  prerequisites?: string[];
  followUp?: string[];
}

/**
 * Interface for orchestration pattern
 */
interface OrchestrationPattern {
  name: string;
  description: string;
  operations: OperationSuggestion[];
  useCase: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTimeMinutes: number;
}

/**
 * Orchestration suggestion operation for optimizing operation workflows
 */
export class OrchestrationSuggestOperation extends BaseOperation {
  name = 'orchestration-suggest';
  category = 'special';

  async execute(context: OperationContext): Promise<OperationResult> {
    const analysisType = this.getParam(context.parameters, 'analysisType', 'comprehensive') as 
      'quick' | 'comprehensive' | 'domain-specific';
    const domain = this.getParam(context.parameters, 'domain', '');
    const complexity = this.getParam(context.parameters, 'complexity', 'auto') as 
      'simple' | 'moderate' | 'complex' | 'auto';
    const timeConstraint = this.getParam(context.parameters, 'timeConstraintMinutes', 0);
    const currentOperations = this.getParam(context.parameters, 'currentOperations', []) as string[];

    // Analyze the context and prompt
    const contextAnalysis = this.analyzeContext(context.prompt, domain, currentOperations);
    
    // Generate operation suggestions based on analysis
    const suggestions = this.generateOperationSuggestions(contextAnalysis, complexity);
    
    // Create orchestration patterns
    const patterns = this.createOrchestrationPatterns(suggestions, contextAnalysis, timeConstraint);
    
    // Select best pattern based on criteria
    const recommendedPattern = this.selectOptimalPattern(patterns, complexity, timeConstraint);
    
    // Generate alternative approaches
    const alternatives = patterns.filter(p => p !== recommendedPattern).slice(0, 3);

    // Update KPIs
    context.sessionState.updateKPI('orchestration_suggestions_generated', patterns.length, 'Orchestration Patterns Generated');
    context.sessionState.updateKPI('orchestration_complexity_score', this.calculateComplexityScore(recommendedPattern), 'Pattern Complexity Score');

    return this.createResult({
      contextAnalysis: {
        problemType: contextAnalysis.problemType,
        complexity: contextAnalysis.complexity,
        domains: contextAnalysis.domains,
        requiredCapabilities: contextAnalysis.requiredCapabilities,
        timeEstimate: contextAnalysis.timeEstimate
      },
      recommendedPattern: {
        name: recommendedPattern.name,
        description: recommendedPattern.description,
        complexity: recommendedPattern.complexity,
        estimatedTimeMinutes: recommendedPattern.estimatedTimeMinutes,
        operations: recommendedPattern.operations.map(op => ({
          operation: op.operation,
          category: op.category,
          priority: op.priority,
          rationale: op.rationale,
          parameters: op.parameters,
          prerequisites: op.prerequisites,
          followUp: op.followUp
        }))
      },
      alternatives: alternatives.map(alt => ({
        name: alt.name,
        description: alt.description,
        complexity: alt.complexity,
        estimatedTimeMinutes: alt.estimatedTimeMinutes,
        operationCount: alt.operations.length
      })),
      executionPlan: this.generateExecutionPlan(recommendedPattern),
      optimization: this.generateOptimizationSuggestions(recommendedPattern, contextAnalysis),
      warnings: this.generateWarnings(recommendedPattern, contextAnalysis),
      nextStepNeeded: true,
      suggestedFirstOperation: recommendedPattern.operations[0]?.operation || 'sequential-thinking'
    });
  }

  /**
   * Analyzes the context to understand problem type and requirements
   */
  private analyzeContext(prompt: string, domain: string, currentOperations: string[]): any {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect problem type
    let problemType = 'general';
    if (lowerPrompt.includes('debug') || lowerPrompt.includes('error') || lowerPrompt.includes('fix')) {
      problemType = 'debugging';
    } else if (lowerPrompt.includes('decide') || lowerPrompt.includes('choose') || lowerPrompt.includes('option')) {
      problemType = 'decision';
    } else if (lowerPrompt.includes('create') || lowerPrompt.includes('design') || lowerPrompt.includes('innovate')) {
      problemType = 'creative';
    } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('understand') || lowerPrompt.includes('research')) {
      problemType = 'analytical';
    } else if (lowerPrompt.includes('system') || lowerPrompt.includes('architecture') || lowerPrompt.includes('complex')) {
      problemType = 'systems';
    } else if (lowerPrompt.includes('experiment') || lowerPrompt.includes('hypothesis') || lowerPrompt.includes('test')) {
      problemType = 'scientific';
    }

    // Detect complexity indicators
    const complexityIndicators = [
      'multiple', 'various', 'complex', 'complicated', 'intricate', 'multifaceted',
      'interdependent', 'comprehensive', 'thorough', 'deep', 'extensive'
    ];
    const complexityScore = complexityIndicators.filter(word => lowerPrompt.includes(word)).length;
    
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (complexityScore > 3 || prompt.length > 500) {
      complexity = 'complex';
    } else if (complexityScore > 1 || prompt.length > 200) {
      complexity = 'moderate';
    }

    // Detect domains
    const domains = [];
    if (domain) domains.push(domain);
    
    const domainKeywords = {
      technical: ['code', 'programming', 'software', 'algorithm', 'technical'],
      business: ['business', 'strategy', 'market', 'customer', 'revenue'],
      scientific: ['research', 'experiment', 'hypothesis', 'data', 'analysis'],
      creative: ['design', 'creative', 'innovative', 'artistic', 'original'],
      educational: ['learn', 'teach', 'explain', 'understand', 'knowledge']
    };

    for (const [domainName, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        domains.push(domainName);
      }
    }

    // Determine required capabilities
    const requiredCapabilities = [];
    const capabilityMap = {
      'logical reasoning': ['logic', 'reasoning', 'deduction', 'inference'],
      'creative thinking': ['creative', 'innovative', 'brainstorm', 'ideate'],
      'analytical skills': ['analyze', 'examine', 'investigate', 'study'],
      'decision making': ['decide', 'choose', 'select', 'option'],
      'problem solving': ['solve', 'resolve', 'fix', 'address'],
      'systems thinking': ['system', 'holistic', 'interconnected', 'ecosystem'],
      'collaboration': ['team', 'group', 'collaborate', 'consensus']
    };

    for (const [capability, keywords] of Object.entries(capabilityMap)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        requiredCapabilities.push(capability);
      }
    }

    // Estimate time requirement
    let timeEstimate = 15; // Default 15 minutes
    if (complexity === 'complex') timeEstimate = 45;
    else if (complexity === 'moderate') timeEstimate = 25;
    
    if (currentOperations.length > 0) {
      timeEstimate += currentOperations.length * 5; // Add 5 minutes per existing operation
    }

    return {
      problemType,
      complexity,
      domains,
      requiredCapabilities,
      timeEstimate,
      hasExistingContext: currentOperations.length > 0
    };
  }

  /**
   * Generates operation suggestions based on context analysis
   */
  private generateOperationSuggestions(contextAnalysis: any, requestedComplexity: string): OperationSuggestion[] {
    const suggestions: OperationSuggestion[] = [];
    
    // Base operation based on problem type
    switch (contextAnalysis.problemType) {
      case 'debugging':
        suggestions.push({
          operation: 'debugging-approach',
          category: 'core',
          priority: 1,
          rationale: 'Primary debugging approach for systematic problem resolution'
        });
        break;
        
      case 'decision':
        suggestions.push({
          operation: 'decision-framework',
          category: 'collaborative',
          priority: 1,
          rationale: 'Structured decision-making process for option evaluation'
        });
        break;
        
      case 'creative':
        suggestions.push({
          operation: 'creative-thinking',
          category: 'core',
          priority: 1,
          rationale: 'Creative ideation and innovation processes'
        });
        break;
        
      case 'analytical':
        suggestions.push({
          operation: 'sequential-thinking',
          category: 'core',
          priority: 1,
          rationale: 'Systematic analytical thinking process'
        });
        break;
        
      case 'systems':
        suggestions.push({
          operation: 'systems-thinking',
          category: 'collaborative',
          priority: 1,
          rationale: 'Holistic systems analysis and understanding'
        });
        break;
        
      case 'scientific':
        suggestions.push({
          operation: 'scientific-method',
          category: 'core',
          priority: 1,
          rationale: 'Hypothesis-driven scientific investigation'
        });
        break;
        
      default:
        suggestions.push({
          operation: 'sequential-thinking',
          category: 'core',
          priority: 1,
          rationale: 'General-purpose systematic thinking approach'
        });
    }

    // Add complexity-appropriate operations
    if (contextAnalysis.complexity === 'complex' || requestedComplexity === 'complex') {
      suggestions.push({
        operation: 'tree-of-thought',
        category: 'patterns',
        priority: 2,
        rationale: 'Multi-branch exploration for complex problems'
      });
      
      suggestions.push({
        operation: 'collaborative-reasoning',
        category: 'collaborative',
        priority: 3,
        rationale: 'Multiple perspective analysis for comprehensive understanding'
      });
    }

    // Add domain-specific operations
    if (contextAnalysis.domains.includes('technical')) {
      suggestions.push({
        operation: 'code-execution',
        category: 'special',
        priority: 4,
        rationale: 'Execute and validate technical solutions'
      });
    }

    // Add meta-operations for complex workflows
    if (contextAnalysis.complexity !== 'simple') {
      suggestions.push({
        operation: 'metacognitive-monitoring',
        category: 'core',
        priority: 5,
        rationale: 'Monitor thinking process and confidence levels'
      });
    }

    // Add advanced patterns if needed
    if (contextAnalysis.requiredCapabilities.includes('decision making')) {
      suggestions.push({
        operation: 'beam-search',
        category: 'patterns',
        priority: 6,
        rationale: 'Explore multiple promising decision paths'
      });
    }

    return suggestions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Creates orchestration patterns from suggestions
   */
  private createOrchestrationPatterns(suggestions: OperationSuggestion[], contextAnalysis: any, timeConstraint: number): OrchestrationPattern[] {
    const patterns: OrchestrationPattern[] = [];

    // Simple sequential pattern
    patterns.push({
      name: 'Sequential Exploration',
      description: 'Linear progression through key thinking operations',
      operations: suggestions.slice(0, 3),
      useCase: 'Well-defined problems with clear progression',
      complexity: 'simple',
      estimatedTimeMinutes: Math.min(20, timeConstraint || 30)
    });

    // Parallel analysis pattern
    if (suggestions.length >= 4) {
      patterns.push({
        name: 'Parallel Analysis',
        description: 'Multiple simultaneous approaches for comprehensive coverage',
        operations: suggestions.slice(0, 4).map((op, index) => ({
          ...op,
          priority: index < 2 ? 1 : 2 // First two operations in parallel
        })),
        useCase: 'Complex problems requiring multiple perspectives',
        complexity: 'moderate',
        estimatedTimeMinutes: Math.min(35, timeConstraint || 45)
      });
    }

    // Deep dive pattern
    if (contextAnalysis.complexity === 'complex') {
      patterns.push({
        name: 'Deep Dive Investigation',
        description: 'Thorough multi-stage analysis with validation loops',
        operations: [
          ...suggestions.slice(0, 2),
          {
            operation: 'metacognitive-monitoring',
            category: 'core',
            priority: 3,
            rationale: 'Monitor progress and adjust approach'
          },
          ...suggestions.slice(2, 5),
          {
            operation: 'structured-argumentation',
            category: 'collaborative',
            priority: 6,
            rationale: 'Validate conclusions through argumentation'
          }
        ],
        useCase: 'High-stakes decisions requiring thorough analysis',
        complexity: 'complex',
        estimatedTimeMinutes: Math.min(60, timeConstraint || 75)
      });
    }

    // Agile iterative pattern
    patterns.push({
      name: 'Agile Iteration',
      description: 'Fast iterative cycles with continuous refinement',
      operations: [
        suggestions[0],
        {
          operation: 'ooda-loop',
          category: 'metagame',
          priority: 2,
          rationale: 'Rapid observe-orient-decide-act cycles'
        },
        suggestions[1] || suggestions[0]
      ],
      useCase: 'Dynamic environments requiring rapid adaptation',
      complexity: 'moderate',
      estimatedTimeMinutes: Math.min(25, timeConstraint || 30)
    });

    // Time-boxed pattern for constraints
    if (timeConstraint > 0 && timeConstraint < 30) {
      patterns.push({
        name: 'Time-Boxed Focus',
        description: 'Optimized for strict time constraints',
        operations: [
          {
            operation: 'ulysses-protocol',
            category: 'metagame',
            priority: 1,
            rationale: 'Enforce time limits and prevent scope creep',
            parameters: { timeboxMs: timeConstraint * 60 * 1000 }
          },
          suggestions[0]
        ],
        useCase: 'Urgent decisions with strict time limits',
        complexity: 'simple',
        estimatedTimeMinutes: timeConstraint
      });
    }

    return patterns;
  }

  /**
   * Selects the optimal pattern based on criteria
   */
  private selectOptimalPattern(patterns: OrchestrationPattern[], complexity: string, timeConstraint: number): OrchestrationPattern {
    let scores = patterns.map(pattern => {
      let score = 0;
      
      // Complexity match
      if (complexity === 'auto') {
        score += 10; // No penalty for auto
      } else if (pattern.complexity === complexity) {
        score += 20;
      } else {
        score -= 5;
      }
      
      // Time constraint match
      if (timeConstraint > 0) {
        if (pattern.estimatedTimeMinutes <= timeConstraint) {
          score += 15;
        } else {
          score -= (pattern.estimatedTimeMinutes - timeConstraint) * 2;
        }
      }
      
      // Operation count balance
      const opCount = pattern.operations.length;
      if (opCount >= 2 && opCount <= 4) {
        score += 10;
      } else if (opCount > 4) {
        score -= (opCount - 4) * 3;
      }
      
      return { pattern, score };
    });
    
    return scores.sort((a, b) => b.score - a.score)[0].pattern;
  }

  /**
   * Generates a detailed execution plan
   */
  private generateExecutionPlan(pattern: OrchestrationPattern): any {
    const plan = {
      phases: [] as any[],
      totalEstimatedTime: pattern.estimatedTimeMinutes,
      criticalPath: [] as string[],
      parallelizable: [] as string[][]
    };

    // Group operations by priority for phasing
    const priorityGroups = new Map<number, OperationSuggestion[]>();
    pattern.operations.forEach(op => {
      if (!priorityGroups.has(op.priority)) {
        priorityGroups.set(op.priority, []);
      }
      priorityGroups.get(op.priority)!.push(op);
    });

    // Create phases
    for (const [priority, operations] of Array.from(priorityGroups.entries()).sort((a, b) => a[0] - b[0])) {
      const phase = {
        phase: priority,
        operations: operations.map(op => op.operation),
        canRunInParallel: operations.length > 1,
        estimatedMinutes: Math.ceil(pattern.estimatedTimeMinutes / priorityGroups.size),
        dependencies: operations.flatMap(op => op.prerequisites || [])
      };
      
      plan.phases.push(phase);
      
      if (operations.length === 1) {
        plan.criticalPath.push(operations[0].operation);
      } else {
        plan.parallelizable.push(operations.map(op => op.operation));
      }
    }

    return plan;
  }

  /**
   * Generates optimization suggestions
   */
  private generateOptimizationSuggestions(pattern: OrchestrationPattern, contextAnalysis: any): string[] {
    const suggestions = [];

    if (pattern.operations.length > 5) {
      suggestions.push('Consider running some operations in parallel to reduce total time');
    }

    if (pattern.complexity === 'complex' && contextAnalysis.timeEstimate < 30) {
      suggestions.push('Complex pattern may require more time than estimated - consider simpler approach');
    }

    if (pattern.operations.some(op => op.operation === 'collaborative-reasoning') && !contextAnalysis.hasExistingContext) {
      suggestions.push('Collaborative reasoning works best with established context - consider starting with sequential thinking');
    }

    if (contextAnalysis.domains.includes('technical') && !pattern.operations.some(op => op.operation === 'code-execution')) {
      suggestions.push('Consider adding code execution for technical validation');
    }

    return suggestions;
  }

  /**
   * Generates warnings about potential issues
   */
  private generateWarnings(pattern: OrchestrationPattern, contextAnalysis: any): string[] {
    const warnings = [];

    if (pattern.estimatedTimeMinutes > 60) {
      warnings.push('Long execution time estimated - consider breaking into smaller sessions');
    }

    if (pattern.operations.length > 6) {
      warnings.push('High number of operations may lead to context switching overhead');
    }

    if (contextAnalysis.complexity === 'simple' && pattern.complexity === 'complex') {
      warnings.push('Pattern complexity may exceed problem requirements');
    }

    return warnings;
  }

  /**
   * Calculates complexity score for a pattern
   */
  private calculateComplexityScore(pattern: OrchestrationPattern): number {
    let score = 0;
    score += pattern.operations.length * 2;
    score += pattern.complexity === 'simple' ? 1 : pattern.complexity === 'moderate' ? 3 : 5;
    score += Math.floor(pattern.estimatedTimeMinutes / 10);
    return score;
  }
}