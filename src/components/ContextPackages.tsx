import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';

interface ContextPackage {
  id: string;
  name: string;
  description: string;
  files: string[];
  createdAt: number;
  updatedAt: number;
}

interface ContextPackagesProps {
  packages: ContextPackage[];
  onSave: (name: string, description: string, files: string[]) => void;
  onUpdate: (id: string, name: string, description: string, files: string[]) => void;
  onDelete: (id: string) => void;
  onLoad: (files: string[]) => void;
}

export const ContextPackages: React.FC<ContextPackagesProps> = ({
  packages,
  onSave,
  onUpdate,
  onDelete,
  onLoad,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFiles, setNewFiles] = useState<string[]>([]);
  const [fileInput, setFileInput] = useState('');

  const handleCreate = () => {
    if (newName.trim() && newFiles.length > 0) {
      onSave(newName.trim(), newDescription.trim(), newFiles);
      setNewName('');
      setNewDescription('');
      setNewFiles([]);
      setShowCreateForm(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (newName.trim() && newFiles.length > 0) {
      onUpdate(id, newName.trim(), newDescription.trim(), newFiles);
      setEditingId(null);
      setNewName('');
      setNewDescription('');
      setNewFiles([]);
    }
  };

  const startEdit = (pkg: ContextPackage) => {
    setEditingId(pkg.id);
    setNewName(pkg.name);
    setNewDescription(pkg.description);
    setNewFiles([...pkg.files]);
  };

  const addFile = () => {
    if (fileInput.trim() && !newFiles.includes(fileInput.trim())) {
      setNewFiles([...newFiles, fileInput.trim()]);
      setFileInput('');
    }
  };

  const removeFile = (file: string) => {
    setNewFiles(newFiles.filter(f => f !== file));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            حزم السياق
          </h2>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingId(null);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">جديد</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingId) && (
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {editingId ? 'تعديل الحزمة' : 'إنشاء حزمة جديدة'}
          </h3>
          
          {/* Name */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              الاسم
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: تصحيح المصادقة"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              الوصف
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="وصف اختياري للحزمة"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Files */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              الملفات
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={fileInput}
                onChange={(e) => setFileInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFile()}
                placeholder="src/auth/login.ts"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
              />
              <button
                onClick={addFile}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                إضافة
              </button>
            </div>
            
            {/* File List */}
            {newFiles.length > 0 && (
              <div className="space-y-1">
                {newFiles.map((file) => (
                  <div
                    key={file}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded"
                  >
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      {file}
                    </span>
                    <button
                      onClick={() => removeFile(file)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
              disabled={!newName.trim() || newFiles.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              <span className="text-sm">{editingId ? 'تحديث' : 'إنشاء'}</span>
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingId(null);
                setNewName('');
                setNewDescription('');
                setNewFiles([]);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">إلغاء</span>
            </button>
          </div>
        </div>
      )}

      {/* Packages List */}
      {packages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد حزم سياق محفوظة</p>
          <p className="text-sm">أنشئ حزمة جديدة لحفظ مجموعات الملفات المستخدمة بشكل متكرر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
            >
              {/* Package Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {pkg.name}
                  </h3>
                  {pkg.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {pkg.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onLoad(pkg.files)}
                    className="p-1 text-indigo-500 hover:text-indigo-600"
                    title="تحميل"
                  >
                    <Package className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => startEdit(pkg)}
                    className="p-1 text-blue-500 hover:text-blue-600"
                    title="تعديل"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(pkg.id)}
                    className="p-1 text-red-500 hover:text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Files */}
              <div className="space-y-1">
                {pkg.files.slice(0, 3).map((file) => (
                  <div
                    key={file}
                    className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    {file}
                  </div>
                ))}
                {pkg.files.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    +{pkg.files.length - 3} ملفات أخرى
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>{pkg.files.length} ملفات</span>
                <span>
                  {new Date(pkg.updatedAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
