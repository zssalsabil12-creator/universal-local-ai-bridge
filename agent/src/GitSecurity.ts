import { PathGuard } from './PathGuard';
import { TerminalSecurityManager } from './TerminalSecurity';

export interface GitStatusSummary {
  branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  clean: boolean;
}

export class GitSecurityManager {
  private terminal: TerminalSecurityManager;
  private guard: PathGuard;

  constructor(guard: PathGuard, terminal: TerminalSecurityManager) {
    this.guard = guard;
    this.terminal = terminal;
  }

  /**
   * Safe read-only git status
   */
  public async getStatus(): Promise<GitStatusSummary> {
    const res = await this.terminal.execute('git', ['status', '--porcelain', '-b']);
    if (!res.success) {
      return {
        branch: 'unknown',
        modified: [],
        staged: [],
        untracked: [],
        clean: true,
      };
    }

    const lines = res.stdout.split('\n').filter(Boolean);
    let branch = 'main';
    const modified: string[] = [];
    const staged: string[] = [];
    const untracked: string[] = [];

    for (const line of lines) {
      if (line.startsWith('##')) {
        branch = line.replace('##', '').trim();
        continue;
      }
      const code = line.slice(0, 2);
      const file = line.slice(3).trim();

      if (code === '??') {
        untracked.push(file);
      } else if (code.includes('M')) {
        modified.push(file);
      } else if (code.includes('A') || code.includes('D')) {
        staged.push(file);
      }
    }

    return {
      branch,
      modified,
      staged,
      untracked,
      clean: modified.length === 0 && staged.length === 0 && untracked.length === 0,
    };
  }

  /**
   * Safe read-only git diff
   */
  public async getDiff(filePath?: string): Promise<string> {
    const args = ['diff'];
    if (filePath) {
      const check = this.guard.validate(filePath);
      if (!check.allowed) {
        throw new Error(check.error?.message || 'Access denied to target file for git diff');
      }
      args.push(check.relativeNormalizedPath || filePath);
    }
    const res = await this.terminal.execute('git', args);
    return res.stdout || res.stderr;
  }

  /**
   * Commit requires approval in ULAB protocol
   */
  public async commit(message: string): Promise<string> {
    if (!message || message.trim().length === 0) {
      throw new Error('Commit message cannot be empty');
    }
    // Clean message of quotes
    const cleanMsg = message.replace(/"/g, '\\"');
    const res = await this.terminal.execute('git', ['commit', '-m', `"${cleanMsg}"`]);
    if (!res.success) {
      throw new Error(`Git commit failed: ${res.stderr || res.stdout}`);
    }
    return res.stdout;
  }

  /**
   * Push requires explicit approval in ULAB protocol
   */
  public async push(remote: string = 'origin', branch?: string): Promise<string> {
    const args = ['push', remote];
    if (branch) args.push(branch);
    const res = await this.terminal.execute('git', args);
    if (!res.success) {
      throw new Error(`Git push failed: ${res.stderr || res.stdout}`);
    }
    return res.stdout;
  }
}
