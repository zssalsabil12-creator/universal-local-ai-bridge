




const { app, BrowserWindow, ipcMain, WebContentsView, dialog } = require('electron');
const { shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const { getAIToolDisposition, extractAIToolRequest, isTrustedAIUrl, createAIToolApprovalContext, validateAIToolApprovalContext, AI_APPROVAL_TTL_MS } = require('./aiBridgeSecurity.cjs');
const { isUsableAIWebContents } = require('./aiBridgeRuntime.cjs');
const { buildAIInteractionScript, buildAIProbeScript, buildAssistantTextScript, buildLatestUserTextScript, buildLatestAIToolBlockScript, buildHideULABControlScript, buildHideULABToolCallScript, buildHideULABAssistantRequestScript, buildInstallULABSanitizerScript } = require('./aiBridgeDom.cjs');
const { isLocalProjectWorkRequest } = require('./aiBridgeIntent.cjs');
const { shouldRecoverBridgeControl: shouldRecoverBridgeControlFromModule } = require('./aiBridgeRecovery.cjs');
let agentProcess = null;
let agentStartInFlight = null;
let agentRestartAttempts = 0;
let shuttingDown = false;
let bridgeAgentSocket = null;
let bridgeAgentConnecting = null;
let aiBridgeState = 'IDLE';
let previewProcess = null;
let previewWorkspaceRoot = null;
let previewUrl = null;
let previewOutput = '';
let previewStartPromise = null;

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

function checkLocalAgentHealth() {
  return new Promise(resolve => {
    const req = http.get(agentHealthUrl, res => {
      res.resume();
      res.on('end', () => resolve(res.statusCode === 200));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => { req.destroy(); resolve(false); });
  });
}

async function startLocalAgent() {
  if (shuttingDown) return false;
  if (agentProcess && !agentProcess.killed) return true;
  if (agentStartInFlight) return agentStartInFlight;

  agentStartInFlight = (async () => {
    if (await checkLocalAgentHealth()) {
      agentRestartAttempts = 0;
      sendToRenderer('agent-status', { running:true, healthy:true });
      return true;
    }

    const entry = agentEntryPath();
    if (!fs.existsSync(entry)) {
      const message = 'Agent executable not found: ' + entry;
      sendToRenderer('agent-log', message);
      return false;
    }

    const { spawn } = require('child_process');
    const packagedBinary = app.isPackaged && entry.toLowerCase().endsWith('.exe');
    const command = packagedBinary ? entry : process.execPath;
    const args = packagedBinary ? ['--port', '19999'] : [entry, '--port', '19999'];
    const env = { ...process.env };
    if (!packagedBinary) env.ELECTRON_RUN_AS_NODE = '1';

    try {
      agentProcess = spawn(command, args, {
        env,
        cwd: path.dirname(entry),
        windowsHide: true,
        detached: false,
        stdio: 'ignore',
      });
    } catch (error) {
      agentProcess = null;
      sendToRenderer('agent-log', 'Agent spawn error: ' + error.message);
      return false;
    }

    agentProcess.once('error', error => {
      sendToRenderer('agent-log', 'Agent start error: ' + error.message);
      agentProcess = null;
    });
    agentProcess.once('exit', (code, signal) => {
      agentProcess = null;
      sendToRenderer('agent-status', { running:false, code, signal });
      if (!shuttingDown && agentRestartAttempts < 3) {
        agentRestartAttempts += 1;
        setTimeout(() => { void startLocalAgent(); }, 1000);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 900));
    const healthy = await checkLocalAgentHealth();
    if (healthy) {
      agentRestartAttempts = 0;
      sendToRenderer('agent-status', { running:true, healthy:true });
      return true;
    }
    sendToRenderer('agent-log', 'Agent started but health check is not ready yet.');
    return true;
  })().finally(() => {
    agentStartInFlight = null;
  });

  return agentStartInFlight;
}

function stopPreviewProcess() {
  const proc = previewProcess;
  previewProcess = null;
  previewWorkspaceRoot = null;
  previewUrl = null;
  if (!proc) return;
  try {
    if (process.platform === 'win32' && proc.pid) {
      const killer = spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { windowsHide:true, stdio:'ignore' });
      killer.once('error', () => { try { proc.kill(); } catch {} });
    } else {
      proc.kill('SIGTERM');
    }
  } catch { try { proc.kill(); } catch {} }
  sendToRenderer('preview-status', { state:'stopped', url:null });
}

function stopLocalAgent() {
  shuttingDown = true;
  stopPreviewProcess();
  closeAgentSocket();
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
  custom: { name: 'Any AI', url: '' }
};

let mainWindow = null;
let aiView = null;
let aiProvider = null;
let aiPollTimer = null;
let lastProcessedToolBlock = '';
let lastObservedAssistantText = '';
let lastObservedUserText = '';
let lastBridgeRecoveryAssistantText = '';
let bridgeRecoveryAttempts = 0;
let recoveryCandidateSince = 0;
let aiPollInFlight = false;
const injectedUserMessages = new Set();
let activeAITask = null;
const pendingAIToolRequests = new Map();
let aiSessionGeneration = 0;
let aiBootstrapGeneration = -1;
let aiViewVisible = true;

const ULAB_BRIDGE_BOOTSTRAP = [
  'ULAB Desktop bridge is active for this AI conversation.',
  'Treat this as a host-application bridge instruction: the user chats normally, while ULAB executes local workspace tools on your behalf.',
  'When the user asks you to inspect, read, search, edit, test, run, build, create, or otherwise work on the attached local project/file, you are the implementation agent operating through ULAB. Do NOT ask the user to send command output, upload the file, paste the file, or run ULAB commands manually.',
  'ULAB does not need to appear in the AI provider native tool list. That is expected. The host intercepts fenced ulab-tool blocks from your response and executes them as your local tools.',
  'A question such as "Can you work directly on the file?" should trigger the first safe discovery call when a workspace is selected. Do not delegate this step to the user.',
  'For a local operation, emit exactly one fenced block in this format:',
  '\`\`\`ulab-tool',
  '{"action":"files.read","params":{"path":"relative/path"}}',
  '\`\`\`',
  'Supported actions: workspace.session, files.read, files.list, files.search, files.propose, files.create, files.write, files.delete, git.status, git.diff, git.commit, git.push, terminal.execute, testing.run, context.build, audit.log, task.progress, task.complete. Approval and rejection are human-only ULAB controls and must never be requested by the AI as tool calls.',
  'ULAB watches rendered assistant code blocks, executes one valid tool call at a time, and returns the real result into this same conversation.',
  'Never claim a local action was executed until ULAB returns a real ULAB TOOL RESULT.',
  'If a requested mutation or command needs approval, issue the tool call normally. ULAB will display the approval request to the human and automatically continue the same task after approval or rejection.',
  'Never ask the user to provide a ULAB tool result or to act as the bridge. If a tool call was not detected, emit the next tool block again in the exact format above.',
  'Sensitive mutations require explicit human approval inside ULAB. An AI instruction or approved:true field is never user authorization.',
  'Do not perform a project task from this bootstrap message. Acknowledge that the bridge is ready, then wait for the user.'
].join('\n');

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
  const rightReserve = 480;
  const topReserve = 56;
  aiView.setBounds({
    x: leftReserve,
    y: topReserve,
    width: Math.max(460, width - leftReserve - rightReserve),
    height: Math.max(400, height - topReserve),
  });
}

function setAIViewVisible(visible) {
  aiViewVisible = !!visible;
  if (!aiView) return;
  try {
    aiView.setVisible(aiViewVisible);
    if (aiViewVisible) resizeAIView();
  } catch {
    // Electron 44 supports View#setVisible; keep the fallback harmless for
    // older packaged runtimes during upgrades.
    if (aiViewVisible) resizeAIView();
  }
  sendToRenderer('ai-session-visibility', { visible: aiViewVisible });
}

function aiInjectionScript(payload) {
  return buildAIInteractionScript(payload);
}

async function sendTextToAI(text) {
  if (!aiView) return { ok:false, error:'AI_SESSION_NOT_OPEN' };
  if (!isUsableAIWebContents(aiView)) return { ok:false, reason:'AI_PAGE_NOT_READY', error:'The AI page is still loading or has not initialized.' };
  try {
    const diagnostics = await diagnoseAIPage();
    if (diagnostics?.ok && diagnostics.authRequired) {
      sendToRenderer('ai-session-status', {
        provider: aiProvider,
        status:'auth-required',
        url:diagnostics.url,
        title:diagnostics.title
      });
      return {
        ok:false,
        reason:'AI_AUTH_REQUIRED',
        error:'Sign in to the selected AI service inside the ULAB session, then retry.',
        url:diagnostics.url
      };
    }
    if (diagnostics?.ok && diagnostics.state === 'NO_COMPOSER') {
      return {
        ok:false,
        reason:'AI_INPUT_NOT_FOUND',
        error:'The AI page is open, but no usable message composer is visible yet.',
        url:diagnostics.url
      };
    }
    const result = await Promise.race([
      aiView.webContents.executeJavaScript(aiInjectionScript(text), true),
      new Promise(resolve => setTimeout(() => resolve({ ok:false, reason:'AI_SCRIPT_TIMEOUT', error:'AI page script timed out.' }), 12000))
    ]);
    if (result?.ok) {
      rememberInjectedUserMessage(text);
      try {
        await aiView.webContents.executeJavaScript(buildHideULABControlScript(), false);
        await aiView.webContents.executeJavaScript(buildHideULABToolCallScript(), false);
      } catch {}
    }
    return result;
  } catch (error) {
    return { ok:false, reason:'AI_SCRIPT_ERROR', error:error.message };
  }
}

async function diagnoseAIPage() {
  if (!aiView) return { ok:false, error:'AI_SESSION_NOT_OPEN' };
  try { return await aiView.webContents.executeJavaScript(buildAIProbeScript(), true); }
  catch (error) { return { ok:false, error:error.message }; }
}

async function bootstrapAIConversation() {
  const generation = aiSessionGeneration;
  if (aiBootstrapGeneration === generation) return { ok:true, skipped:true };

  const diagnostics = await diagnoseAIPage();
  if (!diagnostics?.ok) return diagnostics;
  if (diagnostics.authRequired) {
    setAIBridgeState('AI_AUTH_REQUIRED', { action:'bridge.bootstrap' });
    return { ok:false, reason:'AI_AUTH_REQUIRED', error:'Sign in to the selected AI service before using the direct local bridge.' };
  }
  if (diagnostics.state === 'NO_COMPOSER') {
    return { ok:false, reason:'AI_INPUT_NOT_FOUND', error:'The AI composer is not ready yet.' };
  }

  const result = await sendTextToAI(ULAB_BRIDGE_BOOTSTRAP);
  if (result?.ok && aiSessionGeneration === generation) {
    aiBootstrapGeneration = generation;
    setAIBridgeState('AI_CONNECTED', { action:'bridge.ready' });
  }
  return result;
}

async function readLatestAssistantText() {
  if (!aiView) return '';
  try { return await aiView.webContents.executeJavaScript(buildAssistantTextScript(), false); } catch { return ''; }
}

async function readLatestAIToolBlock() {
  if (!aiView) return '';
  try { return await aiView.webContents.executeJavaScript(buildLatestAIToolBlockScript(), false); } catch { return ''; }
}

async function readLatestUserText() {
  if (!aiView) return '';
  try { return await aiView.webContents.executeJavaScript(buildLatestUserTextScript(), false); } catch { return ''; }
}

function extractToolBlock(text) {
  return extractAIToolRequest(text);
}

function normalizeInjectedMessage(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function rememberInjectedUserMessage(text) {
  const normalized = normalizeInjectedMessage(text);
  if (!normalized) return;
  injectedUserMessages.add(normalized);
  while (injectedUserMessages.size > 12) {
    const first = injectedUserMessages.values().next().value;
    injectedUserMessages.delete(first);
  }
}

function isInjectedUserMessage(text) {
  return injectedUserMessages.has(normalizeInjectedMessage(text));
}

function taskExecutionKickoffPrompt(task, snapshot, contextText = '') {
  const safeSnapshot = JSON.stringify(snapshot || {}, null, 2).slice(0, 90000);
  const safeContext = String(contextText || '').trim().slice(0, 140000);
  return [
    'ULAB ACTIVE WORK TASK',
    'The human just asked you to perform work inside the local ULAB workspace.',
    'Act as the implementation agent for that task. Do not merely explain what you would do.',
    'Do not ask the human to inspect files, run commands, paste output, upload files, or repeat the request.',
    'Use ULAB tools directly. Reading and discovery are automatic. For mutations or command execution, ULAB will pause for explicit human approval when required and then automatically return the result so you can continue.',
    'Start with the next required local tool call now. Emit exactly one fenced ulab-tool block and wait for ULAB TOOL RESULT before issuing the next tool call.',
    'For a project-wide task, begin with workspace.session or files.list. For a known file, use files.read. For code changes, read the relevant files first, then use files.write or files.create when the change is ready.',
    'For npm/build/test/dev-server work, use terminal.execute with the command and args; ULAB will enforce workspace scope and approval policy.',
    'You may emit exactly one task.progress meta-action between real operations to update ULAB with a short human-readable stage message. This action never touches the project.',
    'When every requested operation is verified complete, emit exactly one task.complete meta-action with a concise summary. This is the authoritative completion signal.',
    'Never claim that anything changed or ran until ULAB TOOL RESULT confirms it.',
    'Do not answer a local project task by drafting content for the human to copy and paste. Put the requested artifact/change into the workspace through ULAB tools whenever the task calls for a project edit or creation.',
    'Human task:',
    String(task || '').trim().slice(0, 16000),
    'Attached workspace snapshot:',
    safeSnapshot,
    safeContext ? 'Relevant project context already prepared by ULAB:\n' + safeContext : '',
    'When the task is fully complete, your final response must begin with ULAB_TASK_COMPLETE followed by a normal concise summary. This marker is an internal ULAB control signal and must not ask the human to copy or run anything.'
  ].filter(Boolean).join('\\n');
}


function shouldRecoverBridgeControl(assistantText) {
  const text = String(assistantText || '').trim();
  if (!text || text.length > 12000) return false;
  if (/```ulab-tool/i.test(text)) return false;
  return /(?:files\.(?:list|read|search)|ULAB\s+(?:tool|tools|bridge)|tool\s+(?:result|output)|tools?\s+(?:are\s+)?(?:not|un)available|tools?\s+(?:required|requested).*?(?:not available|unavailable)|(?:native|built-in)\s+tools?.*?(?:not available|unavailable)|command\s+output|ناتج\s+(?:تنفيذ|الأداة)|نتيجة\s+(?:تنفيذ|ULAB)|أرسل\s+لي.*(?:files\.|الملف)|ارس(?:ل|ل)\s+لي.*(?:files\.|الملف)|افتح\/حدد\s+الملف|أدوات\s+ULAB|العمل\s+مباشرة|الملف\s+مباشرة|لا أستطيع.*(?:الملف|المشروع|الجهاز)|لا أملك.*(?:الوصول|صلاحية)|لا يمكنني.*(?:تعديل|تشغيل|الوصول)|يمكنك.*(?:تزويدي|إرسال|إعطائي).*(?:تفاصيل|الملف|المحتوى|الكود)|(?:سأ|سا)قوم بكتابة.*(?:هنا|في المحادثة)|(?:لتقوم|لتقومي|قم|قومي)\s+ب?نسخ|يمكنك\s+نسخ|انسخ(?:ه|ها)?\s+.*(?:وأضف|وضع|إضافة)|you (?:cannot|can’t|can't|do not have).*(?:access|modify|run)|i (?:cannot|can’t|can't|do not have).*(?:access|modify|run)|please (?:send|upload|paste|provide).*(?:file|output|command|code))/i.test(text);
}

function bridgeRecoveryPrompt(task) {
  return [
    'ULAB EXECUTION RECOVERY',
    'Continue the human task below through the host bridge. Your previous reply did not issue a valid ULAB tool call.',
    'Do not ask the human to perform local operations. The host can read the workspace and execute tools for you.',
    'Do not say that ULAB tools are unavailable. Native provider tools are not required; the host executes the fenced block you emit. Emit exactly one next-step ulab-tool block now. Use workspace.session or files.list for discovery unless the task already identifies the exact file/action.',
    'After ULAB TOOL RESULT, continue the task with the next tool call until the task is complete.',
    'Human task:',
    String(task || '').trim().slice(0, 16000),
    'Format:',
    '\\`\\`\\`ulab-tool',
    '{"action":"workspace.session","params":{}}',
    '\\`\\`\\`'
  ].join('\\n');
}

async function primeWorkspaceForAI() {
  const status = await callAgent('workspace.session');
  if (!status.success || !status.data?.sessionId) return status;
  const listing = await callAgent('files.list', { path: '.', recursive: false }, status.data.sessionId);
  return {
    success: listing.success,
    data: { session: status.data, listing: listing.data },
    error: listing.error,
  };
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
  return 'ULAB TOOL RESULT\n```json\n' + serialized + '\n```\nContinue the task. Do not repeat the same tool call unless the result requires a retry. When every requested operation is complete, begin your final response with ULAB_TASK_COMPLETE followed by a concise normal summary.';
}


function tokenizeTerminalLine(line) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = re.exec(String(line || '')))) tokens.push(match[1] ?? match[2] ?? match[3]);
  return tokens;
}

function splitTerminalSequence(tool) {
  if (tool?.action !== 'terminal.execute') return null;
  const params = tool.params || {};
  const line = [params.command, ...(Array.isArray(params.args) ? params.args : [])]
    .filter(value => typeof value === 'string' && value.length > 0)
    .join(' ')
    .trim();
  if (!line || !/[;&]/.test(line)) return null;
  if (/[|<>\n\r]|\$\(|\|\|/.test(line)) return null;

  const parts = [];
  const operators = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      current += ch;
      if (ch === quote && line[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === ';') {
      if (current.trim()) parts.push(current.trim());
      current = '';
      operators.push(';');
      continue;
    }
    if (ch === '&' && line[i + 1] === '&') {
      if (current.trim()) parts.push(current.trim());
      current = '';
      operators.push('&&');
      i += 1;
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  if (quote || parts.length < 2 || operators.length !== parts.length - 1) return null;

  const steps = parts.map(tokenizeTerminalLine).filter(step => step.length > 0);
  if (steps.length !== parts.length) return null;
  return { steps, operators };
}

const CLEARLY_SAFE_TERMINAL = [
  /^git\s+(status|diff|log)$/i,
  /^npm\s+test(?:\s+--\s+--watchAll=false)?$/i,
  /^npm\s+run\s+(test|lint|build|typecheck)$/i,
  /^yarn\s+(test|lint|build)$/i,
  /^pnpm\s+(test|lint|build)$/i,
  /^cargo\s+(test|check)$/i,
  /^pytest$/i,
  /^go\s+test(?:\s+\.\s*\/\.\s*\.)?$/i,
];

function isClearlySafeTerminalStep(step) {
  const line = step.join(' ').trim();
  return CLEARLY_SAFE_TERMINAL.some(pattern => pattern.test(line));
}

async function executeTerminalSequence(tool, sessionId) {
  const plan = splitTerminalSequence(tool);
  if (!plan) return null;

  const allClearlySafe = plan.steps.every(isClearlySafeTerminalStep);
  if (!allClearlySafe && !tool.params?.approved) {
    return {
      needsApproval: true,
      result: {
        success: false,
        error: {
          code: 'APPROVAL_REQUIRED',
          message: 'A multi-step terminal operation requires one ULAB approval before any step is executed.'
        }
      }
    };
  }

  const stepResults = [];
  for (let i = 0; i < plan.steps.length; i += 1) {
    const [command, ...args] = plan.steps[i];
    const result = await callAgent('terminal.execute', {
      command,
      args,
      approved: !!tool.params?.approved
    }, sessionId);
    stepResults.push({
      step: i + 1,
      operatorBefore: i === 0 ? null : plan.operators[i - 1],
      command,
      args,
      success: !!result.success,
      data: result.data,
      error: result.error
    });
    if (!result.success) {
      return {
        needsApproval: result.error?.code === 'APPROVAL_REQUIRED' && !tool.params?.approved,
        result: {
          success: false,
          error: result.error,
          data: { sequence: stepResults, completedSteps: i }
        }
      };
    }
  }

  return {
    needsApproval: false,
    result: {
      success: stepResults.every(step => step.success),
      data: {
        sequence: stepResults,
        completedSteps: stepResults.length,
        totalSteps: plan.steps.length
      }
    }
  };
}

async function executeAIToolRequest(tool, fingerprint) {
  const status = await callAgent('workspace.session');
  if (!status.success || !status.data?.sessionId) {
    setAIBridgeState('AGENT_ERROR', { action:tool.action, error:status.error?.message || 'Select a workspace first' });
    sendToRenderer('ai-tool-status', { status:'error', action:tool.action, error:status.error?.message || 'Select a workspace first' });
    return { success:false, error:{ code:'WORKSPACE_NOT_FOUND', message:status.error?.message || 'Select a workspace first' } };
  }
  setAIBridgeState('VALIDATING', { action:tool.action });

  let result;
  if (tool.action === 'terminal.execute') {
    const sequence = await executeTerminalSequence(tool, status.data.sessionId);
    if (sequence?.needsApproval) {
      queueAIToolApproval(tool, fingerprint, status.data.sessionId);
      return sequence.result;
    }
    result = sequence?.result || await callAgent(tool.action, tool.params || {}, status.data.sessionId);
  } else {
    result = await callAgent(tool.action, tool.params || {}, status.data.sessionId);
  }

  if (!result.success && result.error?.code === 'APPROVAL_REQUIRED' && !tool.params?.approved &&
      (tool.action === 'terminal.execute' || tool.action === 'testing.run')) {
    queueAIToolApproval(tool, fingerprint, status.data.sessionId);
    return result;
  }

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
  const terminalPlan = splitTerminalSequence(tool);
  const isTerminalAction = tool.action === 'terminal.execute' || tool.action === 'testing.run';
  const resource = isTerminalAction
    ? (terminalPlan ? `${terminalPlan.steps.length} local project steps` : 'Local project command')
    : (params.path || params.remote || tool.action);
  const safeDetails = {
    source: 'ai-bridge',
    action: tool.action,
    approvalId,
    ...(terminalPlan ? { stepCount: terminalPlan.steps.length } : {}),
  };
  sendToRenderer('ai-approval-request', {
    approvalId,
    action:tool.action,
    params: safeDetails,
    resource,
    description: isTerminalAction
      ? 'ULAB needs your approval to execute a local project operation.'
      : 'ULAB needs your approval to apply a local workspace change.'
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
  try { await aiView?.webContents.executeJavaScript(buildHideULABAssistantRequestScript(), false); } catch {}

  if (tool.action === 'task.progress') {
    const message = String(tool.params?.message || tool.params?.stage || 'Working').trim().slice(0, 240);
    const rawProgress = Number(tool.params?.progress);
    sendToRenderer('ai-agent-task', {
      state:'progress',
      taskId:activeAITask?.id || null,
      stage:String(tool.params?.stage || '').trim().slice(0, 80),
      message,
      progress:Number.isFinite(rawProgress) ? Math.max(0, Math.min(100, rawProgress)) : null,
    });
    setAIBridgeState('WORKING', { action:'task.progress', taskId:activeAITask?.id || null });
    return;
  }
  if (tool.action === 'task.complete') {
    const completedTaskId = activeAITask?.id || null;
    const summary = String(tool.params?.summary || tool.params?.message || 'Task completed').trim().slice(0, 1000);
    activeAITask = null;
    bridgeRecoveryAttempts = 0;
    lastBridgeRecoveryAssistantText = '';
    recoveryCandidateSince = 0;
    setAIViewVisible(false);
    setAIBridgeState('AI_CONNECTED', { action:'bridge.task.complete', taskId:completedTaskId });
    sendToRenderer('ai-agent-task', { state:'completed', taskId:completedTaskId, summary });
    return;
  }

  // Terminal/test execution uses server-side command evaluation first. Safe
  // commands run without a modal; only commands that the Agent marks as
  // sensitive/approval-required reach the human approval gate.
  const disposition = (tool.action === 'terminal.execute' || tool.action === 'testing.run')
    ? 'auto'
    : getAIToolDisposition(tool.action);
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

async function pollAIForToolsImpl() {
  if (!aiView) return;

  // Once ULAB asks the human to approve a sensitive operation, freeze the
  // tool detector until that transaction is resolved. This prevents the
  // provider from producing a second request against the same approval ID.
  if (pendingAIToolRequests.size > 0) return;

  // Detect the human request independently from ULAB-generated control messages.
  // This lets the host intervene immediately instead of waiting for a prose reply.
  const latestUser = await readLatestUserText();
  const injected = !!latestUser && isInjectedUserMessage(latestUser);
  const newUserRequest = !!latestUser && latestUser !== lastObservedUserText && !injected;
  if (latestUser && latestUser !== lastObservedUserText) {
    lastObservedUserText = latestUser;
  }

  if (newUserRequest) {
    bridgeRecoveryAttempts = 0;
    lastBridgeRecoveryAssistantText = '';
    if (isLocalProjectWorkRequest(latestUser)) {
      activeAITask = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2,8),
        userText: latestUser,
        startedAt: Date.now(),
      };
      setAIViewVisible(false);
      setAIBridgeState('ACTION_DETECTED', { action:'bridge.task.kickoff', taskId:activeAITask.id });
      sendToRenderer('ai-agent-task', { state:'started', taskId:activeAITask.id, prompt:latestUser.slice(0, 600) });
      const snapshot = await primeWorkspaceForAI();
      if (snapshot?.success) {
        const kickoff = await sendTextToAI(taskExecutionKickoffPrompt(latestUser, snapshot.data));
        if (kickoff?.ok) {
          setAIBridgeState('AI_CONTINUES', { action:'bridge.task.kickoff', taskId:activeAITask.id });
        } else {
          setAIBridgeState('AGENT_ERROR', {
            action:'bridge.task.kickoff',
            taskId:activeAITask.id,
            error:kickoff?.error || kickoff?.reason || 'Task kickoff could not be sent'
          });
        }
      } else {
        setAIBridgeState('AGENT_ERROR', {
          action:'bridge.task.kickoff',
          taskId:activeAITask.id,
          error:snapshot?.error?.message || 'No active workspace selected'
        });
      }
      // The kickoff message is itself a ULAB control message. Do not treat it
      // as a second human task on the next poll cycle.
      return;
    }
    activeAITask = null;
  }

  // Provider UIs render markdown fences as code blocks. Check the latest
  // rendered ULAB tool block first, then fall back to normal assistant text.
  const renderedTool = await readLatestAIToolBlock();
  const renderedRequest = renderedTool ? extractToolBlock(renderedTool) : null;
  if (renderedRequest) {
    const fingerprint = JSON.stringify({
      id: renderedRequest.id || null,
      action: renderedRequest.action,
      params: renderedRequest.params || {}
    });
    if (fingerprint !== lastProcessedToolBlock) {
      await processAIToolRequest(renderedRequest);
      return;
    }
  }

  const assistant = await readLatestAssistantText();
  if (!assistant) {
    recoveryCandidateSince = 0;
    return;
  }
  if (assistant !== lastObservedAssistantText) {
    lastObservedAssistantText = assistant;
    recoveryCandidateSince = Date.now();
  }

  const tool = extractToolBlock(assistant);
  if (!tool) {
    const completion = /^(?:ULAB_TASK_COMPLETE\b|done\b|completed\b|finished\b|all set\b|task complete\b|i(?:'ve| have)\s+(?:created|updated|modified|finished|completed)|the\s+(?:file|changes|task)\s+(?:is|are)\s+(?:done|complete)|تم(?:ت|ّت)?(?: المهمة| العملية| إنشاء| تحديث| تعديل)?(?: بنجاح)?\b|اكتمل(?:ت)?|انته(?:ت|ى)|تم التنفيذ|تم إنشاء|تم تحديث|تم تعديل)/i.test(assistant.trim());
    if (completion && activeAITask) {
      const completedTaskId = activeAITask.id;
      activeAITask = null;
      bridgeRecoveryAttempts = 0;
      lastBridgeRecoveryAssistantText = '';
      recoveryCandidateSince = 0;
      // Keep the external AI worker hidden after completion so the native
      // ULAB code/preview surface remains visible. The AI chat is reopened
      // explicitly through the Bridge UI when the user needs it.
      setAIViewVisible(false);
      setAIBridgeState('AI_CONNECTED', { action:'bridge.task.complete', taskId:completedTaskId });
      sendToRenderer('ai-agent-task', { state:'completed', taskId:completedTaskId });
      return;
    }
    if (
      activeAITask &&
      Date.now() - recoveryCandidateSince < 900
    ) return;
    if (activeAITask && !completion && bridgeRecoveryAttempts < 4 && assistant !== lastBridgeRecoveryAssistantText && shouldRecoverBridgeControlFromModule(assistant)) {
      lastBridgeRecoveryAssistantText = assistant;
      bridgeRecoveryAttempts += 1;
      setAIBridgeState('ACTION_DETECTED', {
        action:'bridge.recovery',
        attempt:bridgeRecoveryAttempts,
        taskId:activeAITask.id
      });
      const recovery = await sendTextToAI(bridgeRecoveryPrompt(activeAITask.userText));
      if (!recovery?.ok) {
        setAIBridgeState('AGENT_ERROR', {
          action:'bridge.recovery',
          taskId:activeAITask.id,
          error:recovery?.error || recovery?.reason || 'Bridge recovery prompt could not be sent'
        });
      }
    }
    return;
  }
  await processAIToolRequest(tool);
}

async function pollAIForTools() {
  if (!aiView || aiPollInFlight) return;
  aiPollInFlight = true;
  try {
    await pollAIForToolsImpl();
  } finally {
    aiPollInFlight = false;
  }
}

async function startAIPolling() {
  clearInterval(aiPollTimer);
  lastProcessedToolBlock = '';
  lastObservedAssistantText = await readLatestAssistantText();
  lastObservedUserText = await readLatestUserText();
  lastBridgeRecoveryAssistantText = '';
  bridgeRecoveryAttempts = 0;
  recoveryCandidateSince = 0;
  injectedUserMessages.clear();
  activeAITask = null;
  setAIBridgeState('AI_CONNECTED');
  aiPollTimer = setInterval(() => { void pollAIForTools(); }, 700);
}

function stopAIPolling() {
  if (aiPollTimer) clearInterval(aiPollTimer);
  aiPollTimer = null;
  lastProcessedToolBlock = '';
  lastObservedAssistantText = '';
  lastObservedUserText = '';
  lastBridgeRecoveryAssistantText = '';
  bridgeRecoveryAttempts = 0;
  recoveryCandidateSince = 0;
  injectedUserMessages.clear();
  activeAITask = null;
  for (const pending of pendingAIToolRequests.values()) clearTimeout(pending.timer);
  pendingAIToolRequests.clear();
  closeAgentSocket();
  setAIBridgeState('IDLE');
}

async function initializeAIBridge() {
  await bootstrapAIConversation();
  if (aiView) await startAIPolling();
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
  setAIViewVisible(true);
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
    try { void aiView.webContents.executeJavaScript(buildInstallULABSanitizerScript(), false); } catch {}
    void initializeAIBridge();
  });
  aiView.webContents.on('did-navigate', () => {
    lastProcessedToolBlock = '';
    if (aiSessionGeneration !== aiBootstrapGeneration) void initializeAIBridge();
  });
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
  const diagnostics = await diagnoseAIPage();
  const authRequired = diagnostics?.ok === true && diagnostics.authRequired === true;
  sendToRenderer('ai-session-status', {
    provider:providerId,
    status:authRequired ? 'auth-required' : 'ready',
    url:diagnostics?.url || aiView.webContents.getURL() || targetUrl,
    title:diagnostics?.title || ''
  });
  return {
    provider:providerId,
    name:p.name,
    url:aiView.webContents.getURL() || targetUrl,
    ready:true,
    authRequired,
    sessionState:diagnostics?.state || 'UNKNOWN',
    diagnostics,
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
  aiViewVisible = true;
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
    ? '\"' + agentEntryPath() + '\" --mcp'
    : 'node \"' + agentEntryPath() + '\" --mcp',
}));
ipcMain.handle('mcp-diagnostics', async () => {
  const discover = await callMCP('server/discover', 'server/discover', {
    _meta:{
      'io.modelcontextprotocol/clientInfo':{name:'ULAB Desktop',version:'3.10.10'},
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
ipcMain.handle('ai-status', async () => {
  const ready = isUsableAIWebContents(aiView);
  const diagnostics = ready ? await diagnoseAIPage() : null;
  return {
    open:!!aiView,
    provider:aiProvider,
    url:ready ? (aiView.webContents.getURL() || null) : null,
    ready,
    authRequired:diagnostics?.authRequired === true,
    sessionState:diagnostics?.state || 'CLOSED',
  };
});
ipcMain.handle('ai-diagnostics', async () => diagnoseAIPage());
ipcMain.handle('ai-send-text', async (_event, text) => ({ result: await sendTextToAI(String(text || '')) }));

function parsePreviewUrl(text) {
  const match = String(text || '').match(/https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?[^\s)<>"']*/i);
  return match ? match[0].replace(/[.,;]+$/, '') : null;
}

async function startPreviewProcess() {
  if (previewStartPromise) return previewStartPromise;
  previewStartPromise = (async () => {
    const status = await callAgent('workspace.session');
    const workspaceRoot = status?.success ? status.data?.workspaceRoot : null;
    if (!workspaceRoot) return { ok:false, error:'Select a workspace before starting Preview' };

    if (previewProcess && previewWorkspaceRoot === workspaceRoot && previewUrl) {
      return { ok:true, running:true, url:previewUrl, output:previewOutput };
    }

    stopPreviewProcess();
    const packagePath = path.join(workspaceRoot, 'package.json');
    let pkg = null;
    try { pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')); } catch {
      return { ok:false, error:'No valid package.json was found in the active workspace' };
    }
    const scripts = pkg?.scripts || {};
    const scriptName = ['dev', 'start', 'preview'].find(name => typeof scripts[name] === 'string');
    if (!scriptName) {
      return { ok:false, error:'No supported Preview script found. Add a package.json dev, start, or preview script.' };
    }

    previewWorkspaceRoot = workspaceRoot;
    previewOutput = '';
    previewUrl = null;
    sendToRenderer('preview-status', { state:'starting', url:null, script:scriptName, output:'' });

    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const args = ['run', scriptName];
    const env = { ...process.env, FORCE_COLOR:'0' };
    previewProcess = spawn(command, args, { cwd:workspaceRoot, env, windowsHide:true, detached:false, shell:false, stdio:['ignore','pipe','pipe'] });

    const onData = chunk => {
      previewOutput = (previewOutput + String(chunk || '')).slice(-12000);
      const detected = parsePreviewUrl(previewOutput);
      if (detected && detected !== previewUrl) {
        previewUrl = detected;
        sendToRenderer('preview-status', { state:'running', url:previewUrl, script:scriptName, output:previewOutput });
      } else {
        sendToRenderer('preview-status', { state:'starting', url:previewUrl, script:scriptName, output:previewOutput });
      }
    };
    previewProcess.stdout?.on('data', onData);
    previewProcess.stderr?.on('data', onData);
    previewProcess.once('error', error => {
      sendToRenderer('preview-status', { state:'error', url:null, error:error.message, output:previewOutput });
      previewProcess = null;
    });
    previewProcess.once('exit', (code, signal) => {
      const wasCurrent = previewProcess;
      previewProcess = null;
      if (wasCurrent) sendToRenderer('preview-status', { state:'stopped', url:null, code, signal, output:previewOutput });
    });

    await new Promise(resolve => setTimeout(resolve, 1500));
    if (!previewProcess) return { ok:false, error:'Preview process exited during startup', output:previewOutput };
    return { ok:true, running:true, url:previewUrl, script:scriptName, output:previewOutput };
  })().finally(() => { previewStartPromise = null; });
  return previewStartPromise;
}

ipcMain.handle('preview-start', () => startPreviewProcess());
ipcMain.handle('preview-stop', () => { stopPreviewProcess(); return { ok:true }; });
ipcMain.handle('preview-status', () => ({ state:previewProcess ? (previewUrl ? 'running' : 'starting') : 'stopped', url:previewUrl, workspaceRoot:previewWorkspaceRoot, output:previewOutput }));
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
  const task = typeof payload === 'object' && payload?.query
    ? String(payload.query).trim().slice(0, 16000)
    : '';
  const preparedContext = typeof payload === 'object' ? String(payload?.context || '').trim() : '';
  if (task && isLocalProjectWorkRequest(task)) {
    activeAITask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2,8),
      userText: task,
      startedAt: Date.now(),
      source: 'context-panel',
    };
    bridgeRecoveryAttempts = 0;
    lastBridgeRecoveryAssistantText = '';
    recoveryCandidateSince = 0;
    setAIViewVisible(false);
    sendToRenderer('ai-agent-task', { state:'started', taskId:activeAITask.id, prompt:task.slice(0, 600) });
  } else {
    activeAITask = null;
  }

  if (task && isLocalProjectWorkRequest(task)) {
    const snapshot = await primeWorkspaceForAI();
    if (!snapshot?.success) {
      setAIViewVisible(true);
      activeAITask = null;
      const errorMessage = snapshot?.error?.message || 'No active workspace is available.';
      setAIBridgeState('AGENT_ERROR', { action:'context.send', error:errorMessage });
      sendToRenderer('ai-agent-task', { state:'error', error:errorMessage });
      return { ok:false, reason:'WORKSPACE_NOT_READY', error:errorMessage };
    }

    const prompt = taskExecutionKickoffPrompt(task, snapshot.data, preparedContext);
    const result = await sendWhenAIReady(prompt);
    if (result?.ok) {
      setAIBridgeState('AI_CONTINUES', { action:'context.send', taskId:activeAITask.id });
    } else {
      const errorMessage = result?.error || result?.reason || 'AI input could not be located.';
      setAIViewVisible(true);
      if (result?.reason === 'AI_AUTH_REQUIRED') {
        setAIBridgeState('AI_AUTH_REQUIRED', { action:'context.send', error:errorMessage, taskId:activeAITask.id });
      } else {
        setAIBridgeState('AGENT_ERROR', { action:'context.send', error:errorMessage, taskId:activeAITask.id });
      }
    }
    return result;
  }

  const context = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  const result = await sendWhenAIReady(context);
  if (result?.ok) {
    setAIBridgeState('AI_CONTINUES', { action:'context.send' });
  } else {
    setAIBridgeState(result?.reason === 'AI_AUTH_REQUIRED' ? 'AI_AUTH_REQUIRED' : 'AGENT_ERROR', {
      action:'context.send',
      error:result?.error || result?.reason
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
