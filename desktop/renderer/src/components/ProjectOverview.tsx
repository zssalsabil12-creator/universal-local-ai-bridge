import React from 'react';
import { Folder, FileCode, GitBranch, AlertCircle, CheckCircle } from 'lucide-react';

interface ProjectOverviewProps {
  projectName: string;
  projectPath: string;
  totalFiles: number;
  indexedFiles: number;
  ignoredFiles: number;
  sensitiveFiles: number;
  languages: string[];
  testFiles: number;
  configFiles: string[];
  sourceDirs: string[];
  indexingStatus: 'idle' | 'indexing' | 'complete' | 'error';
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projectName,
  projectPath,
  totalFiles,
  indexedFiles,
  ignoredFiles,
  sensitiveFiles,
  languages,
  testFiles,
  configFiles,
  sourceDirs,
  indexingStatus,
}) => {
  const getStatusIcon = () => {
    switch (indexingStatus) {
      case 'indexing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };

  const getStatusText = () => {
    switch (indexingStatus) {
      case 'indexing':
        return 'جاري الفهرسة...';
      case 'complete':
        return 'مكتمل';
      case 'error':
        return 'خطأ';
      default:
        return 'غير مفهرس';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Folder className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {projectName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Project Path */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">المسار</p>
        <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
          {projectPath}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FileCode className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">الملفات</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {indexedFiles.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            من {totalFiles.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">متجاهل</span>
          </div>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {ignoredFiles.toLocaleString()}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">حساس</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {sensitiveFiles}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">اختبارات</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {testFiles}
          </p>
        </div>
      </div>

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            اللغات
          </h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Files */}
      {configFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ملفات التكوين
          </h3>
          <div className="flex flex-wrap gap-2">
            {configFiles.map((file) => (
              <span
                key={file}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium"
              >
                {file}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source Directories */}
      {sourceDirs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            مجلدات المصدر
          </h3>
          <div className="flex flex-wrap gap-2">
            {sourceDirs.map((dir) => (
              <span
                key={dir}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
              >
                {dir}/
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
