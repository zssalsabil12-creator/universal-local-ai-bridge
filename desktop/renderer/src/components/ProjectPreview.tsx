import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, ExternalLink, ShieldCheck, Play, Square, Loader2 } from 'lucide-react';
import type { ProjectIndex } from '../utils/fileSystem';

interface ProjectPreviewProps {
  index: ProjectIndex | null;
  workspaceRevision?: number;
  bridgeState?: string;
  lastAction?: string;
  activityLog?: Array<{ timestamp: number; status: string; action: string; path?: string }>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ProjectPreview({
  index, workspaceRevision = 0, bridgeState = 'IDLE', lastAction = '',
  activityLog = [], refreshing, onRefresh,
}: ProjectPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [previewState, setPreviewState] = useState('stopped');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    setPreviewKey(v => v + 1);
  }, [workspaceRevision]);

  useEffect(() => {
    const desktop = window.ulabDesktop;
    if (!desktop?.isDesktop || !index) return;
    let active = true;
    const sync = async () => {
      const state = await desktop.previewStatus();
      if (!active) return;
      setPreviewState(state?.state || 'stopped');
      setPreviewError(state?.error || '');
      if (state?.url) setPreviewUrl(state.url);
    };
    void sync();
    const off = desktop.onPreviewStatus((data: any) => {
      if (!active) return;
      setPreviewState(data?.state || 'stopped');
      setPreviewError(data?.error || '');
      if (data?.url) {
        setPreviewUrl(data.url);
        setPreviewKey(v => v + 1);
      }
    });
    void (async () => {
      const result = await desktop.previewStart();
      if (!active) return;
      setPreviewState(result?.ok ? (result.url ? 'running' : 'starting') : 'error');
      setPreviewError(result?.error || '');
      if (result?.url) setPreviewUrl(result.url);
      if (result?.url) setPreviewKey(v => v + 1);
    })();
    return () => { active = false; off?.(); };
  }, [index?.rootName]);

  const safePreviewUrl = useMemo(() => {
    try {
      const url = new URL(previewUrl.trim());
      if (url.protocol !== 'http:') return '';
      if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname)) return url.toString();
      return '';
    } catch { return ''; }
  }, [previewUrl]);

  if (!index) return (    <div className="h-full flex items-center justify-center p-6 text-center">
      <div>
        <Eye className="w-10 h-10 text-[#334155] mx-auto mb-3" />
        <p className="text-sm font-semibold text-white">Live Preview</p>
        <p className="text-[11px] text-[#64748b] mt-2">Open a project to preview its local application.</p>
      </div>
    </div>
  );

  const status = bridgeState === 'RESULT_RETURNED' || bridgeState === 'AI_CONTINUES' ? 'Synced with latest AI change' : bridgeState;

  return (
    <div className="h-full flex flex-col bg-[#08090e] text-white min-h-0">
      <div className="px-3 py-2 border-b border-[#202433] bg-[#0c0d13] flex items-center gap-2">
        <Eye className="w-4 h-4 text-cyan-300" />
        <div className="min-w-0">
          <p className="text-[11px] font-black">Live Preview</p>
          <p className="text-[8px] text-[#64748b] truncate" dir="ltr">{index.rootName}</p>
        </div>
        <span className="ml-auto text-[8px] text-emerald-300">Revision {workspaceRevision}</span>
        <button onClick={async () => {
          setPreviewState('starting'); setPreviewError('');
          const result = await window.ulabDesktop?.previewStart?.();
          setPreviewState(result?.ok ? (result.url ? 'running' : 'starting') : 'error');
          setPreviewError(result?.error || '');
          if (result?.url) { setPreviewUrl(result.url); setPreviewKey(v => v + 1); }
        }} className="p-1.5 rounded-lg text-[#8b9ab5] hover:bg-white/[0.06]" title="Start preview">
          {previewState === 'starting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={async () => { await window.ulabDesktop?.previewStop?.(); setPreviewState('stopped'); setPreviewUrl(''); }} className="p-1.5 rounded-lg text-[#8b9ab5] hover:bg-white/[0.06]" title="Stop preview">
          <Square className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRefresh} disabled={refreshing} className="p-1.5 rounded-lg text-[#8b9ab5] hover:bg-white/[0.06] disabled:opacity-40" title="Refresh workspace">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-2 border-b border-[#202433] bg-[#090a0f]">
        <div className="flex items-center gap-1.5">
          <input
            value={previewUrl}
            onChange={e => setPreviewUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setPreviewKey(v => v + 1); }}
            className="min-w-0 flex-1 px-2 py-1.5 rounded-md bg-[#07080c] border border-[#252a38] text-[9px] text-[#cbd5e1] focus:outline-none focus:border-cyan-400/40"
            dir="ltr"
            aria-label="Local preview URL"
          />
          <button onClick={() => { if (safePreviewUrl) window.open(safePreviewUrl, '_blank', 'noopener,noreferrer'); }} disabled={!safePreviewUrl} className="p-1.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-[#8b9ab5] disabled:opacity-30" title="Open preview externally">
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-[#53627a]">
          <ShieldCheck className="w-3 h-3 text-emerald-300" />
          <span>Localhost only · changes reload automatically after AI or workspace writes.</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white">
        {previewError ? (
          <div className="h-full flex items-center justify-center bg-[#08090e] p-6 text-center">
            <div>
              <Eye className="w-8 h-8 text-[#334155] mx-auto mb-2" />
              <p className="text-[10px] text-red-300">{previewError}</p>
              <button onClick={() => void window.ulabDesktop?.previewStart?.()} className="mt-3 px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-[#cbd5e1]">Try Preview Again</button>
            </div>
          </div>
        ) : previewState === 'starting' && !safePreviewUrl ? (
          <div className="h-full flex items-center justify-center bg-[#08090e] p-6 text-center">
            <div>
              <Loader2 className="w-8 h-8 text-cyan-300 mx-auto mb-2 animate-spin" />
              <p className="text-[10px] text-[#8b9ab5]">Starting the project preview…</p>
            </div>
          </div>
        ) : safePreviewUrl ? (
          <iframe
            key={previewKey}
            src={safePreviewUrl}
            title="ULAB local project preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-[#08090e] p-6 text-center">
            <div>
              <Eye className="w-8 h-8 text-[#334155] mx-auto mb-2" />
              <p className="text-[10px] text-[#8b9ab5]">Enter a localhost URL such as http://localhost:3000.</p>
              <p className="text-[9px] text-[#53627a] mt-1">Remote preview URLs are blocked for safety.</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#202433] bg-[#0c0d13] p-2 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[#64748b]">Workspace status</span>
          <span className="text-[9px] text-cyan-200 truncate" dir="ltr">{status}</span>
        </div>
        {lastAction && (
          <div className="text-[8px] text-[#7d899d] truncate" dir="ltr">Last action: {lastAction}</div>
        )}
        {activityLog.length > 0 && (
          <div className="text-[8px] text-[#53627a] truncate">
            Latest operation: {activityLog[0].action}
            {activityLog[0].path ? ` · ${activityLog[0].path}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}
