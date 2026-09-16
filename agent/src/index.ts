#!/usr/bin/env node

/**
 * Universal Local AI Bridge - Local Agent (V1 MVP)
 * 
 * Secure, Sandboxed, Local-First Agent for Windows/Linux/macOS
 * Enforces: WORKSPACE-FIRST + SANDBOX-FIRST + AI-SECOND
 */

import { LocalAgentServer } from './LocalAgentServer';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';

// Parse CLI flags: --port 19999 --workspace "C:\Projects\MyProject" [--token <token>]
const args = process.argv.slice(2);
let port = 19999;
let initialWorkspace: string | undefined = undefined;
let configuredToken: string | undefined = undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if ((args[i] === '--workspace' || args[i] === '-w') && args[i + 1]) {
    initialWorkspace = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '--token' && args[i + 1]) {
    configuredToken = args[i + 1].trim();
    i++;
  }
}

// Persist one local token per user profile so restarts do not require reconfiguration.
// Explicit --token and ULAB_TOKEN always take precedence.
const dataDir = process.env.LOCALAPPDATA || path.join(os.homedir(), '.ulab');
const tokenPath = path.join(dataDir, 'ULAB', 'agent.token');
if (!configuredToken) configuredToken = process.env.ULAB_TOKEN?.trim() || undefined;
if (!configuredToken) {
  try {
    configuredToken = fs.readFileSync(tokenPath, 'utf8').trim() || undefined;
  } catch {
    configuredToken = undefined;
  }
}
if (!configuredToken) {
  configuredToken = crypto.randomBytes(16).toString('hex');
  try {
    fs.mkdirSync(path.dirname(tokenPath), { recursive: true });
    fs.writeFileSync(tokenPath, configuredToken, { encoding: 'utf8', mode: 0o600 });
  } catch {
    // The agent remains functional even if token persistence is unavailable.
  }
}

const server = new LocalAgentServer({
  token: configuredToken,
  port,
  initialWorkspaceRoot: initialWorkspace,
});

server.start().then(() => {
  console.log(`=======================================================`);
  console.log(`  ULAB Local Agent V1 - Sandbox Active`);
  console.log(`  Security Principle: WORKSPACE-FIRST + SANDBOX-FIRST`);
  console.log(`  Port: ${port}`);
  console.log(`  Security Token: ${server.getToken()}`);
  if (initialWorkspace) {
    console.log(`  Active Workspace: ${initialWorkspace}`);
  } else {
    console.log(`  Waiting for workspace selection from Web App...`);
  }
  console.log(`=======================================================`);
});

process.on('SIGINT', async () => {
  console.log('\n[ULAB Agent] Shutting down gracefully...');
  await server.stop();
  process.exit(0);
});
