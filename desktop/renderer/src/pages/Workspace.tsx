import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderTree, Search, FileCode, Settings as SettingsIcon, ChevronDown, ChevronLeft,
  X, Folder, File, Eye, Shield, Terminal, GitBranch, MessageSquare,
  Copy, Check, ArrowLeft, Network, Brain, Database, Layers, Clock, Keyboard,
  AlertTriangle, CheckCircle, Play, Square, Send, RotateCcw,
  Maximize2, Minimize2, Plus, Trash2, RefreshCw, Download,
  ArrowUp, ArrowDown, Cpu, Globe, Lock, Unlock
} from 'lucide-react';
import {
  FileNode, ProjectIndex, readDirectory, readFileContent,
  findFileHandle, flattenTree, buildIndex, formatFileSize,
  shouldIgnore, writeFileContent, exportProjectToZip
} from '../utils/fileSystem';
import {
  extractContext, searchInContent,
  expandKeywords, extractKeywords, ContextResult
} from '../utils/contextEngine';
import ProjectMap from '../components/ProjectMap';
import CurrentAIBridgePanel from '../components/CurrentAIBridgePanel';
import LocalMemoryPanel from '../components/LocalMemoryPanel';
import PermissionCenter, { DEFAULT_CONFIG as DEFAULT_PERMISSION_CONFIG, resolvePermission } from '../components/PermissionCenter';
import type { PermissionConfig } from '../components/PermissionCenter';
import ApprovalModal, { ApprovalAction } from '../components/ApprovalModal';
import ContextBuilder from '../components/ContextBuilder';
import DiffViewer from '../components/DiffViewer';
import NotificationSystem, { useNotifications } from '../components/NotificationSystem';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import OperationLog from '../components/OperationLog';
import GitPanel from '../components/GitPanel';
import TerminalPanel from '../components/TerminalPanel';
import SettingsPanel, { DEFAULT_SETTINGS } from '../components/SettingsPanel';
import AdContainer from '../components/AdContainer';
import LegalModal from '../components/LegalModal';
import CurrentLocalAgentStatusModal from '../components/CurrentLocalAgentStatusModal';
import { loadMemory, getProjectMemory, saveMemory, generateMemoryContext, ProjectMemory } from '../utils/localMemory';
import BrandMark from '../components/BrandMark';
import { localAgent, useAgentConnection, AuditLogEntry, FileEntryInfo, GitStatus } from '../utils/localAgent';


// ============ FILE TREE COMPONENT ============
function FileTreeItem({
  node, depth, selectedPath, onSelect, onToggle, onReadFile
}: {
  node: FileNode; depth: number; selectedPath: string | null;
  onSelect: (path: string) => void; onToggle: (path: string) => void;
  onReadFile: (path: string) => void;
}) {
  const isSelected = selectedPath === node.path;
  const isDir = node.type === 'directory';

  return (
    <div>
      <div
        onClick={() => {
          if (isDir) onToggle(node.path);
          else { onSelect(node.path); onReadFile(node.path); }
        }}
        className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer text-xs rounded transition-colors ${
          isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'text-[#94a3b8] hover:bg-[#252530] hover:text-white'
        }`}
        style={{ paddingRight: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${node.isExpanded ? '' : '-rotate-90'}`} />
        ) : (
          <FileCode className="w-3 h-3 flex-shrink-0 text-[#718096]" />
        )}
        <span className="truncate">{node.name}</span>
        {node.type === 'file' && node.size !== undefined && (
          <span className="text-[10px] text-[#64748b] mr-auto">{formatFileSize(node.size)}</span>
        )}
      </div>
      {isDir && node.isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onToggle={onToggle}
              onReadFile={onReadFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ CODE VIEWER ============
function CodeViewer({ content, filename }: { content: string; filename: string }) {
  const lines = content.split('\n');
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const highlightLine = (line: string): JSX.Element => {
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java'].includes(ext)) {
      // Simple syntax highlighting
      let html = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Comments
      html = html.replace(/(\/\/.*$|#.*$)/gm, '<span class="syntax-comment">$1</span>');
      // Strings
      html = html.replace(/(["'`])(?:(?!\1).)*\1/g, '<span class="syntax-string">$&</span>');
      // Keywords
      const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'def', 'self', 'None', 'True', 'False', 'fn', 'pub', 'struct', 'impl', 'use', 'mod', 'interface', 'type', 'extends', 'implements'];
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'g');
        html = html.replace(regex, '<span class="syntax-keyword">$1</span>');
      });
      // Numbers
      html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>');

      return <span dangerouslySetInnerHTML={{ __html: html || ' ' }} />;
    }
    return <span>{line || ' '}</span>;
  };

  return (
    <div className="code-block h-full overflow-auto bg-[#0a0a0f] rounded-lg">
      <div className="sticky top-0 bg-[#0a0a0f] border-b border-[#2a2a3a] px-4 py-2 flex items-center gap-2 z-10">
        <FileCode className="w-4 h-4 text-indigo-400" />
        <span className="text-xs text-[#94a3b8]">{filename}</span>
        <span className="text-[10px] text-[#64748b] mr-auto">{lines.length} lines • {ext.toUpperCase()}</span>
      </div>
      <div className="p-4">
        {lines.map((line, i) => (
          <div key={i} className="flex hover:bg-[#111118] group">
            <span className="w-10 text-right text-[#4a5568] text-xs select-none flex-shrink-0 pr-3 group-hover:text-[#94a3b8]">
              {i + 1}
            </span>
            <span className="text-xs text-[#e2e8f0] whitespace-pre overflow-x-auto">
              {highlightLine(line)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ CONTEXT PANEL ============
function ContextPanel({
  context
}: {
  context: ContextResult | null;
}) {
  if (!context) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Brain className="w-12 h-12 text-[#2a2a3a] mb-4" />
        <p className="text-sm text-[#94a3b8]">اكتب استعلامًا لاستخراج السياق</p>
        <p className="text-xs text-[#64748b] mt-2">سيقوم المحرك بتحليل مشروعك وإيجاد الملفات الأكثر صلة</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold">سياق المهمة</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded bg-[#0a0a0f] text-center">
          <p className="text-lg font-bold text-indigo-400">{context.files.length}</p>
          <p className="text-[10px] text-[#94a3b8]">ملفات</p>
        </div>
        <div className="p-2 rounded bg-[#0a0a0f] text-center">
          <p className="text-lg font-bold text-cyan-400">~{context.totalLines}</p>
          <p className="text-[10px] text-[#94a3b8]">سطر</p>
        </div>
        <div className="p-2 rounded bg-[#0a0a0f] text-center">
          <p className="text-lg font-bold text-purple-400">~{context.estimatedTokens}</p>
          <p className="text-[10px] text-[#94a3b8]">token</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-[#94a3b8] mb-2">الكلمات المفتاحية:</p>
        <div className="flex flex-wrap gap-1">
          {context.keywords.slice(0, 12).map(kw => (
            <span key={kw} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#94a3b8] mb-2">الملفات المختارة:</p>
        <div className="space-y-1.5">
          {context.files.map((file, i) => (
            <div key={i} className="p-2 rounded bg-[#0a0a0f] border border-[#2a2a3a]">
              <div className="flex items-center gap-2">
                <FileCode className="w-3 h-3 text-[#718096] flex-shrink-0" />
                <span className="text-xs text-[#e2e8f0] truncate font-mono" dir="ltr">{file.path}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 rounded bg-[#252530] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded" style={{ width: `${Math.min(file.relevance * 5, 100)}%` }}></div>
                </div>
                <span className="text-[10px] text-[#94a3b8]">{file.relevance}</span>
              </div>
              <p className="text-[10px] text-[#64748b] mt-1">{file.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ CHAT PANEL ============
function ChatPanel({
  onExtractContext, isLoading
}: {
  onExtractContext: (query: string) => void; isLoading: boolean;
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'system'; content: string }[]>([
    { role: 'system', content: 'مرحبًا! اكتب سؤالك عن المشروع وسأستخرج السياق المناسب من ملفاتك المحلية.' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    onExtractContext(input);
    setInput('');
  };

  const suggestions = [
    'أين يتم التحقق من المصادقة؟',
    'Find authentication logic',
    'Show API routes',
    'اشرح بنية المشروع',
    'Find database models',
    'Show component hierarchy',
    'ما هي الملفات المرتبطة بـ login؟',
    'Find all React components',
    'Show me the database schema',
    'أين يتم التعامل مع الأخطاء؟',
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[#2a2a3a] flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#7e8da6]" />
        <span className="text-sm font-bold">Local Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
              msg.role === 'user'
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-[#e2e8f0]'
                : 'bg-[#252530] border border-[#2a2a3a] text-[#94a3b8]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-[#252530] border border-[#2a2a3a] rounded-lg p-2.5 text-xs text-[#94a3b8]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                جاري تحليل المشروع...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-[#64748b] mb-1.5">اقتراحات:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); }} className="px-2 py-1 rounded text-[10px] bg-[#252530] hover:bg-[#2a2a3a] text-[#94a3b8] transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-[#2a2a3a] space-y-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اكتب سؤالك عن المشروع..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-indigo-500/50 focus:outline-none"
            dir="auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

// ============ PERMISSION MODAL ============
function PermissionModal({
  isOpen, onClose, mode, onModeChange
}: {
  isOpen: boolean; onClose: () => void; mode: string; onModeChange: (m: string) => void;
}) {
  if (!isOpen) return null;

  const modes = [
    { id: 'readonly', name: 'قراءة فقط', icon: <Eye className="w-5 h-5" />, selected: 'border-emerald-400/45 bg-emerald-400/10', iconClass: 'text-emerald-400', desc: 'AI يقرأ ويحلل فقط' },
    { id: 'assisted', name: 'كتابة بمساعدة', icon: <FileCode className="w-5 h-5" />, selected: 'border-amber-400/45 bg-amber-400/10', iconClass: 'text-amber-400', desc: 'AI يقترح التعديل وأنت توافق قبل التطبيق' },
    { id: 'agent', name: 'وضع الوكيل', icon: <Cpu className="w-5 h-5" />, selected: 'border-violet-400/45 bg-violet-400/10', iconClass: 'text-violet-400', desc: 'AI ينفذ العمليات بعد موافقتك الصريحة' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold">نظام الصلاحيات</h3>
          <button onClick={onClose} className="mr-auto text-[#94a3b8] hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`w-full p-4 rounded-xl border text-right transition-all ${
                mode === m.id
                  ? m.selected + ' shadow-lg shadow-black/20'
                  : 'border-[#2a2a3a] hover:border-[#3a3a4a] hover:bg-white/[0.025]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={m.iconClass}>{m.icon}</div>
                <div>
                  <p className="text-sm font-bold">{m.name}</p>
                  <p className="text-xs text-[#94a3b8]">{m.desc}</p>
                </div>
                {mode === m.id && <CheckCircle className={`w-5 h-5 ${m.iconClass} mr-auto`} />}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 p-3 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <Lock className="w-3 h-3 text-green-400" />
            <span>جميع العمليات تُسجل محليًا ولا تُرسل لأي خادم</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============ SEARCH PANEL ============
function SearchPanel({
  index, onFileSelect, fileContents
}: {
  index: ProjectIndex | null; onFileSelect: (path: string) => void;
  fileContents: Record<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ file: string; line: number; text: string }[]>([]);

  useEffect(() => {
    if (!query.trim() || !index) { setResults([]); return; }

    const allResults: { file: string; line: number; text: string }[] = [];
    const q = query.toLowerCase();

    // Search in filenames first
    for (const file of index.flatFiles) {
      if (file.path.toLowerCase().includes(q)) {
        allResults.push({ file: file.path, line: 0, text: file.name + ' (اسم الملف)' });
      }
    }

    // Search in file contents
    for (const [path, content] of Object.entries(fileContents)) {
      const matches = searchInContent(content, query);
      for (const match of matches) {
        allResults.push({ file: path, line: match.line, text: match.text });
      }
    }

    setResults(allResults.slice(0, 30));
  }, [query, index, fileContents]);

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ابحث في المشروع..."
          className="w-full pr-9 pl-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b] focus:border-indigo-500/50 focus:outline-none"
          dir="auto"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {results.length === 0 && query && (
          <p className="text-xs text-[#64748b] text-center py-4">لا توجد نتائج</p>
        )}
        {results.map((r, i) => (
          <button
            key={i}
            onClick={() => onFileSelect(r.file)}
            className="w-full text-right p-2 rounded hover:bg-[#252530] transition-colors"
          >
            <p className="text-[10px] text-indigo-400 font-mono truncate" dir="ltr">{r.file}</p>
            {r.line > 0 && (
              <>
                <p className="text-xs text-[#e2e8f0] truncate mt-0.5" dir="ltr">{r.text}</p>
                <p className="text-[10px] text-[#64748b]">سطر {r.line}</p>
              </>
            )}
          </button>
        ))}
        {!query && (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-[#2a2a3a] mx-auto mb-2" />
            <p className="text-xs text-[#64748b]">اكتب للبحث في الملفات والمحتوى</p>
          </div>
        )}
      </div>
    </div>
  );
}

function buildAgentFileNodes(entries: FileEntryInfo[]): FileNode[] {
  const nodesByPath = new Map<string, FileNode>();
  const roots: FileNode[] = [];
  const normalized = [...entries]
    .map(entry => ({ ...entry, relativePath: entry.relativePath.replace(/\\/g, '/') }))
    .sort((a, b) => a.relativePath.split('/').length - b.relativePath.split('/').length || a.relativePath.localeCompare(b.relativePath));

  for (const entry of normalized) {
    const path = entry.relativePath.replace(/^\.\//, '');
    const parts = path.split('/');
    const node: FileNode = {
      name: entry.name,
      path,
      type: entry.isDirectory ? 'directory' : 'file',
      size: entry.size,
      extension: entry.isDirectory ? undefined : getFileExtension(entry.name),
      isExpanded: entry.isDirectory && parts.length <= 2
    };
    nodesByPath.set(path, node);
    const parentPath = parts.slice(0, -1).join('/');
    const parent = parentPath ? nodesByPath.get(parentPath) : undefined;
    if (parent && parent.type === 'directory') {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

function permissionStorageKey(workspaceId: string): string {
  return 'ulab:permissions:v1:' + encodeURIComponent(workspaceId);
}

function loadWorkspacePermissions(workspaceId: string): PermissionConfig {
  try {
    const raw = localStorage.getItem(permissionStorageKey(workspaceId));
    if (!raw) return { ...DEFAULT_PERMISSION_CONFIG, projectId: workspaceId };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PERMISSION_CONFIG,
      ...parsed,
      projectId: workspaceId,
      globalPermissions: {
        ...DEFAULT_PERMISSION_CONFIG.globalPermissions,
        ...(parsed?.globalPermissions || {}),
      },
      rules: Array.isArray(parsed?.rules) ? parsed.rules : [],
    };
  } catch {
    return { ...DEFAULT_PERMISSION_CONFIG, projectId: workspaceId };
  }
}

function getPermissionKeyForAIAction(action: string): keyof PermissionConfig['globalPermissions'] | null {
  if (action === 'files.delete') return 'deleteFiles';
  if (action === 'files.write' || action === 'files.approve' || action === 'files.reject') return 'writeFiles';
  if (action === 'terminal.execute' || action === 'testing.run') return 'runTerminal';
  if (action === 'git.commit' || action === 'git.push') return 'accessGit';
  return null;
}

// ============ MAIN WORKSPACE ============
export default function Workspace({ onBack }: { onBack: () => void }) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [projectIndex, setProjectIndex] = useState<ProjectIndex | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [context, setContext] = useState<ContextResult | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<'files' | 'search' | 'map'>('files');
  const [activeRightPanel, setActiveRightPanel] = useState<'bridge' | 'context' | 'contextBuilder' | 'memory' | 'permissions' | 'tasks' | 'log' | 'git' | 'terminal' | 'settings'>('bridge');
  const [lastQuery, setLastQuery] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [allMemory, setAllMemory] = useState<Record<string, ProjectMemory>>(loadMemory());
  const [permissionConfig, setPermissionConfig] = useState(DEFAULT_PERMISSION_CONFIG);
  const [pendingApproval, setPendingApproval] = useState<ApprovalAction | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedContextFiles, setSelectedContextFiles] = useState<string[]>([]);
  const [pinnedContextFiles, setPinnedContextFiles] = useState<string[]>([]);
  const [excludedContextPaths, setExcludedContextPaths] = useState<string[]>([]);
  const notifications = useNotifications();
  const agentConnection = useAgentConnection();
  const [permissionMode, setPermissionMode] = useState('readonly');
  const [showPermissions, setShowPermissions] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showAgentStatusModal, setShowAgentStatusModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [operationLog, setOperationLog] = useState<{ time: string; action: string; detail: string }[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [gitInfo, setGitInfo] = useState<GitStatus | null>(null);
  const [gitRefreshing, setGitRefreshing] = useState(false);

  const refreshGitStatus = useCallback(async () => {
    if (!isDesktop || agentConnection.status !== 'connected' || !localAgent.getSession()) {
      setGitInfo(null);
      return;
    }
    const gitPermission = resolvePermission(permissionConfig, 'accessGit', 'git.status');
    if (gitPermission === 'deny') {
      setGitInfo({
        branch:'—',
        modified:[],
        staged:[],
        untracked:[],
        clean:false,
        isRepository:false,
        error:'صلاحية Git مرفوضة من إعدادات مساحة العمل.',
      });
      return;
    }
    setGitRefreshing(true);
    try {
      const result = await localAgent.gitStatus();
      if (result.success && result.data) {
        setGitInfo(result.data);
      } else {
        setGitInfo({
          branch:'—',
          modified:[],
          staged:[],
          untracked:[],
          clean:false,
          isRepository:false,
          error:result.error?.message || 'تعذر قراءة حالة Git',
        });
      }
    } finally {
      setGitRefreshing(false);
    }
  }, [agentConnection.status, permissionConfig]);

  const workspacePermissionId = agentConnection.activeWorkspace || projectIndex?.rootName || '';

  const refreshAudit = useCallback(async () => {
    if (agentConnection.status !== 'connected' || !localAgent.getSession()) return;
    const result = await localAgent.queryAudit();
    if (result.success && Array.isArray(result.data)) setAuditEntries(result.data);
  }, [agentConnection.status]);

  const updatePermissionConfig = useCallback((next: PermissionConfig) => {
    const normalized = { ...next, projectId: workspacePermissionId };
    setPermissionConfig(normalized);
    if (!workspacePermissionId) return;
    try {
      localStorage.setItem(permissionStorageKey(workspacePermissionId), JSON.stringify(normalized));
    } catch {
      // Local persistence is a convenience; server-side security remains authoritative.
    }
  }, [workspacePermissionId]);

  const addLog = (action: string, detail: string) => {
    setOperationLog(prev => [{ time: new Date().toLocaleTimeString('ar-EG'), action, detail }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const desktop = window.ulabDesktop;
    if (!desktop?.isDesktop || !desktop.onAIApprovalRequest) return;
    const off = desktop.onAIApprovalRequest((raw: unknown) => {
      const data = raw as any;
      const action = String(data?.action || '');
      const type: ApprovalAction['type'] =
        action === 'files.delete' ? 'file_delete' :
        action === 'terminal.execute' || action === 'testing.run' ? 'terminal_run' :
        action.startsWith('git.') ? 'git_operation' :
        'file_write';
      const resource = String(data?.resource || data?.params?.path || data?.params?.command || action);
      setActiveRightPanel('bridge');
      setPendingApproval({
        id: String(data?.approvalId || `approval-${Date.now()}`),
        type,
        resource,
        description: String(data?.description || ('AI طلب تنفيذ العملية: ' + action)),
        details: { source: 'ai-bridge', action, params: data?.params || {}, approvalId: data?.approvalId },
        timestamp: Date.now(),
      });
    });
    return () => { off?.(); };
  }, []);

  // Central File Modification Applier. Connected Local Agent writes always use
  // the server-side proposal/approval gate; browser storage remains the fallback.
  const applyFileModification = async (path: string, content: string): Promise<boolean> => {
    try {
      const writePermission = resolvePermission(permissionConfig, 'writeFiles', path);
      if (writePermission === 'deny') {
        notifications.warning('التعديل محظور', 'إعدادات الصلاحيات تمنع تعديل هذا الملف داخل مساحة العمل.');
        addLog('رفض تعديل ملف', path);
        return false;
      }
      if (permissionMode === 'readonly') {
        notifications.warning('العملية محظورة', 'وضع القراءة فقط يمنع تعديل الملفات. غيّر وضع الصلاحيات أولاً.');
        return false;
      }
      if (agentConnection.status === 'connected' && localAgent.getSession()) {
        const proposal = await localAgent.proposeChange(path, content, 'Approved by ULAB Agent Mode');
        if (!proposal.success || !proposal.data?.changeId) {
          notifications.error('رفض التعديل', proposal.error?.message || 'تعذر إنشاء اقتراح آمن');
          return false;
        }
        const approval = await localAgent.approveChange(proposal.data.changeId);
        if (!approval.success) {
          notifications.error('رفض التعديل', approval.error?.message || 'تعذر اعتماد التعديل');
          return false;
        }
        const applied = await localAgent.writeFile(path, content, true);
        if (!applied.success) {
          notifications.error('فشل التطبيق', applied.error?.message || 'تم اعتماد الاقتراح لكن تعذر تطبيقه');
          return false;
        }
        setFileContents(prev => ({ ...prev, [path]: content }));
        if (selectedFile === path) setFileContent(content);
        addLog('Agent حفظ ملف', path);
        notifications.success('تم الحفظ', `تم اعتماد التعديل وحفظه: ${path}`);
        return true;
      }

      if (dirHandle) {
        const ok = await writeFileContent(dirHandle, path, content);
        if (ok) {
          setFileContents(prev => ({ ...prev, [path]: content }));
          if (selectedFile === path) setFileContent(content);
          addLog('تعديل ملف محلي', path);
          notifications.success('تم الحفظ', `تم تطبيق التعديلات بنجاح: ${path}`);
          return true;
        }
      }
      // Browser fallback when no Local Agent is available.
      setFileContents(prev => ({ ...prev, [path]: content }));
      if (selectedFile === path) setFileContent(content);
      addLog('تعديل في الذاكرة', path);
      notifications.info('تم التعديل', `تم تعديل ${path} في ذاكرة العمل`);
      return true;
    } catch (e: any) {
      console.error(e);
      notifications.error('خطأ', `فشل تطبيق التعديل على ${path}`);
      return false;
    }
  };

  // Export current project state to a downloadable ZIP file
  const handleExportProjectZip = async () => {
    if (!projectIndex) {
      notifications.warning('تنبيه', 'يرجى فتح مشروع أو بدء الوضع التجريبي أولاً لتصديره');
      return;
    }
    try {
      notifications.info('جاري التجهيز', 'جاري تجهيز حزمة المشروع للتنزيل...');
      const filesToZip: Record<string, string> = {};
      for (const file of projectIndex.flatFiles) {
        if (fileContents[file.path]) {
          filesToZip[file.path] = fileContents[file.path];
        } else if (dirHandle) {
          const handle = await findFileHandle(dirHandle, file.path);
          if (handle && 'getFile' in handle) {
            const text = await readFileContent(handle as FileSystemFileHandle);
            filesToZip[file.path] = text;
          }
        }
      }
      const blob = await exportProjectToZip(filesToZip, projectIndex.rootName || 'project');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectIndex.rootName || 'project'}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      notifications.success('اكتمل التحميل', 'تم تنزيل المشروع كملف ZIP بنجاح!');
      addLog('تصدير ZIP', projectIndex.rootName);
    } catch (err: any) {
      console.error('ZIP export failed', err);
      notifications.error('خطأ', 'تعذر تصدير المشروع كـ ZIP');
    }
  };

  // Get current project memory
  const currentProjectMemory = projectIndex
    ? getProjectMemory(allMemory, projectIndex.rootName, projectIndex.rootName)
    : null;

  // Update project memory
  const handleUpdateMemory = (updatedMemory: ProjectMemory) => {
    const newAllMemory = { ...allMemory, [updatedMemory.projectId]: updatedMemory };
    setAllMemory(newAllMemory);
    saveMemory(newAllMemory);
    addLog('تحديث الذاكرة', updatedMemory.projectId);
  };


  // Request approval
  const requestApproval = (action: Omit<ApprovalAction, 'id' | 'timestamp'>) => {
    const approvalAction: ApprovalAction = {
      ...action,
      id: `approval-${Date.now()}`,
      timestamp: Date.now(),
    };
    setPendingApproval(approvalAction);
  };

  // Open workspace: Desktop uses native picker + Agent, browser uses File System Access API.
  const handleOpenFolder = async () => {
    const desktop = window.ulabDesktop?.isDesktop;
    setIsIndexing(true);
    try {
      if (desktop) {
        const picked = await window.ulabDesktop!.chooseWorkspace();
        if (picked.canceled || !picked.path) return;

        setDirHandle(null);
        const selected = await localAgent.selectWorkspace(picked.path);
        if (!selected.success || !selected.data) {
          throw new Error(selected.error?.message || 'تعذر ربط مساحة العمل بالـAgent');
        }

        const listed = await localAgent.listFiles('.', true);
        if (!listed.success || !Array.isArray(listed.data)) {
          throw new Error(listed.error?.message || 'تعذر فهرسة مساحة العمل');
        }

        const index = buildIndex(
          selected.data.workspaceName || picked.path.split('\\').pop() || picked.path,
          buildAgentFileNodes(listed.data)
        );
        setProjectIndex(index);
        setIsIndexing(false);
        setFileContents({});
        setSelectedFile(null);
        setFileContent('');
        setContext(null);
        addLog('ربط مساحة العمل', selected.data.workspaceRoot);
        addLog('فهرسة مكتملة', `${index.totalFiles} ملف, ${index.totalDirs} مجلد`);
        notifications.success('تم ربط مساحة العمل', `تم تأمين "${selected.data.workspaceName}" داخل ULAB.`);
        return;
      }

      let handle;
      try {
        handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      } catch {
        handle = await (window as any).showDirectoryPicker({ mode: 'read' });
      }
      setDirHandle(handle);
      addLog('فتح مجلد', handle.name);

      const files = await readDirectory(handle);
      const index = buildIndex(handle.name, files);
      setProjectIndex(index);
      setIsIndexing(false);
      addLog('فهرسة مكتملة', `${index.totalFiles} ملف, ${index.totalDirs} مجلد`);
      notifications.success('تم فتح المجلد', `تم ربط المجلد "${handle.name}" بنجاح!`);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error(e);
        addLog('خطأ', e?.message || 'فشل فتح مساحة العمل');
        notifications.error('فشل العملية', e?.message || 'فشل فتح مساحة العمل');
      }
    } finally {
      setIsIndexing(false);
    }
  };

  // Toggle directory expansion
  const toggleDir = useCallback((path: string) => {
    if (!projectIndex) return;
    const toggle = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path) return { ...node, isExpanded: !node.isExpanded };
        if (node.children) return { ...node, children: toggle(node.children) };
        return node;
      });
    };
    setProjectIndex({ ...projectIndex, files: toggle(projectIndex.files) });
  }, [projectIndex]);

  // Read file content: Desktop delegates to the sandboxed Agent; browser uses the selected directory handle.
  const handleReadFile = useCallback(async (path: string) => {
    if (fileContents[path]) {
      setFileContent(fileContents[path]);
      return;
    }
    try {
      if (window.ulabDesktop?.isDesktop && localAgent.getSession()) {
        const result = await localAgent.readFile(path);
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'تعذر قراءة الملف');
        }
        setFileContents(prev => ({ ...prev, [path]: result.data!.content }));
        setFileContent(result.data.content);
        addLog('Agent قراءة ملف', path);
        return;
      }

      if (!dirHandle) return;
      const handle = await findFileHandle(dirHandle, path);
      if (handle && 'getFile' in handle) {
        const content = await readFileContent(handle as FileSystemFileHandle);
        setFileContents(prev => ({ ...prev, [path]: content }));
        setFileContent(content);
        addLog('قراءة ملف', path);
      }
    } catch (e) {
      console.error(e);
      notifications.error('تعذر قراءة الملف', e instanceof Error ? e.message : 'حدث خطأ أثناء القراءة');
    }
  }, [dirHandle, fileContents]);

  // Select file
  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    if (fileContents[path]) {
      setFileContent(fileContents[path]);
    } else {
      handleReadFile(path);
    }
  };

  // Extract context
  const handleExtractContext = async (query: string) => {
    if (!projectIndex) return;
    setIsContextLoading(true);
    setLastQuery(query);
    addLog('استخراج سياق', query);

    try {
      // Simulate processing delay
      await new Promise(r => setTimeout(r, 800));

      const result = extractContext(projectIndex, query, 10, new Map(Object.entries(fileContents)));
      setContext(result);

      // Load file contents required by the selected task context.
      for (const file of result.files) {
        if (!fileContents[file.path]) {
          await handleReadFile(file.path);
        }
      }

      addLog('سياق مستخرج', `${result.files.length} ملفات, ~${result.estimatedTokens} tokens`);
      if (result.files.length === 0) {
        notifications.warning('لا نتائج', 'لم يتم العثور على ملفات مطابقة — جرّب كلمات مختلفة');
      }
    } catch (e) {
      console.error('Context extraction failed:', e);
      addLog('خطأ استخراج سياق', String(e));
      notifications.error('فشل استخراج السياق', 'حدث خطأ أثناء البحث في المشروع');
    } finally {
      setIsContextLoading(false);
      setActiveRightPanel('context');
    }
  };


  useEffect(() => {
    if (agentConnection.status === 'connected' && localAgent.getSession()) {
      void refreshAudit();
    } else {
      setAuditEntries([]);
    }
  }, [agentConnection.status, refreshAudit]);

  useEffect(() => {
    if (workspacePermissionId) {
      const loaded = loadWorkspacePermissions(workspacePermissionId);
      setPermissionConfig(loaded);
    } else {
      setPermissionConfig({ ...DEFAULT_PERMISSION_CONFIG, projectId:'' });
    }
  }, [workspacePermissionId]);

  useEffect(() => {
    if (projectIndex && agentConnection.status === 'connected') {
      void refreshGitStatus();
    } else {
      setGitInfo(null);
    }
  }, [projectIndex?.rootName, agentConnection.status, refreshGitStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'o':
            e.preventDefault();
            handleOpenFolder();
            break;
          case 'f':
            e.preventDefault();
            setActiveSidebarPanel('search');
            break;
          case 'k':
            e.preventDefault();
            setActiveSidebarPanel('search');
            break;
          case '1':
            e.preventDefault();
            setActiveRightPanel('bridge');
            break;
          case '2':
            e.preventDefault();
            setActiveRightPanel('context');
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowPermissions(false);
        setShowLegalModal(false);
        setShowShortcuts(false);
        setShowAgentStatusModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Desktop always uses native picker + Agent; browser mode may use File System Access.
  const isDesktop = !!window.ulabDesktop?.isDesktop;
  const isFSASupported = isDesktop || 'showDirectoryPicker' in window;

  return (
    <div className="ulab-workspace h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="ulab-topbar h-14 flex items-center px-4 gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/[0.06] bg-white/[0.025] text-[8px] font-bold tracking-[0.14em] text-[#64748b]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/80 shadow-[0_0_8px_rgba(103,232,249,.45)]" />
          DESKTOP
        </div>
        <div className="flex items-center gap-3 min-w-[155px]">
          <BrandMark size={30} />
          <div className="hidden md:block leading-tight">
            <span className="block text-[11px] font-black tracking-[0.18em] text-white">WORKSPACE</span>
            <span className="block text-[9px] text-[#60708f] mt-0.5">Universal Local AI Bridge</span>
          </div>
        </div>

        {projectIndex && (
          <>
            <div className="ulab-project-chip min-w-0">
              <Folder className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
              <span className="ulab-project-chip-name">{projectIndex.rootName}</span>
              <span className="text-[#52617d]">·</span>
              <span className="text-[9px] text-[#71809d]">{projectIndex.totalFiles} files</span>
            </div>
            <button
              onClick={() => { setProjectIndex(null); setSelectedFile(null); setFileContent(''); setFileContents({}); setContext(null); setOperationLog([]); }}
              className="text-[10px] text-[#64748b] hover:text-red-400 transition-colors"
              title="إغلاق المشروع"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <div className="ulab-topbar-actions flex items-center gap-2 mr-auto">
          {/* Local Agent Status Button */}
          <button
            onClick={() => setShowAgentStatusModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#111625]/85 hover:bg-[#18203a] text-[#aab7d0] hover:text-white border border-white/[0.08] transition-all"
            title="فحص حالة اتصال ULAB Local Agent وSandbox"
            aria-label="حالة ULAB Local Agent"
          >
            <span className={`w-2 h-2 rounded-full ${
              agentConnection.status === 'connected' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.5)]' :
              agentConnection.status === 'connecting' ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,.4)]' :
              'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,.35)]'
            }`} />
            <span className="hidden sm:inline">
              {agentConnection.status === 'connected' ? 'Local Agent' : agentConnection.status === 'connecting' ? 'Connecting…' : 'Agent offline'}
            </span>
          </button>

          {/* AI Bridge Status */}
          <button
            onClick={() => setActiveRightPanel('bridge')}
            className="ai-bridge-primary flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all"
            title="ربط chatbot النشط بالـ Local Agent دون نسخ ولصق"
          >
            <Network className="w-3.5 h-3.5" />
            <span>AI Bridge</span>
          </button>

          {/* Large Project Slicer Button */}
          {/* Download Project ZIP Button */}
          {projectIndex && (
            <button
              onClick={handleExportProjectZip}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#181824] hover:bg-[#222234] text-[#cbd5e1] border border-[#2a2a3a] transition-colors"
              title="تنزيل المشروع كاملاً بصيغة ZIP"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">تحميل ZIP</span>
            </button>
          )}

          {projectIndex && (
            <button onClick={() => setShowPermissions(true)} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-[#252530] hover:bg-[#2a2a3a] transition-colors">
              {permissionMode === 'readonly' ? <Lock className="w-3 h-3 text-green-400" /> : <Unlock className="w-3 h-3 text-yellow-400" />}
              <span className="hidden sm:inline">
                {permissionMode === 'readonly' ? 'قراءة فقط' : permissionMode === 'assisted' ? 'بمساعدة' : 'وكيل'}
              </span>
            </button>
          )}

          <button
            onClick={() => setShowLegalModal(true)}
            className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
            title="سياسة الخصوصية وشروط الاستخدام"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
          </button>

          <button onClick={() => setShowShortcuts(true)} className="ulab-icon-button" title="اختصارات لوحة المفاتيح" aria-label="اختصارات لوحة المفاتيح">
            <Keyboard className="w-4 h-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="ulab-workspace-grid flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="ulab-sidebar flex flex-col" style={{ width: sidebarWidth }}>
          {/* Sidebar Tabs */}
          <div className="ulab-sidebar-tabs flex">
            {[
              { id: 'files' as const, icon: <FolderTree className="w-4 h-4" />, label: 'الملفات' },
              { id: 'search' as const, icon: <Search className="w-4 h-4" />, label: 'بحث' },
              { id: 'map' as const, icon: <Layers className="w-4 h-4" />, label: 'خريطة' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSidebarPanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
                  activeSidebarPanel === tab.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {activeSidebarPanel === 'files' && (
              <div className="p-2">
                {!projectIndex ? (
                  <div className="text-center py-8">
                    <FolderTree className="w-10 h-10 text-[#2a2a3a] mx-auto mb-3" />
                    <p className="text-xs text-[#94a3b8] mb-3">اختر مجلد مشروع</p>
                    <button
                      onClick={handleOpenFolder}
                      disabled={!isFSASupported}
                      className="ulab-btn ulab-btn-primary w-full mb-2"
                    >
                      {isFSASupported ? 'فتح مجلد' : 'المتصفح غير مدعوم'}
                    </button>

                    {!isFSASupported && (
                      <p className="text-[10px] text-[#94a3b8] mt-2">استخدم Chrome أو Edge في وضع المتصفح فقط.</p>
                    )}
                  </div>
                ) : isIndexing ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-spin" />
                    <p className="text-xs text-[#94a3b8]">جاري الفهرسة...</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                      <span className="text-[10px] text-[#64748b]">{projectIndex.totalFiles} ملف</span>
                      <button onClick={handleOpenFolder} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                        تغيير المجلد
                      </button>
                    </div>
                    {projectIndex.files.map(node => (
                      <FileTreeItem
                        key={node.path}
                        node={node}
                        depth={0}
                        selectedPath={selectedFile}
                        onSelect={handleSelectFile}
                        onToggle={toggleDir}
                        onReadFile={handleReadFile}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeSidebarPanel === 'search' && (
              <SearchPanel index={projectIndex} onFileSelect={handleSelectFile} fileContents={fileContents} />
            )}
            {activeSidebarPanel === 'map' && (
              <ProjectMap index={projectIndex} onFileClick={handleSelectFile} />
            )}
          </div>
        </div>

        {/* Center - Code Viewer */}
        <div className="ulab-editor flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <div className="flex-1 overflow-hidden">
              <CodeViewer content={fileContent || 'جاري التحميل...'} filename={selectedFile} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="ulab-empty-state text-center max-w-2xl px-8">
                <div className="ulab-empty-brand mx-auto mb-6">
                  <BrandMark size={46} showWordmark={false} />
                </div>
                <div className="ulab-eyebrow mx-auto mb-3">LOCAL WORKSPACE</div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Your workspace, connected.</h2>
                <p className="text-sm md:text-[15px] leading-7 text-[#8d9bb7] mb-7 max-w-xl mx-auto">
                  {projectIndex
                    ? 'اختر ملفًا من الشجرة لعرضه، أو استخدم AI Bridge لإرسال السياق وتشغيل المهام المحلية دون نسخ ولصق.'
                    : 'افتح مجلد مشروعك للبدء. ULAB يربط جلسة الذكاء الاصطناعي بمساحة عمل محلية محمية.'}
                </p>
                {!projectIndex && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleOpenFolder}
                      disabled={!isFSASupported}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <FolderTree className="w-5 h-5" />
                        فتح مجلد المشروع
                      </span>
                    </button>

                  </div>
                )}
                {!projectIndex && !isFSASupported && (
                  <p className="text-xs text-[#94a3b8] mt-4">
 افتح ULAB Desktop للحصول على اتصال Local Agent كامل.
                  </p>
                )}

                {/* Quick stats */}
                {projectIndex && (
                  <div className="mt-8 grid grid-cols-4 gap-4 max-w-lg mx-auto">
                    <div className="p-3 rounded-lg bg-[#111118] border border-[#2a2a3a]">
                      <p className="text-lg font-bold text-indigo-400">{projectIndex.totalFiles}</p>
                      <p className="text-[10px] text-[#94a3b8]">ملف</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#111118] border border-[#2a2a3a]">
                      <p className="text-lg font-bold text-cyan-400">{projectIndex.totalDirs}</p>
                      <p className="text-[10px] text-[#94a3b8]">مجلد</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#111118] border border-[#2a2a3a]">
                      <p className="text-lg font-bold text-green-400">{formatFileSize(projectIndex.totalSize)}</p>
                      <p className="text-[10px] text-[#94a3b8]">الحجم</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#111118] border border-[#2a2a3a]">
                      <p className="text-lg font-bold text-purple-400">{Object.keys(projectIndex.extensions).length}</p>
                      <p className="text-[10px] text-[#94a3b8]">نوع ملف</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="ulab-inspector flex flex-col" style={{ width: rightPanelWidth }}>
          {/* Right Panel Tabs */}
          <div className="ulab-inspector-tabs flex overflow-x-auto">
            {[
              { id: 'bridge' as const, icon: <Network className="w-4 h-4" />, label: 'Bridge' },
              { id: 'contextBuilder' as const, icon: <Layers className="w-4 h-4" />, label: 'السياق' },
              { id: 'memory' as const, icon: <Database className="w-4 h-4" />, label: 'الذاكرة' },
              { id: 'permissions' as const, icon: <Shield className="w-4 h-4" />, label: 'الصلاحيات' },

              { id: 'git' as const, icon: <GitBranch className="w-4 h-4" />, label: 'Git' },
              { id: 'terminal' as const, icon: <Terminal className="w-4 h-4" />, label: 'Terminal' },
              { id: 'settings' as const, icon: <SettingsIcon className="w-4 h-4" />, label: 'إعدادات' },
              { id: 'log' as const, icon: <Clock className="w-4 h-4" />, label: 'السجل' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRightPanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
                  activeRightPanel === tab.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeRightPanel === 'context' && (
              <ContextPanel context={context} />
            )}
            {activeRightPanel === 'log' && (
              <OperationLog logs={operationLog} onClear={() => setOperationLog([])} />
            )}
            {activeRightPanel === 'bridge' && (
              <CurrentAIBridgePanel
                context={context}
                fileContents={fileContents}
                query={lastQuery}
                projectName={projectIndex?.rootName || 'No Project'}
                onPrepareContext={handleExtractContext}
              />
            )}

            {activeRightPanel === 'contextBuilder' && (
              <ContextBuilder
                projectIndex={projectIndex}
                selectedFiles={selectedContextFiles}
                pinnedFiles={pinnedContextFiles}
                excludedPaths={excludedContextPaths}
                onToggleFile={(path) => {
                  setSelectedContextFiles(prev =>
                    prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
                  );
                }}
                onTogglePin={(path) => {
                  setPinnedContextFiles(prev =>
                    prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
                  );
                }}
                onToggleExclude={(path) => {
                  setExcludedContextPaths(prev =>
                    prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
                  );
                }}
              />
            )}
            {activeRightPanel === 'memory' && currentProjectMemory && (
              <LocalMemoryPanel
                projectMemory={currentProjectMemory}
                onUpdateMemory={handleUpdateMemory}
              />
            )}
            {activeRightPanel === 'permissions' && (
              <PermissionCenter
                config={permissionConfig}
                onUpdate={updatePermissionConfig}
              />
            )}

            {activeRightPanel === 'git' && (
              <GitPanel
                gitInfo={gitInfo}
                onRefresh={() => void refreshGitStatus()}
                refreshing={gitRefreshing}
              />
            )}
            {activeRightPanel === 'terminal' && (
              <TerminalPanel
                permissionMode={permissionMode}
                connected={agentConnection.status === 'connected' && !!agentConnection.session}
                onExecuteCommand={async (command, args = [], approved = false) => {
                  if (permissionMode === 'readonly') {
                    notifications.warning('العملية محظورة', 'وضع القراءة فقط يمنع تشغيل أوامر Terminal.');
                    return { success: false, error: { message: 'READONLY_MODE' } };
                  }
                  const terminalPermission = resolvePermission(permissionConfig, 'runTerminal', command);
                  if (terminalPermission === 'deny') {
                    notifications.warning('الأمر محظور', 'إعدادات الصلاحيات تمنع تنفيذ أوامر Terminal في هذه المساحة.');
                    addLog('رفض Terminal', command);
                    return { success: false, error: { message: 'PERMISSION_DENIED' } };
                  }
                  const result = await localAgent.executeTerminal(command, args, approved);
                  addLog('Terminal Execute', `${command} ${args.join(' ')}`.trim());
                  if (!result.success) {
                    notifications.error('فشل تنفيذ الأمر', result.error?.message || 'تعذر تنفيذ الأمر');
                  }
                  return result;
                }}
              />
            )}
            {activeRightPanel === 'settings' && (
              <SettingsPanel settings={settings} onSettingsChange={setSettings} />
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {pendingApproval && (
        <ApprovalModal
          action={pendingApproval}
          onApprove={async () => {
            const aiRequestId = pendingApproval.details?.approvalId;
            if (aiRequestId && window.ulabDesktop?.aiApprove) {
              const aiAction = String(pendingApproval.details?.action || '');
              const permissionKey = getPermissionKeyForAIAction(aiAction);
              const permissionDecision = permissionKey
                ? resolvePermission(permissionConfig, permissionKey, pendingApproval.resource)
                : 'ask';
              if (permissionMode === 'readonly' || permissionDecision === 'deny') {
                if (window.ulabDesktop.aiReject) await window.ulabDesktop.aiReject(aiRequestId);
                notifications.warning(
                  'تم حظر العملية',
                  permissionMode === 'readonly'
                    ? 'وضع القراءة فقط يمنع العمليات الحساسة التي طلبها AI.'
                    : 'إعدادات الصلاحيات تمنع هذه العملية في مساحة العمل الحالية.'
                );
                addLog('حظر صلاحيات AI', aiAction + ' - ' + String(pendingApproval.resource));
                setPendingApproval(null);
                return;
              }
              const result: any = await window.ulabDesktop.aiApprove(aiRequestId, false);
              if (!result?.success) {
                notifications.error('فشل التنفيذ', result?.error?.message || 'تعذر تنفيذ العملية بعد الموافقة');
                addLog('فشل موافقة AI', String(pendingApproval.resource));
                return;
              }
              addLog('موافقة AI', `${pendingApproval.type} - ${pendingApproval.resource}`);
              notifications.success('تم التنفيذ', pendingApproval.description);
              setPendingApproval(null);
              return;
            }
            addLog('موافقة', `${pendingApproval.type} - ${pendingApproval.resource}`);
            notifications.success('تمت الموافقة', pendingApproval.description);
            setPendingApproval(null);
          }}
          onDeny={async () => {
            const aiRequestId = pendingApproval.details?.approvalId;
            if (aiRequestId && window.ulabDesktop?.aiReject) {
              await window.ulabDesktop.aiReject(aiRequestId);
            }
            addLog('رفض AI', `${pendingApproval.type} - ${pendingApproval.resource}`);
            notifications.warning('تم الرفض', pendingApproval.description);
            setPendingApproval(null);
          }}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Status Bar */}
      <footer className="h-7 border-t border-[#2a2a3a] flex items-center px-4 gap-4 text-[10px] text-[#64748b] flex-shrink-0 bg-[#111118]">
        <span
          className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
          onClick={() => setShowAgentStatusModal(true)}
          title="انقر لعرض وإدارة اتصال Local Agent"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${
            agentConnection.status === 'connected' ? 'bg-green-400' :
            agentConnection.status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          {agentConnection.status === 'connected' ? 'Agent Connected' :
           agentConnection.status === 'connecting' ? 'Connecting...' :
           'Disconnected'}
        </span>
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-green-400" />
          Security: Active
        </span>
        {selectedFile && (
          <span className="flex items-center gap-1">
            <File className="w-3 h-3" />
            {selectedFile}
          </span>
        )}
        <span className="mr-auto flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {permissionMode === 'readonly' ? 'وضع القراءة' : permissionMode === 'assisted' ? 'بمساعدة' : 'وكيل'}
        </span>
        <span>ULAB 3.10.3</span>
        <span className="hidden sm:flex items-center gap-2 text-[#4a5568]">
          <span className="px-1 rounded bg-[#252530] text-[9px]">Ctrl+O</span> فتح
          <span className="px-1 rounded bg-[#252530] text-[9px]">Ctrl+F</span> بحث
          <span className="px-1 rounded bg-[#252530] text-[9px]">Ctrl+1</span> Bridge&nbsp;&nbsp;<span className="px-1 rounded bg-[#252530] text-[9px]">Ctrl+2</span> Context
        </span>
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-green-400" />
          محلي
        </span>
      </footer>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        mode={permissionMode}
        onModeChange={(m) => { setPermissionMode(m); addLog('تغيير الصلاحية', m); }}
      />

      {/* Legal & Privacy Modal */}
      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />

      {/* Local Agent Status & Sandbox Modal */}
      <CurrentLocalAgentStatusModal
        isOpen={showAgentStatusModal}
        onClose={() => setShowAgentStatusModal(false)}
      />
    </div>
  );
}
