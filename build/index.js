#!/usr/bin/env node
// Import and run the server for direct execution
import { ClearThoughtMCPServer } from "./src/smithery-entry.js";
// Main execution
async function main() {
    const server = new ClearThoughtMCPServer();
    await server.start(parseInt(process.env.PORT || "3000", 10));
}
// Always run the server when index.ts is executed
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map