/**
 * Collaborative Reasoning Operation
 * 
 * Facilitates collaborative problem-solving by modeling multiple perspectives and consensus building
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class CollaborativeReasoningOperation extends BaseOperation {
  name = 'collaborative_reasoning';
  category = 'collaborative';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract collaborative reasoning parameters
    const participants = this.getParam(parameters, 'participants', ['Analyst', 'Critic', 'Synthesizer']);
    const perspectives = (parameters.perspectives as any[]) || [];
    const conflicts = (parameters.conflicts as any[]) || [];
    const consensusPoints = (parameters.consensusPoints as string[]) || [];
    const facilitationMode = this.getParam(parameters, 'facilitationMode', 'structured');
    const round = this.getParam(parameters, 'round', 1);
    
    // Generate perspectives if not provided
    const generatedPerspectives = perspectives.length === 0 ? 
      this.generatePerspectives(prompt, participants) : perspectives;
    
    // Identify potential conflicts
    const identifiedConflicts = conflicts.length === 0 ? 
      this.identifyConflicts(generatedPerspectives) : conflicts;
    
    // Attempt consensus building
    const consensus = this.buildConsensus(generatedPerspectives, identifiedConflicts, consensusPoints);
    
    const collaborativeData = {
      problem: prompt,
      participants,
      perspectives: generatedPerspectives,
      conflicts: identifiedConflicts,
      consensus,
      facilitationMode,
      round,
      sessionId: `collab-${Date.now()}`,
      nextRoundNeeded: this.getParam(parameters, 'nextRoundNeeded', false),
      convergenceScore: this.calculateConvergence(generatedPerspectives, consensus),
    };
    
    // Update session metrics
    sessionState.updateKPI('collaborative_participants', participants.length);
    sessionState.updateKPI('consensus_points', consensus.agreedPoints.length);
    
    return this.createResult({
      ...collaborativeData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private generatePerspectives(problem: string, participants: string[]): any[] {
    return participants.map((participant, index) => ({
      participant,
      viewpoint: `${participant}'s perspective on: ${problem}`,
      keyPoints: [`Point ${index + 1}a`, `Point ${index + 1}b`],
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      reasoning: `${participant} approaches this through their specialized lens`,
    }));
  }
  
  private identifyConflicts(perspectives: any[]): any[] {
    const conflicts: any[] = [];
    
    for (let i = 0; i < perspectives.length; i++) {
      for (let j = i + 1; j < perspectives.length; j++) {
        const conflict = {
          participants: [perspectives[i].participant, perspectives[j].participant],
          issue: `Disagreement on approach between ${perspectives[i].participant} and ${perspectives[j].participant}`,
          severity: Math.random() * 0.5 + 0.3, // 0.3-0.8
          resolvable: Math.random() > 0.3,
        };
        conflicts.push(conflict);
      }
    }
    
    return conflicts.slice(0, 2); // Keep manageable number
  }
  
  private buildConsensus(perspectives: any[], conflicts: any[], existingConsensus: string[]): any {
    const agreedPoints = existingConsensus.length > 0 ? existingConsensus : [
      'Problem understanding is shared',
      'Multiple valid approaches exist',
    ];
    
    const disagreements = conflicts.filter(c => !c.resolvable).map(c => c.issue);
    const proposedSolutions = [
      'Hybrid approach combining key insights',
      'Phased implementation addressing concerns',
    ];
    
    return {
      agreedPoints,
      disagreements,
      proposedSolutions,
      confidenceLevel: this.calculateOverallConfidence(perspectives),
      nextSteps: ['Validate proposed solutions', 'Address remaining disagreements'],
    };
  }
  
  private calculateConvergence(perspectives: any[], consensus: any): number {
    const totalPoints = perspectives.reduce((sum, p) => sum + p.keyPoints.length, 0);
    const consensusPoints = consensus.agreedPoints.length;
    return Math.min(consensusPoints / Math.max(totalPoints, 1), 1.0);
  }
  
  private calculateOverallConfidence(perspectives: any[]): number {
    const avgConfidence = perspectives.reduce((sum, p) => sum + p.confidence, 0) / perspectives.length;
    return Math.round(avgConfidence * 100) / 100;
  }
}

export default new CollaborativeReasoningOperation();