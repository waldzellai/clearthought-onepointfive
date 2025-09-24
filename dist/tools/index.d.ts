/**
 * Tool Index - All tools self-register on import
 * This file serves as the central import point for tool registration
 */
export { ToolRegistry } from '../registry/tool-registry.js';
export declare function loadAllTools(): Promise<void>;
export declare function getToolStats(): {
    total: any;
    byCategory: any;
    names: any;
};
//# sourceMappingURL=index.d.ts.map