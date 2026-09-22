import { useEffect, useState } from 'react';
import {
  Globe, ExternalLink, Workflow, Link2, RefreshCw, Shield, Lock, Copy, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ContextResult, generateContextString } from '../utils/contextEngine';
import { PROVIDERS, getAllProviders, ProviderAdapter } from '../utils/providerAdapters';

type AIProvider = keyof typeof PROVIDERS | 'custom';

interface CurrentAIBridgePanelProps {
  context: ContextResult | null;
  fileContents: Record<string, string>;
  query: string;
  projectName: string;
  onPrepareContext: (query: string) => Promise<{ context: ContextResult; fileContents: Record<string, string> } | null>;
}

export default function CurrentAIBridgePanel({
  context,
  fileContents,
  query,
  projectName,
  onPrepareContext,
}: CurrentAIBridgePanelProps) {
  const { t, language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
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
      } else if (data?.status === 'ready' || data?.status === 'auth-required') {
        setAiOpen(true);
        if (data?.status === 'auth-required') {
          setBridgeState('AI_AUTH_REQUIRED');
        }
      }
    });
    return () => { off?.(); offAI?.(); };
  }, []);

  const providers: (ProviderAdapter & { id: AIProvider })[] = [
    ...getAllProviders(),
    {
      id: 'custom',
      name: 'Any AI',
      icon: 'AI',
      url: '',
      color: 'from-slate-500 to-cyan-500',
      supportsSystemPrompt: false,
      supportsFileUpload: false,
      supportsCodeExecution: false,
      maxTokens: 128000,
      integrationMode: 'browser-compatibility',
      integrationNote: 'Universal browser bridge for any AI chat URL that permits automated interaction; provider terms apply.',
    },
  ];

  const providerInfo =
    providers.find(provider => provider.id === selectedProvider) || providers[0];

  const statusMeta: Record<string, { label: string; dot: string }> = {
    IDLE: { label: 'Ready', dot: 'is-live' },
    AI_CONNECTED: { label: language === 'ar' ? 'تم الاتصال بالذكاء الاصطناعي' : 'AI connected', dot: 'is-live' },
    AGENT_CONNECTING: { label: language === 'ar' ? 'جارٍ الاتصال بـ Agent' : 'Connecting agent', dot: 'is-busy' },
    AGENT_CONNECTED: { label: language === 'ar' ? 'Agent متصل' : 'Agent connected', dot: 'is-live' },
    ACTION_DETECTED: { label: language === 'ar' ? 'تم اكتشاف إجراء' : 'Action detected', dot: 'is-busy' },
    VALIDATING: { label: language === 'ar' ? 'جارٍ التحقق' : 'Validating', dot: 'is-busy' },
    RESULT_RETURNED: { label: language === 'ar' ? 'تمت إعادة النتيجة' : 'Result returned', dot: 'is-live' },
    AI_CONTINUES: { label: language === 'ar' ? 'الذكاء الاصطناعي يتابع' : 'AI continuing', dot: 'is-live' },
    APPROVAL_REQUIRED: { label: language === 'ar' ? 'الموافقة مطلوبة' : 'Approval required', dot: 'is-busy' },
    AGENT_ERROR: { label: language === 'ar' ? 'يتطلب الانتباه' : 'Attention required', dot: 'is-busy' },
    AI_AUTH_REQUIRED: { label: language === 'ar' ? 'سجّل الدخول إلى AI' : 'Sign in to AI', dot: 'is-busy' },
    AGENT_DISCONNECTED: { label: t('workspace.disconnected'), dot: 'is-busy' },
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
        if (result?.diagnostics) setDiagnostics(result.diagnostics);
        if (result?.authRequired) setBridgeState('AI_AUTH_REQUIRED');
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
    if (!window.ulabDesktop?.isDesktop || !taskQuery.trim()) return;

    setBridgeState('AGENT_CONNECTING');

    const prepared = await onPrepareContext(taskQuery.trim());
    if (!prepared) {
      setBridgeState('AGENT_ERROR');
      return;
    }

    const status: any = await window.ulabDesktop.aiStatus();
    if (!status?.open || !status.ready || status.provider !== selectedProvider) {
      const opened = await openProvider(selectedProvider);
      if (!opened || (typeof opened === 'object' && (opened as any).ok === false)) {
        setBridgeState('AGENT_ERROR');
        return;
      }
    }

    setBridgeState('AI_CONNECTED');

    const payload = {
      query: taskQuery.trim(),
      projectName,
      context: generateContextString(prepared.context, prepared.fileContents, taskQuery.trim()),
    };

    const result: any = await window.ulabDesktop.sendAIContext(payload);
    const sendResult = result?.result || result;

    if (sendResult?.reason === 'AI_AUTH_REQUIRED') {
      setBridgeState('AI_AUTH_REQUIRED');
      setDiagnostics(await window.ulabDesktop.aiDiagnostics());
      return;
    }

    if (sendResult?.ok === false) {
      setBridgeState('AGENT_ERROR');
      setDiagnostics(await window.ulabDesktop.aiDiagnostics());
      return;
    }

    setBridgeState('AI_CONTINUES');
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="ulab-bridge-card rounded-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-[#7d899d]">
              {ui('الاتصال', 'Connection')}
            </div>
            <h3 className="text-base font-black tracking-tight flex items-center gap-2 mt-1">
              <Link2 className="w-4 h-4 text-[#8da2bf]" />
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
          {ui('محصور بمساحة العمل · بدون مفتاح ULAB API · موافقة بشرية للتعديلات الحساسة', 'Workspace-scoped · No ULAB API key · Human approval for mutations')}
        </div>
      </div>

      <section className="p-3 rounded-xl bg-[#0a0a0f] border border-[#20202e]">
        <div className="flex items-center gap-2 mb-2">
          <Workflow className="w-4 h-4 text-[#8da2bf]" />
          <div>
            <p className="text-xs font-bold text-white">{ui('ما الذي تريد من الـAI أن يفعله؟', 'What should the AI do?')}</p>
            <p className="text-[9px] text-[#71809f]">{ui('يحلل ULAB المهمة محليًا ثم يرسل السياق المناسب تلقائيًا.', 'ULAB analyzes the task locally and sends only the relevant context automatically.')}</p>
          </div>
        </div>
        <textarea
          value={taskQuery}
          onChange={e => setTaskQuery(e.target.value)}
          onKeyDown={e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && taskQuery.trim()) {
              e.preventDefault();
              void sendContextDirect();
            }
          }}
          placeholder={ui('اكتب ما تريد من AI أن ينفذه داخل مشروعك...', 'Describe what you want the AI to execute in your project...')}
          className="w-full min-h-20 px-3 py-2 rounded-lg bg-[#07070c] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-cyan-500/50 focus:outline-none resize-none"
          dir="auto"
        />
        <button
          onClick={() => void sendContextDirect()}
          disabled={!taskQuery.trim() || bridgeState === 'AGENT_CONNECTING' || bridgeState === 'VALIDATING'}
          className="w-full mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold disabled:opacity-40"
        >
          {bridgeState === 'AGENT_CONNECTING' ? ui('جارٍ تجهيز المهمة…', 'Preparing task…') : ui('إرسال المهمة إلى AI وبدء التنفيذ', 'Send task to AI and start execution')}
        </button>
      </section>

      <section>
        <p className="text-[10px] text-[#94a3b8] mb-1.5">{ui('اختر AI أو استخدم أي AI عبر الرابط:', 'Choose an AI or use Any AI by URL:')}</p>
        <div className="ulab-provider-grid grid grid-cols-5 gap-1.5">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={'p-2 rounded-xl border text-center transition-all ' +
                (selectedProvider === provider.id ? 'is-selected' : '')}
              title={provider.name}
            >
              <span className="ulab-provider-mark">{provider.icon}</span>
              <p className="text-[8px] text-[#94a3b8] mt-0.5 truncate">{provider.name}</p>
            </button>
          ))}
        </div>

        <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-400/15">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-300" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-emerald-100">
                {providerInfo.integrationMode === 'official-local-mcp' ? ui('MCP محلي مدعوم', 'Provider-supported local MCP') :
                 providerInfo.integrationMode === 'official-remote-mcp' ? ui('MCP رسمي عبر اتصال بعيد', 'Provider-supported remote MCP') :
                 ui('مسار توافق المتصفح', 'Browser compatibility route')}
              </p>
              <p className="text-[8px] text-[#71809f] mt-0.5 leading-relaxed">{providerInfo.integrationNote}</p>
            </div>
          </div>
        </div>

        {selectedProvider === 'custom' && (
          <input
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="https://any-ai-chat.example.com/"
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
            {aiOpen ? ui('إعادة فتح ', 'Reopen ') : ui('فتح ', 'Open ')}{providerInfo.name}
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
            {ui('إغلاق جلسة AI', 'Close AI session')}
          </button>
        </div>

        {window.ulabDesktop?.isDesktop && (
          <button
            onClick={() => void runDiagnostics()}
            disabled={diagnosticsBusy}
            className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#b9c5df] text-[10px] font-semibold hover:bg-white/[0.07] disabled:opacity-40"
          >
            {diagnosticsBusy ? ui('جاري فحص صفحة الـAI…', 'Inspecting AI session…') : ui('تشخيص جلسة الـAI', 'Diagnose AI session')}
          </button>
        )}
      </section>
      {diagnostics?.authRequired && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px]" dir="auto">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-100">{ui('تسجيل الدخول مطلوب', 'Sign in required')}</p>
              <p className="mt-1 text-amber-200/70 leading-relaxed">
                {ui(
                  `جلسة ${providerInfo.name} مفتوحة داخل ULAB، لكنها غير مسجلة الدخول بعد. سجّل الدخول داخل نافذة الـAI، ثم شغّل التشخيص مرة أخرى أو أرسل السياق.`,
                  `${providerInfo.name} is open inside ULAB, but it is not signed in yet. Sign in in the AI session, then diagnose again or send the task.`
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      {diagnostics && (
        <div className="p-2 rounded-lg bg-[#0a0a0f] border border-white/[0.08] text-[9px]" dir="ltr">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-[#dbe7ff]">{ui('جلسة AI', 'AI session')}</span>
            <span className={diagnostics.ok ? 'text-green-400' : 'text-red-400'}>
              {diagnostics.ok ? ui('جاهزة', 'Ready') : ui('خطأ', 'Error')}
            </span>
          </div>
          {diagnostics.ok ? (
            <div className="space-y-1 text-[#8a9aba]">
              <div>{ui('حقول الإدخال', 'Inputs')}: <b className="text-white">{diagnostics.inputs?.length || 0}</b></div>
              <div>{ui('عناصر الإرسال', 'Send controls')}: <b className="text-white">{diagnostics.sendButtons?.length || 0}</b></div>
              <div>{ui('عناصر رد AI', 'Assistant nodes')}: <b className="text-white">{diagnostics.assistantNodes?.length || 0}</b></div>
              <div className="truncate" title={diagnostics.url}>URL: {diagnostics.url}</div>
            </div>
          ) : (
            <div className="text-red-300">{diagnostics.error || ui('تعذر فحص جلسة AI.', 'Unable to inspect this AI session.')}</div>
          )}
        </div>
      )}

      {window.ulabDesktop?.isDesktop && (
        <section className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-300" />
              <div>
                <p className="text-xs font-bold text-white">{ui('جسر ULAB المحلي', 'ULAB local bridge')}</p>
                <p className="text-[9px] text-[#71809f]">{ui('تنفيذ محلي مباشر بدون نسخ prompts أو ملفات المشروع يدويًا', 'Direct local execution without manually copying prompts or project files')}</p>
              </div>
            </div>
            <span className="text-[8px] text-cyan-300 border border-cyan-400/20 rounded px-1.5 py-0.5">LOCAL</span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-[#07070c] border border-white/[0.06] px-2.5 py-2">
            <div>
              <p className="text-[9px] text-[#64748b]">{ui('حالة خادم MCP', 'MCP server status')}</p>
              <p className="text-[10px] font-semibold text-white">
                {mcpBusy ? ui('جاري الفحص…', 'Checking…') : mcpStatus?.ok ? ui('متصل ويعمل', 'Connected and running') : ui('غير متحقق', 'Not verified')}
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
                {mcpBusy ? ui('جاري الفحص…', 'Checking…') : ui('فحص اتصال MCP', 'Check MCP connection')}
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
                {mcpCopied ? ui('تم النسخ', 'Copied') : ui('نسخ HTTP', 'Copy HTTP')}
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
            {ui('نسخ أمر MCP عبر stdio', 'Copy MCP stdio command')}
          </button>

          {mcpStatus && !mcpStatus.ok && (
            <p className="mt-1.5 text-[8px] text-yellow-300 leading-relaxed" dir="ltr">
              {mcpStatus.stage ? `${mcpStatus.stage}: ` : ''}{String(mcpStatus.error || 'MCP server is not ready')}
            </p>
          )}
          <p className="mt-1.5 text-[8px] text-[#64748b]">
            {ui('القراءة والبحث واقتراح التعديلات متاحة عبر MCP. تنفيذ الكتابة والحذف والأوامر الحساسة يمر عبر موافقة ULAB. إعداد stdio يعمل كجلسة MCP محلية مرتبطة بنفس مساحة العمل.', 'Read, search, and change proposals are available through MCP. Writes, deletes, and sensitive commands go through ULAB human approval. The stdio setup proxies to the same active workspace in ULAB.')}
          </p>
          <p className="mt-1 text-[8px] text-[#64748b]">
            {ui('لا تشارك Bearer token أو أمر الاتصال خارج جهازك.', 'Never share the Bearer token or connection command outside this device.')}
          </p>
        </section>
      )}

      {context ? (
        <section className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="w-4 h-4 text-[#8da2bf]" />
            <div>
              <p className="text-xs font-bold text-white">{ui('سياق مساحة العمل جاهز', 'Workspace context ready')}</p>
              <p className="text-[9px] text-[#71809f]">
                {context.files.length} {ui('ملف', 'files')} · ~{context.totalLines} {ui('سطر', 'lines')} · ~{context.estimatedTokens} {ui('رمز', 'tokens')}
              </p>
            </div>
          </div>
          <p className="text-[9px] text-[#7f8cab]">
            {ui(
              'يرسل ULAB فقط سياق المشروع المحدد مباشرة إلى جلسة AI المختارة. يبقى الـAgent المحلي محصورًا داخل مساحة العمل المحددة.',
              'ULAB sends only the selected project context directly into the chosen AI session. The local Agent stays inside the selected workspace.'
            )}
          </p>
          <button
            onClick={() => void sendContextDirect()}
            className="ulab-btn ulab-btn-primary w-full mt-2"
          >
            <Link2 className="w-4 h-4" />
            {ui('إرسال المهمة والسياق إلى AI', 'Send task and context to AI')}
          </button>
        </section>
      ) : (
        <section className="p-4 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a] text-center">
          <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-white">{ui('الجسر جاهز', 'Bridge ready')}</p>
          <p className="text-[9px] text-[#71809f] mt-1">
            {ui('اكتب المهمة مباشرة. ULAB سيفتح جلسة AI عند الحاجة ويرسل المهمة مع أي سياق محلي متاح.', 'Describe the task directly. ULAB opens the selected AI session when needed and sends the available local context.')}
          </p>
        </section>
      )}

      <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="flex items-start gap-1.5">
          <Lock className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-green-300 leading-relaxed">
            {ui('ملفاتك لا تغادر مساحة العمل إلا كسياق صريح ترسله إلى جلسة AI المختارة. التعديلات والأوامر الحساسة تتطلب موافقة بشرية داخل ULAB.', 'Files leave the workspace only as explicit context sent to the selected AI session. Sensitive changes and commands require human approval in ULAB.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-indigo-400">{context?.files.length || 0}</p>
          <p className="text-[8px] text-[#64748b]">{ui('ملفات', 'files')}</p>
        </div>
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-cyan-400">{context ? '~' + context.estimatedTokens : '—'}</p>
          <p className="text-[8px] text-[#64748b]">{ui('رموز', 'tokens')}</p>
        </div>
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-green-400">{ui('محصور', 'Scoped')}</p>
          <p className="text-[8px] text-[#64748b]">Agent</p>
        </div>
      </div>
    </div>
  );
}
