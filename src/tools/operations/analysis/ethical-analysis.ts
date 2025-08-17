/**
 * Ethical Analysis Operation
 * 
 * Provides structured ethical analysis using multiple ethical frameworks
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import type { EthicalAssessment } from '../../../types/index.js';

export class EthicalAnalysisOperation extends BaseOperation {
  name = 'ethical_analysis';
  category = 'analysis';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const framework = this.getParam(parameters, 'framework', 'utilitarian') as 'utilitarian' | 'rights' | 'fairness' | 'compliance';
    const stakeholders = (parameters.stakeholders as string[]) || this.identifyStakeholders(prompt);
    const actions = (parameters.actions as string[]) || this.extractActions(prompt);
    const context_factors = (parameters.context as string[]) || this.extractContextFactors(prompt);
    
    let assessment: EthicalAssessment;
    
    switch (framework) {
      case 'utilitarian':
        assessment = this.performUtilitarianAnalysis(prompt, stakeholders, actions);
        break;
      case 'rights':
        assessment = this.performRightsBasedAnalysis(prompt, stakeholders, actions);
        break;
      case 'fairness':
        assessment = this.performFairnessAnalysis(prompt, stakeholders, actions);
        break;
      case 'compliance':
        assessment = this.performComplianceAnalysis(prompt, actions, context_factors);
        break;
      default:
        assessment = this.performUtilitarianAnalysis(prompt, stakeholders, actions);
    }
    
    // Multi-framework analysis if requested
    const multiFramework = this.getParam(parameters, 'multiFramework', false);
    let comparativeAnalysis: Record<string, EthicalAssessment> = {};
    
    if (multiFramework) {
      const frameworks = ['utilitarian', 'rights', 'fairness', 'compliance'];
      for (const fw of frameworks) {
        if (fw !== framework) {
          switch (fw) {
            case 'utilitarian':
              comparativeAnalysis[fw] = this.performUtilitarianAnalysis(prompt, stakeholders, actions);
              break;
            case 'rights':
              comparativeAnalysis[fw] = this.performRightsBasedAnalysis(prompt, stakeholders, actions);
              break;
            case 'fairness':
              comparativeAnalysis[fw] = this.performFairnessAnalysis(prompt, stakeholders, actions);
              break;
            case 'compliance':
              comparativeAnalysis[fw] = this.performComplianceAnalysis(prompt, actions, context_factors);
              break;
          }
        }
      }
    }
    
    return this.createResult({
      primaryFramework: framework,
      assessment,
      stakeholders,
      actions,
      contextFactors: context_factors,
      comparativeAnalysis: multiFramework ? comparativeAnalysis : undefined,
      recommendations: this.generateEthicalRecommendations(assessment, framework),
      decisionSupport: this.generateDecisionSupport(assessment, comparativeAnalysis),
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private identifyStakeholders(prompt: string): string[] {
    const stakeholders: string[] = [];
    const text = prompt.toLowerCase();
    
    // Common stakeholder categories
    const stakeholderKeywords = {
      'customers': ['customer', 'client', 'user', 'consumer'],
      'employees': ['employee', 'worker', 'staff', 'team'],
      'shareholders': ['shareholder', 'investor', 'owner'],
      'community': ['community', 'public', 'society', 'neighborhood'],
      'government': ['government', 'regulator', 'authority'],
      'environment': ['environment', 'nature', 'ecosystem'],
      'suppliers': ['supplier', 'vendor', 'partner']
    };
    
    for (const [stakeholder, keywords] of Object.entries(stakeholderKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        stakeholders.push(stakeholder);
      }
    }
    
    // If no specific stakeholders found, add general ones
    if (stakeholders.length === 0) {
      stakeholders.push('affected individuals', 'broader community');
    }
    
    return stakeholders;
  }
  
  private extractActions(prompt: string): string[] {
    const actions: string[] = [];
    const sentences = prompt.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      // Look for action verbs and imperative statements
      if (trimmed.length > 10 && 
          (trimmed.toLowerCase().includes('should') ||
           trimmed.toLowerCase().includes('could') ||
           trimmed.toLowerCase().includes('action') ||
           trimmed.toLowerCase().includes('decision'))) {
        actions.push(trimmed);
      }
    }
    
    if (actions.length === 0) {
      actions.push('Proposed action under consideration');
    }
    
    return actions.slice(0, 5); // Limit to 5 actions
  }
  
  private extractContextFactors(prompt: string): string[] {
    const factors: string[] = [];
    const text = prompt.toLowerCase();
    
    // Look for contextual factors
    const contextKeywords = {
      'legal': ['law', 'legal', 'regulation', 'compliance'],
      'cultural': ['culture', 'tradition', 'custom', 'belief'],
      'economic': ['cost', 'profit', 'economic', 'financial'],
      'technological': ['technology', 'digital', 'automation', 'ai'],
      'environmental': ['environment', 'sustainability', 'climate'],
      'social': ['social', 'relationship', 'community', 'trust']
    };
    
    for (const [factor, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        factors.push(factor);
      }
    }
    
    return factors;
  }
  
  private performUtilitarianAnalysis(
    prompt: string,
    stakeholders: string[],
    actions: string[]
  ): EthicalAssessment {
    const findings: string[] = [];
    const risks: string[] = [];
    const mitigations: string[] = [];
    
    // Utilitarian analysis focuses on consequences and maximizing overall well-being
    findings.push('Analyzing consequences for overall well-being and happiness');
    
    // Assess benefits and harms for each stakeholder group
    for (const stakeholder of stakeholders) {
      findings.push(`Considering impact on ${stakeholder}`);
      
      // Identify potential negative consequences
      if (stakeholder === 'employees' && prompt.toLowerCase().includes('layoff')) {
        risks.push('Job losses may cause significant harm to affected employees');
        mitigations.push('Provide retraining, severance packages, and job placement assistance');
      }
      
      if (stakeholder === 'community' && prompt.toLowerCase().includes('environment')) {
        risks.push('Environmental impact may harm community health and well-being');
        mitigations.push('Implement environmental protection measures and community benefits');
      }
    }
    
    // General utilitarian considerations
    findings.push('Weighing total benefits against total costs across all stakeholders');
    findings.push('Considering both immediate and long-term consequences');
    
    if (risks.length === 0) {
      risks.push('Need to identify and quantify potential negative consequences');
    }
    
    if (mitigations.length === 0) {
      mitigations.push('Seek ways to maximize benefits while minimizing harms');
    }
    
    // Calculate basic utilitarian score
    const score = this.calculateUtilitarianScore(stakeholders, risks);
    
    return {
      framework: 'utilitarian',
      findings,
      risks,
      mitigations,
      score
    };
  }
  
  private performRightsBasedAnalysis(
    prompt: string,
    stakeholders: string[],
    actions: string[]
  ): EthicalAssessment {
    const findings: string[] = [];
    const risks: string[] = [];
    const mitigations: string[] = [];
    
    // Rights-based analysis focuses on fundamental rights and dignity
    findings.push('Analyzing respect for fundamental human rights and dignity');
    
    // Check for potential rights violations
    const text = prompt.toLowerCase();
    
    if (text.includes('privacy') || text.includes('data')) {
      findings.push('Privacy rights are at stake');
      risks.push('Potential violation of privacy rights');
      mitigations.push('Implement strong data protection and consent mechanisms');
    }
    
    if (text.includes('discrimination') || text.includes('bias')) {
      findings.push('Equal treatment rights must be considered');
      risks.push('Risk of discriminatory treatment');
      mitigations.push('Ensure fair and unbiased decision-making processes');
    }
    
    if (text.includes('freedom') || text.includes('choice')) {
      findings.push('Autonomy and freedom of choice are relevant');
      risks.push('Potential restriction of individual autonomy');
      mitigations.push('Preserve individual choice and decision-making authority');
    }
    
    // Universal rights considerations
    findings.push('Ensuring actions respect human dignity and inherent worth');
    findings.push('Considering rights that cannot be traded off for benefits');
    
    if (risks.length === 0) {
      risks.push('Verify that no fundamental rights are violated');
    }
    
    if (mitigations.length === 0) {
      mitigations.push('Strengthen protections for individual rights and freedoms');
    }
    
    const score = this.calculateRightsScore(risks);
    
    return {
      framework: 'rights',
      findings,
      risks,
      mitigations,
      score
    };
  }
  
  private performFairnessAnalysis(
    prompt: string,
    stakeholders: string[],
    actions: string[]
  ): EthicalAssessment {
    const findings: string[] = [];
    const risks: string[] = [];
    const mitigations: string[] = [];
    
    // Fairness analysis focuses on justice, equality, and fair distribution
    findings.push('Analyzing fairness and justice in distribution of benefits and burdens');
    
    const text = prompt.toLowerCase();
    
    // Distributive justice
    findings.push('Examining how benefits and burdens are distributed');
    if (text.includes('inequality') || text.includes('disparity')) {
      risks.push('Existing inequalities may be exacerbated');
      mitigations.push('Implement measures to reduce disparities and promote equity');
    }
    
    // Procedural justice
    findings.push('Evaluating fairness of decision-making processes');
    if (!text.includes('transparent') && !text.includes('participation')) {
      risks.push('Lack of transparency or stakeholder participation in decision-making');
      mitigations.push('Ensure transparent, inclusive, and participatory decision processes');
    }
    
    // Equal treatment
    findings.push('Assessing whether similar cases are treated similarly');
    
    // Access and opportunity
    if (text.includes('access') || text.includes('opportunity')) {
      findings.push('Considering equal access to opportunities and resources');
    }
    
    if (risks.length === 0) {
      risks.push('Ensure fair treatment and equal consideration for all stakeholders');
    }
    
    if (mitigations.length === 0) {
      mitigations.push('Develop fair allocation mechanisms and inclusive processes');
    }
    
    const score = this.calculateFairnessScore(stakeholders, text);
    
    return {
      framework: 'fairness',
      findings,
      risks,
      mitigations,
      score
    };
  }
  
  private performComplianceAnalysis(
    prompt: string,
    actions: string[],
    contextFactors: string[]
  ): EthicalAssessment {
    const findings: string[] = [];
    const risks: string[] = [];
    const mitigations: string[] = [];
    
    // Compliance analysis focuses on adherence to laws, regulations, and standards
    findings.push('Analyzing compliance with applicable laws and regulations');
    
    const text = prompt.toLowerCase();
    
    // Legal compliance
    if (contextFactors.includes('legal')) {
      findings.push('Legal requirements must be satisfied');
      risks.push('Potential legal violations or regulatory non-compliance');
      mitigations.push('Conduct thorough legal review and ensure regulatory compliance');
    }
    
    // Industry standards
    if (text.includes('standard') || text.includes('guideline')) {
      findings.push('Industry standards and best practices should be followed');
    }
    
    // Data protection (if relevant)
    if (text.includes('data') || text.includes('privacy')) {
      findings.push('Data protection regulations (GDPR, CCPA, etc.) may apply');
      risks.push('Non-compliance with data protection laws');
      mitigations.push('Implement data protection measures and privacy safeguards');
    }
    
    // Environmental regulations
    if (contextFactors.includes('environmental')) {
      findings.push('Environmental regulations and permits must be considered');
    }
    
    // Professional ethics codes
    findings.push('Professional codes of ethics may provide additional guidance');
    
    if (risks.length === 0) {
      risks.push('Ensure comprehensive compliance review is conducted');
    }
    
    if (mitigations.length === 0) {
      mitigations.push('Establish compliance monitoring and reporting mechanisms');
    }
    
    const score = this.calculateComplianceScore(contextFactors, risks);
    
    return {
      framework: 'compliance',
      findings,
      risks,
      mitigations,
      score
    };
  }
  
  private calculateUtilitarianScore(stakeholders: string[], risks: string[]): number {
    // Simple scoring: start high, reduce for each risk and few stakeholders considered
    let score = 0.8;
    score -= (risks.length * 0.1);
    score += (stakeholders.length * 0.05);
    return Math.max(0, Math.min(1, score));
  }
  
  private calculateRightsScore(risks: string[]): number {
    // Rights-based scoring: high penalty for any rights violations
    let score = 0.9;
    score -= (risks.length * 0.2);
    return Math.max(0, Math.min(1, score));
  }
  
  private calculateFairnessScore(stakeholders: string[], text: string): number {
    let score = 0.7;
    
    // Bonus for considering multiple stakeholders
    score += (stakeholders.length * 0.05);
    
    // Bonus for mentioning fairness concepts
    if (text.includes('fair') || text.includes('equal') || text.includes('justice')) {
      score += 0.1;
    }
    
    return Math.max(0, Math.min(1, score));
  }
  
  private calculateComplianceScore(contextFactors: string[], risks: string[]): number {
    let score = 0.8;
    
    // Bonus for considering legal/regulatory context
    if (contextFactors.includes('legal')) {
      score += 0.1;
    }
    
    // Penalty for compliance risks
    score -= (risks.length * 0.15);
    
    return Math.max(0, Math.min(1, score));
  }
  
  private generateEthicalRecommendations(assessment: EthicalAssessment, framework: string): string[] {
    const recommendations: string[] = [];
    
    // Framework-specific recommendations
    switch (framework) {
      case 'utilitarian':
        recommendations.push('Conduct comprehensive cost-benefit analysis including all stakeholders');
        recommendations.push('Consider long-term consequences alongside immediate effects');
        break;
      case 'rights':
        recommendations.push('Ensure fundamental rights are protected and respected');
        recommendations.push('Avoid actions that violate human dignity or autonomy');
        break;
      case 'fairness':
        recommendations.push('Implement fair and transparent decision-making processes');
        recommendations.push('Address any existing inequalities that may be affected');
        break;
      case 'compliance':
        recommendations.push('Conduct thorough legal and regulatory compliance review');
        recommendations.push('Establish ongoing monitoring and reporting mechanisms');
        break;
    }
    
    // General recommendations
    if ((assessment.score || 0) < 0.5) {
      recommendations.push('Consider alternative approaches with fewer ethical concerns');
    }
    
    if (assessment.risks.length > 2) {
      recommendations.push('Develop comprehensive risk mitigation strategies');
    }
    
    recommendations.push('Engage stakeholders in the decision-making process');
    recommendations.push('Consider seeking ethical review from independent experts');
    
    return recommendations;
  }
  
  private generateDecisionSupport(
    primaryAssessment: EthicalAssessment,
    comparativeAnalysis: Record<string, EthicalAssessment>
  ): Record<string, any> {
    const support: Record<string, any> = {
      primaryScore: primaryAssessment.score || 0,
      overallRecommendation: this.getOverallRecommendation(primaryAssessment, comparativeAnalysis)
    };
    
    if (Object.keys(comparativeAnalysis).length > 0) {
      support.frameworkComparison = {};
      support.consensusAreas = [];
      support.conflictAreas = [];
      
      // Compare scores across frameworks
      for (const [framework, assessment] of Object.entries(comparativeAnalysis)) {
        support.frameworkComparison[framework] = assessment.score || 0;
      }
      
      // Identify consensus and conflicts
      const allAssessments = [primaryAssessment, ...Object.values(comparativeAnalysis)];
      const avgScore = allAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / allAssessments.length;
      
      if (Math.max(...allAssessments.map(a => a.score || 0)) - Math.min(...allAssessments.map(a => a.score || 0)) < 0.2) {
        support.consensusAreas.push('All frameworks show similar ethical assessment');
      } else {
        support.conflictAreas.push('Significant disagreement between ethical frameworks');
      }
      
      support.averageScore = avgScore;
    }
    
    return support;
  }
  
  private getOverallRecommendation(
    primaryAssessment: EthicalAssessment,
    comparativeAnalysis: Record<string, EthicalAssessment>
  ): string {
    const allScores = [primaryAssessment.score || 0, ...Object.values(comparativeAnalysis).map(a => a.score || 0)];
    const minScore = Math.min(...allScores);
    const avgScore = allScores.reduce((sum, score) => (sum || 0) + (score || 0), 0) / allScores.length;
    
    if (minScore < 0.3) {
      return 'Strong ethical concerns identified - consider alternative approaches';
    } else if (avgScore < 0.5) {
      return 'Moderate ethical concerns - implement strong safeguards and monitoring';
    } else if (avgScore < 0.7) {
      return 'Some ethical considerations - address identified risks before proceeding';
    } else {
      return 'Ethically acceptable with proper implementation of recommended safeguards';
    }
  }
}

export default new EthicalAnalysisOperation();