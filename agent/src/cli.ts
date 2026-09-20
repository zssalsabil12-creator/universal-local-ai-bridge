#!/usr/bin/env node
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import { LocalAgentServer } from './LocalAgentServer';

const argv = process.argv.slice(2);
const readFlag = (names: string[]): string | undefined => {
  for (let i = 0; i < argv.length; i++) {
    if (names.includes(argv[i]) && argv[i + 1]) return argv[++i];
  }
  return undefined;
};

async function main(): Promise<void> {
  const command = argv[0] || 'connect';
  if (!['connect', 'start'].includes(command)) {
    console.error(`Unknown command: ${command}`);
    console.error('Usage: npx ulab connect [--workspace <path>] [--port 19999] [--token <token>]');
    process.exitCode = 1;
    return;
  }

  const port = Number(readFlag(['--port'])) || 19999;
  const workspaceArg = readFlag(['--workspace', '-w']);
  let token = readFlag(['--token'])?.trim() || process.env.ULAB_TOKEN?.trim();
  const dataDir = process.env.LOCALAPPDATA || path.join(os.homedir(), '.ulab');
  const tokenPath = path.join(dataDir, 'ULAB', 'agent.token');

  if (!token) {
    try {
      token = fs.readFileSync(tokenPath, 'utf8').trim() || undefined;
    } catch {
      token = undefined;
    }
  }
  if (!token) {
    token = crypto.randomBytes(16).toString('hex');
    try {
      fs.mkdirSync(path.dirname(tokenPath), { recursive: true });
      fs.writeFileSync(tokenPath, token, { encoding: 'utf8', mode: 0o600 });
    } catch {
      // The token is still valid for this process if persistent storage is unavailable.
    }
  }

  const workspace = workspaceArg ? path.resolve(workspaceArg) : undefined;
  const server = new LocalAgentServer({ port, token, initialWorkspaceRoot: workspace });
  await server.start();

  console.log('ULAB Local Agent connected and listening on localhost.');
  console.log(`WebSocket: ws://127.0.0.1:${port}`);
  console.log(`Security token: ${server.getToken()}`);
  console.log(workspace ? `Workspace: ${workspace}` : 'Workspace: waiting for selection from ULAB / extension');
  console.log('Keep this terminal open while using the ULAB bridge.');
  console.log('Press Ctrl+C to stop.');

  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
