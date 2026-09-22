const BRIDGE_PROTOCOL_VERSION = '1.1';
const LIVE_HANDSHAKE_TIMEOUT_MS = 18000;

function createBridgeNonce() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function buildHandshakePrompt(nonce) {
  const safe = String(nonce || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  return [
    'ULAB BRIDGE HANDSHAKE REQUEST',
    'This is a hidden compatibility check initiated by ULAB Desktop.',
    'Do not describe, explain, or execute any local project operation.',
    'Reply with exactly this line and nothing else:',
    'ULAB_BRIDGE_ACK:' + safe,
  ].join('\n');
}

function isHandshakeAck(text, nonce) {
  const safe = String(nonce || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
  const value = String(text || '').trim();
  if (!safe || !value) return false;
  return value.includes('ULAB_BRIDGE_ACK:' + safe);
}

function buildCompatibilityResult(checks, { live = false } = {}) {
  const normalized = Object.fromEntries(Object.entries(checks || {}).map(([key, value]) => [key, {
    status: value?.status || (value?.ok ? 'passed' : 'failed'),
    detail: value?.detail || value?.error || null,
  }]));
  const required = ['agent','ai_page','auth','composer','parser','sanitizer','assistant_reader'];
  if (live) required.push('handshake');
  const passed = required.every(key => normalized[key]?.status === 'passed');
  return { ok:passed, passed, live, protocolVersion:BRIDGE_PROTOCOL_VERSION, checks:normalized, required };
}

module.exports = { BRIDGE_PROTOCOL_VERSION, LIVE_HANDSHAKE_TIMEOUT_MS, createBridgeNonce, buildHandshakePrompt, isHandshakeAck, buildCompatibilityResult };