import * as WebSocket from 'ws';
import * as crypto from 'crypto';
import { StructuredError, WorkspaceSession } from './types';

export interface WebClientConfig {
  url: string;
  token?: string;
  defaultTimeoutMs?: number;
}

export interface WebRpcResponse<T = any> {
  requestId: string;
  success: boolean;
  action?: string;
  data?: T;
  error?: StructuredError;
}

export class WebAgentClient {
  private url: string;
  private token?: string;
  private defaultTimeoutMs: number;
  private ws: WebSocket.WebSocket | null = null;
  private pendingRequests: Map<string, {
    resolve: (res: WebRpcResponse) => void;
    reject: (err: any) => void;
    timer: NodeJS.Timeout;
  }> = new Map();
  private status: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private currentSession: WorkspaceSession | null = null;

  constructor(config: WebClientConfig) {
    this.url = config.url;
    this.token = config.token;
    this.defaultTimeoutMs = config.defaultTimeoutMs || 5000;
  }

  public getStatus(): string {
    return this.status;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public getSession(): WorkspaceSession | null {
    return this.currentSession;
  }

  /**
   * Connects to LocalAgentServer via real WebSocket
   */
  public async connect(): Promise<void> {
    this.status = 'connecting';
    return new Promise((resolve, reject) => {
      try {
        const headers: Record<string, string> = {
          Origin: 'http://localhost:3000',
        };
        if (this.token) {
          headers['x-ulab-token'] = this.token;
        }

        const ws = new WebSocket.WebSocket(this.url, { headers });
        this.ws = ws;

        ws.on('open', () => {
          this.status = 'connected';
          resolve();
        });

        ws.on('message', (raw: WebSocket.Data) => {
          try {
            const data: WebRpcResponse = JSON.parse(raw.toString('utf-8'));
            if (data) {
              if (data.requestId && this.pendingRequests.has(data.requestId)) {
                const pending = this.pendingRequests.get(data.requestId)!;
                clearTimeout(pending.timer);
                this.pendingRequests.delete(data.requestId);
                pending.resolve(data);
              } else if (!data.requestId && this.pendingRequests.size > 0) {
                // Response without requestId (e.g. server rejecting request with missing requestId)
                const firstKey = this.pendingRequests.keys().next().value;
                if (firstKey) {
                  const pending = this.pendingRequests.get(firstKey)!;
                  clearTimeout(pending.timer);
                  this.pendingRequests.delete(firstKey);
                  pending.resolve(data);
                }
              }
            }
          } catch (e) {
            // Ignore malformed push messages
          }
        });

        ws.on('error', (err) => {
          this.status = 'error';
          reject(err);
        });

        ws.on('close', () => {
          this.status = 'disconnected';
          // Reject any remaining pending requests
          for (const [reqId, pending] of this.pendingRequests.entries()) {
            clearTimeout(pending.timer);
            pending.resolve({
              requestId: reqId,
              success: false,
              error: {
                code: 'AGENT_OFFLINE',
                message: 'Connection to Local Agent closed unexpectedly',
                requestId: reqId,
              },
            });
          }
          this.pendingRequests.clear();
        });
      } catch (err) {
        this.status = 'error';
        reject(err);
      }
    });
  }

  /**
   * Disconnect the client
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
  }

  /**
   * Send an authenticated RPC request to the Local Agent
   */
  public sendRequest(
    action: string,
    params: Record<string, any> = {},
    overrideSessionId?: string,
    timeoutMs?: number
  ): Promise<WebRpcResponse> {
    const requestId = `req-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.resolve({
        requestId,
        success: false,
        error: {
          code: 'AGENT_OFFLINE',
          message: 'Agent is offline or WebSocket is not open',
          requestId,
        },
      });
    }

    const payload: Record<string, any> = {
      requestId,
      action,
      token: this.token,
      sessionId: overrideSessionId !== undefined ? overrideSessionId : (this.currentSession?.sessionId),
      params,
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve({
          requestId,
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `Request timed out after ${timeoutMs || this.defaultTimeoutMs}ms`,
            requestId,
          },
        });
      }, timeoutMs || this.defaultTimeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timer });

      try {
        this.ws!.send(JSON.stringify(payload));
      } catch (err: any) {
        clearTimeout(timer);
        this.pendingRequests.delete(requestId);
        resolve({
          requestId,
          success: false,
          error: {
            code: 'EXECUTION_FAILED',
            message: err.message || 'Failed to send message',
            requestId,
          },
        });
      }
    });
  }

  /**
   * Send raw payload for malformed RPC testing
   */
  public sendRaw(rawPayload: any, timeoutMs: number = 2000): Promise<WebRpcResponse> {
    const requestId = (rawPayload && typeof rawPayload === 'object' && rawPayload.requestId)
      ? rawPayload.requestId
      : `raw-${Date.now()}`;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.resolve({
        requestId,
        success: false,
        error: {
          code: 'AGENT_OFFLINE',
          message: 'Agent is offline',
          requestId,
        },
      });
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve({
          requestId,
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Raw request timed out',
            requestId,
          },
        });
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timer });

      try {
        const msg = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
        this.ws!.send(msg);
      } catch (err: any) {
        clearTimeout(timer);
        this.pendingRequests.delete(requestId);
        resolve({
          requestId,
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: err.message || 'Failed to send raw message',
            requestId,
          },
        });
      }
    });
  }

  /**
   * Helper: Select workspace and save current session
   */
  public async selectWorkspace(workspacePath: string): Promise<WebRpcResponse<WorkspaceSession>> {
    const res = await this.sendRequest('workspace.select', { path: workspacePath });
    if (res.success && res.data) {
      this.currentSession = res.data;
    }
    return res;
  }
}
