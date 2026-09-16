import React, { useState, useEffect } from 'react';
import {
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Folder,
  Shield,
  Terminal,
  X,
  Play,
  Copy,
  Check,
  PowerOff,
  Key,
} from 'lucide-react';
import { localAgent, useAgentConnection } from '../utils/localAgent';

interface LocalAgentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocalAgentStatusModal({
  isOpen,
  onClose,
}: LocalAgentStatusModalProps) {
  const connection = useAgentConnection();
  const [agentUrl, setAgentUrl] = useState(localAgent.getServerUrl());
  const [token, setToken] = useState(localAgent.getToken());
  const [httpStatus, setHttpStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [isCopiedCmd, setIsCopiedCmd] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [workspacePath, setWorkspacePath] = useState(localAgent.getSession()?.workspaceRoot || '');

  const checkAgentHealth = async () => {
    setHttpStatus('checking');
    setStatusMessage(null);
    try {
      const health = await localAgent.checkHealth();
      if (health.online) {
        setHttpStatus('online');
        setAgentDetails(health);
      } else {
        setHttpStatus('offline');
        setAgentDetails(null);
      }
    } catch {
      setHttpStatus('offline');
      setAgentDetails(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setWorkspacePath(localAgent.getSession()?.workspaceRoot || '');
      checkAgentHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const launchCommand = `cd agent && npm install && npm start`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(launchCommand);
    setIsCopiedCmd(true);
    setTimeout(() => setIsCopiedCmd(false), 2000);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatusMessage('جاري الاتصال بالقناة الآمنة للوكيل المحلي (WebSocket)...');

    const ok = await localAgent.connect(agentUrl, token);
    setIsConnecting(false);
    if (ok) {
      setStatusMessage('تم الاتصال بنجاح وتوثيق القناة الآمنة.');
      const targetWorkspace = workspacePath.trim() || localAgent.getSession()?.workspaceRoot;
      if (targetWorkspace) {
        const selected = await localAgent.selectWorkspace(targetWorkspace);
        if (!selected.success) {
          setStatusMessage(`تم الاتصال، لكن تعذر تحديد مساحة العمل: ${selected.error?.message || 'مسار غير صالح'}`);
        }
      }
    } else {
      setStatusMessage('فشل الاتصال: تأكد من تشغيل الوكيل المحلي وصحة المنفذ أو الرمز.');
    }
  };

  const handleDisconnect = () => {
    localAgent.disconnect();
    setStatusMessage('تم قطع الاتصال بالوكيل المحلي.');
  };

  const isConnected = connection.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a] bg-[#161622]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 animate-pulse'
                  : connection.status === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-red-400'
              }`}
            />
            <h3 className="font-bold text-sm text-[#f1f5f9] flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              حالة اتصال ULAB Local Agent (Phase 2)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-[#202030] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-sm text-[#cbd5e1] max-h-[80vh] overflow-y-auto">
          {/* Status badge */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0a0a0f] border border-[#20202e]">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : connection.status === 'connecting' || httpStatus === 'checking' ? (
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="font-semibold text-xs text-[#e2e8f0]">
                  {isConnected
                    ? 'الـ Local Agent متصل ويعمل بقناة WebSocket موثقة'
                    : connection.status === 'connecting'
                    ? 'جاري إنشاء الاتصال بالوكيل المحلي...'
                    : httpStatus === 'online'
                    ? 'الوكيل المحلي متاح (HTTP Online) وجاهز لربط WebSocket'
                    : 'الـ Local Agent غير متصل حالياً'}
                </p>
                <p className="text-[11px] text-[#64748b]">
                  {isConnected
                    ? `إصدار الوكيل: v${connection.version || '1.0.0'} • المنصة: ${connection.platform}`
                    : 'قم بتشغيل الوكيل المحلي على جهازك لربطه ببيئة الويب مباشرة'}
                </p>
              </div>
            </div>
            <button
              onClick={checkAgentHealth}
              className="p-1.5 rounded bg-[#1e1e2d] hover:bg-[#2a2a3e] text-[#94a3b8] hover:text-white transition-colors text-xs flex items-center gap-1"
              title="إعادة فحص"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فحص</span>
            </button>
          </div>

          {/* Active Session Info (if connected) */}
          {connection.session ? (
            <div className="p-3.5 rounded-lg bg-[#0e1f18] border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  الجلسة النشطة (Active Workspace Session)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ID: {connection.session.sessionId.slice(0, 12)}...
                </span>
              </div>
              <div className="p-2 rounded bg-[#07130f] border border-emerald-500/30 text-xs font-mono text-emerald-300 truncate">
                {connection.session.workspaceRoot}
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {connection.session.permissions.read && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    READ
                  </span>
                )}
                {connection.session.permissions.write && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    WRITE (APPROVAL REQ)
                  </span>
                )}
                {connection.session.permissions.execute && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    EXECUTE
                  </span>
                )}
                {connection.session.permissions.delete && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    DELETE (APPROVAL REQ)
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Active Sandbox Boundary Notice */
            <div className="p-3.5 rounded-lg bg-[#0e1320] border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  مبدأ العزل الأمني: WORKSPACE-FIRST + SANDBOX-FIRST
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                  Active Sandbox
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                يقوم الـ Agent برفض أي طلب قراءة، كتابة، أو تشغيل أوامر يقع خارج مجلد العمل النشط:
              </p>
              <div className="flex items-center gap-2 p-2 rounded bg-[#07090e] border border-cyan-500/30 text-xs font-mono text-cyan-300">
                <Folder className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{workspacePath || 'لم يتم تحديد مسار بعد (اختر مجلد العمل)'}</span>
              </div>
            </div>
          )}

          {/* Launch Command */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#e2e8f0] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              كيفية تشغيل Local Agent على جهازك (Node.js):
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#07070c] border border-[#2a2a3a] font-mono text-xs text-purple-300">
              <span className="truncate" dir="ltr">
                {launchCommand}
              </span>
              <button
                onClick={handleCopyCommand}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e1e2d] hover:bg-[#2a2a3e] text-xs text-[#e2e8f0] transition-colors ml-2 flex-shrink-0"
              >
                {isCopiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedCmd ? 'تم النسخ' : 'نسخ الأمر'}</span>
              </button>
            </div>
          </div>

          {/* Connection Parameters & Authentication */}
          <div className="space-y-3 p-3.5 rounded-lg bg-[#0d0d14] border border-[#20202e]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8]">عنوان WebSocket للوكيل المحلي:</label>
              <input
                type="text"
                value={agentUrl}
                onChange={(e) => setAgentUrl(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-cyan-500"
                dir="ltr"
                placeholder="ws://127.0.0.1:19999"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8]">مسار مساحة العمل المحلية (اختياري):</label>
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-cyan-500"
                dir="ltr"
                placeholder="C:\\Projects\\MyProject"
              />
              <p className="text-[10px] text-[#64748b]">إذا كان الوكيل قد بدأ مع --workspace يمكنك تركه فارغاً؛ وإلا أدخل المسار الذي تريد عزله كمساحة عمل.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" />
                رمز المصادقة الأمني (Security Token):
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  localAgent.setToken(e.target.value);
                }}
                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-cyan-500"
                dir="ltr"
                placeholder="الصق Security Token الذي يظهره الوكيل عند التشغيل"
              />
            </div>

            <div className="flex gap-2 pt-1">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{isConnecting ? 'جاري الاتصال...' : 'ربط قناة WebSocket'}</span>
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>فصل الاتصال</span>
                </button>
              )}
            </div>

            {statusMessage && (
              <p
                className={`text-[11px] mt-1.5 ${
                  statusMessage.includes('بنجاح')
                    ? 'text-emerald-400'
                    : statusMessage.includes('فشل')
                    ? 'text-red-400'
                    : 'text-cyan-400'
                }`}
              >
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#2a2a3a] bg-[#14141e]">
          <span className="text-[11px] text-[#64748b]">
            ULAB Phase 2: Web ↔ Local Agent Authenticated Protocol
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#222232] hover:bg-[#2c2c40] text-[#e2e8f0] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
