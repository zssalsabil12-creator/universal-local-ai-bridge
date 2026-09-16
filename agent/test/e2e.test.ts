import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { LocalAgentServer } from '../src/LocalAgentServer';
import { WebAgentClient } from '../src/WebAgentClient';
import { AuditLogEntry, ProposedChange, TestResult } from '../src/types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     Reason: ${detail}`);
    throw new Error(`Assertion failed: ${testName} - ${detail || ''}`);
  }
}

async function runE2EAcceptanceSuite() {
  console.log('\n====================================================');
  console.log('  ULAB V1 END-TO-END SYSTEM ACCEPTANCE TEST SUITE   ');
  console.log('====================================================\n');

  // Setup Isolated Temporary Directories
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ulab-e2e-ws-'));
  const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ulab-e2e-outside-'));
  const outsideFile = path.join(outsideRoot, 'outside-secret.txt');
  fs.writeFileSync(outsideFile, 'CRITICAL_OUTSIDE_SECRET_KEY=9876543210', 'utf-8');

  const wsB = fs.mkdtempSync(path.join(os.tmpdir(), 'ulab-e2e-wsb-'));
  fs.writeFileSync(path.join(wsB, 'b-file.txt'), 'Workspace B content', 'utf-8');

  // Populate Test Workspace Files (Requirement #1)
  fs.mkdirSync(path.join(tmpRoot, 'src'), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, 'node_modules', 'dummy-pkg'), { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, '.git'), { recursive: true });

  fs.writeFileSync(
    path.join(tmpRoot, 'package.json'),
    JSON.stringify(
      {
        name: 'test-workspace-app',
        version: '1.0.0',
        scripts: {
          test: 'node tests/sample.test.js',
        },
      },
      null,
      2
    ),
    'utf-8'
  );

  fs.writeFileSync(path.join(tmpRoot, 'src', 'test-file.txt'), 'Initial test file for deletion check.\n', 'utf-8');

  const initialAppTs = `export function calculate(a: number, b: number): number {\n  return a + b;\n}\n`;
  fs.writeFileSync(path.join(tmpRoot, 'src', 'app.ts'), initialAppTs, 'utf-8');

  const sampleTestJs = `console.log("Running sample.test.js");\nconsole.log("PASS: 1 passed, 0 failed");\nprocess.exit(0);\n`;
  fs.writeFileSync(path.join(tmpRoot, 'tests', 'sample.test.js'), sampleTestJs, 'utf-8');

  // Plant sensitive files to verify Context exclusion & Secret Protection
  fs.writeFileSync(path.join(tmpRoot, '.env'), 'DATABASE_PASSWORD=supersecret_pass_123\n', 'utf-8');
  fs.writeFileSync(path.join(tmpRoot, 'credentials.json'), '{"client_secret": "sensitive-oauth-secret"}', 'utf-8');
  fs.writeFileSync(path.join(tmpRoot, 'secrets.yaml'), 'api_key: sk-live-secret-key-xyz\n', 'utf-8');
  fs.writeFileSync(path.join(tmpRoot, 'id_rsa'), '-----BEGIN RSA PRIVATE KEY-----\nMIIE...', 'utf-8');
  fs.writeFileSync(path.join(tmpRoot, 'node_modules', 'dummy-pkg', 'index.js'), 'module.exports = {};', 'utf-8');
  fs.writeFileSync(path.join(tmpRoot, '.git', 'HEAD'), 'ref: refs/heads/main\n', 'utf-8');

  // Start Real LocalAgentServer
  const port = 24890 + Math.floor(Math.random() * 200);
  const serverToken = crypto.randomBytes(16).toString('hex');
  const agentServer = new LocalAgentServer({
    port,
    token: serverToken,
  });
  await agentServer.start();

  // Create Web Client connecting over real WebSocket
  const webClient = new WebAgentClient({
    url: `ws://127.0.0.1:${port}`,
    token: serverToken,
    defaultTimeoutMs: 10000,
  });

  try {
    // ========================================================
    // 1. Web ↔ Agent Connection
    // ========================================================
    console.log('--- [1. Web ↔ Agent Secure Connection] ---');
    await webClient.connect();
    assert(webClient.getStatus() === 'connected', 'Web Client establishes authenticated WebSocket link');

    // ========================================================
    // 2. Workspace Initialization (Requirement #2)
    // ========================================================
    console.log('--- [2. Workspace Initialization & Session Verification] ---');
    const selectRes = await webClient.selectWorkspace(tmpRoot);
    assert(selectRes.success, 'Select workspace successfully returns response');
    const session = selectRes.data!;
    assert(Boolean(session.workspaceId), 'Session contains valid workspaceId');
    assert(Boolean(session.sessionId), 'Session contains unique sessionId');
    assert(session.workspaceRoot === tmpRoot, 'Session strictly binds to target workspaceRoot');
    assert(session.permissions.read && session.permissions.write && session.permissions.delete, 'Session grants explicit scoped permissions');

    const sessionQuery = await webClient.sendRequest('workspace.session');
    assert(sessionQuery.success && sessionQuery.data?.sessionId === session.sessionId, 'Agent recognizes selected directory as sole active workspace');

    // ========================================================
    // 3. File Read Acceptance (Requirement #3)
    // ========================================================
    console.log('--- [3. File Read Acceptance & Boundary Enforcement] ---');
    const listRes = await webClient.sendRequest('files.list', { path: '.' });
    assert(listRes.success, 'List files inside workspace succeeds');
    const files = listRes.data as Array<{ relativePath: string }>;
    assert(files.some((f) => f.relativePath.includes('app.ts')), 'Files list contains src/app.ts');

    const readValid = await webClient.sendRequest('files.read', { path: 'src/test-file.txt' });
    assert(readValid.success && readValid.data.content.includes('Initial test file'), 'Read file inside workspace returns content');

    // Reject reading outside workspace files
    const readAbsOutside = await webClient.sendRequest('files.read', { path: outsideFile });
    assert(!readAbsOutside.success && readAbsOutside.error?.code === 'ACCESS_DENIED', 'Reject reading absolute path outside workspace with ACCESS_DENIED');

    const readTraversal = await webClient.sendRequest('files.read', { path: '../outside-secret.txt' });
    assert(!readTraversal.success && readTraversal.error?.code === 'ACCESS_DENIED', 'Reject reading relative ../ path with ACCESS_DENIED');

    const readEncoded = await webClient.sendRequest('files.read', { path: '%2e%2e/outside-secret.txt' });
    assert(!readEncoded.success && readEncoded.error?.code === 'ACCESS_DENIED', 'Reject reading encoded traversal %2e%2e/ with ACCESS_DENIED');

    const readSensitive = await webClient.sendRequest('files.read', { path: '.env' });
    assert(!readSensitive.success && readSensitive.error?.code === 'ACCESS_DENIED', 'Reject reading sensitive .env file with ACCESS_DENIED');

    // ========================================================
    // 4. Write Proposal & Diff Generation (Requirement #4)
    // ========================================================
    console.log('--- [4. Write Proposal & Unified Diff] ---');
    const proposedChangeContent = `export function calculate(a: number, b: number): number {\n  return a * b; // modified\n}\n`;
    const propRes = await webClient.sendRequest('files.propose', {
      path: 'src/app.ts',
      content: proposedChangeContent,
      reason: 'Optimize calculation to product',
    });

    assert(propRes.success, 'Propose change succeeds');
    const proposal1: ProposedChange = propRes.data;
    assert(proposal1.status === 'pending', 'Proposal status is strictly pending');
    assert(proposal1.requiresApproval === true, 'Proposal requires explicit user approval');
    assert(Boolean(proposal1.diff) && proposal1.diff!.includes('+   return a * b; // modified'), 'Unified diff accurately captures code changes');

    const blockedApply = await webClient.sendRequest('files.write', {
      changeId: proposal1.changeId,
      approved: true,
    });
    assert(!blockedApply.success && blockedApply.error?.code === 'EXECUTION_FAILED', 'Pending proposal cannot be applied before explicit approval');

    // Verify disk content unchanged prior to approval
    const onDisk1 = fs.readFileSync(path.join(tmpRoot, 'src', 'app.ts'), 'utf-8');
    assert(onDisk1 === initialAppTs, 'Original file on disk remains UNCHANGED before approval');

    // ========================================================
    // 5. Reject Flow (Requirement #5)
    // ========================================================
    console.log('--- [5. Proposal Rejection Flow] ---');
    const rejectRes = await webClient.sendRequest('files.reject', { changeId: proposal1.changeId });
    assert(rejectRes.success, 'Reject proposal command succeeds');
    assert(rejectRes.data.status === 'rejected', 'Proposal status is marked rejected');

    const onDiskAfterReject = fs.readFileSync(path.join(tmpRoot, 'src', 'app.ts'), 'utf-8');
    assert(onDiskAfterReject === initialAppTs, 'File on disk remains completely untouched after rejection');

    // ========================================================
    // 6. Approve Flow (Requirement #6)
    // ========================================================
    console.log('--- [6. Proposal Approval & Application Flow] ---');
    const approvedContent = `export function calculate(a: number, b: number): number {\n  return (a + b) * 2;\n}\n`;
    const propRes2 = await webClient.sendRequest('files.propose', {
      path: 'src/app.ts',
      content: approvedContent,
      reason: 'Implement doubled sum formula',
    });
    const proposal2: ProposedChange = propRes2.data;
    assert(proposal2.status === 'pending', 'Second proposal starts pending');

    const approveRes = await webClient.sendRequest('files.approve', {
      changeId: proposal2.changeId,
    });
    assert(approveRes.success, 'Explicit proposal approval succeeds');
    assert(approveRes.data.status === 'approved', 'Proposal is approved before application');

    // Apply only after explicit approval
    const applyRes = await webClient.sendRequest('files.write', {
      changeId: proposal2.changeId,
      approved: true,
    });
    assert(applyRes.success, 'Apply approved change succeeds');

    const onDiskAfterApprove = fs.readFileSync(path.join(tmpRoot, 'src', 'app.ts'), 'utf-8');
    assert(onDiskAfterApprove === approvedContent, 'File on disk updated EXACTLY to approved content');

    // Check proposal state
    const proposalsList = await webClient.sendRequest('files.proposals');
    const updatedProp2 = (proposalsList.data as ProposedChange[]).find((p) => p.changeId === proposal2.changeId);
    assert(updatedProp2?.status === 'applied', 'Proposal status updated to applied');

    // ========================================================
    // 7. Delete Protection & Approval (Requirement #7)
    // ========================================================
    console.log('--- [7. File Deletion Approval & Protection] ---');
    // Attempt delete without approval
    const unapprovedDel = await webClient.sendRequest('files.delete', {
      path: 'src/test-file.txt',
      approved: false,
    });
    assert(!unapprovedDel.success && unapprovedDel.error?.code === 'APPROVAL_REQUIRED', 'Reject file deletion without approval with APPROVAL_REQUIRED');
    assert(fs.existsSync(path.join(tmpRoot, 'src', 'test-file.txt')), 'File still exists on disk after unapproved delete attempt');

    // Approved delete
    const approvedDel = await webClient.sendRequest('files.delete', {
      path: 'src/test-file.txt',
      approved: true,
    });
    assert(approvedDel.success, 'File deletion with approved: true succeeds');
    assert(!fs.existsSync(path.join(tmpRoot, 'src', 'test-file.txt')), 'File is deleted from disk after approval');

    // Attempt delete outside workspace even with approved: true
    const outsideDel = await webClient.sendRequest('files.delete', {
      path: outsideFile,
      approved: true,
    });
    assert(!outsideDel.success && outsideDel.error?.code === 'ACCESS_DENIED', 'Reject deleting outside workspace file even if approved: true');
    assert(fs.existsSync(outsideFile), 'Outside file remains untouched and protected');

    // ========================================================
    // 8. Terminal End-to-End & Escapes (Requirement #8)
    // ========================================================
    console.log('--- [8. Terminal Sandbox & Escape Prevention] ---');
    // Safe command with process cwd verification
    const cwdVerify = await webClient.sendRequest('terminal.execute', {
      command: 'node',
      args: ['-e', '"console.log(process.cwd())"'],
      approved: true,
    });
    assert(cwdVerify.success, 'Terminal executes approved node command');
    const actualCwd = cwdVerify.data.stdout.trim();
    const expectedCwd = fs.realpathSync(tmpRoot);
    assert(actualCwd === tmpRoot || actualCwd === expectedCwd, 'Process execution strictly isolated with cwd = workspaceRoot');

    // Test Escapes
    const esc1 = await webClient.sendRequest('terminal.execute', { command: 'cd ..' });
    assert(!esc1.success && esc1.error?.code === 'COMMAND_REJECTED', 'Block cd .. command escape');

    const esc2 = await webClient.sendRequest('terminal.execute', { command: 'cd ../..' });
    assert(!esc2.success && esc2.error?.code === 'COMMAND_REJECTED', 'Block cd ../.. command escape');

    const esc3 = await webClient.sendRequest('terminal.execute', { command: 'cat ../outside-secret.txt' });
    assert(!esc3.success && esc3.error?.code === 'COMMAND_REJECTED', 'Block parent directory traversal in command arguments');

    const esc4 = await webClient.sendRequest('terminal.execute', { command: '/bin/cat /etc/passwd' });
    assert(!esc4.success && esc4.error?.code === 'COMMAND_REJECTED', 'Block absolute system binary path execution');

    const esc5 = await webClient.sendRequest('terminal.execute', { command: 'npm test; whoami' });
    assert(!esc5.success && esc5.error?.code === 'COMMAND_REJECTED', 'Block command chaining operator (;)');

    const esc6 = await webClient.sendRequest('terminal.execute', { command: 'echo pwned > pwn.txt' });
    assert(!esc6.success && esc6.error?.code === 'COMMAND_REJECTED', 'Block shell I/O redirection operator (>)');

    const esc7 = await webClient.sendRequest('terminal.execute', { command: 'node -e "console.log($(whoami))"' });
    assert(!esc7.success && esc7.error?.code === 'COMMAND_REJECTED', 'Block shell expansion $(...)');

    // ========================================================
    // 9. Test Runner (Requirement #9)
    // ========================================================
    console.log('--- [9. Test Runner Execution & Result Schema] ---');
    const testExec = await webClient.sendRequest('testing.run');
    assert(testExec.success, 'Test runner executes successfully');
    const tResult: TestResult = testExec.data;
    assert(Boolean(tResult.command) && tResult.command!.includes('npm test'), 'Test runner identifies npm test command');
    assert(Boolean(tResult.cwd) && tResult.cwd === tmpRoot, 'Test runner binds cwd to workspace root');
    assert(tResult.exitCode === 0, 'Test runner returns exitCode 0');
    assert(typeof tResult.stdout === 'string' && tResult.stdout.includes('sample.test.js'), 'Test runner captures stdout accurately');
    assert(typeof tResult.stderr === 'string', 'Test runner captures stderr field');
    assert(typeof tResult.durationMs === 'number' && tResult.durationMs >= 0, 'Test runner measures durationMs');
    assert(tResult.success === true, 'Test runner reports success = true');

    // ========================================================
    // 10. Context Builder (Requirement #10)
    // ========================================================
    console.log('--- [10. Context Builder & Exclusion Audit] ---');
    const contextRes = await webClient.sendRequest('context.build', {
      taskDescription: 'Fix calculate function in application',
      files: [
        'src/app.ts',
        '.env',
        'credentials.json',
        'secrets.yaml',
        'id_rsa',
        'node_modules/dummy-pkg/index.js',
        '.git/HEAD',
      ],
    });

    assert(contextRes.success, 'Context build succeeds');
    const ctx = contextRes.data;
    assert(ctx.files.some((f: any) => f.path.includes('app.ts')), 'Context includes legitimate source file src/app.ts');
    assert(!ctx.files.some((f: any) => f.path.includes('.env')), 'Context strictly EXCLUDES .env');
    assert(!ctx.files.some((f: any) => f.path.includes('credentials.json')), 'Context strictly EXCLUDES credentials.json');
    assert(!ctx.files.some((f: any) => f.path.includes('secrets.yaml')), 'Context strictly EXCLUDES secrets.yaml');
    assert(!ctx.files.some((f: any) => f.path.includes('id_rsa')), 'Context strictly EXCLUDES id_rsa SSH keys');
    assert(!ctx.files.some((f: any) => f.path.includes('node_modules')), 'Context strictly EXCLUDES node_modules');
    assert(!ctx.files.some((f: any) => f.path.includes('.git')), 'Context strictly EXCLUDES .git');

    // ========================================================
    // 11. Workspace Switching & Cross-Workspace Isolation (Requirement #12)
    // ========================================================
    console.log('--- [11. Workspace Switching & Invalidation] ---');
    const sessionA_Id = session.sessionId;

    // Switch to Workspace B
    const switchRes = await webClient.selectWorkspace(wsB);
    assert(switchRes.success, 'Switch to workspace B succeeds');
    const sessionB = switchRes.data!;
    assert(sessionB.sessionId !== sessionA_Id, 'Switching workspace invalidates old session and issues new sessionId');

    // Request using stale Session A must be rejected
    const staleReq = await webClient.sendRequest('files.list', { path: '.' }, sessionA_Id);
    assert(!staleReq.success && staleReq.error?.code === 'SESSION_STALE', 'Requests using former sessionId rejected with SESSION_STALE');

    // Session A cannot access either Workspace A or B
    const staleRead = await webClient.sendRequest('files.read', { path: 'src/app.ts' }, sessionA_Id);
    assert(!staleRead.success && staleRead.error?.code === 'SESSION_STALE', 'Stale session cannot read files from any workspace');

    // Switch back to Workspace A for subsequent tests
    const restoreA = await webClient.selectWorkspace(tmpRoot);
    assert(restoreA.success, 'Restored workspace A');

    // ========================================================
    // 12. Mock AI-Simulation Workflow (Requirement #13)
    // ========================================================
    console.log('--- [12. AI-Simulation Workflow via Protocol] ---');
    // Mock AI Client simulating: Read -> Propose -> Wait Approval -> Apply -> Test -> Propose Next
    // IMPORTANT: AI never touches `fs` directly!

    // Step 1: AI Reads file
    const aiRead = await webClient.sendRequest('files.read', { path: 'src/app.ts' });
    assert(aiRead.success, 'Mock AI reads file via ULAB protocol');
    const originalAiCode = aiRead.data.content;

    // Step 2: AI Proposes fix
    const aiProposalContent = originalAiCode.replace('return (a + b) * 2;', 'return (a + b) * 3;');
    const aiProp = await webClient.sendRequest('files.propose', {
      path: 'src/app.ts',
      content: aiProposalContent,
      reason: 'AI proposes 3x multiplier fix',
    });
    assert(aiProp.success && aiProp.data.status === 'pending', 'Mock AI receives pending change proposal with unified diff');

    // Step 3: Human User explicitly approves, then applies
    const userApprove = await webClient.sendRequest('files.approve', {
      changeId: aiProp.data.changeId,
    });
    assert(userApprove.success && userApprove.data.status === 'approved', 'Human approval is recorded before apply');
    const userApply = await webClient.sendRequest('files.write', {
      changeId: aiProp.data.changeId,
      approved: true,
    });
    assert(userApply.success, 'Human approval applies AI proposal through server');

    // Step 4: AI triggers tests
    const aiTest = await webClient.sendRequest('testing.run');
    assert(aiTest.success, 'Mock AI triggers testing.run via protocol');

    // Step 5: AI proposes secondary update
    const aiProp2 = await webClient.sendRequest('files.propose', {
      path: 'src/app.ts',
      content: originalAiCode.replace('return (a + b) * 2;', 'return (a + b) * 4;'),
      reason: 'AI proposes 4x multiplier refinement',
    });
    assert(aiProp2.success, 'Mock AI completes full feedback loop via protocol');

    // ========================================================
    // 13. Structured Errors & Failure Tests (Requirement #14)
    // ========================================================
    console.log('--- [13. Structured Errors & Failure Cases] ---');
    // Malformed RPC (missing action)
    const malformed1 = await webClient.sendRaw({ requestId: 'malformed-1', token: serverToken });
    assert(!malformed1.success && malformed1.error?.code === 'INVALID_REQUEST', 'Malformed RPC without action returns INVALID_REQUEST');

    // Missing requestId
    const malformed2 = await webClient.sendRaw({ action: 'files.list', token: serverToken });
    assert(!malformed2.success && malformed2.error?.code === 'INVALID_REQUEST', 'Request missing requestId returns INVALID_REQUEST');

    // Invalid action
    const invalidAction = await webClient.sendRequest('unknown.action.xyz');
    assert(!invalidAction.success && invalidAction.error?.code === 'INVALID_REQUEST', 'Unknown action returns INVALID_REQUEST');

    // Invalid path (null byte)
    const nullByteReq = await webClient.sendRequest('files.read', { path: 'src/\0app.ts' });
    assert(!nullByteReq.success && (nullByteReq.error?.code === 'INVALID_PATH' || nullByteReq.error?.code === 'ACCESS_DENIED'), 'Null byte path returns INVALID_PATH/ACCESS_DENIED');

    // Missing approval for write
    const missingAppr = await webClient.sendRequest('files.write', { path: 'src/app.ts', content: 'test', approved: false });
    assert(!missingAppr.success && missingAppr.error?.code === 'APPROVAL_REQUIRED', 'Missing approval for write returns APPROVAL_REQUIRED');

    // Command rejected
    const cmdRej = await webClient.sendRequest('terminal.execute', { command: 'sudo rm -rf /' });
    assert(!cmdRej.success && cmdRej.error?.code === 'COMMAND_REJECTED', 'Prohibited command returns COMMAND_REJECTED');

    // Offline agent simulation
    const offlineClient = new WebAgentClient({
      url: 'ws://127.0.0.1:29999', // Non-existent offline port
      token: 'some-token',
    });
    const offlineRes = await offlineClient.sendRequest('files.list');
    assert(!offlineRes.success && offlineRes.error?.code === 'AGENT_OFFLINE', 'Connecting to offline agent returns AGENT_OFFLINE structured error');

    // Invalid token
    const wrongTokenClient = new WebAgentClient({
      url: `ws://127.0.0.1:${port}`,
      token: 'WRONG_INVALID_TOKEN',
    });
    await wrongTokenClient.connect();
    const unauthorizedRes = await wrongTokenClient.sendRequest('files.list');
    assert(!unauthorizedRes.success && unauthorizedRes.error?.code === 'UNAUTHORIZED', 'Invalid token returns UNAUTHORIZED structured error');
    wrongTokenClient.disconnect();

    // ========================================================
    // 14. Audit Log Verification (Requirement #15)
    // ========================================================
    console.log('--- [14. Audit Log Integrity & Secret Redaction] ---');
    const auditRes = await webClient.sendRequest('audit.log');
    assert(auditRes.success, 'Query audit log succeeds');
    const auditEntries: AuditLogEntry[] = auditRes.data;
    assert(auditEntries.length > 5, 'Audit log records critical lifecycle operations');

    // Check entry fields
    const writeLogs = auditEntries.filter((e) => e.operation === 'files.write' && e.approval === 'APPROVED');
    const writeLog = writeLogs.find((e) => e.result === 'SUCCESS');
    assert(Boolean(writeLogs.length), 'Audit log contains approved files.write entry');
    assert(Boolean(writeLog?.timestamp), 'Audit entry includes ISO timestamp');
    assert(Boolean(writeLog?.sessionId), 'Audit entry includes active sessionId');
    assert(writeLog?.result === 'SUCCESS', 'Audit entry includes result SUCCESS');

    const deniedLog = auditEntries.find((e) => e.result === 'DENIED');
    assert(Boolean(deniedLog), 'Audit log records security denials and unapproved attempts');

    // Check no secrets are exposed in audit entries
    const allAuditText = JSON.stringify(auditEntries);
    assert(!allAuditText.includes('supersecret_pass_123'), 'Audit log strictly REDACTS/EXCLUDES environment secrets');
    assert(!allAuditText.includes('sensitive-oauth-secret'), 'Audit log strictly REDACTS/EXCLUDES credentials');
    assert(!allAuditText.includes('CRITICAL_OUTSIDE_SECRET_KEY'), 'Audit log strictly REDACTS/EXCLUDES outside file secrets');

    // Clean disconnect test (Requirement #11)
    webClient.disconnect();
    assert(webClient.getStatus() === 'disconnected', 'Web Client disconnects cleanly without server error');

    console.log('\n====================================================');
    console.log(`  E2E ACCEPTANCE SUMMARY: ${passedTests} passed, ${failedTests} failed`);
    console.log('====================================================\n');
  } finally {
    webClient.disconnect();
    await agentServer.stop();
    // Cleanup temporary directories
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
      fs.rmSync(outsideRoot, { recursive: true, force: true });
      fs.rmSync(wsB, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

runE2EAcceptanceSuite().catch((err) => {
  console.error('\n💥 FATAL E2E TEST RUNNER ERROR:', err);
  process.exit(1);
});
