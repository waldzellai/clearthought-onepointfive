import { createStatefulServer } from '@smithery/sdk/server/stateful.js';
import createClearThoughtServer from './index.js';
import { ServerConfigSchema } from './config.js';
// Create the Express app with stateful server
const { app } = createStatefulServer(createClearThoughtServer, {
    schema: ServerConfigSchema
});
// Add health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'clear-thought-mcp',
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Get port from environment or use default
const PORT = process.env.PORT || 3000;
// Start the server
const server = app.listen(PORT, () => {
    console.log(`Clear Thought MCP server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
});
// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});
//# sourceMappingURL=server.js.map