// Local Agent Connection Layer
// Clean, production-quality communication layer between ULAB Web and Local Agent
// Implements: Authenticated WebSocket communication, session awareness,
// requestId correlation, structured errors, connection management, and status detection.

import { useState, useEffect } from 'react';
import type {
  ErrorCode,
  StructuredError,
  WorkspaceSession,
  FileEntryInfo,
  ProposedChange,
  ExecutionResult,
  TestResult,
  AuditLogEntry,
} from '../../agent/src/types';

export type {
  ErrorCode,
  StructuredError,
  WorkspaceSession,
  FileEntryInfo,
  ProposedChange,
  ExecutionResult,
  TestResult,
  AuditLogEntry,
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AgentCapabilities {
  fileSystem: boolean;
  git: boolean;
  terminal: boolean;
  browser: boolean;
  notifications: boolean;
}

export interface AgentConnection {
  status: ConnectionStatus;
  version?: string;
  platform?: string;
  capabilities: AgentCapabilities;
  session: WorkspaceSession | null;
  serverUrl?: string;
  activeWorkspace?: string | null;
}

export interface WebRpcResponse<T = any> {
  requestId: string;
  success: boolean;
  action?: string;
  data?: T;
  error?: StructuredError;
}

export interface AgentMessage {
  id: string;
  type: 'request' | 'response' | 'event';
  action: string;
  params?: Record<string, any>;
  result?: any;
  error?: string;
  timestamp: number;
}

export interface HealthCheckResult {
  online: boolean;
  version?: string;
  hasActiveWorkspace?: boolean;
  workspace?: string | null;
  error?: string;
}

// ============ PRODUCTION LOCAL AGENT CLIENT ============

export class LocalAgentManager {
  private status: ConnectionStatus = 'disconnected';
  private serverUrl: string = 'ws://127.0.0.1:19999';
  private httpBaseUrl: string = 'http://127.0.0.1:19999';
  private token: string = '';
  private ws: any = null;
  private currentSession: WorkspaceSession | null = null;
  private agentVersion: string = '1.0.0';
  private defaultTimeoutMs: number = 8000;

  private capabilities: AgentCapabilities = {
    fileSystem: false,
    git: false,
    terminal: false,
    browser: false,
    notifications: true,
  };

  private pendingRequests: Map<
    string,
    {
      resolve: (res: WebRpcResponse<any>) => void;
      reject: (err: any) => void;
      timer: any;
    }
  > = new Map();

  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private connectionListeners: Set<(connection: AgentConnection) => void> = new Set();
  private sessionListeners: Set<(session: WorkspaceSession | null) => void> = new Set();

  constructor() {
    this.detectEnvironment();
  }

  private detectEnvironment() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.capabilities.notifications = true;
    }
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      this.capabilities.fileSystem = true;
    }
  }

  // ============ GETTERS & STATE ============

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getSession(): WorkspaceSession | null {
    return this.currentSession;
  }

  public getCapabilities(): AgentCapabilities {
    return { ...this.capabilities };
  }

  public getServerUrl(): string {
    return this.serverUrl;
  }

  public setToken(token: string) {
    this.token = token.trim();
  }

  public getToken(): string {
    return this.token;
  }

  public getConnection(): AgentConnection {
    return {
      status: this.status,
      version: this.agentVersion,
      platform: this.getPlatform(),
      capabilities: this.getCapabilities(),
      session: this.currentSession,
      serverUrl: this.serverUrl,
      activeWorkspace: this.currentSession?.workspaceRoot || null,
    };
  }

  private getPlatform(): string {
    if (typeof navigator === 'undefined') return 'Node.js/Agent';
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows (Browser)';
    if (ua.includes('Mac')) return 'macOS (Browser)';
    if (ua.includes('Linux')) return 'Linux (Browser)';
    return 'Web Browser';
  }

  // ============ EVENT SUBSCRIPTIONS ============

  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public onConnectionChange(listener: (connection: AgentConnection) => void): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  public onSessionChange(listener: (session: WorkspaceSession | null) => void): () => void {
    this.sessionListeners.add(listener);
    return () => this.sessionListeners.delete(listener);
  }

  private notifyChanges() {
    this.statusListeners.forEach((fn) => {
      try {
        fn(this.status);
      } catch (e) {
        console.error('Error in status listener:', e);
      }
    });

    const conn = this.getConnection();
    this.connectionListeners.forEach((fn) => {
      try {
        fn(conn);
      } catch (e) {
        console.error('Error in connection listener:', e);
      }
    });
  }

  private notifySessionChange() {
    this.sessionListeners.forEach((fn) => {
      try {
        fn(this.currentSession);
      } catch (e) {
        console.error('Error in session listener:', e);
      }
    });
    this.notifyChanges();
  }

  // ============ HEALTH DETECTION ============

  /**
   * Probes HTTP /health endpoint of LocalAgentServer
   */
  public async checkHealth(baseUrl?: string): Promise<HealthCheckResult> {
    const url = (baseUrl || this.httpBaseUrl).replace(/\/+$/, '') + '/health';
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.version) this.agentVersion = data.version;
        return {
          online: true,
          version: data.version || '1.0.0',
          hasActiveWorkspace: !!data.hasActiveWorkspace,
          workspace: data.workspace || null,
        };
      }
      return { online: false, error: `HTTP ${res.status}` };
    } catch (err: any) {
      return { online: false, error: err?.message || 'Agent health check unreachable' };
    }
  }

  // ============ CONNECTION LIFECYCLE ============

  /**
   * Establishes real WebSocket connection to LocalAgentServer
   */
  public async connect(url: string = 'ws://127.0.0.1:19999', token?: string): Promise<boolean> {
    this.serverUrl = url;
    if (token !== undefined) {
      this.token = token.trim();
    }

    // Derive HTTP base URL from WS URL (e.g. ws://127.0.0.1:19999 -> http://127.0.0.1:19999)
    try {
      const parsed = new URL(url);
      const httpProtocol = parsed.protocol === 'wss:' ? 'https:' : 'http:';
      this.httpBaseUrl = `${httpProtocol}//${parsed.host}`;
    } catch {
      // Keep default
    }

    // Disconnect previous socket if any
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    this.status = 'connecting';
    this.notifyChanges();

    return new Promise<boolean>((resolve) => {
      let socket: any;

      try {
        if (typeof WebSocket !== 'undefined') {
          // Standard browser WebSocket
          socket = new WebSocket(url);
        } else {
          // Node environment for tests
          const NodeWebSocket = require('ws');
          socket = new NodeWebSocket(url, {
            headers: {
              Origin: 'http://localhost:3000',
              ...(this.token ? { 'x-ulab-token': this.token } : {}),
            },
          });
        }
      } catch (err: any) {
        this.status = 'error';
        this.notifyChanges();
        resolve(false);
        return;
      }

      this.ws = socket;

      let connectionResolved = false;

      const connectionTimeout = setTimeout(() => {
        if (!connectionResolved) {
          connectionResolved = true;
          this.status = 'error';
          this.notifyChanges();
          resolve(false);
        }
      }, 5000);

      const handleOpen = async () => {
        if (!connectionResolved) {
          clearTimeout(connectionTimeout);
          connectionResolved = true;
          this.status = 'connected';
          this.capabilities.fileSystem = true;
          this.capabilities.git = true;
          this.capabilities.terminal = true;
          this.notifyChanges();

          // Query active session state upon connection
          try {
            await this.refreshSession();
          } catch {
            // non-blocking
          }

          resolve(true);
        }
      };

      const handleMsg = (eventOrData: any) => {
        try {
          const raw =
            typeof eventOrData === 'string'
              ? eventOrData
              : eventOrData?.data !== undefined
              ? typeof eventOrData.data === 'string'
                ? eventOrData.data
                : eventOrData.data?.toString('utf-8')
              : eventOrData?.toString?.('utf-8');
          if (!raw) return;

          const data: WebRpcResponse = JSON.parse(raw);
          if (data && data.requestId) {
            const pending = this.pendingRequests.get(data.requestId);
            if (pending) {
              clearTimeout(pending.timer);
              this.pendingRequests.delete(data.requestId);

              // Detect session staleness / invalidation from server
              if (
                !data.success &&
                data.error &&
                (data.error.code === 'SESSION_STALE' || data.error.code === 'SESSION_EXPIRED')
              ) {
                this.currentSession = null;
                this.notifySessionChange();
              }

              pending.resolve(data);
            }
          }
        } catch (e) {
          console.error('Failed to parse incoming WebSocket message:', e);
        }
      };

      const handleError = (err: any) => {
        if (!connectionResolved) {
          clearTimeout(connectionTimeout);
          connectionResolved = true;
          this.status = 'error';
          this.notifyChanges();
          resolve(false);
        }
      };

      const handleClose = () => {
        const wasConnected = this.status === 'connected';
        this.status = 'disconnected';
        this.ws = null;
        this.currentSession = null;

        // Structured reject for all in-flight requests
        for (const [reqId, pending] of this.pendingRequests.entries()) {
          clearTimeout(pending.timer);
          pending.resolve({
            requestId: reqId,
            success: false,
            error: {
              code: 'AGENT_OFFLINE',
              message: 'Local agent connection was closed',
              requestId: reqId,
            },
          });
        }
        this.pendingRequests.clear();

        if (wasConnected) {
          this.notifySessionChange();
        } else {
          this.notifyChanges();
        }

        if (!connectionResolved) {
          clearTimeout(connectionTimeout);
          connectionResolved = true;
          resolve(false);
        }
      };

      socket.onopen = handleOpen;
      socket.onmessage = handleMsg;
      socket.onerror = handleError;
      socket.onclose = handleClose;

      if (typeof socket.on === 'function') {
        socket.on('open', handleOpen);
        socket.on('message', handleMsg);
        socket.on('error', handleError);
        socket.on('close', handleClose);
      }
    });
  }

  /**
   * Cleanly disconnects from LocalAgentServer
   */
  public disconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.status = 'disconnected';
    this.currentSession = null;

    for (const [reqId, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timer);
      pending.resolve({
        requestId: reqId,
        success: false,
        error: {
          code: 'AGENT_OFFLINE',
          message: 'Client disconnected from local agent',
          requestId: reqId,
        },
      });
    }
    this.pendingRequests.clear();

    this.notifySessionChange();
  }

  // ============ RPC REQUEST CORRELATION & DISPATCH ============

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Primary session-aware authenticated RPC request dispatcher with requestId correlation
   */
  public sendRequest<T = any>(
    action: string,
    params: Record<string, any> = {},
    overrideSessionId?: string,
    timeoutMs?: number
  ): Promise<WebRpcResponse<T>> {
    const requestId = this.generateRequestId();

    // Check if WebSocket is ready (readyState === 1 is OPEN)
    if (!this.ws || this.ws.readyState !== 1) {
      return Promise.resolve({
        requestId,
        success: false,
        error: {
          code: 'AGENT_OFFLINE',
          message: 'Local Agent is offline or disconnected',
          requestId,
        },
      });
    }

    const payload: Record<string, any> = {
      requestId,
      action,
      token: this.token,
      sessionId: overrideSessionId !== undefined ? overrideSessionId : this.currentSession?.sessionId,
      params,
    };

    const timeout = timeoutMs || this.defaultTimeoutMs;

    return new Promise<WebRpcResponse<T>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve({
          requestId,
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `Request timed out after ${timeout}ms`,
            requestId,
          },
        });
      }, timeout);

      this.pendingRequests.set(requestId, { resolve, reject, timer });

      try {
        this.ws.send(JSON.stringify(payload));
      } catch (err: any) {
        clearTimeout(timer);
        this.pendingRequests.delete(requestId);
        resolve({
          requestId,
          success: false,
          error: {
            code: 'EXECUTION_FAILED',
            message: err?.message || 'Failed to dispatch WebSocket message',
            requestId,
          },
        });
      }
    });
  }

  // ============ WORKSPACE & SESSION STATE SYNCHRONIZATION ============

  /**
   * Selects an active workspace root, creating an authorized session
   */
  public async selectWorkspace(path: string): Promise<WebRpcResponse<WorkspaceSession>> {
    const res = await this.sendRequest<WorkspaceSession>('workspace.select', { path });
    if (res.success && res.data) {
      this.currentSession = res.data;
      this.notifySessionChange();
    }
    return res;
  }

  /**
   * Switches to a new workspace root, invalidating prior session
   */
  public async switchWorkspace(path: string): Promise<WebRpcResponse<WorkspaceSession>> {
    const res = await this.sendRequest<WorkspaceSession>('workspace.switch', { path });
    if (res.success && res.data) {
      this.currentSession = res.data;
      this.notifySessionChange();
    }
    return res;
  }

  /**
   * Synchronizes active session info with the server
   */
  public async refreshSession(): Promise<WebRpcResponse<WorkspaceSession>> {
    const res = await this.sendRequest<WorkspaceSession>('workspace.session');
    if (res.success && res.data) {
      this.currentSession = res.data;
      this.notifySessionChange();
    } else if (res.success && !res.data) {
      this.currentSession = null;
      this.notifySessionChange();
    }
    return res;
  }

  // ============ PROTOCOL OPERATIONS ============

  public async listFiles(path?: string, recursive: boolean = true): Promise<WebRpcResponse<FileEntryInfo[]>> {
    return this.sendRequest<FileEntryInfo[]>('files.list', { path: path || '.', recursive });
  }

  public async readFile(path: string): Promise<WebRpcResponse<{ path: string; content: string }>> {
    return this.sendRequest<{ path: string; content: string }>('files.read', { path });
  }

  public async proposeChange(
    path: string,
    content: string,
    reason: string = 'User proposed update'
  ): Promise<WebRpcResponse<ProposedChange>> {
    return this.sendRequest<ProposedChange>('files.propose', { path, content, reason });
  }

  public async approveChange(changeId: string): Promise<WebRpcResponse<{ changeId: string; status: string }>> {
    return this.sendRequest('files.approve', { changeId });
  }

  public async rejectChange(changeId: string): Promise<WebRpcResponse<{ changeId: string; status: string }>> {
    return this.sendRequest('files.reject', { changeId });
  }

  public async writeFile(
    path: string,
    content: string,
    approved: boolean = false
  ): Promise<WebRpcResponse<{ path: string }>> {
    return this.sendRequest('files.write', { path, content, approved });
  }

  public async deleteFile(path: string, approved: boolean = false): Promise<WebRpcResponse<{ path: string }>> {
    return this.sendRequest('files.delete', { path, approved });
  }

  public async executeTerminal(
    command: string,
    args: string[] = [],
    approved: boolean = false
  ): Promise<WebRpcResponse<ExecutionResult>> {
    return this.sendRequest<ExecutionResult>('terminal.execute', { command, args, approved });
  }

  public async runTests(command?: string): Promise<WebRpcResponse<TestResult>> {
    return this.sendRequest<TestResult>('testing.run', { command });
  }

  public async buildContext(taskPrompt?: string, targetFiles?: string[]): Promise<WebRpcResponse<any>> {
    return this.sendRequest('context.build', { taskPrompt, targetFiles });
  }

  public async queryAudit(): Promise<WebRpcResponse<AuditLogEntry[]>> {
    return this.sendRequest<AuditLogEntry[]>('audit.query');
  }

  // ============ LEGACY / COMPATIBILITY HELPERS ============

  public async selectDirectory(): Promise<any | null> {
    if (typeof window !== 'undefined' && (window as any).showDirectoryPicker) {
      try {
        const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        return handle;
      } catch (e) {
        console.error('Directory selection cancelled or failed:', e);
        return null;
      }
    }
    return null;
  }

  public async sendMessage(message: AgentMessage): Promise<AgentMessage> {
    const res = await this.sendRequest(message.action, message.params || {});
    return {
      id: message.id,
      type: 'response',
      action: message.action,
      result: res.data,
      error: res.error?.message,
      timestamp: Date.now(),
    };
  }
}

// Singleton export
export const localAgent = new LocalAgentManager();

// ============ REACT INTEGRATION HOOK ============

export function useAgentConnection(): AgentConnection {
  const [connection, setConnection] = useState<AgentConnection>(localAgent.getConnection());

  useEffect(() => {
    const unsubscribe = localAgent.onConnectionChange((updated) => {
      setConnection(updated);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return connection;
}

// ============ NATIVE MESSAGING COMPATIBILITY EXPORTS ============

export interface NativeMessageHost {
  name: string;
  description: string;
  path: string;
  type: 'stdio';
  allowed_origins: string[];
}

export const NATIVE_HOST_MANIFEST: NativeMessageHost = {
  name: 'com.ulab.agent',
  description: 'ULAB Local Agent',
  path: '/path/to/ulab-agent',
  type: 'stdio',
  allowed_origins: ['chrome-extension://EXTENSION_ID/'],
};
