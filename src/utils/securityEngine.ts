// Security Engine - Real security validation for all operations
// This is NOT fake security - it actually validates paths, commands, and inputs

export interface SecurityResult {
  allowed: boolean;
  reason?: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
}

// ============ PATH SECURITY ============

// Dangerous path patterns
const DANGEROUS_PATH_PATTERNS = [
  // Path traversal
  /\.\.\//,
  /\.\.\\/,
  /\/\.\.\//,
  /\\\.\.\\/,
  // System directories (Windows)
  /^C:\\Windows/i,
  /^C:\\Program Files/i,
  /^C:\\ProgramData/i,
  /^C:\\\$Recycle/i,
  /^C:\\Recovery/i,
  /^C:\\System Volume/i,
  // System directories (Unix)
  /^\/etc\//,
  /^\/proc\//,
  /^\/sys\//,
  /^\/dev\//,
  /^\/boot\//,
  /^\/root\//,
  /^\/var\/log\//,
  // User sensitive directories
  /\/\.ssh\//,
  /\/\.gnupg\//,
  /\/\.aws\//,
  /\/\.config\/gcloud\//,
];

// Sensitive file patterns
const SENSITIVE_FILE_PATTERNS = [
  // Credentials
  /\.env(\.local)?$/,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /\.keystore$/,
  // Secrets
  /secrets?\.(json|yaml|yml|toml)$/i,
  /credentials?\.(json|yaml|yml|toml)$/i,
  // Private keys
  /id_rsa$/,
  /id_dsa$/,
  /id_ecdsa$/,
  /id_ed25519$/,
  // Config with secrets
  /firebase\.json$/,
  /service-account.*\.json$/i,
  // Database
  /\.sqlite$/,
  /\.db$/,
  // Certificates
  /certificate.*\.(pem|crt)$/i,
];

export function validatePath(
  path: string,
  projectRoot: string,
  options: {
    allowSensitive?: boolean;
    allowOutside?: boolean;
  } = {}
): SecurityResult {
  // Normalize path
  const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
  const normalizedRoot = projectRoot.replace(/\\/g, '/').toLowerCase();

  // Check for path traversal
  if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
    return {
      allowed: false,
      reason: 'Path traversal detected',
      risk: 'critical',
      requiresApproval: true,
    };
  }

  // Check dangerous patterns
  for (const pattern of DANGEROUS_PATH_PATTERNS) {
    if (pattern.test(path)) {
      return {
        allowed: false,
        reason: `Access to system/sensitive directory blocked: ${pattern}`,
        risk: 'critical',
        requiresApproval: true,
      };
    }
  }

  // Check if path is within project root
  if (!options.allowOutside) {
    const isWithinProject = normalizedPath.startsWith(normalizedRoot);
    if (!isWithinProject) {
      return {
        allowed: false,
        reason: 'Path is outside the project directory',
        risk: 'high',
        requiresApproval: true,
      };
    }
  }

  // Check sensitive files
  if (!options.allowSensitive) {
    for (const pattern of SENSITIVE_FILE_PATTERNS) {
      if (pattern.test(path)) {
        return {
          allowed: false,
          reason: `Access to sensitive file blocked: ${path}`,
          risk: 'high',
          requiresApproval: true,
        };
      }
    }
  }

  return {
    allowed: true,
    risk: 'low',
    requiresApproval: false,
  };
}

// ============ COMMAND SECURITY ============

// Safe commands (no approval needed)
const SAFE_COMMANDS = [
  'ls', 'dir', 'pwd', 'cd',
  'cat', 'type', 'head', 'tail',
  'wc', 'find', 'grep',
  'echo', 'print',
  'git status', 'git diff', 'git log', 'git branch',
  'npm test', 'npm run test',
  'npm run build', 'npm run lint',
  'npm run typecheck',
  'yarn test', 'yarn build',
  'pnpm test', 'pnpm build',
  'node --version', 'npm --version',
  'python --version', 'pip --version',
];

// Commands requiring approval
const APPROVAL_COMMANDS = [
  'npm install', 'npm i',
  'yarn install', 'yarn add',
  'pnpm install', 'pnpm add',
  'git commit', 'git push', 'git pull',
  'git merge', 'git rebase',
  'git checkout', 'git switch',
  'rm', 'del', 'rmdir',
  'mv', 'move', 'cp', 'copy',
  'mkdir', 'md',
  'touch',
  'chmod', 'chown',
  'pip install',
  'apt', 'apt-get',
  'brew',
];

// Blocked commands (never allowed)
const BLOCKED_COMMANDS = [
  // Destructive system operations
  'format',
  'diskpart',
  'fdisk',
  'mkfs',
  'dd if=',
  // Security bypasses
  'sudo',
  'su ',
  'runas',
  'powershell -exec bypass',
  'set-executionpolicy',
  // Network operations
  'curl',
  'wget',
  'ssh',
  'scp',
  'ftp',
  'nc ',
  'netcat',
  // Credential access
  'cat /etc/shadow',
  'cat /etc/passwd',
  'type sam',
  'reg export',
  // Malware-like
  'eval(',
  'exec(',
  'os.system(',
  'subprocess.',
  'child_process',
];

export function validateCommand(
  command: string,
  options: {
    customAllowlist?: string[];
    customBlocklist?: string[];
  } = {}
): SecurityResult {
  const normalizedCmd = command.trim().toLowerCase();

  // Check custom blocklist first
  if (options.customBlocklist) {
    for (const blocked of options.customBlocklist) {
      if (normalizedCmd.includes(blocked.toLowerCase())) {
        return {
          allowed: false,
          reason: `Command matches custom blocklist: ${blocked}`,
          risk: 'critical',
          requiresApproval: true,
        };
      }
    }
  }

  // Check blocked commands
  for (const blocked of BLOCKED_COMMANDS) {
    if (normalizedCmd.includes(blocked.toLowerCase())) {
      return {
        allowed: false,
        reason: `Command is blocked: ${blocked}`,
        risk: 'critical',
        requiresApproval: true,
      };
    }
  }

  // Check safe commands
  for (const safe of SAFE_COMMANDS) {
    if (normalizedCmd.startsWith(safe.toLowerCase())) {
      return {
        allowed: true,
        risk: 'low',
        requiresApproval: false,
      };
    }
  }

  // Check custom allowlist
  if (options.customAllowlist) {
    for (const allowed of options.customAllowlist) {
      if (normalizedCmd.startsWith(allowed.toLowerCase())) {
        return {
          allowed: true,
          risk: 'low',
          requiresApproval: false,
        };
      }
    }
  }

  // Check approval commands
  for (const approval of APPROVAL_COMMANDS) {
    if (normalizedCmd.startsWith(approval.toLowerCase())) {
      return {
        allowed: true,
        reason: 'Command requires approval',
        risk: 'medium',
        requiresApproval: true,
      };
    }
  }

  // Unknown command - require approval
  return {
    allowed: true,
    reason: 'Unknown command - requires approval',
    risk: 'medium',
    requiresApproval: true,
  };
}

// ============ PROMPT INJECTION DETECTION ============

const INJECTION_PATTERNS = [
  // Common injection patterns
  /ignore previous instructions/i,
  /disregard all prior/i,
  /you are now/i,
  /new role:/i,
  /system prompt:/i,
  /<\|im_start\|>/,
  /<\|im_end\|>/,
  /\[INST\]/,
  /\[\/INST\]/,
  /### instruction:/i,
  /### response:/i,
  // Hidden commands
  /```local-action[\s\S]*?```/i,
  /\[ULP:[\s\S]*?\]/i,
  /@ulp\(/i,
  // Encoding attempts
  /\\x[0-9a-f]{2}/i,
  /\\u[0-9a-f]{4}/i,
  /&#x[0-9a-f]+;/i,
];

export function detectPromptInjection(input: string): SecurityResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        allowed: false,
        reason: `Potential prompt injection detected: ${pattern}`,
        risk: 'high',
        requiresApproval: true,
      };
    }
  }

  return {
    allowed: true,
    risk: 'low',
    requiresApproval: false,
  };
}

// ============ ACTION VALIDATION ============

export interface ULPActionValidation {
  action: string;
  params: Record<string, any>;
}

export function validateAction(
  action: ULPActionValidation,
  projectRoot: string,
  permissions: Record<string, boolean>
): SecurityResult {
  // Check if action is known
  const knownActions = [
    'files.list', 'files.read', 'files.write', 'files.create',
    'files.delete', 'files.move', 'files.search',
    'project.search', 'project.context', 'project.tree',
    'git.status', 'git.diff', 'git.log',
    'terminal.run',
    'browser.open',
  ];

  if (!knownActions.includes(action.action)) {
    return {
      allowed: false,
      reason: `Unknown action: ${action.action}`,
      risk: 'high',
      requiresApproval: true,
    };
  }

  // Check permissions
  const permissionMap: Record<string, string> = {
    'files.read': 'readFiles',
    'files.list': 'readFiles',
    'files.search': 'readFiles',
    'files.write': 'writeFiles',
    'files.create': 'writeFiles',
    'files.delete': 'deleteFiles',
    'files.move': 'writeFiles',
    'project.search': 'readFiles',
    'project.context': 'readFiles',
    'project.tree': 'readFiles',
    'git.status': 'accessGit',
    'git.diff': 'accessGit',
    'git.log': 'accessGit',
    'terminal.run': 'runTerminal',
    'browser.open': 'browserAccess',
  };

  const requiredPermission = permissionMap[action.action];
  if (requiredPermission && !permissions[requiredPermission]) {
    return {
      allowed: false,
      reason: `Permission denied: ${requiredPermission}`,
      risk: 'medium',
      requiresApproval: true,
    };
  }

  // Validate path if present
  if (action.params.path) {
    const pathValidation = validatePath(action.params.path, projectRoot);
    if (!pathValidation.allowed) {
      return pathValidation;
    }
  }

  // Validate command if present
  if (action.params.command) {
    const cmdValidation = validateCommand(action.params.command);
    if (!cmdValidation.allowed) {
      return cmdValidation;
    }
    return cmdValidation;
  }

  // Determine risk based on action type
  const riskMap: Record<string, 'low' | 'medium' | 'high'> = {
    'files.read': 'low',
    'files.list': 'low',
    'files.search': 'low',
    'project.search': 'low',
    'project.context': 'low',
    'project.tree': 'low',
    'git.status': 'low',
    'git.diff': 'low',
    'git.log': 'low',
    'files.write': 'medium',
    'files.create': 'medium',
    'files.move': 'medium',
    'files.delete': 'high',
    'terminal.run': 'medium',
    'browser.open': 'medium',
  };

  const risk = riskMap[action.action] || 'medium';

  return {
    allowed: true,
    risk,
    requiresApproval: risk !== 'low',
  };
}

// ============ CONTENT SECURITY ============

export function validateFileContent(content: string, filename: string): SecurityResult {
  // Check for embedded secrets
  const secretPatterns = [
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
    /ghp_[a-zA-Z0-9]{36}/, // GitHub Personal Token
    /sk-[a-zA-Z0-9]{32,}/, // OpenAI API Key
    /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, // Private keys
    /password\s*[:=]\s*['"][^'"]+['"]/i, // Hardcoded passwords
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i, // API keys
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      return {
        allowed: false,
        reason: `Potential secret detected in ${filename}`,
        risk: 'high',
        requiresApproval: true,
      };
    }
  }

  return {
    allowed: true,
    risk: 'low',
    requiresApproval: false,
  };
}

// ============ SECURITY AUDIT LOG ============

export interface AuditEntry {
  timestamp: number;
  action: string;
  resource: string;
  result: 'allowed' | 'blocked' | 'approved';
  reason?: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

const AUDIT_LOG_KEY = 'ulab-security-audit';

export function logAudit(entry: Omit<AuditEntry, 'timestamp'>): void {
  try {
    const log = getAuditLog();
    log.unshift({ ...entry, timestamp: Date.now() });
    // Keep only last 1000 entries
    const trimmed = log.slice(0, 1000);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

export function getAuditLog(): AuditEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_LOG_KEY);
}
