import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Plus, Pin, Trash2, Edit2, Save, X, Tag,
  FileText, Lightbulb, CheckCircle, AlertCircle
} from 'lucide-react';
import { ProjectMemory, MemoryEntry, createMemoryEntry } from '../utils/localMemory';
import { useLanguage } from '../i18n/LanguageContext';

interface LocalMemoryPanelProps {
  projectMemory: ProjectMemory;
  onUpdateMemory: (memory: ProjectMemory) => void;
}

export default function LocalMemoryPanel({ projectMemory, onUpdateMemory }: LocalMemoryPanelProps) {
  const { language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    type: 'fact' as MemoryEntry['type'],
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const typeIcons: Record<MemoryEntry['type'], any> = {
    decision: CheckCircle,
    rule: AlertCircle,
    fact: Lightbulb,
    preference: Tag,
    'file-note': FileText,
  };

  const typeColors: Record<MemoryEntry['type'], string> = {
    decision: 'text-green-400 bg-green-500/10',
    rule: 'text-yellow-400 bg-yellow-500/10',
    fact: 'text-blue-400 bg-blue-500/10',
    preference: 'text-purple-400 bg-purple-500/10',
    'file-note': 'text-cyan-400 bg-cyan-500/10',
  };

  const handleAdd = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    
    const entry = createMemoryEntry(
      projectMemory.projectId,
      newEntry.type,
      newEntry.title,
      newEntry.content,
      newEntry.tags
    );
    
    const updated = {
      ...projectMemory,
      entries: [...projectMemory.entries, entry],
      lastAccessed: Date.now(),
    };
    
    onUpdateMemory(updated);
    setNewEntry({ type: 'fact', title: '', content: '', tags: [] });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = {
      ...projectMemory,
      entries: projectMemory.entries.filter(e => e.id !== id),
    };
    onUpdateMemory(updated);
  };

  const handleTogglePin = (id: string) => {
    const updated = {
      ...projectMemory,
      entries: projectMemory.entries.map(e =>
        e.id === id ? { ...e, pinned: !e.pinned } : e
      ),
    };
    onUpdateMemory(updated);
  };

  const handleUpdateInstructions = (instructions: string) => {
    onUpdateMemory({
      ...projectMemory,
      projectInstructions: instructions,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !newEntry.tags.includes(tagInput.trim())) {
      setNewEntry({ ...newEntry, tags: [...newEntry.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewEntry({ ...newEntry, tags: newEntry.tags.filter(t => t !== tag) });
  };

  const sortedEntries = [...projectMemory.entries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold">Local Memory</span>
          <span className="text-[10px] text-[#64748b]">({projectMemory.entries.length})</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Project Instructions */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
          <label className="text-[10px] font-bold text-purple-300 mb-1 block">
            {ui('تعليمات المشروع','Project instructions')}
          </label>
          <textarea
            value={projectMemory.projectInstructions}
            onChange={e => handleUpdateInstructions(e.target.value)}
            placeholder={ui('أضف تعليمات خاصة بهذا المشروع...','Add project-specific instructions...')}
            className="w-full p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-purple-500/50 focus:outline-none resize-none"
            rows={3}
            dir="auto"
          />
        </div>

        {/* Add New Entry */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] space-y-2"
            >
              <select
                value={newEntry.type}
                onChange={e => setNewEntry({ ...newEntry, type: e.target.value as MemoryEntry['type'] })}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white"
              >
                <option value="fact">{ui('حقيقة','Fact')}</option>
                <option value="decision">{ui('قرار','Decision')}</option>
                <option value="rule">{ui('قاعدة','Rule')}</option>
                <option value="preference">{ui('تفضيل','Preference')}</option>
                <option value="file-note">{ui('ملاحظة ملف','File note')}</option>
              </select>
              <input
                value={newEntry.title}
                onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder={ui('العنوان','Title')}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b]"
                dir="auto"
              />
              <textarea
                value={newEntry.content}
                onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder={ui('المحتوى','Content')}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] resize-none"
                rows={3}
                dir="auto"
              />
              <div className="flex items-center gap-1">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder={ui('وسم','Tag')}
                  className="flex-1 px-2 py-1 rounded bg-[#111118] border border-[#2a2a3a] text-[10px] text-white placeholder:text-[#64748b]"
                  dir="auto"
                />
                <button
                  onClick={addTag}
                  className="px-2 py-1 rounded bg-[#252530] text-[10px] text-[#94a3b8] hover:bg-[#2a2a3a]"
                >
                  {ui('إضافة','Add')}
                </button>
              </div>
              {newEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {newEntry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={handleAdd}
                disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                {ui('حفظ','Save')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory Entries */}
        {sortedEntries.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-10 h-10 text-[#2a2a3a] mx-auto mb-3" />
            <p className="text-xs text-[#94a3b8] mb-1">{ui('لا توجد ذكريات','No memories')}</p>
            <p className="text-[10px] text-[#64748b]">
              {ui('أضف قرارات، قواعد، أو ملاحظات مهمة عن المشروع','Add decisions, rules, or important project notes')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEntries.map(entry => {
              const Icon = typeIcons[entry.type];
              const colorClass = typeColors[entry.type];
              
              return (
                <motion.div
                  key={entry.id}
                  layout
                  className={`p-2.5 rounded-lg border ${
                    entry.pinned
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-[#0a0a0f] border-[#2a2a3a]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-[#e2e8f0] truncate">
                          {entry.title}
                        </span>
                        {entry.pinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-[#94a3b8] line-clamp-2">{entry.content}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {entry.tags.map(tag => (
                            <span key={tag} className="px-1 py-0.5 rounded text-[8px] bg-[#252530] text-[#94a3b8]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[8px] text-[#64748b] mt-1">
                        {new Date(entry.updatedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG')}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleTogglePin(entry.id)}
                        className="p-1 rounded hover:bg-[#252530] transition-colors"
                        title={entry.pinned ? ui('إلغاء التثبيت','Unpin') : ui('تثبيت','Pin')}
                      >
                        <Pin className={`w-3 h-3 ${entry.pinned ? 'text-yellow-400' : 'text-[#64748b]'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors text-[#64748b] hover:text-red-400"
                        title={ui('حذف','Delete')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
