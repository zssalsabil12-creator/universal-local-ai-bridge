import React, { useState, useMemo } from 'react';
import { GitBranch, ArrowRight, ArrowLeft } from 'lucide-react';

interface ImportRelation {
  from: string;
  to: string;
  type: 'import' | 'require' | 'dynamic';
}

interface ImportGraphProps {
  relations: ImportRelation[];
  selectedFile?: string;
  onFileSelect?: (path: string) => void;
}

export const ImportGraph: React.FC<ImportGraphProps> = ({
  relations,
  selectedFile,
  onFileSelect,
}) => {
  const [viewMode, setViewMode] = useState<'forward' | 'backward' | 'all'>('all');
  const [maxDepth, setMaxDepth] = useState(3);

  // Build adjacency lists
  const forwardGraph = useMemo(() => {
    const graph = new Map<string, Set<string>>();
    relations.forEach(rel => {
      if (!graph.has(rel.from)) {
        graph.set(rel.from, new Set());
      }
      graph.get(rel.from)!.add(rel.to);
    });
    return graph;
  }, [relations]);

  const backwardGraph = useMemo(() => {
    const graph = new Map<string, Set<string>>();
    relations.forEach(rel => {
      if (!graph.has(rel.to)) {
        graph.set(rel.to, new Set());
      }
      graph.get(rel.to)!.add(rel.from);
    });
    return graph;
  }, [relations]);

  // Get all files involved in relations
  const allFiles = useMemo(() => {
    const files = new Set<string>();
    relations.forEach(rel => {
      files.add(rel.from);
      files.add(rel.to);
    });
    return Array.from(files).sort();
  }, [relations]);

  // Get dependencies for a file (forward)
  const getDependencies = (file: string, depth: number = maxDepth): string[] => {
    const visited = new Set<string>();
    const queue: Array<{ file: string; depth: number }> = [{ file, depth: 0 }];
    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth > depth || visited.has(current.file)) continue;
      
      visited.add(current.file);
      if (current.file !== file) {
        result.push(current.file);
      }

      const deps = forwardGraph.get(current.file);
      if (deps && current.depth < depth) {
        deps.forEach(dep => {
          if (!visited.has(dep)) {
            queue.push({ file: dep, depth: current.depth + 1 });
          }
        });
      }
    }

    return result;
  };

  // Get dependents for a file (backward)
  const getDependents = (file: string, depth: number = maxDepth): string[] => {
    const visited = new Set<string>();
    const queue: Array<{ file: string; depth: number }> = [{ file, depth: 0 }];
    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth > depth || visited.has(current.file)) continue;
      
      visited.add(current.file);
      if (current.file !== file) {
        result.push(current.file);
      }

      const deps = backwardGraph.get(current.file);
      if (deps && current.depth < depth) {
        deps.forEach(dep => {
          if (!visited.has(dep)) {
            queue.push({ file: dep, depth: current.depth + 1 });
          }
        });
      }
    }

    return result;
  };

  const dependencies = selectedFile ? getDependencies(selectedFile) : [];
  const dependents = selectedFile ? getDependents(selectedFile) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            رسم بياني للاستيراد
          </h2>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setViewMode('forward')}
          className={`px-3 py-1 rounded text-sm ${
            viewMode === 'forward'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          التبعيات
        </button>
        <button
          onClick={() => setViewMode('backward')}
          className={`px-3 py-1 rounded text-sm ${
            viewMode === 'backward'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          المعتمدون
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`px-3 py-1 rounded text-sm ${
            viewMode === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          الكل
        </button>
      </div>

      {/* Depth Control */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
          العمق الأقصى: {maxDepth}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={maxDepth}
          onChange={(e) => setMaxDepth(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الملف المحدد</p>
          <p className="text-sm font-mono text-purple-700 dark:text-purple-300">
            {selectedFile}
          </p>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="space-y-4">
        {/* Forward Dependencies */}
        {(viewMode === 'forward' || viewMode === 'all') && dependencies.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              التبعيات ({dependencies.length})
            </h3>
            <div className="space-y-1">
              {dependencies.map((dep) => (
                <div
                  key={dep}
                  onClick={() => onFileSelect?.(dep)}
                  className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <ArrowRight className="h-3 w-3 text-blue-500" />
                  <span className="text-sm font-mono text-blue-700 dark:text-blue-300">
                    {dep}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backward Dependents */}
        {(viewMode === 'backward' || viewMode === 'all') && dependents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-green-500" />
              المعتمدون ({dependents.length})
            </h3>
            <div className="space-y-1">
              {dependents.map((dep) => (
                <div
                  key={dep}
                  onClick={() => onFileSelect?.(dep)}
                  className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3 text-green-500" />
                  <span className="text-sm font-mono text-green-700 dark:text-green-300">
                    {dep}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Files */}
        {viewMode === 'all' && !selectedFile && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              جميع الملفات ({allFiles.length})
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {allFiles.map((file) => (
                <div
                  key={file}
                  onClick={() => onFileSelect?.(file)}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <GitBranch className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {file}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedFile && dependencies.length === 0 && dependents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <GitBranch className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد علاقات استيراد لهذا الملف</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {relations.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">علاقات</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {allFiles.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">ملفات</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {selectedFile ? dependencies.length + dependents.length : 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">مرتبط</p>
          </div>
        </div>
      </div>
    </div>
  );
};
