import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus, Copy, FileCode, ChevronDown, ChevronUp } from 'lucide-react';

interface DiffViewerProps {
  before: string;
  after: string;
  filename: string;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

interface DiffLine {
  type: 'add' | 'remove' | 'keep';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const diff: DiffLine[] = [];
  
  // Simple LCS-based diff
  const m = beforeLines.length;
  const n = afterLines.length;
  
  // Build LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (beforeLines[i - 1] === afterLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find diff
  let i = m, j = n;
  const result: DiffLine[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && beforeLines[i - 1] === afterLines[j - 1]) {
      result.unshift({
        type: 'keep',
        content: beforeLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: 'add',
        content: afterLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0) {
      result.unshift({
        type: 'remove',
        content: beforeLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }
  
  return result;
}

export default function DiffViewer({ before, after, filename, onAccept, onReject, showActions = true }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [showStats, setShowStats] = useState(true);
  
  const diff = computeDiff(before, after);
  
  const stats = {
    additions: diff.filter(l => l.type === 'add').length,
    deletions: diff.filter(l => l.type === 'remove').length,
    unchanged: diff.filter(l => l.type === 'keep').length,
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(after);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] rounded-lg border border-[#2a2a3a]">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#2a2a3a] bg-[#111118]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono text-[#e2e8f0]" dir="ltr">{filename}</span>
        </div>
        <div className="flex items-center gap-1">
          {showStats && (
            <div className="flex items-center gap-2 text-[10px] mr-2">
              <span className="text-green-400">+{stats.additions}</span>
              <span className="text-red-400">-{stats.deletions}</span>
            </div>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}
            className="px-2 py-1 rounded text-[10px] bg-[#252530] text-[#94a3b8] hover:bg-[#2a2a3a]"
          >
            {viewMode === 'unified' ? 'Split' : 'Unified'}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#252530] text-[#94a3b8]"
            title="نسخ الكود الجديد"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {viewMode === 'unified' ? (
          <div className="p-2">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`flex hover:bg-opacity-50 ${
                  line.type === 'add' ? 'bg-green-500/10' :
                  line.type === 'remove' ? 'bg-red-500/10' :
                  'bg-transparent'
                }`}
              >
                <span className="w-10 text-right pr-2 text-[#4a5568] select-none flex-shrink-0">
                  {line.oldLineNumber || ''}
                </span>
                <span className="w-10 text-right pr-2 text-[#4a5568] select-none flex-shrink-0">
                  {line.newLineNumber || ''}
                </span>
                <span className={`w-4 flex-shrink-0 select-none ${
                  line.type === 'add' ? 'text-green-400' :
                  line.type === 'remove' ? 'text-red-400' :
                  'text-[#4a5568]'
                }`}>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                </span>
                <span className={`flex-1 whitespace-pre ${
                  line.type === 'add' ? 'text-green-300' :
                  line.type === 'remove' ? 'text-red-300' :
                  'text-[#e2e8f0]'
                }`}>
                  {line.content || ' '}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex">
            {/* Before */}
            <div className="flex-1 border-r border-[#2a2a3a]">
              <div className="p-1 bg-red-500/5 text-[10px] text-red-400 text-center border-b border-[#2a2a3a]">
                Before
              </div>
              <div className="p-2">
                {before.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right pr-2 text-[#4a5568] select-none flex-shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre text-red-300/70">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* After */}
            <div className="flex-1">
              <div className="p-1 bg-green-500/5 text-[10px] text-green-400 text-center border-b border-[#2a2a3a]">
                After
              </div>
              <div className="p-2">
                {after.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right pr-2 text-[#4a5568] select-none flex-shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre text-green-300/70">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && onAccept && onReject && (
        <div className="flex items-center gap-2 p-2 border-t border-[#2a2a3a] bg-[#111118]">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-xs hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            رفض
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Check className="w-3.5 h-3.5" />
            قبول التعديل
          </button>
        </div>
      )}
    </div>
  );
}
