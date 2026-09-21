import * as http from 'http';
import type { LocalAgentServer } from './LocalAgentServer';

const PROTOCOL_MODERN = '2026-07-28';
const PROTOCOL_LEGACY = '2025-11-25';
const ULAB_VERSION = '3.10.7';
const MAX_BODY_BYTES = 1024 * 1024;

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const TOOL_ACTIONS: Record<string, string> = {
  workspace_session: 'workspace.session',
  files_list: 'files.list',
  files_read: 'files.read',
  files_search: 'files.search',
  files_propose: 'files.propose',
  git_status: 'git.status',
  git_diff: 'git.diff',
  context_build: 'context.build',
  audit_log: 'audit.log',
};

const TOOLS: MCPToolDefinition[] = [
  {
    name: 'workspace_session',
    description: 'Get the currently selected ULAB workspace and its session metadata.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'files_list',
    description: 'List files and directories inside the active ULAB workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Workspace-relative path. Defaults to .' },
        recursive: { type: 'boolean', description: 'Whether to include nested entries. Defaults to true.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'files_read',
    description: 'Read a text file from the active workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Workspace-relative file path.' },
      },
      required: ['path'],
      additionalProperties: false,
    },
  },
  {
    name: 'files_search',
    description: 'Search the active workspace for text or file content.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query.' },
        maxResults: { type: 'integer', minimum: 1, maximum: 100, description: 'Maximum result count.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'files_propose',
    description: 'Create a proposed file change inside ULAB. This never writes the file; the user must review and approve it in ULAB.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Workspace-relative target path.' },
        content: { type: 'string', description: 'Complete proposed file content.' },
        reason: { type: 'string', description: 'Why the change is being proposed.' },
      },
      required: ['path', 'content'],
      additionalProperties: false,
    },
  },
  {
    name: 'git_status',
    description: 'Get Git status for the active workspace.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'git_diff',
    description: 'Get the current Git diff for the active workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        staged: { type: 'boolean', description: 'Show staged diff when true.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'context_build',
    description: 'Build a bounded local context package for an AI task.',
    inputSchema: {
      type: 'object',
      properties: {
        taskDescription: { type: 'string', description: 'Task to build context for.' },
        files: { type: 'array', items: { type: 'string' }, description: 'Optional workspace-relative target files.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'audit_log',
    description: 'Read the ULAB audit log for the active local session.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

function jsonrpcError(id: unknown, code: number, message: string, data?: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

function jsonrpcResult(id: unknown, result: unknown, meta?: Record<string, unknown>) {
  return { jsonrpc: '2.0', id, result, ...(meta ? { _meta: meta } : {}) };
}

function contentResult(value: unknown, isError = false) {
  return {
    content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

export class ULABMCPServer {
  private readonly agent: LocalAgentServer;

  constructor(agent: LocalAgentServer) {
    this.agent = agent;
  }

  public getTools(): MCPToolDefinition[] {
    return TOOLS.map(tool => ({ ...tool, inputSchema: { ...tool.inputSchema } }));
  }

  public async handleMessage(message: any, token: string, clientId = 'mcp'): Promise<any> {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      return jsonrpcError(null, -32600, 'Invalid JSON-RPC request');
    }

    const id = Object.prototype.hasOwnProperty.call(message, 'id') ? message.id : null;
    const method = typeof message.method === 'string' ? message.method : '';

    if (message.jsonrpc !== '2.0' || !method) {
      return jsonrpcError(id, -32600, 'Invalid JSON-RPC request');
    }

    if (method === 'server/discover') {
      return jsonrpcResult(id, {
        supportedVersions: [PROTOCOL_MODERN, PROTOCOL_LEGACY],
        capabilities: { tools: { listChanged: false } },
        instructions: 'ULAB exposes workspace-scoped tools. Files are sandboxed to the selected workspace. Use files_propose for changes; direct write, delete, terminal and Git mutation operations remain outside the MCP tool surface.',
      }, {
        'io.modelcontextprotocol/serverInfo': { name: 'ulab-local-agent', version: ULAB_VERSION },
      });
    }

    if (method === 'initialize') {
      return jsonrpcResult(id, {
        protocolVersion: PROTOCOL_LEGACY,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'ulab-local-agent', version: ULAB_VERSION },
        instructions: 'ULAB exposes workspace-scoped tools. Use files_propose for changes; direct writes require the ULAB approval flow.',
      });
    }

    if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
      return null;
    }

    if (method === 'ping') {
      return jsonrpcResult(id, {});
    }

    if (method === 'tools/list') {
      return jsonrpcResult(id, {
        tools: this.getTools(),
        ttlMs: 300000,
        cacheScope: 'global',
      }, {
        'io.modelcontextprotocol/serverInfo': { name: 'ulab-local-agent', version: ULAB_VERSION },
      });
    }

    if (method === 'tools/call') {
      const name = message.params?.name;
      const args = message.params?.arguments;
      if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(TOOL_ACTIONS, name)) {
        return jsonrpcError(id, -32602, 'Unknown or invalid ULAB tool name');
      }
      if (args !== undefined && (!args || typeof args !== 'object' || Array.isArray(args))) {
        return jsonrpcError(id, -32602, 'Tool arguments must be a JSON object');
      }

      const action = TOOL_ACTIONS[name];
      const requestId = 'mcp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
      const result = await this.agent.handleMessage({
        requestId,
        action,
        token,
        params: args || {},
      }, clientId);

      if (result?.success) {
        return jsonrpcResult(id, contentResult({
          action: result.action || action,
          data: result.data,
        }), {
          'io.modelcontextprotocol/serverInfo': { name: 'ulab-local-agent', version: ULAB_VERSION },
        });
      }

      return jsonrpcResult(id, contentResult({
        action: result?.action || action,
        error: result?.error || { code: 'EXECUTION_FAILED', message: 'ULAB tool call failed' },
      }, true), {
        'io.modelcontextprotocol/serverInfo': { name: 'ulab-local-agent', version: ULAB_VERSION },
      });
    }

    return jsonrpcError(id, -32601, 'Method not found');
  }

  private async readBody(req: http.IncomingMessage): Promise<string> {
    return await new Promise((resolve, reject) => {
      let size = 0;
      const chunks: Buffer[] = [];
      let rejected = false;
      req.on('data', chunk => {
        if (rejected) return;
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > MAX_BODY_BYTES) {
          rejected = true;
          reject(new Error('MCP request body exceeds 1 MiB'));
          req.destroy();
          return;
        }
        chunks.push(buffer);
      });
      req.on('end', () => {
        if (!rejected) resolve(Buffer.concat(chunks).toString('utf8'));
      });
      req.on('error', error => {
        if (!rejected) reject(error);
      });
    });
  }

  private isAuthorized(req: http.IncomingMessage, token: string): boolean {
    const auth = String(req.headers.authorization || '');
    const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    const headerToken = String(req.headers['x-ulab-token'] || '').trim();
    return !!token && (bearer === token || headerToken === token);
  }

  private modernHeadersValid(req: http.IncomingMessage, message: any): boolean {
    const version = String(req.headers['mcp-protocol-version'] || '').trim();
    const methodHeader = String(req.headers['mcp-method'] || '').trim();
    const nameHeader = String(req.headers['mcp-name'] || '').trim();
    const metaVersion = String(message?.params?._meta?.['io.modelcontextprotocol/protocolVersion'] || '').trim();
    if (!version) return message.method === 'initialize';
    if (version !== PROTOCOL_MODERN) return false;
    if (!methodHeader || methodHeader !== message.method) return false;
    if (message.method === 'tools/call' && (!nameHeader || nameHeader !== String(message.params?.name || ''))) return false;
    if (metaVersion && metaVersion !== version) return false;
    return true;
  }

  public async handleHttp(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (!this.isAuthorized(req, this.agent.getToken())) {
      res.writeHead(401, { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer' });
      res.end(JSON.stringify({ error: 'MCP authentication required' }));
      return;
    }

    let message: any;
    try {
      message = JSON.parse(await this.readBody(req));
    } catch (error: any) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonrpcError(null, -32700, error?.message || 'Invalid MCP JSON')));
      return;
    }

    if (!this.modernHeadersValid(req, message)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonrpcError(message?.id ?? null, -32020, 'MCP header/body mismatch or unsupported protocol version')));
      return;
    }

    const version = String(req.headers['mcp-protocol-version'] || '').trim() || PROTOCOL_LEGACY;
    const response = await this.handleMessage(message, this.agent.getToken(), 'mcp-http:' + (req.socket.remoteAddress || 'local'));
    if (response === null) {
      res.writeHead(202);
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': version === PROTOCOL_MODERN ? PROTOCOL_MODERN : PROTOCOL_LEGACY,
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(response));
  }
}

export { PROTOCOL_MODERN, PROTOCOL_LEGACY };
