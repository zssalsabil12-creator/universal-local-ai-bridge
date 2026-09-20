// Enhanced Project Index with metadata and incremental updates

import { FileNode, getExtension } from './fileSystem';

export interface FileMetadata {
  path: string;
  name: string;
  extension: string;
  size: number;
  language: string;
  depth: number;
  isIgnored: boolean;
  isSensitive: boolean;
  lastModified: number;
  lineCount?: number;
  hasImports: boolean;
  imports: string[];
  symbols: string[];
}

export interface ProjectIndexV2 {
  rootName: string;
  rootPath: string;
  totalFiles: number;
  totalDirs: number;
  totalSize: number;
  files: FileNode[];
  metadata: Map<string, FileMetadata>;
  extensions: Record<string, number>;
  languages: Record<string, number>;
  indexedAt: number;
  lastUpdatedAt: number;
  config: ProjectConfig;
}

export interface ProjectConfig {
  ignorePatterns: string[];
  sensitivePatterns: string[];
  importantFiles: string[];
  alwaysInclude: string[];
  projectType: string;
}

// Fallback config for lightweight indexes built without a ProjectConfig
export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  ignorePatterns: ['node_modules', 'dist', 'build', '.git'],
  sensitivePatterns: ['.env', '.pem', '.key'],
  importantFiles: ['package.json', 'tsconfig.json', 'README.md'],
  alwaysInclude: [],
  projectType: 'unknown',
};

// Language detection based on file extensions
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  'ts': 'typescript',
  'tsx': 'typescript',
  'js': 'javascript',
  'jsx': 'javascript',
  'py': 'python',
  'rb': 'ruby',
  'go': 'go',
  'rs': 'rust',
  'java': 'java',
  'kt': 'kotlin',
  'swift': 'swift',
  'cpp': 'cpp',
  'c': 'c',
  'h': 'c',
  'hpp': 'cpp',
  'cs': 'csharp',
  'php': 'php',
  'html': 'html',
  'css': 'css',
  'scss': 'scss',
  'less': 'less',
  'json': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'toml',
  'md': 'markdown',
  'txt': 'text',
  'sql': 'sql',
  'sh': 'shell',
  'bash': 'shell',
  'zsh': 'shell',
  'dockerfile': 'docker',
  'xml': 'xml',
};

// Sensitive file patterns
const SENSITIVE_PATTERNS = [
  /\.env$/,
  /\.env\.local$/,
  /\.env\..*$/,
  /\.pem$/,
  /\.key$/,
  /private.*key/i,
  /credential/i,
  /secret/i,
  /password/i,
  /token/i,
  /\.ssh/,
  /\.aws/,
  /id_rsa/,
  /id_dsa/,
];

// Project type detection
const PROJECT_INDICATORS: Record<string, string[]> = {
  'typescript': ['tsconfig.json', 'package.json'],
  'javascript': ['package.json'],
  'python': ['requirements.txt', 'pyproject.toml', 'setup.py'],
  'rust': ['Cargo.toml'],
  'go': ['go.mod'],
  'java': ['pom.xml', 'build.gradle'],
  'ruby': ['Gemfile'],
  'php': ['composer.json'],
};

// Common source directories
const SOURCE_DIRS = [
  'src', 'app', 'lib', 'components', 'services',
  'api', 'tests', 'test', 'public', 'assets',
];

export function detectLanguage(extension: string): string {
  return EXTENSION_TO_LANGUAGE[extension] || 'unknown';
}

export function isSensitiveFile(path: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(path));
}

export function detectProjectType(files: FileNode[]): string {
  const fileNames = new Set(files.map(f => f.name));
  
  for (const [type, indicators] of Object.entries(PROJECT_INDICATORS)) {
    if (indicators.some(indicator => fileNames.has(indicator))) {
      return type;
    }
  }
  
  return 'unknown';
}

export function calculateDepth(path: string): number {
  return path.split('/').length - 1;
}

// Extract imports from TypeScript/JavaScript files
export function extractImports(content: string, language: string): string[] {
  const imports: string[] = [];
  
  if (language === 'typescript' || language === 'javascript') {
    // Match import statements
    const importRegex = /import\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Match require statements
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }
  
  return imports;
}

// Extract symbols (functions, classes, interfaces) from code
export function extractSymbols(content: string, language: string): string[] {
  const symbols: string[] = [];
  
  if (language === 'typescript' || language === 'javascript') {
    // Match function declarations
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      symbols.push(match[1]);
    }
    
    // Match class declarations
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      symbols.push(match[1]);
    }
    
    // Match interface declarations
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      symbols.push(match[1]);
    }
    
    // Match type declarations
    const typeRegex = /(?:export\s+)?type\s+(\w+)/g;
    while ((match = typeRegex.exec(content)) !== null) {
      symbols.push(match[1]);
    }
  }
  
  return symbols;
}

// Count lines in content
export function countLines(content: string): number {
  return content.split('\n').length;
}

// Create metadata for a file
export async function createFileMetadata(
  node: FileNode,
  content?: string
): Promise<FileMetadata> {
  const extension = getExtension(node.name);
  const language = detectLanguage(extension);
  const depth = calculateDepth(node.path);
  const isSensitive = isSensitiveFile(node.path);
  
  let lineCount: number | undefined;
  let hasImports = false;
  let imports: string[] = [];
  let symbols: string[] = [];
  
  if (content && !isSensitive) {
    lineCount = countLines(content);
    imports = extractImports(content, language);
    hasImports = imports.length > 0;
    symbols = extractSymbols(content, language);
  }
  
  return {
    path: node.path,
    name: node.name,
    extension,
    size: node.size || 0,
    language,
    depth,
    isIgnored: node.isIgnored || false,
    isSensitive,
    lastModified: Date.now(),
    lineCount,
    hasImports,
    imports,
    symbols,
  };
}

// Create metadata for a file (synchronous, without content analysis)
export function createFileMetadataSync(node: FileNode): FileMetadata {
  const extension = getExtension(node.name);
  return {
    path: node.path,
    name: node.name,
    extension,
    size: node.size || 0,
    language: detectLanguage(extension),
    depth: calculateDepth(node.path),
    isIgnored: node.isIgnored || false,
    isSensitive: isSensitiveFile(node.path),
    lastModified: Date.now(),
    hasImports: false,
    imports: [],
    symbols: [],
  };
}

// Build enhanced project index
export async function buildProjectIndexV2(
  rootName: string,
  rootPath: string,
  files: FileNode[],
  config: ProjectConfig
): Promise<ProjectIndexV2> {
  const metadata = new Map<string, FileMetadata>();
  const extensions: Record<string, number> = {};
  const languages: Record<string, number> = {};
  let totalSize = 0;
  let totalDirs = 0;
  
  // Flatten file tree and collect metadata
  const flattenFiles = (nodes: FileNode[], parentPath: string = ''): FileNode[] => {
    const result: FileNode[] = [];
    
    for (const node of nodes) {
      if (node.type === 'file') {
        result.push(node);
        
        // Collect statistics
        const ext = node.extension || '';
        extensions[ext] = (extensions[ext] || 0) + 1;
        
        const lang = detectLanguage(ext);
        languages[lang] = (languages[lang] || 0) + 1;
        
        totalSize += node.size || 0;
      } else {
        totalDirs++;
        if (node.children) {
          result.push(...flattenFiles(node.children, node.path));
        }
      }
    }
    
    return result;
  };
  
  const flatFiles = flattenFiles(files);
  
  // Create metadata for each file
  for (const file of flatFiles) {
    const meta = await createFileMetadata(file);
    metadata.set(file.path, meta);
  }
  
  return {
    rootName,
    rootPath,
    totalFiles: flatFiles.length,
    totalDirs,
    totalSize,
    files,
    metadata,
    extensions,
    languages,
    indexedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    config,
  };
}

// Incremental update - update only changed files
export async function updateProjectIndex(
  index: ProjectIndexV2,
  changedFiles: FileNode[]
): Promise<ProjectIndexV2> {
  const updatedIndex = { ...index };
  
  for (const file of changedFiles) {
    if (file.type === 'file') {
      const meta = await createFileMetadata(file);
      updatedIndex.metadata.set(file.path, meta);
    }
  }
  
  updatedIndex.lastUpdatedAt = Date.now();
  
  return updatedIndex;
}

// Get files by language
export function getFilesByLanguage(
  index: ProjectIndexV2,
  language: string
): FileMetadata[] {
  const files: FileMetadata[] = [];
  
  for (const meta of index.metadata.values()) {
    if (meta.language === language) {
      files.push(meta);
    }
  }
  
  return files;
}

// Get files by extension
export function getFilesByExtension(
  index: ProjectIndexV2,
  extension: string
): FileMetadata[] {
  const files: FileMetadata[] = [];
  
  for (const meta of index.metadata.values()) {
    if (meta.extension === extension) {
      files.push(meta);
    }
  }
  
  return files;
}

// Get important files
export function getImportantFiles(index: ProjectIndexV2): FileMetadata[] {
  const files: FileMetadata[] = [];
  
  for (const pattern of index.config.importantFiles) {
    for (const meta of index.metadata.values()) {
      if (meta.path.includes(pattern) || meta.name === pattern) {
        files.push(meta);
      }
    }
  }
  
  return files;
}

// Get source files
export function getSourceFiles(index: ProjectIndexV2): FileMetadata[] {
  const files: FileMetadata[] = [];
  
  for (const meta of index.metadata.values()) {
    if (SOURCE_DIRS.some(dir => meta.path.startsWith(dir + '/'))) {
      files.push(meta);
    }
  }
  
  return files;
}
