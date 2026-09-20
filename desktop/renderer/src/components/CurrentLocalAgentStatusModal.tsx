import { useEffect, useState } from 'react';
import {
  Server, Wifi, WifiOff, RefreshCw, Folder, Shield, X, CheckCircle2
} from 'lucide-react';
import { localAgent, useAgentConnection } from '../utils/localAgent';

interface CurrentLocalAgentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrentLocalAgentStatusModal({
  isOpen,
  onClose,
}: CurrentLocalAgentStatusModalProps) {
  const connection = useAgentConnection();
  const [health, setHealth] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try {
      const result = window.ulabDesktop?.isDesktop
        ? await window.ulabDesktop.agentHealth()
        : await localAgent.checkHealth();
      setHealth(result);
    } finally {
      setBusy(false);
    }
  };  useEffect(() => {
    if (isOpen) void refresh();
  }, [isOpen]);

  if (!isOpen) return null;

  const connected = connection.status === 'connected';
  const session = connection.session;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0d16] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={'flex h-9 w-9 items-center justify-center rounded-xl ' +
              (connected ? 'bg-emerald-500/10' : 'bg-amber-500/10')}>
              {connected
                ? <Wifi className="h-4 w-4 text-emerald-400" />
                : <Server className="h-4 w-4 text-amber-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Local Agent</h3>
              <p className="text-[10px] text-[#71809f]">Managed automatically by ULAB Desktop</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#71809f] hover:bg-white/[0.05] hover:text-white" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </button>
        </div>        <div className="space-y-3 p-5">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white">{connected ? 'متصل وجاهز' : 'غير متصل'}</p>
                <p className="mt-1 text-[10px] text-[#71809f]">
                  {health?.data?.status === 'ok'
                    ? 'Agent v' + health.data.version + ' · localhost'
                    : 'ULAB يتحقق من القناة المحلية تلقائيًا'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {connected
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  : <WifiOff className="h-5 w-5 text-amber-400" />}
                <button
                  onClick={() => void refresh()}
                  disabled={busy}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-[#9badca] hover:bg-white/[0.06] disabled:opacity-40"
                  title="إعادة الفحص"
                >
                  <RefreshCw className={'h-3.5 w-3.5 ' + (busy ? 'animate-spin' : '')} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-300" />
              <p className="text-xs font-semibold text-cyan-100">Workspace Sandbox</p>
            </div>
            <p className="text-[10px] leading-relaxed text-[#8da0c0]">
              كل عمليات الملفات والأوامر محصورة في مساحة العمل النشطة.
              التعديلات والعمليات الحساسة تمر عبر موافقة بشرية داخل ULAB.
            </p>
          </div>          {session && (
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-200">
                <Folder className="h-4 w-4" />
                مساحة العمل النشطة
              </div>
              <div className="rounded-lg border border-emerald-500/10 bg-black/20 p-2.5 font-mono text-[10px] text-emerald-300" dir="ltr">
                {session.workspaceRoot}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[9px]">
                {session.permissions.read && <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">READ</span>}
                {session.permissions.write && <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">WRITE · APPROVAL</span>}
                {session.permissions.execute && <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">EXECUTE</span>}
                {session.permissions.delete && <span className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">DELETE · APPROVAL</span>}
              </div>
            </div>
          )}

          {!window.ulabDesktop?.isDesktop && (
            <p className="text-[9px] leading-relaxed text-[#667694]">
              هذا الوضع يستخدم واجهة المتصفح فقط؛ نسخة سطح المكتب هي المسار الكامل للجسر المحلي.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-white/[0.08] px-5 py-3">
          <button onClick={onClose} className="rounded-lg bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.08]">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
