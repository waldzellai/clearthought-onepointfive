# Clear Thought Operations Guide

This server exposes a single tool `clear_thought` with many operations. Each call accepts:

- operation: string (see list below)
- prompt: string (task/problem)
- sessionId: string (optional)
- parameters: object (operation-specific)
- advanced: object (optional)

## Operations

- sequential_thinking: Chain-of-thought. Optional `parameters.pattern` ('chain'|'tree'|'beam'|'mcts'|'graph'|'auto') and `parameters.patternParams` (pattern-specific settings).
- mental_model: Apply a mental model. Params: model, steps, reasoning, conclusion.
- debugging_approach: Structured debugging. Params: approach, steps, findings, resolution.
- creative_thinking: Idea generation. Params: ideas, techniques, connections, insights, iteration, nextIdeaNeeded.
- visual_reasoning: Diagram ops. Params: diagramId, diagramType, iteration, nextOperationNeeded.
- metacognitive_monitoring: Monitor reasoning. Params: stage, overallConfidence, uncertaintyAreas, recommendedApproach, iteration, nextAssessmentNeeded.
- scientific_method: Inquiry workflow. Params: stage, iteration, nextStageNeeded.
- collaborative_reasoning: Multi-persona. Params: personas, contributions, stage, activePersonaId, iteration, nextContributionNeeded.
- decision_framework: Options/criteria/outcomes. Params: options, criteria, stakeholders, constraints, analysisType, stage, iteration, nextStageNeeded.
- socratic_method: Question-driven argumentation. Params: claim, premises, conclusion, argumentType, confidence, stage, iteration, nextArgumentNeeded.
- structured_argumentation: Formal arguments. Params: premises, conclusion, argumentType, confidence, respondsTo, supports, contradicts, strengths, weaknesses, relevance, iteration, nextArgumentNeeded.
- systems_thinking: System mapping. Params: components, relationships, feedbackLoops, emergentProperties, leveragePoints, iteration, nextAnalysisNeeded.
- research: Findings/citations placeholder. Params: none defined.
- analogical_reasoning: Map domains. Params: sourceDomain, targetDomain, mappings, inferredInsights.
- causal_analysis: Causal graphs and interventions. Params: graph, intervention, predictedEffects, counterfactual, notes.
- statistical_reasoning: Modes: summary|bayes|hypothesis_test|monte_carlo. Params vary by mode.
- simulation: Simple simulation. Params: steps.
- optimization: Simple optimization. Params: none defined.
- ethical_analysis: Evaluate with a framework. Params: framework, score?.
- visual_dashboard: Dashboard skeleton. Params: panels, layout, refreshRate.
- custom_framework: Define custom stages/rules/metrics. Params: stages, rules, metrics.
- code_execution: Restricted; Python only when enabled. Params: language, code.
- tree_of_thought | beam_search | mcts | graph_of_thought: Pattern-specific structures. Params are pattern-specific.
- orchestration_suggest: Suggests tool combinations and performs a brief `sequential_thinking` seed step to decompose the task (1–3 thoughts). Params: none defined.

## Pattern selection in sequential_thinking

- Set `parameters.pattern` to force a pattern or 'auto' to let the server select based on the prompt and `patternParams`.
- `patternParams` may include: depth, breadth (tree); beamWidth (beam); simulations (mcts); nodes/edges (graph).

## Responses

Each operation returns a JSON object with `toolOperation` and operation-specific fields. Some include `sessionContext`.

## Notes

- Input schema is exposed via JSON Schema; see tools/list.
- This guide is provided via MCP resource `guide://clear-thought-operations`.
