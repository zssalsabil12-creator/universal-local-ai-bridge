import { Clock, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

interface LogEntry {
  time: string;
  action: string;
  detail: string;
}

interface OperationLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function OperationLog({ logs, onClear }: OperationLogProps) {
  const getIcon = (action: string) => {
    if (action.includes('خطأ')) return <AlertTriangle className="w-3 h-3 text-red-400" />;
    if (action.includes('مكتملة') || action.includes('نسخ')) return <CheckCircle className="w-3 h-3 text-green-400" />;
    return <Info className="w-3 h-3 text-indigo-400" />;
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Clock className="w-10 h-10 text-[#2a2a3a] mb-3" />
        <p className="text-xs text-[#64748b]">لا توجد عمليات مسجلة</p>
      </div>
    );
  }

  return (
    <div className="p-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          سجل العمليات ({logs.length})
        </h3>
        <button onClick={onClear} className="text-[10px] text-[#64748b] hover:text-red-400 transition-colors flex items-center gap-1">
          <Trash2 className="w-3 h-3" />
          مسح
        </button>
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 p-1.5 rounded hover:bg-[#252530] transition-colors">
            <div className="mt-0.5">{getIcon(log.action)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#e2e8f0]">{log.action}</span>
                <span className="text-[9px] text-[#64748b]">{log.time}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] truncate">{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
