/**
 * Server.ts - HTTP Server Entry Point
 *
 * Uses the unified server for HTTP deployments
 */
import { ClearThoughtUnifiedServer } from './unified-server.js';
// Get port from environment or use default
const PORT = parseInt(process.env.PORT || '3000');
// Create and start the unified server in HTTP mode
const server = new ClearThoughtUnifiedServer({
    transport: 'http',
    port: PORT
});
// Start the server
server.start().then(() => {
    console.log(`Clear Thought MCP server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
//# sourceMappingURL=server.js.map