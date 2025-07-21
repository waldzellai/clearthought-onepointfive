import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const SOCRATIC_METHOD_TOOL: Tool = {
  name: 'socraticmethod',
  description: 'Guide inquiry through systematic questioning',
  inputSchema: {
    type: 'object',
    properties: {
      claim: {
        type: 'string',
        description: 'The main claim or topic being explored'
      },
      premises: {
        type: 'array',
        items: { type: 'string' },
        description: 'Supporting premises or assumptions'
      },
      conclusion: {
        type: 'string',
        description: 'Conclusion or insight reached'
      },
      question: {
        type: 'string',
        description: 'Socratic question being asked'
      },
      stage: {
        type: 'string',
        enum: ['clarification', 'assumptions', 'evidence', 'perspectives', 'implications', 'questions'],
        description: 'Method stage'
      },
      argumentType: {
        type: 'string',
        enum: ['deductive', 'inductive', 'abductive', 'analogical'],
        description: 'Type of argument'
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'Confidence level (0.0-1.0)'
      },
      sessionId: {
        type: 'string',
        description: 'Session identifier'
      },
      iteration: {
        type: 'number',
        description: 'Current iteration'
      },
      nextArgumentNeeded: {
        type: 'boolean',
        description: 'Whether next argument is needed'
      }
    },
    required: ['claim', 'premises', 'conclusion', 'question', 'stage', 'argumentType', 'confidence', 'sessionId', 'iteration', 'nextArgumentNeeded']
  }
};