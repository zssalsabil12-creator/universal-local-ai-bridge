import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    {
      category: 'المشروع والبحث',
      items: [
        { keys: ['Ctrl', 'O'], description: 'فتح مساحة عمل' },
        { keys: ['Ctrl', 'F'], description: 'البحث في الملفات' },
        { keys: ['Ctrl', 'K'], description: 'البحث السريع' },
      ],
    },
    {
      category: 'لوحات ULAB',
      items: [
        { keys: ['Ctrl', '1'], description: 'فتح AI Bridge' },
        { keys: ['Ctrl', '2'], description: 'فتح لوحة السياق' },
      ],
    },
    {
      category: 'AI Bridge',
      items: [
        { keys: ['Ctrl', 'Enter'], description: 'تحليل المهمة وبناء السياق' },
      ],
    },
    {
      category: 'النوافذ',
      items: [
        { keys: ['Esc'], description: 'إغلاق نافذة أو حوار مفتوح' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#111118] border border-[#2a2a3a] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">اختصارات لوحة المفاتيح</h3>
                  <p className="text-xs text-[#94a3b8]">تحكم سريع في الأداة</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {shortcuts.map((category, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-indigo-400 mb-3">{category.category}</h4>
                  <div className="space-y-2">
                    {category.items.map((shortcut, j) => (
                      <div key={j} className="flex items-center justify-between p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a]">
                        <span className="text-xs text-[#e2e8f0]">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, k) => (
                            <span key={k} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 rounded bg-[#252530] border border-[#2a2a3a] text-[10px] font-mono text-[#94a3b8]">
                                {key}
                              </kbd>
                              {k < shortcut.keys.length - 1 && (
                                <span className="text-[10px] text-[#64748b]">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2a2a3a] text-center">
              <p className="text-[10px] text-[#64748b]">
                💡 اضغط <kbd className="px-1.5 py-0.5 rounded bg-[#252530] border border-[#2a2a3a] text-[9px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#252530] border border-[#2a2a3a] text-[9px] font-mono">?</kbd> لعرض هذه النافذة
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
