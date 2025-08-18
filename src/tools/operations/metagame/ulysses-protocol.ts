/**
 * Ulysses Protocol Operation
 * Enforces time-boxed execution with iteration limits and auto-escalation
 */

import type { OperationContext, OperationResult } from '../base.js';
import { BaseOperation } from '../base.js';
import type { 
  UlyssesSession, 
  UlyssesPhase, 
  UlyssesNode,
  UlyssesGate
} from '../../../types/reasoning-patterns/ulysses-protocol.js';
import {
  createUlyssesSession,
  advancePhase,
  createUlyssesNode,
  checkConstraints,
  suggestNextActions,
  makeFinalDecision,
  exportToMarkdown
} from '../../../types/reasoning-patterns/ulysses-protocol.js';

/**
 * Ulysses Protocol operation for time-boxed execution with strict gates
 */
export class UlyssesProtocolOperation extends BaseOperation {
  name = 'ulysses-protocol';
  category = 'metagame';

  async execute(context: OperationContext): Promise<OperationResult> {
    const sessionId = this.getParam(context.parameters, 'sessionId', 'default');
    const phase = this.getParam(context.parameters, 'phase', null) as UlyssesPhase | null;
    const confidence = this.getParam(context.parameters, 'confidence', 0.5);
    const evidence = this.getParam(context.parameters, 'evidence', []) as string[];
    const action = this.getParam(context.parameters, 'action', 'continue') as 
      'start' | 'continue' | 'advance' | 'decide' | 'export';

    // Get or create Ulysses session
    let session = context.sessionState.getUlyssesSession(sessionId);
    
    if (!session && action !== 'start') {
      return this.createResult({
        error: 'Ulysses session not found. Use action "start" to create a new session.',
        suggestions: ['Start a new Ulysses Protocol session with action: "start"']
      });
    }

    switch (action) {
      case 'start':
        const constraints = this.getParam(context.parameters, 'constraints', {});
        const policy = this.getParam(context.parameters, 'policy', {});
        
        session = createUlyssesSession({ constraints, policy });
        context.sessionState.setUlyssesSession(sessionId, session);
        break;

      case 'continue':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        // Check constraints before proceeding
        const constraintCheck = checkConstraints(session);
        
        if (constraintCheck.violated && constraintCheck.escalation) {
          // Handle auto-escalation
          const escalatedNode = createUlyssesNode(
            `AUTO-ESCALATION: ${constraintCheck.escalation.reason}`,
            session.currentPhase,
            0.0
          );
          escalatedNode.escalated = constraintCheck.escalation;
          session.nodes.push(escalatedNode);
          session.metrics.escalations++;
          
          if (constraintCheck.escalation.action === 'abort') {
            session.finalDecision = makeFinalDecision(session, constraintCheck.escalation.reason);
          }
        }

        // Create new node for current phase
        const nodePhase = phase || session.currentPhase;
        const node = createUlyssesNode(context.prompt, nodePhase, confidence);
        
        if (evidence.length > 0) {
          node.evidence = evidence;
        }

        // Track iteration if in implementation phase
        if (nodePhase === 'implementation') {
          node.iteration = session.implementationIteration;
          if (session.implementationIteration <= session.constraints.maxIterations) {
            session.implementationIteration++;
            session.metrics.iterations = session.implementationIteration;
          }
        }

        // Check for scope changes
        const scopeChange = this.getParam(context.parameters, 'scopeChange', null) as {
          description: string;
          impact: 'minor' | 'moderate' | 'major';
          approved: boolean;
        } | null;

        if (scopeChange) {
          node.scopeChange = scopeChange;
          if (!scopeChange.approved) {
            session.metrics.scopeDrift += scopeChange.impact === 'minor' ? 0.2 : 
              scopeChange.impact === 'moderate' ? 0.5 : 1.0;
          }
        }

        // Track time spent
        const startTime = Date.now();
        node.timeSpentMs = startTime - new Date(session.startTime).getTime();

        session.nodes.push(node);
        session.iteration++;
        session.updatedAt = new Date().toISOString();

        // Update confidence metric
        session.metrics.confidence = 
          (session.metrics.confidence * (session.nodes.length - 1) + confidence) / 
          session.nodes.length;

        context.sessionState.setUlyssesSession(sessionId, session);
        break;

      case 'advance':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const advancement = advancePhase(session, evidence);
        if (advancement.success) {
          session = { ...session };
          context.sessionState.setUlyssesSession(sessionId, session);
        } else {
          return this.createResult({
            error: `Cannot advance phase: ${advancement.reason}`,
            currentPhase: session.currentPhase,
            gateStatus: session?.gates.find(g => g.phase === session?.currentPhase)?.status,
            requiredEvidence: session?.gates.find(g => g.phase === session?.currentPhase)?.exitCriteria
          });
        }
        break;

      case 'decide':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const rationale = this.getParam(context.parameters, 'rationale', context.prompt);
        session.finalDecision = makeFinalDecision(session, rationale);
        context.sessionState.setUlyssesSession(sessionId, session);
        break;

      case 'export':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const markdown = exportToMarkdown(session);
        return this.createResult({
          sessionId: session.sessionId,
          currentPhase: session.currentPhase,
          finalDecision: session.finalDecision,
          metrics: session.metrics,
          export: markdown,
          format: 'markdown'
        });
    }

    if (!session) {
      return this.createResult({ error: 'Failed to create or retrieve session' });
    }

    // Check constraints and generate warnings
    const currentConstraintCheck = checkConstraints(session);
    const suggestions = suggestNextActions(session);
    
    if (currentConstraintCheck.violated) {
      suggestions.unshift('⚠️ CONSTRAINT VIOLATIONS DETECTED');
      currentConstraintCheck.violations.forEach(v => suggestions.unshift(`  - ${v}`));
    }

    // Update KPIs in session state
    context.sessionState.updateKPI('ulysses_confidence', session.metrics.confidence, 'Confidence Level', session.constraints.minConfidence, 'up');
    context.sessionState.updateKPI('ulysses_time_remaining', session.metrics.timeRemainingMs, 'Time Remaining (ms)', 0, 'up');
    context.sessionState.updateKPI('ulysses_scope_drift', session.metrics.scopeDrift, 'Scope Drift', session.constraints.maxScopeDrift, 'down');
    context.sessionState.updateKPI('ulysses_iterations', session.metrics.iterations, 'Implementation Iterations', session.constraints.maxIterations, 'down');

    // Get current gate information
    const currentGate = session.gates.find(g => g.phase === session.currentPhase);
    
    return this.createResult({
      sessionId: session.sessionId,
      currentPhase: session.currentPhase,
      iteration: session.iteration,
      implementationIteration: session.implementationIteration,
      constraints: {
        timeboxMs: session.constraints.timeboxMs,
        maxIterations: session.constraints.maxIterations,
        minConfidence: session.constraints.minConfidence,
        maxScopeDrift: session.constraints.maxScopeDrift
      },
      metrics: {
        confidence: Math.round(session.metrics.confidence * 100) / 100,
        timeElapsedMs: session.metrics.timeElapsedMs,
        timeRemainingMs: session.metrics.timeRemainingMs,
        timeRemainingMinutes: Math.round(session.metrics.timeRemainingMs / 1000 / 60),
        scopeDrift: Math.round(session.metrics.scopeDrift * 10) / 10,
        gatesPassed: session.metrics.gatesPassed,
        gatesFailed: session.metrics.gatesFailed,
        escalations: session.metrics.escalations
      },
      currentGate: currentGate ? {
        id: currentGate.id,
        title: currentGate.title,
        status: currentGate.status,
        entryCriteria: currentGate.entryCriteria,
        exitCriteria: currentGate.exitCriteria,
        entryMet: currentGate.entryMet,
        exitMet: currentGate.exitMet
      } : undefined,
      constraintViolations: currentConstraintCheck.violated ? currentConstraintCheck.violations : undefined,
      escalation: currentConstraintCheck.escalation,
      finalDecision: session.finalDecision,
      suggestions,
      nextStepNeeded: !session.finalDecision,
      recommendedAction: session.finalDecision ? 'complete' : 
        currentConstraintCheck.violated ? 'address_violations' : 'continue'
    });
  }
}