import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const SYSTEMS_THINKING_TOOL: Tool = {
  name: 'systemsthinking',
  description: 'Analyze complex systems and their interactions',
  inputSchema: {
    type: 'object',
    properties: {
      system: {
        type: 'string',
        description: 'System being analyzed'
      },
      components: {
        type: 'array',
        items: { type: 'string' },
        description: 'Components identified'
      },
      relationships: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            type: { type: 'string' },
            strength: { type: 'number' }
          },
          required: ['from', 'to', 'type']
        },
        description: 'Relationships between components'
      },
      feedbackLoops: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            components: {
              type: 'array',
              items: { type: 'string' }
            },
            type: {
              type: 'string',
              enum: ['positive', 'negative']
            },
            description: { type: 'string' }
          },
          required: ['components', 'type', 'description']
        },
        description: 'Feedback loops identified'
      },
      emergentProperties: {
        type: 'array',
        items: { type: 'string' },
        description: 'Emergent properties'
      },
      leveragePoints: {
        type: 'array',
        items: { type: 'string' },
        description: 'Leverage points'
      },
      sessionId: {
        type: 'string',
        description: 'Session ID'
      },
      iteration: {
        type: 'number',
        description: 'Current iteration'
      },
      nextAnalysisNeeded: {
        type: 'boolean',
        description: 'Whether more analysis is needed'
      }
    },
    required: ['system', 'components', 'relationships', 'feedbackLoops', 'emergentProperties', 'leveragePoints', 'sessionId', 'iteration', 'nextAnalysisNeeded']
  }
};