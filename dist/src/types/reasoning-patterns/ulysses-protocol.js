/**
 * Ulysses Protocol Implementation
 *
 * Enforces time-boxed execution phases with iteration limits, confidence tracking,
 * and auto-escalation to prevent scope drift and unbounded iterations.
 */
/**
 * Creates a new Ulysses Protocol session
 */
export function createUlyssesSession(config) {
    const now = new Date().toISOString();
    const gates = [
        {
            id: 'recon',
            phase: 'reconnaissance',
            title: 'Reconnaissance',
            status: 'open',
            entryCriteria: ['problem_defined', 'context_gathered'],
            exitCriteria: ['scope_understood', 'risks_identified', 'success_criteria_defined'],
            entryMet: false,
            exitMet: false
        },
        {
            id: 'plan',
            phase: 'planning',
            title: 'Strategic Planning',
            status: 'locked',
            entryCriteria: ['reconnaissance_complete', 'resources_available'],
            exitCriteria: ['approach_defined', 'milestones_set', 'contingencies_planned'],
            entryMet: false,
            exitMet: false
        },
        {
            id: 'impl',
            phase: 'implementation',
            title: 'Implementation (≤3 iterations)',
            status: 'locked',
            entryCriteria: ['plan_approved', 'tools_ready'],
            exitCriteria: ['solution_working', 'tests_passing', 'iteration_limit_respected'],
            entryMet: false,
            exitMet: false
        },
        {
            id: 'validate',
            phase: 'validation',
            title: 'Validation',
            status: 'locked',
            entryCriteria: ['implementation_complete', 'test_suite_ready'],
            exitCriteria: ['all_tests_pass', 'requirements_met', 'performance_acceptable'],
            entryMet: false,
            exitMet: false
        },
        {
            id: 'ship_abort',
            phase: 'ship_or_abort',
            title: 'Ship or Abort Decision',
            status: 'locked',
            entryCriteria: ['validation_complete', 'stakeholder_review'],
            exitCriteria: ['decision_made', 'rationale_documented', 'next_steps_clear'],
            entryMet: false,
            exitMet: false
        }
    ];
    return {
        sessionId: `ulysses-${Date.now()}`,
        patternType: 'ulysses',
        iteration: 0,
        nextStepNeeded: true,
        createdAt: now,
        updatedAt: now,
        currentPhase: 'reconnaissance',
        gates,
        nodes: [],
        metrics: {
            iterations: 0,
            confidence: 0,
            scopeDrift: 0,
            timeElapsedMs: 0,
            timeRemainingMs: 4 * 60 * 60 * 1000, // 4 hours default
            gatesPassed: 0,
            gatesFailed: 0,
            escalations: 0
        },
        startTime: now,
        implementationIteration: 0,
        constraints: {
            timeboxMs: 4 * 60 * 60 * 1000, // 4 hours
            maxIterations: 3,
            minConfidence: 0.8,
            maxScopeDrift: 1,
            ...config?.constraints
        },
        policy: {
            autoEscalate: true,
            notifyWhen: ['gateFail', 'timeboxNear', 'scopeDrift'],
            allowOverride: false,
            ...config?.policy
        }
    };
}
/**
 * Checks if entry criteria are met for a gate
 */
export function checkEntryCriteria(gate, evidence) {
    // Simple check: all criteria must have some evidence
    return gate.entryCriteria.every(criterion => evidence.some(e => e.toLowerCase().includes(criterion.replace('_', ' '))));
}
/**
 * Checks if exit criteria are met for a gate
 */
export function checkExitCriteria(gate, evidence) {
    // Simple check: all criteria must have some evidence
    return gate.exitCriteria.every(criterion => evidence.some(e => e.toLowerCase().includes(criterion.replace('_', ' '))));
}
/**
 * Attempts to pass a gate
 */
export function attemptGatePassage(session, gateId, evidence) {
    const gate = session.gates.find(g => g.id === gateId);
    if (!gate)
        return { passed: false, reason: 'Gate not found' };
    if (gate.status === 'passed') {
        return { passed: true, reason: 'Gate already passed' };
    }
    if (gate.status === 'locked') {
        return { passed: false, reason: 'Gate is locked - previous gate must be passed first' };
    }
    const entryMet = checkEntryCriteria(gate, evidence);
    const exitMet = checkExitCriteria(gate, evidence);
    if (!entryMet) {
        return { passed: false, reason: 'Entry criteria not met' };
    }
    if (!exitMet) {
        return { passed: false, reason: 'Exit criteria not met' };
    }
    // Special check for implementation gate - iteration limit
    if (gate.phase === 'implementation' && session.implementationIteration > session.constraints.maxIterations) {
        return { passed: false, reason: `Iteration limit exceeded (${session.implementationIteration}/${session.constraints.maxIterations})` };
    }
    return { passed: true };
}
/**
 * Advances to the next phase if gate criteria are met
 */
export function advancePhase(session, evidence) {
    const currentGate = session.gates.find(g => g.phase === session.currentPhase);
    if (!currentGate)
        return { success: false, reason: 'Current gate not found' };
    const passage = attemptGatePassage(session, currentGate.id, evidence);
    if (!passage.passed) {
        return { success: false, reason: passage.reason };
    }
    // Mark current gate as passed
    currentGate.status = 'passed';
    currentGate.exitMet = true;
    currentGate.timestamp = new Date().toISOString();
    session.metrics.gatesPassed++;
    // Find and unlock next gate
    const phaseOrder = ['reconnaissance', 'planning', 'implementation', 'validation', 'ship_or_abort'];
    const currentIndex = phaseOrder.indexOf(session.currentPhase);
    if (currentIndex < phaseOrder.length - 1) {
        const nextPhase = phaseOrder[currentIndex + 1];
        const nextGate = session.gates.find(g => g.phase === nextPhase);
        if (nextGate) {
            nextGate.status = 'open';
            session.currentPhase = nextPhase;
            session.updatedAt = new Date().toISOString();
            // Reset implementation iteration counter when entering implementation
            if (nextPhase === 'implementation') {
                session.implementationIteration = 1;
            }
            return { success: true, newPhase: nextPhase };
        }
    }
    return { success: false, reason: 'No more phases available' };
}
/**
 * Creates a new Ulysses node
 */
export function createUlyssesNode(content, phase, confidence, iteration) {
    return {
        id: `ulysses-node-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        phase,
        iteration,
        confidence: Math.max(0, Math.min(1, confidence)),
        timeSpentMs: 0
    };
}
/**
 * Calculates current confidence based on recent nodes
 */
export function calculateConfidence(session) {
    const recentNodes = session.nodes.slice(-5); // Last 5 nodes
    if (recentNodes.length === 0)
        return 0;
    const avgConfidence = recentNodes.reduce((sum, node) => sum + node.confidence, 0) / recentNodes.length;
    // Adjust for iteration count (confidence decreases with more iterations)
    const iterationPenalty = session.implementationIteration > session.constraints.maxIterations
        ? 0.2 * (session.implementationIteration - session.constraints.maxIterations)
        : 0;
    return Math.max(0, avgConfidence - iterationPenalty);
}
/**
 * Detects scope drift by analyzing scope changes
 */
export function detectScopeDrift(session) {
    const scopeChanges = session.nodes.filter(n => n.scopeChange && !n.scopeChange.approved);
    let driftScore = 0;
    for (const change of scopeChanges.map(n => n.scopeChange)) {
        switch (change.impact) {
            case 'minor':
                driftScore += 0.2;
                break;
            case 'moderate':
                driftScore += 0.5;
                break;
            case 'major':
                driftScore += 1.0;
                break;
        }
    }
    return driftScore;
}
/**
 * Checks for constraint violations and triggers escalation if needed
 */
export function checkConstraints(session) {
    const violations = [];
    const now = Date.now();
    const elapsed = now - new Date(session.startTime).getTime();
    // Update metrics
    session.metrics.timeElapsedMs = elapsed;
    session.metrics.timeRemainingMs = session.constraints.timeboxMs - elapsed;
    session.metrics.confidence = calculateConfidence(session);
    session.metrics.scopeDrift = detectScopeDrift(session);
    // Check time constraint
    if (elapsed > session.constraints.timeboxMs) {
        violations.push(`Time limit exceeded (${Math.round(elapsed / 1000 / 60)} min > ${Math.round(session.constraints.timeboxMs / 1000 / 60)} min)`);
    }
    // Check iteration constraint (only in implementation phase)
    if (session.currentPhase === 'implementation' &&
        session.implementationIteration > session.constraints.maxIterations) {
        violations.push(`Iteration limit exceeded (${session.implementationIteration} > ${session.constraints.maxIterations})`);
    }
    // Check confidence constraint
    if (session.metrics.confidence < session.constraints.minConfidence && session.nodes.length > 5) {
        violations.push(`Confidence below threshold (${(session.metrics.confidence * 100).toFixed(0)}% < ${(session.constraints.minConfidence * 100).toFixed(0)}%)`);
    }
    // Check scope drift
    if (session.metrics.scopeDrift > session.constraints.maxScopeDrift) {
        violations.push(`Scope drift exceeded (${session.metrics.scopeDrift.toFixed(1)} > ${session.constraints.maxScopeDrift})`);
    }
    // Determine escalation action
    let escalation;
    if (violations.length > 0 && session.policy.autoEscalate) {
        if (violations.some(v => v.includes('Time limit') || v.includes('Iteration limit'))) {
            escalation = {
                reason: violations.join('; '),
                action: 'abort'
            };
        }
        else if (violations.some(v => v.includes('Scope drift'))) {
            escalation = {
                reason: violations.join('; '),
                action: 'reduce_scope'
            };
        }
        else {
            escalation = {
                reason: violations.join('; '),
                action: 'extend_time'
            };
        }
        session.metrics.escalations++;
    }
    return {
        violated: violations.length > 0,
        violations,
        escalation
    };
}
/**
 * Suggests next actions based on current phase and constraints
 */
export function suggestNextActions(session) {
    const suggestions = [];
    const constraintCheck = checkConstraints(session);
    // Add constraint violation warnings
    if (constraintCheck.violated) {
        suggestions.push('⚠️ CONSTRAINT VIOLATIONS:');
        constraintCheck.violations.forEach(v => suggestions.push(`  - ${v}`));
        if (constraintCheck.escalation) {
            suggestions.push(`🚨 AUTO-ESCALATION: ${constraintCheck.escalation.action}`);
        }
    }
    // Phase-specific suggestions
    switch (session.currentPhase) {
        case 'reconnaissance':
            suggestions.push('Define clear success criteria');
            suggestions.push('Identify all stakeholders');
            suggestions.push('Document known risks and unknowns');
            break;
        case 'planning':
            suggestions.push('Break down into manageable milestones');
            suggestions.push('Define rollback strategy');
            suggestions.push('Allocate time buffer for unknowns');
            break;
        case 'implementation':
            const iterationsLeft = session.constraints.maxIterations - session.implementationIteration;
            suggestions.push(`Iteration ${session.implementationIteration} of ${session.constraints.maxIterations} (${iterationsLeft} remaining)`);
            if (iterationsLeft === 1) {
                suggestions.push('⚠️ Last iteration - ensure core requirements are met');
            }
            if (iterationsLeft === 0) {
                suggestions.push('🛑 Iteration limit reached - move to validation or abort');
            }
            break;
        case 'validation':
            suggestions.push('Run comprehensive test suite');
            suggestions.push('Verify against original requirements');
            suggestions.push('Check for regression issues');
            break;
        case 'ship_or_abort':
            if (session.metrics.confidence >= session.constraints.minConfidence) {
                suggestions.push('✅ Confidence threshold met - consider shipping');
            }
            else {
                suggestions.push('❌ Confidence below threshold - consider abort or pivot');
            }
            break;
    }
    // Time-based suggestions
    const timeLeftMinutes = Math.round(session.metrics.timeRemainingMs / 1000 / 60);
    if (timeLeftMinutes < 30) {
        suggestions.push(`⏰ Only ${timeLeftMinutes} minutes remaining - prioritize critical items`);
    }
    return suggestions;
}
/**
 * Makes final ship/abort decision
 */
export function makeFinalDecision(session, rationale) {
    const decision = session.metrics.confidence >= session.constraints.minConfidence ? 'ship' :
        session.metrics.iterations > session.constraints.maxIterations ? 'abort' :
            'pivot';
    return {
        decision,
        rationale,
        timestamp: new Date().toISOString()
    };
}
/**
 * Exports Ulysses session to markdown format
 */
export function exportToMarkdown(session) {
    const lines = [
        '# Ulysses Protocol Session',
        '',
        `**Session ID:** ${session.sessionId}`,
        `**Current Phase:** ${session.currentPhase}`,
        `**Time Elapsed:** ${Math.round(session.metrics.timeElapsedMs / 1000 / 60)} minutes`,
        `**Time Remaining:** ${Math.round(session.metrics.timeRemainingMs / 1000 / 60)} minutes`,
        '',
        '## Metrics',
        `- Confidence: ${(session.metrics.confidence * 100).toFixed(1)}% (target: ${(session.constraints.minConfidence * 100).toFixed(0)}%)`,
        `- Iterations: ${session.metrics.iterations} / ${session.constraints.maxIterations}`,
        `- Scope Drift: ${session.metrics.scopeDrift.toFixed(1)} (max: ${session.constraints.maxScopeDrift})`,
        `- Gates Passed: ${session.metrics.gatesPassed} / ${session.gates.length}`,
        `- Escalations: ${session.metrics.escalations}`,
        '',
        '## Gates Status'
    ];
    for (const gate of session.gates) {
        const statusIcon = gate.status === 'passed' ? '✅' :
            gate.status === 'failed' ? '❌' :
                gate.status === 'open' ? '🔓' : '🔒';
        lines.push(`\n### ${statusIcon} ${gate.title}`);
        lines.push(`Status: ${gate.status}`);
        if (gate.status === 'open' || gate.status === 'passed') {
            lines.push('\n**Entry Criteria:**');
            gate.entryCriteria.forEach(c => lines.push(`- [${gate.entryMet ? 'x' : ' '}] ${c.replace('_', ' ')}`));
            lines.push('\n**Exit Criteria:**');
            gate.exitCriteria.forEach(c => lines.push(`- [${gate.exitMet ? 'x' : ' '}] ${c.replace('_', ' ')}`));
        }
        if (gate.notes) {
            lines.push(`\nNotes: ${gate.notes}`);
        }
    }
    // Add phase history
    lines.push('\n## Phase History');
    let currentPhase = null;
    for (const node of session.nodes) {
        if (node.phase !== currentPhase) {
            currentPhase = node.phase;
            lines.push(`\n### ${currentPhase.replace('_', ' ').toUpperCase()}`);
        }
        lines.push(`\n**[${node.timestamp}] Confidence: ${(node.confidence * 100).toFixed(0)}%**`);
        if (node.iteration) {
            lines.push(`Iteration ${node.iteration}`);
        }
        lines.push(node.content);
        if (node.evidence && node.evidence.length > 0) {
            lines.push('\nEvidence:');
            node.evidence.forEach(e => lines.push(`- ${e}`));
        }
        if (node.scopeChange) {
            lines.push(`\n⚠️ Scope Change (${node.scopeChange.impact}): ${node.scopeChange.description}`);
            lines.push(`Approved: ${node.scopeChange.approved ? 'Yes' : 'No'}`);
        }
        if (node.escalated) {
            lines.push(`\n🚨 ESCALATION: ${node.escalated.action}`);
            lines.push(`Reason: ${node.escalated.reason}`);
        }
    }
    // Add final decision if made
    if (session.finalDecision) {
        lines.push('\n## Final Decision');
        lines.push(`**Decision:** ${session.finalDecision.decision.toUpperCase()}`);
        lines.push(`**Rationale:** ${session.finalDecision.rationale}`);
        lines.push(`**Timestamp:** ${session.finalDecision.timestamp}`);
    }
    return lines.join('\n');
}
