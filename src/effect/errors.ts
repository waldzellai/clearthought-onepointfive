/**
 * Effect-TS Error Types for PDR Knowledge Graph
 * Domain-specific errors with proper typing
 */

import { Data } from 'effect';

/**
 * Graph capacity exceeded error
 */
export class GraphCapacityError extends Data.TaggedError('GraphCapacityError')<{
  readonly currentSize: number;
  readonly maxSize: number;
  readonly operation: string;
  readonly suggestion?: string;
}> {}

/**
 * Graph integrity violation error
 */
export class GraphIntegrityError extends Data.TaggedError('GraphIntegrityError')<{
  readonly nodeId?: string;
  readonly edgeId?: string;
  readonly reason: string;
  readonly violation: 'orphan-edge' | 'circular-parent' | 'invalid-depth' | 'duplicate-id';
}> {}

/**
 * Graph algorithm execution error
 */
export class GraphAlgorithmError extends Data.TaggedError('GraphAlgorithmError')<{
  readonly algorithm: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * PDR pass execution error
 */
export class PDRPassError extends Data.TaggedError('PDRPassError')<{
  readonly passName: string;
  readonly passNumber: number;
  readonly reason: string;
  readonly partialResult?: unknown;
}> {}

/**
 * Resource limit error
 */
export class ResourceLimitError extends Data.TaggedError('ResourceLimitError')<{
  readonly resource: 'memory' | 'time' | 'depth' | 'iterations';
  readonly current: number;
  readonly limit: number;
  readonly context?: string;
}> {}

/**
 * Session state error
 */
export class SessionStateError extends Data.TaggedError('SessionStateError')<{
  readonly sessionId: string;
  readonly operation: string;
  readonly reason: string;
}> {}

/**
 * Union type of all PDR errors
 */
export type PDRError = 
  | GraphCapacityError
  | GraphIntegrityError
  | GraphAlgorithmError
  | PDRPassError
  | ResourceLimitError
  | SessionStateError;