// Git Integration Module
// Provides safe local Git operations with security validation

export interface GitStatus {
  branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  status: 'modified' | 'added' | 'deleted';
}

export interface GitOperation {
  id: string;
  operation: string;
  status: 'pending' | 'approved' | 'executed' | 'failed';
  timestamp: number;
  files?: string[];
  message?: string;
}

// Sensitive file patterns for Git operations
const SENSITIVE_PATTERNS = [
  /\.env/,
  /\.pem$/,
  /\.key$/,
  /credentials/,
  /secrets?/,
  /id_rsa/,
  /id_ed25519/,
];

export class GitManager {
  private projectRoot: string;
  private operationLog: GitOperation[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  // Check if directory is a Git repository
  async isGitRepository(): Promise<boolean> {
    // In real implementation, this would check for .git directory
    // For now, simulate detection
    return true;
  }

  // Get current Git status
  async getStatus(): Promise<GitStatus> {
    // In real implementation, this would execute: git status --porcelain
    // For now, return simulated data
    return {
      branch: 'main',
      modified: [],
      staged: [],
      untracked: [],
      ahead: 0,
      behind: 0,
    };
  }

  // Get recent commits
  async getRecentCommits(limit: number = 10): Promise<GitCommit[]> {
    // In real implementation, this would execute: git log --oneline -n {limit}
    // For now, return simulated data
    return [
      {
        hash: 'abc1234',
        message: 'Initial commit',
        author: 'Developer',
        date: new Date().toISOString(),
      },
    ];
  }

  // Get diff summary
  async getDiffSummary(): Promise<GitDiff[]> {
    // In real implementation, this would execute: git diff --stat
    // For now, return simulated data
    return [];
  }

  // Check if file is sensitive
  isSensitiveFile(filePath: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(filePath));
  }

  // Validate files before commit
  validateCommitFiles(files: string[]): { valid: boolean; reason?: string } {
    // Check for sensitive files
    for (const file of files) {
      if (this.isSensitiveFile(file)) {
        return {
          valid: false,
          reason: `Sensitive file detected: ${file}`,
        };
      }
    }

    return { valid: true };
  }

  // Create commit (requires explicit approval)
  async createCommit(
    files: string[],
    message: string,
    approved: boolean
  ): Promise<GitOperation> {
    const id = `git-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const operation: GitOperation = {
      id,
      operation: 'commit',
      status: 'pending',
      timestamp: Date.now(),
      files,
      message,
    };

    // Validate files
    const validation = this.validateCommitFiles(files);
    if (!validation.valid) {
      operation.status = 'failed';
      this.operationLog.push(operation);
      throw new Error(validation.reason);
    }

    // Require explicit approval
    if (!approved) {
      this.operationLog.push(operation);
      return operation;
    }

    // In real implementation, this would execute:
    // git add {files}
    // git commit -m "{message}"
    
    operation.status = 'executed';
    this.operationLog.push(operation);

    return operation;
  }

  // Approve pending operation
  async approveOperation(id: string): Promise<GitOperation | null> {
    const operation = this.operationLog.find(op => op.id === id);
    if (!operation || operation.status !== 'pending') {
      return null;
    }

    operation.status = 'approved';
    return operation;
  }

  // Get operation log
  getOperationLog(): GitOperation[] {
    return [...this.operationLog];
  }

  // Clear operation log
  clearOperationLog(): void {
    this.operationLog = [];
  }

  // Get current branch
  async getCurrentBranch(): Promise<string> {
    const status = await this.getStatus();
    return status.branch;
  }

  // Check if there are uncommitted changes
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return (
      status.modified.length > 0 ||
      status.staged.length > 0 ||
      status.untracked.length > 0
    );
  }

  // Get list of changed files
  async getChangedFiles(): Promise<string[]> {
    const status = await this.getStatus();
    return [
      ...status.modified,
      ...status.staged,
      ...status.untracked,
    ];
  }
}

// Export singleton instance
export const gitManager = new GitManager('.');
