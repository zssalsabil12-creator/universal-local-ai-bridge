import * as fs from 'fs';
import * as path from 'path';
import { PathGuard } from './PathGuard';
import { FileEntryInfo, ProposedChange } from './types';

/**
 * Computes a unified Git-style diff between original and proposed content
 */
export function generateUnifiedDiff(filePath: string, original: string, modified: string): string {
  const origLines = original ? original.split('\n') : [];
  const modLines = modified ? modified.split('\n') : [];

  const header = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -1,${origLines.length || 1} +1,${modLines.length || 1} @@`,
  ];

  const diffLines: string[] = [];
  const max = Math.max(origLines.length, modLines.length);

  for (let i = 0; i < max; i++) {
    const o = origLines[i];
    const m = modLines[i];
    if (o === undefined) {
      diffLines.push(`+ ${m}`);
    } else if (m === undefined) {
      diffLines.push(`- ${o}`);
    } else if (o !== m) {
      diffLines.push(`- ${o}`);
      diffLines.push(`+ ${m}`);
    } else {
      // unchanged context line (first few or around changes)
      if (diffLines.length < 150) {
        diffLines.push(`  ${o}`);
      }
    }
  }

  return [...header, ...diffLines].join('\n');
}

export class WorkspaceManager {
  private guard: PathGuard;
  private changeHistory: ProposedChange[] = [];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor(workspaceRoot: string) {
    this.guard = new PathGuard(workspaceRoot);
  }

  public getGuard(): PathGuard {
    return this.guard;
  }

  public getWorkspaceRoot(): string {
    return this.guard.getWorkspaceRoot();
  }

  /**
   * List files recursively or flat within directory relative to workspace root
   */
  public async listFiles(subPath: string = '.', recursive: boolean = true, maxDepth: number = 5): Promise<FileEntryInfo[]> {
    const check = this.guard.validate(subPath);
    if (!check.allowed || !check.resolvedRealPath) {
      throw new Error(check.error?.message || 'Access denied');
    }

    const targetDir = check.resolvedRealPath;
    const stat = await fs.promises.stat(targetDir);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${subPath}`);
    }

    const results: FileEntryInfo[] = [];

    const walk = async (currentDir: string, currentDepth: number) => {
      if (currentDepth > maxDepth) return;
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const entryName = entry.name;
        if (this.guard.isIgnoredDir(entryName)) continue;

        const fullPath = path.join(currentDir, entryName);
        const relPath = path.relative(this.guard.getWorkspaceRoot(), fullPath).replace(/\\/g, '/');

        // Check symlink boundary for each entry
        const isDir = entry.isDirectory();
        let size = 0;
        let mtime = Date.now();

        try {
          const s = await fs.promises.stat(fullPath);
          size = s.size;
          mtime = s.mtimeMs;
        } catch {
          // ignore broken items
          continue;
        }

        results.push({
          name: entryName,
          relativePath: relPath,
          isDirectory: isDir,
          size: isDir ? undefined : size,
          updatedAt: mtime,
        });

        if (isDir && recursive) {
          await walk(fullPath, currentDepth + 1);
        }
      }
    };

    await walk(targetDir, 1);
    return results;
  }

  /**
   * Search filenames and text within the active workspace.
   * Results are bounded and inherit all PathGuard exclusions.
   */
  public async search(query: string, maxResults: number = 50): Promise<Array<{ path: string; name: string; matches: number }>> {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const entries = await this.listFiles('.', true, 6);
    const results: Array<{ path: string; name: string; matches: number }> = [];
    for (const entry of entries) {
      if (entry.isDirectory || results.length >= maxResults) continue;
      if (this.guard.isSensitive(entry.relativePath)) continue;
      const nameMatch = entry.name.toLowerCase().includes(needle);
      let textMatches = 0;
      if (!nameMatch && (entry.size ?? 0) <= 512 * 1024) {
        try {
          const file = await this.readFile(entry.relativePath);
          const matches = file.content.toLowerCase().split(needle).length - 1;
          textMatches = matches;
        } catch {
          continue;
        }
      }
      if (nameMatch || textMatches > 0) {
        results.push({ path: entry.relativePath, name: entry.name, matches: Math.max(textMatches, nameMatch ? 1 : 0) });
      }
    }
    return results;
  }

  /**
   * Safely read a file inside the workspace
   */
  public async readFile(targetPath: string): Promise<{ content: string; path: string; size: number }> {
    const check = this.guard.validate(targetPath);
    if (!check.allowed || !check.resolvedRealPath) {
      const err = new Error(check.error?.message || 'Access denied');
      (err as any).code = check.error?.code || 'ACCESS_DENIED';
      throw err;
    }

    const realPath = check.resolvedRealPath;
    const stat = await fs.promises.stat(realPath);
    if (stat.isDirectory()) {
      throw new Error(`Cannot read a directory as a file: ${targetPath}`);
    }

    if (stat.size > WorkspaceManager.MAX_FILE_SIZE) {
      throw new Error(`File exceeds max readable size (10MB): ${stat.size} bytes`);
    }

    const content = await fs.promises.readFile(realPath, 'utf-8');
    return {
      content,
      path: check.relativeNormalizedPath || targetPath,
      size: stat.size,
    };
  }

  /**
   * Proposes a file modification and generates a diff for user approval
   */
  public async proposeChange(
    targetPath: string,
    proposedContent: string,
    reason: string
  ): Promise<ProposedChange> {
    const check = this.guard.validate(targetPath, { forWrite: true });
    if (!check.allowed || !check.resolvedRealPath) {
      const err = new Error(check.error?.message || 'Access denied');
      (err as any).code = check.error?.code || 'ACCESS_DENIED';
      throw err;
    }

    let original = '';
    const fileExists = fs.existsSync(check.resolvedRealPath);
    if (fileExists) {
      original = await fs.promises.readFile(check.resolvedRealPath, 'utf-8');
    }

    const diff = generateUnifiedDiff(check.relativeNormalizedPath || targetPath, original, proposedContent);

    const change: ProposedChange = {
      changeId: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      operation: fileExists ? 'update_file' : 'create_file',
      path: check.relativeNormalizedPath || targetPath,
      reason,
      originalContent: original,
      proposedContent,
      diff,
      requiresApproval: true,
      status: 'pending',
    };

    this.changeHistory.unshift(change);
    return change;
  }

  /**
   * Approve a pending change proposal without applying it.
   */
  public approveProposal(changeId: string): ProposedChange {
    const change = this.changeHistory.find((c) => c.changeId === changeId);
    if (!change) {
      throw new Error(`Change proposal not found: ${changeId}`);
    }
    if (change.status !== 'pending') {
      throw new Error(`Change proposal is not pending: ${change.status}`);
    }
    change.status = 'approved';
    return change;
  }

  /**
   * Reject a change proposal
   */
  public rejectProposal(changeId: string): ProposedChange {
    const change = this.changeHistory.find((c) => c.changeId === changeId);
    if (!change) {
      throw new Error(`Change proposal not found: ${changeId}`);
    }
    change.status = 'rejected';
    return change;
  }

  /**
   * Get proposal by ID
   */
  public getProposal(changeId: string): ProposedChange | undefined {
    return this.changeHistory.find((c) => c.changeId === changeId);
  }

  /**
   * Get all proposals history
   */
  public getProposals(): ProposedChange[] {
    return [...this.changeHistory];
  }

  /**
   * Applies an approved change proposal or directly writes if approved
   */
  public async applyChange(targetPath: string, content: string, changeId?: string): Promise<boolean> {
    const check = this.guard.validate(targetPath, { forWrite: true });
    if (!check.allowed || !check.resolvedRealPath) {
      const err = new Error(check.error?.message || 'Access denied');
      (err as any).code = check.error?.code || 'ACCESS_DENIED';
      throw err;
    }

    if (changeId) {
      const proposal = this.getProposal(changeId);
      if (!proposal) throw new Error(`Change proposal not found: ${changeId}`);
      if (proposal.status !== 'approved') {
        throw new Error(`Change proposal must be explicitly approved before apply (status: ${proposal.status})`);
      }
      if (proposal.path !== (check.relativeNormalizedPath || targetPath)) {
        throw new Error('Change proposal path does not match target path');
      }
      if (proposal.proposedContent !== content) {
        throw new Error('Applied content does not match the approved proposal');
      }
    }

    const targetFile = check.resolvedRealPath;
    const parentDir = path.dirname(targetFile);

    if (!fs.existsSync(parentDir)) {
      await fs.promises.mkdir(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(targetFile, content, 'utf-8');

    // Update proposal status if found
    if (changeId) {
      const prop = this.getProposal(changeId);
      if (prop) prop.status = 'applied';
    } else {
      const rel = check.relativeNormalizedPath || targetPath;
      const matchingPending = this.changeHistory.find((c) => c.path === rel && c.status === 'pending');
      if (matchingPending) matchingPending.status = 'applied';
    }

    return true;
  }

  /**
   * Safely deletes a file (requires explicit approval)
   */
  public async deleteFile(targetPath: string): Promise<boolean> {
    const check = this.guard.validate(targetPath);
    if (!check.allowed || !check.resolvedRealPath) {
      const err = new Error(check.error?.message || 'Access denied');
      (err as any).code = check.error?.code || 'ACCESS_DENIED';
      throw err;
    }

    const targetFile = check.resolvedRealPath;
    if (!fs.existsSync(targetFile)) {
      throw new Error(`File does not exist: ${targetPath}`);
    }

    const stat = await fs.promises.stat(targetFile);
    if (stat.isDirectory()) {
      await fs.promises.rm(targetFile, { recursive: true, force: true });
    } else {
      await fs.promises.unlink(targetFile);
    }

    return true;
  }
}
