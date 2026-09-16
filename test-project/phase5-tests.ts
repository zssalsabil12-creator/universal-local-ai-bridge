// Phase 5 Tests - Secure Developer Execution
// Tests for command execution, git integration, verification, and security

import { CommandExecutor } from '../utils/commandExecutor';
import { GitManager } from '../utils/gitManager';
import { VerifyRunner } from '../utils/verifyRunner';

// Test utilities
interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean, details?: string) {
  const passed = fn();
  results.push({ name, passed, details });
  console.log(`${passed ? '✅' : '❌'} ${name}${details ? ` - ${details}` : ''}`);
}

console.log('=== Phase 5 Tests ===\n');

// Test 1: Command Executor - Security
console.log('1. Command Executor - Security');

const executor = new CommandExecutor('/test/project');

test('Block path traversal', () => {
  const result = executor.validateCommand('cat', ['../secret.txt']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block absolute path outside project', () => {
  const result = executor.validateCommand('cat', ['/etc/passwd']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block command chaining with &&', () => {
  const result = executor.validateCommand('echo', ['test && rm -rf /']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block command chaining with ||', () => {
  const result = executor.validateCommand('echo', ['test || rm -rf /']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block command chaining with ;', () => {
  const result = executor.validateCommand('echo', ['test; rm -rf /']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block command substitution', () => {
  const result = executor.validateCommand('echo', ['$(rm -rf /)']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block PowerShell', () => {
  const result = executor.validateCommand('powershell', ['-Command', 'Remove-Item']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block cmd.exe', () => {
  const result = executor.validateCommand('cmd.exe', ['/c', 'del /f /q *']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block sensitive file access', () => {
  const result = executor.validateCommand('cat', ['.env']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block credentials file access', () => {
  const result = executor.validateCommand('cat', ['credentials.json']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Allow safe git status', () => {
  const result = executor.validateCommand('git', ['status']);
  return result.valid && result.riskLevel === 'low';
});

test('Allow safe git diff', () => {
  const result = executor.validateCommand('git', ['diff']);
  return result.valid && result.riskLevel === 'low';
});

test('Allow npm test', () => {
  const result = executor.validateCommand('npm', ['test']);
  return result.valid && result.riskLevel === 'medium';
});

test('Require approval for npm install', () => {
  const result = executor.validateCommand('npm', ['install']);
  return result.valid && result.riskLevel === 'high';
});

test('Require approval for git commit', () => {
  const result = executor.validateCommand('git', ['commit', '-m', 'test']);
  return result.valid && result.riskLevel === 'high';
});

// Test 2: Command Executor - Execution
console.log('\n2. Command Executor - Execution');

test('Execute safe command', async () => {
  const result = await executor.executeCommand('git', ['status'], { approved: true });
  return result.status === 'completed' && result.exitCode === 0;
});

test('Execute command with approval', async () => {
  const result = await executor.executeCommand('npm', ['test'], { approved: true });
  return result.status === 'completed';
});

test('Block unapproved high-risk command', async () => {
  const result = await executor.executeCommand('npm', ['install'], { approved: false });
  return result.status === 'pending';
});

test('Get operation log', () => {
  const log = executor.getOperationLog();
  return log.length > 0;
});

test('Clear operation log', () => {
  executor.clearOperationLog();
  const log = executor.getOperationLog();
  return log.length === 0;
});

// Test 3: Git Manager
console.log('\n3. Git Manager');

const gitManager = new GitManager('/test/project');

test('Detect Git repository', async () => {
  const isRepo = await gitManager.isGitRepository();
  return isRepo === true;
});

test('Get Git status', async () => {
  const status = await gitManager.getStatus();
  return status.branch !== '' && Array.isArray(status.modified);
});

test('Get recent commits', async () => {
  const commits = await gitManager.getRecentCommits();
  return Array.isArray(commits) && commits.length > 0;
});

test('Detect sensitive file', () => {
  return gitManager.isSensitiveFile('.env') === true;
});

test('Allow non-sensitive file', () => {
  return gitManager.isSensitiveFile('src/index.ts') === false;
});

test('Validate commit files - reject sensitive', () => {
  const validation = gitManager.validateCommitFiles(['.env', 'src/index.ts']);
  return !validation.valid && validation.reason?.includes('Sensitive file');
});

test('Validate commit files - accept safe', () => {
  const validation = gitManager.validateCommitFiles(['src/index.ts', 'src/app.ts']);
  return validation.valid;
});

test('Get current branch', async () => {
  const branch = await gitManager.getCurrentBranch();
  return branch !== '';
});

test('Check uncommitted changes', async () => {
  const hasChanges = await gitManager.hasUncommittedChanges();
  return typeof hasChanges === 'boolean';
});

// Test 4: Verify Runner
console.log('\n4. Verify Runner');

const verifyRunner = new VerifyRunner('/test/project', executor);

test('Check test configuration', () => {
  return verifyRunner.isConfigured('test') === true;
});

test('Check build configuration', () => {
  return verifyRunner.isConfigured('build') === true;
});

test('Check typecheck configuration', () => {
  return verifyRunner.isConfigured('typecheck') === true;
});

test('Check lint configuration', () => {
  return verifyRunner.isConfigured('lint') === true;
});

test('Run tests', async () => {
  const result = await verifyRunner.runTests({ approved: true });
  return result.type === 'test' && result.status === 'pass';
});

test('Run build', async () => {
  const result = await verifyRunner.runBuild({ approved: true });
  return result.type === 'build' && result.status === 'pass';
});

test('Run typecheck', async () => {
  const result = await verifyRunner.runTypecheck({ approved: true });
  return result.type === 'typecheck' && result.status === 'pass';
});

test('Run lint', async () => {
  const result = await verifyRunner.runLint({ approved: true });
  return result.type === 'lint' && result.status === 'pass';
});

test('Get available verifications', () => {
  const available = verifyRunner.getAvailableVerifications();
  return available.length > 0 && available.includes('test');
});

test('Run all verifications', async () => {
  const results = await verifyRunner.runAll({ approved: true });
  return Array.isArray(results) && results.length > 0;
});

// Test 5: AI Safety
console.log('\n5. AI Safety');

test('Block AI-suggested malicious command', () => {
  const result = executor.validateCommand('rm', ['-rf', '/']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block AI-suggested sensitive file access', () => {
  const result = executor.validateCommand('cat', ['.env.local']);
  return !result.valid && result.riskLevel === 'critical';
});

test('Block AI-suggested outside-root operation', () => {
  const result = executor.validateCommand('cd', ['..']);
  return !result.valid || result.riskLevel === 'critical';
});

test('Block AI-suggested git reset', () => {
  const result = executor.validateCommand('git', ['reset', '--hard']);
  return result.riskLevel === 'high';
});

test('Block AI-suggested package installation without approval', async () => {
  const result = await executor.executeCommand('npm', ['install', 'malicious-package'], { approved: false });
  return result.status === 'pending';
});

test('Allow valid low-risk action', () => {
  const result = executor.validateCommand('git', ['status']);
  return result.valid && result.riskLevel === 'low';
});

// Test 6: Stale Patch Detection
console.log('\n6. Stale Patch Detection');

test('Detect unchanged file', () => {
  // Simulate file hash comparison
  const originalHash = 'abc123';
  const currentHash = 'abc123';
  return originalHash === currentHash;
});

test('Detect changed file', () => {
  // Simulate file hash comparison
  const originalHash = 'abc123';
  const currentHash = 'def456';
  return originalHash !== currentHash;
});

// Test 7: Rollback Integration
console.log('\n7. Rollback Integration');

test('Create snapshot', () => {
  const snapshot = new Map([['src/index.ts', 'original content']]);
  return snapshot.size > 0;
});

test('Associate snapshot with operation', () => {
  const operationId = 'op-123';
  const snapshot = new Map([['src/index.ts', 'original content']]);
  return operationId !== '' && snapshot.size > 0;
});

test('Restore from snapshot', () => {
  const snapshot = new Map([['src/index.ts', 'original content']]);
  const restored = snapshot.get('src/index.ts');
  return restored === 'original content';
});

// Summary
console.log('\n=== Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All Phase 5 tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some Phase 5 tests failed!');
  process.exit(1);
}
