# ULAB Architecture

## Overview

Universal Local AI Bridge (ULAB) is a privacy-first local bridge connecting web-based AI chatbots with the user's local computer and projects.

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S COMPUTER                           │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Browser    │      │    Local     │      │  Local   │ │
│  │  Extension   │◄────►│   Agent      │◄────►│  Files   │ │
│  │  (Phase 2)   │      │  (Phase 2)   │      │          │ │
│  └──────┬───────┘      └──────────────┘      └──────────┘ │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │ (User copies context)
          ▼
┌─────────────────────────────────────────────────────────────┐
│              WEB AI (User's Choice)                          │
│                                                              │
│   ChatGPT • Gemini • Claude • Qwen • DeepSeek • ...        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Current Implementation (Phase 1 - Web Dashboard)

The current implementation is a **Web Dashboard** that runs in the browser and provides:

- ✅ File System Access API integration (Chrome/Edge)
- ✅ Local project indexing
- ✅ Smart context engine
- ✅ ULP Protocol implementation
- ✅ Prompt generation for 10+ AI providers
- ✅ Permission system
- ✅ Local memory
- ✅ Diff viewer
- ✅ Task history
- ✅ Security validation

### What Works Now

1. **File System Access**: Users can select local folders using `showDirectoryPicker()`
2. **Project Indexing**: Files are indexed locally in the browser
3. **Context Extraction**: Smart algorithm finds relevant files
4. **Prompt Generation**: Creates optimized prompts for each AI provider
5. **Privacy**: All processing happens locally in the browser

### What Requires Phase 2

1. **Chrome Extension**: Needs separate manifest.json and service worker
2. **Local Agent**: Needs Node.js application with native messaging
3. **Advanced Git**: Needs actual git binary access
4. **Terminal**: Needs actual shell execution
5. **Browser Automation**: Needs extension content scripts

## Architecture Layers

### Layer 1: Core Protocol (ULP)

```typescript
// Universal Local Protocol
interface ULPAction {
  id: string;
  action: 'files.read' | 'files.write' | 'project.context' | ...;
  params: Record<string, any>;
  timestamp: number;
  origin: 'ai' | 'user' | 'system';
  risk: 'low' | 'medium' | 'high';
}
```

**Location**: `src/utils/ulpProtocol.ts`

**Responsibilities**:
- Define all available actions
- Parse AI responses for actions
- Validate action structure
- Classify risk levels

### Layer 2: Security Engine

```typescript
interface SecurityCheck {
  validatePath(path: string, allowedRoot: string): boolean;
  validateCommand(command: string, allowlist: string[]): boolean;
  checkPermissions(action: ULPAction, permissions: PermissionConfig): boolean;
  detectPromptInjection(input: string): boolean;
}
```

**Location**: `src/utils/securityEngine.ts`

**Responsibilities**:
- Path traversal prevention
- Command allowlist/blocklist
- Permission validation
- Prompt injection detection
- Risk classification

### Layer 3: File System Access

```typescript
interface FileSystemAdapter {
  selectDirectory(): Promise<FileSystemDirectoryHandle>;
  readDirectory(handle: FileSystemDirectoryHandle): Promise<FileNode[]>;
  readFile(handle: FileSystemFileHandle): Promise<string>;
  writeFile(handle: FileSystemFileHandle, content: string): Promise<void>;
}
```

**Location**: `src/utils/fileSystem.ts`

**Responsibilities**:
- Browser File System Access API wrapper
- Directory traversal
- File reading/writing
- Respect .gitignore

**Current Implementation**: Uses browser's `showDirectoryPicker()` API

**Phase 2 Enhancement**: Local Agent will provide native file system access

### Layer 4: Context Engine

```typescript
interface ContextEngine {
  extractContext(query: string, index: ProjectIndex): ContextResult;
  scoreFile(file: FileNode, keywords: string[]): number;
  expandKeywords(keywords: string[]): string[];
}
```

**Location**: `src/utils/contextEngine.ts`

**Responsibilities**:
- Keyword extraction from queries
- File relevance scoring
- Context size optimization
- Smart file selection

### Layer 5: Prompt Generator

```typescript
interface PromptGenerator {
  generateSystemPrompt(config: PromptConfig): string;
  generateQuickPrompt(context: ContextResult, query: string): string;
  getProviderConfig(provider: AIProvider): ProviderConfig;
}
```

**Location**: `src/utils/promptGenerator.ts`

**Responsibilities**:
- Generate provider-specific prompts
- Optimize for each AI's strengths
- Include project context
- Format for copy-paste workflow

### Layer 6: Permission System

```typescript
interface PermissionEngine {
  checkPermission(action: ULPAction): PermissionResult;
  requestApproval(action: ULPAction): Promise<boolean>;
  updatePermissions(config: PermissionConfig): void;
}
```

**Location**: `src/components/PermissionCenter.tsx`

**Responsibilities**:
- Project-specific permissions
- Path-based rules
- Action-based rules
- Approval workflow

### Layer 7: Local Memory

```typescript
interface LocalMemory {
  store(entry: MemoryEntry): void;
  retrieve(projectId: string): MemoryEntry[];
  generateContext(projectId: string): string;
}
```

**Location**: `src/utils/localMemory.ts`

**Responsibilities**:
- Store project-specific knowledge
- Remember decisions and rules
- Provide context to AI
- Persist in localStorage

### Layer 8: UI Components

**Location**: `src/components/`

**Responsibilities**:
- User interface
- Interaction handling
- State management
- Visual feedback

## Data Flow

### Flow A: User Asks Question

```
1. User types question in Chat Panel
   ↓
2. Context Engine extracts relevant files
   ↓
3. Prompt Generator creates optimized prompt
   ↓
4. User copies prompt
   ↓
5. User pastes into ChatGPT/Gemini/Claude
   ↓
6. AI responds with analysis
```

### Flow B: AI Proposes Changes

```
1. AI responds with code changes
   ↓
2. User copies AI response
   ↓
3. User pastes into Agent Mode Panel
   ↓
4. ULP Protocol parses response
   ↓
5. Security Engine validates actions
   ↓
6. Permission Engine checks permissions
   ↓
7. Approval Modal shows diff
   ↓
8. User approves/rejects
   ↓
9. Changes applied locally
```

### Flow C: File System Access

```
1. User clicks "Open Folder"
   ↓
2. Browser shows directory picker
   ↓
3. User selects project folder
   ↓
4. File System Access API grants access
   ↓
5. Project Engine indexes files
   ↓
6. File tree appears in UI
```

## Security Model

### Principle: Least Privilege

- Default deny for all operations
- Explicit user approval required
- Path restrictions enforced
- Command allowlists
- No silent execution

### Validation Pipeline

```
AI Output
  ↓
Schema Validation (is it valid JSON?)
  ↓
Origin Validation (where did it come from?)
  ↓
Permission Check (is it allowed?)
  ↓
Path Validation (is it within project?)
  ↓
Risk Classification (how dangerous?)
  ↓
User Approval (when required)
  ↓
Execution
  ↓
Audit Log
```

### Blocked by Default

- Access outside project directory
- Credential files (.env, .pem, etc.)
- System directories
- Destructive commands
- Network operations
- Registry/system modifications

## Privacy Model

### Principle: Local-First

- All processing in browser
- No data sent to our servers
- No telemetry by default
- User controls what AI sees
- Local storage only

### What We Don't Do

- ❌ Upload files to cloud
- ❌ Store user data on servers
- ❌ Collect telemetry
- ❌ Require registration
- ❌ Use paid APIs

### What We Do

- ✅ Process locally in browser
- ✅ Use File System Access API
- ✅ Store in localStorage
- ✅ User copies to AI
- ✅ Free forever

## Extension Architecture (Phase 2)

### Chrome Extension Structure

```
extension/
├── manifest.json
├── background/
│   └── service-worker.ts
├── sidepanel/
│   ├── panel.html
│   └── panel.tsx
├── content/
│   └── content-script.ts
├── adapters/
│   ├── chatgpt.ts
│   ├── gemini.ts
│   ├── deepseek.ts
│   └── generic.ts
└── native-messaging/
    └── agent-bridge.ts
```

### Local Agent Structure

```
agent/
├── src/
│   ├── index.ts
│   ├── filesystem/
│   │   ├── reader.ts
│   │   └── writer.ts
│   ├── search/
│   │   └── indexer.ts
│   ├── git/
│   │   └── git-operations.ts
│   ├── terminal/
│   │   └── executor.ts
│   ├── security/
│   │   └── validator.ts
│   └── protocol/
│       └── ulp-handler.ts
├── package.json
└── tsconfig.json
```

### Communication Flow

```
Browser Extension
  ↓ (Chrome Native Messaging)
Local Agent
  ↓ (Node.js fs module)
File System
```

## Provider Adapter Architecture

### Interface

```typescript
interface AIProviderAdapter {
  // Detection
  detect(): boolean;
  getProviderName(): string;
  
  // Interaction
  injectInstructions(instructions: string): void;
  readAssistantOutput(): string;
  sendContext(context: string): void;
  
  // Action Detection
  detectAction(output: string): ULPAction | null;
  
  // UI Integration
  getSelectors(): ProviderSelectors;
}
```

### Implementation Strategy

1. **Generic Adapter**: Works with any AI via copy-paste
2. **ChatGPT Adapter**: Optimized for chat.openai.com
3. **Gemini Adapter**: Optimized for gemini.google.com
4. **DeepSeek Adapter**: Optimized for chat.deepseek.com
5. **Claude Adapter**: Optimized for claude.ai
6. **Others**: As needed

### Isolation Principle

Provider-specific DOM selectors are isolated in separate files:

```
adapters/
├── chatgpt/
│   ├── selectors.ts  // DOM selectors
│   └── adapter.ts    // Logic
├── gemini/
│   ├── selectors.ts
│   └── adapter.ts
└── ...
```

When a provider changes their UI, only their `selectors.ts` needs updating.

## Future Enhancements

### Phase 2: Chrome Extension

- [ ] Manifest V3 setup
- [ ] Side panel UI
- [ ] Content scripts for AI sites
- [ ] Native messaging to Local Agent
- [ ] Provider adapters

### Phase 3: Local Agent

- [ ] Node.js application
- [ ] Native file system access
- [ ] Git integration
- [ ] Terminal execution
- [ ] Secure communication

### Phase 4: Advanced Features

- [ ] Browser automation
- [ ] Application launching
- [ ] macOS/Linux support
- [ ] Desktop dashboard
- [ ] Team collaboration

## Technology Stack

### Current (Phase 1)

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **File Access**: File System Access API
- **Storage**: localStorage
- **Icons**: Lucide React
- **Animation**: Framer Motion

### Future (Phase 2+)

- **Extension**: Chrome Manifest V3
- **Agent**: Node.js + TypeScript
- **Communication**: Chrome Native Messaging
- **Git**: Simple-git or nodegit
- **Terminal**: node-pty or child_process

## Testing Strategy

### Unit Tests

- Protocol parsing
- Security validation
- Path restrictions
- Permission checks
- Context extraction
- Prompt generation

### Integration Tests

- File system operations
- Extension messaging
- Agent communication
- Provider adapters

### Security Tests

- Path traversal attempts
- Command injection
- Prompt injection
- Unauthorized access
- Malformed input

## Performance Considerations

### Browser Limitations

- File System Access API requires user gesture
- Limited to Chrome/Edge
- No background processing
- localStorage size limits (~5-10MB)

### Optimization Strategies

- Lazy load files
- Index incrementally
- Cache search results
- Debounce expensive operations
- Virtual scrolling for large trees

## Conclusion

ULAB Phase 1 provides a solid foundation with:

- ✅ Working web dashboard
- ✅ Real file system access
- ✅ Smart context engine
- ✅ Security validation
- ✅ Privacy-first design
- ✅ Extensible architecture

Phase 2 will add:

- 🔲 Chrome Extension
- 🔲 Local Agent
- 🔲 Native messaging
- 🔲 Advanced Git
- 🔲 Terminal access

The architecture is designed to scale from a web dashboard to a full desktop solution while maintaining privacy and security.
