import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CodeExecutionResult } from '../types/index.js';

export async function executePython(code: string, pythonCommand: string, timeoutMs: number): Promise<CodeExecutionResult> {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ct-python-'));
  const scriptPath = path.join(tempDir, 'snippet.py');
  await fs.promises.writeFile(scriptPath, code, 'utf-8');

  return new Promise<CodeExecutionResult>((resolve) => {
    const start = Date.now();
    const child = spawn(pythonCommand, [scriptPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch {}
    }, Math.max(1000, timeoutMs));

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdout.on('data', (chunk: string) => { stdout += chunk; });
    child.stderr.on('data', (chunk: string) => { stderr += chunk; });

    child.on('close', async (code) => {
      clearTimeout(timer);
      try { await fs.promises.rm(tempDir, { recursive: true, force: true }); } catch {}
      resolve({
        language: 'python',
        stdout,
        stderr,
        exitCode: code ?? -1,
        durationMs: Date.now() - start
      });
    });

    child.on('error', async () => {
      clearTimeout(timer);
      try { await fs.promises.rm(tempDir, { recursive: true, force: true }); } catch {}
      resolve({
        language: 'python',
        stdout: '',
        stderr: 'Failed to start Python process',
        exitCode: -1,
        durationMs: Date.now() - start
      });
    });
  });
}