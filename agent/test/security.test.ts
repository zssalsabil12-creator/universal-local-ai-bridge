import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { PathGuard } from '../src/PathGuard';
import { WorkspaceManager } from '../src/WorkspaceManager';
import { TerminalSecurityManager } from '../src/TerminalSecurity';
import { ContextBuilder } from '../src/ContextBuilder';
import { LocalAgentServer } from '../src/LocalAgentServer';

/**
 * ULAB Comprehensive Security Verification & Attack Suite
 * Tests all required attack vectors and security boundaries:
 * - Traversal: ../, %2e%2e, encoded, double-encoded, mixed separators
 * - OS Boundaries: absolute Windows paths, drive switching, POSIX absolute paths
 * - Reparse/Links: Symlinks, junctions, dangling symlinks, nonexistent parents
 * - Terminal: cd .., cwd isolation, command chaining (&&, ;, ||, |, $(), ``, >, <, \n, \0)
 * - Secret Protection: .env, .env.*, credentials.*, secrets.*, *.pem, *.key, SSH, cloud credentials
 * - Protocol & Server: Token auth, requestId validation, session invalidation, origin, malformed RPC, rate limiting
 * - Server-side Authorization: Unauthorized write/delete/execute without approved: true
 */
async function runComprehensiveSecurityAudit() {
  console.log('====================================================');
  console.log('  ULAB COMPREHENSIVE SECURITY VERIFICATION & AUDIT  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // Create isolated temporary workspaces
  const tmpRoot = path.join(os.tmpdir(), `ulab-audit-ws-${Date.now()}`);
  const outsideTmp = path.join(os.tmpdir(), `ulab-audit-outside-${Date.now()}`);
  const secondWs = path.join(os.tmpdir(), `ulab-audit-ws2-${Date.now()}`);

  fs.mkdirSync(tmpRoot, { recursive: true });
  fs.mkdirSync(outsideTmp, { recursive: true });
  fs.mkdirSync(secondWs, { recursive: true });

  const insideFile = path.join(tmpRoot, 'src', 'App.tsx');
  fs.mkdirSync(path.dirname(insideFile), { recursive: true });
  fs.writeFileSync(insideFile, 'export default function App() { return <div>ULAB App</div>; }');

  const outsideSecretFile = path.join(outsideTmp, 'system_secret.txt');
  fs.writeFileSync(outsideSecretFile, 'CRITICAL_OUTSIDE_SECRET_KEY');

  // Create dummy secrets inside workspace to verify protection
  fs.writeFileSync(path.join(tmpRoot, '.env'), 'API_SECRET=12345');
  fs.writeFileSync(path.join(tmpRoot, '.env.local'), 'LOCAL_SECRET=abcde');
  fs.writeFileSync(path.join(tmpRoot, 'credentials.json'), '{"service_key":"xyz"}');
  fs.writeFileSync(path.join(tmpRoot, 'secrets.yaml'), 'db_pass: supersecret');
  fs.writeFileSync(path.join(tmpRoot, 'server.pem'), '-----BEGIN CERTIFICATE-----');
  fs.writeFileSync(path.join(tmpRoot, 'private.key'), '-----BEGIN PRIVATE KEY-----');
  fs.writeFileSync(path.join(tmpRoot, 'id_rsa'), 'OPENSSH PRIVATE KEY');
  fs.writeFileSync(path.join(tmpRoot, 'service-account-prod.json'), '{"client_email":"test@gcp"}');

  const sshDir = path.join(tmpRoot, '.ssh');
  fs.mkdirSync(sshDir, { recursive: true });
  fs.writeFileSync(path.join(sshDir, 'id_ed25519'), 'SSH_KEY_CONTENT');

  const awsDir = path.join(tmpRoot, '.aws');
  fs.mkdirSync(awsDir, { recursive: true });
  fs.writeFileSync(path.join(awsDir, 'credentials'), '[default]\naws_access_key_id=AKIA');

  try {
    const guard = new PathGuard(tmpRoot);
    const wsManager = new WorkspaceManager(tmpRoot);
    const terminal = new TerminalSecurityManager(guard);
    const ctxBuilder = new ContextBuilder(wsManager);

    // ==========================================
    // 1. PATH TRAVERSAL & ESCAPE ATTACKS
    // ==========================================
    console.log('--- [1. Path Traversal & Escape Attacks] ---');

    // Basic ../
    const t1 = guard.validate('../outside.txt');
    assert(!t1.allowed && t1.error?.code === 'ACCESS_DENIED', 'Block ../ traversal outside workspace');

    // Deep ../../../
    const t2 = guard.validate('../../../../../../../etc/passwd');
    assert(!t2.allowed && t2.error?.code === 'ACCESS_DENIED', 'Block deep ../../../ traversal');

    // Encoded traversal: %2e%2e%2f
    const t3 = guard.validate('%2e%2e%2foutside.txt');
    assert(!t3.allowed && t3.error?.code === 'ACCESS_DENIED', 'Block single URL-encoded traversal (%2e%2e%2f)');

    // Mixed encoded: %2e%2e/
    const t4 = guard.validate('%2e%2e/outside.txt');
    assert(!t4.allowed && t4.error?.code === 'ACCESS_DENIED', 'Block mixed encoded traversal (%2e%2e/)');

    // Double encoded traversal: %252e%252e%252f
    const t5 = guard.validate('%252e%252e%252foutside.txt');
    assert(!t5.allowed && t5.error?.code === 'ACCESS_DENIED', 'Block double URL-encoded traversal (%252e%252e%252f)');

    // Mixed separators: src/..\..\outside.txt
    const t6 = guard.validate('src/..\\..\\outside.txt');
    assert(!t6.allowed && t6.error?.code === 'ACCESS_DENIED', 'Block mixed separator traversal (src/..\\..\\)');

    // Redundant slashes and dots: foo//..//..//bar
    const t7 = guard.validate('foo//..//..//outside.txt');
    assert(!t7.allowed && t7.error?.code === 'ACCESS_DENIED', 'Block redundant slash traversal (foo//..//..//)');

    // Null byte injection
    const t8 = guard.validate('src/App.tsx\0/../../secret');
    assert(!t8.allowed && t8.error?.code === 'INVALID_PATH', 'Block null byte injection in path');

    // Percent-encoded null byte: %00
    const t9 = guard.validate('src/App.tsx%00../../secret');
    assert(!t9.allowed && t9.error?.code === 'INVALID_PATH', 'Block percent-encoded null byte (%00)');

    // ==========================================
    // 2. OS ABSOLUTE PATHS & DRIVE SWITCHING
    // ==========================================
    console.log('\n--- [2. OS Absolute Paths & Drive Boundaries] ---');

    // Arbitrary POSIX OS absolute path (/etc/passwd)
    const os1 = guard.validate('/etc/passwd');
    assert(!os1.allowed && os1.error?.code === 'ACCESS_DENIED', 'Block arbitrary POSIX absolute path (/etc/passwd)');

    // Arbitrary Windows path outside workspace
    const os2 = guard.validate('C:\\Windows\\System32\\cmd.exe');
    assert(!os2.allowed && os2.error?.code === 'ACCESS_DENIED', 'Block absolute Windows path outside workspace (C:\\Windows)');

    // Drive switching attempt: D:\data
    const os3 = guard.validate('D:\\secrets\\database.kdbx');
    assert(!os3.allowed && os3.error?.code === 'ACCESS_DENIED', 'Block drive switching attempt (D:\\...)');

    // Direct absolute path to outside file created in tmp
    const os4 = guard.validate(outsideSecretFile);
    assert(!os4.allowed && os4.error?.code === 'ACCESS_DENIED', 'Block real filesystem absolute path outside workspace');

    // Case variation on valid file
    const os5 = guard.validate('src/app.tsx');
    // Relative path should resolve safely within workspace
    assert(os5.allowed === true || os5.error?.code === undefined, 'Handle case variation within workspace without crashing');

    // ==========================================
    // 3. SYMLINKS, JUNCTIONS & REPARSE POINTS
    // ==========================================
    console.log('\n--- [3. Symlinks, Junctions & Reparse Points] ---');

    // Symlink file pointing outside
    let symlinkTested = false;
    try {
      const symlinkFile = path.join(tmpRoot, 'link-to-outside.txt');
      fs.symlinkSync(outsideSecretFile, symlinkFile);
      const sym1 = guard.validate('link-to-outside.txt');
      assert(!sym1.allowed && sym1.error?.code === 'ACCESS_DENIED', 'Block symlink file pointing outside workspace');
      symlinkTested = true;
    } catch {
      console.log('  ℹ️ Note: File symlink creation not permitted in this runtime environment');
      skipped++;
    }

    // Directory symlink (Junction equivalent on POSIX/Linux)
    try {
      const symlinkDir = path.join(tmpRoot, 'outside-dir-link');
      fs.symlinkSync(outsideTmp, symlinkDir, 'dir');
      const sym2 = guard.validate('outside-dir-link/system_secret.txt');
      assert(!sym2.allowed && sym2.error?.code === 'ACCESS_DENIED', 'Block directory symlink/junction escaping workspace');
    } catch {
      console.log('  ℹ️ Note: Directory symlink creation not permitted in this runtime environment');
      skipped++;
    }

    // Dangling symlink pointing to non-existent outside location
    try {
      const danglingLink = path.join(tmpRoot, 'dangling-link');
      fs.symlinkSync(path.join(outsideTmp, 'nonexistent-secret.key'), danglingLink);
      const sym3 = guard.validate('dangling-link', { forWrite: true });
      assert(!sym3.allowed && sym3.error?.code === 'ACCESS_DENIED', 'Block dangling symlink pointing outside workspace');
    } catch {
      skipped++;
    }

    // Nonexistent parent path check for write operation
    const nonExistParent = guard.validate('deep/nested/sub/folder/file.txt', { forWrite: true });
    assert(nonExistParent.allowed === true, 'Allow valid non-existent nested path within workspace for writing');

    // ==========================================
    // 4. SECRET FILE PROTECTION & CONTEXT EXCLUSION
    // ==========================================
    console.log('\n--- [4. Secret Protection & Context Exclusion] ---');

    const secretsToTest = [
      '.env',
      '.env.local',
      'credentials.json',
      'secrets.yaml',
      'server.pem',
      'private.key',
      'id_rsa',
      'service-account-prod.json',
      '.ssh/id_ed25519',
      '.aws/credentials',
    ];

    for (const sec of secretsToTest) {
      const secCheck = guard.validate(sec);
      assert(!secCheck.allowed && secCheck.error?.code === 'ACCESS_DENIED', `Block access to secret file: ${sec}`);
    }

    // ContextBuilder exclusion test: ensure no secrets enter Context
    const builtContext = await ctxBuilder.buildContext({
      explicitFiles: [
        'src/App.tsx',
        '.env',
        '.env.local',
        'credentials.json',
        'secrets.yaml',
        'id_rsa',
        'server.pem',
        'private.key',
        'service-account-prod.json',
      ],
    });

    const contextFilePaths = builtContext.files.map((f) => f.path);
    assert(contextFilePaths.includes('src/App.tsx'), 'Context includes valid non-secret file');
    assert(!contextFilePaths.some((p) => p.includes('.env')), 'ContextBuilder strictly excludes .env files');
    assert(!contextFilePaths.some((p) => p.includes('credentials')), 'ContextBuilder strictly excludes credentials');
    assert(!contextFilePaths.some((p) => p.includes('secrets')), 'ContextBuilder strictly excludes secrets');
    assert(!contextFilePaths.some((p) => p.includes('id_rsa')), 'ContextBuilder strictly excludes SSH keys');
    assert(builtContext.excludedSecrets.length >= 7, 'ContextBuilder logs excluded secret files accurately');

    // ==========================================
    // 5. TERMINAL SANDBOX & COMMAND INJECTION
    // ==========================================
    console.log('\n--- [5. Terminal Sandbox & Command Injection] ---');

    // Safe command evaluation
    const safeCheck = terminal.evaluateCommand('npm test');
    assert(safeCheck.allowed === true && safeCheck.requiresApproval === false, 'npm test is allowed automatically');

    // Command chaining attacks
    const c1 = terminal.evaluateCommand('npm test ; cat /etc/passwd');
    assert(!c1.allowed, 'Block command chaining with semicolon (;)');

    const c2 = terminal.evaluateCommand('npm test && whoami');
    assert(!c2.allowed, 'Block command chaining with logical AND (&&)');

    const c3 = terminal.evaluateCommand('npm test || id');
    assert(!c3.allowed, 'Block command chaining with logical OR (||)');

    const c4 = terminal.evaluateCommand('npm test | sh');
    assert(!c4.allowed, 'Block command pipeline operator (|)');

    const c5 = terminal.evaluateCommand('npm test $(whoami)');
    assert(!c5.allowed, 'Block shell expansion command injection $()');

    const c6 = terminal.evaluateCommand('npm test `id`');
    assert(!c6.allowed, 'Block backtick command substitution (``)');

    const c7 = terminal.evaluateCommand('npm test > /tmp/hacked');
    assert(!c7.allowed, 'Block output redirection (>)');

    const c8 = terminal.evaluateCommand('npm test\nwhoami');
    assert(!c8.allowed, 'Block newline command injection (\\n)');

    const c9 = terminal.evaluateCommand('npm test\0whoami');
    assert(!c9.allowed, 'Block null byte command injection (\\0)');

    // Directory changing escape attempt
    const c10 = terminal.evaluateCommand('cd ..');
    assert(!c10.allowed, 'Block directory switching command (cd ..)');

    const c11 = terminal.evaluateCommand('cd /tmp');
    assert(!c11.allowed, 'Block absolute directory switching (cd /tmp)');

    // Privilege escalation attempts
    const c12 = terminal.evaluateCommand('sudo cat /etc/shadow');
    assert(!c12.allowed, 'Block privilege escalation (sudo)');

    // Destructive commands
    const c13 = terminal.evaluateCommand('format c:');
    assert(!c13.allowed, 'Block destructive disk format command');

    // Unapproved arbitrary command requiring user approval
    const c14 = terminal.evaluateCommand('node build-script.js');
    assert(c14.allowed === true && c14.requiresApproval === true, 'Non-whitelisted commands require explicit approval');

    // Prove practical cwd isolation: process runs strictly inside workspace
    const cwdExec = await terminal.execute('node', ['-e', '"console.log(process.cwd())"']);
    const canonicalTmpRoot = fs.realpathSync(tmpRoot);
    const actualCwd = cwdExec.stdout.trim();
    assert(
      cwdExec.success && (actualCwd === tmpRoot || actualCwd === canonicalTmpRoot),
      'Execute child processes strictly with cwd = workspaceRoot',
      `expected: ${tmpRoot} or ${canonicalTmpRoot}, got stdout: "${actualCwd}", stderr: "${cwdExec.stderr}", success: ${cwdExec.success}`
    );

    // ==========================================
    // 6. LOCAL AGENT SERVER & PROTOCOL VALIDATION
    // ==========================================
    console.log('\n--- [6. LocalAgentServer & Protocol Security] ---');

    const serverToken = 'test-audit-token-secret-123';
    const agentServer = new LocalAgentServer({
      port: 19998,
      token: serverToken,
      initialWorkspaceRoot: tmpRoot,
      maxRequestsPerWindow: 20, // Strict for testing rate limiting
    });

    const activeSession = agentServer.getSession();
    assert(activeSession !== null, 'Server initializes active workspace session');
    assert(agentServer.getToken() === serverToken, 'Server holds configured security token');

    // 6.1 Origin Validation
    assert(agentServer.isOriginAllowed('http://localhost:3000') === true, 'Allow localhost origin');
    assert(agentServer.isOriginAllowed('http://127.0.0.1:19998') === true, 'Allow 127.0.0.1 origin');
    assert(agentServer.isOriginAllowed('chrome-extension://abcdefghijklmnop') === false, 'Reject retired Chrome extension origin');
    assert(agentServer.isOriginAllowed('https://malicious-site.com') === false, 'Block malicious external origin');
    assert(agentServer.isOriginAllowed('https://evil-attacker.io') === false, 'Block untrusted web origin');
    assert(agentServer.isOriginAllowed('https://example.run.app') === false, 'Reject arbitrary Cloud Run origin');

    // 6.2 Malformed RPC Messages
    const m1 = await agentServer.handleMessage(null);
    assert(m1.success === false && m1.error?.code === 'INVALID_REQUEST', 'Reject non-object payload (null)');

    const m2 = await agentServer.handleMessage('not-json-object');
    assert(m2.success === false && m2.error?.code === 'INVALID_REQUEST', 'Reject string payload');

    const m3 = await agentServer.handleMessage({ action: 'files.list' }); // missing requestId
    assert(m3.success === false && m3.error?.code === 'INVALID_REQUEST', 'Reject request with missing requestId');

    const m4 = await agentServer.handleMessage({ requestId: 'r1' }); // missing action
    assert(m4.success === false && m4.error?.code === 'INVALID_REQUEST', 'Reject request with missing action');

    // 6.3 Authentication Token Enforcement
    const auth1 = await agentServer.handleMessage({
      requestId: 'req-unauth-1',
      action: 'files.list',
      token: 'WRONG_TOKEN',
    });
    assert(auth1.success === false && auth1.error?.code === 'UNAUTHORIZED', 'Reject request with wrong token');

    const auth2 = await agentServer.handleMessage({
      requestId: 'req-unauth-2',
      action: 'files.list',
      // No token
    });
    assert(auth2.success === false && auth2.error?.code === 'UNAUTHORIZED', 'Reject request without token');

    // 6.4 Server-side Authorization & Approvals (Web UI is NOT security source)
    // Unauthorized Write (without approved: true)
    const write1 = await agentServer.handleMessage({
      requestId: 'req-write-unauth',
      token: serverToken,
      action: 'files.write',
      params: { path: 'src/App.tsx', content: 'MALICIOUS_OVERWRITE' },
    });
    assert(write1.success === false && write1.error?.code === 'APPROVAL_REQUIRED', 'Server rejects file write without explicit approval');

    // Unauthorized Delete (without approved: true)
    const del1 = await agentServer.handleMessage({
      requestId: 'req-del-unauth',
      token: serverToken,
      action: 'files.delete',
      params: { path: 'src/App.tsx' },
    });
    assert(del1.success === false && del1.error?.code === 'APPROVAL_REQUIRED', 'Server rejects file delete without explicit approval');

    // Unauthorized Arbitrary Terminal Command (without approved: true)
    const cmd1 = await agentServer.handleMessage({
      requestId: 'req-cmd-unauth',
      token: serverToken,
      action: 'terminal.execute',
      params: { command: 'node -v' }, // Valid command, but requires approval on server
    });
    assert(cmd1.success === false && cmd1.error?.code === 'APPROVAL_REQUIRED', 'Server rejects unapproved terminal command');

    // Blocked Terminal Command (even if approved: true is claimed)
    const cmd2 = await agentServer.handleMessage({
      requestId: 'req-cmd-blocked',
      token: serverToken,
      action: 'terminal.execute',
      params: { command: 'npm test && cat /etc/passwd', approved: true },
    });
    assert(cmd2.success === false && cmd2.error?.code === 'COMMAND_REJECTED', 'Server rejects dangerous shell chained command even if approved: true is claimed');

    // Dangerous syntax must also be rejected when supplied through args.
    const cmd3 = await agentServer.handleMessage({
      requestId: 'req-cmd-args-injection',
      token: serverToken,
      action: 'terminal.execute',
      params: { command: 'node', args: ['-e', 'console.log(1) && whoami'], approved: true },
    });
    assert(cmd3.success === false && cmd3.error?.code === 'COMMAND_REJECTED', 'Server validates terminal arguments against command injection');

    // 6.5 Workspace Switching & Session Invalidation
    const session1Id = activeSession!.sessionId;

    // Switch workspace to secondWs
    const switchRes = await agentServer.handleMessage({
      requestId: 'req-switch-1',
      token: serverToken,
      action: 'workspace.select',
      params: { path: secondWs },
    });
    assert(switchRes.success === true, 'Successfully switch workspace');
    const session2Id = agentServer.getSession()!.sessionId;
    assert(session1Id !== session2Id, 'Workspace switch creates new unique sessionId');

    // Stale session replay attack using session1Id
    const staleReplay = await agentServer.handleMessage({
      requestId: 'req-stale-replay',
      token: serverToken,
      sessionId: session1Id, // Old invalidated session
      action: 'files.list',
      params: {},
    });
    assert(
      staleReplay.success === false && staleReplay.error?.code === 'SESSION_STALE',
      'Reject request using invalidated/stale sessionId with SESSION_STALE'
    );

    // 6.6 Rate Limiting
    let rateLimited = false;
    for (let i = 0; i < 30; i++) {
      const res = await agentServer.handleMessage(
        {
          requestId: `req-rate-${i}`,
          token: serverToken,
          action: 'workspace.session',
        },
        'abusive-client-ip'
      );
      if (res.error?.code === 'RATE_LIMIT_EXCEEDED') {
        rateLimited = true;
        break;
      }
    }
    assert(rateLimited, 'Rate limiter triggers RATE_LIMIT_EXCEEDED when request threshold exceeded');

  } finally {
    // Cleanup temporary test directories
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
      fs.rmSync(outsideTmp, { recursive: true, force: true });
      fs.rmSync(secondWs, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }

  console.log(`\n====================================================`);
  console.log(`  SUMMARY: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveSecurityAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
