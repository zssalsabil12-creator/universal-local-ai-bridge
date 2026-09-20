




const { app, BrowserWindow, ipcMain, WebContentsView, dialog } = require('electron');
const { shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const { getAIToolDisposition, extractAIToolRequest, isTrustedAIUrl, createAIToolApprovalContext, validateAIToolApprovalContext, AI_APPROVAL_TTL_MS } = require('./aiBridgeSecurity.cjs');
const { isUsableAIWebContents } = require('./aiBridgeRuntime.cjs');
let agentProcess = null;
let bridgeAgentSocket = null;
let bridgeAgentConnecting = null;
let aiBridgeState = 'IDLE';

function setAIBridgeState(state, detail = {}) {
  aiBridgeState = state;
  sendToRenderer('ai-bridge-state', { state, provider: aiProvider, ...detail });
}

function closeAgentSocket() {
  const socket = bridgeAgentSocket;
  bridgeAgentSocket = null;
  bridgeAgentConnecting = null;
  try { socket?.close(); } catch {}
}

async function getBridgeAgentSocket() {
  if (bridgeAgentSocket && bridgeAgentSocket.readyState === WebSocket.OPEN) return bridgeAgentSocket;
  if (bridgeAgentConnecting) return bridgeAgentConnecting;
  const token = getAgentToken();
  if (!token) throw new Error('ULAB Agent token is unavailable');

  setAIBridgeState('AGENT_CONNECTING');
  bridgeAgentConnecting = new Promise((resolve, reject) => {
    const socket = new WebSocket(agentWsUrl);
    const timeout = setTimeout(() => {
      try { socket.close(); } catch {}
      reject(new Error('Agent connection timed out'));
    }, 5000);
    socket.once('open', () => {
      clearTimeout(timeout);
      bridgeAgentSocket = socket;
      bridgeAgentConnecting = null;
      setAIBridgeState('AGENT_CONNECTED');
      resolve(socket);
    });
    socket.once('error', error => {
      clearTimeout(timeout);
      bridgeAgentConnecting = null;
      reject(error);
    });
    socket.on('close', () => {
      if (bridgeAgentSocket === socket) bridgeAgentSocket = null;
      if (aiView) sendToRenderer('ai-bridge-state', { state:'AGENT_DISCONNECTED', provider:aiProvider });
    });
  });
  return bridgeAgentConnecting;
}

function agentEntryPath() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'agent', 'dist', 'ulab-agent.exe');
  return path.join(__dirname, '..', '..', 'agent', 'dist', 'index.js');
}

function startLocalAgent() {
  if (agentProcess && !agentProcess.killed) return;
  const entry = agentEntryPath();
  if (!fs.existsSync(entry)) {
    sendToRenderer('agent-log', 'Agent executable not found: ' + entry);
    return;
  }
  const { spawn } = require('child_process');
  const packagedBinary = app.isPackaged && entry.toLowerCase().endsWith('.exe');
  const command = packagedBinary ? entry : process.execPath;
  const args = packagedBinary ? ['--port', '19999'] : [entry, '--port', '19999'];
  const env = { ...process.env };
  if (!packagedBinary) env.ELECTRON_RUN_AS_NODE = '1';
  agentProcess = spawn(command, args, { env, windowsHide: true, detached: false, stdio: 'ignore' });
  agentProcess.on('error', error => { sendToRenderer('agent-log', 'Agent start error: ' + error.message); agentProcess = null; });
  agentProcess.on('exit', (code, signal) => { agentProcess = null; sendToRenderer('agent-status', { running:false, code, signal }); });
}

function stopLocalAgent() {
  if (!agentProcess) return;
  try { agentProcess.kill(); } catch {}
  agentProcess = null;
}


const isDev = !app.isPackaged;
const rendererUrl = process.env.ULAB_RENDERER_URL || (isDev ? 'http://localhost:3001' : null);
const agentHealthUrl = 'http://127.0.0.1:19999/health';
const agentWsUrl = 'ws://127.0.0.1:19999';
const mcpEndpoint = 'http://127.0.0.1:19999/mcp';
const PROVIDERS = {
  chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  claude: { name: 'Claude', url: 'https://claude.ai/' },
  gemini: { name: 'Gemini', url: 'https://gemini.google.com/' },
  deepseek: { name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
  qwen: { name: 'Qwen', url: 'https://chat.qwen.ai/' },
  mistral: { name: 'Mistral', url: 'https://chat.mistral.ai/' },
  grok: { name: 'Grok', url: 'https://grok.com/' },
  copilot: { name: 'Copilot', url: 'https://copilot.microsoft.com/' },
  perplexity: { name: 'Perplexity', url: 'https://www.perplexity.ai/' },
  llama: { name: 'Llama / Meta AI', url: 'https://www.meta.ai/' },
  custom: { name: 'Custom AI', url: '' }
};

let mainWindow = null;
let aiView = null;
let aiProvider = null;
let aiPollTimer = null;
let lastProcessedToolBlock = '';
let lastObservedAssistantText = '';
const pendingAIToolRequests = new Map();
let aiSessionGeneration = 0;

function getAgentToken() {
  try {
    if (process.env.ULAB_TOKEN) return process.env.ULAB_TOKEN.trim();
    const base = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || process.env.HOME || '.', '.ulab');
    return fs.readFileSync(path.join(base, 'ULAB', 'agent.token'), 'utf8').trim();
  } catch {
    return '';
  }
}

function providerForUrl(url) {
  try {
    const origin = new URL(url).origin;
    return Object.entries(PROVIDERS).find(([, p]) => p.url && new URL(p.url).origin === origin)?.[0] || null;
  } catch {
    return null;
  }
}

function resizeAIView() {
  if (!mainWindow || !aiView) return;
  const [width, height] = mainWindow.getContentSize();
  const leftReserve = 280;
  const rightReserve = 340;
  const topReserve = 56;
  aiView.setBounds({
    x: leftReserve,
    y: topReserve,
    width: Math.max(460, width - leftReserve - rightReserve),
    height: Math.max(400, height - topReserve),
  });
}

function aiInjectionScript(payload) {
  return `(async () => {
    const text = ${JSON.stringify(payload)};
    const candidates = [
      'textarea[data-testid*="message"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="ask"]',
      'textarea[placeholder*="Prompt"]',
      'textarea[placeholder*="prompt"]',
      'textarea[aria-label*="Message"]',
      'textarea[aria-label*="message"]',
      'textarea[name*="message"]',
      'textarea[name*="prompt"]',
      'textarea',
      '[contenteditable="true"][role="textbox"]',
      '[contenteditable="true"][aria-label*="Message"]',
      '[contenteditable="true"][aria-label*="message"]',
      '[contenteditable="true"][data-placeholder*="message"]',
      '[contenteditable="true"]',
      'input[type="text"][placeholder*="Message"]',
      'input[type="text"][placeholder*="message"]',
      'input[type="text"][aria-label*="Message"]',
      'input[placeholder*="Ask anything"]',
      '[data-testid*="textbox"]',
      '[data-testid*="composer"] [contenteditable="true"]'
    ];
    const usable = node => {
      if (!node || !node.isConnected) return false;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      return node.getClientRects().length > 0 && !node.disabled;
    };
    let el = null;
    for (const selector of candidates) {
      const node = document.querySelector(selector);
      if (usable(node)) { el = node; break; }
    }
    if (!el) return { ok:false, reason:'AI_INPUT_NOT_FOUND' };
    el.focus();
    if (el.matches('textarea,input')) {
      const ctor = el.tagName === 'INPUT' ? HTMLInputElement : HTMLTextAreaElement;
      const setter = Object.getOwnPropertyDescriptor(ctor.prototype, 'value')?.set;
      if (setter) setter.call(el, text); else el.value = text;
    } else {
      let inserted = false;
      try { document.execCommand('selectAll', false); inserted = document.execCommand('insertText', false, text); } catch {}
      if (!inserted) { el.textContent = text; el.innerText = text; }
    }
    el.dispatchEvent(new InputEvent('beforeinput', { bubbles:true, inputType:'insertText', data:text }));
    el.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertText', data:text }));
    el.dispatchEvent(new Event('change', { bubbles:true }));
    await new Promise(resolve => setTimeout(resolve, 250));

    const buttons = [
      'button[data-testid*="send"]',
      'button[data-testid*="submit"]',
      'button[data-testid*="ask"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="Submit"]',
      'button[aria-label*="Ask"]',
      'button[aria-label*="Send message"]',
      'button[aria-label*="Envoyer"]',
      'button[aria-label*="Enviar"]',
      'button[aria-label*="Envia"]',
      'button[aria-label*="送信"]',
      'button[aria-label*="发送"]',
      'button[aria-label*="Enviar mensagem"]',
      'button[title*="Send"]',
      'button[title*="send"]',
      'button[title*="Send message"]',
      'button[type="submit"]'
    ];
    let button = null;
    for (const selector of buttons) {
      const node = document.querySelector(selector);
      if (usable(node)) { button = node; break; }
    }
    const form = el.closest('form');
    if (!button && form) {
      button = Array.from(form.querySelectorAll('button')).find(node => usable(node)) || null;
      if (!button && typeof form.requestSubmit === 'function') { form.requestSubmit(); return { ok:true, mode:'form-submit' }; }
    }
    if (!button) {
      const nearby = el.closest('form, [role="form"], div') || document.body;
      const candidates = Array.from(nearby.querySelectorAll('button')).filter(node => usable(node));
      button = candidates.find(node => /^(send|submit|ask|generate|go)$/i.test((node.innerText || node.getAttribute('aria-label') || '').trim())) || null;
    }
    if (button) { button.click(); return { ok:true, mode:'button', selector: button.getAttribute('aria-label') || button.getAttribute('data-testid') || button.tagName }; }
    el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));
    el.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',bubbles:true}));
    return { ok:true, mode:'enter' };
  })()`;
}

async function sendTextToAI(text) {
  if (!aiView) return { ok:false, error:'AI_SESSION_NOT_OPEN' };
  if (!isUsableAIWebContents(aiView)) return { ok:false, reason:'AI_PAGE_NOT_READY', error:'The AI page is still loading or has not initialized.' };
  try {
    return await Promise.race([
      aiView.webContents.executeJavaScript(aiInjectionScript(text), true),
      new Promise(resolve => setTimeout(() => resolve({ ok:false, reason:'AI_SCRIPT_TIMEOUT', error:'AI page script timed out.' }), 12000))
    ]);
  } catch (error) {
    return { ok:false, reason:'AI_SCRIPT_ERROR', error:error.message };
  }
}

async function diagnoseAIPage() {
  if (!aiView) return { ok:false, error:'AI_SESSION_NOT_OPEN' };
  const script = `(() => {
    const visible = n => {
      if (!n || !n.isConnected) return false;
      const style = getComputedStyle(n);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      return n.getClientRects().length > 0;
    };
    const selectors = {
      input: [
        'textarea[placeholder*="Message"]','textarea[placeholder*="message"]','textarea[placeholder*="Ask"]','textarea[placeholder*="ask"]',
        'textarea[placeholder*="Prompt"]','textarea[placeholder*="prompt"]','textarea[aria-label*="Message"]','textarea[name*="message"]',
        'textarea[name*="prompt"]','textarea','[contenteditable="true"][role="textbox"]','[contenteditable="true"][aria-label*="Message"]','[contenteditable="true"]',
        'input[type="text"][placeholder*="Message"]','input[type="text"][placeholder*="message"]'
      ],
      send: [
        'button[data-testid*="send"]','button[data-testid*="submit"]','button[data-testid*="ask"]','button[aria-label*="Send"]',
        'button[aria-label*="send"]','button[aria-label*="Submit"]','button[aria-label*="Ask"]','button[aria-label*="Envoyer"]',
        'button[aria-label*="Enviar"]','button[aria-label*="Envia"]','button[aria-label*="送信"]','button[aria-label*="发送"]',
        'button[aria-label*="Enviar mensagem"]','button[title*="Send"]',
        'button[title*="send"]','button[type="submit"]'
      ],
      assistant: [
        '[data-message-author-role="assistant"]','[data-testid*="assistant"]','[data-role="assistant"]','[role="assistant"]',
        '[aria-label*="assistant"]','[aria-label*="Assistant"]','main [class*="assistant"]','main [class*="response"]',
        'main [class*="message"] [data-author="assistant"]','main article','[role="article"]'
      ]
    };
    const sample = key => selectors[key].flatMap(selector => Array.from(document.querySelectorAll(selector)).filter(visible).slice(0,3).map(n => ({selector,tag:n.tagName,text:(n.innerText||n.getAttribute('aria-label')||n.getAttribute('placeholder')||'').slice(0,120)}))).slice(0,8);
    return { ok:true, url:location.href, title:document.title, inputs:sample('input'), sendButtons:sample('send'), assistantNodes:sample('assistant') };
  })()`;
  try { return await aiView.webContents.executeJavaScript(script, true); }
  catch (error) { return { ok:false, error:error.message }; }
}

async function readLatestAssistantText() {
  if (!aiView) return '';
  const script = `(() => {
    const selectors = [
      '[data-message-author-role="assistant"]',
      '[data-testid*="assistant"]',
      '[data-role="assistant"]',
      '[role="assistant"]',
      '[aria-label*="assistant"]',
      '[aria-label*="Assistant"]',
      '[data-testid^="conversation-turn-"] [data-message-author-role="assistant"]',
      'main [class*="assistant"]',
      'main [class*="response"]',
      'main [class*="message"] [data-author="assistant"]',
      'main article',
      '[role="article"]'
    ];
    const nodes = [];
    for (const selector of selectors) document.querySelectorAll(selector).forEach(n => nodes.push(n));
    const unique = Array.from(new Set(nodes));
    const visible = unique.filter(n => {
      if (!n || !n.innerText || !n.isConnected) return false;
      const style = getComputedStyle(n);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && n.getClientRects().length > 0;
    });
    return visible.length ? visible[visible.length - 1].innerText.trim() : '';
  })()`;
  try { return await aiView.webContents.executeJavaScript(script, false); } catch { return ''; }
}

function extractToolBlock(text) {
  return extractAIToolRequest(text);
}

function sendToRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
}

function callAgent(action, params = {}, sessionId) {
  return new Promise(async resolve => {
    const token = getAgentToken();
    const requestId = `desk-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    if (!token) return resolve({ success:false, error:{ code:'TOKEN_MISSING', message:'ULAB Agent token is unavailable', requestId } });
    let socket;
    try { socket = await getBridgeAgentSocket(); }
    catch (error) { return resolve({ success:false, error:{ code:'AGENT_ERROR', message:error.message, requestId } }); }
    let settled = false;
    const cleanup = () => {
      socket.off('message', onMessage);
      socket.off('close', onClose);
    };
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(result);
    };
    const onMessage = data => {
      try {
        const message = JSON.parse(data.toString('utf8'));
        if (message?.requestId === requestId) finish(message);
      } catch {
        finish({ success:false, error:{ code:'INVALID_RESPONSE', message:'Invalid Agent response', requestId } });
      }
    };
    const onClose = () => finish({ success:false, error:{ code:'AGENT_OFFLINE', message:'Agent connection was closed', requestId } });
    const timer = setTimeout(() => finish({ success:false, error:{ code:'TIMEOUT', message:'Agent request timed out', requestId } }), 10000);
    socket.on('message', onMessage);
    socket.once('close', onClose);
    try { socket.send(JSON.stringify({ requestId, action, token, sessionId, params })); }
    catch (error) { finish({ success:false, error:{ code:'AGENT_ERROR', message:error.message, requestId } }); }
  });
}

function toolResultPrompt(tool, result) {
  let serialized = JSON.stringify({
    id: tool.id || null,
    action: tool.action,
    success: result.success,
    data: result.data,
    error: result.error
  }, null, 2);
  if (serialized.length > 128 * 1024) {
    const preview = serialized.slice(0, 120 * 1024);
    serialized = JSON.stringify({
      id: tool.id || null,
      action: tool.action,
      success: result.success,
      truncated: true,
      preview,
      message: 'Tool result was truncated to keep the AI session responsive.'
    }, null, 2);
  }
  return 'ULAB TOOL RESULT\\n```json\\n' + serialized + '\\n```\\nContinue the task. Do not repeat the same tool call unless the result requires a retry.';
}

async function executeAIToolRequest(tool, fingerprint) {
  const status = await callAgent('workspace.session');
  if (!status.success || !status.data?.sessionId) {
    setAIBridgeState('AGENT_ERROR', { action:tool.action, error:status.error?.message || 'Select a workspace first' });
    sendToRenderer('ai-tool-status', { status:'error', action:tool.action, error:status.error?.message || 'Select a workspace first' });
    return { success:false, error:{ code:'WORKSPACE_NOT_FOUND', message:status.error?.message || 'Select a workspace first' } };
  }
  setAIBridgeState('VALIDATING', { action:tool.action });
  const result = await callAgent(tool.action, tool.params || {}, status.data.sessionId);
  setAIBridgeState(result.success ? 'RESULT_RETURNED' : 'AGENT_ERROR', { action:tool.action, requestId:tool.id || fingerprint });
  sendToRenderer('ai-tool-status', { status:result.success ? 'executed' : 'error', action:tool.action, result });
  const injection = await sendTextToAI(toolResultPrompt(tool, result));
  if (injection?.ok) {
    setAIBridgeState('AI_CONTINUES', { action:tool.action, requestId:tool.id || fingerprint });
  } else {
    setAIBridgeState('AGENT_ERROR', { action:tool.action, error:injection?.error || injection?.reason || 'Failed to return the result to the AI' });
  }
  return result;
}

function queueAIToolApproval(tool, fingerprint, workspaceSessionId) {
  if (pendingAIToolRequests.size > 0) {
    setAIBridgeState('APPROVAL_REQUIRED', { action:tool.action, error:'Another AI operation is awaiting approval' });
    return { ok:false, reason:'AI_APPROVAL_QUEUE_BUSY' };
  }
  const approvalId = 'ai-approval-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
  const context = createAIToolApprovalContext({
    approvalId,
    provider: aiProvider,
    workspaceSessionId,
    sessionGeneration: aiSessionGeneration,
  });
  const timer = setTimeout(() => {
    const pending = pendingAIToolRequests.get(approvalId);
    if (!pending) return;
    pendingAIToolRequests.delete(approvalId);
    const result = {
      success:false,
      error:{ code:'APPROVAL_EXPIRED', message:'User approval expired after 2 minutes' }
    };
    setAIBridgeState('AGENT_ERROR', { action:tool.action, approvalId, error:result.error.message });
    sendToRenderer('ai-tool-status', { status:'expired', action:tool.action, approvalId, result });
    void sendTextToAI(toolResultPrompt(tool, result));
  }, AI_APPROVAL_TTL_MS);
  pendingAIToolRequests.set(approvalId, { tool, fingerprint, context, timer });
  const params = tool.params || {};
  const resource = params.path || params.command || params.remote || tool.action;
  sendToRenderer('ai-approval-request', {
    approvalId,
    action:tool.action,
    params,
    resource,
    description:'AI طلب تنفيذ عملية محلية حساسة: ' + tool.action
  });
  setAIBridgeState('APPROVAL_REQUIRED', { action:tool.action, approvalId });
  sendToRenderer('ai-tool-status', { status:'approval_required', action:tool.action, approvalId, expiresAt:context.expiresAt });
  return { ok:true, approvalId };
}

async function processAIToolRequest(tool) {
  if (!tool || typeof tool.action !== 'string') return;
  const fingerprint = JSON.stringify({ id:tool.id || null, action:tool.action, params:tool.params || {} });
  if (fingerprint === lastProcessedToolBlock) return;
  lastProcessedToolBlock = fingerprint;
  setAIBridgeState('ACTION_DETECTED', { action:tool.action, requestId:tool.id || fingerprint });

  const disposition = getAIToolDisposition(tool.action);
  if (disposition === 'reject') {
    const result = { success:false, error:{ code:'INVALID_REQUEST', message:'AI tool action is not permitted: ' + tool.action } };
    setAIBridgeState('AGENT_ERROR', { action:tool.action, error:result.error.message });
    sendToRenderer('ai-tool-status', { status:'rejected', action:tool.action, result });
    await sendTextToAI(toolResultPrompt(tool, result));
    return;
  }
  if (disposition === 'approval') {
    const status = await callAgent('workspace.session');
    if (!status.success || !status.data?.sessionId) {
      const result = {
        success:false,
        error:{ code:'WORKSPACE_NOT_FOUND', message:status.error?.message || 'Select a workspace before approving AI operations' }
      };
      setAIBridgeState('AGENT_ERROR', { action:tool.action, error:result.error.message });
      sendToRenderer('ai-tool-status', { status:'error', action:tool.action, result });
      await sendTextToAI(toolResultPrompt(tool, result));
      return;
    }
    queueAIToolApproval(tool, fingerprint, status.data.sessionId);
    return;
  }
  await executeAIToolRequest(tool, fingerprint);
}

async function pollAIForTools() {
  if (!aiView) return;
  const assistant = await readLatestAssistantText();
  if (!assistant || assistant === lastObservedAssistantText) return;
  lastObservedAssistantText = assistant;
  const tool = extractToolBlock(assistant);
  if (!tool) return;
  await processAIToolRequest(tool);
}

async function startAIPolling() {
  clearInterval(aiPollTimer);
  lastProcessedToolBlock = '';
  lastObservedAssistantText = await readLatestAssistantText();
  setAIBridgeState('AI_CONNECTED');
  aiPollTimer = setInterval(() => { void pollAIForTools(); }, 900);
}

function stopAIPolling() {
  if (aiPollTimer) clearInterval(aiPollTimer);
  aiPollTimer = null;
  lastProcessedToolBlock = '';
  lastObservedAssistantText = '';
  for (const pending of pendingAIToolRequests.values()) clearTimeout(pending.timer);
  pendingAIToolRequests.clear();
  closeAgentSocket();
  setAIBridgeState('IDLE');
}

async function openAISession(providerId, customUrl = '') {
  const p = PROVIDERS[providerId] || PROVIDERS.chatgpt;
  let targetUrl = p.url;
  if (providerId === 'custom') {
    try {
      const parsed = new URL(String(customUrl || ''));
      if (String(customUrl || '').length > 2048) throw new Error('Custom AI URL is too long');
      if (parsed.protocol !== 'https:') throw new Error('Custom AI URL must use HTTPS');
      targetUrl = parsed.toString();
    } catch (error) {
      throw new Error(error?.message || 'A valid HTTPS Custom AI URL is required');
    }
  }
  closeAISession();
  aiSessionGeneration += 1;
  aiView = new WebContentsView({
    webPreferences: {
      partition: 'persist:ai-' + providerId,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  aiProvider = providerId;
  mainWindow.contentView.addChildView(aiView);
  aiView.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedAIUrl(providerId, targetUrl, url)) {
      void aiView.webContents.loadURL(url);
    }
    return { action:'deny' };
  });
  const guardAINavigation = (event, url) => {
    if (isTrustedAIUrl(providerId, targetUrl, url)) return;
    event.preventDefault();
    sendToRenderer('ai-session-status', { provider:providerId, status:'navigation-blocked', url });
  };
  aiView.webContents.on('will-navigate', guardAINavigation);
  aiView.webContents.on('will-redirect', guardAINavigation);
  aiView.webContents.on('did-fail-load', (_e, code, desc) => {
    sendToRenderer('ai-session-status', { provider:providerId, status:'error', error:desc || String(code) });
  });
  aiView.webContents.on('did-finish-load', () => {
    sendToRenderer('ai-session-status', { provider:providerId, status:'ready', url:aiView.webContents.getURL() });
    void startAIPolling();
  });
  aiView.webContents.on('did-navigate', () => { lastProcessedToolBlock = ''; });
  resizeAIView();
  const pageLoad = new Promise(resolve => {
    let settled = false;
    const cleanup = () => {
      aiView?.webContents.removeListener('did-finish-load', onFinish);
      aiView?.webContents.removeListener('did-fail-load', onFail);
    };
    const finish = result => {
      if (settled) return;
      settled = true;
      cleanup();
      clearTimeout(timer);
      resolve(result);
    };
    const onFinish = () => finish({ ok:true, complete:true });
    const onFail = (_event, code, desc, isMainFrame) => {
      if (!isMainFrame) return;
      finish({ ok:false, error:desc || String(code || 'AI_PAGE_LOAD_FAILED') });
    };
    const timer = setTimeout(() => {
      if (isUsableAIWebContents(aiView)) {
        finish({ ok:true, complete:false, slow:true });
      } else {
        finish({ ok:false, error:'AI_PAGE_LOAD_TIMEOUT' });
      }
    }, 12000);
    aiView.webContents.once('did-finish-load', onFinish);
    aiView.webContents.once('did-fail-load', onFail);
    void aiView.webContents.loadURL(targetUrl).catch(error => {
      finish({ ok:false, error:error?.message || 'Unable to load AI page' });
    });
  });

  const loadResult = await pageLoad;
  if (!loadResult.ok) {
    const message = loadResult.error || 'Unable to load AI page';
    sendToRenderer('ai-session-status', { provider:providerId, status:'error', error:message });
    closeAISession();
    return { ok:false, error:message };
  }
  if (!isUsableAIWebContents(aiView)) {
    closeAISession();
    return { ok:false, error:'AI_PAGE_NOT_READY' };
  }
  return {
    provider:providerId,
    name:p.name,
    url:aiView.webContents.getURL() || targetUrl,
    ready:true,
    loadingComplete:loadResult.complete === true,
    slowLoad:loadResult.slow === true
  };
}

function closeAISession() {
  stopAIPolling();
  if (aiView) aiSessionGeneration += 1;
  sendToRenderer('ai-session-status', { provider: aiProvider, status:'closed' });
  if (!aiView) return;
  try { mainWindow.contentView.removeChildView(aiView); } catch {}
  try { if (!aiView.webContents.isDestroyed()) aiView.webContents.destroy(); } catch { try { aiView.webContents.close(); } catch {} }
  aiView = null;
  aiProvider = null;
}

function createWindow() {
  startLocalAgent();
  mainWindow = new BrowserWindow({
    width:1440, height:900, minWidth:1100, minHeight:700,
    title:'ULAB — Universal Local AI Bridge',
    backgroundColor:'#050711',
    webPreferences:{ preload:path.join(__dirname,'preload.cjs'), contextIsolation:true, nodeIntegration:false, sandbox:true }
  });
  mainWindow.on('resize', resizeAIView);
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    const sameRenderer = url === currentUrl || (rendererUrl && url.startsWith(rendererUrl));
    if (url.startsWith('file://') || sameRenderer) return;
    const provider = providerForUrl(url);
    if (provider) {
      event.preventDefault();
      void openAISession(provider);
      return;
    }
    if (/^https?:/i.test(url)) {
      event.preventDefault();
      void shell.openExternal(url);
      return;
    }
    event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    const provider = providerForUrl(url);
    if (provider) { void openAISession(provider); return {action:'deny'}; }
    if (/^https?:/i.test(url)) { void shell.openExternal(url); return {action:'deny'}; }
    return {action:'deny'};
  });
  if (rendererUrl) mainWindow.loadURL(rendererUrl);
  else mainWindow.loadFile(path.join(app.getAppPath(),'renderer','dist','index.html'));
}

async function callMCP(method, name, params = {}) {
  const token = getAgentToken();
  if (!token) return { ok:false, error:'ULAB Agent token is unavailable' };
  return await new Promise(resolve => {
    let parsed;
    try { parsed = new URL(mcpEndpoint); } catch { resolve({ok:false,error:'Invalid MCP endpoint'}); return; }
    const body = JSON.stringify({
      jsonrpc:'2.0',
      id:'ulab-ui-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
      method,
      params: { ...params, _meta:{ ...(params._meta || {}), 'io.modelcontextprotocol/protocolVersion':'2026-07-28' } },
    });
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname,
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(body),
        'Authorization':'Bearer ' + token,
        'MCP-Protocol-Version':'2026-07-28',
        'Mcp-Method':method,
        'Mcp-Name':name || method,
      },
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        let payload = null;
        try { payload = responseBody ? JSON.parse(responseBody) : null; } catch {}
        resolve({ ok:res.statusCode === 200, status:res.statusCode || 0, payload, error:res.statusCode === 200 ? undefined : (payload?.error || 'MCP request failed') });
      });
    });
    req.on('error', error => resolve({ok:false,error:error.message}));
    req.setTimeout(3500, () => { req.destroy(); resolve({ok:false,error:'MCP request timeout'}); });
    req.end(body);
  });
}

ipcMain.handle('agent-config', async () => ({ url: agentWsUrl, token: getAgentToken() }));
ipcMain.handle('mcp-config', async () => ({
  endpoint: mcpEndpoint,
  protocolVersion: '2026-07-28',
  bearerToken: getAgentToken(),
  scope: 'localhost-only / workspace-scoped',
  stdioCommand: app.isPackaged
    ? '\"' + agentEntryPath() + '\" --mcp --workspace \"%ULAB_WORKSPACE%\"'
    : 'node \"' + agentEntryPath() + '\" --mcp --workspace \"%ULAB_WORKSPACE%\"',
}));
ipcMain.handle('mcp-diagnostics', async () => {
  const discover = await callMCP('server/discover', 'server/discover', {
    _meta:{
      'io.modelcontextprotocol/clientInfo':{name:'ULAB Desktop',version:'3.10.1'},
      'io.modelcontextprotocol/clientCapabilities':{},
    },
  });
  if (!discover.ok) return { ok:false, stage:'server/discover', error:discover.error || 'MCP server is unreachable', status:discover.status || 0 };
  const list = await callMCP('tools/list', 'tools/list', {});
  if (!list.ok) return { ok:false, stage:'tools/list', error:list.error || 'MCP tools could not be listed', status:list.status || 0 };
  const call = await callMCP('tools/call', 'workspace_session', { name:'workspace_session', arguments:{} });
  if (!call.ok) return { ok:false, stage:'tools/call', error:call.error || 'MCP tool call failed', status:call.status || 0 };
  let workspace = null;
  try { workspace = JSON.parse(call.payload?.result?.content?.[0]?.text || 'null')?.data?.workspaceRoot || null; } catch {}
  return {
    ok:true,
    endpoint:mcpEndpoint,
    protocolVersion:discover.payload?.result?.supportedVersions?.[0] || '2026-07-28',
    server:discover.payload?._meta?.['io.modelcontextprotocol/serverInfo'] || discover.payload?.result?.serverInfo || null,
    toolCount:Array.isArray(list.payload?.result?.tools) ? list.payload.result.tools.length : 0,
    workspace,
  };
});

ipcMain.handle('workspace-pick', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select a ULAB workspace',
    properties: ['openDirectory', 'createDirectory']
  });
  return result.canceled ? { canceled: true } : { canceled: false, path: result.filePaths[0] || null };
});

ipcMain.handle('agent-health', async () => new Promise(resolve => {
  const req = http.get(agentHealthUrl, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => { try { resolve({ok:res.statusCode===200,data:JSON.parse(body)}); } catch { resolve({ok:false,error:'Invalid agent response'}); } });
  });
  req.on('error', err => resolve({ok:false,error:err.message}));
  req.setTimeout(3000, () => { req.destroy(); resolve({ok:false,error:'Agent timeout'}); });
}));

ipcMain.handle('ai-open', async (_event, payload) => {
  const providerId = typeof payload === 'string' ? payload : payload?.providerId;
  const customUrl = typeof payload === 'object' ? payload?.customUrl : '';
  if (typeof providerId !== 'string' || !Object.prototype.hasOwnProperty.call(PROVIDERS, providerId)) {
    return { ok:false, error:'Unknown AI provider' };
  }
  try { return await openAISession(providerId, customUrl); }
  catch (error) { closeAISession(); return { ok:false, error:error?.message || 'Unable to open AI session' }; }
});
ipcMain.handle('ai-approve', async (_event, payload) => {
  const approvalId = typeof payload?.approvalId === 'string' ? payload.approvalId : '';
  const pending = approvalId ? pendingAIToolRequests.get(approvalId) : null;
  if (!pending) {
    return { success:false, error:{ code:'INVALID_REQUEST', message:'AI approval request is missing or expired' } };
  }

  const status = await callAgent('workspace.session');
  const current = {
    provider: aiProvider,
    sessionGeneration: aiSessionGeneration,
    workspaceSessionId: status.data?.sessionId || null,
  };
  const validation = status.success && status.data?.sessionId
    ? validateAIToolApprovalContext(pending.context, current)
    : { valid:false, reason:'Active workspace session is unavailable' };

  if (!validation.valid) {
    clearTimeout(pending.timer);
    pendingAIToolRequests.delete(approvalId);
    const result = {
      success:false,
      error:{ code:'APPROVAL_CONTEXT_STALE', message:validation.reason }
    };
    setAIBridgeState('AGENT_ERROR', { action:pending.tool.action, approvalId, error:validation.reason });
    sendToRenderer('ai-tool-status', { status:'stale', action:pending.tool.action, approvalId, result });
    return result;
  }

  clearTimeout(pending.timer);
  pendingAIToolRequests.delete(approvalId);
  const tool = {
    ...pending.tool,
    params: { ...(pending.tool.params || {}), approved:true }
  };
  return executeAIToolRequest(tool, pending.fingerprint);
});

ipcMain.handle('ai-reject', async (_event, payload) => {
  const approvalId = typeof payload?.approvalId === 'string' ? payload.approvalId : '';
  const pending = approvalId ? pendingAIToolRequests.get(approvalId) : null;
  if (!pending) return { success:false, error:{ code:'INVALID_REQUEST', message:'AI approval request is missing or expired' } };
  clearTimeout(pending.timer);
  pendingAIToolRequests.delete(approvalId);
  const result = {
    success:false,
    error:{ code:'APPROVAL_REQUIRED', message:'User denied this AI operation' }
  };
  setAIBridgeState('AI_CONTINUES', { action:pending.tool.action, approvalId });
  sendToRenderer('ai-tool-status', { status:'denied', action:pending.tool.action, approvalId, result });
  const injection = await sendTextToAI(toolResultPrompt(pending.tool, result));
  if (!injection?.ok) {
    setAIBridgeState('AGENT_ERROR', { action:pending.tool.action, error:injection?.error || injection?.reason || 'Failed to return the denial to the AI' });
  }
  return { success:true, denied:true };
});

ipcMain.handle('ai-close', () => { closeAISession(); return {ok:true}; });
ipcMain.handle('ai-status', () => {
  const ready = isUsableAIWebContents(aiView);
  return {
    open:!!aiView,
    provider:aiProvider,
    url:ready ? (aiView.webContents.getURL() || null) : null,
    ready
  };
});
ipcMain.handle('ai-diagnostics', async () => diagnoseAIPage());
ipcMain.handle('ai-send-text', async (_event, text) => ({ result: await sendTextToAI(String(text || '')) }));
async function sendWhenAIReady(text, attempts = 8) {
  let lastResult = null;
  for (let i = 0; i < attempts; i++) {
    lastResult = await sendTextToAI(text);
    if (lastResult?.ok) return lastResult;
    if (lastResult?.reason !== 'AI_INPUT_NOT_FOUND') return lastResult;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return lastResult || { ok:false, error:'AI_INPUT_NOT_FOUND' };
}

ipcMain.handle('ai-send-context', async (_event, payload) => {
  const context = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  const protocol = `You are connected to ULAB Desktop. Work with the selected local workspace through ULAB tools only. When you need a local operation, emit exactly one fenced block using this format:
\`\`\`ulab-tool
{"action":"files.read","params":{"path":"relative/path"}}
\`\`\`
Supported actions include files.read, files.list, files.search, files.propose, files.approve, files.reject, files.write, files.delete, git.status, git.diff, git.commit, git.push, terminal.execute, testing.run, context.build, audit.log. Never claim an action was executed until ULAB returns a real tool result. For files.approve, files.reject, files.write, files.delete, git.commit, git.push, terminal.execute, and testing.run, ULAB will require explicit human approval. An AI response or an approved:true field from the AI is never user authorization.

ULAB WORKSPACE CONTEXT:
${context}`;
  const result = await sendWhenAIReady(protocol);
  if (result?.ok) {
    setAIBridgeState('AI_CONTINUES', { action:'context.send' });
  } else {
    let errorMessage = result?.error || result?.reason || 'AI input could not be located. Sign in to the AI service and retry.';
    if (result?.reason === 'AI_INPUT_NOT_FOUND') {
      const diagnostics = await diagnoseAIPage();
      if (diagnostics?.ok) {
        errorMessage += ' Page diagnostics: ' + (diagnostics.inputs?.length || 0) + ' input, ' + (diagnostics.sendButtons?.length || 0) + ' send, ' + (diagnostics.assistantNodes?.length || 0) + ' assistant matches.';
      }
    }
    setAIBridgeState('AGENT_ERROR', {
      action:'context.send',
      error: errorMessage
    });
  }
  return result;
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  });
  app.on('before-quit', () => stopLocalAgent());
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
