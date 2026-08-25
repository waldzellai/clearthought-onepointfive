/**
 * Stdio process-lifecycle regression tests.
 *
 * Regression case: when the MCP client disconnects it closes the server
 * process's stdin. No signal is delivered, so the server must exit on its own.
 * Previously the server lingered forever (reparented to init) because the MCP
 * SDK's StdioServerTransport (1.17.x) does not listen for stdin end/close and
 * module-level notebook cleanup intervals keep the event loop alive.
 *
 * These tests spawn the REAL built entrypoint (dist/cli/stdio-server.js), so a
 * build (`npm run build:stdio`) must exist before running them.
 */

import { type ChildProcess, execFile, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

const here = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = path.resolve(here, "..", "dist", "cli", "stdio-server.js");
const READY_MARKER = "Ready to receive commands...";

/** Bounded waits; on expiry the child is force-killed so nothing leaks. */
const START_TIMEOUT_MS = 15_000;
const EXIT_TIMEOUT_MS = 5_000;
const TEST_TIMEOUT_MS = START_TIMEOUT_MS + 2 * EXIT_TIMEOUT_MS + 10_000;

interface SpawnedServer {
	child: ChildProcess;
	waitForReady: () => Promise<void>;
	waitForExit: () => Promise<number | null>;
}

function spawnServer(): SpawnedServer {
	expect(
		fs.existsSync(SERVER_PATH),
		`missing build output: ${SERVER_PATH}`,
	).toBe(true);

	const child = spawn(process.execPath, [SERVER_PATH], {
		stdio: ["pipe", "ignore", "pipe"],
	});

	const exited = new Promise<number | null>((resolve) => {
		child.once("exit", (code) => resolve(code));
	});

	function waitForReady(): Promise<void> {
		return new Promise((resolve, reject) => {
			let stderr = "";
			const timer = setTimeout(() => {
				cleanup();
				child.kill("SIGKILL");
				reject(
					new Error(`server did not become ready within ${START_TIMEOUT_MS}ms`),
				);
			}, START_TIMEOUT_MS);
			function onData(chunk: Buffer) {
				stderr += chunk.toString();
				if (stderr.includes(READY_MARKER)) {
					cleanup();
					resolve();
				}
			}
			function onError(error: Error) {
				cleanup();
				reject(error);
			}
			function onEarlyExit() {
				cleanup();
				reject(new Error("server exited before becoming ready"));
			}
			function cleanup() {
				clearTimeout(timer);
				child.stderr?.off("data", onData);
				child.off("error", onError);
				child.off("exit", onEarlyExit);
			}
			child.stderr?.on("data", onData);
			child.on("error", onError);
			child.once("exit", onEarlyExit);
		});
	}

	async function waitForExit(): Promise<number | null> {
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			// Fail-and-cleanup: make sure the child cannot outlive the test.
			child.kill("SIGKILL");
		}, EXIT_TIMEOUT_MS);
		try {
			const code = await exited;
			if (timedOut) {
				throw new Error(
					`server did not exit within ${EXIT_TIMEOUT_MS}ms; killed`,
				);
			}
			return code;
		} finally {
			clearTimeout(timer);
		}
	}

	return { child, waitForReady, waitForExit };
}

/**
 * Assert that no server process (or descendant of one) survived the test:
 * scan the process table for any live entry still pointing at SERVER_PATH.
 */
async function expectNoOrphanedServerProcesses(): Promise<void> {
	const { stdout } = await execFileAsync("ps", ["-eo", "pid=,ppid=,args="]);
	const leftovers = stdout
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		// Exclude this vitest worker itself (its argv contains the test path,
		// not SERVER_PATH); match only actual spawned server command lines.
		.filter((line) =>
			line.split(/\s+/).slice(2).join(" ").includes(SERVER_PATH),
		);
	expect(
		leftovers,
		`orphaned server processes remain:\n${leftovers.join("\n")}`,
	).toEqual([]);
}

describe("stdio server lifecycle", () => {
	it(
		"exits with code 0 when the client closes stdin without sending any signal",
		async () => {
			const { child, waitForReady, waitForExit } = spawnServer();
			try {
				await waitForReady();
				// Simulate client disconnect: close stdin only. No signal is sent.
				child.stdin?.end();
				const code = await waitForExit();
				expect(code).toBe(0);
			} finally {
				if (child.exitCode === null && child.signalCode === null) {
					child.kill("SIGKILL");
				}
			}
			await expectNoOrphanedServerProcesses();
		},
		TEST_TIMEOUT_MS,
	);

	it(
		"still exits with code 0 when SIGTERM is received",
		async () => {
			const { child, waitForReady, waitForExit } = spawnServer();
			try {
				await waitForReady();
				child.kill("SIGTERM");
				const code = await waitForExit();
				expect(code).toBe(0);
			} finally {
				if (child.exitCode === null && child.signalCode === null) {
					child.kill("SIGKILL");
				}
			}
			await expectNoOrphanedServerProcesses();
		},
		TEST_TIMEOUT_MS,
	);

	it(
		"still exits with code 0 when SIGINT is received",
		async () => {
			const { child, waitForReady, waitForExit } = spawnServer();
			try {
				await waitForReady();
				child.kill("SIGINT");
				const code = await waitForExit();
				expect(code).toBe(0);
			} finally {
				if (child.exitCode === null && child.signalCode === null) {
					child.kill("SIGKILL");
				}
			}
			await expectNoOrphanedServerProcesses();
		},
		TEST_TIMEOUT_MS,
	);
});
