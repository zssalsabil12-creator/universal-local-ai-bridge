import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ClipboardCheck,
  FileCode,
  Check,
  X,
  ArrowRight,
  Download,
  AlertCircle,
  Eye,
  RefreshCw,
  FolderCheck,
} from 'lucide-react';
import { parseFileModifications, generateDiff, FileModification } from '../utils/ulpProtocol';
import { exportProjectToZip } from '../utils/fileSystem';

interface DirectAIPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContents: Record<string, string>;
  onApplyToFile: (path: string, newContent: string) => Promise<boolean>;
  onBatchApply: (files: { path: string; content: string }[]) => Promise<void>;
  projectName?: string;
  hasLocalDirectory: boolean;
}

export const DirectAIPasteModal: React.FC<DirectAIPasteModalProps> = ({
  isOpen,
  onClose,
  fileContents,
  onApplyToFile,
  onBatchApply,
  projectName = 'Project',
  hasLocalDirectory,
}) => {
  const [inputText, setInputText] = useState('');
  const [parsedFiles, setParsedFiles] = useState<
    (FileModification & {
      selected: boolean;
      status?: 'pending' | 'applied' | 'failed';
    })[]
  >([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number>(0);

  // Re-parse whenever inputText changes
  useEffect(() => {
    if (!inputText.trim()) {
      setParsedFiles([]);
      return;
    }

    const mods = parseFileModifications(inputText);
    const withDetails = mods.map(m => {
      const before = fileContents[m.path] || '';
      return {
        ...m,
        selected: true,
        status: 'pending' as const,
        diff: {
          before,
          after: m.content || '',
          changes: generateDiff(before, m.content || ''),
        },
      };
    });

    setParsedFiles(withDetails);
    setSelectedFileIndex(0);
  }, [inputText, fileContents]);

  const handleApplyAll = async () => {
    const selected = parsedFiles.filter(f => f.selected && f.content);
    if (selected.length === 0) return;

    setIsApplying(true);
    let count = 0;

    for (let i = 0; i < parsedFiles.length; i++) {
      const item = parsedFiles[i];
      if (item.selected && item.content) {
        try {
          const ok = await onApplyToFile(item.path, item.content);
          if (ok) {
            count++;
            setParsedFiles(prev =>
              prev.map((f, idx) => (idx === i ? { ...f, status: 'applied' } : f))
            );
          } else {
            setParsedFiles(prev =>
              prev.map((f, idx) => (idx === i ? { ...f, status: 'failed' } : f))
            );
          }
        } catch {
          setParsedFiles(prev =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'failed' } : f))
          );
        }
      }
    }

    setIsApplying(false);
    setAppliedCount(count);
  };

  const handleDownloadZip = async () => {
    const filesToZip: Record<string, string> = {};
    parsedFiles.forEach(f => {
      if (f.selected && f.content) {
        filesToZip[f.path] = f.content;
      }
    });

    if (Object.keys(filesToZip).length === 0) return;

    const blob = await exportProjectToZip(filesToZip, `${projectName}-ai-patch`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-ai-changes-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const currentFile = parsedFiles[selectedFileIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-[#111118] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] bg-[#161622]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  تطبيق ردود الذكاء الاصطناعي (DeepSeek / ChatGPT / Claude)
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Smart Parser
                  </span>
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  الصق الرد البرمجي وسيقوم ULAB بفصل الملفات ومقارنة التعديلات وحفظها بجهازك بنقرة زر
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

          {/* Main Layout: Split into Input & Diff View */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left/Top: Paste Area & Files List */}
            <div className="w-full lg:w-5/12 flex flex-col border-b lg:border-b-0 lg:border-l border-[#2a2a3a] bg-[#0d0d14]">
              <div className="p-3 border-b border-[#2a2a3a] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#e2e8f0]">1. الصق رد الذكاء الاصطناعي هنا:</span>
                {parsedFiles.length > 0 && (
                  <span className="text-xs font-bold text-cyan-400">
                    تم اكتشاف {parsedFiles.length} ملف
                  </span>
                )}
              </div>

              <div className="p-3 flex-shrink-0">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="انسخ رد DeepSeek أو ChatGPT والصقه هنا كاملاً...
مثال:
=== FILE: src/app.ts ===
export function hello() { ... }

أو كتل الأكواد ```ts:src/app.ts أو ```ts // src/app.ts"
                  className="w-full h-32 p-2.5 rounded-xl bg-[#07070b] border border-[#2a2a3a] text-xs font-mono text-white placeholder:text-[#64748b] focus:border-cyan-500 focus:outline-none resize-none"
                  dir="ltr"
                />
              </div>

              {/* Detected Files List */}
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                <div className="flex items-center justify-between py-1 mb-2 text-[11px] text-[#94a3b8]">
                  <span>2. الملفات المكتشفة للتطبيق:</span>
                  {parsedFiles.length > 0 && (
                    <button
                      onClick={() => {
                        const allSelected = parsedFiles.every(f => f.selected);
                        setParsedFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
                      }}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {parsedFiles.every(f => f.selected) ? 'إلغاء التحديد' : 'تحديد الكل'}
                    </button>
                  )}
                </div>

                {parsedFiles.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#64748b]">
                    لم يتم العثور على ملفات بعد. الصق رد الـ AI في المربع أعلاه.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {parsedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedFileIndex(idx)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedFileIndex === idx
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                            : 'bg-[#151520] border-[#2a2a3a] text-[#94a3b8] hover:border-[#3a3a4e]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={file.selected}
                            onChange={e => {
                              e.stopPropagation();
                              setParsedFiles(prev =>
                                prev.map((f, i) => (i === idx ? { ...f, selected: e.target.checked } : f))
                              );
                            }}
                            className="rounded border-[#3a3a4a] text-cyan-500 focus:ring-0"
                          />
                          <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-medium truncate" dir="ltr">
                              {file.path}
                            </p>
                            <span className="text-[10px] text-[#64748b]">
                              {file.content ? `${file.content.split('\n').length} سطر` : 'فارغ'}
                            </span>
                          </div>
                        </div>

                        {file.status === 'applied' && (
                          <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                            <Check className="w-3.5 h-3.5" /> تم الحفظ
                          </span>
                        )}
                        {file.status === 'failed' && (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                            <X className="w-3.5 h-3.5" /> فشل
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right/Bottom: Diff & Code Preview */}
            <div className="w-full lg:w-7/12 flex flex-col bg-[#0a0a0f] overflow-hidden">
              <div className="p-3 border-b border-[#2a2a3a] bg-[#111118] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-[#e2e8f0] truncate" dir="ltr">
                    {currentFile ? currentFile.path : 'معاينة التغييرات (Diff Preview)'}
                  </span>
                </div>
                {currentFile && (
                  <span className="text-[10px] text-[#64748b]">
                    {fileContents[currentFile.path] ? 'ملف موجود (تعديل)' : 'ملف جديد (إنشاء)'}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-xs">
                {currentFile ? (
                  <div className="space-y-0.5">
                    {currentFile.diff?.changes.map((change, i) => (
                      <div
                        key={i}
                        className={`flex py-0.5 px-2 rounded ${
                          change.type === 'add'
                            ? 'bg-green-950/40 text-green-300 border-l-2 border-green-500'
                            : change.type === 'remove'
                            ? 'bg-red-950/40 text-red-300 border-l-2 border-red-500 line-through opacity-70'
                            : 'text-[#94a3b8] hover:bg-[#151522]'
                        }`}
                      >
                        <span className="w-6 text-[10px] text-[#4a5568] select-none flex-shrink-0 text-right pr-2">
                          {change.type === 'add' ? '+' : change.type === 'remove' ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre overflow-x-auto" dir="ltr">
                          {change.line || ' '}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#64748b]">
                    <FileCode className="w-12 h-12 text-[#2a2a3a] mb-2" />
                    <p className="text-xs">اختر ملفاً من القائمة الجانبية لمعاينة التغييرات</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="px-6 py-4 border-t border-[#2a2a3a] bg-[#161622] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              {hasLocalDirectory ? (
                <span className="flex items-center gap-1.5 text-green-400">
                  <FolderCheck className="w-4 h-4" />
                  مجلد المشروع مفتوح محلياً وجاهز للكتابة
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  أنت في الوضع التجريبي أو لم تفتح مجلداً — يمكنك تحميل التعديلات كـ ZIP
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZip}
                disabled={parsedFiles.filter(f => f.selected).length === 0}
                className="px-4 py-2.5 rounded-xl bg-[#252535] hover:bg-[#2f2f42] text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                تحميل كحزمة ZIP
              </button>

              <button
                onClick={handleApplyAll}
                disabled={
                  isApplying ||
                  parsedFiles.filter(f => f.selected).length === 0 ||
                  !hasLocalDirectory
                }
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-40"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري الحفظ على جهازك...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    تطبيق التعديلات على ملفات جهازي
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DirectAIPasteModal;
