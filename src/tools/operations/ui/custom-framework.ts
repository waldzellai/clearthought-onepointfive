/**
 * Custom Framework Operation
 * 
 * Creates custom reasoning frameworks tailored to specific domains or problems
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class CustomFrameworkOperation extends BaseOperation {
  name = 'custom_framework';
  category = 'ui';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract framework configuration
    const frameworkName = this.getParam(parameters, 'name', 'Custom Reasoning Framework');
    const domain = this.getParam(parameters, 'domain', 'General');
    const steps = this.getParam(parameters, 'steps', []);
    const principles = this.getParam(parameters, 'principles', []);
    const constraints = this.getParam(parameters, 'constraints', []);
    const outputs = this.getParam(parameters, 'outputs', []);
    
    // Generate framework structure
    const framework = this.buildFramework({
      name: frameworkName,
      domain,
      prompt,
      steps: steps.length > 0 ? steps : this.generateDefaultSteps(prompt, domain),
      principles: principles.length > 0 ? principles : this.generateDefaultPrinciples(domain),
      constraints: constraints.length > 0 ? constraints : this.generateDefaultConstraints(domain),
      outputs: outputs.length > 0 ? outputs : this.generateDefaultOutputs(domain)
    });
    
    // Create framework documentation
    const documentation = this.generateFrameworkDocumentation(framework);
    
    // Store framework in session
    const frameworkId = `framework_${Date.now()}`;
    sessionState.addToSession('customFrameworks', {
      id: frameworkId,
      framework,
      createdAt: new Date().toISOString(),
      appliedTo: prompt
    });
    
    return this.createResult({
      frameworkId,
      framework,
      documentation,
      applicationGuidance: this.generateApplicationGuidance(framework),
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
        frameworkCount: sessionState.getFromSession('customFrameworks')?.length || 1
      },
      instructions: {
        usage: 'Apply this framework systematically to analyze complex problems',
        adaptation: 'Framework can be modified for specific use cases or domains',
        integration: 'Combine with other Clear Thought operations for comprehensive analysis'
      }
    });
  }
  
  /**
   * Build complete framework structure
   */
  private buildFramework(config: {
    name: string;
    domain: string;
    prompt: string;
    steps: string[];
    principles: string[];
    constraints: string[];
    outputs: string[];
  }) {
    return {
      metadata: {
        name: config.name,
        domain: config.domain,
        version: '1.0',
        createdAt: new Date().toISOString(),
        appliedTo: config.prompt
      },
      structure: {
        phases: this.createPhases(config.steps),
        principles: config.principles,
        constraints: config.constraints,
        expectedOutputs: config.outputs
      },
      implementation: {
        checkpoints: this.generateCheckpoints(config.steps),
        qualityGates: this.generateQualityGates(config.principles),
        validationCriteria: this.generateValidationCriteria(config.outputs)
      }
    };
  }
  
  /**
   * Generate default steps based on domain
   */
  private generateDefaultSteps(prompt: string, domain: string): string[] {
    const baseSteps = [
      'Problem Definition and Scope',
      'Context Analysis and Constraints',
      'Stakeholder Identification',
      'Option Generation',
      'Evaluation and Analysis',
      'Decision Making',
      'Implementation Planning',
      'Review and Iteration'
    ];
    
    // Domain-specific customizations
    switch (domain.toLowerCase()) {
      case 'technical':
      case 'engineering':
        return [
          'Technical Requirements Analysis',
          'Architecture and Design Review',
          'Implementation Feasibility',
          'Risk Assessment',
          'Testing Strategy',
          'Deployment Planning',
          'Performance Validation',
          'Maintenance Planning'
        ];
      
      case 'business':
      case 'strategy':
        return [
          'Market Analysis',
          'Competitive Landscape',
          'Value Proposition Design',
          'Resource Requirements',
          'Financial Modeling',
          'Risk Assessment',
          'Go-to-Market Strategy',
          'Success Metrics'
        ];
      
      case 'scientific':
      case 'research':
        return [
          'Literature Review',
          'Hypothesis Formation',
          'Methodology Design',
          'Data Collection Strategy',
          'Analysis Framework',
          'Result Interpretation',
          'Peer Review Preparation',
          'Publication Strategy'
        ];
      
      default:
        return baseSteps;
    }
  }
  
  /**
   * Generate default principles based on domain
   */
  private generateDefaultPrinciples(domain: string): string[] {
    const basePrinciples = [
      'Systematic and thorough analysis',
      'Evidence-based reasoning',
      'Multiple perspective consideration',
      'Iterative refinement',
      'Clear documentation'
    ];
    
    switch (domain.toLowerCase()) {
      case 'technical':
        return [
          'Modularity and maintainability',
          'Performance and scalability',
          'Security by design',
          'User-centered design',
          'Code quality and testing'
        ];
      
      case 'business':
        return [
          'Customer value creation',
          'Sustainable competitive advantage',
          'Resource optimization',
          'Risk management',
          'Stakeholder alignment'
        ];
      
      case 'scientific':
        return [
          'Reproducibility and transparency',
          'Peer review and validation',
          'Ethical considerations',
          'Statistical significance',
          'Theoretical grounding'
        ];
      
      default:
        return basePrinciples;
    }
  }
  
  /**
   * Generate default constraints
   */
  private generateDefaultConstraints(domain: string): string[] {
    return [
      'Time and resource limitations',
      'Regulatory and compliance requirements',
      'Technical feasibility bounds',
      'Budget constraints',
      'Stakeholder acceptance criteria'
    ];
  }
  
  /**
   * Generate default outputs
   */
  private generateDefaultOutputs(domain: string): string[] {
    return [
      'Clear problem statement',
      'Comprehensive analysis report',
      'Recommended solution',
      'Implementation roadmap',
      'Risk mitigation plan',
      'Success metrics and KPIs'
    ];
  }
  
  /**
   * Create phases from steps
   */
  private createPhases(steps: string[]) {
    return steps.map((step, index) => ({
      phase: index + 1,
      name: step,
      description: `Execute ${step.toLowerCase()} systematically`,
      deliverables: [`${step} analysis document`, `${step} validation checklist`],
      duration: 'Variable based on complexity'
    }));
  }
  
  /**
   * Generate checkpoints for quality control
   */
  private generateCheckpoints(steps: string[]) {
    return steps.map((step, index) => ({
      checkpoint: index + 1,
      phase: step,
      criteria: [
        'Deliverables complete and reviewed',
        'Quality standards met',
        'Stakeholder approval obtained',
        'Ready to proceed to next phase'
      ]
    }));
  }
  
  /**
   * Generate quality gates
   */
  private generateQualityGates(principles: string[]) {
    return principles.map(principle => ({
      principle,
      validationMethod: `Assess adherence to ${principle.toLowerCase()}`,
      passCriteria: 'Meets or exceeds established standards'
    }));
  }
  
  /**
   * Generate validation criteria
   */
  private generateValidationCriteria(outputs: string[]) {
    return outputs.map(output => ({
      output,
      criteria: [
        'Completeness and accuracy',
        'Clarity and readability',
        'Actionability',
        'Stakeholder alignment'
      ]
    }));
  }
  
  /**
   * Generate framework documentation
   */
  private generateFrameworkDocumentation(framework: any): string {
    return `
# ${framework.metadata.name}

**Domain:** ${framework.metadata.domain}  
**Version:** ${framework.metadata.version}  
**Created:** ${new Date(framework.metadata.createdAt).toLocaleDateString()}

## Overview
This custom reasoning framework provides a structured approach to ${framework.metadata.domain.toLowerCase()} problem-solving and analysis.

## Framework Structure

### Phases
${framework.structure.phases.map((phase: any, index: number) => `
${index + 1}. **${phase.name}**
   - ${phase.description}
   - Deliverables: ${phase.deliverables.join(', ')}
`).join('')}

### Guiding Principles
${framework.structure.principles.map((principle: string) => `- ${principle}`).join('\n')}

### Constraints
${framework.structure.constraints.map((constraint: string) => `- ${constraint}`).join('\n')}

### Expected Outputs
${framework.structure.expectedOutputs.map((output: string) => `- ${output}`).join('\n')}

## Implementation Guide

### Quality Checkpoints
${framework.implementation.checkpoints.map((cp: any) => `
**Phase ${cp.checkpoint}: ${cp.phase}**
${cp.criteria.map((criterion: string) => `- [ ] ${criterion}`).join('\n')}
`).join('')}

## Usage Instructions
1. Follow phases sequentially
2. Complete all checkpoints before proceeding
3. Validate outputs against quality criteria
4. Iterate as needed for improvement
    `;
  }
  
  /**
   * Generate application guidance
   */
  private generateApplicationGuidance(framework: any) {
    return {
      stepByStep: framework.structure.phases.map((phase: any) => ({
        phase: phase.name,
        actions: [
          `Begin ${phase.name.toLowerCase()}`,
          'Gather required information and resources',
          'Apply relevant analysis techniques',
          'Document findings and insights',
          'Validate against quality criteria',
          'Prepare for next phase'
        ]
      })),
      bestPractices: [
        'Maintain clear documentation throughout',
        'Engage stakeholders at key decision points',
        'Validate assumptions early and often',
        'Plan for iteration and refinement',
        'Consider long-term implications'
      ],
      commonPitfalls: [
        'Rushing through phases without validation',
        'Ignoring stakeholder input',
        'Insufficient documentation',
        'Scope creep and mission drift',
        'Overcomplicating simple problems'
      ]
    };
  }
}

export default new CustomFrameworkOperation();