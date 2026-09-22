import { useEffect, useRef, useState } from 'react';
import { Terminal as TermIcon, Play, Square, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ExecutionResult } from '../utils/localAgent';
import { useLanguage } from '../i18n/LanguageContext';

interface TerminalEntry { type: 'command' | 'output' | 'error' | 'info'; content: string; timestamp: string; }
interface TerminalPanelProps {
  permissionMode: string;
  connected: boolean;
  onExecuteCommand: (command: string, args?: string[], approved?: boolean) => Promise<{ success: boolean; data?: ExecutionResult; error?: { message: string } }>;
}
function now(language: string) { return new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-EG'); }

export default function TerminalPanel({ permissionMode, connected, onExecuteCommand }: TerminalPanelProps) {
  const { language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
  const [entries, setEntries] = useState<TerminalEntry[]>([{ type: 'info', content: 'ULAB Terminal — Local Agent sandbox · v3.10.10', timestamp: now(language) }]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [entries]);
  const addEntry = (type: TerminalEntry['type'], content: string) => setEntries(prev => [...prev, { type, content, timestamp: now(language) }]);

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    addEntry('command', '$ ' + trimmed);
    if (trimmed === 'clear') { setEntries([]); return; }
    if (trimmed === 'help') {
      addEntry('output', ui(
        'الأوامر تمر عبر Local Agent المحمي داخل مساحة العمل النشطة.\n\nnpm test       — تشغيل الاختبارات\nnpm run build  — بناء المشروع\ngit status     — حالة Git\nhelp           — عرض المساعدة\nclear          — مسح السجل\n\nالأوامر خارج قائمة الأمان التلقائية تتطلب تأكيدًا صريحًا عند التشغيل.',
        'Commands run through the protected Local Agent inside the active workspace.\n\nnpm test       — Run tests\nnpm run build  — Build project\ngit status     — Git status\nhelp           — Show help\nclear          — Clear log\n\nCommands outside the automatic safety allowlist require explicit confirmation when run.'
      ));
      return;
    }
    if (permissionMode === 'readonly') { addEntry('error', ui('الوضع الحالي «قراءة فقط» يمنع تنفيذ أوامر Terminal.', 'Read-only mode prevents terminal commands.')); return; }
    if (!connected) { addEntry('error', ui('Local Agent غير متصل. افتح حالة Agent وأعد الاتصال قبل التنفيذ.', 'Local Agent is disconnected. Reconnect before executing commands.')); return; }
    setIsRunning(true);
    try {
      const [command, ...args] = trimmed.split(/\s+/);
      const result = await onExecuteCommand(command, args, true);
      if (result.success && result.data) {
        const execution = result.data;
        const output = [execution.stdout, execution.stderr ? '[stderr]\n' + execution.stderr : ''].filter(Boolean).join('\n');
        addEntry(execution.success ? 'output' : 'error', output || ('Exit code: ' + execution.exitCode));
      } else {
        addEntry('error', result.error?.message || ui('رفض Local Agent تنفيذ الأمر.', 'The Local Agent rejected the command.'));
      }
    } catch (error) {
      addEntry('error', error instanceof Error ? error.message : ui('حدث خطأ غير متوقع أثناء التنفيذ.', 'An unexpected execution error occurred.'));
    } finally { setIsRunning(false); }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.07] p-2.5">
        <div className="flex items-center gap-2">
          <TermIcon className="h-4 w-4 text-emerald-300" />
          <div><span className="text-xs font-bold text-white">Terminal</span><p className="text-[8px] text-[#657594]">{ui('محصور في مساحة العمل النشطة', 'Scoped to the active workspace')}</p></div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-1.5 py-1 text-[8px] text-emerald-300"><ShieldCheck className="h-2.5 w-2.5" /> Sandbox</span>
          {isRunning && <span className="text-[9px] text-amber-300">{ui('جاري التنفيذ…', 'Running…')}</span>}
          <button onClick={() => setEntries([])} className="rounded p-1 text-[#7e8eab] hover:bg-white/[0.05]" title={ui('مسح السجل', 'Clear log')}><Trash2 className="h-3 w-3" /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#070912] p-3 font-mono text-[11px]">
        {entries.map((entry, i) => <div key={i} className="mb-2">
          {entry.type === 'command' && <span className="text-emerald-300">{entry.content}</span>}
          {entry.type === 'output' && <pre className="whitespace-pre-wrap text-[#dbe7ff]">{entry.content}</pre>}
          {entry.type === 'error' && <span className="flex items-start gap-1.5 whitespace-pre-wrap text-rose-300"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /><span>{entry.content}</span></span>}
          {entry.type === 'info' && <span className="text-[#71809f]">{entry.content}</span>}
        </div>)}
      </div>
      <div className="flex items-center gap-2 border-t border-white/[0.07] p-2.5">
        <span className="font-mono text-xs text-emerald-300">$</span>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { const v=input; setInput(''); void handleCommand(v); } }} placeholder={isRunning ? ui('جاري التنفيذ…', 'Running…') : ui('اكتب أمرًا داخل مساحة العمل…', 'Enter a workspace command…')} disabled={isRunning} className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-[#52627e] disabled:opacity-50" dir="ltr" aria-label="Terminal command" />
        <button onClick={() => { const v=input; setInput(''); void handleCommand(v); }} disabled={!input.trim() || isRunning} className="rounded-lg border border-emerald-400/15 bg-emerald-400/10 p-2 text-emerald-300 hover:bg-emerald-400/15 disabled:opacity-30" title={isRunning ? ui('جاري التنفيذ', 'Running') : ui('تشغيل الأمر', 'Run command')}>
          {isRunning ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
