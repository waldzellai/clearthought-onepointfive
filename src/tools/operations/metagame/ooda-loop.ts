/**
 * OODA Loop (Observe, Orient, Decide, Act) Operation
 * Implements rapid decision cycles with hypothesis tracking and learning rate measurement
 */

import type { OperationContext, OperationResult } from '../base.js';
import { BaseOperation } from '../base.js';
import type { 
  OODASession, 
  OODAPhase, 
  OODANode, 
  OODAHypothesis 
} from '../../../types/reasoning-patterns/ooda-loop.js';
import {
  createOODASession,
  advancePhase,
  createOODANode,
  suggestNextActions,
  evaluateEvidenceQuality,
  exportToMarkdown
} from '../../../types/reasoning-patterns/ooda-loop.js';

/**
 * OODA Loop operation for rapid decision-making cycles
 */
export class OODALoopOperation extends BaseOperation {
  name = 'ooda-loop';
  category = 'metagame';

  async execute(context: OperationContext): Promise<OperationResult> {
    const sessionId = this.getParam(context.parameters, 'sessionId', 'default');
    const phase = this.getParam(context.parameters, 'phase', null) as OODAPhase | null;
    const evidence = this.getParam(context.parameters, 'evidence', []) as string[];
    const autoAdvance = this.getParam(context.parameters, 'autoAdvance', true);
    const action = this.getParam(context.parameters, 'action', 'continue') as 'start' | 'continue' | 'advance' | 'export';

    // Get or create OODA session
    let session = context.sessionState.getOODASession(sessionId);
    
    if (!session && action !== 'start') {
      return this.createResult({
        error: 'OODA session not found. Use action "start" to create a new session.',
        suggestions: ['Start a new OODA loop session with action: "start"']
      });
    }

    switch (action) {
      case 'start':
        session = createOODASession({
          maxLoopTimeMs: this.getParam(context.parameters, 'maxLoopTimeMs', 15 * 60 * 1000),
          autoAdvance: this.getParam(context.parameters, 'autoAdvance', true),
          minEvidence: this.getParam(context.parameters, 'minEvidence', 2),
          carryForwardHypotheses: this.getParam(context.parameters, 'carryForwardHypotheses', true)
        });
        context.sessionState.setOODASession(sessionId, session);
        break;

      case 'continue':
        if (!session) {
          return this.createResult({
            error: 'Session not found'
          });
        }

        // Create new node for current phase
        const nodePhase = phase || session.currentPhase;
        const node = createOODANode(context.prompt, nodePhase, evidence);
        
        // Add hypotheses if provided
        const hypotheses = this.getParam(context.parameters, 'hypotheses', []) as Array<{
          statement: string;
          confidence: number;
        }>;
        
        if (hypotheses.length > 0) {
          node.hypotheses = hypotheses.map(h => ({
            id: `hyp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            statement: h.statement,
            confidence: h.confidence,
            status: 'proposed' as const,
            carriedForward: false
          }));

          // Add to session hypotheses
          node.hypotheses.forEach(h => {
            session!.hypotheses.set(h.id, h);
          });
        }

        // Add decision data if in decide phase
        if (nodePhase === 'decide') {
          const options = this.getParam(context.parameters, 'options', []) as string[];
          const selected = this.getParam(context.parameters, 'selected', '') as string;
          const rationale = this.getParam(context.parameters, 'rationale', '') as string;

          if (options.length > 0 && selected && rationale) {
            node.decision = { options, selected, rationale };
          }
        }

        // Add action data if in act phase
        if (nodePhase === 'act') {
          const actionDescription = this.getParam(context.parameters, 'actionDescription', '') as string;
          const outcome = this.getParam(context.parameters, 'outcome', '') as string;
          const metrics = this.getParam(context.parameters, 'metrics', {}) as Record<string, number>;

          if (actionDescription) {
            node.action = { 
              description: actionDescription,
              outcome: outcome || undefined,
              metrics: Object.keys(metrics).length > 0 ? metrics : undefined
            };
          }
        }

        // Evaluate evidence quality
        node.phaseTimeMs = Date.now() - new Date(node.timestamp).getTime();
        const evidenceQuality = evaluateEvidenceQuality(node);
        session.metrics.evidenceQuality = 
          (session.metrics.evidenceQuality * session.nodes.length + evidenceQuality) / 
          (session.nodes.length + 1);

        session.nodes.push(node);
        session.iteration++;
        session.updatedAt = new Date().toISOString();

        // Auto-advance if configured and criteria met
        if (autoAdvance && evidence.length >= session.config.minEvidence) {
          const checklist = session.phaseChecklist.get(session.currentPhase) || [];
          const checklistMet = checklist.every(item => 
            evidence.some(e => e.toLowerCase().includes(item.replace('_', ' ')))
          );

          if (checklistMet) {
            session = advancePhase(session);
          }
        }

        context.sessionState.setOODASession(sessionId, session);
        break;

      case 'advance':
        if (!session) {
          return this.createResult({
            error: 'Session not found'
          });
        }

        session = advancePhase(session);
        context.sessionState.setOODASession(sessionId, session);
        break;

      case 'export':
        if (!session) {
          return this.createResult({
            error: 'Session not found'
          });
        }

        const markdown = exportToMarkdown(session);
        return this.createResult({
          sessionId: session.sessionId,
          currentPhase: session.currentPhase,
          loopNumber: session.loopNumber,
          metrics: session.metrics,
          export: markdown,
          format: 'markdown'
        });
    }

    if (!session) {
      return this.createResult({
        error: 'Failed to create or retrieve session'
      });
    }

    // Generate suggestions for next actions
    const suggestions = suggestNextActions(session);

    // Update KPIs in session state
    context.sessionState.updateKPI('ooda_avg_loop_time', session.metrics.avgLoopTimeMs, 'Average Loop Time (ms)');
    context.sessionState.updateKPI('ooda_learning_rate', session.metrics.learningRate, 'Learning Rate', 1.0, 'up');
    context.sessionState.updateKPI('ooda_hypothesis_accuracy', session.metrics.hypothesisAccuracy, 'Hypothesis Accuracy', 0.8, 'up');

    return this.createResult({
      sessionId: session.sessionId,
      currentPhase: session.currentPhase,
      loopNumber: session.loopNumber,
      iteration: session.iteration,
      phaseChecklist: Array.from(session.phaseChecklist.get(session.currentPhase) || []),
      activeHypotheses: Array.from(session.hypotheses.values()).filter(h => h.status !== 'invalidated'),
      metrics: {
        avgLoopTimeMs: Math.round(session.metrics.avgLoopTimeMs),
        learningRate: Math.round(session.metrics.learningRate * 100) / 100,
        decisionLatencyMs: Math.round(session.metrics.decisionLatencyMs),
        completedLoops: session.metrics.completedLoops,
        hypothesisAccuracy: Math.round(session.metrics.hypothesisAccuracy * 100) / 100,
        evidenceQuality: Math.round(session.metrics.evidenceQuality * 100) / 100
      },
      suggestions,
      nextStepNeeded: true,
      recommendedNextPhase: session.currentPhase === 'act' ? 'observe' : 
        session.currentPhase === 'observe' ? 'orient' :
        session.currentPhase === 'orient' ? 'decide' : 'act'
    });
  }
}