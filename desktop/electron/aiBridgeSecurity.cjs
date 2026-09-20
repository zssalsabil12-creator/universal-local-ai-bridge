const SAFE_AI_ACTIONS = new Set([
  'workspace.session', 'files.read', 'files.list', 'files.search', 'files.propose',
  'git.status', 'git.diff', 'context.build', 'audit.log'
]);

const HUMAN_APPROVAL_ACTIONS = new Set([
  'files.approve', 'files.reject', 'files.write', 'files.delete',
  'git.commit', 'git.push', 'terminal.execute', 'testing.run'
]);

const MAX_TOOL_BLOCK_LENGTH = 64 * 1024;
const AI_APPROVAL_TTL_MS = 2 * 60 * 1000;

function createAIToolApprovalContext({ approvalId, provider, workspaceSessionId, sessionGeneration, now = Date.now() }) {
  return {
    approvalId,
    provider,
    workspaceSessionId,
    sessionGeneration,
    createdAt: now,
    expiresAt: now + AI_APPROVAL_TTL_MS,
  };
}

function validateAIToolApprovalContext(context, current) {
  if (!context || !current) return { valid: false, reason: 'AI approval context is missing' };
  if (Date.now() > context.expiresAt) return { valid: false, reason: 'AI approval request expired' };
  if (context.provider !== current.provider) return { valid: false, reason: 'AI session changed' };
  if (context.sessionGeneration !== current.sessionGeneration) return { valid: false, reason: 'AI session generation changed' };
  if (context.workspaceSessionId !== current.workspaceSessionId) return { valid: false, reason: 'Workspace session changed' };
  return { valid: true };
}

function getAIToolDisposition(action) {
  if (SAFE_AI_ACTIONS.has(action)) return 'auto';
  if (HUMAN_APPROVAL_ACTIONS.has(action)) return 'approval';
  return 'reject';
}

function extractAIToolRequest(text) {
  const matches = [...String(text || '').matchAll(/```ulab-tool\s*([\s\S]*?)```/g)];
  if (matches.length !== 1) return null;
  const raw = matches[0][1].trim();
  if (!raw || raw.length > MAX_TOOL_BLOCK_LENGTH) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (typeof parsed.action !== 'string' || parsed.action.length === 0 || parsed.action.length > 128) return null;
    if (parsed.id !== undefined && (typeof parsed.id !== 'string' || parsed.id.length > 128)) return null;
    if (parsed.params !== undefined && (!parsed.params || typeof parsed.params !== 'object' || Array.isArray(parsed.params))) return null;
    return { id: parsed.id, action: parsed.action, params: parsed.params || {} };  } catch {
    return null;
  }
}

const TRUSTED_HOSTS = {
  chatgpt: ['chatgpt.com', 'auth.openai.com', 'openai.com'],
  claude: ['claude.ai', 'anthropic.com'],
  gemini: ['gemini.google.com', 'accounts.google.com', 'google.com'],
  deepseek: ['deepseek.com'],
  qwen: ['qwen.ai', 'alibabacloud.com', 'aliyun.com'],
  mistral: ['mistral.ai'],
  grok: ['grok.com', 'x.com'],
  copilot: ['copilot.microsoft.com', 'login.microsoftonline.com', 'microsoft.com'],
  perplexity: ['perplexity.ai'],
  llama: ['meta.ai', 'facebook.com'],
};

function hostMatches(hostname, allowed) {
  const host = hostname.toLowerCase();
  return allowed.some(base => host === base || host.endsWith(`.${base}`));
}

function isTrustedAIUrl(providerId, initialUrl, targetUrl) {
  if (targetUrl === 'about:blank') return true;
  let target, initial;
  try { target = new URL(targetUrl); initial = new URL(initialUrl); } catch { return false; }
  if (target.protocol !== 'https:') return false;
  const allowed = providerId === 'custom' ? [initial.hostname] : (TRUSTED_HOSTS[providerId] || [initial.hostname]);
  return hostMatches(target.hostname, allowed);
}

module.exports = { SAFE_AI_ACTIONS, HUMAN_APPROVAL_ACTIONS, getAIToolDisposition, extractAIToolRequest, isTrustedAIUrl, MAX_TOOL_BLOCK_LENGTH, AI_APPROVAL_TTL_MS, createAIToolApprovalContext, validateAIToolApprovalContext };
