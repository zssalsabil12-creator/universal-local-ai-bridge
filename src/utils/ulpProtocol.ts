// ULP - Universal Local Protocol
// This is the protocol that any AI can use to interact with the user's local system

export interface ULPCommand {
  id: string;
  command: string;
  params: Record<string, any>;
  description: string;
  permission: 'read' | 'write' | 'execute';
}

export interface ULPResponse {
  success: boolean;
  data?: any;
  error?: string;
  command: string;
}

// Available ULP commands
export const ULP_COMMANDS: ULPCommand[] = [
  // File operations
  {
    id: 'files.list',
    command: 'files.list',
    params: { path: 'string', recursive: 'boolean' },
    description: 'List files in a directory',
    permission: 'read',
  },
  {
    id: 'files.read',
    command: 'files.read',
    params: { path: 'string', startLine: 'number', endLine: 'number' },
    description: 'Read file content',
    permission: 'read',
  },
  {
    id: 'files.search',
    command: 'files.search',
    params: { query: 'string', path: 'string', filePattern: 'string' },
    description: 'Search for text in files',
    permission: 'read',
  },
  {
    id: 'files.write',
    command: 'files.write',
    params: { path: 'string', content: 'string' },
    description: 'Write content to a file',
    permission: 'write',
  },
  {
    id: 'files.create',
    command: 'files.create',
    params: { path: 'string', content: 'string' },
    description: 'Create a new file',
    permission: 'write',
  },
  {
    id: 'files.delete',
    command: 'files.delete',
    params: { path: 'string' },
    description: 'Delete a file',
    permission: 'write',
  },
  // Project operations
  {
    id: 'project.tree',
    command: 'project.tree',
    params: { maxDepth: 'number' },
    description: 'Get project tree structure',
    permission: 'read',
  },
  {
    id: 'project.context',
    command: 'project.context',
    params: { query: 'string', maxFiles: 'number' },
    description: 'Extract relevant context from project',
    permission: 'read',
  },
  {
    id: 'project.stats',
    command: 'project.stats',
    params: {},
    description: 'Get project statistics',
    permission: 'read',
  },
  // Git operations
  {
    id: 'git.status',
    command: 'git.status',
    params: {},
    description: 'Get git status',
    permission: 'read',
  },
  {
    id: 'git.diff',
    command: 'git.diff',
    params: { path: 'string' },
    description: 'Get git diff for a file',
    permission: 'read',
  },
  {
    id: 'git.log',
    command: 'git.log',
    params: { limit: 'number' },
    description: 'Get git log',
    permission: 'read',
  },
  // Terminal operations
  {
    id: 'terminal.run',
    command: 'terminal.run',
    params: { command: 'string', cwd: 'string' },
    description: 'Run a terminal command',
    permission: 'execute',
  },
];

// Parse AI response to extract ULP commands
export function parseULPCommands(response: string): ULPResponse[] {
  const commands: ULPResponse[] = [];
  
  // Pattern 1: ```ulp ... ```
  const ulpBlockRegex = /```ulp\s*([\s\S]*?)```/g;
  let match;
  while ((match = ulpBlockRegex.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) {
        parsed.forEach(cmd => {
          commands.push({
            success: true,
            command: cmd.command,
            data: cmd.params,
          });
        });
      } else {
        commands.push({
          success: true,
          command: parsed.command,
          data: parsed.params,
        });
      }
    } catch (e) {
      console.error('Failed to parse ULP command:', e);
    }
  }
  
  // Pattern 2: @ulp(command, params)
  const inlineRegex = /@ulp\((\w+(?:\.\w+)*)(?:,\s*(\{[^}]*\}))?\)/g;
  while ((match = inlineRegex.exec(response)) !== null) {
    try {
      const command = match[1];
      const params = match[2] ? JSON.parse(match[2]) : {};
      commands.push({
        success: true,
        command,
        data: params,
      });
    } catch (e) {
      console.error('Failed to parse inline ULP command:', e);
    }
  }
  
  // Pattern 3: [ULP: command params]
  const bracketRegex = /\[ULP:\s*(\w+(?:\.\w+)*)\s*(.*?)\]/g;
  while ((match = bracketRegex.exec(response)) !== null) {
    commands.push({
      success: true,
      command: match[1],
      data: { raw: match[2] },
    });
  }
  
  return commands;
}

// Extract file modifications from AI response
export interface FileModification {
  path: string;
  type: 'create' | 'modify' | 'delete';
  content?: string;
  diff?: {
    before: string;
    after: string;
    changes: { type: 'add' | 'remove' | 'keep'; line: string }[];
  };
}

export function parseFileModifications(response: string): FileModification[] {
  const modifications: FileModification[] = [];
  const seenPaths = new Set<string>();

  const addMod = (path: string, content: string, type: 'create' | 'modify' = 'modify') => {
    // Clean path of quotes, backticks, asterisks, whitespace
    const cleanPath = path.replace(/[`*"':]/g, '').trim();
    if (!cleanPath || seenPaths.has(cleanPath)) return;
    seenPaths.add(cleanPath);
    modifications.push({
      path: cleanPath,
      type,
      content: content.trim(),
    });
  };

  // Pattern 1: === FILE: path/to/file.ts === (Standard ULAB / ULP format)
  const equalFileRegex = /===\s*(?:FILE|File):\s*([^\n=]+)\s*===([\s\S]*?)(?:===\s*(?:END\s*FILE|End\s*File)\s*===|(?====\s*(?:FILE|File):)|$)/gi;
  let match;
  while ((match = equalFileRegex.exec(response)) !== null) {
    let content = match[2].trim();
    // Strip markdown wrapper if enclosed in ```
    const codeBlockMatch = content.match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
    if (codeBlockMatch) {
      content = codeBlockMatch[1];
    }
    addMod(match[1], content);
  }

  // Pattern 2: ```lang:path/to/file.ts ... ```
  const langPathRegex = /```(?:\w+)?:([^\s\n]+)\s*\n([\s\S]*?)```/g;
  while ((match = langPathRegex.exec(response)) !== null) {
    addMod(match[1], match[2]);
  }

  // Pattern 3: (### / ** / File:) File: `path/to/file.ts` followed by ```code```
  const headerFileRegex = /(?:###|\*\*|##)?\s*(?:File|Path|ملف|مسار):\s*`?([^\n`*]+)`?\s*\n+```(?:\w+)?\s*\n([\s\S]*?)```/gi;
  while ((match = headerFileRegex.exec(response)) !== null) {
    addMod(match[1], match[2]);
  }

  // Pattern 4: Code fence with first line comment containing file path (// src/app.ts or # src/app.py)
  const commentPathRegex = /```(?:\w+)?\s*\n(?:\/\/|#)\s*(?:file:?\s*)?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)\s*\n([\s\S]*?)```/gi;
  while ((match = commentPathRegex.exec(response)) !== null) {
    addMod(match[1], match[2]);
  }

  // Pattern 5: ### path/to/file.ts\n```lang ... ```
  const simpleHeaderRegex = /###\s*`?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)`?\s*\n+```(?:\w+)?\s*\n([\s\S]*?)```/g;
  while ((match = simpleHeaderRegex.exec(response)) !== null) {
    addMod(match[1], match[2]);
  }

  return modifications;
}

// Generate diff between two strings
export function generateDiff(before: string, after: string): { type: 'add' | 'remove' | 'keep'; line: string }[] {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const diff: { type: 'add' | 'remove' | 'keep'; line: string }[] = [];
  
  // Simple line-by-line diff
  const maxLen = Math.max(beforeLines.length, afterLines.length);
  for (let i = 0; i < maxLen; i++) {
    const bLine = beforeLines[i];
    const aLine = afterLines[i];
    
    if (bLine === undefined) {
      diff.push({ type: 'add', line: aLine });
    } else if (aLine === undefined) {
      diff.push({ type: 'remove', line: bLine });
    } else if (bLine === aLine) {
      diff.push({ type: 'keep', line: bLine });
    } else {
      diff.push({ type: 'remove', line: bLine });
      diff.push({ type: 'add', line: aLine });
    }
  }
  
  return diff;
}
