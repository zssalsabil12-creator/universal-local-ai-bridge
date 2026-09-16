// Secure Command Execution System
// Provides controlled local command execution with security validation

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

export interface CommandDefinition {
  command: string;
  args?: string[];
  description: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  timeout?: number; // milliseconds
  maxOutputSize?: number; // bytes
}

export interface ExecutionResult {
  id: string;
  command: string;
  args: string[];
  workingDirectory: string;
  status: ExecutionStatus;
  exitCode?: number;
  stdout: string;
  stderr: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  riskLevel: RiskLevel;
  approved: boolean;
  error?: string;
}

export interface ProjectCommand {
  name: string;
  command: string;
  args: string[];
  description: string;
  riskLevel: RiskLevel;
  detected: boolean;
}

// Allowed commands by risk level
const ALLOWED_COMMANDS: Record<RiskLevel, string[]> = {
  low: [
    'git status',
    'git diff',
    'git log',
    'git branch',
    'ls',
    'dir',
    'pwd',
    'echo',
    'cat',
    'type',
  ],
  medium: [
    'npm test',
    'npm run test',
    'npm run lint',
    'npm run typecheck',
    'npm run build',
    'yarn test',
    'yarn run lint',
    'yarn run build',
    'pnpm test',
    'pnpm run lint',
    'pnpm run build',
  ],
  high: [
    'git commit',
    'git checkout',
    'git reset',
    'npm install',
    'yarn install',
    'pnpm install',
  ],
  critical: [
    // Critical commands are blocked by default
  ],
};

// Blocked patterns (security threats)
const BLOCKED_PATTERNS = [
  /\&\&/, // Command chaining
  /\|\|/, // OR operator
  /;/, // Command separator
  /\$\(/, // Command substitution
  /`/, // Backtick execution
  /\|/, // Pipe (potentially dangerous)
  /powershell/i, // PowerShell
  /cmd\.exe/i, // Windows CMD
  /bash -c/i, // Bash command execution
  /sh -c/i, // Shell command execution
  /rm -rf/i, // Dangerous delete
  /format/i, // Format command
  /del \/[fq]/i, // Force delete
];

// Dangerous file patterns
const DANGEROUS_FILE_PATTERNS = [
  /\.env/,
  /\.pem$/,
  /\.key$/,
  /credentials/,
  /secrets?/,
  /id_rsa/,
  /id_ed25519/,
];

export class CommandExecutor {
  private projectRoot: string;
  private operationLog: ExecutionResult[] = [];
  private runningProcesses: Map<string, AbortController> = new Map();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  // Detect available project commands
  async detectProjectCommands(): Promise<ProjectCommand[]> {
    const commands: ProjectCommand[] = [];

    // Try to read package.json
    try {
      const packageJsonPath = `${this.projectRoot}/package.json`;
      // In real implementation, this would read the file
      // For now, return common commands
      commands.push(
        {
          name: 'test',
          command: 'npm',
          args: ['test'],
          description: 'Run project tests',
          riskLevel: 'medium',
          detected: true,
        },
        {
          name: 'build',
          command: 'npm',
          args: ['run', 'build'],
          description: 'Build the project',
          riskLevel: 'medium',
          detected: true,
        },
        {
          name: 'lint',
          command: 'npm',
          args: ['run', 'lint'],
          description: 'Run linter',
          riskLevel: 'medium',
          detected: true,
        },
        {
          name: 'typecheck',
          command: 'npm',
          args: ['run', 'typecheck'],
          description: 'Run TypeScript type checking',
          riskLevel: 'medium',
          detected: true,
        }
      );
    } catch (error) {
      // package.json not found or not accessible
    }

    // Detect Git commands
    commands.push(
      {
        name: 'git-status',
        command: 'git',
        args: ['status'],
        description: 'Show Git status',
        riskLevel: 'low',
        detected: true,
      },
      {
        name: 'git-diff',
        command: 'git',
        args: ['diff'],
        description: 'Show Git diff',
        riskLevel: 'low',
        detected: true,
      },
      {
        name: 'git-log',
        command: 'git',
        args: ['log', '--oneline', '-10'],
        description: 'Show recent commits',
        riskLevel: 'low',
        detected: true,
      }
    );

    return commands;
  }

  // Validate command before execution
  validateCommand(command: string, args: string[]): { valid: boolean; reason?: string; riskLevel: RiskLevel } {
    const fullCommand = `${command} ${args.join(' ')}`.trim();

    // Check for blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(fullCommand)) {
        return {
          valid: false,
          reason: `Blocked pattern detected: ${pattern}`,
          riskLevel: 'critical',
        };
      }
    }

    // Check for dangerous file access
    for (const pattern of DANGEROUS_FILE_PATTERNS) {
      if (pattern.test(fullCommand)) {
        return {
          valid: false,
          reason: `Access to sensitive file blocked: ${pattern}`,
          riskLevel: 'critical',
        };
      }
    }

    // Check if command is in allowed list
    for (const [riskLevel, commands] of Object.entries(ALLOWED_COMMANDS)) {
      for (const allowedCmd of commands) {
        if (fullCommand.startsWith(allowedCmd)) {
          return {
            valid: true,
            riskLevel: riskLevel as RiskLevel,
          };
        }
      }
    }

    // Unknown command - treat as high risk
    return {
      valid: false,
      reason: 'Command not in allowed list',
      riskLevel: 'high',
    };
  }

  // Execute command (simulated for browser environment)
  async executeCommand(
    command: string,
    args: string[],
    options: {
      approved?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ExecutionResult> {
    const id = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const validation = this.validateCommand(command, args);
    
    if (!validation.valid) {
      return {
        id,
        command,
        args,
        workingDirectory: this.projectRoot,
        status: 'failed',
        stdout: '',
        stderr: validation.reason || 'Command validation failed',
        startTime,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        riskLevel: validation.riskLevel,
        approved: false,
        error: validation.reason,
      };
    }

    // Check approval requirement
    const requiresApproval = validation.riskLevel === 'high' || validation.riskLevel === 'critical';
    if (requiresApproval && !options.approved) {
      return {
        id,
        command,
        args,
        workingDirectory: this.projectRoot,
        status: 'pending',
        stdout: '',
        stderr: '',
        startTime,
        riskLevel: validation.riskLevel,
        approved: false,
      };
    }

    // Simulate execution (in real implementation, this would use Local Agent)
    const result: ExecutionResult = {
      id,
      command,
      args,
      workingDirectory: this.projectRoot,
      status: 'running',
      stdout: '',
      stderr: '',
      startTime,
      riskLevel: validation.riskLevel,
      approved: options.approved || false,
    };

    // Simulate command execution
    try {
      // Simulate different commands
      if (command === 'git' && args[0] === 'status') {
        result.stdout = 'On branch main\nnothing to commit, working tree clean';
        result.exitCode = 0;
      } else if (command === 'npm' && args[0] === 'test') {
        result.stdout = 'PASS  src/test.ts\nTests: 5 passed, 5 total';
        result.exitCode = 0;
      } else if (command === 'npm' && args.includes('build')) {
        result.stdout = 'Build completed successfully';
        result.exitCode = 0;
      } else {
        result.stdout = `Executed: ${command} ${args.join(' ')}`;
        result.exitCode = 0;
      }

      result.status = 'completed';
    } catch (error) {
      result.status = 'failed';
      result.stderr = error instanceof Error ? error.message : 'Unknown error';
      result.exitCode = 1;
    }

    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;

    // Log the operation
    this.operationLog.push(result);

    return result;
  }

  // Cancel running process
  cancelProcess(id: string): boolean {
    const controller = this.runningProcesses.get(id);
    if (controller) {
      controller.abort();
      this.runningProcesses.delete(id);
      return true;
    }
    return false;
  }

  // Get operation log
  getOperationLog(): ExecutionResult[] {
    return [...this.operationLog];
  }

  // Clear operation log
  clearOperationLog(): void {
    this.operationLog = [];
  }

  // Get command risk level
  getCommandRiskLevel(command: string, args: string[]): RiskLevel {
    const validation = this.validateCommand(command, args);
    return validation.riskLevel;
  }

  // Check if command requires approval
  requiresApproval(command: string, args: string[]): boolean {
    const riskLevel = this.getCommandRiskLevel(command, args);
    return riskLevel === 'high' || riskLevel === 'critical';
  }
}

// Export singleton instance
export const commandExecutor = new CommandExecutor('.');
