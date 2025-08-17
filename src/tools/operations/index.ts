/**
 * Central exports and registration for all operations
 */

import { operationRegistry } from './registry.js';

// Core operations
import sequentialThinking from './core/sequential-thinking.js';
import mentalModel from './core/mental-model.js';
import debuggingApproach from './core/debugging-approach.js';
import creativeThinking from './core/creative-thinking.js';
import visualReasoning from './core/visual-reasoning.js';
import metacognitiveMonitoring from './core/metacognitive-monitoring.js';
import scientificMethod from './core/scientific-method.js';

// Session operations
import sessionInfo from './session/session-info.js';
import sessionExport from './session/session-export.js';
import sessionImport from './session/session-import.js';

// Collaborative operations
import systemsThinking from './collaborative/systems-thinking.js';
import collaborativeReasoning from './collaborative/collaborative-reasoning.js';
import decisionFramework from './collaborative/decision-framework.js';
import socraticMethod from './collaborative/socratic-method.js';
import structuredArgumentation from './collaborative/structured-argumentation.js';

// Analysis operations
import research from './analysis/research.js';
import analogicalReasoning from './analysis/analogical-reasoning.js';
import causalAnalysis from './analysis/causal-analysis.js';
import statisticalReasoning from './analysis/statistical-reasoning.js';
import simulation from './analysis/simulation.js';
import optimization from './analysis/optimization.js';
import ethicalAnalysis from './analysis/ethical-analysis.js';

// Pattern operations
import treeOfThought from './patterns/tree-of-thought.js';
import beamSearch from './patterns/beam-search.js';
import mcts from './patterns/mcts.js';
import graphOfThought from './patterns/graph-of-thought.js';
import orchestrationSuggest from './patterns/orchestration-suggest.js';

// UI Operations
import visualDashboard from './ui/visual-dashboard.js';
import customFramework from './ui/custom-framework.js';

// Notebook Operations
import notebookCreate from './notebook/notebook-create.js';
import notebookAddCell from './notebook/notebook-add-cell.js';
import notebookRunCell from './notebook/notebook-run-cell.js';
import notebookExport from './notebook/notebook-export.js';

// Metagame Operations
import { OODALoopOperation } from './metagame/ooda-loop.js';
import { UlyssesProtocolOperation } from './metagame/ulysses-protocol.js';

// Special Operations
import { PDRReasoningOperation } from './special/pdr-reasoning.js';
import { CodeExecutionOperation } from './special/code-execution.js';
import { OrchestrationSuggestOperation } from './special/orchestration-suggest.js';

// Register all operations
function registerAllOperations(): void {
  // Core operations
  operationRegistry.register(sequentialThinking);
  operationRegistry.register(mentalModel);
  operationRegistry.register(debuggingApproach);
  operationRegistry.register(creativeThinking);
  operationRegistry.register(visualReasoning);
  operationRegistry.register(metacognitiveMonitoring);
  operationRegistry.register(scientificMethod);
  
  // Session operations
  operationRegistry.register(sessionInfo);
  operationRegistry.register(sessionExport);
  operationRegistry.register(sessionImport);
  
  // Collaborative operations
  operationRegistry.register(systemsThinking);
  operationRegistry.register(collaborativeReasoning);
  operationRegistry.register(decisionFramework);
  operationRegistry.register(socraticMethod);
  operationRegistry.register(structuredArgumentation);
  
  // Analysis operations
  operationRegistry.register(research);
  operationRegistry.register(analogicalReasoning);
  operationRegistry.register(causalAnalysis);
  operationRegistry.register(statisticalReasoning);
  operationRegistry.register(simulation);
  operationRegistry.register(optimization);
  operationRegistry.register(ethicalAnalysis);
  
  // Pattern operations
  operationRegistry.register(treeOfThought);
  operationRegistry.register(beamSearch);
  operationRegistry.register(mcts);
  operationRegistry.register(graphOfThought);
  operationRegistry.register(orchestrationSuggest);
  
  // UI Operations
  operationRegistry.register(visualDashboard);
  operationRegistry.register(customFramework);
  
  // Notebook Operations
  operationRegistry.register(notebookCreate);
  operationRegistry.register(notebookAddCell);
  operationRegistry.register(notebookRunCell);
  operationRegistry.register(notebookExport);
  
  // Metagame Operations
  operationRegistry.register(new OODALoopOperation());
  operationRegistry.register(new UlyssesProtocolOperation());
  
  // Special Operations
  operationRegistry.register(new PDRReasoningOperation());
  operationRegistry.register(new CodeExecutionOperation());
  operationRegistry.register(new OrchestrationSuggestOperation());
}

// Auto-register on import
registerAllOperations();

// Export registry and utilities
export { operationRegistry };
export { BaseOperation, type Operation, type OperationContext, type OperationResult } from './base.js';

/**
 * Execute an operation by name
 */
export async function executeOperation(
  name: string,
  context: import('./base.js').OperationContext
): Promise<import('./base.js').OperationResult> {
  const operation = operationRegistry.get(name);
  
  if (!operation) {
    return {
      toolOperation: 'unknown',
      error: `Unknown operation: ${name}`,
      availableOperations: operationRegistry.getNames(),
    };
  }
  
  return await operation.execute(context);
}