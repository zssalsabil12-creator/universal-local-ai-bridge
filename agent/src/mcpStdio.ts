#!/usr/bin/env node
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import { LocalAgentServer } from './LocalAgentServer';
import { ULABMCPServer } from './MCPServer';

function readFlag(argv: string[], names: string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    if (names.includes(argv[i]) && argv[i + 1]) return argv[++i];
  }
  return undefined;
}

function resolveToken(): string {
  const argv = process.argv.slice(2);
  const explicit = readFlag(argv, ['--token'])?.trim() || process.env.ULAB_TOKEN?.trim();
  if (explicit) return explicit;

  const dataDir = process.env.LOCALAPPDATA || path.join(os.homedir(), '.ulab');
  const tokenPath = path.join(dataDir, 'ULAB', 'agent.token');
  try {
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    if (token) return token;
  } catch {}

  return crypto.randomBytes(16).toString('hex');
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const workspaceArg = readFlag(argv, ['--workspace', '-w']);
  const token = resolveToken();
  const agent = new LocalAgentServer({
    port: 0,
    token,
    initialWorkspaceRoot: workspaceArg ? path.resolve(workspaceArg) : undefined,
  });
  const mcp = new ULABMCPServer(agent);
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

  const writeResponse = (response: unknown) => {
    process.stdout.write(JSON.stringify(response) + '\n');
  };

  for await (const line of rl) {
    const raw = String(line || '').trim();
    if (!raw) continue;
    try {
      const request = JSON.parse(raw);
      const response = await mcp.handleMessage(request, token, 'mcp-stdio');
      if (response !== null) writeResponse(response);
    } catch (error: any) {
      writeResponse({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: error?.message || 'MCP internal error' },
      });
    }
  }
  rl.close();
}

void main();
