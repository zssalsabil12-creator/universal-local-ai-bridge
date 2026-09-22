import { useState, type ReactNode } from 'react';
import { GitBranch, RefreshCw, CheckCircle2, AlertCircle, CircleDot, FileDiff } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface GitInfo {
  branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  clean: boolean;
  isRepository: boolean;
  error?: string;
}

interface GitPanelProps {
  gitInfo: GitInfo | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const MAX_VISIBLE_PATHS = 12;

function ChangeList({ title, items, tone, icon }: { title:string; items:string[]; tone:string; icon:ReactNode }) {
  const { language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
  if (items.length === 0) return null;
  const visible = items.slice(0, MAX_VISIBLE_PATHS);
  return (
    <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center gap-2">        <span className={tone}>{icon}</span>
        <span className="text-xs font-semibold text-white">{title}</span>
        <span className="mr-auto rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-[#8fa1c2]">{items.length}</span>
      </div>
      <div className="space-y-1">
        {visible.map(path => (
          <div key={path} className="rounded-lg border border-white/[0.05] bg-[#070912] px-2 py-1.5 font-mono text-[9px] text-[#a7b5cf]" dir="ltr" title={path}>
            {path}
          </div>
        ))}
      </div>
      {items.length > MAX_VISIBLE_PATHS && (
        <p className="mt-2 text-[9px] text-[#657594]">+ {items.length - MAX_VISIBLE_PATHS} {language === 'en' ? 'more items' : 'عناصر إضافية'}</p>
      )}
    </section>
  );
}

export default function GitPanel({ gitInfo, onRefresh, refreshing=false }: GitPanelProps) {
  const { language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
  const [showModified, setShowModified] = useState(true);
  if (!gitInfo) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <GitBranch className="mb-4 h-12 w-12 text-[#2a2a3a]" />
        <p className="text-sm text-[#94a3b8]">{ui('لا توجد حالة Git بعد', 'Git status is not available yet')}</p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#64748b]">{ui('افتح مساحة العمل أولًا ثم نفّذ فحص Git للحصول على الحالة الحقيقية للمستودع.', 'Open the workspace first, then refresh Git to inspect the repository status.')}</p>
      </div>
    );
  }

  if (!gitInfo.isRepository) {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[#7082a7]" />
            <span className="text-sm font-bold text-white">Git</span>
          </div>
          {onRefresh && <button onClick={onRefresh} disabled={refreshing} className="rounded-lg border border-white/[0.08] p-2 text-[#9badca] hover:bg-white/[0.05] disabled:opacity-40" title={ui('إعادة الفحص', 'Refresh')}><RefreshCw className={'h-3.5 w-3.5 '+(refreshing?'animate-spin':'')} /></button>}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <AlertCircle className="mb-3 h-9 w-9 text-amber-400/70" />
          <p className="text-sm font-semibold text-white">{ui('ليست مساحة Git', 'Not a Git repository')}</p>
          <p className="mt-2 max-w-xs text-[10px] leading-relaxed text-[#7383a1]">{gitInfo.error || ui('لم يتم العثور على مستودع Git صالح داخل مساحة العمل الحالية.', 'No valid Git repository was found in the active workspace.')}</p>
        </div>
      </div>
    );
  }

  const totalChanges = gitInfo.modified.length + gitInfo.staged.length + gitInfo.untracked.length;
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-indigo-300" />
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#667694]">Current branch</p>
              <p className="mt-1 max-w-[170px] truncate font-mono text-sm font-semibold text-white" dir="ltr" title={gitInfo.branch}>{gitInfo.branch}</p>
            </div>
          </div>
          {onRefresh && (
            <button onClick={onRefresh} disabled={refreshing} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-[#9badca] hover:bg-white/[0.06] disabled:opacity-40" title={ui('تحديث حالة Git', 'Refresh Git status')}>
              <RefreshCw className={'h-3.5 w-3.5 '+(refreshing?'animate-spin':'')} />
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="rounded-lg bg-[#070912] p-2 text-center">
            <p className="text-lg font-black text-emerald-300">{gitInfo.staged.length}</p>
            <p className="text-[8px] text-[#71809f]">Staged</p>
          </div>
          <div className="rounded-lg bg-[#070912] p-2 text-center">
            <p className="text-lg font-black text-amber-300">{gitInfo.modified.length}</p>
            <p className="text-[8px] text-[#71809f]">Modified</p>
          </div>
          <div className="rounded-lg bg-[#070912] p-2 text-center">
            <p className="text-lg font-black text-cyan-300">{gitInfo.untracked.length}</p>
            <p className="text-[8px] text-[#71809f]">Untracked</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[9px]">
          {gitInfo.clean ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-300">Working tree clean</span></> : <><CircleDot className="h-3.5 w-3.5 text-amber-400" /><span className="text-amber-300">{totalChanges} change{totalChanges===1?'':'s'} detected</span></>}
        </div>
      </div>

      <button onClick={() => setShowModified(v => !v)} className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-left hover:bg-white/[0.04]">
        <span className="flex items-center gap-2 text-xs font-semibold text-white"><FileDiff className="h-3.5 w-3.5 text-cyan-300" />{ui('التغييرات الحالية', 'Current changes')}</span>
        <span className="text-[9px] text-[#71809f]">{showModified ? ui('إخفاء', 'Hide') : ui('إظهار', 'Show')}</span>
      </button>

      {showModified && (
        <div className="space-y-2">
          <ChangeList title="Staged" items={gitInfo.staged} tone="text-emerald-300" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
          <ChangeList title="Modified" items={gitInfo.modified} tone="text-amber-300" icon={<CircleDot className="h-3.5 w-3.5" />} />
          <ChangeList title="Untracked" items={gitInfo.untracked} tone="text-cyan-300" icon={<span className="text-xs">+</span>} />
          {totalChanges === 0 && <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-center text-[10px] text-emerald-300">{ui('لا توجد تغييرات محلية غير محفوظة في Git.', 'No uncommitted local Git changes.')}</div>}
        </div>
      )}
    </div>
  );
}
