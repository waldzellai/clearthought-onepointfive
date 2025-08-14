/**
 * OODA Loop Sprint Pattern Implementation
 *
 * Implements the Observe-Orient-Decide-Act loop for rapid decision cycles
 * with automated timing, hypothesis tracking, and learning rate measurement.
 */
/**
 * Creates a new OODA session
 */
export function createOODASession(config) {
    const now = new Date().toISOString();
    return {
        sessionId: `ooda-${Date.now()}`,
        patternType: 'ooda',
        iteration: 0,
        nextStepNeeded: true,
        createdAt: now,
        updatedAt: now,
        currentPhase: 'observe',
        loopNumber: 1,
        nodes: [],
        hypotheses: new Map(),
        metrics: {
            avgLoopTimeMs: 0,
            learningRate: 0,
            decisionLatencyMs: 0,
            completedLoops: 0,
            hypothesisAccuracy: 0,
            evidenceQuality: 0
        },
        loopStartTime: now,
        phaseChecklist: new Map([
            ['observe', ['data_collected', 'anomalies_noted', 'patterns_identified']],
            ['orient', ['context_analyzed', 'biases_acknowledged', 'framework_applied']],
            ['decide', ['options_evaluated', 'risks_assessed', 'decision_documented']],
            ['act', ['action_executed', 'results_captured', 'feedback_collected']]
        ]),
        config: {
            maxLoopTimeMs: 15 * 60 * 1000, // 15 minutes default
            autoAdvance: true,
            minEvidence: 2,
            carryForwardHypotheses: true,
            ...config
        }
    };
}
/**
 * Advances to the next phase in the OODA loop
 */
export function advancePhase(session) {
    const phaseOrder = ['observe', 'orient', 'decide', 'act'];
    const currentIndex = phaseOrder.indexOf(session.currentPhase);
    const nextIndex = (currentIndex + 1) % phaseOrder.length;
    const updated = { ...session };
    updated.currentPhase = phaseOrder[nextIndex];
    updated.updatedAt = new Date().toISOString();
    // If completing a loop, update metrics
    if (session.currentPhase === 'act') {
        updated.loopNumber++;
        updated.metrics.completedLoops++;
        // Calculate loop time
        if (session.loopStartTime) {
            const loopTime = Date.now() - new Date(session.loopStartTime).getTime();
            updated.metrics.avgLoopTimeMs =
                (updated.metrics.avgLoopTimeMs * (updated.metrics.completedLoops - 1) + loopTime) /
                    updated.metrics.completedLoops;
        }
        updated.loopStartTime = new Date().toISOString();
        // Calculate learning rate
        updated.metrics.learningRate = calculateLearningRate(session);
    }
    return updated;
}
/**
 * Creates a new OODA node for the current phase
 */
export function createOODANode(content, phase, evidence) {
    return {
        id: `ooda-node-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        phase,
        evidence,
        phaseTimeMs: 0
    };
}
/**
 * Calculates the learning rate based on hypothesis validation
 */
export function calculateLearningRate(session) {
    const validated = Array.from(session.hypotheses.values())
        .filter(h => h.status === 'validated').length;
    const total = session.hypotheses.size;
    if (total === 0)
        return 0;
    // Learning rate = validated hypotheses / total hypotheses * loop efficiency
    const validationRate = validated / total;
    const loopEfficiency = session.metrics.avgLoopTimeMs > 0
        ? Math.min(1, (5 * 60 * 1000) / session.metrics.avgLoopTimeMs) // 5 min baseline
        : 1;
    return validationRate * loopEfficiency;
}
/**
 * Generates phase-specific checklists
 */
export function getPhaseChecklist(phase) {
    const checklists = {
        observe: [
            'Collect raw data from environment',
            'Note anomalies and changes',
            'Identify emerging patterns',
            'Document observations without interpretation'
        ],
        orient: [
            'Analyze observations in context',
            'Apply mental models and frameworks',
            'Identify and challenge biases',
            'Synthesize information into understanding'
        ],
        decide: [
            'Generate decision options',
            'Evaluate risks and benefits',
            'Consider second-order effects',
            'Document decision rationale'
        ],
        act: [
            'Execute chosen action',
            'Monitor immediate results',
            'Collect feedback data',
            'Prepare for next observation cycle'
        ]
    };
    return checklists[phase] || [];
}
/**
 * Evaluates evidence quality for the current phase
 */
export function evaluateEvidenceQuality(node) {
    if (!node.evidence || node.evidence.length === 0)
        return 0;
    let quality = 0;
    // Check evidence count
    quality += Math.min(node.evidence.length / 5, 0.3); // Up to 30% for quantity
    // Check evidence detail (avg length as proxy)
    const avgLength = node.evidence.reduce((sum, e) => sum + e.length, 0) / node.evidence.length;
    quality += Math.min(avgLength / 100, 0.3); // Up to 30% for detail
    // Phase-specific quality checks
    switch (node.phase) {
        case 'observe':
            // Observations should be specific and measurable
            quality += node.evidence.some(e => /\d+/.test(e)) ? 0.2 : 0;
            break;
        case 'orient':
            // Orientation should reference frameworks or models
            quality += node.evidence.some(e => /framework|model|theory/i.test(e)) ? 0.2 : 0;
            break;
        case 'decide':
            // Decisions should have clear rationale
            quality += node.decision ? 0.2 : 0;
            break;
        case 'act':
            // Actions should have measurable outcomes
            quality += node.action?.outcome ? 0.2 : 0;
            break;
    }
    return Math.min(quality, 1);
}
/**
 * Suggests next actions based on current phase and state
 */
export function suggestNextActions(session) {
    const suggestions = [];
    const currentPhase = session.currentPhase;
    // Phase-specific suggestions
    switch (currentPhase) {
        case 'observe':
            suggestions.push('Gather additional data points');
            suggestions.push('Document unexpected observations');
            suggestions.push('Check for environmental changes');
            break;
        case 'orient':
            suggestions.push('Apply alternative mental models');
            suggestions.push('Challenge current assumptions');
            suggestions.push('Synthesize observations into patterns');
            break;
        case 'decide':
            suggestions.push('Generate additional options');
            suggestions.push('Perform risk assessment');
            suggestions.push('Consider timing implications');
            break;
        case 'act':
            suggestions.push('Execute with minimal delay');
            suggestions.push('Set up feedback mechanisms');
            suggestions.push('Prepare contingency responses');
            break;
    }
    // General suggestions based on metrics
    if (session.metrics.avgLoopTimeMs > session.config.maxLoopTimeMs) {
        suggestions.push('⚠️ Accelerate decision cycle - exceeding time limit');
    }
    if (session.metrics.hypothesisAccuracy < 0.5 && session.loopNumber > 3) {
        suggestions.push('📊 Review and revise hypothesis generation approach');
    }
    if (session.metrics.evidenceQuality < 0.6) {
        suggestions.push('🔍 Improve evidence collection and documentation');
    }
    return suggestions;
}
/**
 * Exports OODA session to markdown format
 */
export function exportToMarkdown(session) {
    const lines = [
        '# OODA Loop Session',
        '',
        `**Session ID:** ${session.sessionId}`,
        `**Current Loop:** ${session.loopNumber}`,
        `**Current Phase:** ${session.currentPhase}`,
        '',
        '## Metrics',
        `- Average Loop Time: ${Math.round(session.metrics.avgLoopTimeMs / 1000)}s`,
        `- Learning Rate: ${(session.metrics.learningRate * 100).toFixed(1)}%`,
        `- Hypothesis Accuracy: ${(session.metrics.hypothesisAccuracy * 100).toFixed(1)}%`,
        `- Evidence Quality: ${(session.metrics.evidenceQuality * 100).toFixed(1)}%`,
        '',
        '## Loop History'
    ];
    // Group nodes by loop
    let currentLoop = 1;
    lines.push(`\n### Loop ${currentLoop}`);
    for (const node of session.nodes) {
        if (node.phase === 'observe' && session.nodes.indexOf(node) > 0) {
            currentLoop++;
            lines.push(`\n### Loop ${currentLoop}`);
        }
        lines.push(`\n#### ${node.phase.toUpperCase()}`);
        lines.push(node.content);
        if (node.evidence && node.evidence.length > 0) {
            lines.push('\n**Evidence:**');
            node.evidence.forEach(e => lines.push(`- ${e}`));
        }
        if (node.decision) {
            lines.push('\n**Decision:**');
            lines.push(`Selected: ${node.decision.selected}`);
            lines.push(`Rationale: ${node.decision.rationale}`);
        }
        if (node.action) {
            lines.push('\n**Action:**');
            lines.push(node.action.description);
            if (node.action.outcome) {
                lines.push(`Outcome: ${node.action.outcome}`);
            }
        }
    }
    // Add active hypotheses
    if (session.hypotheses.size > 0) {
        lines.push('\n## Active Hypotheses');
        for (const [id, hypothesis] of session.hypotheses) {
            lines.push(`\n### ${hypothesis.statement}`);
            lines.push(`- Status: ${hypothesis.status}`);
            lines.push(`- Confidence: ${(hypothesis.confidence * 100).toFixed(0)}%`);
            if (hypothesis.evidence && hypothesis.evidence.length > 0) {
                lines.push('- Evidence:');
                hypothesis.evidence.forEach(e => lines.push(`  - ${e}`));
            }
        }
    }
    return lines.join('\n');
}
