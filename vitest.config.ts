import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"node_modules/",
				"dist/",
				"tests/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/*.test.ts",
				"**/*.spec.ts",
				"**/mockData.ts",
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 75,
				statements: 80,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		extensions: [".ts", ".js"],
	},
});
