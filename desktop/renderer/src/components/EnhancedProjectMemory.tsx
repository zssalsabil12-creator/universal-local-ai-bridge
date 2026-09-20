import React, { useState } from 'react';
import { Brain, Plus, Edit2, Trash2, Save, X, Check, BookOpen } from 'lucide-react';

interface MemoryEntry {
  id: string;
  type: 'rule' | 'convention' | 'architecture' | 'decision' | 'preference';
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface EnhancedProjectMemoryProps {
  projectId: string;
  memory: MemoryEntry[];
  onAdd: (type: MemoryEntry['type'], content: string) => void;
  onUpdate: (id: string, type: MemoryEntry['type'], content: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const EnhancedProjectMemory: React.FC<EnhancedProjectMemoryProps> = ({
  projectId,
  memory,
  onAdd,
  onUpdate,
  onDelete,
  onClear,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newType, setNewType] = useState<MemoryEntry['type']>('rule');
  const [newContent, setNewContent] = useState('');
  const [filter, setFilter] = useState<'all' | MemoryEntry['type']>('all');

  const handleAdd = () => {
    if (newContent.trim()) {
      onAdd(newType, newContent.trim());
      setNewContent('');
      setNewType('rule');
      setShowAddForm(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (newContent.trim()) {
      onUpdate(id, newType, newContent.trim());
      setEditingId(null);
      setNewContent('');
      setNewType('rule');
    }
  };

  const startEdit = (entry: MemoryEntry) => {
    setEditingId(entry.id);
    setNewType(entry.type);
    setNewContent(entry.content);
  };

  const filteredMemory = filter === 'all' 
    ? memory 
    : memory.filter(m => m.type === filter);

  const getTypeIcon = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'rule': return 'RULE';
      case 'convention': return 'CONV';
      case 'architecture': return 'ARCH';
      case 'decision': return 'DEC';
      case 'preference': return 'PREF';
    }
  };

  const getTypeLabel = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'rule':
        return 'قاعدة';
      case 'convention':
        return 'اصطلاح';
      case 'architecture':
        return 'بنية';
      case 'decision':
        return 'قرار';
      case 'preference':
        return 'تفضيل';
    }
  };

  const getTypeColor = (type: MemoryEntry['type']) => {
    switch (type) {
      case 'rule':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'convention':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'architecture':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'decision':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'preference':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ذاكرة المشروع
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">إضافة</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">مسح الكل</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-sm ${
            filter === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          الكل ({memory.length})
        </button>
        {(['rule', 'convention', 'architecture', 'decision', 'preference'] as const).map((type) => {
          const count = memory.filter(m => m.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded text-sm ${
                filter === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {getTypeIcon(type)} {getTypeLabel(type)} ({count})
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {editingId ? 'تعديل الإدخال' : 'إضافة إدخال جديد'}
          </h3>
          
          {/* Type */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              النوع
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as MemoryEntry['type'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="rule">قاعدة</option>
              <option value="convention">اصطلاح</option>
              <option value="architecture">بنية</option>
              <option value="decision">قرار</option>
              <option value="preference">تفضيل</option>
            </select>
          </div>

          {/* Content */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              المحتوى
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="مثال: استخدم TypeScript strict mode"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
              disabled={!newContent.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              <span className="text-sm">{editingId ? 'تحديث' : 'إضافة'}</span>
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setNewContent('');
                setNewType('rule');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">إلغاء</span>
            </button>
          </div>
        </div>
      )}

      {/* Memory List */}
      {filteredMemory.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد إدخالات في الذاكرة</p>
          <p className="text-sm">أضف قواعد المشروع والاصطلاحات والقرارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemory.map((entry) => (
            <div
              key={entry.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(entry.type)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(entry.type)}`}>
                    {getTypeLabel(entry.type)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(entry)}
                    className="p-1 text-blue-500 hover:text-blue-600"
                    title="تعديل"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1 text-red-500 hover:text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {entry.content}
              </p>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
                {new Date(entry.updatedAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              حول ذاكرة المشروع
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              ذاكرة المشروع تخزن محلياً على جهازك. يتم تضمين الإدخالات ذات الصلة تلقائياً في سياق AI عند الحاجة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
