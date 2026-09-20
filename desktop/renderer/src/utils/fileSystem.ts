// File System utilities for the Local AI Bridge
import JSZip from 'jszip';
import { createFileMetadataSync } from './projectIndex';
import type { FileMetadata } from './projectIndex';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  extension?: string;
  content?: string;
  isExpanded?: boolean;
  isIgnored?: boolean;
}

export interface ProjectIndex {
  rootName: string;
  totalFiles: number;
  totalDirs: number;
  totalSize: number;
  files: FileNode[];
  flatFiles: FileNode[];
  extensions: Record<string, number>;
  indexedAt: number;
  /** Per-file metadata used by the search engine (built by buildIndex/createDemoIndex) */
  metadata?: Map<string, FileMetadata>;
}

// Common ignore patterns
const DEFAULT_IGNORE = [
  'node_modules', '.git', 'dist', 'build', '.next',
  '__pycache__', '.venv', 'venv', '.env',
  '.DS_Store', 'Thumbs.db', '*.log',
  'coverage', '.nyc_output', '.cache',
  '.idea', '.vscode', '*.min.js', '*.min.css',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
];

export function shouldIgnore(name: string): boolean {
  return DEFAULT_IGNORE.some(pattern => {
    if (pattern.startsWith('*.')) {
      return name.endsWith(pattern.slice(1));
    }
    return name === pattern;
  });
}

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function getFileIcon(name: string, type: 'file' | 'directory'): string {
  if (type === 'directory') return '📁';
  const ext = getExtension(name);
  const iconMap: Record<string, string> = {
    'ts': '🔷', 'tsx': '🔷', 'js': '🟨', 'jsx': '🟨',
    'py': '🐍', 'rb': '💎', 'go': '🔵', 'rs': '🦀',
    'java': '☕', 'kt': '🟣', 'swift': '🍎',
    'html': '🌐', 'css': '🎨', 'scss': '🎨', 'less': '🎨',
    'json': '📋', 'yaml': '📋', 'yml': '📋', 'toml': '📋',
    'md': '📝', 'txt': '📄', 'csv': '📊',
    'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
    'sql': '🗃️', 'db': '🗃️',
    'sh': '⚙️', 'bash': '⚙️', 'zsh': '⚙️',
    'dockerfile': '🐳', 'docker': '🐳',
    'gitignore': '🚫', 'env': '🔒',
  };
  return iconMap[ext] || '📄';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function readDirectory(
  dirHandle: FileSystemDirectoryHandle,
  path: string = '',
  depth: number = 0,
  maxDepth: number = 10
): Promise<FileNode[]> {
  if (depth > maxDepth) return [];

  const nodes: FileNode[] = [];

  try {
    for await (const entry of (dirHandle as any).values()) {
      const name = entry.name;

      if (shouldIgnore(name)) continue;

      const entryPath = path ? `${path}/${name}` : name;

      if (entry.kind === 'directory') {
        const children = await readDirectory(entry as FileSystemDirectoryHandle, entryPath, depth + 1, maxDepth);
        nodes.push({
          name,
          path: entryPath,
          type: 'directory',
          children,
          isExpanded: depth < 2,
        });
      } else if (entry.kind === 'file') {
        try {
          const file = await (entry as FileSystemFileHandle).getFile();
          nodes.push({
            name,
            path: entryPath,
            type: 'file',
            size: file.size,
            extension: getExtension(name),
          });
        } catch {
          nodes.push({
            name,
            path: entryPath,
            type: 'file',
            size: 0,
            extension: getExtension(name),
          });
        }
      }
    }
  } catch (e) {
    console.error('Error reading directory:', e);
  }

  // Sort: directories first, then files
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export async function readFileContent(fileHandle: FileSystemFileHandle): Promise<string> {
  try {
    const file = await fileHandle.getFile();
    // Limit to 500KB for safety
    if (file.size > 500000) {
      return `[File too large: ${formatFileSize(file.size)}]`;
    }
    return await file.text();
  } catch {
    return '[Unable to read file]';
  }
}

export async function findFileHandle(
  dirHandle: FileSystemDirectoryHandle,
  targetPath: string
): Promise<FileSystemFileHandle | FileSystemDirectoryHandle | null> {
  const parts = targetPath.split('/');
  let current: FileSystemDirectoryHandle = dirHandle;

  for (let i = 0; i < parts.length; i++) {
    try {
      const entry = await current.getDirectoryHandle(parts[i], { create: false }).catch(() => null)
        || await current.getFileHandle(parts[i], { create: false }).catch(() => null);

      if (!entry) return null;

      if (i === parts.length - 1) return entry;
      if (entry.kind === 'directory') current = entry as FileSystemDirectoryHandle;
      else return null;
    } catch {
      return null;
    }
  }
  return null;
}

export function flattenTree(nodes: FileNode[]): FileNode[] {
  const flat: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      flat.push(node);
    }
    if (node.children) {
      flat.push(...flattenTree(node.children));
    }
  }
  return flat;
}

export function buildIndex(rootName: string, files: FileNode[]): ProjectIndex {
  const flatFiles = flattenTree(files);
  const extensions: Record<string, number> = {};
  let totalSize = 0;
  let totalDirs = 0;

  const countDirs = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'directory') {
        totalDirs++;
        if (node.children) countDirs(node.children);
      }
    }
  };
  countDirs(files);

  for (const file of flatFiles) {
    if (file.extension) {
      extensions[file.extension] = (extensions[file.extension] || 0) + 1;
    }
    totalSize += file.size || 0;
  }

  // Per-file metadata so searchProject can score files. Without this map,
  // every AI/context query on a real folder crashed the search engine.
  const metadata = new Map<string, FileMetadata>();
  for (const file of flatFiles) {
    metadata.set(file.path, createFileMetadataSync(file));
  }

  return {
    rootName,
    totalFiles: flatFiles.length,
    totalDirs,
    totalSize,
    files,
    flatFiles,
    extensions,
    metadata,
    indexedAt: Date.now(),
  };
}

export async function writeFileContent(
  dirHandle: FileSystemDirectoryHandle,
  targetPath: string,
  content: string
): Promise<boolean> {
  try {
    const parts = targetPath.split('/').filter(Boolean);
    if (parts.length === 0) return false;

    let current = dirHandle;
    // Ensure all parent directories exist
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i], { create: true });
    }

    const fileName = parts[parts.length - 1];
    const fileHandle = await current.getFileHandle(fileName, { create: true });

    // Check or request permission if available
    if ('requestPermission' in fileHandle) {
      const permission = await (fileHandle as any).requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        console.warn('Write permission not granted for', targetPath);
      }
    }

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error('Failed to write file to local disk:', targetPath, err);
    return false;
  }
}

export async function exportProjectToZip(
  files: Record<string, string>,
  rootName: string = 'ulab-project'
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(rootName) || zip;

  for (const [path, content] of Object.entries(files)) {
    folder.file(path, content);
  }

  return await zip.generateAsync({ type: 'blob' });
}
