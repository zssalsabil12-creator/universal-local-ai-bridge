import { useEffect, useState } from 'react';
import {
  Globe, ExternalLink, Sparkles, Zap, RefreshCw, Shield, Lock, Copy, CheckCircle2
} from 'lucide-react';
import { ContextResult, generateContextString } from '../utils/contextEngine';
import { PROVIDERS, getAllProviders, ProviderAdapter } from '../utils/providerAdapters';

type AIProvider = keyof typeof PROVIDERS | 'custom';

interface CurrentAIBridgePanelProps {
  context: ContextResult | null;
  fileContents: Record<string, string>;
  query: string;
  projectName: string;
  onPrepareContext: (query: string) => void;
}

export default function CurrentAIBridgePanel({
  context,
  fileContents,
  query,
  projectName,
  onPrepareContext,
}: CurrentAIBridgePanelProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('chatgpt');
  const [taskQuery, setTaskQuery] = useState(query);
  const [customUrl, setCustomUrl] = useState('');
  const [bridgeState, setBridgeState] = useState('IDLE');
  const [aiOpen, setAiOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any | null>(null);
  const [diagnosticsBusy, setDiagnosticsBusy] = useState(false);
  const [mcpCopied, setMcpCopied] = useState(false);
  const [mcpConfig, setMcpConfig] = useState<{ endpoint:string; protocolVersion:string; bearerToken:string; scope:string; stdioCommand:string } | null>(null);
  const [mcpStatus, setMcpStatus] = useState<any | null>(null);
  const [mcpBusy, setMcpBusy] = useState(false);

  useEffect(() => {
    const off = window.ulabDesktop?.onAIBridgeState?.((data: any) => {
      setBridgeState(data?.state || 'IDLE');
    });
    const offAI = window.ulabDesktop?.onAIStatus?.((data: any) => {
      if (data?.status === 'closed' || data?.status === 'error' || data?.status === 'navigation-blocked') {
        setAiOpen(false);
        if (data?.status !== 'navigation-blocked') setDiagnostics(null);
      } else if (data?.status === 'ready') {
        setAiOpen(true);
      }
    });
    return () => { off?.(); offAI?.(); };
  }, []);

  const providers: (ProviderAdapter & { id: AIProvider })[] = [
    ...getAllProviders(),
    {
      id: 'custom',
      name: 'Custom AI',
      icon: '🌐',
      url: '',
      color: 'from-slate-500 to-cyan-500',
      supportsSystemPrompt: false,
      supportsFileUpload: false,
      supportsCodeExecution: false,
      maxTokens: 128000,
    },
  ];

  const providerInfo =
    providers.find(provider => provider.id === selectedProvider) || providers[0];

  const statusMeta: Record<string, { label: string; dot: string }> = {
    IDLE: { label: 'Ready', dot: 'is-live' },
    AI_CONNECTED: { label: 'AI connected', dot: 'is-live' },
    AGENT_CONNECTING: { label: 'Connecting agent', dot: 'is-busy' },
    AGENT_CONNECTED: { label: 'Agent connected', dot: 'is-live' },
    ACTION_DETECTED: { label: 'Action detected', dot: 'is-busy' },
    VALIDATING: { label: 'Validating', dot: 'is-busy' },
    RESULT_RETURNED: { label: 'Result returned', dot: 'is-live' },
    AI_CONTINUES: { label: 'AI continuing', dot: 'is-live' },
    APPROVAL_REQUIRED: { label: 'Approval required', dot: 'is-busy' },
    AGENT_ERROR: { label: 'Attention required', dot: 'is-busy' },
    AGENT_DISCONNECTED: { label: 'Agent offline', dot: 'is-busy' },
  };

  const currentStatus = statusMeta[bridgeState] || { label: bridgeState, dot: 'is-live' };

  const openProvider = async (providerId: AIProvider) => {
    if (window.ulabDesktop?.isDesktop) {
      if (providerId === 'custom' && !/^https:\/\//i.test(customUrl.trim())) {
        setBridgeState('AGENT_ERROR');
        return { ok: false, error: 'Custom AI URL must use HTTPS' };
      }
      try {
        const result = await window.ulabDesktop.openAI({ providerId, customUrl });
        if (result?.ready) setAiOpen(true);
        return result;
      } catch (error) {
        setBridgeState('AGENT_ERROR');
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'Unable to open AI session',
        };
      }
    }

    const urls: Record<AIProvider, string> = {
      chatgpt: 'https://chatgpt.com/',
      gemini: 'https://gemini.google.com/',
      claude: 'https://claude.ai/',
      deepseek: 'https://chat.deepseek.com/',
      qwen: 'https://chat.qwen.ai/',
      mistral: 'https://chat.mistral.ai/',
      llama: 'https://www.meta.ai/',
      grok: 'https://grok.com/',
      copilot: 'https://copilot.microsoft.com/',
      perplexity: 'https://www.perplexity.ai/',
      custom: customUrl.trim(),
    };

    if (urls[providerId]) {
      window.open(urls[providerId], '_blank', 'noopener,noreferrer');
    }
    return { ok: true };
  };  const runDiagnostics = async () => {
    if (!window.ulabDesktop?.isDesktop) return;
    setDiagnosticsBusy(true);
    try {
      setDiagnostics(await window.ulabDesktop.aiDiagnostics());
    } finally {
      setDiagnosticsBusy(false);
    }
  };

  const refreshMCP = async () => {
    if (!window.ulabDesktop?.isDesktop) return;
    setMcpBusy(true);
    try {
      const cfg = await window.ulabDesktop.mcpConfig();
      setMcpConfig(cfg);
      setMcpStatus(await window.ulabDesktop.mcpDiagnostics());
    } finally {
      setMcpBusy(false);
    }
  };

  useEffect(() => {
    if (!window.ulabDesktop?.isDesktop) return;
    const timer = window.setTimeout(() => { void refreshMCP(); }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  const sendContextDirect = async () => {
    if (!context || !window.ulabDesktop?.isDesktop) return;
    const payload = {
      query,
      projectName,
      context: generateContextString(context, fileContents, query),
    };

    const status: any = await window.ulabDesktop.aiStatus();
    if (!status?.open || !status.ready || status.provider !== selectedProvider) {
      const opened = await openProvider(selectedProvider);
      if (opened && typeof opened === 'object' && (opened as any).ok === false) return;
    }

    const result: any = await window.ulabDesktop.sendAIContext(payload);
    if (result?.result?.ok === false || result?.ok === false) {
      setBridgeState('AGENT_ERROR');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="ulab-bridge-card rounded-2xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-[#6f7fa2]">
              Universal AI Bridge
            </div>
            <h3 className="text-base font-black tracking-tight flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-cyan-300" />
              {providerInfo.name}
            </h3>
          </div>
          <span className="ulab-status-pill">
            <span className={'ulab-status-dot ' + currentStatus.dot}></span>
            {currentStatus.label}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[9px] text-[#667694]">
          <Shield className="w-3 h-3 text-cyan-300" />
          Workspace-scoped · No ULAB API key · Human approval for mutations
        </div>
      </div>

      <section className="p-3 rounded-xl bg-[#0a0a0f] border border-[#20202e]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <div>
            <p className="text-xs font-bold text-white">ما الذي تريد من الـAI أن يفعله؟</p>
            <p className="text-[9px] text-[#71809f]">يُحلل ULAB المهمة محليًا ثم يرسل السياق المناسب تلقائيًا.</p>
          </div>
        </div>
        <textarea
          value={taskQuery}
          onChange={e => setTaskQuery(e.target.value)}
          onKeyDown={e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && taskQuery.trim()) {
              e.preventDefault();
              onPrepareContext(taskQuery.trim());
            }
          }}
          placeholder="مثال: افحص نظام المصادقة وحدد الملفات التي تحتاج تعديلًا..."
          className="w-full min-h-20 px-3 py-2 rounded-lg bg-[#07070c] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-cyan-500/50 focus:outline-none resize-none"
          dir="auto"
        />
        <button
          onClick={() => taskQuery.trim() && onPrepareContext(taskQuery.trim())}
          disabled={!taskQuery.trim()}
          className="w-full mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold disabled:opacity-40"
        >
          تحليل المهمة وبناء السياق محليًا
        </button>
      </section>

      <section>
        <p className="text-[10px] text-[#94a3b8] mb-1.5">اختر AI:</p>
        <div className="ulab-provider-grid grid grid-cols-5 gap-1.5">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={'p-2 rounded-xl border text-center transition-all ' +
                (selectedProvider === provider.id ? 'is-selected' : '')}
              title={provider.name}
            >
              <span className="text-lg">{provider.icon}</span>
              <p className="text-[8px] text-[#94a3b8] mt-0.5 truncate">{provider.name}</p>
            </button>
          ))}
        </div>

        {selectedProvider === 'custom' && (
          <input
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="https://your-ai-chat.example.com/"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] text-[10px] text-white placeholder:text-[#64748b] focus:border-cyan-500/50 focus:outline-none"
            type="url"
            dir="ltr"
          />
        )}

        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            onClick={() => void openProvider(selectedProvider)}
            disabled={selectedProvider === 'custom' && !customUrl.trim()}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40"
          >
            {aiOpen ? 'إعادة فتح ' : 'فتح '}{providerInfo.name}
          </button>
          <button
            onClick={async () => {
              await window.ulabDesktop?.closeAI();
              setAiOpen(false);
              setBridgeState('IDLE');
              setDiagnostics(null);
            }}
            disabled={!aiOpen}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#b9c5df] text-xs font-semibold hover:bg-white/[0.07] disabled:opacity-30"
          >
            إغلاق جلسة AI
          </button>
        </div>

        {window.ulabDesktop?.isDesktop && (
          <button
            onClick={() => void runDiagnostics()}
            disabled={diagnosticsBusy}
            className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#b9c5df] text-[10px] font-semibold hover:bg-white/[0.07] disabled:opacity-40"
          >
            {diagnosticsBusy ? 'جاري فحص صفحة الـAI…' : 'تشخيص جلسة الـAI'}
          </button>
        )}
      </section>      {diagnostics && (
        <div className="p-2 rounded-lg bg-[#0a0a0f] border border-white/[0.08] text-[9px]" dir="ltr">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-[#dbe7ff]">AI Session</span>
            <span className={diagnostics.ok ? 'text-green-400' : 'text-red-400'}>
              {diagnostics.ok ? 'READY' : 'ERROR'}
            </span>
          </div>
          {diagnostics.ok ? (
            <div className="space-y-1 text-[#8a9aba]">
              <div>Inputs: <b className="text-white">{diagnostics.inputs?.length || 0}</b></div>
              <div>Send controls: <b className="text-white">{diagnostics.sendButtons?.length || 0}</b></div>
              <div>Assistant nodes: <b className="text-white">{diagnostics.assistantNodes?.length || 0}</b></div>
              <div className="truncate" title={diagnostics.url}>URL: {diagnostics.url}</div>
            </div>
          ) : (
            <div className="text-red-300">{diagnostics.error || 'Unable to inspect this AI session.'}</div>
          )}
        </div>
      )}

      {window.ulabDesktop?.isDesktop && (
        <section className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-300" />
              <div>
                <p className="text-xs font-bold text-white">MCP محلي</p>
                <p className="text-[9px] text-[#71809f]">اتصال محلي مباشر بدون نسخ prompts أو ملفات المشروع</p>
              </div>
            </div>
            <span className="text-[8px] text-cyan-300 border border-cyan-400/20 rounded px-1.5 py-0.5">LOCAL</span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-[#07070c] border border-white/[0.06] px-2.5 py-2">
            <div>
              <p className="text-[9px] text-[#64748b]">حالة خادم MCP</p>
              <p className="text-[10px] font-semibold text-white">
                {mcpBusy ? 'جاري الفحص…' : mcpStatus?.ok ? 'متصل ويعمل' : 'غير متحقق'}
              </p>
            </div>
            <span className={`text-[8px] px-1.5 py-0.5 rounded border ${mcpStatus?.ok ? 'text-green-300 border-green-400/20' : 'text-yellow-300 border-yellow-400/20'}`}>
              {mcpStatus?.ok ? `TOOLS ${mcpStatus.toolCount || 0}` : 'CHECK'}
            </span>
          </div>

          <div className="mt-2 rounded-lg bg-[#07070c] border border-white/[0.06] px-2.5 py-2" dir="ltr">
            <p className="text-[9px] text-[#64748b] mb-1">HTTP endpoint</p>
            <code className="text-[10px] text-cyan-200 break-all">{mcpConfig?.endpoint || 'Loading…'}</code>
            {mcpStatus?.workspace && (
              <p className="mt-1 text-[8px] text-[#64748b] truncate" title={mcpStatus.workspace}>Workspace: {mcpStatus.workspace}</p>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button
              onClick={() => void refreshMCP()}
              disabled={mcpBusy}
              className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-100 text-[10px] font-semibold hover:bg-cyan-500/15 disabled:opacity-40"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${mcpBusy ? 'animate-spin' : ''}`} />
                {mcpBusy ? 'جاري الفحص…' : 'فحص اتصال MCP'}
              </span>
            </button>
            <button
              onClick={async () => {
                try {
                  if (!mcpConfig?.endpoint || !mcpConfig?.bearerToken) return;
                  const connection = {
                    url: mcpConfig.endpoint,
                    headers: { Authorization: 'Bearer ' + mcpConfig.bearerToken },
                  };
                  await navigator.clipboard.writeText(JSON.stringify(connection, null, 2));
                  setMcpCopied(true);
                  window.setTimeout(() => setMcpCopied(false), 2200);
                } catch (error) {
                  console.error('Unable to copy MCP configuration', error);
                }
              }}
              disabled={!mcpConfig?.bearerToken}
              className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#dbe7ff] text-[10px] font-semibold hover:bg-white/[0.08] disabled:opacity-40"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {mcpCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
                {mcpCopied ? 'تم النسخ' : 'نسخ HTTP'}
              </span>
            </button>
          </div>

          <button
            onClick={async () => {
              try {
                const command = mcpConfig?.stdioCommand;
                if (!command) return;
                const workspace = mcpStatus?.workspace;
                await navigator.clipboard.writeText(workspace ? command.replace('%ULAB_WORKSPACE%', workspace) : command);
                setMcpCopied(true);
                window.setTimeout(() => setMcpCopied(false), 2200);
              } catch (error) {
                console.error('Unable to copy MCP stdio command', error);
              }
            }}
            disabled={!mcpConfig?.stdioCommand}
            className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#cbd5e1] text-[10px] font-semibold hover:bg-white/[0.06] disabled:opacity-40"
            dir="ltr"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-300" />
            نسخ أمر MCP عبر stdio
          </button>

          {mcpStatus && !mcpStatus.ok && (
            <p className="mt-1.5 text-[8px] text-yellow-300 leading-relaxed" dir="ltr">
              {mcpStatus.stage ? `${mcpStatus.stage}: ` : ''}{String(mcpStatus.error || 'MCP server is not ready')}
            </p>
          )}
          <p className="mt-1.5 text-[8px] text-[#64748b]">
            القراءة والبحث واقتراح التعديلات متاحة عبر MCP. تنفيذ الكتابة والحذف والأوامر الحساسة لا يتم عبر سطح MCP الحالي. إعداد stdio يعمل كجلسة MCP محلية مستقلة على نفس مساحة العمل.
          </p>
          <p className="mt-1 text-[8px] text-[#64748b]">
            لا تشارك Bearer token أو أمر الاتصال خارج جهازك.
          </p>
        </section>
      )}

      {context ? (
        <section className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <div>
              <p className="text-xs font-bold text-white">Workspace context ready</p>
              <p className="text-[9px] text-[#71809f]">
                {context.files.length} files · ~{context.totalLines} lines · ~{context.estimatedTokens} tokens
              </p>
            </div>
          </div>
          <p className="text-[9px] text-[#7f8cab]">
            ULAB sends only the selected project context directly into the chosen AI session.
            The local Agent stays inside the selected workspace.
          </p>
          <button
            onClick={() => void sendContextDirect()}
            className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold hover:opacity-90"
          >
            <Zap className="w-4 h-4" />
            إرسال سياق المشروع مباشرة
          </button>
        </section>
      ) : (
        <section className="p-4 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a] text-center">
          <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-white">الجسر جاهز</p>
          <p className="text-[9px] text-[#71809f] mt-1">
            افتح مجلد المشروع أولًا، ثم استخدم لوحة السياق لبناء سياق المهمة.
          </p>
        </section>
      )}

      <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="flex items-start gap-1.5">
          <Lock className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-green-300 leading-relaxed">
            ملفاتك لا تغادر مساحة العمل إلا كسياق صريح ترسله إلى جلسة AI المختارة.
            التعديلات والأوامر الحساسة تتطلب موافقة بشرية داخل ULAB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-indigo-400">{context?.files.length || 0}</p>
          <p className="text-[8px] text-[#64748b]">ملفات</p>
        </div>
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-cyan-400">{context ? '~' + context.estimatedTokens : '—'}</p>
          <p className="text-[8px] text-[#64748b]">tokens</p>
        </div>
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-green-400">Scoped</p>
          <p className="text-[8px] text-[#64748b]">Agent</p>
        </div>
      </div>
    </div>
  );
}
