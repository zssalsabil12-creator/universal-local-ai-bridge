import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Copy, Check, ExternalLink, Sparkles, Zap,
  Settings, ChevronDown, ChevronUp, RefreshCw, Download,
  Shield, Lock, Unlock, AlertCircle
} from 'lucide-react';
import { ContextResult } from '../utils/contextEngine';
import {
  AIProvider, PromptConfig, generateSystemPrompt,
  generateQuickPrompt, generateBridgeCard, getProviderInfo, getAllProviders
} from '../utils/promptGenerator';

interface AIBridgePanelProps {
  context: ContextResult | null;
  fileContents: Record<string, string>;
  query: string;
  projectName: string;
  projectStructure: string;
  permissionMode: string;
}

export default function AIBridgePanel({
  context,
  fileContents,
  query,
  projectName,
  projectStructure,
  permissionMode,
}: AIBridgePanelProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('chatgpt');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [enabledTools, setEnabledTools] = useState<string[]>(['files.read', 'files.search', 'project.context']);

  const providers = getAllProviders();
  const providerInfo = getProviderInfo(selectedProvider);

  const config: PromptConfig = {
    provider: selectedProvider,
    projectName,
    projectStructure,
    permissionMode: permissionMode as any,
    enabledTools,
    customInstructions,
  };

  const systemPrompt = generateSystemPrompt(config);
  
  const contextFiles = context?.files.slice(0, 5).map(f => ({
    path: f.path,
    content: fileContents[f.path] || '[File not loaded]',
  })) || [];

  const quickPrompt = context 
    ? generateQuickPrompt(config, contextFiles, query)
    : '';

  const bridgeCard = context
    ? generateBridgeCard(projectName, query, context.files.length, context.totalLines, context.estimatedTokens)
    : '';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openProvider = (providerId: AIProvider) => {
    const urls: Record<AIProvider, string> = {
      chatgpt: 'https://chat.openai.com',
      gemini: 'https://gemini.google.com',
      claude: 'https://claude.ai',
      deepseek: 'https://chat.deepseek.com',
      qwen: 'https://chat.qwen.ai',
      mistral: 'https://chat.mistral.ai',
      llama: 'https://llama.meta.com',
      grok: 'https://grok.com',
      copilot: 'https://copilot.microsoft.com',
      perplexity: 'https://perplexity.ai',
      custom: '',
    };
    const url = urls[providerId];
    if (url) window.open(url, '_blank');
  };

  const toggleTool = (tool: string) => {
    setEnabledTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  if (!context) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-sm font-bold mb-2">AI Bridge</h3>
        <p className="text-xs text-[#94a3b8] mb-4">
          اربط أي chatbot بجهازك ليعمل كوكيل محلي
        </p>
        <div className="p-3 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] text-[10px] text-[#64748b]">
          اكتب سؤالك في لوحة AI لاستخراج السياق والبدء
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          AI Bridge
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-[#252530] hover:bg-[#2a2a3a] transition-colors"
        >
          <Settings className="w-3 h-3" />
          {showAdvanced ? 'إخفاء' : 'خيارات'}
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Provider Selection */}
      <div>
        <p className="text-[10px] text-[#94a3b8] mb-1.5">اختر chatbot:</p>
        <div className="grid grid-cols-5 gap-1.5">
          {providers.slice(0, 10).map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-2 rounded-lg border text-center transition-all ${
                selectedProvider === provider.id
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-[#2a2a3a] hover:border-[#3a3a4a]'
              }`}
              title={provider.name}
            >
              <span className="text-lg">{provider.icon}</span>
              <p className="text-[8px] text-[#94a3b8] mt-0.5 truncate">{provider.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Selection */}
      {showAdvanced && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <p className="text-[10px] text-[#94a3b8] mb-1.5">الأدوات المفعلة:</p>
          <div className="flex flex-wrap gap-1">
            {['files.read', 'files.search', 'files.write', 'project.context', 'git.status', 'terminal.run'].map(tool => (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
                  enabledTools.includes(tool)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-[#252530] text-[#64748b] border border-[#2a2a3a]'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
          <textarea
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder="تعليمات مخصصة للـ AI..."
            className="w-full mt-2 p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-[10px] text-white placeholder:text-[#64748b] focus:border-indigo-500/50 focus:outline-none resize-none"
            rows={2}
            dir="auto"
          />
        </motion.div>
      )}

      {/* Bridge Card */}
      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 border border-indigo-500/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-indigo-300">🔌 Bridge Card</span>
          <button
            onClick={() => copyToClipboard(bridgeCard, 'card')}
            className="p-1 rounded hover:bg-[#252530] transition-colors"
          >
            {copiedField === 'card' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[#94a3b8]" />}
          </button>
        </div>
        <pre className="text-[9px] text-[#94a3b8] font-mono whitespace-pre" dir="ltr">{bridgeCard}</pre>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        {/* System Prompt */}
        <div className="p-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#e2e8f0]">System Prompt</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#64748b]">{systemPrompt.length} chars</span>
              <button
                onClick={() => copyToClipboard(systemPrompt, 'system')}
                className="p-1 rounded hover:bg-[#252530] transition-colors"
              >
                {copiedField === 'system' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[#94a3b8]" />}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-[#64748b] line-clamp-2" dir="ltr">
            {systemPrompt.slice(0, 150)}...
          </p>
        </div>

        {/* Full Context */}
        <div className="p-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#e2e8f0]">Full Context</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#64748b]">{quickPrompt.length} chars</span>
              <button
                onClick={() => copyToClipboard(quickPrompt, 'context')}
                className="p-1 rounded hover:bg-[#252530] transition-colors"
              >
                {copiedField === 'context' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[#94a3b8]" />}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-[#64748b] line-clamp-2" dir="ltr">
            {quickPrompt.slice(0, 150)}...
          </p>
        </div>
      </div>

      {/* One-Click Actions */}
      <div className="space-y-1.5">
        <button
          onClick={() => {
            copyToClipboard(`${systemPrompt}\n\n---\n\n${quickPrompt}`, 'all');
          }}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedField === 'all' ? 'تم النسخ!' : 'نسخ كل شيء للصق في AI'}
        </button>

        <button
          onClick={() => openProvider(selectedProvider)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#252530] text-white text-xs font-medium hover:bg-[#2a2a3a] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          فتح {providerInfo.name}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="flex items-start gap-1.5">
          <Lock className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-green-300 leading-relaxed">
            ملفاتك لا تغادر جهازك. يتم نسخ السياق للحافظة فقط، ثم تلصقه أنت في chatbot المفضل لديك.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-indigo-400">{context.files.length}</p>
          <p className="text-[8px] text-[#64748b]">ملفات</p>
        </div>
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-cyan-400">~{context.estimatedTokens}</p>
          <p className="text-[8px] text-[#64748b]">tokens</p>
        </div>
        <div className="p-1.5 rounded bg-[#0a0a0f] text-center">
          <p className="text-xs font-bold text-green-400">100%</p>
          <p className="text-[8px] text-[#64748b]">محلي</p>
        </div>
      </div>
    </div>
  );
}
