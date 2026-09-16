// Phase 2 — Web <-> Local Agent Communication Test Suite
// Verifies: Authenticated communication, session-awareness, requestId correlation,
// structured errors, connection lifecycle, status detection, and workspace sync.

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LocalAgentServer } from '../src/LocalAgentServer';
import { LocalAgentManager } from '../../src/utils/localAgent';

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

async function runPhase2Suite() {
  console.log('\n======================================================');
  console.log('  PHASE 2: WEB <-> LOCAL AGENT COMMUNICATION SUITE   ');
  console.log('======================================================\n');

  const TEST_PORT = 19995;
  const TEST_TOKEN = 'ulab-secret-phase2-token-2026';
  const WS_URL = `ws://127.0.0.1:${TEST_PORT}`;
  const HTTP_URL = `http://127.0.0.1:${TEST_PORT}`;

  // 1. Setup isolated test workspace
  const tmpWs1 = fs.mkdtempSync(path.join(os.tmpdir(), 'ulab-phase2-ws1-'));
  const tmpWs2 = fs.mkdtempSync(path.join(os.tmpdir(), 'ulab-phase2-ws2-'));

  fs.mkdirSync(path.join(tmpWs1, 'src'), { recursive: true });
  fs.writeFileSync(path.join(tmpWs1, 'src', 'app.ts'), 'export const ulab = "v2";\n', 'utf-8');
  fs.writeFileSync(path.join(tmpWs1, 'package.json'), JSON.stringify({ name: 'phase2-ws1', version: '1.0.0' }), 'utf-8');

  fs.writeFileSync(path.join(tmpWs2, 'package.json'), JSON.stringify({ name: 'phase2-ws2', version: '2.0.0' }), 'utf-8');

  // 2. Start LocalAgentServer
  const server = new LocalAgentServer({
    port: TEST_PORT,
    token: TEST_TOKEN,
    allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  });

  await server.start();
  console.log(`[Phase2 Test] LocalAgentServer running on port ${TEST_PORT}`);

  try {
    // -------------------------------------------------------------
    // TEST GROUP 1: AGENT STATUS DETECTION (HTTP & INITIAL STATE)
    // -------------------------------------------------------------
    console.log('\n--- Group 1: Agent Status Detection ---');

    const client = new LocalAgentManager();
    assert(client.getStatus() === 'disconnected', 'Client starts in disconnected state');
    assert(client.getSession() === null, 'Client starts with null session');

    const health = await client.checkHealth(HTTP_URL);
    assert(health.online === true, 'HTTP health check confirms agent is online');
    assert(health.version === '1.0.0', 'HTTP health check returns expected version');
    assert(health.hasActiveWorkspace === false, 'HTTP health check shows no active workspace before selection');

    // -------------------------------------------------------------
    // TEST GROUP 2: AUTHENTICATED LOCAL COMMUNICATION & HANDSHAKE
    // -------------------------------------------------------------
    console.log('\n--- Group 2: Authenticated Communication ---');

    let statusChangeFired = false;
    let recordedStatus = '';
    const unsubStatus = client.onStatusChange((s) => {
      statusChangeFired = true;
      recordedStatus = s;
    });

    // Connect with valid token
    const connected = await client.connect(WS_URL, TEST_TOKEN);
    assert(connected === true, 'WebSocket connection succeeds with valid server token');
    assert(client.getStatus() === 'connected', 'Client reports connected status');
    assert(statusChangeFired === true && recordedStatus === 'connected', 'onStatusChange fires connected');
    unsubStatus();

    // Verify unauthorized request rejection (client sending wrong token)
    const unauthorizedClient = new LocalAgentManager();
    await unauthorizedClient.connect(WS_URL, 'wrong-token-12345');
    const unauthRes = await unauthorizedClient.sendRequest('workspace.session');
    assert(unauthRes.success === false, 'Server rejects request with invalid token');
    assert(unauthRes.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');
    unauthorizedClient.disconnect();

    // -------------------------------------------------------------
    // TEST GROUP 3: SESSION-AWARE REQUESTS & WORKSPACE INITIALIZATION
    // -------------------------------------------------------------
    console.log('\n--- Group 3: Session-Aware Requests ---');

    // Requesting file operation before workspace selection must fail with WORKSPACE_NOT_FOUND
    const prematureFileReq = await client.readFile('src/app.ts');
    assert(prematureFileReq.success === false, 'File operation rejected before workspace is selected');
    assert(prematureFileReq.error?.code === 'WORKSPACE_NOT_FOUND', 'Error code is WORKSPACE_NOT_FOUND');

    // Select workspace 1
    let sessionChanged = false;
    let newSessionObj: any = null;
    const unsubSession = client.onSessionChange((sess) => {
      sessionChanged = true;
      newSessionObj = sess;
    });

    const selectRes = await client.selectWorkspace(tmpWs1);
    assert(selectRes.success === true, 'workspace.select succeeds for valid path');
    assert(!!selectRes.data?.sessionId, 'Response includes active sessionId');
    assert(selectRes.data?.workspaceRoot === fs.realpathSync(tmpWs1), 'Response includes canonical workspaceRoot');
    assert(sessionChanged === true, 'onSessionChange fired upon workspace selection');
    assert(client.getSession()?.sessionId === selectRes.data?.sessionId, 'client.getSession() is synchronized');
    unsubSession();

    // Perform file read with active session attached
    const readRes = await client.readFile('src/app.ts');
    assert(readRes.success === true, 'files.read succeeds with active session');
    assert(readRes.data?.content.includes('export const ulab = "v2"'), 'files.read returned expected content');

    // Session staleness detection: If client sends mismatched sessionId, server returns SESSION_STALE
    const staleRes = await client.sendRequest('files.read', { path: 'src/app.ts' }, 'stale-bogus-session-id');
    assert(staleRes.success === false, 'Mismatched sessionId is rejected');
    assert(staleRes.error?.code === 'SESSION_STALE', 'Error code is SESSION_STALE');
    assert(client.getSession() === null, 'Client automatically clears session upon SESSION_STALE');

    // Restore session
    await client.selectWorkspace(tmpWs1);
    assert(client.getSession() !== null, 'Session restored after re-selection');

    // -------------------------------------------------------------
    // TEST GROUP 4: REQUESTID CORRELATION & CONCURRENCY
    // -------------------------------------------------------------
    console.log('\n--- Group 4: RequestId Correlation & Concurrency ---');

    // Send multiple concurrent operations simultaneously
    const req1 = client.readFile('src/app.ts');
    const req2 = client.readFile('package.json');
    const req3 = client.listFiles('.', false);
    const req4 = client.refreshSession();
    const req5 = client.readFile('src/app.ts');

    const [res1, res2, res3, res4, res5] = await Promise.all([req1, req2, req3, req4, req5]);

    assert(res1.success && res1.data.content.includes('ulab = "v2"'), 'Concurrent req1 correlated correctly');
    assert(res2.success && res2.data.content.includes('phase2-ws1'), 'Concurrent req2 correlated correctly');
    assert(res3.success && Array.isArray(res3.data), 'Concurrent req3 correlated correctly');
    assert(res4.success && !!res4.data?.sessionId, 'Concurrent req4 correlated correctly');
    assert(res5.success && res5.data.content.includes('ulab = "v2"'), 'Concurrent req5 correlated correctly');

    // All requestIds must be distinct
    const ids = [res1.requestId, res2.requestId, res3.requestId, res4.requestId, res5.requestId];
    const uniqueIds = new Set(ids);
    assert(uniqueIds.size === 5, 'All 5 concurrent requests have unique correlated requestIds');

    // Timeout correlation test: suppress the transport send so the request
    // genuinely receives no response. Unknown server actions are expected to
    // fail immediately and therefore cannot be used as a timeout oracle.
    const clientSocket = (client as any).ws;
    const originalSend = clientSocket.send.bind(clientSocket);
    clientSocket.send = () => undefined;
    try {
      const timeoutRes = await client.sendRequest('workspace.session', {}, undefined, 100);
      assert(timeoutRes.success === false, 'Timed-out request returns failure');
      assert(timeoutRes.error?.code === 'TIMEOUT', 'Error code is TIMEOUT');
    } finally {
      clientSocket.send = originalSend;
    }

    // -------------------------------------------------------------
    // TEST GROUP 5: STRUCTURED ERRORS
    // -------------------------------------------------------------
    console.log('\n--- Group 5: Structured Errors ---');

    const invalidFileRes = await client.readFile('nonexistent-file-xyz.ts');
    assert(invalidFileRes.success === false, 'Reading nonexistent file fails');
    assert(invalidFileRes.error?.code === 'FILE_NOT_FOUND', 'Error code is FILE_NOT_FOUND');
    assert(typeof invalidFileRes.error?.message === 'string', 'Error has descriptive message');
    assert(invalidFileRes.error?.requestId === invalidFileRes.requestId, 'Error preserves requestId correlation');

    const traversalRes = await client.readFile('../outside.txt');
    assert(traversalRes.success === false, 'Path traversal read is blocked');
    assert(traversalRes.error?.code === 'ACCESS_DENIED', 'Error code is ACCESS_DENIED');

    // -------------------------------------------------------------
    // TEST GROUP 6: WORKSPACE & SESSION STATE SYNCHRONIZATION
    // -------------------------------------------------------------
    console.log('\n--- Group 6: Workspace & Session State Synchronization ---');

    const switchRes = await client.switchWorkspace(tmpWs2);
    assert(switchRes.success === true, 'workspace.switch succeeds');
    assert(switchRes.data?.workspaceRoot === fs.realpathSync(tmpWs2), 'Session switched to workspace 2');
    assert(client.getSession()?.workspaceRoot === fs.realpathSync(tmpWs2), 'Client session state is synced to ws2');

    // Reading ws2 file succeeds
    const ws2Pkg = await client.readFile('package.json');
    assert(ws2Pkg.success === true && ws2Pkg.data.content.includes('phase2-ws2'), 'File read is bound to workspace 2');

    // Verify HTTP health endpoint now reflects workspace 2
    const healthAfterSwitch = await client.checkHealth(HTTP_URL);
    assert(healthAfterSwitch.hasActiveWorkspace === true, 'Health reflects active workspace');
    assert(healthAfterSwitch.workspace === path.basename(tmpWs2), 'Health reflects workspace name');

    // -------------------------------------------------------------
    // TEST GROUP 7: CONNECTION LIFECYCLE & DISCONNECTION HANDLING
    // -------------------------------------------------------------
    console.log('\n--- Group 7: Connection Lifecycle & Disconnect ---');

    let disconnectNotified = false;
    client.onStatusChange((status) => {
      if (status === 'disconnected') disconnectNotified = true;
    });

    client.disconnect();
    assert(client.getStatus() === 'disconnected', 'Client is disconnected after disconnect()');
    assert(client.getSession() === null, 'Session cleared on disconnect');
    assert(disconnectNotified === true, 'Disconnect notification received');

    // Requests while disconnected immediately fail with AGENT_OFFLINE
    const offlineReq = await client.readFile('package.json');
    assert(offlineReq.success === false, 'Request while offline fails immediately');
    assert(offlineReq.error?.code === 'AGENT_OFFLINE', 'Error code is AGENT_OFFLINE');

  } finally {
    // Clean up server
    await server.stop();
    console.log('\n[Phase2 Test] LocalAgentServer stopped');

    // Clean up temporary directories
    try {
      fs.rmSync(tmpWs1, { recursive: true, force: true });
      fs.rmSync(tmpWs2, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  console.log('\n======================================================');
  console.log(`  PHASE 2 SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.log(`  FAILED: ${failedTests}`);
    process.exit(1);
  } else {
    console.log('  ALL PHASE 2 COMMUNICATION REQUIREMENTS MET!        ');
    console.log('======================================================\n');
  }
}

runPhase2Suite().catch((err) => {
  console.error('\nFatal test execution error:', err);
  process.exit(1);
});
