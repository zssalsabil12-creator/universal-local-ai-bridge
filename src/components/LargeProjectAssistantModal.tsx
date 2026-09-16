import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Search,
  CheckSquare,
  Square,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  Sliders,
  X,
  Gauge,
  Info,
} from 'lucide-react';
import { ProjectIndex } from '../utils/fileSystem';

interface LargeProjectAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectIndex: ProjectIndex | null;
  fileContents: Record<string, string>;
  onReadFile: (path: string) => Promise<void>;
}

export const LargeProjectAssistantModal: React.FC<LargeProjectAssistantModalProps> = ({
  isOpen,
  onClose,
  projectIndex,
  fileContents,
  onReadFile,
}) => {
  const [taskQuery, setTaskQuery] = useState('');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [extractionMode, setExtractionMode] = useState<'smart' | 'outline' | 'full'>('smart');
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Collect all code files in the project
  const allFiles = useMemo(() => {
    if (!projectIndex) return [];
    return projectIndex.flatFiles.filter(f => {
      const ext = (f.extension || '').toLowerCase();
      return ['ts', 'tsx', 'js', 'jsx', 'py', 'json', 'html', 'css', 'go', 'rs', 'java', 'sql', 'php'].includes(ext);
    });
  }, [projectIndex]);

  // Rank files based on taskQuery relevance
  const rankedFiles = useMemo(() => {
    if (!taskQuery.trim()) {
      return allFiles;
    }
    const words = taskQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    return [...allFiles].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const pathA = a.path.toLowerCase();
      const pathB = b.path.toLowerCase();

      words.forEach(w => {
        if (pathA.includes(w)) scoreA += 5;
        if (pathB.includes(w)) scoreB += 5;
      });

      return scoreB - scoreA;
    });
  }, [allFiles, taskQuery]);

  // Auto-select top relevant files when query changes
  const handleAutoSelect = () => {
    if (!taskQuery.trim()) return;
    const top = rankedFiles.slice(0, 5).map(f => f.path);
    setSelectedPaths(new Set(top));
    top.forEach(path => {
      if (!fileContents[path]) onReadFile(path);
    });
  };

  const togglePath = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
      if (!fileContents[path]) onReadFile(path);
    }
    setSelectedPaths(next);
  };

  // Generate an outline (interfaces, function headers, exports) without full body
  const extractOutline = (code: string): string => {
    const lines = code.split('\n');
    const outlineLines: string[] = [];
    let insideDoc = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('/**')) insideDoc = true;
      if (insideDoc) {
        outlineLines.push(line);
        if (trimmed.includes('*/')) insideDoc = false;
        continue;
      }

      if (
        trimmed.startsWith('import ') ||
        trimmed.startsWith('export ') ||
        trimmed.startsWith('interface ') ||
        trimmed.startsWith('type ') ||
        trimmed.startsWith('function ') ||
        trimmed.startsWith('class ') ||
        trimmed.startsWith('const ') && trimmed.includes('=>')
      ) {
        // Keep header, replace body if multi-line
        outlineLines.push(line.replace(/\{[\s\S]*$/, '{ /* ... implementation ... */ }'));
      }
    }

    return outlineLines.length > 0 ? outlineLines.join('\n') : code.slice(0, 500) + '\n// ...';
  };

  // Compute bundled prompt & token estimation
  const { generatedPrompt, estimatedTokens } = useMemo(() => {
    const filesArray = Array.from(selectedPaths);
    let totalChars = 0;
    const parts: string[] = [];

    parts.push(`=== ULAB PROJECT CONTEXT ===`);
    parts.push(`Project: ${projectIndex?.rootName || 'Project'}`);
    parts.push(`Total Files in Project: ${projectIndex?.totalFiles || 0}`);
    parts.push(`User Goal / Task: "${taskQuery || 'General architectural task'}"\n`);
    parts.push(
      `INSTRUCTIONS FOR AI:\n` +
      `1. You are acting as an expert local developer agent on this codebase.\n` +
      `2. Return any updated or newly created files using the following format:\n` +
      `=== FILE: path/to/file.ext ===\n` +
      `[Complete updated source code here]\n` +
      `=== END FILE ===\n` +
      `3. Do not omit necessary imports or code blocks.\n`
    );

    filesArray.forEach(path => {
      let content = fileContents[path] || '// [Loading content...]';
      if (extractionMode === 'outline') {
        content = extractOutline(content);
      }
      parts.push(`=== FILE: ${path} ===\n${content}\n=== END FILE ===\n`);
      totalChars += content.length;
    });

    const promptText = parts.join('\n');
    const tokens = Math.round(promptText.length / 3.8);

    return { generatedPrompt: promptText, estimatedTokens: tokens };
  }, [selectedPaths, fileContents, projectIndex, taskQuery, extractionMode]);

  const handleCopyAndLaunch = (url: string) => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-[#111118] border border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] bg-[#161622]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  مساعد المشاريع الضخمة (Large Project Context Slicer)
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Smart Slicing
                  </span>
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  استخرج فقط ما يحتاجه DeepSeek أو ChatGPT دون تجاوز حد الذاكرة (Context Limits)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#252535] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Query & File Slicing */}
            <div className="w-full lg:w-5/12 flex flex-col border-b lg:border-b-0 lg:border-l border-[#2a2a3a] bg-[#0d0d14] p-4 space-y-3 overflow-hidden">
              <div>
                <label className="text-xs font-semibold text-white block mb-1">
                  1. ماذا تريد أن تطلب من الذكاء الاصطناعي؟ (المهمة المطلوبة):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={taskQuery}
                    onChange={e => setTaskQuery(e.target.value)}
                    placeholder="مثال: أضف نظام تسجيل الدخول أو أصلح خطأ في API..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#07070b] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-purple-500 focus:outline-none"
                    dir="auto"
                  />
                  <button
                    onClick={handleAutoSelect}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    تحديد تلقائي
                  </button>
                </div>
              </div>

              {/* Extraction Mode Toggle */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  2. وضع ضغط السياق للمشاريع الكبيرة:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#07070b] p-1 rounded-xl border border-[#2a2a3a]">
                  <button
                    onClick={() => setExtractionMode('smart')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      extractionMode === 'smart'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    ذكي (افتراضي)
                  </button>
                  <button
                    onClick={() => setExtractionMode('outline')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      extractionMode === 'outline'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    هيكل الكود فقط (-85%)
                  </button>
                  <button
                    onClick={() => setExtractionMode('full')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      extractionMode === 'full'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    كامل الملفات
                  </button>
                </div>
              </div>

              {/* Files Selection */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">
                    3. الملفات المشمولة في السياق ({selectedPaths.size} محدد):
                  </span>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="تصفية..."
                    className="w-24 px-2 py-0.5 rounded bg-[#151520] border border-[#2a2a3a] text-[10px] text-white"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {rankedFiles
                    .filter(f => !searchFilter || f.path.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map(file => {
                      const isSelected = selectedPaths.has(file.path);
                      return (
                        <div
                          key={file.path}
                          onClick={() => togglePath(file.path)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                              : 'bg-[#12121a] text-[#94a3b8] hover:bg-[#181824]'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-[#64748b] flex-shrink-0" />
                          )}
                          <span className="truncate flex-1" dir="ltr">
                            {file.path}
                          </span>
                          <span className="text-[9px] text-[#64748b]">
                            {fileContents[file.path]
                              ? `${Math.round(fileContents[file.path].length / 4)}t`
                              : ''}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Column: Generated Context Preview & Token Meter */}
            <div className="w-full lg:w-7/12 flex flex-col bg-[#0a0a0f] overflow-hidden">
              {/* Token Gauge Header */}
              <div className="p-3 border-b border-[#2a2a3a] bg-[#111118] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">
                    حجم السياق المقدر: ~{estimatedTokens.toLocaleString()} Token
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      estimatedTokens < 32000
                        ? 'bg-green-500/20 text-green-300'
                        : estimatedTokens < 64000
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {estimatedTokens < 32000
                      ? 'ممتاز لـ DeepSeek و ChatGPT'
                      : estimatedTokens < 64000
                      ? 'مناسب لنماذج الذاكرة الكبيرة'
                      : 'مرتفع — ننصح بتقليل الملفات'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#252535] hover:bg-[#2f2f45] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ!' : 'نسخ النص'}
                </button>
              </div>

              {/* Code / Prompt Output */}
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#cbd5e1] whitespace-pre-wrap bg-[#08080c]" dir="ltr">
                {generatedPrompt}
              </div>
            </div>
          </div>

          {/* Footer One-Click Launchers */}
          <div className="px-6 py-4 border-t border-[#2a2a3a] bg-[#161622] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#94a3b8] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              اضغط على أي زر لنسخ السياق تلقائياً وفتح الشات بوت المفضل لديك مجاناً:
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCopyAndLaunch('https://chat.deepseek.com')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                نسخ وفتح DeepSeek
              </button>

              <button
                onClick={() => handleCopyAndLaunch('https://chatgpt.com')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                نسخ وفتح ChatGPT
              </button>

              <button
                onClick={() => handleCopyAndLaunch('https://claude.ai')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                نسخ وفتح Claude
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LargeProjectAssistantModal;
