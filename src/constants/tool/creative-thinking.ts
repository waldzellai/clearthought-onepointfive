import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const CREATIVE_THINKING_TOOL: Tool = {
  name: 'creativethinking',
  description: 'Engage in creative and lateral thinking approaches',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Creative prompt or challenge'
      },
      ideas: {
        type: 'array',
        items: { type: 'string' },
        description: 'Ideas generated'
      },
      techniques: {
        type: 'array',
        items: { type: 'string' },
        description: 'Techniques used'
      },
      connections: {
        type: 'array',
        items: { type: 'string' },
        description: 'Connections made'
      },
      insights: {
        type: 'array',
        items: { type: 'string' },
        description: 'Novel insights'
      },
      sessionId: {
        type: 'string',
        description: 'Session identifier'
      },
      iteration: {
        type: 'number',
        description: 'Current iteration'
      },
      nextIdeaNeeded: {
        type: 'boolean',
        description: 'Whether more creativity is needed'
      }
    },
    required: ['prompt', 'ideas', 'techniques', 'connections', 'insights', 'sessionId', 'iteration', 'nextIdeaNeeded']
  }
};