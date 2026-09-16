import { useEffect, useRef, useState } from 'react';
import { Terminal as TermIcon, Play, Square, Trash2, AlertTriangle } from 'lucide-react';
import type { ExecutionResult } from '../utils/localAgent';

interface TerminalEntry {
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: string;
}

interface TerminalPanelProps {
  permissionMode: string;
  connected: boolean;
  onExecuteCommand: (command: string, args?: string[], approved?: boolean) => Promise<{ success: boolean; data?: ExecutionResult; error?: { message: string } }>;
}

/*
  'npm test': `PASS  src/auth/login.test.ts
  âœ“ should validate email (5ms)
  âœ“ should hash password (3ms)
  âœ“ should create session (8ms)

PASS  src/api/users.test.ts
  âœ“ should fetch all users (12ms)
  âœ“ should create user (7ms)

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Time:        1.234s`,
  'npm run build': `> vite build
âœ“ 1720 modules transformed.
dist/index.html          1.46 kB
dist/assets/index.css    38.96 kB â”‚ gzip: 7.33 kB
dist/assets/index.js     351.01 kB â”‚ gzip: 107.79 kB
âœ“ built in 6.08s`,
  'git status': `On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   src/auth/login.ts
        modified:   src/api/routes.ts

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   src/components/Dashboard.tsx
        modified:   src/database/connection.ts
        modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/utils/newHelper.ts`,
  'ls': `src/
  auth/
  api/
  components/
  database/
  App.tsx
  main.tsx
  index.css
public/
package.json
tsconfig.json
README.md`,
  'pwd': '/home/user/projects/demo-project',
  'node --version': 'v20.10.0',
  'npm --version': '10.2.3',
  'help': `Available commands:
  npm test      - Run tests
  npm run build - Build project
  git status    - Show git status
  ls            - List files
  pwd           - Print working directory
  node --version - Node version
  npm --version  - npm version
  clear         - Clear terminal
  help          - Show this help`,
};

*/

export default function TerminalPanel({ permissionMode, connected, onExecuteCommand }: TerminalPanelProps) {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { type: 'info', content: 'ULAB Terminal v0.1 â€” Ø§ÙƒØªØ¨ "help" Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø£ÙˆØ§Ù…Ø± Ø§Ù„Ù…ØªØ§Ø­Ø©', timestamp: new Date().toLocaleTimeString('ar-EG') }
  ]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  const addEntry = (type: TerminalEntry['type'], content: string) => {
    setEntries(prev => [...prev, { type, content, timestamp: new Date().toLocaleTimeString('ar-EG') }]);
  };

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    addEntry('command', `$ ${cmd}`);
    
    if (cmd.trim() === 'clear') {
      setEntries([]);
      return;
    }
    if (cmd.trim() === 'help') {
      addEntry('output', 'ULAB Terminal â€” Ø§Ù„Ø£ÙˆØ§Ù…Ø± ØªÙ…Ø± Ø¹Ø¨Ø± Local Agent Ø§Ù„Ø¢Ù…Ù†.\n\n  Ø§ÙƒØªØ¨ Ø£ÙŠ Ø£Ù…Ø± Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡ Ù…Ù† Ø¯Ø§Ø®Ù„ Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¹Ù…Ù„.\n  npm test      - ØªØ´ØºÙŠÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª\n  npm run build - Ø¨Ù†Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹\n  git status    - Ø­Ø§Ù„Ø© Git\n  clear         - Ù…Ø³Ø­ Ø§Ù„Ø·Ø±ÙÙŠØ©\n  help          - Ø¹Ø±Ø¶ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©');
      return;
    }

    if (permissionMode === 'readonly') {
      addEntry('error', 'âš ï¸ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø­Ø§Ù„ÙŠ: Ù‚Ø±Ø§Ø¡Ø© ÙÙ‚Ø·. ØºÙŠÙ‘Ø± Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ© Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ø£ÙˆØ§Ù…Ø±.');
      return;
    }
    if (!connected) {
      addEntry('error', 'âš ï¸ Ø§Ù„ÙˆÙƒÙŠÙ„ Ø§Ù„Ù…Ø­Ù„ÙŠ ØºÙŠØ± Ù…ØªØµÙ„. Ø§ØªØµÙ„ Ø¨Ø§Ù„Ù€ Local Agent Ø£ÙˆÙ„Ù‹Ø§.');
      return;
    }

    setIsRunning(true);
    try {
      const trimmed = cmd.trim();
      const [command, ...args] = trimmed.split(/\s+/);
      const result = await onExecuteCommand(command, args, true);
      if (result.success && result.data) {
        const execution = result.data;
        const output = [execution.stdout, execution.stderr ? `[stderr]\n${execution.stderr}` : '']
          .filter(Boolean).join('\n');
        addEntry(execution.success ? 'output' : 'error', output || `Exit code: ${execution.exitCode}`);
      } else {
        addEntry('error', result.error?.message || 'ÙØ´Ù„ ØªÙ†ÙÙŠØ° Ø§Ù„Ø£Ù…Ø±.');
      }
    } catch (error: any) {
      addEntry('error', error?.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªÙ†ÙÙŠØ°.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-[#2a2a3a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TermIcon className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          {isRunning && <span className="text-[10px] text-yellow-400 animate-pulse">Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªÙ†ÙÙŠØ°...</span>}
          <button onClick={() => setEntries([])} className="p-1 rounded hover:bg-[#252530] text-[#94a3b8]" title="Ù…Ø³Ø­">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 bg-[#0a0a0f] font-mono text-xs">
        {entries.map((entry, i) => (
          <div key={i} className="mb-1.5">
            {entry.type === 'command' && (
              <span className="text-green-400">{entry.content}</span>
            )}
            {entry.type === 'output' && (
              <pre className="text-[#e2e8f0] whitespace-pre-wrap">{entry.content}</pre>
            )}
            {entry.type === 'error' && (
              <span className="text-red-400 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-wrap">{entry.content}</span>
              </span>
            )}
            {entry.type === 'info' && (
              <span className="text-[#64748b] italic">{entry.content}</span>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-[#2a2a3a] flex gap-2">
        <span className="text-green-400 text-xs font-mono py-1">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={isRunning ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªÙ†ÙÙŠØ°...' : 'Ø§ÙƒØªØ¨ Ø£Ù…Ø±Ù‹Ø§...'}
          disabled={isRunning}
          className="flex-1 bg-transparent text-xs text-white font-mono placeholder:text-[#64748b] focus:outline-none disabled:opacity-50"
          dir="ltr"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isRunning}
          className="p-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
        >
          {isRunning ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
