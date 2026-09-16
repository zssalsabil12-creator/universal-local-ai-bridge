import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, AlertCircle, Play, Pause,
  FileCode, Terminal as TermIcon, GitBranch, Search, Filter,
  Trash2, Download
} from 'lucide-react';

export interface Task {
  id: string;
  type: 'context_extract' | 'file_read' | 'file_write' | 'terminal' | 'git' | 'ai_query';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  title: string;
  description: string;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  metadata?: any;
}

interface TaskHistoryProps {
  tasks: Task[];
  onClear: () => void;
  onExport: () => void;
}

export default function TaskHistory({ tasks, onClear, onExport }: TaskHistoryProps) {
  const [filter, setFilter] = useState<'all' | Task['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const typeIcons: Record<Task['type'], any> = {
    context_extract: Search,
    file_read: FileCode,
    file_write: FileCode,
    terminal: TermIcon,
    git: GitBranch,
    ai_query: Play,
  };

  const statusIcons: Record<Task['status'], any> = {
    pending: Clock,
    running: Play,
    completed: CheckCircle,
    failed: XCircle,
    cancelled: AlertCircle,
  };

  const statusColors: Record<Task['status'], string> = {
    pending: 'text-[#64748b]',
    running: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    cancelled: 'text-yellow-400',
  };

  const filteredTasks = tasks
    .filter(task => filter === 'all' || task.status === filter)
    .filter(task =>
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    running: tasks.filter(t => t.status === 'running').length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold">سجل المهام</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onExport}
            className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
            title="تصدير"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-[#64748b] hover:text-red-400"
            title="مسح الكل"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-[#2a2a3a] grid grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold text-[#e2e8f0]">{stats.total}</p>
          <p className="text-[9px] text-[#64748b]">الكل</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-400">{stats.completed}</p>
          <p className="text-[9px] text-[#64748b]">مكتمل</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-400">{stats.failed}</p>
          <p className="text-[9px] text-[#64748b]">فشل</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-400">{stats.running}</p>
          <p className="text-[9px] text-[#64748b]">قيد التنفيذ</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-[#2a2a3a] space-y-2">
        <div className="relative">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748b]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-8 pl-2 py-1.5 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-indigo-500/50 focus:outline-none"
            dir="auto"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'completed', 'failed', 'running', 'pending'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 px-2 py-1 rounded text-[9px] transition-colors ${
                filter === status
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[#252530] text-[#94a3b8] hover:bg-[#2a2a3a]'
              }`}
            >
              {status === 'all' ? 'الكل' :
               status === 'completed' ? 'مكتمل' :
               status === 'failed' ? 'فشل' :
               status === 'running' ? 'قيد التنفيذ' : 'معلق'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-[#2a2a3a] mx-auto mb-3" />
            <p className="text-xs text-[#94a3b8]">لا توجد مهام</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const TypeIcon = typeIcons[task.type];
            const StatusIcon = statusIcons[task.status];
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${statusColors[task.status]}`}>
                    <TypeIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium text-[#e2e8f0] truncate">
                        {task.title}
                      </span>
                      <StatusIcon className={`w-3 h-3 flex-shrink-0 ${statusColors[task.status]}`} />
                    </div>
                    <p className="text-[10px] text-[#94a3b8] line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-[#64748b]">
                      <span>{new Date(task.startedAt).toLocaleTimeString('ar-EG')}</span>
                      {task.duration && <span>• {formatDuration(task.duration)}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
