import * as WebSocket from 'ws';
import * as http from 'http';
import * as crypto from 'crypto';
import { WorkspaceManager } from './WorkspaceManager';
import { TerminalSecurityManager } from './TerminalSecurity';
import { GitSecurityManager } from './GitSecurity';
import { ContextBuilder } from './ContextBuilder';
import { WorkspaceSession, StructuredError, AuditLogEntry } from './types';
import { ULABMCPServer } from './MCPServer';

export interface LocalAgentServerConfig {
  port: number;
  token?: string;
  initialWorkspaceRoot?: string;
  rateLimitWindowMs?: number;
  maxRequestsPerWindow?: number;
  onShutdown?: () => void | Promise<void>;
}

interface RateLimitRecord {
  timestamps: number[];
}

export class LocalAgentServer {
  private port: number;
  private token: string;
  private server: http.Server | null = null;
  private wss: WebSocket.Server | null = null;

  private currentSession: WorkspaceSession | null = null;
  private workspaceManager: WorkspaceManager | null = null;
  private terminalManager: TerminalSecurityManager | null = null;
  private gitManager: GitSecurityManager | null = null;
  private contextBuilder: ContextBuilder | null = null;
  private readonly mcpServer: ULABMCPServer;

  // Audit Logs (In-memory, tamper-evident within session)
  private auditLogs: AuditLogEntry[] = [];

  // Rate Limiting (in-memory sliding window)
  private rateLimitWindowMs: number;
  private maxRequestsPerWindow: number;
  private rateLimits: Map<string, RateLimitRecord> = new Map();
  private readonly onShutdown?: () => void | Promise<void>;

  // Allowed Origins for CSWSH / CSRF protection
  private static readonly ALLOWED_ORIGIN_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    '[::1]',
    'null', // File:// or electron origin
  ]);

  constructor(config: LocalAgentServerConfig) {
    this.port = config.port || 19999;
    this.token = config.token || crypto.randomBytes(16).toString('hex');
    this.rateLimitWindowMs = config.rateLimitWindowMs || 10000; // 10 seconds
    this.maxRequestsPerWindow = config.maxRequestsPerWindow || 120; // 120 requests / 10 sec
    this.onShutdown = config.onShutdown;
    this.mcpServer = new ULABMCPServer(this);

    if (config.initialWorkspaceRoot) {
      this.switchWorkspace(config.initialWorkspaceRoot);
    }
  }

  public getToken(): string {
    return this.token;
  }

  public getSession(): WorkspaceSession | null {
    return this.currentSession;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public logAudit(entry: {
    operation: string;
    relativePath: string;
    approval: 'AUTOMATIC' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
    result: 'SUCCESS' | 'DENIED' | 'FAILED';
    detail?: string;
    sessionId?: string;
  }) {
    // Redact any potential credentials, secrets, API keys from detail
    let detail = entry.detail;
    if (detail) {
      detail = detail.replace(/(key|token|secret|password|bearer|auth)[\s=:"]+([^\s,";}]+)/gi, '$1=[REDACTED]');
    }

    const log: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: entry.sessionId || this.currentSession?.sessionId || 'no-session',
      operation: entry.operation,
      relativePath: entry.relativePath,
      approval: entry.approval,
      result: entry.result,
      detail,
    };
    this.auditLogs.push(log);
  }

  public isOriginAllowed(origin?: string): boolean {
    if (!origin || origin === 'null') return true;
    try {
      const parsed = new URL(origin);
      if (LocalAgentServer.ALLOWED_ORIGIN_HOSTS.has(parsed.hostname)) return true;
      return false;
    } catch {
      return false;
    }
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    let record = this.rateLimits.get(clientId);
    if (!record) {
      record = { timestamps: [] };
      this.rateLimits.set(clientId, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => now - ts < this.rateLimitWindowMs);

    if (record.timestamps.length >= this.maxRequestsPerWindow) {
      return false; // Rate limit exceeded
    }

    record.timestamps.push(now);
    return true;
  }

  /**
   * Switch active workspace and invalidate former session
   */
  public switchWorkspace(rootPath: string): WorkspaceSession {
    const root = rootPath;
    const name = root.split(/[\\/]/).filter(Boolean).pop() || 'workspace';

    this.workspaceManager = new WorkspaceManager(root);
    const guard = this.workspaceManager.getGuard();
    this.terminalManager = new TerminalSecurityManager(guard);
    this.gitManager = new GitSecurityManager(guard, this.terminalManager);
    this.contextBuilder = new ContextBuilder(this.workspaceManager);

    const session: WorkspaceSession = {
      workspaceId: `ws-${Date.now()}`,
      workspaceName: name,
      workspaceRoot: root,
      sessionId: `sess-${crypto.randomBytes(8).toString('hex')}`,
      createdAt: Date.now(),
      permissions: {
        read: true,
        write: true,
        execute: true,
        git: true,
        delete: true,
      },
    };

    this.currentSession = session;
    return session;
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        const origin = req.headers.origin;

        // Origin validation
        if (origin && !this.isOriginAllowed(origin)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Origin not allowed' }));
          return;
        }

        // CORS
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-ulab-token, MCP-Protocol-Version, Mcp-Method, Mcp-Name');
        res.setHeader('Access-Control-Expose-Headers', 'MCP-Protocol-Version');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        if (req.url === '/shutdown' && req.method === 'POST') {
          const clientId = req.socket.remoteAddress || '127.0.0.1';
          const provided = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7).trim()
            : String(req.headers['x-ulab-token'] || '').trim();
          if (!this.checkRateLimit(clientId) || !this.token || provided !== this.token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json', Connection:'close' });
          res.end(JSON.stringify({ ok: true, message: 'ULAB Agent shutdown requested' }));
          setImmediate(async () => {
            try {
              this.server?.closeAllConnections?.();
              await this.stop();
            } finally {
              await this.onShutdown?.();
            }
          });
          return;
        }

        if (req.url === '/mcp' && req.method === 'GET') {
          res.writeHead(405, { 'Allow': 'POST', 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ULAB MCP is request/response only; use POST /mcp' }));
          return;
        }

        if (req.url === '/mcp' && req.method === 'POST') {
          void this.mcpServer.handleHttp(req, res).catch((error: any) => {
            if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
            if (!res.writableEnded) res.end(JSON.stringify({ error: error?.message || 'MCP server error' }));
          });
          return;
        }

        if (req.url === '/health' || req.url === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              status: 'ok',
              version: '3.10.5',
              hasActiveWorkspace: !!this.currentSession,
              workspace: this.currentSession?.workspaceName || null,
            })
          );
          return;
        }

        res.writeHead(404);
        res.end();
      });

      this.wss = new WebSocket.Server({
        server: this.server,
        maxPayload: 1024 * 1024, // 1MB limit
        verifyClient: (info, callback) => {
          const origin = info.origin;
          if (origin && !this.isOriginAllowed(origin)) {
            callback(false, 403, 'Cross-Site WebSocket Hijacking blocked: Untrusted origin');
            return;
          }
          callback(true);
        },
      });

      this.wss.on('connection', (ws: WebSocket.WebSocket, req) => {
        const remoteIp = req.socket.remoteAddress || '127.0.0.1';
        let authenticated = !this.token; // If no token configured, auto-authenticated

        ws.on('message', async (data: WebSocket.RawData) => {
          try {
            const raw = data.toString('utf-8');
            if (raw.length > 1024 * 1024) {
              ws.send(JSON.stringify({success:false,error:{code:'PAYLOAD_TOO_LARGE',message:'Message exceeds 1MB limit'}}));
              ws.close();
              return;
            }
            let parsed: any;
            try {
              parsed = JSON.parse(raw);
            } catch {
              ws.send(JSON.stringify({success:false,error:{code:'INVALID_REQUEST',message:'Malformed JSON'}}));
              return;
            }

            // Require valid token in first message if not yet authenticated
            if (!authenticated) {
              const msgToken = parsed.token;
              if (msgToken && msgToken === this.token) {
                authenticated = true;
              } else {
                ws.send(JSON.stringify({requestId:parsed.requestId,success:false,error:{code:'UNAUTHORIZED',message:'Invalid or missing security token'}}));
                ws.close();
                return;
              }
            }

            const response = await this.handleMessage(parsed, remoteIp);
            ws.send(JSON.stringify(response));
          } catch (err: any) {
            ws.send(JSON.stringify({success:false,error:{code:'EXECUTION_FAILED',message:err?.message||'Server error'}}));
          }
        });
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        for (const client of this.wss.clients) {
          try {
            client.terminate();
          } catch {
            // ignore
          }
        }
        this.wss.close();
      }
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Central RPC message dispatcher with strict security enforcement:
   * 1. Malformed request and type validation
   * 2. RequestId validation
   * 3. Rate limiting check
   * 4. Token / Authentication check
   * 5. Session staleness / invalidation check
   * 6. Server-enforced approval requirements (not relying on Web UI)
   */
  public async handleMessage(msg: any, clientId: string = 'client'): Promise<any> {
    // 1. Malformed message structure checks
    if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
      return {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request payload must be a valid JSON object',
        },
      };
    }

    // 2. RequestId validation
    if (!msg.requestId || typeof msg.requestId !== 'string' || msg.requestId.length > 128) {
      return {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing or invalid requestId (must be a string up to 128 characters)',
        },
      };
    }

    const requestId = msg.requestId;

    // 3. Action validation
    if (!msg.action || typeof msg.action !== 'string') {
      return {
        requestId,
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing or invalid action name',
          requestId,
        },
      };
    }

    const action = msg.action;
    const params = (msg.params && typeof msg.params === 'object' && !Array.isArray(msg.params)) ? msg.params : {};

    // 4. Rate Limiting Check
    if (!this.checkRateLimit(clientId)) {
      return {
        requestId,
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please wait before submitting more requests.',
          requestId,
        },
      };
    }

    // 5. Authentication Token Validation
    // For local security, requests must supply the configured server token
    const providedToken = msg.token || params.token;
    if (this.token && providedToken !== this.token) {
      return {
        requestId,
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing authentication token',
          requestId,
        },
      };
    }

    try {
      // 6. Workspace Selection & Session Initialization
      if (action === 'workspace.select' || action === 'workspace.switch' || action === 'project.select') {
        const rootPath = params.path || params.workspaceRoot;
        if (!rootPath || typeof rootPath !== 'string') {
          return {
            requestId,
            success: false,
            error: {
              code: 'INVALID_PATH',
              message: 'Workspace path is required and must be a valid string',
              requestId,
            },
          };
        }
        const session = this.switchWorkspace(rootPath);
        return {
          requestId,
          success: true,
          action: 'workspace.selected',
          data: session,
        };
      }

      if (action === 'workspace.session') {
        return {
          requestId,
          success: true,
          action: 'workspace.session',
          data: this.currentSession,
        };
      }

      // Enforce active workspace requirement for all remaining actions
      if (!this.currentSession || !this.workspaceManager) {
        const err: StructuredError = {
          code: 'WORKSPACE_NOT_FOUND',
          message: 'No active workspace selected. Call workspace.select first.',
          requestId,
        };
        return { requestId, success: false, error: err };
      }

      // 7. Session Staleness & Invalidation Check
      // Workspace switching is itself the operation that invalidates the
      // previous session, so it must not be rejected as stale first.
      if (action !== 'workspace.switch' && msg.sessionId && msg.sessionId !== this.currentSession.sessionId) {
        return {
          requestId,
          success: false,
          error: {
            code: 'SESSION_STALE',
            message: 'Session has expired or was invalidated by workspace switch',
            requestId,
          },
        };
      }

      // 8. File Operations (Server-enforced approvals and sandbox)
      if (action === 'workspace.list' || action === 'files.list') {
        const list = await this.workspaceManager.listFiles(params.path || '.', params.recursive ?? true);
        return { requestId, success: true, action: 'files.list', data: list };
      }

      if (action === 'files.search' || action === 'workspace.search') {
        if (!params.query || typeof params.query !== 'string') {
          return { requestId, success: false, error: { code: 'INVALID_REQUEST', message: 'Search query is required', requestId } };
        }
        const results = await this.workspaceManager.search(params.query, Math.min(Number(params.maxResults) || 50, 100));
        this.logAudit({ operation: 'files.search', relativePath: '.', approval: 'NOT_REQUIRED', result: 'SUCCESS', detail: `Query length: ${params.query.length}` });
        return { requestId, success: true, action: 'files.search', data: results };
      }

      if (action === 'workspace.readFile' || action === 'files.read') {
        if (!params.path || typeof params.path !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_PATH', message: 'Target file path is required', requestId },
          };
        }
        try {
          const file = await this.workspaceManager.readFile(params.path);
          this.logAudit({
            operation: 'files.read',
            relativePath: params.path,
            approval: 'NOT_REQUIRED',
            result: 'SUCCESS',
          });
          return { requestId, success: true, action: 'files.read', data: file };
        } catch (err: any) {
          const isDenied = err.code === 'ACCESS_DENIED' || err.message?.toLowerCase().includes('denied') || err.message?.toLowerCase().includes('outside') || err.message?.toLowerCase().includes('sensitive') || err.message?.toLowerCase().includes('traversal') || err.message?.toLowerCase().includes('prohibited');
          this.logAudit({
            operation: 'files.read',
            relativePath: params.path,
            approval: 'NOT_REQUIRED',
            result: 'DENIED',
            detail: err.message,
          });
          return {
            requestId,
            success: false,
            error: {
              code: err.code === 'ENOENT' || err.code === 'ENOTDIR' || err.message?.toLowerCase().includes('not found')
                ? 'FILE_NOT_FOUND'
                : err.code || (isDenied ? 'ACCESS_DENIED' : 'EXECUTION_FAILED'),
              message: err.message || 'Failed to read file',
              requestId,
            },
          };
        }
      }

      if (action === 'workspace.proposeChange' || action === 'files.propose') {
        if (!params.path || typeof params.path !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_PATH', message: 'Target file path is required', requestId },
          };
        }
        const prop = await this.workspaceManager.proposeChange(
          params.path,
          params.content || params.proposedContent || '',
          params.reason || 'AI Suggested Modification'
        );
        this.logAudit({
          operation: 'files.propose',
          relativePath: params.path,
          approval: 'NOT_REQUIRED',
          result: 'SUCCESS',
          detail: `Proposal ID: ${prop.changeId}`,
        });
        return { requestId, success: true, action: 'files.proposed', data: prop };
      }

      if (action === 'workspace.approveProposal' || action === 'files.approve') {
        const changeId = params.changeId;
        if (!changeId || typeof changeId !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_REQUEST', message: 'changeId is required to approve proposal', requestId },
          };
        }
        try {
          const prop = this.workspaceManager.approveProposal(changeId);
          this.logAudit({
            operation: 'files.approve',
            relativePath: prop.path,
            approval: 'APPROVED',
            result: 'SUCCESS',
            detail: `Proposal ${changeId} approved; not yet applied`,
          });
          return { requestId, success: true, action: 'files.approved', data: prop };
        } catch (err: any) {
          return {
            requestId,
            success: false,
            error: { code: 'EXECUTION_FAILED', message: err.message, requestId },
          };
        }
      }

      if (action === 'workspace.rejectProposal' || action === 'files.reject') {
        const changeId = params.changeId;
        if (!changeId || typeof changeId !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_REQUEST', message: 'changeId is required to reject proposal', requestId },
          };
        }
        try {
          const prop = this.workspaceManager.rejectProposal(changeId);
          this.logAudit({
            operation: 'files.reject',
            relativePath: prop.path,
            approval: 'REJECTED',
            result: 'SUCCESS',
            detail: `Proposal ${changeId} rejected`,
          });
          return { requestId, success: true, action: 'files.rejected', data: prop };
        } catch (err: any) {
          return {
            requestId,
            success: false,
            error: { code: 'EXECUTION_FAILED', message: err.message, requestId },
          };
        }
      }

      if (action === 'workspace.proposals' || action === 'files.proposals') {
        const proposals = this.workspaceManager.getProposals();
        return { requestId, success: true, action: 'files.proposals', data: proposals };
      }

      // WRITE: Server enforces explicit approval!
      if (action === 'workspace.applyChange' || action === 'files.write') {
        const targetPath = params.path || (params.changeId ? this.workspaceManager.getProposal(params.changeId)?.path : undefined);
        if (!params.approved) {
          this.logAudit({
            operation: 'files.write',
            relativePath: targetPath || 'unknown',
            approval: 'REJECTED',
            result: 'DENIED',
            detail: 'User approval required for write',
          });
          return {
            requestId,
            success: false,
            error: {
              code: 'APPROVAL_REQUIRED',
              message: 'Modifying files requires explicit user approval (params.approved must be true)',
              requestId,
            },
          };
        }
        if (!targetPath || typeof targetPath !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_PATH', message: 'Target file path is required', requestId },
          };
        }
        const contentToWrite = params.content ?? (params.changeId ? this.workspaceManager.getProposal(params.changeId)?.proposedContent : '');
        try {
          await this.workspaceManager.applyChange(targetPath, contentToWrite ?? '', params.changeId);
          this.logAudit({
            operation: 'files.write',
            relativePath: targetPath,
            approval: 'APPROVED',
            result: 'SUCCESS',
            detail: params.changeId ? `Applied change ${params.changeId}` : 'Direct write applied',
          });
          return { requestId, success: true, action: 'files.written', data: { path: targetPath } };
        } catch (err: any) {
          const isDenied = err.code === 'ACCESS_DENIED' || err.message?.toLowerCase().includes('denied') || err.message?.toLowerCase().includes('outside') || err.message?.toLowerCase().includes('sensitive') || err.message?.toLowerCase().includes('traversal') || err.message?.toLowerCase().includes('prohibited');
          this.logAudit({
            operation: 'files.write',
            relativePath: targetPath,
            approval: 'APPROVED',
            result: 'DENIED',
            detail: err.message,
          });
          return {
            requestId,
            success: false,
            error: {
              code: err.code || (isDenied ? 'ACCESS_DENIED' : 'EXECUTION_FAILED'),
              message: err.message,
              requestId,
            },
          };
        }
      }

      // DELETE: Server enforces explicit approval!
      if (action === 'workspace.deleteFile' || action === 'files.delete') {
        if (!params.path || typeof params.path !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_PATH', message: 'Target file path is required', requestId },
          };
        }
        if (!params.approved) {
          this.logAudit({
            operation: 'files.delete',
            relativePath: params.path,
            approval: 'REJECTED',
            result: 'DENIED',
            detail: 'User approval required for delete',
          });
          return {
            requestId,
            success: false,
            error: {
              code: 'APPROVAL_REQUIRED',
              message: 'Deleting files requires explicit user approval (params.approved must be true)',
              requestId,
            },
          };
        }
        try {
          await this.workspaceManager.deleteFile(params.path);
          this.logAudit({
            operation: 'files.delete',
            relativePath: params.path,
            approval: 'APPROVED',
            result: 'SUCCESS',
          });
          return { requestId, success: true, action: 'files.deleted', data: { path: params.path } };
        } catch (err: any) {
          const isDenied = err.code === 'ACCESS_DENIED' || err.message?.toLowerCase().includes('denied') || err.message?.toLowerCase().includes('outside') || err.message?.toLowerCase().includes('sensitive') || err.message?.toLowerCase().includes('traversal') || err.message?.toLowerCase().includes('prohibited');
          this.logAudit({
            operation: 'files.delete',
            relativePath: params.path,
            approval: 'APPROVED',
            result: 'DENIED',
            detail: err.message,
          });
          return {
            requestId,
            success: false,
            error: {
              code: err.code || (isDenied ? 'ACCESS_DENIED' : 'EXECUTION_FAILED'),
              message: err.message,
              requestId,
            },
          };
        }
      }

      // 9. Git Operations (Server-enforced approvals)
      if (action === 'git.status') {
        const status = await this.gitManager!.getStatus();
        return { requestId, success: true, action: 'git.status', data: status };
      }

      if (action === 'git.diff') {
        const diff = await this.gitManager!.getDiff(params.path);
        return { requestId, success: true, action: 'git.diff', data: { diff } };
      }

      if (action === 'git.commit') {
        if (!params.approved) {
          return {
            requestId,
            success: false,
            error: {
              code: 'APPROVAL_REQUIRED',
              message: 'Git commit requires explicit user approval (params.approved must be true)',
              requestId,
            },
          };
        }
        const out = await this.gitManager!.commit(params.message);
        return { requestId, success: true, action: 'git.commit', data: { output: out } };
      }

      if (action === 'git.push') {
        if (!params.approved) {
          return {
            requestId,
            success: false,
            error: {
              code: 'APPROVAL_REQUIRED',
              message: 'Git push requires explicit user approval (params.approved must be true)',
              requestId,
            },
          };
        }
        const out = await this.gitManager!.push(params.remote, params.branch);
        return { requestId, success: true, action: 'git.push', data: { output: out } };
      }

      // 10. Terminal & Test Operations (Server-enforced approvals & command safety)
      if (action === 'terminal.execute') {
        const cmd = params.command;
        if (!cmd || typeof cmd !== 'string') {
          return {
            requestId,
            success: false,
            error: { code: 'INVALID_REQUEST', message: 'Command is required', requestId },
          };
        }

        const args = Array.isArray(params.args) && params.args.every((arg: unknown) => typeof arg === 'string')
          ? params.args as string[]
          : [];
        const fullCommand = [cmd, ...args].join(' ');
        const evalRes = this.terminalManager!.evaluateCommand(fullCommand);
        if (!evalRes.allowed) {
          this.logAudit({
            operation: 'terminal.execute',
            relativePath: cmd,
            approval: 'REJECTED',
            result: 'DENIED',
            detail: evalRes.reason,
          });
          return {
            requestId,
            success: false,
            error: {
              code: 'COMMAND_REJECTED',
              message: evalRes.reason || 'Command rejected by safety policy',
              requestId,
            },
          };
        }

        // If command requires approval, verify that approval is granted!
        if (evalRes.requiresApproval && !params.approved) {
          this.logAudit({
            operation: 'terminal.execute',
            relativePath: cmd,
            approval: 'REJECTED',
            result: 'DENIED',
            detail: evalRes.reason || 'Command execution requires explicit user approval',
          });
          return {
            requestId,
            success: false,
            error: {
              code: 'APPROVAL_REQUIRED',
              message: evalRes.reason || 'Command execution requires explicit user approval',
              requestId,
            },
          };
        }

        const res = await this.terminalManager!.execute(cmd, args);
        this.logAudit({
          operation: 'terminal.execute',
          relativePath: cmd,
          approval: evalRes.requiresApproval ? 'APPROVED' : 'AUTOMATIC',
          result: res.success ? 'SUCCESS' : 'FAILED',
        });
        return { requestId, success: res.success, action: 'terminal.executed', data: res };
      }

      if (action === 'testing.run') {
        const testRes = await this.terminalManager!.runDetectedProjectTests();
        this.logAudit({
          operation: 'testing.run',
          relativePath: 'tests',
          approval: 'AUTOMATIC',
          result: testRes.success ? 'SUCCESS' : 'FAILED',
          detail: `Passed: ${testRes.passed}/${testRes.total}`,
        });
        return { requestId, success: testRes.success, action: 'testing.result', data: testRes };
      }

      // 11. Context Builder
      if (action === 'context.build') {
        const ctx = await this.contextBuilder!.buildContext({
          taskDescription: params.taskDescription,
          explicitFiles: params.files,
        });
        return { requestId, success: true, action: 'context.built', data: ctx };
      }

      // 12. Audit Log
      if (action === 'audit.log' || action === 'workspace.auditLog') {
        return {
          requestId,
          success: true,
          action: 'audit.log',
          data: this.getAuditLogs(),
        };
      }

      return {
        requestId,
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: `Unknown action: ${action}`,
          requestId,
        },
      };
    } catch (err: any) {
      return {
        requestId,
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: err?.message || 'Operation failed',
          requestId,
        },
      };
    }
  }
}
