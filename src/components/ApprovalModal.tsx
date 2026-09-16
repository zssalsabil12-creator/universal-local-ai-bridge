import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Clock,
  FileCode, Terminal as TermIcon, GitBranch, Eye, Edit,
  Trash2, ArrowRight
} from 'lucide-react';

export type ApprovalAction = {
  id: string;
  type: 'file_read' | 'file_write' | 'file_delete' | 'terminal_run' | 'git_operation' | 'browser_action';
  resource: string;
  description: string;
  details?: any;
  diff?: {
    before: string;
    after: string;
    changes: { type: 'add' | 'remove' | 'keep'; line: string }[];
  };
  timestamp: number;
};

interface ApprovalModalProps {
  action: ApprovalAction;
  onApprove: (once: boolean) => void;
  onDeny: () => void;
}

export default function ApprovalModal({ action, onApprove, onDeny }: ApprovalModalProps) {
  const [showDiff, setShowDiff] = useState(false);

  const typeConfig: Record<ApprovalAction['type'], { icon: any; color: string; label: string }> = {
    file_read: { icon: Eye, color: 'text-blue-400', label: 'قراءة ملف' },
    file_write: { icon: Edit, color: 'text-yellow-400', label: 'تعديل ملف' },
    file_delete: { icon: Trash2, color: 'text-red-400', label: 'حذف ملف' },
    terminal_run: { icon: TermIcon, color: 'text-green-400', label: 'تشغيل أمر' },
    git_operation: { icon: GitBranch, color: 'text-purple-400', label: 'عملية Git' },
    browser_action: { icon: Shield, color: 'text-cyan-400', label: 'إجراء متصفح' },
  };

  const config = typeConfig[action.type];
  const Icon = config.icon;

  const getRiskLevel = () => {
    if (action.type === 'file_delete') return { level: 'high', color: 'red', text: 'عالي' };
    if (action.type === 'terminal_run') return { level: 'medium', color: 'yellow', text: 'متوسط' };
    if (action.type === 'file_write') return { level: 'medium', color: 'yellow', text: 'متوسط' };
    return { level: 'low', color: 'green', text: 'منخفض' };
  };

  const risk = getRiskLevel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#111118] border border-[#2a2a3a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a3a] flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${risk.color}-500/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              موافقة مطلوبة
              <span className={`px-2 py-0.5 rounded text-[10px] bg-${risk.color}-500/10 text-${risk.color}-400 border border-${risk.color}-500/20`}>
                خطر {risk.text}
              </span>
            </h3>
            <p className="text-xs text-[#94a3b8]">{config.label}</p>
          </div>
          <div className="text-[10px] text-[#64748b] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(action.timestamp).toLocaleTimeString('ar-EG')}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-[#94a3b8] mb-1 block">الوصف</label>
            <p className="text-sm text-[#e2e8f0]">{action.description}</p>
          </div>

          {/* Resource */}
          <div>
            <label className="text-[10px] font-bold text-[#94a3b8] mb-1 block">المسار / المورد</label>
            <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] font-mono text-xs text-cyan-300" dir="ltr">
              {action.resource}
            </div>
          </div>

          {/* Details */}
          {action.details && (
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] mb-1 block">التفاصيل</label>
              <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#94a3b8] font-mono overflow-x-auto" dir="ltr">
                <pre>{JSON.stringify(action.details, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Diff */}
          {action.diff && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#94a3b8]">الاختلافات</label>
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  {showDiff ? 'إخفاء' : 'عرض'}
                </button>
              </div>
              {showDiff && (
                <div className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs font-mono max-h-60 overflow-y-auto">
                  {action.diff.changes.map((change, i) => (
                    <div
                      key={i}
                      className={
                        change.type === 'add' ? 'text-green-400 bg-green-500/5' :
                        change.type === 'remove' ? 'text-red-400 bg-red-500/5' :
                        'text-[#64748b]'
                      }
                    >
                      {change.type === 'add' ? '+ ' : change.type === 'remove' ? '- ' : '  '}
                      {change.line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-300 font-bold mb-0.5">تنفيذ محلي</p>
                <p className="text-[10px] text-green-300/80 leading-relaxed">
                  سيتم تنفيذ هذه العملية على جهازك عبر Local Agent. نقل بيانات الـAI يعتمد على موفّر الـAI الذي تستخدمه ولا يُفترض أن يكون محليًا تلقائيًا.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#2a2a3a] flex items-center gap-2">
          <button
            onClick={onDeny}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            رفض
          </button>
          <button
            onClick={() => onApprove(false)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <CheckCircle className="w-4 h-4" />
            سماح مرة واحدة
          </button>
          <button
            onClick={() => onApprove(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" />
            سماح دائمًا
          </button>
        </div>
      </motion.div>
    </div>
  );
}
