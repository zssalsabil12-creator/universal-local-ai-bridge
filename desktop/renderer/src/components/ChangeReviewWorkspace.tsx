import React, { useState } from 'react';
import { FileCode, Check, X, RotateCcw, AlertCircle } from 'lucide-react';

interface FileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  before?: string;
  after?: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
}

interface ChangeReviewWorkspaceProps {
  taskId: string;
  taskTitle: string;
  changes: FileChange[];
  onApprove: (path: string) => void;
  onReject: (path: string) => void;
  onApply: (paths: string[]) => void;
  onRollback: (taskId: string) => void;
}

export const ChangeReviewWorkspace: React.FC<ChangeReviewWorkspaceProps> = ({
  taskId,
  taskTitle,
  changes,
  onApprove,
  onReject,
  onApply,
  onRollback,
}) => {
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const toggleSelection = (path: string) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedChanges(newSelected);
  };

  const selectAll = () => {
    const pendingChanges = changes.filter(c => c.status === 'pending');
    setSelectedChanges(new Set(pendingChanges.map(c => c.path)));
  };

  const deselectAll = () => {
    setSelectedChanges(new Set());
  };

  const approvedCount = changes.filter(c => c.status === 'approved').length;
  const rejectedCount = changes.filter(c => c.status === 'rejected').length;
  const pendingCount = changes.filter(c => c.status === 'pending').length;

  const getActionBadge = (action: FileChange['action']) => {
    switch (action) {
      case 'create':
        return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">إنشاء</span>;
      case 'modify':
        return <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">تعديل</span>;
      case 'delete':
        return <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">حذف</span>;
    }
  };

  const getStatusBadge = (status: FileChange['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">معلق</span>;
      case 'approved':
        return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">موافق عليه</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">مرفوض</span>;
      case 'applied':
        return <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">مطبق</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileCode className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            مراجعة التغييرات
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          المهمة: {taskTitle}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {changes.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">إجمالي</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">معلق</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {approvedCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">موافق عليه</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {rejectedCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">مرفوض</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAll}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          تحديد الكل
        </button>
        <button
          onClick={deselectAll}
          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
        >
          إلغاء التحديد
        </button>
        <button
          onClick={() => onApply(Array.from(selectedChanges))}
          disabled={selectedChanges.size === 0}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          تطبيق المحدد ({selectedChanges.size})
        </button>
        <button
          onClick={() => onRollback(taskId)}
          className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm ml-auto"
        >
          <RotateCcw className="h-4 w-4 inline" /> تراجع
        </button>
      </div>

      {/* Changes List */}
      <div className="space-y-3">
        {changes.map((change) => (
          <div
            key={change.path}
            className={`border rounded-lg overflow-hidden ${
              change.status === 'approved'
                ? 'border-green-500 dark:border-green-500'
                : change.status === 'rejected'
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* File Header */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={selectedChanges.has(change.path)}
                  onChange={() => toggleSelection(change.path)}
                  disabled={change.status !== 'pending'}
                  className="w-4 h-4"
                />
                <FileCode className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-900 dark:text-white flex-1">
                  {change.path}
                </span>
                {getActionBadge(change.action)}
                {getStatusBadge(change.status)}
              </div>
              <div className="flex gap-1">
                {change.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onApprove(change.path)}
                      className="p-1 text-green-500 hover:text-green-600"
                      title="موافقة"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReject(change.path)}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="رفض"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpandedFile(expandedFile === change.path ? null : change.path)}
                  className="p-1 text-blue-500 hover:text-blue-600"
                  title="عرض التفاصيل"
                >
                  {expandedFile === change.path ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Diff View */}
            {expandedFile === change.path && (
              <div className="p-3 bg-white dark:bg-gray-800">
                {change.action === 'create' && change.after && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      المحتوى الجديد:
                    </h4>
                    <pre className="text-xs font-mono bg-green-50 dark:bg-green-900/20 p-3 rounded overflow-x-auto">
                      {change.after}
                    </pre>
                  </div>
                )}

                {change.action === 'modify' && change.before && change.after && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        قبل:
                      </h4>
                      <pre className="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto">
                        {change.before}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        بعد:
                      </h4>
                      <pre className="text-xs font-mono bg-green-50 dark:bg-green-900/20 p-3 rounded overflow-x-auto">
                        {change.after}
                      </pre>
                    </div>
                  </div>
                )}

                {change.action === 'delete' && change.before && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      المحتوى المحذوف:
                    </h4>
                    <pre className="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto">
                      {change.before}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {changes.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد تغييرات للمراجعة</p>
        </div>
      )}

      {/* Warning for Delete Actions */}
      {changes.some(c => c.action === 'delete') && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                تحذير: حذف الملفات
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                بعض التغييرات تتضمن حذف ملفات. تأكد من مراجعة هذه التغييرات بعناية قبل الموافقة عليها.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
