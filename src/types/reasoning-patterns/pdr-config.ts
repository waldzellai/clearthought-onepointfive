/**
 * PDR Configuration and Result Types
 */

/**
 * Configuration for PDR execution
 */
export interface PDRConfig {
  prompt: string;
  maxPasses?: number;
  confidenceThreshold?: number;
  timeoutSeconds?: number;
  mode?: 'sequential' | 'parallel' | 'adaptive';
}

/**
 * Result from PDR execution
 */
export interface PDRResult {
  sessionId: string;
  passNumber: number;
  passName: string;
  timestamp: number;
  confidence: number;
  insights: string[];
  nextSteps: string[];
  metrics: {
    nodesAnalyzed: number;
    clustersFound: number;
    gapsIdentified: number;
  };
}