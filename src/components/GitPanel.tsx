import { GitBranch, GitCommit, GitPullRequest, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface GitInfo {
  currentBranch: string;
  commits: { hash: string; message: string; author: string; date: string }[];
  status: { staged: number; modified: number; untracked: number };
  branches: string[];
}

interface GitPanelProps {
  gitInfo: GitInfo | null;
}

// Demo Git info
export const DEMO_GIT_INFO: GitInfo = {
  currentBranch: 'main',
  commits: [
    { hash: 'a1b2c3d', message: 'fix: resolve authentication token refresh issue', author: 'Ahmed', date: '2 hours ago' },
    { hash: 'e4f5g6h', message: 'feat: add user dashboard component', author: 'Sara', date: '5 hours ago' },
    { hash: 'i7j8k9l', message: 'refactor: optimize database queries', author: 'Ahmed', date: '1 day ago' },
    { hash: 'm0n1o2p', message: 'docs: update README with setup instructions', author: 'Omar', date: '2 days ago' },
    { hash: 'q3r4s5t', message: 'feat: implement password reset flow', author: 'Sara', date: '3 days ago' },
  ],
  status: { staged: 2, modified: 3, untracked: 1 },
  branches: ['main', 'develop', 'feature/auth', 'feature/dashboard', 'fix/login-bug'],
};

export default function GitPanel({ gitInfo }: GitPanelProps) {
  if (!gitInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <GitBranch className="w-12 h-12 text-[#2a2a3a] mb-4" />
        <p className="text-sm text-[#94a3b8]">لا توجد معلومات Git</p>
        <p className="text-xs text-[#64748b] mt-2">افتح مشروعًا يحتوي على Git</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* Current Branch */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold">الفرع الحالي</span>
        </div>
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-sm font-mono text-indigo-300">{gitInfo.currentBranch}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold">الحالة</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded bg-[#0a0a0f] text-center">
            <p className="text-lg font-bold text-green-400">{gitInfo.status.staged}</p>
            <p className="text-[10px] text-[#94a3b8]">مهيأ</p>
          </div>
          <div className="p-2 rounded bg-[#0a0a0f] text-center">
            <p className="text-lg font-bold text-yellow-400">{gitInfo.status.modified}</p>
            <p className="text-[10px] text-[#94a3b8]">معدل</p>
          </div>
          <div className="p-2 rounded bg-[#0a0a0f] text-center">
            <p className="text-lg font-bold text-[#64748b]">{gitInfo.status.untracked}</p>
            <p className="text-[10px] text-[#94a3b8]">جديد</p>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <GitPullRequest className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold">الفروع ({gitInfo.branches.length})</span>
        </div>
        <div className="space-y-1">
          {gitInfo.branches.map(branch => (
            <div
              key={branch}
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                branch === gitInfo.currentBranch
                  ? 'bg-indigo-500/10 border border-indigo-500/20'
                  : 'bg-[#0a0a0f] hover:bg-[#252530]'
              }`}
            >
              <GitBranch className="w-3 h-3 text-[#94a3b8]" />
              <span className="font-mono text-[#e2e8f0]">{branch}</span>
              {branch === gitInfo.currentBranch && (
                <CheckCircle className="w-3 h-3 text-green-400 mr-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Commits */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GitCommit className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold">آخر العمليات</span>
        </div>
        <div className="space-y-2">
          {gitInfo.commits.map((commit, i) => (
            <div key={i} className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-indigo-400">{commit.hash}</span>
                <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {commit.date}
                </span>
              </div>
              <p className="text-xs text-[#e2e8f0] mb-1">{commit.message}</p>
              <p className="text-[10px] text-[#94a3b8]">{commit.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
