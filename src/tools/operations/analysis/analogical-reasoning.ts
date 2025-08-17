/**
 * Analogical Reasoning Operation
 * 
 * Finds and applies analogies to understand complex problems through familiar domains
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import type { AnalogyMapping, AnalogicalReasoningData } from '../../../types/index.js';

export class AnalogicalReasoningOperation extends BaseOperation {
  name = 'analogical_reasoning';
  category = 'analysis';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const sourceDomain = this.getParam(parameters, 'sourceDomain', '');
    const targetDomain = this.getParam(parameters, 'targetDomain', prompt);
    const existingMappings = (parameters.mappings as AnalogyMapping[]) || [];
    const autoGenerate = this.getParam(parameters, 'autoGenerate', true);
    
    let mappings = existingMappings;
    let inferredInsights: string[] = [];
    
    // Generate mappings if none provided and auto-generation is enabled
    if (mappings.length === 0 && autoGenerate && sourceDomain) {
      mappings = this.generateMappings(sourceDomain, targetDomain);
    }
    
    // Generate insights from mappings
    if (mappings.length > 0) {
      inferredInsights = this.generateInsights(mappings, sourceDomain, targetDomain);
    }
    
    // Suggest analogies if no source domain provided
    const suggestedAnalogies = sourceDomain ? [] : this.suggestAnalogies(targetDomain);
    
    const reasoningData: AnalogicalReasoningData = {
      sourceDomain: sourceDomain || '[To be determined]',
      targetDomain,
      mappings,
      inferredInsights,
      sessionId: sessionState.sessionId,
    };
    
    return this.createResult({
      ...reasoningData,
      suggestedAnalogies,
      mappingStrength: this.calculateOverallStrength(mappings),
      nextSteps: this.generateNextSteps(mappings, inferredInsights),
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private generateMappings(sourceDomain: string, targetDomain: string): AnalogyMapping[] {
    const mappings: AnalogyMapping[] = [];
    
    // Common mapping patterns based on domain keywords
    const sourceKeywords = this.extractKeywords(sourceDomain);
    const targetKeywords = this.extractKeywords(targetDomain);
    
    // Generate role mappings
    if (sourceKeywords.length > 0 && targetKeywords.length > 0) {
      mappings.push({
        sourceConcept: sourceKeywords[0],
        targetConcept: targetKeywords[0],
        mappingType: 'role',
        strength: 0.7
      });
    }
    
    // Generate structural mappings
    mappings.push({
      sourceConcept: `Structure of ${sourceDomain}`,
      targetConcept: `Structure of ${targetDomain}`,
      mappingType: 'structure',
      strength: 0.6
    });
    
    // Generate behavioral mappings
    mappings.push({
      sourceConcept: `Behavior patterns in ${sourceDomain}`,
      targetConcept: `Behavior patterns in ${targetDomain}`,
      mappingType: 'behavior',
      strength: 0.5
    });
    
    return mappings;
  }
  
  private generateInsights(mappings: AnalogyMapping[], sourceDomain: string, targetDomain: string): string[] {
    const insights: string[] = [];
    
    // Insights from strong mappings
    const strongMappings = mappings.filter(m => (m.strength || 0) > 0.6);
    if (strongMappings.length > 0) {
      insights.push(`Strong parallels exist between ${sourceDomain} and ${targetDomain}`);
    }
    
    // Type-specific insights
    const roleMappings = mappings.filter(m => m.mappingType === 'role');
    if (roleMappings.length > 0) {
      insights.push(`Key roles in ${sourceDomain} can inform understanding of ${targetDomain}`);
    }
    
    const structuralMappings = mappings.filter(m => m.mappingType === 'structure');
    if (structuralMappings.length > 0) {
      insights.push(`Structural similarities suggest similar organizing principles`);
    }
    
    const behaviorMappings = mappings.filter(m => m.mappingType === 'behavior');
    if (behaviorMappings.length > 0) {
      insights.push(`Behavioral patterns from ${sourceDomain} may predict ${targetDomain} dynamics`);
    }
    
    return insights;
  }
  
  private suggestAnalogies(targetDomain: string): string[] {
    const suggestions: string[] = [];
    const keywords = this.extractKeywords(targetDomain.toLowerCase());
    
    // Domain-specific analogy suggestions
    if (keywords.some(k => ['business', 'organization', 'company'].includes(k))) {
      suggestions.push('Military strategy', 'Ecosystem dynamics', 'Sports team coordination');
    } else if (keywords.some(k => ['system', 'network', 'connection'].includes(k))) {
      suggestions.push('Neural networks', 'Transportation systems', 'Social networks');
    } else if (keywords.some(k => ['problem', 'challenge', 'issue'].includes(k))) {
      suggestions.push('Medical diagnosis', 'Detective investigation', 'Engineering design');
    } else {
      suggestions.push('Machine operation', 'Natural processes', 'Game mechanics');
    }
    
    return suggestions;
  }
  
  private extractKeywords(text: string): string[] {
    return text.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase())
      .slice(0, 5);
  }
  
  private calculateOverallStrength(mappings: AnalogyMapping[]): number {
    if (mappings.length === 0) return 0;
    const totalStrength = mappings.reduce((sum, m) => sum + (m.strength || 0), 0);
    return totalStrength / mappings.length;
  }
  
  private generateNextSteps(mappings: AnalogyMapping[], insights: string[]): string[] {
    const steps: string[] = [];
    
    if (mappings.length === 0) {
      steps.push('Identify a source domain with familiar structures or patterns');
      steps.push('Map key elements between source and target domains');
    } else {
      steps.push('Strengthen weak mappings by finding additional correspondences');
      if (insights.length > 0) {
        steps.push('Test insights by looking for counter-examples or exceptions');
      }
      steps.push('Apply learned patterns to predict target domain behavior');
    }
    
    return steps;
  }
}

export default new AnalogicalReasoningOperation();