/**
 * Research Operation
 * 
 * Structures research intent and placeholders for downstream web tooling
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import type { ResearchFinding, ResearchSource, ResearchResult } from '../../../types/index.js';

export class ResearchOperation extends BaseOperation {
  name = 'research';
  category = 'analysis';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { prompt, parameters } = context;
    
    const subqueries = (parameters.subqueries as string[]) || [];
    let findings = (parameters.findings as ResearchFinding[]) || [];
    let citations = (parameters.citations as ResearchSource[]) || [];
    
    // If no structured input, create placeholder findings from prompt
    if (findings.length === 0 && prompt) {
      findings = this.generatePlaceholderFindings(prompt);
    }
    
    // Generate sub-queries if none provided
    let derivedSubqueries = subqueries;
    if (derivedSubqueries.length === 0 && prompt) {
      derivedSubqueries = this.generateSubqueries(prompt);
    }
    
    const result: ResearchResult = {
      query: prompt,
      findings,
      citations,
    };
    
    return this.createResult({
      ...result,
      subqueries: derivedSubqueries,
      note: "This operation structures research intent. Use external tools for actual web search and data gathering."
    });
  }
  
  private generatePlaceholderFindings(prompt: string): ResearchFinding[] {
    const findings: ResearchFinding[] = [];
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences.slice(0, 3)) {
      const trimmed = sentence.trim();
      if (trimmed) {
        findings.push({
          claim: `Research needed: ${trimmed}`,
          evidence: "[Evidence to be gathered]",
          confidence: 0.0,
          sources: []
        });
      }
    }
    
    return findings;
  }
  
  private generateSubqueries(prompt: string): string[] {
    const subqueries: string[] = [];
    const questionStarters = ['What', 'How', 'Why', 'When', 'Where', 'Who'];
    const keywords = prompt.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
    
    for (const starter of questionStarters.slice(0, 3)) {
      for (const keyword of keywords.slice(0, 2)) {
        subqueries.push(`${starter} ${keyword.toLowerCase()}?`);
      }
    }
    
    return subqueries.slice(0, 5);
  }
}

export default new ResearchOperation();