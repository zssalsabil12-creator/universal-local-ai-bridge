import { useMemo } from 'react';
import { Folder, FileCode, Network } from 'lucide-react';
import { ProjectIndex } from '../utils/fileSystem';

interface ProjectMapProps {
  index: ProjectIndex | null;
  onFileClick?: (path: string) => void;
}

export default function ProjectMap({ index, onFileClick }: ProjectMapProps) {
  const treeData = useMemo(() => {
    if (!index) return null;
    
    // Build a simplified tree for visualization
    const buildTree = (nodes: any[], depth: number = 0): any[] => {
      if (depth > 3) return [];
      return nodes.slice(0, 20).map(node => ({
        name: node.name,
        path: node.path,
        type: node.type,
        size: node.size || 0,
        childCount: node.children?.length || 0,
        children: node.children ? buildTree(node.children, depth + 1) : [],
      }));
    };
    
    return buildTree(index.files);
  }, [index]);

  if (!index || !treeData) {
    return (
      <div className="flex items-center justify-center h-full text-center p-6">
        <div>
          <p className="text-sm text-[#94a3b8]">افتح مشروعًا لعرض الخريطة</p>
        </div>
      </div>
    );
  }

  // Extension stats
  const extStats = Object.entries(index.extensions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxExtCount = extStats[0]?.[1] || 1;

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Network className="w-4 h-4 text-[#7e8da6]" />
        خريطة المشروع
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 rounded bg-[#0a0a0f] text-center">
          <p className="text-base font-bold text-indigo-400">{index.totalFiles}</p>
          <p className="text-[10px] text-[#94a3b8]">ملف</p>
        </div>
        <div className="p-2 rounded bg-[#0a0a0f] text-center">
          <p className="text-base font-bold text-cyan-400">{index.totalDirs}</p>
          <p className="text-[10px] text-[#94a3b8]">مجلد</p>
        </div>
      </div>

      {/* Extension Distribution */}
      <div className="mb-4">
        <p className="text-xs text-[#94a3b8] mb-2">توزيع أنواع الملفات:</p>
        <div className="space-y-1.5">
          {extStats.map(([ext, count]) => (
            <div key={ext} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-indigo-300 w-10">.{ext}</span>
              <div className="flex-1 h-2 rounded bg-[#252530] overflow-hidden">
                <div
                  className="h-full rounded bg-gradient-to-r from-indigo-500 to-cyan-500"
                  style={{ width: `${(count / maxExtCount) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-[#94a3b8] w-6 text-left">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Tree */}
      <div className="mb-4">
        <p className="text-xs text-[#94a3b8] mb-2">البنية:</p>
        <div className="p-3 rounded bg-[#0a0a0f] border border-[#2a2a3a]">
          <TreeNode nodes={treeData} depth={0} onFileClick={onFileClick} />
        </div>
      </div>

      {/* Top directories by file count */}
      <div>
        <p className="text-xs text-[#94a3b8] mb-2">أكبر المجلدات:</p>
        <div className="space-y-1">
          {getTopDirs(index.files).slice(0, 5).map(dir => (
            <div key={dir.path} className="flex items-center justify-between p-1.5 rounded bg-[#0a0a0f] text-[10px]">
              <span className="text-[#e2e8f0] truncate font-mono" dir="ltr">{dir.path}</span>
              <span className="text-[#94a3b8]">{dir.count} ملف</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeNode({ nodes, depth, onFileClick }: { nodes: any[]; depth: number; onFileClick?: (path: string) => void }) {
  if (depth > 3) return null;
  
  return (
    <div className="space-y-0.5">
      {nodes.map((node, i) => (
        <div key={i}>
          <div 
            className={`flex items-center gap-1 py-0.5 text-[10px] cursor-pointer hover:text-indigo-300 transition-colors ${
              node.type === 'directory' ? 'text-yellow-300' : 'text-[#94a3b8]'
            }`}
            style={{ paddingRight: `${depth * 10}px` }}
            onClick={() => node.type === 'file' && onFileClick?.(node.path)}
          >
            {node.type === 'directory' ? <Folder className="w-3 h-3 text-[#7d8b9e]" /> : <FileCode className="w-3 h-3 text-[#687689]" />}
            <span className="truncate">{node.name}</span>
            {node.type === 'directory' && node.childCount > 0 && (
              <span className="text-[#64748b] text-[8px]">({node.childCount})</span>
            )}
          </div>
          {node.type === 'directory' && node.children && node.children.length > 0 && (
            <TreeNode nodes={node.children} depth={depth + 1} onFileClick={onFileClick} />
          )}
        </div>
      ))}
    </div>
  );
}

function getTopDirs(nodes: any[], parentPath: string = ''): { path: string; count: number }[] {
  const dirs: { path: string; count: number }[] = [];
  
  for (const node of nodes) {
    if (node.type === 'directory' && node.children) {
      const fileCount = countFiles(node.children);
      dirs.push({ path: node.path, count: fileCount });
      dirs.push(...getTopDirs(node.children, node.path));
    }
  }
  
  return dirs.sort((a, b) => b.count - a.count);
}

function countFiles(nodes: any[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'file') count++;
    if (node.children) count += countFiles(node.children);
  }
  return count;
}
