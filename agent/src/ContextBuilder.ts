import { WorkspaceManager } from './WorkspaceManager';
import { PathGuard } from './PathGuard';

export interface ContextOptions {
  taskDescription?: string;
  explicitFiles?: string[];
  includeGitDiff?: boolean;
  maxTokensEstimate?: number;
}

export interface BuiltContext {
  files: Array<{ path: string; content: string; size: number }>;
  excludedSecrets: string[];
  totalCharacters: number;
  gitDiffSnippet?: string;
  projectOverview: {
    rootName: string;
    detectedTypes: string[];
  };
}

export class ContextBuilder {
  private workspace: WorkspaceManager;
  private guard: PathGuard;

  constructor(workspace: WorkspaceManager) {
    this.workspace = workspace;
    this.guard = workspace.getGuard();
  }

  /**
   * Smartly assembles context while strictly excluding sensitive files, node_modules, and binaries
   */
  public async buildContext(options: ContextOptions = {}): Promise<BuiltContext> {
    const rootName = this.guard.getWorkspaceRoot().split(/[\\/]/).pop() || 'workspace';
    const filesToInclude = options.explicitFiles || [];
    const collectedFiles: Array<{ path: string; content: string; size: number }> = [];
    const excludedSecrets: string[] = [];

    // Auto-discover key entry points if no explicit list provided
    const filesToRead = new Set<string>(filesToInclude);
    if (filesToRead.size === 0) {
      try {
        const topFiles = await this.workspace.listFiles('.', false, 2);
        for (const file of topFiles) {
          if (!file.isDirectory) {
            const lower = file.name.toLowerCase();
            if (
              lower === 'package.json' ||
              lower === 'readme.md' ||
              lower === 'cargo.toml' ||
              lower === 'pyproject.toml' ||
              lower.startsWith('tsconfig')
            ) {
              filesToRead.add(file.relativePath);
            }
          }
        }
      } catch {
        // Continue with minimal context
      }
    }

    let charCount = 0;
    const maxChars = (options.maxTokensEstimate || 32000) * 3.5;

    for (const relPath of filesToRead) {
      if (this.guard.isSensitive(relPath)) {
        excludedSecrets.push(relPath);
        continue;
      }

      // Strictly exclude ignored/build directories: node_modules, .git, dist, build, etc.
      const norm = relPath.replace(/\\/g, '/').toLowerCase();
      const segments = norm.split('/');
      const isIgnored = segments.some(
        (seg) =>
          this.guard.isIgnoredDir(seg) ||
          seg === '.git' ||
          seg === 'node_modules' ||
          seg === 'dist' ||
          seg === 'build' ||
          seg === 'out' ||
          seg === 'target'
      );
      if (isIgnored) {
        continue;
      }

      try {
        const fileData = await this.workspace.readFile(relPath);
        if (charCount + fileData.content.length > maxChars) {
          // Truncate or cap
          const remaining = Math.max(0, maxChars - charCount);
          if (remaining > 500) {
            collectedFiles.push({
              path: fileData.path,
              content: fileData.content.slice(0, remaining) + '\n... [Context truncated to protect limits]',
              size: fileData.size,
            });
          }
          break;
        }

        collectedFiles.push(fileData);
        charCount += fileData.content.length;
      } catch (err: any) {
        // Skip unreadable files
      }
    }

    return {
      files: collectedFiles,
      excludedSecrets,
      totalCharacters: charCount,
      projectOverview: {
        rootName,
        detectedTypes: ['local-workspace'],
      },
    };
  }
}
