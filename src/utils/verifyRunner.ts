// Verify Runner - Connects workflow Verify step to local verification
// Handles test, build, typecheck, and lint operations

import { CommandExecutor, ExecutionResult } from './commandExecutor';

export type VerificationType = 'test' | 'build' | 'typecheck' | 'lint';

export interface VerificationResult {
  type: VerificationType;
  status: 'pass' | 'fail' | 'cancelled' | 'timeout' | 'not_configured' | 'blocked';
  command?: string;
  duration?: number;
  output?: string;
  error?: string;
  exitCode?: number;
}

export interface ProjectVerificationConfig {
  test?: { command: string; args: string[] };
  build?: { command: string; args: string[] };
  typecheck?: { command: string; args: string[] };
  lint?: { command: string; args: string[] };
}

export class VerifyRunner {
  private commandExecutor: CommandExecutor;
  private projectRoot: string;
  private config: ProjectVerificationConfig;

  constructor(projectRoot: string, commandExecutor: CommandExecutor) {
    this.projectRoot = projectRoot;
    this.commandExecutor = commandExecutor;
    this.config = this.detectProjectConfig();
  }

  // Detect project configuration
  private detectProjectConfig(): ProjectVerificationConfig {
    const config: ProjectVerificationConfig = {};

    // Detect npm/yarn/pnpm commands
    // In real implementation, this would read package.json
    config.test = { command: 'npm', args: ['test'] };
    config.build = { command: 'npm', args: ['run', 'build'] };
    config.typecheck = { command: 'npm', args: ['run', 'typecheck'] };
    config.lint = { command: 'npm', args: ['run', 'lint'] };

    return config;
  }

  // Check if verification type is configured
  isConfigured(type: VerificationType): boolean {
    return this.config[type] !== undefined;
  }

  // Run verification
  async runVerification(
    type: VerificationType,
    options: { approved?: boolean; timeout?: number } = {}
  ): Promise<VerificationResult> {
    const config = this.config[type];

    if (!config) {
      return {
        type,
        status: 'not_configured',
        error: `${type} is not configured for this project`,
      };
    }

    try {
      const result = await this.commandExecutor.executeCommand(
        config.command,
        config.args,
        options
      );

      if (result.status === 'pending') {
        return {
          type,
          status: 'blocked',
          command: `${config.command} ${config.args.join(' ')}`,
          error: 'Approval required for this operation',
        };
      }

      if (result.status === 'cancelled') {
        return {
          type,
          status: 'cancelled',
          command: `${config.command} ${config.args.join(' ')}`,
          duration: result.duration,
        };
      }

      if (result.status === 'timeout') {
        return {
          type,
          status: 'timeout',
          command: `${config.command} ${config.args.join(' ')}`,
          duration: result.duration,
          error: 'Operation timed out',
        };
      }

      if (result.status === 'failed') {
        return {
          type,
          status: 'fail',
          command: `${config.command} ${config.args.join(' ')}`,
          duration: result.duration,
          output: result.stdout + result.stderr,
          error: result.error,
          exitCode: result.exitCode,
        };
      }

      return {
        type,
        status: 'pass',
        command: `${config.command} ${config.args.join(' ')}`,
        duration: result.duration,
        output: result.stdout,
        exitCode: result.exitCode,
      };
    } catch (error) {
      return {
        type,
        status: 'fail',
        command: `${config.command} ${config.args.join(' ')}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Run tests
  async runTests(options: { approved?: boolean; timeout?: number } = {}): Promise<VerificationResult> {
    return this.runVerification('test', options);
  }

  // Run build
  async runBuild(options: { approved?: boolean; timeout?: number } = {}): Promise<VerificationResult> {
    return this.runVerification('build', options);
  }

  // Run typecheck
  async runTypecheck(options: { approved?: boolean; timeout?: number } = {}): Promise<VerificationResult> {
    return this.runVerification('typecheck', options);
  }

  // Run lint
  async runLint(options: { approved?: boolean; timeout?: number } = {}): Promise<VerificationResult> {
    return this.runVerification('lint', options);
  }

  // Run all verifications
  async runAll(options: { approved?: boolean; timeout?: number } = {}): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];

    for (const type of ['test', 'build', 'typecheck', 'lint'] as VerificationType[]) {
      if (this.isConfigured(type)) {
        const result = await this.runVerification(type, options);
        results.push(result);
      }
    }

    return results;
  }

  // Get available verifications
  getAvailableVerifications(): VerificationType[] {
    const available: VerificationType[] = [];
    
    for (const type of ['test', 'build', 'typecheck', 'lint'] as VerificationType[]) {
      if (this.isConfigured(type)) {
        available.push(type);
      }
    }

    return available;
  }

  // Update configuration
  updateConfig(config: Partial<ProjectVerificationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export factory function
export function createVerifyRunner(projectRoot: string, commandExecutor: CommandExecutor): VerifyRunner {
  return new VerifyRunner(projectRoot, commandExecutor);
}
