/**
 * Creative Thinking Operation
 * 
 * Facilitates creative problem-solving through various techniques
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';

export class CreativeThinkingOperation extends BaseOperation {
  name = 'creative_thinking';
  category = 'core';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const technique = this.getParam(parameters, 'technique', 'brainstorming');
    const ideas = (parameters.ideas as string[]) || [];
    const constraints = (parameters.constraints as string[]) || [];
    const evaluation = this.getParam(parameters, 'evaluation', '');
    
    // Generate ideas if none provided
    const generatedIdeas = ideas.length === 0 ? this.generateIdeas(prompt, technique) : ideas;
    
    const creativeData = {
      technique,
      challenge: prompt,
      ideas: generatedIdeas,
      constraints,
      evaluation,
      selectedIdea: this.getParam(parameters, 'selectedIdea', null),
      combinedConcepts: this.getParam(parameters, 'combinedConcepts', []),
    };
    
    return this.createResult({
      ...creativeData,
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private generateIdeas(prompt: string, technique: string): string[] {
    const ideas: string[] = [];
    
    switch (technique) {
      case 'brainstorming':
        ideas.push(
          'Explore alternative approaches',
          'Consider opposite perspectives',
          'Break down into smaller components'
        );
        break;
      case 'scamper':
        ideas.push(
          'Substitute: What can be substituted?',
          'Combine: What can be combined?',
          'Adapt: What can be adapted?',
          'Modify: What can be modified?',
          'Put to other uses: How else can this be used?',
          'Eliminate: What can be removed?',
          'Reverse: What can be reversed?'
        );
        break;
      case 'random_word':
        const randomWords = ['bridge', 'cloud', 'seed', 'mirror', 'wave'];
        const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
        ideas.push(`How does "${randomWord}" relate to ${prompt}?`);
        break;
      default:
        ideas.push('Generate creative solutions');
    }
    
    return ideas;
  }
}

export default new CreativeThinkingOperation();