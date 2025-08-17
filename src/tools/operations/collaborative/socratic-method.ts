/**
 * Socratic Method Operation
 * 
 * Uses Socratic questioning approach to explore ideas and uncover assumptions
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class SocraticMethodOperation extends BaseOperation {
  name = 'socratic_method';
  category = 'collaborative';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    // Extract Socratic method parameters
    const questionType = this.getParam(parameters, 'questionType', 'clarification');
    const depth = this.getParam(parameters, 'depth', 3);
    const assumptions = (parameters.assumptions as string[]) || [];
    const previousQuestions = (parameters.previousQuestions as any[]) || [];
    const responses = (parameters.responses as any[]) || [];
    
    // Generate question sequence based on type and depth
    const questionSequence = this.generateQuestionSequence(
      prompt, 
      questionType, 
      depth, 
      previousQuestions
    );
    
    // Analyze assumptions if provided
    const assumptionAnalysis = assumptions.length > 0 ? 
      this.analyzeAssumptions(assumptions) : 
      this.extractAssumptions(prompt);
    
    // Build dialogue tree
    const dialogueTree = this.buildDialogueTree(questionSequence, responses);
    
    const socraticData = {
      topic: prompt,
      questionType,
      depth,
      questionSequence,
      assumptions: assumptionAnalysis,
      dialogueTree,
      insights: this.extractInsights(questionSequence, responses),
      nextQuestion: this.generateNextQuestion(questionSequence, responses),
      sessionId: `socratic-${Date.now()}`,
      round: this.getParam(parameters, 'round', 1),
      explorationComplete: this.isExplorationComplete(questionSequence, responses, depth),
    };
    
    // Update session metrics
    sessionState.updateKPI('socratic_questions', questionSequence.length);
    sessionState.updateKPI('assumptions_examined', assumptionAnalysis.length);
    
    return this.createResult({
      ...socraticData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private generateQuestionSequence(
    topic: string, 
    questionType: string, 
    depth: number, 
    previousQuestions: any[]
  ): any[] {
    const questionTypes = {
      clarification: this.generateClarificationQuestions,
      assumptions: this.generateAssumptionQuestions,
      evidence: this.generateEvidenceQuestions,
      perspective: this.generatePerspectiveQuestions,
      implications: this.generateImplicationQuestions,
      meta: this.generateMetaQuestions,
    };
    
    const generator = questionTypes[questionType as keyof typeof questionTypes] || 
                    questionTypes.clarification;
    
    const newQuestions = generator.call(this, topic, depth);
    
    return [...previousQuestions, ...newQuestions.slice(0, depth)];
  }
  
  private generateClarificationQuestions(topic: string, depth: number): any[] {
    return [
      {
        type: 'clarification',
        question: `What do you mean when you say "${topic}"?`,
        purpose: 'Define key terms and concepts',
        level: 1,
      },
      {
        type: 'clarification',
        question: `Can you give me an example of what you're describing?`,
        purpose: 'Seek concrete examples',
        level: 2,
      },
      {
        type: 'clarification',
        question: `How does this relate to what we discussed earlier?`,
        purpose: 'Connect to broader context',
        level: 3,
      },
    ].slice(0, depth);
  }
  
  private generateAssumptionQuestions(topic: string, depth: number): any[] {
    return [
      {
        type: 'assumptions',
        question: `What assumptions are you making about ${topic}?`,
        purpose: 'Identify underlying assumptions',
        level: 1,
      },
      {
        type: 'assumptions',
        question: `What if the opposite were true?`,
        purpose: 'Challenge core assumptions',
        level: 2,
      },
      {
        type: 'assumptions',
        question: `How can we verify these assumptions?`,
        purpose: 'Test assumption validity',
        level: 3,
      },
    ].slice(0, depth);
  }
  
  private generateEvidenceQuestions(topic: string, depth: number): any[] {
    return [
      {
        type: 'evidence',
        question: `What evidence supports your view on ${topic}?`,
        purpose: 'Examine supporting evidence',
        level: 1,
      },
      {
        type: 'evidence',
        question: `What evidence might contradict this view?`,
        purpose: 'Consider counter-evidence',
        level: 2,
      },
      {
        type: 'evidence',
        question: `How reliable is this evidence?`,
        purpose: 'Evaluate evidence quality',
        level: 3,
      },
    ].slice(0, depth);
  }
  
  private generatePerspectiveQuestions(topic: string, depth: number): any[] {
    return [
      {
        type: 'perspective',
        question: `How might someone who disagrees view ${topic}?`,
        purpose: 'Explore alternative viewpoints',
        level: 1,
      },
      {
        type: 'perspective',
        question: `What are the strengths and weaknesses of this alternative view?`,
        purpose: 'Analyze competing perspectives',
        level: 2,
      },
      {
        type: 'perspective',
        question: `Why might this perspective exist?`,
        purpose: 'Understand perspective origins',
        level: 3,
      },
    ].slice(0, depth);
  }
  
  private generateImplicationQuestions(topic: string, depth: number): any[] {
    return [
      {
        type: 'implications',
        question: `What are the implications of your view on ${topic}?`,
        purpose: 'Explore consequences',
        level: 1,
      },
      {
        type: 'implications',
        question: `If this is true, what follows from it?`,
        purpose: 'Trace logical implications',
        level: 2,
      },
      {
        type: 'implications',
        question: `How does this affect our original problem?`,
        purpose: 'Connect back to core issue',
        level: 3,
      },
    ].slice(0, depth);
  }
  
  private generateMetaQuestions(topic: string, depth: number): any[] {
    return [
      {
        type: 'meta',
        question: `Why is this question about ${topic} important?`,
        purpose: 'Examine question significance',
        level: 1,
      },
      {
        type: 'meta',
        question: `What does this tell us about how we think about such issues?`,
        purpose: 'Reflect on thinking patterns',
        level: 2,
      },
      {
        type: 'meta',
        question: `How has our understanding changed through this inquiry?`,
        purpose: 'Assess learning progress',
        level: 3,
      },
    ].slice(0, depth);
  }
  
  private analyzeAssumptions(assumptions: string[]): any[] {
    return assumptions.map((assumption, index) => ({
      assumption,
      type: this.categorizeAssumption(assumption),
      questionable: Math.random() > 0.3, // 70% are questionable
      evidence: `Evidence level: ${Math.floor(Math.random() * 5) + 1}/5`,
      alternative: `Alternative to: ${assumption}`,
    }));
  }
  
  private extractAssumptions(topic: string): any[] {
    // Simple pattern-based assumption extraction
    const commonAssumptions = [
      `Current approach to ${topic} is optimal`,
      `The problem with ${topic} has a single solution`,
      `Past experience with ${topic} predicts future outcomes`,
    ];
    
    return commonAssumptions.map(assumption => ({
      assumption,
      type: 'implicit',
      questionable: true,
      evidence: 'Needs verification',
      alternative: `Question: ${assumption}`,
    }));
  }
  
  private categorizeAssumption(assumption: string): string {
    if (assumption.toLowerCase().includes('always') || assumption.toLowerCase().includes('never')) {
      return 'absolute';
    }
    if (assumption.toLowerCase().includes('should') || assumption.toLowerCase().includes('must')) {
      return 'normative';
    }
    if (assumption.toLowerCase().includes('cause') || assumption.toLowerCase().includes('because')) {
      return 'causal';
    }
    return 'descriptive';
  }
  
  private buildDialogueTree(questions: any[], responses: any[]): any {
    const tree = {
      nodes: questions.map((q, index) => ({
        id: `q${index}`,
        question: q.question,
        type: q.type,
        level: q.level,
        response: responses[index]?.response || null,
        followUps: responses[index]?.followUps || [],
      })),
      connections: questions.map((_, index) => ({
        from: index > 0 ? `q${index - 1}` : 'root',
        to: `q${index}`,
        relationship: 'follows',
      })),
    };
    
    return tree;
  }
  
  private extractInsights(questions: any[], responses: any[]): string[] {
    const insights: string[] = [];
    
    // Extract insights based on question types and responses
    const questionTypes = [...new Set(questions.map(q => q.type))];
    
    questionTypes.forEach(type => {
      insights.push(`${type} exploration revealed new perspectives`);
    });
    
    if (responses.length > 0) {
      insights.push(`${responses.length} responses provided deeper understanding`);
    }
    
    insights.push('Socratic inquiry uncovered hidden assumptions');
    
    return insights;
  }
  
  private generateNextQuestion(questions: any[], responses: any[]): any {
    const lastQuestion = questions[questions.length - 1];
    const lastResponse = responses[responses.length - 1];
    
    if (!lastQuestion) {
      return {
        question: 'What would you like to explore?',
        type: 'clarification',
        purpose: 'Begin inquiry',
        level: 1,
      };
    }
    
    // Generate follow-up based on last question type
    const followUpTemplates = {
      clarification: 'Can you elaborate on that point?',
      assumptions: 'What leads you to that assumption?',
      evidence: 'What other evidence should we consider?',
      perspective: 'How might others see this differently?',
      implications: 'What are the broader consequences?',
      meta: 'What does this reveal about our inquiry process?',
    };
    
    return {
      question: followUpTemplates[lastQuestion.type as keyof typeof followUpTemplates] || 
               'What should we explore next?',
      type: lastQuestion.type,
      purpose: 'Follow up on previous response',
      level: lastQuestion.level + 1,
    };
  }
  
  private isExplorationComplete(questions: any[], responses: any[], targetDepth: number): boolean {
    return questions.length >= targetDepth && 
           responses.length >= Math.floor(targetDepth * 0.8); // 80% response rate
  }
}

export default new SocraticMethodOperation();