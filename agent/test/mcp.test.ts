import * as assert from 'assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LocalAgentServer } from '../src/LocalAgentServer';
import { ULABMCPServer } from '../src/MCPServer';

const MODERN = '2026-07-28';
const LEGACY = '2025-11-25';
const PORT = 20997;

async function main(): Promise<void> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ulab-mcp-'));
  const sourcePath = path.join(root, 'hello.txt');
  const original = 'hello from ULAB\n';
  fs.writeFileSync(sourcePath, original, 'utf8');

  const token = 'mcp-test-token';
  const agent = new LocalAgentServer({ port: PORT, token, initialWorkspaceRoot: root });
  const mcp = new ULABMCPServer(agent);
  assert.equal(agent.isOriginAllowed('file:///C:/Program%20Files/ULAB/renderer/dist/index.html'), true);
  assert.equal(agent.isOriginAllowed('https://example.com'), false);

  const cleanup = async () => {
    await agent.stop().catch(() => undefined);
    fs.rmSync(root, { recursive: true, force: true });
  };

  try {
    const discover = await mcp.handleMessage({
      jsonrpc: '2.0',
      id: 1,
      method: 'server/discover',
      params: {
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
          'io.modelcontextprotocol/clientInfo': { name: 'ulab-mcp-test', version: '1.0.0' },
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    }, token);
    assert.deepEqual(discover.result.supportedVersions, [MODERN, LEGACY]);
    assert.equal(discover._meta['io.modelcontextprotocol/serverInfo'].name, 'ulab-local-agent');

    const list = await mcp.handleMessage({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    }, token);
    const toolNames = list.result.tools.map((tool: any) => tool.name);
    assert.ok(toolNames.includes('files_read'));
    assert.ok(toolNames.includes('files_propose'));
    assert.ok(!toolNames.includes('files_write'));
    assert.ok(!toolNames.includes('terminal_execute'));
    assert.equal(list.result.ttlMs, 300000);
    assert.equal(list.result.cacheScope, 'global');

    const session = await mcp.handleMessage({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'workspace_session',
        arguments: {},
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
        },
      },
    }, token);
    assert.equal(session.result.isError, undefined);
    const sessionData = JSON.parse(session.result.content[0].text);
    assert.equal(sessionData.data.workspaceRoot, root);

    const read = await mcp.handleMessage({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'files_read',
        arguments: { path: 'hello.txt' },
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
        },
      },
    }, token);
    const readData = JSON.parse(read.result.content[0].text);
    assert.equal(readData.data.content, original);

    const proposalContent = 'changed by MCP proposal\n';
    const proposal = await mcp.handleMessage({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'files_propose',
        arguments: { path: 'hello.txt', content: proposalContent, reason: 'MCP safety test' },
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
        },
      },
    }, token);
    const proposalData = JSON.parse(proposal.result.content[0].text);
    assert.equal(proposalData.data.status, 'pending');
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), original);

    const unknown = await mcp.handleMessage({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'files_write',
        arguments: { path: 'hello.txt', content: 'must not write' },
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
        },
      },
    }, token);
    assert.equal(unknown.error.code, -32602);

    await agent.start();

    const httpRequest = async (body: unknown, headers: Record<string, string> = {}) => {
      const response = await fetch('http://127.0.0.1:' + PORT + '/mcp', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      const text = await response.text();
      return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : null };
    };

    const unauthorized = await fetch('http://127.0.0.1:' + PORT + '/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'server/discover' }),
    });
    assert.equal(unauthorized.status, 401);

    const modernHeaders = {
      authorization: 'Bearer ' + token,
      'mcp-protocol-version': MODERN,
      'mcp-method': 'server/discover',
      'mcp-name': 'server/discover',
    };
    const discoverHttp = await httpRequest({
      jsonrpc: '2.0',
      id: 8,
      method: 'server/discover',
      params: {
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MODERN,
          'io.modelcontextprotocol/clientInfo': { name: 'http-test', version: '1.0.0' },
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    }, modernHeaders);
    assert.equal(discoverHttp.status, 200);
    assert.ok(discoverHttp.body.result.supportedVersions.includes(MODERN));
    assert.equal(discoverHttp.body._meta['io.modelcontextprotocol/serverInfo'].version, '3.10.8');

    const listHttp = await httpRequest({
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/list',
      params: { _meta: { 'io.modelcontextprotocol/protocolVersion': MODERN } },
    }, { ...modernHeaders, 'mcp-method': 'tools/list', 'mcp-name': 'tools/list' });
    assert.equal(listHttp.status, 200);
    assert.equal(listHttp.body.result.ttlMs, 300000);

    const callHttp = await httpRequest({
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'files_read',
        arguments: { path: 'hello.txt' },
        _meta: { 'io.modelcontextprotocol/protocolVersion': MODERN },
      },
    }, { ...modernHeaders, 'mcp-method': 'tools/call', 'mcp-name': 'files_read' });
    assert.equal(callHttp.status, 200);
    const httpReadData = JSON.parse(callHttp.body.result.content[0].text);
    assert.equal(httpReadData.data.content, original);

    const mismatch = await httpRequest({
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: { name: 'files_read', arguments: { path: 'hello.txt' }, _meta: { 'io.modelcontextprotocol/protocolVersion': MODERN } },
    }, { ...modernHeaders, 'mcp-method': 'tools/call', 'mcp-name': 'files_search' });
    assert.equal(mismatch.status, 400);
    assert.equal(mismatch.body.error.code, -32020);

    const legacy = await httpRequest({
      jsonrpc: '2.0',
      id: 12,
      method: 'initialize',
      params: { protocolVersion: LEGACY, capabilities: {}, clientInfo: { name: 'legacy', version: '1.0.0' } },
    }, { authorization: 'Bearer ' + token });
    assert.equal(legacy.status, 200);
    assert.equal(legacy.body.result.protocolVersion, LEGACY);

    const getResponse = await fetch('http://127.0.0.1:' + PORT + '/mcp', {
      headers: { authorization: 'Bearer ' + token },
    });
    assert.equal(getResponse.status, 200);
    assert.equal((await getResponse.json()).ok, true);

    const shutdownUnauthorized = await fetch('http://127.0.0.1:' + PORT + '/shutdown', { method:'POST' });
    assert.equal(shutdownUnauthorized.status, 401);

    const shutdownResponse = await fetch('http://127.0.0.1:' + PORT + '/shutdown', {
      method:'POST',
      headers:{ authorization:'Bearer ' + token },
    });
    assert.equal(shutdownResponse.status, 200);
    await new Promise(resolve => setTimeout(resolve, 100));
    const healthAfterShutdown = await fetch('http://127.0.0.1:' + PORT + '/health', {
      signal: AbortSignal.timeout(1000),
    }).then(() => true).catch(() => false);
    assert.equal(healthAfterShutdown, false);

    console.log('MCP TEST SUMMARY: PASS');
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error('MCP TEST FAILURE:', error);
  process.exit(1);
});
