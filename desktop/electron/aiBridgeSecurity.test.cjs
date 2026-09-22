const assert = require('assert');
const {
  getAIToolDisposition, extractAIToolRequest, isTrustedAIUrl,
  createAIToolApprovalContext, validateAIToolApprovalContext, AI_APPROVAL_TTL_MS
} = require('./aiBridgeSecurity.cjs');

const safe = ['files.read','files.list','files.search','files.propose','git.status','git.diff','context.build','audit.log','workspace.session'];
const approval = ['files.create','files.write','files.delete','git.commit','git.push','terminal.execute','testing.run'];

for (const action of safe) assert.equal(getAIToolDisposition(action), 'auto');
for (const action of approval) assert.equal(getAIToolDisposition(action), 'approval');
assert.equal(getAIToolDisposition('unknown.action'), 'reject');

const parsed = extractAIToolRequest('hello\n```ulab-tool\n{"id":"x1","action":"files.read","params":{"path":"src/app.ts"}}\n```');
assert.deepEqual(parsed, { id:'x1', action:'files.read', params:{path:'src/app.ts'} });
assert.deepEqual(extractAIToolRequest('{"action":"files.list","params":{"path":"."}}'), {
  id:undefined, action:'files.list', params:{path:'.'}
});
assert.deepEqual(extractAIToolRequest('I will inspect the workspace: {"action":"files.list","params":{"path":"."}}'), {
  id:undefined, action:'files.list', params:{path:'.'}
});
assert.deepEqual(extractAIToolRequest('```json\n{"action":"files.read","params":{"path":"src/app.ts"}}\n```'), {
  id:undefined, action:'files.read', params:{path:'src/app.ts'}
});
assert.equal(extractAIToolRequest('```ulab-tool\n{"action":"files.read"}\n```\n```ulab-tool\n{"action":"files.list"}\n```'), null);
assert.equal(extractAIToolRequest('```ulab-tool\n[]\n```'), null);
assert.equal(extractAIToolRequest('```ulab-tool\n{"action":"files.read","params":[]}\n```'), null);
assert.equal(extractAIToolRequest('```ulab-tool\n{"action":"' + 'x'.repeat(200) + '"}\n```'), null);

const approvalContext = createAIToolApprovalContext({
  approvalId:'approval-1',
  provider:'chatgpt',
  workspaceSessionId:'sess-a',
  sessionGeneration:7,
  now:Date.now(),
});
assert.equal(approvalContext.expiresAt - approvalContext.createdAt, AI_APPROVAL_TTL_MS);
assert.deepEqual(
  validateAIToolApprovalContext(approvalContext, {
    provider:'chatgpt',
    workspaceSessionId:'sess-a',
    sessionGeneration:7,
  }),
  { valid:true }
);
assert.equal(
  validateAIToolApprovalContext(approvalContext, {
    provider:'chatgpt',
    workspaceSessionId:'sess-b',
    sessionGeneration:7,
  }).valid,
  false
);
assert.equal(
  validateAIToolApprovalContext(approvalContext, {
    provider:'claude',
    workspaceSessionId:'sess-a',
    sessionGeneration:7,
  }).valid,
  false
);
assert.equal(
  validateAIToolApprovalContext({ ...approvalContext, expiresAt:Date.now() - 1 }, {
    provider:'chatgpt',
    workspaceSessionId:'sess-a',
    sessionGeneration:7,
  }).valid,
  false
);

assert.equal(isTrustedAIUrl('chatgpt','https://chatgpt.com/','https://chatgpt.com/c/123'), true);
assert.equal(isTrustedAIUrl('chatgpt','https://chatgpt.com/','https://auth.openai.com/log-in'), true);
assert.equal(isTrustedAIUrl('chatgpt','https://chatgpt.com/','https://evil.example.com/'), false);
assert.equal(isTrustedAIUrl('custom','https://example.ai/','https://example.ai/chat'), true);
assert.equal(isTrustedAIUrl('custom','https://example.ai/','https://login.example-other.ai/'), false);
assert.equal(isTrustedAIUrl('custom','https://example.ai/','http://example.ai/chat'), false);

console.log('AI bridge security tests: PASS');
