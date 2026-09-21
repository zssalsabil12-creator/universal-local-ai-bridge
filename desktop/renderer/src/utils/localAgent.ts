// ULAB Desktop ↔ Local Agent connection layer.
// The desktop application owns the AI bridge; this client only talks to the
// localhost agent over its authenticated WebSocket/RPC protocol.

import { useEffect, useState } from 'react';
import type { ErrorCode, StructuredError, WorkspaceSession, FileEntryInfo, ProposedChange, ExecutionResult, TestResult, AuditLogEntry } from '../../../../shared/types';

export type { ErrorCode, StructuredError, WorkspaceSession, FileEntryInfo, ProposedChange, ExecutionResult, TestResult, AuditLogEntry };

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AgentCapabilities {
  fileSystem: boolean;
  git: boolean;
  terminal: boolean;
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

export interface WebRpcResponse<T = unknown> {
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
  params?: Record<string, unknown>;
  result?: unknown;
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

export interface GitStatus {
  branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  clean: boolean;
  isRepository: boolean;
  error?: string;
}

export class LocalAgentManager {
  private status: ConnectionStatus = 'disconnected';
  private serverUrl = 'ws://127.0.0.1:19999';
  private httpBaseUrl = 'http://127.0.0.1:19999';
  private token = '';
  private ws: WebSocket | null = null;
  private currentSession: WorkspaceSession | null = null;
  private agentVersion = '3.10.8';
  private defaultTimeoutMs = 8000;
  private capabilities: AgentCapabilities = { fileSystem:false, git:false, terminal:false, notifications:true };
  private pendingRequests = new Map<string,{resolve:(res:WebRpcResponse)=>void; timer:ReturnType<typeof setTimeout>}>();
  private statusListeners = new Set<(status: ConnectionStatus)=>void>();
  private connectionListeners = new Set<(connection: AgentConnection)=>void>();
  private sessionListeners = new Set<(session: WorkspaceSession|null)=>void>();

  public getStatus(){ return this.status; }
  public getSession(){ return this.currentSession; }
  public getCapabilities(){ return {...this.capabilities}; }
  public getServerUrl(){ return this.serverUrl; }
  public setToken(token:string){ this.token=token.trim(); }
  public getToken(){ return this.token; }
  public getConnection():AgentConnection { return {status:this.status,version:this.agentVersion,platform:'Windows Desktop',capabilities:this.getCapabilities(),session:this.currentSession,serverUrl:this.serverUrl,activeWorkspace:this.currentSession?.workspaceRoot||null}; }
  public onStatusChange(fn:(s:ConnectionStatus)=>void){this.statusListeners.add(fn);return()=>{this.statusListeners.delete(fn);};}
  public onConnectionChange(fn:(c:AgentConnection)=>void){this.connectionListeners.add(fn);return()=>{this.connectionListeners.delete(fn);};}
  public onSessionChange(fn:(s:WorkspaceSession|null)=>void){this.sessionListeners.add(fn);return()=>{this.sessionListeners.delete(fn);};}
  private notify(){this.statusListeners.forEach(fn=>fn(this.status));const c=this.getConnection();this.connectionListeners.forEach(fn=>fn(c));}
  private notifySession(){this.sessionListeners.forEach(fn=>fn(this.currentSession));this.notify();}

  public async checkHealth(baseUrl=this.httpBaseUrl):Promise<HealthCheckResult>{
    try{const res=await fetch(baseUrl.replace(/\/+$/,'')+'/health');if(!res.ok)return{online:false,error:`HTTP ${res.status}`};const data=await res.json();this.agentVersion=data.version||this.agentVersion;return{online:true,version:this.agentVersion,hasActiveWorkspace:!!data.hasActiveWorkspace,workspace:data.workspace||null};}
    catch(e){return{online:false,error:e instanceof Error?e.message:'Agent unreachable'};}
  }

  public async connect(url=this.serverUrl,token?:string):Promise<boolean>{
    this.serverUrl=url;if(token!==undefined)this.token=token.trim();
    try{const parsed=new URL(url);this.httpBaseUrl=(parsed.protocol==='wss:'?'https:':'http:')+'//'+parsed.host;}catch{}
    this.disconnect(false);this.status='connecting';this.notify();
    return new Promise(resolve=>{
      let settled=false;let socket:WebSocket;
      try{socket=new WebSocket(url);}catch{this.status='error';this.notify();resolve(false);return;}
      this.ws=socket;
      const timer=setTimeout(()=>{if(!settled){settled=true;this.status='error';this.notify();try{socket.close();}catch{}resolve(false);}},5000);
      socket.onopen=async()=>{if(settled)return;clearTimeout(timer);settled=true;this.status='connected';this.capabilities={...this.capabilities,fileSystem:true,git:true,terminal:true};this.notify();await this.refreshSession().catch(()=>undefined);resolve(true);};
      socket.onmessage=e=>this.handleMessage(e.data);
      socket.onerror=()=>{if(!settled){clearTimeout(timer);settled=true;this.status='error';this.notify();resolve(false);}};
      socket.onclose=()=>{this.ws=null;this.status='disconnected';this.currentSession=null;this.failPending('AGENT_OFFLINE','Local agent connection was closed');this.notifySession();if(!settled){clearTimeout(timer);settled=true;resolve(false);}};
    });
  }

  private handleMessage(raw:string){try{const data:WebRpcResponse=JSON.parse(raw);if(!data?.requestId)return;const pending=this.pendingRequests.get(data.requestId);if(!pending)return;clearTimeout(pending.timer);this.pendingRequests.delete(data.requestId);if(!data.success&&data.error&&(data.error.code==='SESSION_STALE'||data.error.code==='SESSION_EXPIRED')){this.currentSession=null;this.notifySession();}pending.resolve(data);}catch(e){console.error('ULAB agent message error',e);}}
  private failPending(code:string,message:string){for(const [id,p] of this.pendingRequests){clearTimeout(p.timer);p.resolve({requestId:id,success:false,error:{code:code as ErrorCode,message,requestId:id}});}this.pendingRequests.clear();}
  public disconnect(notify=true){if(this.ws){try{this.ws.close();}catch{}this.ws=null;}this.status='disconnected';this.currentSession=null;this.failPending('AGENT_OFFLINE','Client disconnected from local agent');if(notify)this.notifySession();}
  private requestId(){return `req-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;}

  public sendRequest<T=unknown>(action:string,params:Record<string,unknown>={},sessionId?:string,timeoutMs=this.defaultTimeoutMs):Promise<WebRpcResponse<T>>{
    const requestId=this.requestId();if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return Promise.resolve({requestId,success:false,error:{code:'AGENT_OFFLINE',message:'Local Agent is offline or disconnected',requestId}});
    const payload={requestId,action,token:this.token,sessionId:sessionId??this.currentSession?.sessionId,params};
    return new Promise(resolve=>{const timer=setTimeout(()=>{this.pendingRequests.delete(requestId);resolve({requestId,success:false,error:{code:'TIMEOUT',message:`Request timed out after ${timeoutMs}ms`,requestId}});},timeoutMs);this.pendingRequests.set(requestId,{resolve:resolve as (r:WebRpcResponse)=>void,timer});try{this.ws!.send(JSON.stringify(payload));}catch(e){clearTimeout(timer);this.pendingRequests.delete(requestId);resolve({requestId,success:false,error:{code:'EXECUTION_FAILED',message:e instanceof Error?e.message:'Failed to send request',requestId}});}});
  }

  public async selectWorkspace(path:string){const r=await this.sendRequest<WorkspaceSession>('workspace.select',{path});if(r.success&&r.data){this.currentSession=r.data;this.notifySession();}return r;}
  public async switchWorkspace(path:string){const r=await this.sendRequest<WorkspaceSession>('workspace.switch',{path});if(r.success&&r.data){this.currentSession=r.data;this.notifySession();}return r;}
  public async refreshSession(){const r=await this.sendRequest<WorkspaceSession>('workspace.session');if(r.success){this.currentSession=r.data||null;this.notifySession();}return r;}
  public listFiles(path='.',recursive=true){return this.sendRequest<FileEntryInfo[]>('files.list',{path,recursive});}
  public readFile(path:string){return this.sendRequest<{path:string;content:string}>('files.read',{path});}
  public proposeChange(path:string,content:string,reason='User proposed update'){return this.sendRequest<ProposedChange>('files.propose',{path,content,reason});}
  public approveChange(changeId:string){return this.sendRequest('files.approve',{changeId});}
  public rejectChange(changeId:string){return this.sendRequest('files.reject',{changeId});}
  public writeFile(path:string,content:string,approved=false){return this.sendRequest('files.write',{path,content,approved});}
  public deleteFile(path:string,approved=false){return this.sendRequest('files.delete',{path,approved});}
  public executeTerminal(command:string,args:string[]=[],approved=false){return this.sendRequest<ExecutionResult>('terminal.execute',{command,args,approved});}
  public runTests(command?:string){return this.sendRequest<TestResult>('testing.run',{command});}
  public buildContext(taskPrompt?:string,targetFiles?:string[]){return this.sendRequest('context.build',{taskDescription:taskPrompt,files:targetFiles});}
  public gitStatus(){return this.sendRequest<GitStatus>('git.status');}
  public gitDiff(path?:string){return this.sendRequest<{diff:string}>('git.diff',path?{path}:{});}
  public queryAudit(){return this.sendRequest<AuditLogEntry[]>('audit.log');}
  public async sendMessage(message:AgentMessage):Promise<AgentMessage>{const r=await this.sendRequest(message.action,message.params||{});return{id:message.id,type:'response',action:message.action,result:r.data,error:r.error?.message,timestamp:Date.now()};}
}

export const localAgent=new LocalAgentManager();
export function useAgentConnection():AgentConnection{const[connection,setConnection]=useState(localAgent.getConnection());useEffect(()=>localAgent.onConnectionChange(setConnection),[]);return connection;}
