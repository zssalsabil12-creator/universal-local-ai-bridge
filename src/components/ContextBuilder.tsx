import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pin, FileCode, Folder, Search, Filter, Circle } from 'lucide-react';
import { ProjectIndex, FileNode } from '../utils/fileSystem';

interface ContextBuilderProps {
  projectIndex: ProjectIndex | null;
  selectedFiles: string[];
  pinnedFiles: string[];
  excludedPaths: string[];
  onToggleFile: (path: string) => void;
  onTogglePin: (path: string) => void;
  onToggleExclude: (path: string) => void;
}

export default function ContextBuilder({
  projectIndex,
  selectedFiles,
  pinnedFiles,
  excludedPaths,
  onToggleFile,
  onTogglePin,
  onToggleExclude,
}: ContextBuilderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'selected' | 'pinned' | 'excluded'>('all');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const matchesSearch = (node: FileNode): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (node.name.toLowerCase().includes(query)) return true;
    if (node.children) {
      return node.children.some(child => matchesSearch(child));
    }
    return false;
  };

  const getFileStatus = (path: string) => {
    if (pinnedFiles.includes(path)) return 'pinned';
    if (selectedFiles.includes(path)) return 'selected';
    if (excludedPaths.includes(path)) return 'excluded';
    return 'none';
  };

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    if (!matchesSearch(node)) return null;

    const status = getFileStatus(node.path);
    const isDir = node.type === 'directory';
    const isExpanded = expandedDirs.has(node.path);

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1.5 py-1 px-2 text-xs rounded transition-colors ${
            status === 'pinned' ? 'bg-yellow-500/10 text-yellow-300' :
            status === 'selected' ? 'bg-indigo-500/10 text-indigo-300' :
            status === 'excluded' ? 'bg-red-500/10 text-red-300 line-through' :
            'text-[#94a3b8] hover:bg-[#252530]'
          }`}
          style={{ paddingRight: `${depth * 12 + 8}px` }}
        >
          {isDir ? (
            <>
              <button
                onClick={() => toggleDir(node.path)}
                className="w-3 h-3 flex items-center justify-center"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
              <Folder className="w-3 h-3 text-yellow-400" />
              <span className="flex-1 truncate">{node.name}</span>
              <button
                onClick={() => onToggleExclude(node.path)}
                className="p-0.5 rounded hover:bg-[#2a2a3a]"
                title={excludedPaths.includes(node.path) ? 'إلغاء الاستبعاد' : 'استبعاد'}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </>
          ) : (
            <>
              <span className="w-3"></span>
              <FileCode className="w-3 h-3 text-[#64748b]" />
              <span className="flex-1 truncate">{node.name}</span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onTogglePin(node.path)}
                  className="p-0.5 rounded hover:bg-[#2a2a3a]"
                  title={pinnedFiles.includes(node.path) ? 'إلغاء التثبيت' : 'تثبيت'}
                >
                  {pinnedFiles.includes(node.path) ? (
                    <Pin className="w-2.5 h-2.5 text-yellow-400" />
                  ) : (
                    <Circle className="w-2.5 h-2.5" />
                  )}
                </button>
                <button
                  onClick={() => onToggleFile(node.path)}
                  className="p-0.5 rounded hover:bg-[#2a2a3a]"
                  title={selectedFiles.includes(node.path) ? 'إلغاء التحديد' : 'تحديد'}
                >
                  {selectedFiles.includes(node.path) ? (
                    <span className="text-[10px] text-indigo-400">✓</span>
                  ) : (
                    <span className="text-[10px] text-[#64748b]">○</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        {isDir && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredFiles = projectIndex?.flatFiles.filter(file => {
    if (filterType === 'selected') return selectedFiles.includes(file.path);
    if (filterType === 'pinned') return pinnedFiles.includes(file.path);
    if (filterType === 'excluded') return excludedPaths.includes(file.path);
    return true;
  }) || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold">بناء السياق</span>
        </div>
        
        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748b]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في الملفات..."
            className="w-full pr-7 pl-2 py-1.5 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-indigo-500/50 focus:outline-none"
            dir="auto"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {(['all', 'selected', 'pinned', 'excluded'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 px-2 py-1 rounded text-[9px] transition-colors ${
                filterType === type
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[#252530] text-[#94a3b8] hover:bg-[#2a2a3a]'
              }`}
            >
              {type === 'all' ? 'الكل' :
               type === 'selected' ? `محدد (${selectedFiles.length})` :
               type === 'pinned' ? `مثبت (${pinnedFiles.length})` :
               `مستبعد (${excludedPaths.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="p-2 border-b border-[#2a2a3a] grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-sm font-bold text-indigo-400">{selectedFiles.length}</p>
          <p className="text-[8px] text-[#64748b]">محدد</p>
        </div>
        <div>
          <p className="text-sm font-bold text-yellow-400">{pinnedFiles.length}</p>
          <p className="text-[8px] text-[#64748b]">مثبت</p>
        </div>
        <div>
          <p className="text-sm font-bold text-red-400">{excludedPaths.length}</p>
          <p className="text-[8px] text-[#64748b]">مستبعد</p>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {!projectIndex ? (
          <div className="text-center py-8">
            <Folder className="w-10 h-10 text-[#2a2a3a] mx-auto mb-3" />
            <p className="text-xs text-[#94a3b8]">افتح مشروعًا أولاً</p>
          </div>
        ) : filterType === 'all' ? (
          <div>
            {projectIndex.files.map(node => renderFileNode(node))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#64748b]">لا توجد ملفات</p>
            ) : (
              filteredFiles.map(file => {
                const status = getFileStatus(file.path);
                return (
                  <div
                    key={file.path}
                    className={`flex items-center gap-2 p-2 rounded text-xs ${
                      status === 'pinned' ? 'bg-yellow-500/10' :
                      status === 'selected' ? 'bg-indigo-500/10' :
                      'bg-red-500/10'
                    }`}
                  >
                    <FileCode className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1 truncate font-mono" dir="ltr">{file.path}</span>
                    <div className="flex items-center gap-0.5">
                      {status !== 'excluded' && (
                        <button
                          onClick={() => onTogglePin(file.path)}
                          className="p-0.5 rounded hover:bg-[#2a2a3a]"
                        >
                          {pinnedFiles.includes(file.path) ? (
                            <Pin className="w-3 h-3 text-yellow-400" />
                          ) : (
                            <Circle className="w-3 h-3 text-[#64748b]" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => onToggleFile(file.path)}
                        className="p-0.5 rounded hover:bg-[#2a2a3a]"
                      >
                        {selectedFiles.includes(file.path) ? (
                          <span className="text-indigo-400">✓</span>
                        ) : (
                          <span className="text-[#64748b]">○</span>
                        )}
                      </button>
                      <button
                        onClick={() => onToggleExclude(file.path)}
                        className="p-0.5 rounded hover:bg-[#2a2a3a]"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="p-2 border-t border-[#2a2a3a] text-[9px] text-[#64748b] space-y-0.5">
        <p>✓ تحديد: يُرسل عند الطلب</p>
        <p>📌 تثبيت: يُرسل دائماً</p>
        <p>✕ استبعاد: يُتجاهل دائماً</p>
      </div>
    </div>
  );
}
