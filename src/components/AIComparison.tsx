import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Copy, Check, ExternalLink, Sparkles, Zap } from 'lucide-react';
import { ContextResult } from '../utils/contextEngine';

interface AIComparisonProps {
  context: ContextResult | null;
  fileContents: Record<string, string>;
  query: string;
}

const AI_PROVIDERS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', color: 'from-green-500 to-emerald-500', icon: '🤖' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', color: 'from-blue-500 to-indigo-500', icon: '✨' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', color: 'from-orange-500 to-amber-500', icon: '🧠' },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com', color: 'from-purple-500 to-violet-500', icon: '🔮' },
  { id: 'copilot', name: 'Copilot', url: 'https://copilot.microsoft.com', color: 'from-cyan-500 to-blue-500', icon: '🪟' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', color: 'from-teal-500 to-cyan-500', icon: '🔍' },
];

export default function AIComparison({ context, fileContents, query }: AIComparisonProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['chatgpt', 'gemini', 'claude']);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const toggleProvider = (id: string) => {
    setSelectedProviders(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generatePrompt = (providerId: string): string => {
    if (!context || !query) return '';
    
    let prompt = `# Project Context\n\n`;
    prompt += `I'm working on a local project. Here's the relevant context:\n\n`;
    
    for (const file of context.files.slice(0, 5)) {
      const content = fileContents[file.path];
      if (content) {
        const lines = content.split('\n').slice(0, 100).join('\n');
        prompt += `## File: ${file.path}\n\`\`\`\n${lines}\n\`\`\`\n\n`;
      }
    }
    
    prompt += `---\n\n## My Question:\n${query}\n\n`;
    prompt += `Please analyze the code above and help me with my question.`;
    
    return prompt;
  };

  const copyPrompt = (providerId: string) => {
    const prompt = generatePrompt(providerId);
    navigator.clipboard.writeText(prompt);
    setIsCopied(providerId);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const copyAllContext = () => {
    if (!context) return;
    let text = `# Project Context for: "${query}"\n\n`;
    text += `## Selected Files (${context.files.length})\n\n`;
    for (const file of context.files) {
      const content = fileContents[file.path];
      text += `### ${file.path}\n`;
      if (content) {
        text += `\`\`\`\n${content.split('\n').slice(0, 80).join('\n')}\n\`\`\`\n\n`;
      }
    }
    text += `\n## Question:\n${query}`;
    navigator.clipboard.writeText(text);
    setIsCopied('all');
    setTimeout(() => setIsCopied(null), 2000);
  };

  if (!context) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Globe className="w-12 h-12 text-[#2a2a3a] mb-4" />
        <p className="text-sm text-[#94a3b8]">استخرج السياق أولًا لمقارنة AI</p>
        <p className="text-xs text-[#64748b] mt-2">اكتب سؤالك في لوحة المحادثة</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          مقارنة AI
        </h3>
        <button 
          onClick={copyAllContext}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
        >
          {isCopied === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          نسخ الكل
        </button>
      </div>

      {/* Query */}
      <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] mb-4">
        <p className="text-[10px] text-[#64748b] mb-1">السؤال:</p>
        <p className="text-xs text-[#e2e8f0]" dir="auto">{query || 'لم يتم تحديد سؤال'}</p>
      </div>

      {/* Provider Selection */}
      <p className="text-xs text-[#94a3b8] mb-2">اختر مزودي AI:</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {AI_PROVIDERS.map(provider => (
          <button
            key={provider.id}
            onClick={() => toggleProvider(provider.id)}
            className={`p-2 rounded-lg border text-right transition-all ${
              selectedProviders.includes(provider.id)
                ? 'border-indigo-500/50 bg-indigo-500/10'
                : 'border-[#2a2a3a] hover:border-[#3a3a4a]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{provider.icon}</span>
              <span className="text-xs font-medium">{provider.name}</span>
              {selectedProviders.includes(provider.id) && (
                <Check className="w-3 h-3 text-indigo-400 mr-auto" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Provider Actions */}
      <p className="text-xs text-[#94a3b8] mb-2">إرسال إلى:</p>
      <div className="space-y-2">
        {AI_PROVIDERS.filter(p => selectedProviders.includes(p.id)).map(provider => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{provider.icon}</span>
                <span className="text-xs font-bold">{provider.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyPrompt(provider.id)}
                  className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
                  title="نسخ السؤال مع السياق"
                >
                  {isCopied === provider.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
                  title={`فتح ${provider.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-500/10 text-green-300">
                {context.files.length} ملفات
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-300">
                ~{context.estimatedTokens} tokens
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
        <p className="text-[10px] text-indigo-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          انسخ السياق والصقه في أي AI لبدء المحادثة
        </p>
      </div>
    </div>
  );
}
