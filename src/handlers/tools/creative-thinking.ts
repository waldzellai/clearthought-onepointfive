import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionState } from '../../state/SessionState.js';
import { CreativeData } from '../../types/creative.js';

export interface CreativeThinkingArgs {
  prompt: string;
  ideas: string[];
  techniques: string[];
  connections: string[];
  insights: string[];
  sessionId: string;
  iteration: number;
  nextIdeaNeeded: boolean;
}

export async function handleCreativeThinking(
  args: CreativeThinkingArgs,
  sessionState: SessionState
): Promise<CallToolResult> {
  const {
    prompt,
    ideas = [],
    techniques = [],
    connections = [],
    insights = [],
    sessionId,
    iteration,
    nextIdeaNeeded
  } = args;

  // Generate unique ID for this creative session
  const creativeId = sessionId || `creative_${Date.now()}`;

  // Create creative data
  const creativeData: CreativeData = {
    id: creativeId,
    sessionId: sessionState.sessionId,
    prompt,
    ideas,
    techniques,
    connections,
    insights,
    iteration,
    nextIdeaNeeded,
    createdAt: new Date()
  };

  // Store the creative thinking data
  sessionState.creativeStore.add(creativeData);

  // Touch the session to keep it alive
  sessionState.touch();

  // Prepare response with session context
  const sessionContext = {
    sessionId: sessionState.sessionId,
    totalOperations: sessionState.getStatistics().totalOperations,
    creativeStoreStats: sessionState.getStatistics().stores.creative
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          sessionId: creativeId,
          prompt,
          ideasGenerated: ideas.length,
          techniquesUsed: techniques.length,
          connectionsFound: connections.length,
          insightsDiscovered: insights.length,
          iteration,
          nextIdeaNeeded,
          status: 'success',
          sessionContext
        }, null, 2)
      }
    ]
  };
}