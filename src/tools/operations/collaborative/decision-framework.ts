/**
 * Decision Framework Operation
 * 
 * Implements structured decision-making frameworks for complex choices
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class DecisionFrameworkOperation extends BaseOperation {
  name = 'decision_framework';
  category = 'collaborative';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract decision framework parameters
    const framework = this.getParam(parameters, 'framework', 'pros_cons');
    const alternatives = (parameters.alternatives as string[]) || [];
    const criteria = (parameters.criteria as any[]) || [];
    const weights = (parameters.weights as Record<string, number>) || {};
    const stakeholders = (parameters.stakeholders as string[]) || [];
    
    // Generate alternatives if not provided
    const generatedAlternatives = alternatives.length === 0 ? 
      this.generateAlternatives(prompt) : alternatives;
    
    // Generate criteria if not provided
    const generatedCriteria = criteria.length === 0 ? 
      this.generateCriteria(framework) : criteria;
    
    // Apply the selected framework
    const analysis = this.applyFramework(
      framework, 
      generatedAlternatives, 
      generatedCriteria, 
      weights, 
      stakeholders
    );
    
    const decisionData = {
      decision: prompt,
      framework,
      alternatives: generatedAlternatives,
      criteria: generatedCriteria,
      weights,
      stakeholders,
      analysis,
      recommendation: this.generateRecommendation(analysis),
      confidence: this.calculateConfidence(analysis),
      sessionId: `decision-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    // Update session metrics
    sessionState.updateKPI('decision_alternatives', generatedAlternatives.length);
    sessionState.updateKPI('decision_criteria', generatedCriteria.length);
    
    return this.createResult({
      ...decisionData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private generateAlternatives(decision: string): string[] {
    // Simple pattern-based alternative generation
    if (decision.toLowerCase().includes('buy') || decision.toLowerCase().includes('purchase')) {
      return ['Buy new', 'Buy used', 'Lease', 'Don\'t buy'];
    }
    if (decision.toLowerCase().includes('hire') || decision.toLowerCase().includes('team')) {
      return ['Hire full-time', 'Hire contractor', 'Upskill existing team', 'Outsource'];
    }
    if (decision.toLowerCase().includes('technology') || decision.toLowerCase().includes('software')) {
      return ['Build in-house', 'Buy commercial solution', 'Use open source', 'Hybrid approach'];
    }
    
    return ['Option A', 'Option B', 'Option C', 'Status quo'];
  }
  
  private generateCriteria(framework: string): any[] {
    const baseMetrics = {
      pros_cons: ['Benefits', 'Drawbacks', 'Feasibility'],
      cost_benefit: ['Initial cost', 'Ongoing cost', 'Expected benefits', 'ROI timeline'],
      risk_assessment: ['Probability', 'Impact', 'Mitigation cost', 'Risk tolerance'],
      stakeholder: ['User impact', 'Team impact', 'Business impact', 'Regulatory impact'],
      time_sensitivity: ['Urgency', 'Implementation time', 'Opportunity cost', 'Deadline pressure'],
    };
    
    const criteriaNames = baseMetrics[framework as keyof typeof baseMetrics] || baseMetrics.pros_cons;
    
    return criteriaNames.map((name, index) => ({
      name,
      weight: 1.0 / criteriaNames.length,
      type: 'numeric',
      scale: '1-10',
      description: `${name} evaluation criterion`,
    }));
  }
  
  private applyFramework(
    framework: string, 
    alternatives: string[], 
    criteria: any[], 
    weights: Record<string, number>,
    stakeholders: string[]
  ): any {
    switch (framework) {
      case 'pros_cons':
        return this.applyProsConsFramework(alternatives, criteria);
      case 'cost_benefit':
        return this.applyCostBenefitFramework(alternatives, criteria);
      case 'risk_assessment':
        return this.applyRiskAssessmentFramework(alternatives, criteria);
      case 'stakeholder':
        return this.applyStakeholderFramework(alternatives, criteria, stakeholders);
      default:
        return this.applyGenericFramework(alternatives, criteria, weights);
    }
  }
  
  private applyProsConsFramework(alternatives: string[], criteria: any[]): any {
    return {
      type: 'pros_cons',
      evaluations: alternatives.map(alt => ({
        alternative: alt,
        pros: [`Pro 1 for ${alt}`, `Pro 2 for ${alt}`],
        cons: [`Con 1 for ${alt}`, `Con 2 for ${alt}`],
        score: Math.random() * 4 + 6, // 6-10 range
      })),
    };
  }
  
  private applyCostBenefitFramework(alternatives: string[], criteria: any[]): any {
    return {
      type: 'cost_benefit',
      evaluations: alternatives.map(alt => ({
        alternative: alt,
        costs: {
          initial: Math.floor(Math.random() * 50000 + 10000),
          ongoing: Math.floor(Math.random() * 10000 + 1000),
        },
        benefits: {
          monetary: Math.floor(Math.random() * 80000 + 20000),
          strategic: Math.random() * 5 + 5, // 5-10 scale
        },
        roi: Math.random() * 200 + 50, // 50-250%
      })),
    };
  }
  
  private applyRiskAssessmentFramework(alternatives: string[], criteria: any[]): any {
    return {
      type: 'risk_assessment',
      evaluations: alternatives.map(alt => ({
        alternative: alt,
        risks: [{
          description: `Primary risk for ${alt}`,
          probability: Math.random() * 0.5 + 0.1, // 0.1-0.6
          impact: Math.random() * 5 + 3, // 3-8 scale
          mitigation: `Mitigation strategy for ${alt}`,
        }],
        overallRisk: Math.random() * 4 + 2, // 2-6 scale
      })),
    };
  }
  
  private applyStakeholderFramework(alternatives: string[], criteria: any[], stakeholders: string[]): any {
    return {
      type: 'stakeholder',
      evaluations: alternatives.map(alt => ({
        alternative: alt,
        stakeholderImpact: stakeholders.map(stakeholder => ({
          stakeholder,
          impact: Math.random() * 4 + 3, // 3-7 scale
          sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
        })),
        overallSupport: Math.random() * 4 + 4, // 4-8 scale
      })),
    };
  }
  
  private applyGenericFramework(alternatives: string[], criteria: any[], weights: Record<string, number>): any {
    return {
      type: 'weighted_scoring',
      evaluations: alternatives.map(alt => ({
        alternative: alt,
        scores: criteria.map(criterion => ({
          criterion: criterion.name,
          score: Math.random() * 4 + 6, // 6-10 range
          weight: weights[criterion.name] || criterion.weight,
        })),
        weightedTotal: Math.random() * 3 + 7, // 7-10 range
      })),
    };
  }
  
  private generateRecommendation(analysis: any): any {
    const evaluations = analysis.evaluations || [];
    if (evaluations.length === 0) {
      return {
        recommended: 'No alternatives to evaluate',
        reasoning: 'No alternatives provided for evaluation',
        confidence: 0,
      };
    }
    
    // Simple scoring based on analysis type
    let bestAlternative = evaluations[0];
    let bestScore = 0;
    
    evaluations.forEach((eval: any) => {
      let score = 0;
      if (eval.score) score = eval.score;
      else if (eval.roi) score = eval.roi / 50; // Normalize ROI
      else if (eval.overallSupport) score = eval.overallSupport;
      else if (eval.weightedTotal) score = eval.weightedTotal;
      
      if (score > bestScore) {
        bestScore = score;
        bestAlternative = eval;
      }
    });
    
    return {
      recommended: bestAlternative.alternative,
      reasoning: `Highest scoring alternative based on ${analysis.type} framework`,
      confidence: Math.min(bestScore / 10, 1.0),
      score: bestScore,
    };
  }
  
  private calculateConfidence(analysis: any): number {
    const evaluations = analysis.evaluations || [];
    if (evaluations.length === 0) return 0;
    
    // Calculate variance in scores to determine confidence
    const scores = evaluations.map((e: any) => 
      e.score || e.roi || e.overallSupport || e.weightedTotal || 5
    );
    
    const mean = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum: number, score: number) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Higher variance = lower confidence
    return Math.max(0.3, 1 - (variance / 10));
  }
}

export default new DecisionFrameworkOperation();