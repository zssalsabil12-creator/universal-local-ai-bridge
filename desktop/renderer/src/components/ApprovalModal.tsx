import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, FileCode, Terminal as TermIcon, GitBranch, Eye, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type ApprovalAction = {
  id: string;
  type: 'file_read' | 'file_write' | 'file_delete' | 'terminal_run' | 'git_operation' | 'browser_action';
  resource: string;
  description: string;
  details?: any;
  diff?: { before: string; after: string; changes: { type: 'add' | 'remove' | 'keep'; line: string }[] };
  timestamp: number;
};

interface ApprovalModalProps {
  action: ApprovalAction;
  onApprove: () => void;
  onDeny: () => void;
}

export default function ApprovalModal({ action, onApprove, onDeny }: ApprovalModalProps) {
  const { language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
  const [showDiff, setShowDiff] = useState(false);

  const typeConfig: Record<ApprovalAction['type'], { icon: any; color: string; label: string }> = {
    file_read: { icon: Eye, color: 'text-blue-400', label: ui('قراءة ملف', 'Read file') },
    file_write: { icon: Edit, color: 'text-yellow-400', label: ui('تعديل ملف', 'Edit file') },
    file_delete: { icon: Trash2, color: 'text-red-400', label: ui('حذف ملف', 'Delete file') },
    terminal_run: { icon: TermIcon, color: 'text-green-400', label: ui('تشغيل أمر', 'Run command') },
    git_operation: { icon: GitBranch, color: 'text-purple-400', label: ui('عملية Git', 'Git operation') },
    browser_action: { icon: Shield, color: 'text-cyan-400', label: ui('إجراء متصفح', 'Browser action') },
  };
  const config = typeConfig[action.type];
  const Icon = config.icon;

  const risk = action.type === 'file_delete'
    ? { level: 'high', color: 'red', text: ui('عالي', 'High') }
    : action.type === 'terminal_run' || action.type === 'file_write'
      ? { level: 'medium', color: 'yellow', text: ui('متوسط', 'Medium') }
      : { level: 'low', color: 'green', text: ui('منخفض', 'Low') };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111118] border border-[#2a2a3a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#2a2a3a] flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${risk.color}-500/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {ui('موافقة مطلوبة', 'Approval required')}
              <span className={`px-2 py-0.5 rounded text-[10px] bg-${risk.color}-500/10 text-${risk.color}-400 border border-${risk.color}-500/20`}>
                {ui('خطر', 'Risk')} {risk.text}
              </span>
            </h3>
            <p className="text-xs text-[#94a3b8]">{config.label}</p>
          </div>
          <div className="text-[10px] text-[#64748b] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(action.timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-EG')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#94a3b8] mb-1 block">{ui('الوصف', 'Description')}</label>
            <p className="text-sm text-[#e2e8f0]">{action.description}</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#94a3b8] mb-1 block">{ui('المسار / المورد', 'Path / resource')}</label>
            <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] font-mono text-xs text-cyan-300" dir="ltr">{action.resource}</div>
          </div>

          {action.details && (
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] mb-1 block">{ui('التفاصيل', 'Details')}</label>
              <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#94a3b8] font-mono overflow-x-auto" dir="ltr"><pre>{JSON.stringify(action.details, null, 2)}</pre></div>
            </div>
          )}

          {action.diff && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#94a3b8]">{ui('الاختلافات', 'Diff')}</label>
                <button onClick={() => setShowDiff(!showDiff)} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                  {showDiff ? ui('إخفاء', 'Hide') : ui('عرض', 'Show')}
                </button>
              </div>
              {showDiff && (
                <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs font-mono max-h-60 overflow-y-auto">
                  {action.diff.changes.map((change, i) => (
                    <div key={i} className={change.type === 'add' ? 'text-green-400 bg-green-500/5' : change.type === 'remove' ? 'text-red-400 bg-red-500/5' : 'text-[#64748b]'}>
                      {change.type === 'add' ? '+ ' : change.type === 'remove' ? '- ' : '  '}{change.line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-300 font-bold mb-0.5">{ui('تنفيذ محلي', 'Local execution')}</p>
                <p className="text-[10px] text-green-300/80 leading-relaxed">
                  {ui('سيتم تنفيذ هذه العملية على جهازك عبر Local Agent. نقل بيانات الـAI يعتمد على موفّر الـAI الذي تستخدمه ولا يُفترض أن يكون محليًا تلقائيًا.', 'This operation will run on your device through the Local Agent. AI data transfer depends on the provider you use and is not assumed to be local by default.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#2a2a3a] flex items-center gap-2">
          <button onClick={onDeny} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/20">
            <XCircle className="w-4 h-4" />{ui('رفض', 'Reject')}
          </button>
          <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:opacity-90">
            <CheckCircle className="w-4 h-4" />{ui('سماح لهذه العملية', 'Approve this operation')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
