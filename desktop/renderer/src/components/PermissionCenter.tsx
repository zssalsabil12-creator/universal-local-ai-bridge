import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Lock, Unlock,
  Folder, FileCode, Terminal as TermIcon, GitBranch, Eye, Edit,
  Trash2, Plus, Minus
} from 'lucide-react';

export type PermissionLevel = 'allow' | 'ask' | 'deny';

export interface PermissionRule {
  id: string;
  resource: string;
  type: 'path' | 'tool' | 'action';
  level: PermissionLevel;
  description: string;
}

export interface PermissionConfig {
  projectId: string;
  defaultLevel: PermissionLevel;
  rules: PermissionRule[];
  globalPermissions: {
    readFiles: PermissionLevel;
    writeFiles: PermissionLevel;
    deleteFiles: PermissionLevel;
    runTerminal: PermissionLevel;
    accessGit: PermissionLevel;
    accessCredentials: PermissionLevel;
    accessSystemDirs: PermissionLevel;
  };
}

interface PermissionCenterProps {
  config: PermissionConfig;
  onUpdate: (config: PermissionConfig) => void;
}

const DEFAULT_CONFIG: PermissionConfig = {
  projectId: '',
  defaultLevel: 'ask',
  rules: [],
  globalPermissions: {
    readFiles: 'allow',
    writeFiles: 'ask',
    deleteFiles: 'deny',
    runTerminal: 'ask',
    accessGit: 'allow',
    accessCredentials: 'deny',
    accessSystemDirs: 'deny',
  },
};

function normalizeResource(value: string): string {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
}

function escapeRegex(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function globMatches(pattern: string, resource: string): boolean {
  const normalizedPattern = normalizeResource(pattern);
  const expression = normalizedPattern.split('**').map(part =>
    part.split('*').map(escapeRegex).join('[^/]*')
  ).join('.*');
  return new RegExp('^' + expression + '$', 'i').test(normalizeResource(resource));
}

export function resolvePermission(
  config: PermissionConfig,
  permission: keyof PermissionConfig['globalPermissions'],
  resource = '',
): PermissionLevel {
  let level = config.globalPermissions[permission] ?? config.defaultLevel;
  const normalized = normalizeResource(resource);
  let winnerScore = -1;

  for (const rule of config.rules) {
    const matches =
      (rule.type === 'path' && globMatches(rule.resource, normalized)) ||
      (rule.type === 'tool' && normalizeResource(rule.resource) === normalized) ||
      (rule.type === 'action' && normalizeResource(rule.resource) === normalized);
    if (!matches) continue;
    const score = normalizeResource(rule.resource).replace(/[?*]/g, '').length;
    if (score >= winnerScore) {
      level = rule.level;
      winnerScore = score;
    }
  }

  return level;
}

export default function PermissionCenter({ config, onUpdate }: PermissionCenterProps) {
  const { language } = useLanguage();
  const ui = (ar: string, en: string) => language === 'en' ? en : ar;
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<PermissionRule>>({
    resource: '',
    type: 'path',
    level: 'allow',
    description: '',
  });

  const permissionIcons: Record<string, any> = {
    readFiles: Eye,
    writeFiles: Edit,
    deleteFiles: Trash2,
    runTerminal: TermIcon,
    accessGit: GitBranch,
    accessCredentials: Lock,
    accessSystemDirs: Folder,
  };

  const permissionLabels: Record<string, string> = {
    readFiles: ui('قراءة الملفات', 'Read files'),
    writeFiles: ui('كتابة الملفات', 'Write files'),
    deleteFiles: ui('حذف الملفات', 'Delete files'),
    runTerminal: ui('تشغيل Terminal', 'Run terminal'),
    accessGit: ui('الوصول لـ Git', 'Git access'),
    accessCredentials: ui('الوصول للبيانات الحساسة', 'Sensitive data access'),
    accessSystemDirs: ui('الوصول لمجلدات النظام', 'System directory access'),
  };

  const levelColors: Record<PermissionLevel, string> = {
    allow: 'text-green-400 bg-green-500/10 border-green-500/20',
    ask: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    deny: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const levelIcons: Record<PermissionLevel, any> = {
    allow: CheckCircle,
    ask: AlertTriangle,
    deny: XCircle,
  };

  const handleUpdateGlobal = (key: keyof PermissionConfig['globalPermissions'], level: PermissionLevel) => {
    onUpdate({
      ...config,
      globalPermissions: {
        ...config.globalPermissions,
        [key]: level,
      },
    });
  };

  const handleAddRule = () => {
    if (!newRule.resource?.trim()) return;
    
    const rule: PermissionRule = {
      id: `rule-${Date.now()}`,
      resource: newRule.resource!,
      type: newRule.type as any,
      level: newRule.level as PermissionLevel,
      description: newRule.description || '',
    };
    
    onUpdate({
      ...config,
      rules: [...config.rules, rule],
    });
    
    setNewRule({ resource: '', type: 'path', level: 'allow', description: '' });
    setIsAddingRule(false);
  };

  const handleDeleteRule = (id: string) => {
    onUpdate({
      ...config,
      rules: config.rules.filter(r => r.id !== id),
    });
  };

  const cycleLevel = (level: PermissionLevel): PermissionLevel => {
    if (level === 'allow') return 'ask';
    if (level === 'ask') return 'deny';
    return 'allow';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a3a] flex items-center gap-2">
        <Shield className="w-4 h-4 text-green-400" />
        <span className="text-sm font-bold">{ui('مركز الصلاحيات', 'Permission Center')}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Global Permissions */}
        <div>
          <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-indigo-400" />
            {ui('الصلاحيات العامة', 'Global permissions')}
          </h3>
          <div className="space-y-1.5">
            {Object.entries(config.globalPermissions).map(([key, level]) => {
              const Icon = permissionIcons[key] || Shield;
              const LevelIcon = levelIcons[level];
              
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span className="text-xs text-[#e2e8f0]">{permissionLabels[key]}</span>
                  </div>
                  <button
                    onClick={() => handleUpdateGlobal(key as any, cycleLevel(level))}
                    className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] transition-colors ${levelColors[level]}`}
                  >
                    <LevelIcon className="w-3 h-3" />
                    {level === 'allow' ? ui('سماح', 'Allow') : level === 'ask' ? ui('سؤال', 'Ask') : ui('رفض', 'Deny')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Rules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <FileCode className="w-3 h-3 text-cyan-400" />
              {ui('قواعد مخصصة', 'Custom rules')}
            </h3>
            <button
              onClick={() => setIsAddingRule(!isAddingRule)}
              className="p-1 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
            >
              {isAddingRule ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </button>
          </div>

          {/* Add Rule Form */}
          {isAddingRule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] mb-2 space-y-2"
            >
              <input
                value={newRule.resource}
                onChange={e => setNewRule({ ...newRule, resource: e.target.value })}
                placeholder={ui('المسار أو الأداة (مثل: src/secrets/*)', 'Path or tool (e.g. src/secrets/*)')}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b]"
                dir="ltr"
              />
              <select
                value={newRule.type}
                onChange={e => setNewRule({ ...newRule, type: e.target.value as any })}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white"
              >
                <option value="path">{ui('مسار', 'Path')}</option>
                <option value="tool">{ui('أداة', 'Tool')}</option>
                <option value="action">{ui('إجراء', 'Action')}</option>
              </select>
              <select
                value={newRule.level}
                onChange={e => setNewRule({ ...newRule, level: e.target.value as PermissionLevel })}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white"
              >
                <option value="allow">{ui('سماح','Allow')}</option>
                <option value="ask">{ui('سؤال','Ask')}</option>
                <option value="deny">{ui('رفض','Deny')}</option>
              </select>
              <input
                value={newRule.description}
                onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                placeholder={ui('الوصف (اختياري)','Description (optional)')}
                className="w-full px-2 py-1.5 rounded bg-[#111118] border border-[#2a2a3a] text-xs text-white placeholder:text-[#64748b]"
                dir="auto"
              />
              <button
                onClick={handleAddRule}
                disabled={!newRule.resource?.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium disabled:opacity-50"
              >
                <CheckCircle className="w-3 h-3" />
                {ui('إضافة القاعدة','Add rule')}
              </button>
            </motion.div>
          )}

          {/* Rules List */}
          {config.rules.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[10px] text-[#64748b]">{ui('لا توجد قواعد مخصصة','No custom rules')}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {config.rules.map(rule => {
                const LevelIcon = levelIcons[rule.level];
                
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#e2e8f0] truncate font-mono" dir="ltr">
                        {rule.resource}
                      </p>
                      {rule.description && (
                        <p className="text-[9px] text-[#64748b] truncate">{rule.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] ${levelColors[rule.level]}`}>
                        <LevelIcon className="w-2.5 h-2.5 inline mr-0.5" />
                        {rule.level === 'allow' ? ui('سماح','Allow') : rule.level === 'ask' ? ui('سؤال','Ask') : ui('رفض','Deny')}
                      </span>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors text-[#64748b] hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-green-300 font-bold mb-0.5">{ui('الأمان أولاً','Security first')}</p>
              <p className="text-[9px] text-green-300/80 leading-relaxed">
                {ui('جميع العمليات الحساسة تتطلب موافقتك. لا يمكن للـ AI الوصول للبيانات الحساسة أو مجلدات النظام.','All sensitive operations require your approval. AI cannot access sensitive data or system directories.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_CONFIG };
