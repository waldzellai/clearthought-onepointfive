import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const SESSION_INFO_TOOL: Tool = {
  name: 'session_info',
  description: 'Get information about the current session including statistics and recent activity',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

export const SESSION_EXPORT_TOOL: Tool = {
  name: 'session_export',
  description: 'Export the entire session state for backup or sharing',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['json', 'summary'],
        description: 'Export format (default: json)'
      }
    }
  }
};

export const SESSION_IMPORT_TOOL: Tool = {
  name: 'session_import',
  description: 'Import a previously exported session state',
  inputSchema: {
    type: 'object',
    properties: {
      sessionData: {
        type: 'string',
        description: 'JSON string of exported session data'
      },
      merge: {
        type: 'boolean',
        description: 'Whether to merge with existing session data (default: false)'
      }
    },
    required: ['sessionData']
  }
};