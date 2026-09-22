const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ulabDesktop', {
  platform: process.platform,
  isDesktop: true,
  agentHealth: () => ipcRenderer.invoke('agent-health'),
  agentConfig: () => ipcRenderer.invoke('agent-config'),
  mcpConfig: () => ipcRenderer.invoke('mcp-config'),
  mcpDiagnostics: () => ipcRenderer.invoke('mcp-diagnostics'),
  chooseWorkspace: () => ipcRenderer.invoke('workspace-pick'),
  openAI: (provider) => ipcRenderer.invoke('ai-open', provider),
  closeAI: () => ipcRenderer.invoke('ai-close'),
  aiStatus: () => ipcRenderer.invoke('ai-status'),
  aiDiagnostics: () => ipcRenderer.invoke('ai-diagnostics'),
  aiApprove: (approvalId, remember = false) => ipcRenderer.invoke('ai-approve', { approvalId, remember }),
  aiReject: (approvalId) => ipcRenderer.invoke('ai-reject', { approvalId }),
  sendAIText: (text) => ipcRenderer.invoke('ai-send-text', text),
  sendAIContext: (payload) => ipcRenderer.invoke('ai-send-context', payload),
  previewStart: () => ipcRenderer.invoke('preview-start'),
  previewStop: () => ipcRenderer.invoke('preview-stop'),
  previewStatus: () => ipcRenderer.invoke('preview-status'),
  onPreviewStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('preview-status', handler);
    return () => ipcRenderer.removeListener('preview-status', handler);
  },
  onAIApprovalRequest: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ai-approval-request', handler);
    return () => ipcRenderer.removeListener('ai-approval-request', handler);
  },
  onAIBridgeState: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ai-bridge-state', handler);
    return () => ipcRenderer.removeListener('ai-bridge-state', handler);
  },
  onAIStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ai-session-status', handler);
    return () => ipcRenderer.removeListener('ai-session-status', handler);
  },
  onAIToolStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ai-tool-status', handler);
    return () => ipcRenderer.removeListener('ai-tool-status', handler);
  }
});
