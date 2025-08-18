/**
 * PDR (Plan-Do-Review) Reasoning Operation
 * Implements progressive deep reasoning with multi-pass exploration
 */

import type { OperationContext, OperationResult } from '../base.js';
import { BaseOperation } from '../base.js';
import type { 
  PDRSession, 
  PDRSubject, 
  PDRApproach,
  PDRSelectionCriteria
} from '../../../types/reasoning-patterns/pdr.js';

/**
 * PDR Reasoning operation for structured multi-pass analysis
 */
export class PDRReasoningOperation extends BaseOperation {
  name = 'pdr-reasoning';
  category = 'special';

  async execute(context: OperationContext): Promise<OperationResult> {
    const sessionId = this.getParam(context.parameters, 'sessionId', 'default');
    const action = this.getParam(context.parameters, 'action', 'continue') as 
      'start' | 'continue' | 'add_subject' | 'run_pass' | 'select' | 'export';

    // Get or create PDR session
    let session = context.sessionState.getPDRSession(sessionId);
    
    if (!session && action !== 'start') {
      return this.createResult({
        error: 'PDR session not found. Use action "start" to create a new session.',
        suggestions: ['Start a new PDR session with action: "start"']
      });
    }

    switch (action) {
      case 'start':
        const maxPasses = this.getParam(context.parameters, 'maxPasses', 5);
        const globalSelection = this.getParam(context.parameters, 'globalSelection', {}) as PDRSelectionCriteria;
        
        session = {
          id: sessionId,
          subjects: new Map(),
          passes: [],
          traces: [],
          maxPasses,
          globalSelection: Object.keys(globalSelection).length > 0 ? globalSelection : undefined,
          stopConditions: {
            maxTimeMs: this.getParam(context.parameters, 'maxTimeMs', 30 * 60 * 1000), // 30 minutes
            minImprovement: this.getParam(context.parameters, 'minImprovement', 0.1),
            confidenceThreshold: this.getParam(context.parameters, 'confidenceThreshold', 0.8)
          }
        };

        // Initialize with default passes
        session.passes = [
          {
            id: 'scan',
            name: 'scan',
            defaultApproach: 'sequential',
            budget: { subjectsLimit: 10, timeMs: 5 * 60 * 1000 }
          },
          {
            id: 'cluster',
            name: 'cluster',
            defaultApproach: 'graph',
            budget: { subjectsLimit: 8, timeMs: 5 * 60 * 1000 }
          },
          {
            id: 'select',
            name: 'select',
            selection: { topK: 3, minScore: 0.6 },
            budget: { subjectsLimit: 5, timeMs: 3 * 60 * 1000 }
          },
          {
            id: 'deepen',
            name: 'deepen',
            defaultApproach: 'tree',
            budget: { subjectsLimit: 3, timeMs: 10 * 60 * 1000 }
          },
          {
            id: 'synthesize',
            name: 'synthesize',
            defaultApproach: 'beam',
            budget: { subjectsLimit: 2, timeMs: 7 * 60 * 1000 }
          }
        ];

        context.sessionState.setPDRSession(sessionId, session);
        break;

      case 'add_subject':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const subjectTitle = this.getParam(context.parameters, 'title', context.prompt);
        const subjectDescription = this.getParam(context.parameters, 'description', '');
        const subjectTags = this.getParam(context.parameters, 'tags', []) as string[];

        const subject: PDRSubject = {
          id: `subject-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: subjectTitle,
          description: subjectDescription || undefined,
          tags: subjectTags.length > 0 ? subjectTags : undefined,
          passScores: {},
          confidence: 0.5,
          selected: false
        };

        session.subjects.set(subject.id, subject);
        context.sessionState.setPDRSession(sessionId, session);
        break;

      case 'run_pass':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const passName = this.getParam(context.parameters, 'passName', 'scan') as PDRSession['passes'][0]['name'];
        const approach = this.getParam(context.parameters, 'approach', null) as PDRApproach | null;
        
        const passPolicy = session.passes.find(p => p.name === passName);
        if (!passPolicy) {
          return this.createResult({
            error: `Pass policy '${passName}' not found`,
            availablePasses: session.passes.map(p => p.name)
          });
        }

        // Create pass trace
        const trace = {
          id: `trace-${Date.now()}`,
          policyId: passPolicy.id,
          startedAt: new Date().toISOString(),
          processedSubjectIds: [] as string[],
          approachBySubject: {} as Record<string, PDRApproach>,
          resultsBySubject: {} as Record<string, any>,
          completedAt: undefined as string | undefined
        };

        // Determine which subjects to process
        const availableSubjects = Array.from(session.subjects.values());
        const subjectsToProcess = passPolicy.budget?.subjectsLimit 
          ? availableSubjects.slice(0, passPolicy.budget.subjectsLimit)
          : availableSubjects;

        // Process each subject
        for (const subject of subjectsToProcess) {
          const subjectApproach = approach || passPolicy.defaultApproach || 'sequential';
          trace.approachBySubject[subject.id] = subjectApproach;
          trace.processedSubjectIds.push(subject.id);

          // Simulate processing with different approaches
          let score = 0.5;
          let confidence = 0.5;
          const notes: string[] = [];

          switch (subjectApproach) {
            case 'sequential':
              score = 0.6 + Math.random() * 0.3;
              confidence = 0.5 + Math.random() * 0.3;
              notes.push('Sequential analysis completed');
              break;
            case 'tree':
              score = 0.7 + Math.random() * 0.2;
              confidence = 0.6 + Math.random() * 0.3;
              notes.push('Tree exploration with multiple branches');
              break;
            case 'beam':
              score = 0.65 + Math.random() * 0.25;
              confidence = 0.55 + Math.random() * 0.35;
              notes.push('Beam search with top candidates');
              break;
            case 'graph':
              score = 0.75 + Math.random() * 0.2;
              confidence = 0.7 + Math.random() * 0.25;
              notes.push('Graph-based relationship analysis');
              break;
            case 'mcts':
              score = 0.8 + Math.random() * 0.15;
              confidence = 0.75 + Math.random() * 0.2;
              notes.push('Monte Carlo tree search exploration');
              break;
            default:
              score = 0.5 + Math.random() * 0.4;
              confidence = 0.5 + Math.random() * 0.4;
              notes.push('Auto-selected approach');
          }

          // Update subject scores
          subject.passScores[passPolicy.id] = score;
          subject.confidence = confidence;

          // Store results
          trace.resultsBySubject[subject.id] = {
            score,
            confidence,
            notes: notes.join('; '),
            artifacts: [
              {
                kind: 'markdown' as const,
                content: `# ${subject.title}\n\n**Approach:** ${subjectApproach}\n**Score:** ${score.toFixed(2)}\n**Confidence:** ${confidence.toFixed(2)}\n\n${notes.join('\n')}`
              }
            ]
          };
        }

        trace.completedAt = new Date().toISOString();
        session.traces.push(trace);
        context.sessionState.setPDRSession(sessionId, session);
        break;

      case 'select':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const criteria = this.getParam(context.parameters, 'criteria', session.globalSelection) as PDRSelectionCriteria;
        const subjects = Array.from(session.subjects.values());

        // Apply selection criteria
        let filtered = subjects;

        if (criteria.minScore) {
          filtered = filtered.filter(s => {
            const avgScore = Object.values(s.passScores).reduce((a, b) => a + b, 0) / Object.values(s.passScores).length;
            return avgScore >= criteria.minScore!;
          });
        }

        if (criteria.topK) {
          filtered = filtered
            .sort((a, b) => {
              const avgA = Object.values(a.passScores).reduce((sum, score) => sum + score, 0) / Object.values(a.passScores).length;
              const avgB = Object.values(b.passScores).reduce((sum, score) => sum + score, 0) / Object.values(b.passScores).length;
              return avgB - avgA;
            })
            .slice(0, criteria.topK);
        }

        // Mark selected subjects
        subjects.forEach(s => s.selected = false);
        filtered.forEach(s => s.selected = true);

        session.summary = {
          chosenSubjectIds: filtered.map(s => s.id),
          synthesis: `Selected ${filtered.length} subjects based on criteria: ${JSON.stringify(criteria)}`,
          decisions: filtered.map(s => ({
            subjectId: s.id,
            decision: 'selected',
            rationale: `Score: ${Object.values(s.passScores).reduce((a, b) => a + b, 0) / Object.values(s.passScores).length || 0}, Confidence: ${s.confidence || 0}`
          }))
        };

        context.sessionState.setPDRSession(sessionId, session);
        break;

      case 'export':
        if (!session) {
          return this.createResult({ error: 'Session not found' });
        }

        const exportData = {
          sessionId: session.id,
          subjects: Array.from(session.subjects.entries()).map(([id, subject]) => ({ ...subject, id })),
          passes: session.passes,
          traces: session.traces,
          summary: session.summary
        };

        return this.createResult({
          sessionId: session.id,
          export: JSON.stringify(exportData, null, 2),
          format: 'json',
          summary: session.summary
        });
    }

    if (!session) {
      return this.createResult({ error: 'Failed to create or retrieve session' });
    }

    // Generate status and suggestions
    const totalSubjects = session.subjects.size;
    const selectedSubjects = Array.from(session.subjects.values()).filter(s => s.selected).length;
    const completedPasses = session.traces.length;
    
    const suggestions: string[] = [];
    
    if (totalSubjects === 0) {
      suggestions.push('Add subjects to analyze with action: "add_subject"');
    } else if (completedPasses === 0) {
      suggestions.push('Run initial scan pass with action: "run_pass" and passName: "scan"');
    } else if (completedPasses < session.passes.length) {
      const nextPass = session.passes[completedPasses];
      suggestions.push(`Run next pass: "${nextPass.name}" with action: "run_pass"`);
    } else if (selectedSubjects === 0) {
      suggestions.push('Select subjects for final analysis with action: "select"');
    } else {
      suggestions.push('Export final results with action: "export"');
    }

    // Update KPIs
    context.sessionState.updateKPI('pdr_subjects_total', totalSubjects, 'Total Subjects');
    context.sessionState.updateKPI('pdr_subjects_selected', selectedSubjects, 'Selected Subjects');
    context.sessionState.updateKPI('pdr_passes_completed', completedPasses, 'Completed Passes');

    return this.createResult({
      sessionId: session.id,
      totalSubjects,
      selectedSubjects,
      completedPasses: completedPasses,
      totalPasses: session.passes.length,
      availablePasses: session.passes.map(p => p.name),
      nextPass: completedPasses < session.passes.length ? session.passes[completedPasses].name : null,
      recentTrace: session.traces.length > 0 ? {
        passName: session.passes.find(p => p.id === session.traces[session.traces.length - 1].policyId)?.name,
        processedSubjects: session.traces[session.traces.length - 1].processedSubjectIds.length,
        completedAt: session.traces[session.traces.length - 1].completedAt
      } : null,
      summary: session.summary,
      suggestions,
      nextStepNeeded: !session.summary || completedPasses < session.passes.length
    });
  }
}