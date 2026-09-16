import * as path from 'path';
import * as fs from 'fs';
import { SecurityCheckResult } from './types';

/**
 * ULAB Path Security Guard
 * 
 * Enforces strict WORKSPACE-FIRST + SANDBOX-FIRST principle:
 * 1. Rejects null bytes, encoded traversals (%2e%2e, %2f, %5c, double encoded)
 * 2. Cross-platform detection of arbitrary OS absolute paths (Windows drives C:\, D:\, POSIX /, UNC \\)
 * 3. Resolves relative paths strictly against workspaceRoot
 * 4. Windows drive boundary and case-insensitive canonical checks
 * 5. Symlink, Junction, and Reparse-point breakout protection (including dangling symlinks)
 * 6. Nonexistent parent validation for write operations
 * 7. Default blocklist for sensitive secret files (.env, .env.*, credentials.*, secrets.*, *.pem, *.key, SSH, Cloud)
 */
export class PathGuard {
  private workspaceRoot: string;
  private canonicalWorkspaceRoot: string;
  private workspaceDrive: string | null = null;

  // Sensitive patterns: secrets and credentials protected by default
  private static readonly SENSITIVE_FILE_PATTERNS: RegExp[] = [
    /^\.env(\..+)?$/i,
    /^(credentials|secrets)(\..+)?$/i,
    /^.*(credential|secret).*\.(json|ya?ml|toml|ini|env|txt|xml)$/i,
    /\.(pem|key|p12|pfx|keystore|crt)$/i,
    /^(id_rsa|id_dsa|id_ecdsa|id_ed25519|authorized_keys|known_hosts)(\..+)?$/i,
    /^(service-account.*|client_secret.*|gcp-.*)\.(json|ya?ml)$/i,
    /^\.npmrc$/i,
    /^\.netrc$/i,
    /^\.dockercfg$/i,
    /^git-credentials$/i,
  ];

  private static readonly SENSITIVE_DIR_PATTERNS: RegExp[] = [
    /(^|[/\\])\.ssh([/\\]|$)/i,
    /(^|[/\\])\.aws([/\\]|$)/i,
    /(^|[/\\])\.azure([/\\]|$)/i,
    /(^|[/\\])\.gcloud([/\\]|$)/i,
    /(^|[/\\])\.gnupg([/\\]|$)/i,
  ];

  // Ignored / excluded heavy internal directories
  private static readonly IGNORED_DIRS: Set<string> = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '.cache',
    'target',
    'venv',
    '.venv',
    '__pycache__',
  ]);

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
    try {
      this.canonicalWorkspaceRoot = fs.realpathSync.native
        ? fs.realpathSync.native(this.workspaceRoot)
        : fs.realpathSync(this.workspaceRoot);
    } catch {
      this.canonicalWorkspaceRoot = this.workspaceRoot;
    }

    const driveMatch = this.workspaceRoot.match(/^([a-zA-Z]):[/\\]/);
    if (driveMatch) {
      this.workspaceDrive = driveMatch[1].toUpperCase();
    }
  }

  public getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }

  public getCanonicalWorkspaceRoot(): string {
    return this.canonicalWorkspaceRoot;
  }

  /**
   * Check if a directory name is in the default ignored list (e.g. node_modules, .git)
   */
  public isIgnoredDir(name: string): boolean {
    return PathGuard.IGNORED_DIRS.has(name.toLowerCase());
  }

  /**
   * Check if a filepath is classified as a sensitive secret
   * Covers .env, .env.*, credentials.*, secrets.*, *.pem, *.key, SSH keys, cloud credentials
   */
  public isSensitive(targetPath: string): boolean {
    const norm = targetPath.replace(/\\/g, '/');
    const base = path.basename(norm);

    // Check directory path segments (.ssh, .aws, etc.)
    for (const dirPat of PathGuard.SENSITIVE_DIR_PATTERNS) {
      if (dirPat.test(norm)) return true;
    }

    // Check file patterns
    for (const filePat of PathGuard.SENSITIVE_FILE_PATTERNS) {
      if (filePat.test(base)) return true;
    }

    return false;
  }

  /**
   * Recursively decode URI percent-encoding up to 3 layers to prevent nested traversal bypasses
   */
  private decodeSafely(raw: string): string {
    let decoded = raw;
    for (let i = 0; i < 3; i++) {
      if (!decoded.includes('%')) break;
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch {
        // Malformed URI encoding is suspicious
        break;
      }
    }
    return decoded;
  }

  /**
   * Central security gate for resolving and validating any file/dir path.
   * Rejects path traversal, drive switching, symlink/junction breakout, encoded escapes,
   * absolute OS paths outside workspace, and protected secrets.
   */
  public validate(
    targetPath: string,
    options: { forWrite?: boolean; allowSensitive?: boolean } = {}
  ): SecurityCheckResult {
    const requestId = `sec-${Date.now()}`;

    if (!targetPath || typeof targetPath !== 'string') {
      return {
        allowed: false,
        error: {
          code: 'INVALID_PATH',
          message: 'Path must be a non-empty string',
          requestId,
        },
      };
    }

    // 1. Null byte detection
    if (targetPath.includes('\0') || targetPath.includes('%00')) {
      return {
        allowed: false,
        error: {
          code: 'INVALID_PATH',
          message: 'Null byte injection detected in path',
          requestId,
        },
      };
    }

    // 2. Decode percent-encoding and check raw traversal patterns
    const decoded = this.decodeSafely(targetPath);
    const decodedNorm = decoded.replace(/\\/g, '/');

    // Check for traversal sequences
    if (
      decodedNorm.includes('/../') ||
      decodedNorm.startsWith('../') ||
      decodedNorm.endsWith('/..') ||
      decodedNorm === '..' ||
      decodedNorm.includes('/..\\') ||
      decodedNorm.includes('\\../') ||
      decodedNorm.includes('\\..\\')
    ) {
      return {
        allowed: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Path traversal (../) is strictly prohibited',
          requestId,
        },
      };
    }

    // 3. Cross-platform detection of arbitrary OS absolute paths and drive switching
    const isWindows = process.platform === 'win32';
    const isWinDrive = /^[a-zA-Z]:[/\\]/.test(decoded);
    const isUNC = /^\\\\[^/\\]+/.test(decoded) || /^\/\/[^/\\]+/.test(decoded);
    const isPosixAbsolute = decoded.startsWith('/');

    if (isUNC) {
      // Reject arbitrary UNC shares outside workspace
      const normWorkspace = this.workspaceRoot.replace(/\\/g, '/').toLowerCase();
      const normUNC = decoded.replace(/\\/g, '/').toLowerCase();
      if (!normUNC.startsWith(normWorkspace)) {
        return {
          allowed: false,
          error: {
            code: 'ACCESS_DENIED',
            message: `Access denied: Arbitrary UNC path is outside active workspace (${targetPath})`,
            requestId,
          },
        };
      }
    }

    if (isWinDrive) {
      const targetDrive = decoded[0].toUpperCase();
      if (!this.workspaceDrive || targetDrive !== this.workspaceDrive) {
        return {
          allowed: false,
          error: {
            code: 'ACCESS_DENIED',
            message: `Access denied: Drive switching attempt detected (${targetDrive}: != ${this.workspaceDrive || 'POSIX'})`,
            requestId,
          },
        };
      }
    }

    // 4. Resolve against workspace root
    let resolvedPath: string;
    if (path.isAbsolute(decoded)) {
      resolvedPath = path.resolve(decoded);
    } else if (isWinDrive) {
      // If on POSIX system but received Windows drive path (e.g. cross-platform test or AI hallucination)
      resolvedPath = path.resolve(decoded);
    } else {
      resolvedPath = path.resolve(this.workspaceRoot, decoded);
    }

    // 5. Normalization and basic prefix check
    const normResolved = path.normalize(resolvedPath);
    const normRoot = path.normalize(this.workspaceRoot);

    const compResolved = isWindows ? normResolved.toLowerCase() : normResolved;
    const compRoot = isWindows ? normRoot.toLowerCase() : normRoot;

    const rootWithSep = compRoot.endsWith(path.sep) ? compRoot : compRoot + path.sep;
    if (compResolved !== compRoot && !compResolved.startsWith(rootWithSep)) {
      return {
        allowed: false,
        error: {
          code: 'ACCESS_DENIED',
          message: `Access denied: Target path is outside active workspace (${targetPath})`,
          requestId,
        },
      };
    }

    // 6. Symlink / Junction / Reparse-point breakout verification
    let realPathToCheck = normResolved;

    // Use lstatSync to detect symbolic links even if target doesn't exist
    let isSymlink = false;
    try {
      const lstat = fs.lstatSync(normResolved);
      isSymlink = lstat.isSymbolicLink();
    } catch {
      // File doesn't exist yet
    }

    if (isSymlink) {
      try {
        // Resolve symlink target
        const realTarget = fs.realpathSync.native
          ? fs.realpathSync.native(normResolved)
          : fs.realpathSync(normResolved);

        const compCanonicalResolved = isWindows ? realTarget.toLowerCase() : realTarget;
        const compCanonicalRoot = isWindows ? this.canonicalWorkspaceRoot.toLowerCase() : this.canonicalWorkspaceRoot;
        const canonicalRootWithSep = compCanonicalRoot.endsWith(path.sep)
          ? compCanonicalRoot
          : compCanonicalRoot + path.sep;

        if (
          compCanonicalResolved !== compCanonicalRoot &&
          !compCanonicalResolved.startsWith(canonicalRootWithSep)
        ) {
          return {
            allowed: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'Access denied: Symlink or reparse point resolves outside active workspace boundary',
              requestId,
            },
          };
        }
        realPathToCheck = realTarget;
      } catch (err: any) {
        // Target doesn't exist (dangling symlink) - resolve readlink destination
        try {
          const rawLink = fs.readlinkSync(normResolved);
          const resolvedLinkTarget = path.isAbsolute(rawLink)
            ? path.resolve(rawLink)
            : path.resolve(path.dirname(normResolved), rawLink);
          const compLink = isWindows ? resolvedLinkTarget.toLowerCase() : resolvedLinkTarget;
          const compRoot = isWindows ? this.canonicalWorkspaceRoot.toLowerCase() : this.canonicalWorkspaceRoot;
          const rootWithSep = compRoot.endsWith(path.sep) ? compRoot : compRoot + path.sep;

          if (compLink !== compRoot && !compLink.startsWith(rootWithSep)) {
            return {
              allowed: false,
              error: {
                code: 'ACCESS_DENIED',
                message: 'Access denied: Dangling symlink points outside active workspace boundary',
                requestId,
              },
            };
          }
        } catch {
          return {
            allowed: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'Access denied: Suspicious or unresolvable reparse point',
              requestId,
            },
          };
        }
      }
    } else if (fs.existsSync(normResolved)) {
      try {
        const canonicalResolved = fs.realpathSync.native
          ? fs.realpathSync.native(normResolved)
          : fs.realpathSync(normResolved);

        const compCanonicalResolved = isWindows
          ? canonicalResolved.toLowerCase()
          : canonicalResolved;
        const compCanonicalRoot = isWindows
          ? this.canonicalWorkspaceRoot.toLowerCase()
          : this.canonicalWorkspaceRoot;
        const canonicalRootWithSep = compCanonicalRoot.endsWith(path.sep)
          ? compCanonicalRoot
          : compCanonicalRoot + path.sep;

        if (
          compCanonicalResolved !== compCanonicalRoot &&
          !compCanonicalResolved.startsWith(canonicalRootWithSep)
        ) {
          return {
            allowed: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'Access denied: Target path resolves outside active workspace boundary',
              requestId,
            },
          };
        }

        realPathToCheck = canonicalResolved;
      } catch (err: any) {
        return {
          allowed: false,
          error: {
            code: 'ACCESS_DENIED',
            message: `Failed to verify file realpath: ${err?.message || 'unknown'}`,
            requestId,
          },
        };
      }
    }

    // 7. Nonexistent parent path validation for write / create
    if (options.forWrite) {
      let currentDir = path.dirname(normResolved);
      while (currentDir && currentDir !== path.dirname(currentDir)) {
        let parentLstat: fs.Stats | null = null;
        try {
          parentLstat = fs.lstatSync(currentDir);
        } catch {
          // Doesn't exist yet, continue up
        }

        if (parentLstat) {
          try {
            const canonicalDir = fs.realpathSync.native
              ? fs.realpathSync.native(currentDir)
              : fs.realpathSync(currentDir);
            const compCanonicalDir = isWindows ? canonicalDir.toLowerCase() : canonicalDir;
            const compCanonicalRoot = isWindows ? this.canonicalWorkspaceRoot.toLowerCase() : this.canonicalWorkspaceRoot;
            const canonicalRootWithSep = compCanonicalRoot.endsWith(path.sep)
              ? compCanonicalRoot
              : compCanonicalRoot + path.sep;

            if (
              compCanonicalDir !== compCanonicalRoot &&
              !compCanonicalDir.startsWith(canonicalRootWithSep)
            ) {
              return {
                allowed: false,
                error: {
                  code: 'ACCESS_DENIED',
                  message: 'Access denied: Target directory resolves via symlink outside active workspace',
                  requestId,
                },
              };
            }
          } catch {
            return {
              allowed: false,
              error: {
                code: 'ACCESS_DENIED',
                message: 'Failed to inspect parent directory path',
                requestId,
              },
            };
          }
          break;
        }
        currentDir = path.dirname(currentDir);
      }
    }

    // 8. Sensitive secret protection
    if (!options.allowSensitive && this.isSensitive(normResolved)) {
      return {
        allowed: false,
        error: {
          code: 'ACCESS_DENIED',
          message: `Access denied: Target file is classified as a sensitive secret (${path.basename(normResolved)})`,
          requestId,
        },
      };
    }

    // 9. Safe relative path within workspace
    const relativeNormalized = path
      .relative(this.workspaceRoot, normResolved)
      .replace(/\\/g, '/');

    return {
      allowed: true,
      resolvedRealPath: realPathToCheck,
      relativeNormalizedPath: relativeNormalized || '.',
    };
  }
}
