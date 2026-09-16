import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ExecutionResult, TestResult } from './types';
import { PathGuard } from './PathGuard';

export class TerminalSecurityManager {
  private guard: PathGuard;

  // Explicit allowed low-risk commands
  private static readonly SAFE_COMMANDS = new Set([
    'git status',
    'git diff',
    'git log',
    'git branch',
    'npm test',
    'npm run test',
    'npm run lint',
    'npm run build',
    'npm run typecheck',
    'yarn test',
    'yarn lint',
    'yarn build',
    'pnpm test',
    'pnpm lint',
    'pnpm build',
    'cargo test',
    'cargo check',
    'pytest',
    'python -m unittest',
    'go test',
  ]);

  // Blocked dangerous binary / syntax patterns
  private static readonly WINDOWS_CMD_SHIMS = new Set(['npm', 'npx', 'pnpm', 'yarn', 'eslint', 'tsc']);

  private static readonly DANGEROUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
    { pattern: /;/, reason: 'Command chaining using semicolon (;) is prohibited' },
    { pattern: /&&/, reason: 'Command chaining using logical AND (&&) is prohibited' },
    { pattern: /\|\|/, reason: 'Command chaining using logical OR (||) is prohibited' },
    { pattern: /&(?![^'"]*['"])/, reason: 'Background job operator (&) is prohibited' },
    { pattern: /\|/, reason: 'Pipeline operator (|) is prohibited' },
    { pattern: /`/, reason: 'Backtick command substitution is prohibited' },
    { pattern: /\$\(/, reason: 'Shell expansion $() is prohibited' },
    { pattern: /[><]/, reason: 'Shell I/O redirection is prohibited' },
    { pattern: /[\r\n]/, reason: 'Newline injection in command string is prohibited' },
    { pattern: /\0/, reason: 'Null byte injection is prohibited' },
    { pattern: /\bcd\b/i, reason: 'Directory switching (cd) is prohibited; commands must execute within active workspace' },
    { pattern: /\.\.[/\\]/, reason: 'Parent directory traversal (..) in terminal commands is prohibited' },
    { pattern: /^([a-zA-Z]:[/\\]|\/(bin|sbin|etc|usr|var|tmp|opt|Windows|System32)\b)/i, reason: 'Executing external system binaries or absolute system paths is prohibited' },
    { pattern: /\b(sudo|doas|runas)\b/i, reason: 'Privilege escalation commands are prohibited' },
    { pattern: /powershell(\.exe)?\s+.*(-e|-enc|-encodedcommand|-exec)/i, reason: 'Unrestricted PowerShell execution is prohibited' },
    { pattern: /\b(curl|wget)\b.*\|\s*(bash|sh|cmd|powershell)/i, reason: 'Piped web download execution is prohibited' },
    { pattern: /\b(mkfs|diskpart|format)\b/i, reason: 'Disk format utilities are prohibited' },
    { pattern: /\b(rm\s+-rf\s+[\/\\]|del\s+\/[sfq]\s+[c-z]:)/i, reason: 'Root/System destructive deletion commands are prohibited' },
    { pattern: /\b(iex|invoke-expression)\b/i, reason: 'Dynamic script evaluation is prohibited' },
  ];

  constructor(guard: PathGuard) {
    this.guard = guard;
  }

  public getGuard(): PathGuard {
    return this.guard;
  }

  /**
   * Determine whether a command requires manual user approval or is completely blocked
   */
  public evaluateCommand(cmdString: string): { allowed: boolean; requiresApproval: boolean; reason?: string } {
    if (!cmdString || typeof cmdString !== 'string') {
      return { allowed: false, requiresApproval: true, reason: 'Command must be a non-empty string' };
    }

    const trimmed = cmdString.trim();

    // Check dangerous patterns
    for (const entry of TerminalSecurityManager.DANGEROUS_PATTERNS) {
      if (entry.pattern.test(trimmed)) {
        return {
          allowed: false,
          requiresApproval: true,
          reason: entry.reason,
        };
      }
    }

    // Check if it matches a known safe command
    if (TerminalSecurityManager.SAFE_COMMANDS.has(trimmed)) {
      return { allowed: true, requiresApproval: false };
    }

    // Default policy: commands not on the explicit low-risk list REQUIRE user approval
    return {
      allowed: true,
      requiresApproval: true,
      reason: 'Command is not in automatic pre-approval list; manual approval required',
    };
  }

  private resolveExecutable(command: string): string {
    if (process.platform === 'win32' && TerminalSecurityManager.WINDOWS_CMD_SHIMS.has(command.toLowerCase())) {
      return `${command}.cmd`;
    }
    return command;
  }

  private buildSpawnSpec(command: string, args: string[]): { executable: string; args: string[] } {
    const executable = this.resolveExecutable(command);
    if (process.platform === 'win32' && command.toLowerCase() === 'npm') {
      const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
      if (fs.existsSync(npmCli)) {
        return { executable: process.execPath, args: [npmCli, ...args] };
      }
    }
    if (process.platform === 'win32' && executable.toLowerCase().endsWith('.cmd')) {
      const commandLine = [executable, ...args]
        .map((arg) => `"${arg.replace(/"/g, '\\"')}"`)
        .join(' ');
      return { executable: process.env.ComSpec || 'cmd.exe', args: ['/d', '/c', commandLine] };
    }
    return { executable, args };
  }

  private normalizeArgs(args: string[]): string[] {
    return args.map((arg) => {
      if (arg.length >= 2) {
        const first = arg[0];
        const last = arg[arg.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
          return arg.slice(1, -1);
        }
      }
      return arg;
    });
  }

  /**
   * Execute command strictly bound to workspaceRoot
   */
  public execute(
    command: string,
    args: string[] = [],
    timeoutMs: number = 30000
  ): Promise<ExecutionResult> {
    const requestId = `cmd-${Date.now()}`;
    const workspaceRoot = this.guard.getWorkspaceRoot();
    const startTime = Date.now();
    const normalizedArgs = this.normalizeArgs(args);

    return new Promise((resolve) => {
      // In Windows and Linux, enforce cwd = workspaceRoot.
      // Spawn directly: shell execution is intentionally disabled.
      const spawnSpec = this.buildSpawnSpec(command, normalizedArgs);
      const child = spawn(spawnSpec.executable, spawnSpec.args, {
        cwd: workspaceRoot,
        shell: false,
        env: {
          ...process.env,
          WORKSPACE_ROOT: workspaceRoot,
        },
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
      }, timeoutMs);

      child.stdout?.on('data', (data) => {
        stdout += data.toString('utf-8');
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString('utf-8');
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        resolve({
          requestId,
          command,
          args,
          workingDirectory: workspaceRoot,
          exitCode: timedOut ? -1 : code ?? 0,
          stdout: stdout.slice(0, 100000), // Cap output at 100KB for safety
          stderr: timedOut ? `${stderr}\n[Process timed out after ${timeoutMs}ms]` : stderr.slice(0, 50000),
          durationMs,
          success: !timedOut && code === 0,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        resolve({
          requestId,
          command,
          args,
          workingDirectory: workspaceRoot,
          exitCode: -1,
          stdout,
          stderr: `Spawn error: ${err.message}`,
          durationMs,
          success: false,
        });
      });
    });
  }

  /**
   * Auto-detect project type and run test runner
   */
  public async runDetectedProjectTests(): Promise<TestResult> {
    const root = this.guard.getWorkspaceRoot();
    let runnerCmd = 'npm';
    let runnerArgs = ['test'];
    let framework = 'Node.js / npm';

    if (fs.existsSync(path.join(root, 'package.json'))) {
      framework = 'npm test';
      runnerCmd = 'npm';
      runnerArgs = ['test', '--', '--watchAll=false'];
    } else if (fs.existsSync(path.join(root, 'Cargo.toml'))) {
      framework = 'Cargo (Rust)';
      runnerCmd = 'cargo';
      runnerArgs = ['test'];
    } else if (fs.existsSync(path.join(root, 'pytest.ini')) || fs.existsSync(path.join(root, 'requirements.txt'))) {
      framework = 'pytest (Python)';
      runnerCmd = 'pytest';
      runnerArgs = [];
    } else if (fs.existsSync(path.join(root, 'go.mod'))) {
      framework = 'go test (Go)';
      runnerCmd = 'go';
      runnerArgs = ['test', './...'];
    }

    const execRes = await this.execute(runnerCmd, runnerArgs, 60000);

    // Basic heuristic parse of output
    const output = `${execRes.stdout}\n${execRes.stderr}`;
    const passMatches = output.match(/(\d+)\s+passed/i) || output.match(/PASS/g);
    const failMatches = output.match(/(\d+)\s+failed/i) || output.match(/FAIL/g);

    return {
      suiteName: 'Workspace Tests',
      framework,
      command: `${runnerCmd} ${runnerArgs.join(' ')}`.trim(),
      cwd: root,
      exitCode: execRes.exitCode,
      stdout: execRes.stdout,
      stderr: execRes.stderr,
      total: (passMatches?.length || 0) + (failMatches?.length || 0),
      passed: passMatches ? (passMatches[1] ? parseInt(passMatches[1], 10) : passMatches.length) : (execRes.success ? 1 : 0),
      failed: failMatches ? (failMatches[1] ? parseInt(failMatches[1], 10) : failMatches.length) : (execRes.success ? 0 : 1),
      skipped: 0,
      output,
      durationMs: execRes.durationMs,
      success: execRes.success,
    };
  }
}
