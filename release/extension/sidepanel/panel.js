// ULAB Extension â€” authenticated local-agent side panel

let backgroundPort = null;
let isConnected = false;
let currentWorkspace = null;
let fileTree = [];
let selectedFiles = new Set();
let searchTimeout = null;

const $ = (id) => document.getElementById(id);

function setText(id, text) {
  const element = $(id);
  if (element) element.textContent = text;
}

function setVisible(id, visible) {
  const element = $(id);
  if (element) element.style.display = visible ? 'block' : 'none';
}

function showStatus(message, kind = 'neutral') {
  const element = $('connection-status');
  if (!element) return;
  element.textContent = message;
  element.dataset.kind = kind;
}

function connectToBackground() {
  backgroundPort = chrome.runtime.connect({ name: 'sidepanel' });
  backgroundPort.onMessage.addListener(handleBackgroundMessage);
  backgroundPort.onDisconnect.addListener(() => {
    backgroundPort = null;
    updateConnectionStatus(false);
  });
  backgroundPort.postMessage({ type: 'get_status' });
}

function handleBackgroundMessage(message) {
  if (message.type === 'status') {
    if (message.agentUrl) $('agent-url').value = message.agentUrl;
    updateConnectionStatus(Boolean(message.isConnected));
    return;
  }
  if (message.type === 'settings_saved') {
    if (message.agentUrl) $('agent-url').value = message.agentUrl;
    showStatus(message.hasToken ? 'Settings saved. Click Connect Agent.' : 'Settings saved. Add a Security Token.', message.hasToken ? 'success' : 'warning');
    return;
  }
  if (message.type === 'agent_disconnected') {
    updateConnectionStatus(false);
    showStatus(message.reason || 'Local agent disconnected.', 'warning');
    return;
  }
  if (message.type === 'agent_message') handleAgentMessage(message.data || {});
}

function updateConnectionStatus(connected) {
  isConnected = connected;
  const status = $('status');
  const button = $('connect-btn');
  if (status) status.classList.toggle('connected', connected);
  const statusText = document.querySelector('#status .status-text');
  if (statusText) statusText.textContent = connected ? 'Connected' : 'Disconnected';
  setText('connection-status', connected ? 'Authenticated local agent connection established.' : 'Not connected to local agent.');
  if (button) {
    button.textContent = connected ? 'Disconnect Agent' : 'Connect Agent';
    button.classList.toggle('btn-primary', !connected);
    button.classList.toggle('btn-secondary', connected);
  }
  setVisible('project-section', connected);
  if (!connected) {
    setVisible('explorer-section', false);
    setVisible('context-section', false);
    setVisible('permissions-section', false);
    currentWorkspace = null;
  }
}

function sendAgentAction(action, params = {}) {
  if (!backgroundPort || !isConnected) {
    showStatus('Connect to the Local Agent first.', 'warning');
    return;
  }
  backgroundPort.postMessage({ type: 'agent_action', data: { action, params } });
}

function handleAgentMessage(message) {
  if (message.success === false) {
    showStatus(message.error?.message || 'Agent request failed.', 'error');
    return;
  }
  if (message.action === 'workspace.selected') {
    currentWorkspace = message.data || {};
    setText('project-name', currentWorkspace.workspaceName || currentWorkspace.name || currentWorkspace.workspaceRoot || 'Workspace');
    $('workspace-path').value = currentWorkspace.workspaceRoot || $('workspace-path').value;
    setVisible('explorer-section', true);
    setVisible('context-section', true);
    setVisible('permissions-section', true);
    selectedFiles.clear();
    updateContextCount();
    sendAgentAction('files.list', { path: '.', recursive: true });
    showStatus('Workspace selected and session is active.', 'success');
    return;
  }
  if (message.action === 'files.list') {
    fileTree = Array.isArray(message.data) ? message.data : [];
    renderFileTree(fileTree);
    return;
  }
  if (message.action === 'files.search') {
    renderSearchResults(Array.isArray(message.data) ? message.data : []);
    return;
  }
  if (message.action === 'context.built') {
    const files = Array.isArray(message.data?.files) ? message.data.files : [];
    const excluded = Array.isArray(message.data?.excludedSecrets) ? message.data.excludedSecrets.length : 0;
    setText('context-count', `${files.length} files included in context`);
    setText('selected-files', excluded ? `${excluded} sensitive file(s) excluded automatically.` : 'Context built successfully. Sensitive files remain excluded.');
  }
}

function renderFileTree(files, container = null) {
  const tree = container || $('file-tree');
  if (!tree) return;
  if (!container) tree.replaceChildren();
  files.forEach((file) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    if (file.type === 'directory') {
      item.innerHTML = '<span class="folder-toggle">â–¶</span><span class="file-icon">ðŸ“</span><span class="file-name"></span>';
      item.querySelector('.file-name').textContent = file.name;
      const children = document.createElement('div');
      children.className = 'folder-children';
      children.hidden = true;
      if (Array.isArray(file.children)) renderFileTree(file.children, children);
      item.addEventListener('click', () => {
        children.hidden = !children.hidden;
        item.querySelector('.folder-toggle').textContent = children.hidden ? 'â–¶' : 'â–¼';
      });
      tree.append(item, children);
      return;
    }
    item.innerHTML = '<span class="file-icon">ðŸ“„</span><span class="file-name"></span>';
    item.querySelector('.file-name').textContent = file.name;
    item.classList.toggle('selected', selectedFiles.has(file.path));
    item.addEventListener('click', () => toggleFile(file.path, item));
    tree.appendChild(item);
  });
}

function toggleFile(path, item) {
  if (selectedFiles.has(path)) {
    selectedFiles.delete(path);
    item.classList.remove('selected');
  } else {
    selectedFiles.add(path);
    item.classList.add('selected');
  }
  updateContextCount();
}

function updateContextCount() {
  setText('context-count', `${selectedFiles.size} files selected`);
  const list = $('selected-files');
  if (!list) return;
  list.replaceChildren();
  selectedFiles.forEach((path) => {
    const row = document.createElement('div');
    row.className = 'selected-file';
    const label = document.createElement('span');
    label.textContent = path;
    const remove = document.createElement('button');
    remove.className = 'remove-file';
    remove.type = 'button';
    remove.textContent = 'Ã—';
    remove.setAttribute('aria-label', `Remove ${path}`);
    remove.addEventListener('click', () => { selectedFiles.delete(path); updateContextCount(); renderFileTree(fileTree); });
    row.append(label, remove);
    list.appendChild(row);
  });
}

function renderSearchResults(results) {
  const tree = $('file-tree');
  if (!tree) return;
  tree.replaceChildren();
  if (!results.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No matching files found.';
    tree.appendChild(empty);
    return;
  }
  results.forEach((file) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = '<span class="file-icon">ðŸ“„</span><span class="file-name"></span><span class="match-count"></span>';
    item.querySelector('.file-name').textContent = file.path;
    item.querySelector('.match-count').textContent = String(file.matches ?? 1);
    item.classList.toggle('selected', selectedFiles.has(file.path));
    item.addEventListener('click', () => toggleFile(file.path, item));
    tree.appendChild(item);
  });
}

function saveConnection() {
  const url = $('agent-url').value.trim();
  const token = $('agent-token').value.trim();
  if (!url) return showStatus('Enter the Local Agent WebSocket URL.', 'warning');
  if (!token) return showStatus('Enter the Security Token before saving.', 'warning');
  backgroundPort.postMessage({ type: 'configure_agent', url, token });
}

function toggleConnection() {
  if (isConnected) {
    backgroundPort.postMessage({ type: 'disconnect_agent' });
    return;
  }
  const url = $('agent-url').value.trim();
  const token = $('agent-token').value.trim();
  if (!url || !token) {
    showStatus('WebSocket URL and Security Token are required.', 'warning');
    return;
  }
  backgroundPort.postMessage({ type: 'configure_agent', url, token });
  backgroundPort.postMessage({ type: 'connect_agent' });
}

function selectWorkspace() {
  const path = $('workspace-path').value.trim();
  if (!path) {
    showStatus('Enter the absolute workspace path allowed by the Local Agent.', 'warning');
    $('workspace-path').focus();
    return;
  }
  sendAgentAction('workspace.select', { path });
}

function buildContext() {
  if (!selectedFiles.size) {
    showStatus('Select at least one file before building context.', 'warning');
    return;
  }
  sendAgentAction('context.build', { files: Array.from(selectedFiles) });
}

function searchFiles(query) {
  const value = query.trim();
  if (!value) {
    renderFileTree(fileTree);
    return;
  }
  sendAgentAction('files.search', { query: value, maxResults: 100 });
}

document.addEventListener('DOMContentLoaded', () => {
  $('save-agent-btn').addEventListener('click', saveConnection);
  $('connect-btn').addEventListener('click', toggleConnection);
  $('select-project-btn').addEventListener('click', selectWorkspace);
  $('build-context-btn').addEventListener('click', buildContext);
  $('search-input').addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchFiles(event.target.value), 250);
  });
  $('workspace-path').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') selectWorkspace();
  });
  connectToBackground();
});





