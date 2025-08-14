/**
 * Notebook Enhancement for Tool Responses
 * 
 * Provides utilities to embed notebook resources in tool responses
 * for enhanced learning and code execution capabilities.
 */

import { cellToEmbeddedResource } from '../utils/srcbookParser.js';
import fs from 'fs';
import path from 'path';

interface NotebookContext {
  operation: string;
  prompt: string;
  notebooksDir: string;
}

/**
 * Find relevant notebook for the current operation
 */
export function findRelevantNotebook(context: NotebookContext): string | null {
  const { operation, prompt } = context;
  
  // Map operations to relevant notebooks
  const notebookMappings: Record<string, string[]> = {
    'code_execution': ['effect-mcp-notebook', 'getting-started'],
    'sequential_thinking': ['effect-mcp-notebook'],
    'learning': ['getting-started', 'effect-mcp-notebook'],
    'custom_framework': ['effect-mcp-notebook'],
    'research': ['langgraph-web-agent'],
    'visual_reasoning': ['intro-to-websockets'],
    'systems_thinking': ['interoperability']
  };
  
  // Check if operation has mapped notebooks
  const candidates = notebookMappings[operation] || [];
  
  // Also check for keyword matches in prompt
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('effect') || promptLower.includes('typed error')) {
    candidates.push('effect-mcp-notebook');
  }
  if (promptLower.includes('websocket') || promptLower.includes('realtime')) {
    candidates.push('intro-to-websockets');
  }
  if (promptLower.includes('json mode') || promptLower.includes('structured output')) {
    candidates.push('how_to_enable_json_mode');
  }
  
  // Return first available notebook
  for (const notebook of candidates) {
    const notebookPath = path.join(context.notebooksDir, `${notebook}.src.md`);
    if (fs.existsSync(notebookPath)) {
      return notebook;
    }
  }
  
  return null;
}

/**
 * Enhance tool response with embedded notebook resources
 */
export function enhanceResponseWithNotebook(
  response: any,
  operation: string,
  prompt: string
): any {
  // Check if we should enhance this response
  const shouldEnhance = [
    'code_execution',
    'sequential_thinking',
    'custom_framework',
    'learning',
    'research'
  ].includes(operation);
  
  if (!shouldEnhance) {
    return response;
  }
  
  const notebooksDir = path.resolve(process.cwd(), '../srcbook-examples');
  const notebookName = findRelevantNotebook({ operation, prompt, notebooksDir });
  
  if (!notebookName) {
    return response;
  }
  
  // Create enhanced response with embedded notebook reference as text
  const notebookInfo = `\n\n📓 **Related Notebook**: ${notebookName}\n` +
    `URI: notebook:///${notebookName}\n` +
    `Instructions: This notebook contains relevant examples. Use mcp__ide__executeCode to run the code cells.\n` +
    `Relevance: ${determineRelevance(operation, notebookName)}`;
  
  const enhancedContent = [
    ...(Array.isArray(response.content) ? response.content : [{ type: 'text', text: response.content }]),
    {
      type: 'text',
      text: notebookInfo
    }
  ];
  
  return {
    ...response,
    content: enhancedContent
  };
}

/**
 * Determine relevance score for notebook
 */
function determineRelevance(operation: string, notebookName: string): number {
  const relevanceMap: Record<string, Record<string, number>> = {
    'code_execution': {
      'effect-mcp-notebook': 0.9,
      'getting-started': 0.7
    },
    'sequential_thinking': {
      'effect-mcp-notebook': 0.8
    },
    'custom_framework': {
      'effect-mcp-notebook': 0.95
    }
  };
  
  return relevanceMap[operation]?.[notebookName] || 0.5;
}

/**
 * Extract specific cell for embedding
 */
export function extractCellForEmbedding(
  notebookPath: string,
  cellIndex: number
): any | null {
  try {
    const contents = fs.readFileSync(notebookPath, 'utf-8');
    const { parseSrcbook } = require('../utils/srcbookParser.js');
    const parsed = parseSrcbook(contents, path.basename(notebookPath));
    
    if (cellIndex < parsed.cells.length) {
      const cell = parsed.cells[cellIndex];
      const notebookName = path.basename(notebookPath).replace('.src.md', '');
      return cellToEmbeddedResource(cell, notebookName, cellIndex);
    }
  } catch (e) {
    console.error('Failed to extract cell:', e);
  }
  
  return null;
}

/**
 * Create a learning path with notebook resources
 */
export function createLearningPath(topic: string): any[] {
  const paths: Record<string, string[]> = {
    'effect-ts': [
      'effect-mcp-notebook#cell-1',  // Introduction
      'effect-mcp-notebook#cell-3',  // Typed errors
      'effect-mcp-notebook#cell-5',  // Resiliency
    ],
    'getting-started': [
      'getting-started#cell-0',  // Title
      'getting-started#cell-2',  // First code
      'getting-started#cell-4',  // Dependencies
    ]
  };
  
  const selectedPath = paths[topic] || paths['getting-started'];
  
  return selectedPath.map((pathItem, index) => {
    const [notebook, cellRef] = pathItem.split('#');
    return {
      type: 'resource',
      resource: {
        uri: `notebook:///${notebook}${cellRef ? '#' + cellRef : ''}`,
        title: `Step ${index + 1}: ${notebook}`,
        mimeType: 'text/markdown',
        annotations: {
          audience: ['assistant'],
          step: index + 1,
          instructions: 'Execute this step before proceeding to the next'
        }
      }
    };
  });
}