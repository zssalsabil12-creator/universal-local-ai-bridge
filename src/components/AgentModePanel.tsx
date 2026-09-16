import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Play, Pause, CheckCircle, XCircle, AlertTriangle,
  FileCode, Terminal as TermIcon, GitBranch, ArrowRight,
  Shield, Eye, Zap, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { parseULPCommands, parseFileModifications, generateDiff } from '../utils/ulpProtocol';

interface AgentAction {
  id: string;
  type: 'ulp_command' | 'file_modification' | 'info';
  status: 'pending' | 'approved' | 'denied' | 'executed' | 'failed';
  description: string;
  details?: any;
  timestamp: string;
  result?: {
    message?: string;
    stdout?: string;
    stderr?: string;
    exitCode?: number | null;
    requestId?: string;
  };
  taskId?: string;
  durationMs?: number;
}

interface AgentModePanelProps {
  aiResponse: string;
  fileContents: Record<string, string>;
  permissionMode?: string;
  connected?: boolean;
  auditCount?: number;
  onExecuteCommand: (command: string, params: any) => Promise<any>;
  onApplyModification: (path: string, content: string) => Promise<boolean>;
  onTaskStart?: (action: { type: AgentAction['type']; description: string; metadata?: any }) => string;
  onTaskComplete?: (taskId: string, success: boolean, durationMs: number, metadata?: any) => void;
  onRefreshAudit?: () => Promise<void>;
}

export default function AgentModePanel({
  aiResponse,
  fileContents,
  permissionMode = 'readonly',
  connected = false,
  auditCount = 0,
  onExecuteCommand,
  onApplyModification,
  onTaskStart,
  onTaskComplete,
  onRefreshAudit,
}: AgentModePanelProps) {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [auditRefreshing, setAuditRefreshing] = useState(false);

  const thisIsReadOnlyCommand = (command?: string): boolean => {
    if (!command) return false;
    return [
      'files.list', 'files.read', 'project.tree', 'project.context',
      'project.stats', 'git.status', 'git.diff', 'git.log',
    ].includes(command);
  };

  const parseResponse = async () => {
    const newActions: AgentAction[] = [];
    const ulpCommands = parseULPCommands(aiResponse);
    ulpCommands.forEach((cmd, i) => {
      newActions.push({
        id: `ulp-${i}-${Date.now()}`,
        type: 'ulp_command',
        status: 'pending',
        description: `Execute: ${cmd.command}`,
        details: cmd,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
      });
    });

    const modifications = parseFileModifications(aiResponse);
    modifications.forEach((mod, i) => {
      const existingContent = fileContents[mod.path] || '';
      const diff = existingContent ? generateDiff(existingContent, mod.content || '') : null;
      newActions.push({
        id: `mod-${i}-${Date.now()}`,
        type: 'file_modification',
        status: 'pending',
        description: `${mod.type === 'create' ? 'Create' : 'Modify'}: ${mod.path}`,
        details: { ...mod, diff },
        timestamp: new Date().toLocaleTimeString('ar-EG'),
      });
    });

    setActions(prev => [...prev, ...newActions]);

    if (autoApprove && connected && permissionMode !== 'readonly') {
      const safeActions = newActions.filter(action =>
        action.type === 'ulp_command' && thisIsReadOnlyCommand(action.details?.command)
      );
      for (const action of safeActions) await handleApprove(action);
    }
    return newActions;
  };

  const toTaskType = (action: AgentAction): 'context_extract' | 'file_read' | 'file_write' | 'terminal' | 'git' | 'ai_query' => {
    if (action.type === 'file_modification') return 'file_write';
    const command = action.details?.command || '';
    if (command.startsWith('files.read') || command.startsWith('files.list')) return 'file_read';
    if (command.startsWith('terminal.')) return 'terminal';
    if (command.startsWith('git.')) return 'git';
    if (command.startsWith('project.context') || command.startsWith('project.tree')) return 'context_extract';
    return 'ai_query';
  };

  const handleApprove = async (action: AgentAction) => {
    if (!connected) {
      setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'failed', result: { message: 'AGENT_OFFLINE' } } : a));
      return;
    }
    const isMutation = action.type === 'file_modification' || action.details?.command?.startsWith('terminal.');
    if (permissionMode === 'readonly' && isMutation) {
      setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'denied', result: { message: 'READONLY_MODE' } } : a));
      return;
    }

    const startedAt = performance.now();
    const taskId = onTaskStart?.({
      type: action.type,
      description: action.description,
      metadata: { command: action.details?.command, taskType: toTaskType(action) },
    });
    setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'approved', taskId } : a));

    try {
      let success = false;
      let resultData: AgentAction['result'];
      if (action.type === 'ulp_command') {
        const result = await onExecuteCommand(action.details.command, action.details.data);
        success = result?.success === true;
        resultData = result?.data
          ? {
              message: result.data.message,
              stdout: result.data.stdout,
              stderr: result.data.stderr,
              exitCode: result.data.exitCode,
              requestId: result.data.requestId,
            }
          : { message: result?.error?.message };
      } else if (action.type === 'file_modification') {
        success = await onApplyModification(action.details.path, action.details.content);
        resultData = { message: success ? `Applied: ${action.details.path}` : `Failed: ${action.details.path}` };
      }

      const durationMs = Math.round(performance.now() - startedAt);
      setActions(prev => prev.map(a => a.id === action.id ? {
        ...a,
        status: success ? 'executed' : 'failed',
        result: resultData,
        durationMs,
      } : a));
      if (taskId) onTaskComplete?.(taskId, success, durationMs, { requestId: resultData?.requestId, result: success ? 'SUCCESS' : 'FAILED' });
      if (success && onRefreshAudit) await onRefreshAudit();
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'failed', result: { message }, durationMs } : a));
      if (taskId) onTaskComplete?.(taskId, false, durationMs, { result: 'FAILED', error: message });
      if (onRefreshAudit) await onRefreshAudit();
    }
  };

  const handleDeny = (action: AgentAction) => {
    setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'denied', result: { message: 'USER_DENIED' } } : a));
  };

  const handleApproveAll = async () => {
    setIsRunning(true);
    try {
      const pending = actions.filter(a => a.status === 'pending');
      for (const action of pending) {
        await handleApprove(action);
        await new Promise(r => setTimeout(r, 250));
      }
    } finally {
      setIsRunning(false);
    }
  };

  const refreshAudit = async () => {
    if (!onRefreshAudit || auditRefreshing) return;
    setAuditRefreshing(true);
    try { await onRefreshAudit(); } finally { setAuditRefreshing(false); }
  };

  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const executedCount = actions.filter(a => a.status === 'executed').length;
  const failedCount = actions.filter(a => a.status === 'failed').length;
  const deniedCount = actions.filter(a => a.status === 'denied').length;
  const writeCount = actions.filter(a => a.type === 'file_modification').length;

  const getRisk = (action: AgentAction) => {
    if (action.type === 'file_modification') return { label: 'تعديل', className: 'text-amber-300 bg-amber-500/10 border-amber-500/20' };
    if (action.details?.command?.startsWith('terminal.')) return { label: 'تنفيذ', className: 'text-red-300 bg-red-500/10 border-red-500/20' };
    if (action.details?.command?.startsWith('git.')) return { label: 'Git', className: 'text-purple-300 bg-purple-500/10 border-purple-500/20' };
    return { label: 'قراءة', className: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' };
  };

  const getActionIcon = (action: AgentAction) => {
    if (action.type === 'ulp_command') {
      if (action.details?.command?.startsWith('files.')) return <FileCode className="w-4 h-4" />;
      if (action.details?.command?.startsWith('git.')) return <GitBranch className="w-4 h-4" />;
      if (action.details?.command?.startsWith('terminal.')) return <TermIcon className="w-4 h-4" />;
      return <Zap className="w-4 h-4" />;
    }
    return <FileCode className="w-4 h-4" />;
  };

  const getStatusColor = (status: AgentAction['status']) => ({
    pending: 'text-yellow-400', approved: 'text-blue-400', executed: 'text-green-400', denied: 'text-red-400', failed: 'text-red-400',
  }[status]);

  const getStatusIcon = (status: AgentAction['status']) => {
    if (status === 'pending') return <Clock className="w-3 h-3" />;
    if (status === 'approved') return <ArrowRight className="w-3 h-3" />;
    if (status === 'executed') return <CheckCircle className="w-3 h-3" />;
    if (status === 'denied') return <XCircle className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-[#2a2a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"><Cpu className="w-4 h-4 text-purple-400" /></div>
          <div><h3 className="text-sm font-bold">Agent Command Center</h3><p className="text-[10px] text-[#94a3b8]">Plan → Risk → Approve → Execute → Audit</p></div>
        </div>
        <span className="text-[9px] text-[#94a3b8]">{pendingCount} pending</span>
      </div>

      <div className="px-3 py-2 border-b border-[#2a2a3a] bg-[#0a0a0f]/70 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-[10px] text-[#cbd5e1]">{connected ? 'Local Agent متصل' : 'Local Agent غير متصل'}</span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded border border-[#2a2a3a] text-[#94a3b8]">{permissionMode === 'readonly' ? 'قراءة فقط' : permissionMode === 'assisted' ? 'مساعد' : 'وكيل'}</span>
      </div>

      <div className="px-3 py-2 border-b border-[#2a2a3a] grid grid-cols-5 gap-1.5 bg-[#08080d]/60">
        <div className="rounded-md border border-[#2a2a3a] bg-[#101018] px-2 py-1.5"><p className="text-[9px] text-[#64748b]">معلّقة</p><p className="text-xs font-semibold text-yellow-300">{pendingCount}</p></div>
        <div className="rounded-md border border-[#2a2a3a] bg-[#101018] px-2 py-1.5"><p className="text-[9px] text-[#64748b]">تعديلات</p><p className="text-xs font-semibold text-indigo-300">{writeCount}</p></div>
        <div className="rounded-md border border-[#2a2a3a] bg-[#101018] px-2 py-1.5"><p className="text-[9px] text-[#64748b]">ناجحة</p><p className="text-xs font-semibold text-green-300">{executedCount}</p></div>
        <div className="rounded-md border border-[#2a2a3a] bg-[#101018] px-2 py-1.5"><p className="text-[9px] text-[#64748b]">فشل/رفض</p><p className="text-xs font-semibold text-red-300">{failedCount + deniedCount}</p></div>
        <button onClick={refreshAudit} disabled={!connected || auditRefreshing} className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1.5 text-left disabled:opacity-50"><p className="text-[9px] text-[#64748b]">Audit</p><p className="text-xs font-semibold text-cyan-300">{auditRefreshing ? '…' : auditCount}</p></button>
      </div>

      <div className="p-2 border-b border-[#2a2a3a] flex items-center gap-2">
        <button onClick={parseResponse} disabled={!aiResponse || isRunning} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium disabled:opacity-50"><Eye className="w-3 h-3" /> تحليل خطة AI</button>
        {pendingCount > 0 && permissionMode !== 'readonly' && connected && <button onClick={handleApproveAll} disabled={isRunning} className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium disabled:opacity-50">{isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} موافقة على الكل</button>}
      </div>

      <div className="px-3 py-2 border-b border-[#2a2a3a] flex items-center justify-between"><span className="text-[10px] text-[#94a3b8] flex items-center gap-1"><Shield className="w-3 h-3" /> موافقة تلقائية للعمليات الآمنة</span><button onClick={() => setAutoApprove(!autoApprove)} disabled={!connected || permissionMode === 'readonly'} aria-label="تفعيل الموافقة التلقائية للعمليات الآمنة" className={`w-8 h-4 rounded-full ${autoApprove ? 'bg-purple-500' : 'bg-[#2a2a3a]'} disabled:opacity-40`}><div className={`w-3 h-3 rounded-full bg-white ${autoApprove ? 'translate-x-4' : 'translate-x-0.5'}`} /></button></div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {actions.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-center p-6"><Cpu className="w-12 h-12 text-[#2a2a3a] mb-3" /><p className="text-xs text-[#94a3b8] mb-2">لا توجد إجراءات</p><p className="text-[10px] text-[#64748b]">حلّل رد AI لإنشاء خطة قابلة للمراجعة والتنفيذ.</p></div> : <AnimatePresence>{actions.map(action => (
          <motion.div key={action.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
            <div className="flex items-start gap-2"><div className={`mt-0.5 ${getStatusColor(action.status)}`}>{getActionIcon(action)}</div><div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1"><span className="text-xs font-medium text-[#e2e8f0] truncate">{action.description}</span><span className={`px-1.5 py-0.5 rounded border text-[8px] ${getRisk(action).className}`}>{getRisk(action).label}</span><span className={`flex items-center gap-0.5 text-[9px] ${getStatusColor(action.status)}`}>{getStatusIcon(action.status)}</span></div>
              <p className="text-[9px] text-[#64748b]">{action.timestamp}{action.durationMs ? ` • ${action.durationMs}ms` : ''}{action.taskId ? ` • task ${action.taskId.slice(-8)}` : ''}</p>
              {action.details && <div className="mt-1"><button onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)} className="text-[9px] text-indigo-400 flex items-center gap-0.5">{expandedAction === action.id ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />} التفاصيل</button>{expandedAction === action.id && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 p-1.5 rounded bg-[#111118] text-[9px] font-mono text-[#94a3b8] overflow-x-auto" dir="ltr"><pre>{JSON.stringify(action.details, null, 2)}</pre></motion.div>}</div>}
              {action.result && <div className={`mt-2 p-2 rounded border text-[9px] ${action.status === 'executed' ? 'bg-green-500/5 border-green-500/15' : 'bg-red-500/5 border-red-500/15'}`}><div className="flex items-center gap-1.5 mb-1">{action.status === 'executed' ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-red-400" />}<span className={action.status === 'executed' ? 'text-green-300' : 'text-red-300'}>{action.status === 'executed' ? 'نتيجة التنفيذ' : 'تفاصيل الحالة'}</span>{action.result.exitCode !== undefined && action.result.exitCode !== null && <span className="ml-auto text-[#64748b]">exit {action.result.exitCode}</span>}</div>{action.result.message && <p className="text-[#cbd5e1] mb-1">{action.result.message}</p>}{action.result.stdout && <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-green-200/80" dir="ltr">{action.result.stdout}</pre>}{action.result.stderr && <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-red-200/80" dir="ltr">{action.result.stderr}</pre>}{action.result.requestId && <p className="mt-1 text-[#64748b] font-mono" dir="ltr">request: {action.result.requestId}</p>}</div>}
              {action.type === 'file_modification' && action.details?.diff && <div className="mt-1 p-1.5 rounded bg-[#111118] text-[9px] font-mono max-h-24 overflow-y-auto">{action.details.diff.slice(0, 10).map((change: any, i: number) => <div key={i} className={change.type === 'add' ? 'text-green-400' : change.type === 'remove' ? 'text-red-400' : 'text-[#64748b]'}>{change.type === 'add' ? '+ ' : change.type === 'remove' ? '- ' : '  '}{change.line}</div>)}{action.details.diff.length > 10 && <p className="text-[#64748b]">... +{action.details.diff.length - 10} more</p>}</div>}
            </div></div>
            {action.status === 'pending' && <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#2a2a3a]"><button onClick={() => handleApprove(action)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-300 text-[10px] hover:bg-green-500/30"><CheckCircle className="w-3 h-3" /> موافقة</button><button onClick={() => handleDeny(action)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-300 text-[10px] hover:bg-red-500/30"><XCircle className="w-3 h-3" /> رفض</button></div>}
          </motion.div>))}</AnimatePresence>}
      </div>

      <div className="p-2 border-t border-[#2a2a3a] flex items-center justify-between text-[9px] text-[#64748b]"><span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> عمليات الجهاز محلية</span><span>{actions.length} إجراءات • {auditCount} audit entries</span></div>
    </div>
  );
}
