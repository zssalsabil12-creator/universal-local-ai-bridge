// ULAB Extension background bridge
// Uses the authenticated localhost WebSocket protocol as a local-only bridge.

const DEFAULT_AGENT_URL = 'ws://127.0.0.1:19999';
const ALLOWED_AGENT_HOSTS = new Set(['127.0.0.1', 'localhost']);
let socket = null;
let connected = false;
let sidePanelPort = null;
let agentUrl = DEFAULT_AGENT_URL;
let token = '';
let requestCounter = 0;
const pending = new Map();

function isAllowedAgentUrl(value) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'ws:' || parsed.protocol === 'wss:')
      && ALLOWED_AGENT_HOSTS.has(parsed.hostname)
      && (parsed.port === '19999' || parsed.port === '');
  } catch {
    return false;
  }
}

async function loadSettings() {
  const saved = await chrome.storage.local.get(['agentUrl', 'agentToken']);
  agentUrl = isAllowedAgentUrl(saved.agentUrl) ? saved.agentUrl : DEFAULT_AGENT_URL;
  token = saved.agentToken || '';
}

function sendPanel(message) {
  if (!sidePanelPort) return;
  try { sidePanelPort.postMessage(message); } catch { /* panel closed */ }
}

function disconnectAgent(reason = 'Disconnected') {
  connected = false;
  if (socket) {
    try { socket.close(); } catch { /* ignore */ }
  }
  socket = null;
  for (const [id, resolve] of pending) {
    resolve({ requestId: id, success: false, error: { code: 'AGENT_OFFLINE', message: reason, requestId: id } });
  }
  pending.clear();
  sendPanel({ type: 'agent_disconnected', reason });
}

function connectAgent(url = agentUrl, suppliedToken = token) {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
  if (!isAllowedAgentUrl(url)) {
    sendPanel({ type: 'status', isConnected: false, error: 'Agent URL must be localhost on port 19999.' });
    return;
  }
  agentUrl = url;
  token = (suppliedToken || '').trim();
  chrome.storage.local.set({ agentUrl, agentToken: token });

  try { socket = new WebSocket(agentUrl); } catch (error) {
    disconnectAgent(error?.message || 'Unable to create WebSocket');
    return;
  }

  socket.addEventListener('open', () => {
    connected = true;
    sendPanel({ type: 'status', isConnected: true, agentUrl });
  });
  socket.addEventListener('message', (event) => {
    let response;
    try { response = JSON.parse(event.data); } catch { return; }
    if (response.requestId && pending.has(response.requestId)) {
      const resolve = pending.get(response.requestId);
      pending.delete(response.requestId);
      resolve(response);
    }
    sendPanel({ type: 'agent_message', data: response });
  });
  socket.addEventListener('error', () => {
    if (!connected) sendPanel({ type: 'status', isConnected: false, error: 'Unable to connect to the local agent.' });
  });
  socket.addEventListener('close', () => disconnectAgent('Local agent connection closed'));
}

function rpc(action, params = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return Promise.resolve({ success: false, error: { code: 'AGENT_OFFLINE', message: 'Local agent is offline' } });
  }
  const requestId = `ext-${Date.now()}-${++requestCounter}`;
  const payload = { requestId, action, params, token };
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(requestId);
      resolve({ requestId, success: false, error: { code: 'TIMEOUT', message: 'Agent request timed out', requestId } });
    }, 8000);
    pending.set(requestId, (response) => { clearTimeout(timer); resolve(response); });
    try { socket.send(JSON.stringify(payload)); } catch (error) {
      clearTimeout(timer);
      pending.delete(requestId);
      resolve({ success: false, error: { code: 'AGENT_OFFLINE', message: error?.message || 'Send failed' } });
    }
  });
}
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sidepanel') return;
  sidePanelPort = port;
  port.onMessage.addListener(async (message) => {
    if (message.type === 'get_status') {
      sendPanel({ type: 'status', isConnected: connected, agentUrl });
      return;
    }
    if (message.type === 'configure_agent') {
      const requestedUrl = (message.url || DEFAULT_AGENT_URL).trim() || DEFAULT_AGENT_URL;
      if (!isAllowedAgentUrl(requestedUrl)) {
        sendPanel({ type: 'settings_error', message: 'Use ws://127.0.0.1:19999 or ws://localhost:19999.' });
        return;
      }
      agentUrl = requestedUrl;
      token = (message.token || '').trim();
      await chrome.storage.local.set({ agentUrl, agentToken: token });
      sendPanel({ type: 'settings_saved', agentUrl, hasToken: Boolean(token) });
      return;
    }
    if (message.type === 'connect_agent') {
      await loadSettings();
      connectAgent();
      return;
    }
    if (message.type === 'disconnect_agent') {
      disconnectAgent('Disconnected by user');
      return;
    }
    if (message.type === 'agent_action') {
      const data = message.data || {};
      const response = await rpc(data.action, data.params || data);
      sendPanel({ type: 'agent_message', data: response });
    }
  });
  port.onDisconnect.addListener(() => {
    if (sidePanelPort === port) sidePanelPort = null;
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId !== undefined) chrome.sidePanel.open({ windowId: tab.windowId });
});
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      agentUrl: DEFAULT_AGENT_URL,
      agentToken: '',
      projects: [],
      permissions: {},
      preferences: { theme: 'dark', language: 'en' },
    });
  }
  await loadSettings();
});

loadSettings();
console.log('[ULAB] Extension background bridge initialized');
