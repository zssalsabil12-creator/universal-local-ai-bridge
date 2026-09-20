// ULAB Universal Protocol Types and Constants
// Shared contracts between Local Agent, Web UI, and AI Adapters

export type ErrorCode =
  | 'ACCESS_DENIED'
  | 'WORKSPACE_NOT_FOUND'
  | 'INVALID_PATH'
  | 'COMMAND_REJECTED'
  | 'APPROVAL_REQUIRED'
  | 'AGENT_OFFLINE'
  | 'TIMEOUT'
  | 'FILE_NOT_FOUND'
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'SESSION_EXPIRED'
  | 'SESSION_STALE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'EXECUTION_FAILED';

export interface StructuredError {
  code: ErrorCode;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export interface WorkspaceSession {
  workspaceId: string;
  workspaceName: string;
  workspaceRoot: string;
  sessionId: string;
  createdAt: number;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
    git: boolean;
    delete: boolean;
  };
}

export interface SecurityCheckResult {
  allowed: boolean;
  resolvedRealPath?: string;
  relativeNormalizedPath?: string;
  error?: StructuredError;
}

export interface FileEntryInfo {
  name: string;
  relativePath: string;
  isDirectory: boolean;
  size?: number;
  updatedAt?: number;
}

export interface ProposedChange {
  changeId: string;
  operation: 'update_file' | 'create_file' | 'delete_file';
  path: string; // relative path
  reason: string;
  originalContent?: string;
  proposedContent: string;
  diff?: string;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
}

export interface ExecutionResult {
  requestId: string;
  command: string;
  args: string[];
  workingDirectory: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  success: boolean;
}

export interface TestResult {
  suiteName: string;
  framework: string;
  command?: string;
  cwd?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  output: string;
  durationMs: number;
  success: boolean;
}

export interface AuditLogEntry {
  timestamp: string;
  sessionId: string;
  operation: string;
  relativePath: string;
  approval: 'AUTOMATIC' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  detail?: string;
}
