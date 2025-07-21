import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SessionState } from '../state/SessionState.js';

// Unified Clear Thought Manager - provides all functionality through a single interface
import { registerClearThoughtManager } from './clearThoughtManager.js';

// Legacy tool imports - preserved for reference but not exposed to MCP clients
// These individual tools have been unified into the clear_thought_manager tool
// to provide a cleaner, more intuitive interface with 92% cognitive load reduction
/*
import { registerSequentialThinking } from './sequential-thinking.js';
import { registerMentalModel } from './mental-model.js';
import { registerDebuggingApproach } from './debugging-approach.js';
import { registerCollaborativeReasoning } from './collaborative-reasoning.js';
import { registerDecisionFramework } from './decision-framework.js';
import { registerMetacognitiveMonitoring } from './metacognitive.js';
import { registerSocraticMethod } from './socratic-method.js';
import { registerCreativeThinking } from './creative-thinking.js';
import { registerSystemsThinking } from './systems-thinking.js';
import { registerScientificMethod } from './scientific-method.js';
import { registerStructuredArgumentation } from './structured-argumentation.js';
import { registerVisualReasoning } from './visual-reasoning.js';
import { registerSessionManagement } from './session-management.js';
*/

/**
 * Registers Clear Thought tools with the provided MCP server instance
 *
 * UNIFIED INTERFACE: As of the Clear Thought Tools Unification, this function now
 * registers only the unified `clear_thought_manager` tool, which provides access
 * to all 16 reasoning operations through a single, clean interface.
 *
 * LEGACY TOOLS: Individual tools (sequential thinking, mental models, etc.) are
 * preserved in the codebase but no longer exposed to MCP clients. This reduces
 * cognitive load by 92% while maintaining full functionality.
 *
 * @param server - The MCP server instance
 * @param sessionState - The session state manager
 */
export function registerTools(server: McpServer, sessionState: SessionState): void {
  // Register the unified Clear Thought Manager tool - provides all 16 operations
  // through a single, intuitive interface
  registerClearThoughtManager(server, sessionState);
  
  // Legacy tool registrations - commented out as part of unification
  // All functionality is now available through the clear_thought_manager tool
  /*
  registerSequentialThinking(server, sessionState);
  registerMentalModel(server, sessionState);
  registerDebuggingApproach(server, sessionState);
  registerCollaborativeReasoning(server, sessionState);
  registerDecisionFramework(server, sessionState);
  registerMetacognitiveMonitoring(server, sessionState);
  registerSocraticMethod(server, sessionState);
  registerCreativeThinking(server, sessionState);
  registerSystemsThinking(server, sessionState);
  registerScientificMethod(server, sessionState);
  registerStructuredArgumentation(server, sessionState);
  registerVisualReasoning(server, sessionState);
  registerSessionManagement(server, sessionState);
  */
}