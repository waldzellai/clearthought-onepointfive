import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SessionState } from '../../state/SessionState.js';
import { SocraticData } from '../../types/socratic.js';

export interface SocraticMethodArgs {
  claim: string;
  premises: string[];
  conclusion: string;
  question: string;
  stage: 'clarification' | 'assumptions' | 'evidence' | 'perspectives' | 'implications' | 'questions';
  argumentType: 'deductive' | 'inductive' | 'abductive' | 'analogical';
  confidence: number;
  sessionId: string;
  iteration: number;
  nextArgumentNeeded: boolean;
}

export async function handleSocraticMethod(
  args: SocraticMethodArgs,
  sessionState: SessionState
): Promise<CallToolResult> {
  const {
    claim,
    premises = [],
    conclusion,
    question,
    stage,
    argumentType,
    confidence,
    sessionId,
    iteration,
    nextArgumentNeeded
  } = args;

  // Validate confidence is between 0 and 1
  const validatedConfidence = Math.max(0, Math.min(1, confidence));

  // Generate unique ID for this Socratic session
  const socraticId = sessionId || `socratic_${Date.now()}`;

  // Create Socratic data
  const socraticData: SocraticData = {
    id: socraticId,
    sessionId: sessionState.sessionId,
    claim,
    premises,
    conclusion,
    question,
    stage,
    argumentType,
    confidence: validatedConfidence,
    iteration,
    nextArgumentNeeded,
    createdAt: new Date()
  };

  // Store the Socratic method data
  // TODO: Once SocraticStore is created, use that instead
  // For now, using CreativeStore as a workaround (as noted in SessionState)
  sessionState.creativeStore.add(socraticData as any);

  // Touch the session to keep it alive
  sessionState.touch();

  // Prepare response with session context
  const sessionContext = {
    sessionId: sessionState.sessionId,
    totalOperations: sessionState.getStatistics().totalOperations,
    creativeStoreStats: sessionState.getStatistics().stores.creative,
    recentQuestions: [
      {
        stage,
        question,
        iteration
      }
    ]
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          socraticId,
          claim,
          premisesCount: premises.length,
          argumentType,
          confidence: validatedConfidence,
          nextArgumentNeeded,
          status: 'success',
          sessionContext
        }, null, 2)
      }
    ]
  };
}