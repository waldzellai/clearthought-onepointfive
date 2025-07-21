import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionState } from '../../state/SessionState.js';
import { SystemsData, FeedbackLoop, SystemRelationship } from '../../types/systems.js';

export interface SystemsThinkingArgs {
  system: string;
  components: string[];
  relationships: SystemRelationship[];
  feedbackLoops: FeedbackLoop[];
  emergentProperties: string[];
  leveragePoints: string[];
  sessionId: string;
  iteration: number;
  nextAnalysisNeeded: boolean;
}

export async function handleSystemsThinking(
  args: SystemsThinkingArgs,
  sessionState: SessionState
): Promise<CallToolResult> {
  const {
    system,
    components = [],
    relationships = [],
    feedbackLoops = [],
    emergentProperties = [],
    leveragePoints = [],
    sessionId,
    iteration,
    nextAnalysisNeeded
  } = args;

  // Generate unique ID for this systems analysis
  const systemsId = sessionId || `systems_${Date.now()}`;

  // Create systems data
  const systemsData: SystemsData = {
    id: systemsId,
    sessionId: sessionState.sessionId,
    system,
    components,
    relationships,
    feedbackLoops,
    emergentProperties,
    leveragePoints,
    iteration,
    nextAnalysisNeeded,
    createdAt: new Date()
  };

  // Store the systems thinking data
  sessionState.systemsStore.add(systemsData);

  // Touch the session to keep it alive
  sessionState.touch();

  // Analyze system complexity
  const positiveLoops = feedbackLoops.filter(loop => loop.type === 'positive').length;
  const negativeLoops = feedbackLoops.filter(loop => loop.type === 'negative').length;
  const totalConnections = relationships.length;

  // Prepare response with session context
  const sessionContext = {
    sessionId: sessionState.sessionId,
    totalOperations: sessionState.getStatistics().totalOperations,
    systemsStoreStats: sessionState.getStatistics().stores.systems
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          systemsId,
          system,
          analysisMetrics: {
            componentCount: components.length,
            relationshipCount: relationships.length,
            feedbackLoops: {
              positive: positiveLoops,
              negative: negativeLoops,
              total: feedbackLoops.length
            },
            emergentPropertiesCount: emergentProperties.length,
            leveragePointsCount: leveragePoints.length
          },
          iteration,
          nextAnalysisNeeded,
          status: 'success',
          sessionContext
        }, null, 2)
      }
    ]
  };
}