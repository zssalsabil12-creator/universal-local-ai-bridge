import * as readline from 'readline';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const DEFAULT_PORT = 19999;

function readFlag(argv: string[], names: string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    if (names.includes(argv[i]) && argv[i + 1]) return argv[++i];
  }
  return undefined;
}

function resolveToken(): string | undefined {
  const argv = process.argv.slice(2);
  const explicit = readFlag(argv, ['--token'])?.trim() || process.env.ULAB_TOKEN?.trim();
  if (explicit) return explicit;
  const dataDir = process.env.LOCALAPPDATA || path.join(os.homedir(), '.ulab');
  const tokenPath = path.join(dataDir, 'ULAB', 'agent.token');
  try {
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

async function callDesktopMcp(port: number, token: string, request: unknown): Promise<unknown> {
  const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': typeof (request as any)?.method === 'string' ? (request as any).method : 'unknown',
      'mcp-name': (request as any)?.params?.name || (request as any)?.method || 'unknown',
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(0x7fffffff),
  });
  const body = await response.text();
  if (!body) return null;
  try { return JSON.parse(body); }
  catch { throw new Error(`ULAB Desktop returned invalid MCP response (HTTP ${response.status})`); }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const port = Number(readFlag(argv, ['--port']) || process.env.ULAB_PORT || DEFAULT_PORT);
  const requestedWorkspace = readFlag(argv, ['--workspace', '-w']);
  const token = resolveToken();
  if (!token) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'ULAB Desktop token is unavailable; start ULAB Desktop first.' } }) + '\n');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  const writeResponse = (response: unknown) => {
    process.stdout.write(JSON.stringify(response) + '\n');
  };

  for await (const line of rl) {
    const raw = String(line || '').trim();
    if (!raw) continue;
    try {
      const request: any = JSON.parse(raw);
      if (requestedWorkspace && request?.method === 'tools/call' && request?.params?.name === 'workspace_session') {
        // Let the desktop Agent remain the sole workspace authority; the CLI path is metadata only.
      }
      const response = await callDesktopMcp(port, token, request);
      if (response !== null) writeResponse(response);
    } catch (error: any) {
      writeResponse({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: error?.message || 'ULAB stdio MCP proxy error' },
      });
    }
  }
  rl.close();
}

void main();
