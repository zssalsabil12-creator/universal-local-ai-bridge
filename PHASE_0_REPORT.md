# Phase 0 Report — Discovery, Feasibility & Architecture

## Universal Local AI Bridge (ULAB)

**Date**: 2025-01-XX  
**Status**: Discovery Complete  
**Next Phase**: Phase 1 — Project Structure & Shared Protocol

---

## 1. Environment Detected

### Current Development Environment

| Component | Version/Status | Notes |
|-----------|----------------|-------|
| **Project Type** | Web Application (React + Vite) | Existing web dashboard built |
| **Node.js** | Unknown (not directly accessible) | Cannot detect via tools |
| **npm** | Unknown (not directly accessible) | package-lock.json exists |
| **TypeScript** | 5.7.0 | ✅ Available |
| **React** | 18.2.0 | ✅ Available |
| **Vite** | 6.3.5 | ✅ Available |
| **Tailwind CSS** | 4.1.7 | ✅ Available |
| **Git** | Unknown (not directly accessible) | Cannot detect via tools |
| **Chrome** | Unknown (browser not accessible) | Cannot detect via tools |
| **Edge** | Unknown (browser not accessible) | Cannot detect via tools |

### Current Project State

**Existing Implementation**:
- ✅ Web Dashboard (React + TypeScript + Vite)
- ✅ 40+ files created
- ✅ 17 React components
- ✅ Security Engine (505 lines)
- ✅ ULP Protocol (248 lines)
- ✅ Provider Adapters (334 lines)
- ✅ Local Agent Connection Layer (273 lines)
- ✅ Context Engine (222 lines)
- ✅ File System utilities
- ✅ Local Memory system
- ✅ Prompt Generator for 10+ AI providers

**What Has Been Built**:
1. Landing page with marketing content
2. Workspace with file tree, code viewer, search
3. AI Bridge Panel (connect to 10 chatbots)
4. Agent Mode Panel (AI as local agent)
5. Local Memory Panel
6. Permission Center
7. Approval Modal with Diff
8. Task History
9. Context Builder
10. Diff Viewer (Unified/Split)
11. Git Panel (demo data)
12. Terminal Panel (simulated)
13. Settings Panel
14. Notification System
15. Keyboard Shortcuts Modal
16. Welcome Modal

**What This Is NOT**:
- ❌ This is NOT a Chrome Extension yet
- ❌ This is NOT a Local Agent yet
- ❌ This is a Web Dashboard prototype

---

## 2. Recommended Technology Stack

### Browser Extension

**Recommended Stack**:
```
Chrome Extension (Manifest V3)
├── TypeScript 5.x
├── React 18 (minimal, only for Side Panel UI)
├── Tailwind CSS 4.x (for styling)
├── Vite (for building)
├── Chrome Side Panel API
├── Chrome Native Messaging API
└── Chrome Storage API
```

**Why This Stack**:
- **TypeScript**: Type safety, better DX, catches errors early
- **React 18**: Already in use, minimal learning curve, good for complex UI
- **Tailwind CSS**: Already in use, rapid UI development
- **Vite**: Already in use, fast builds, good DX
- **Manifest V3**: Current Chrome standard, future-proof
- **Side Panel**: Persistent UI alongside AI chat pages
- **Native Messaging**: Secure communication with Local Agent

**Why NOT**:
- ❌ No Vue/Svelte/Angular (unnecessary complexity, React already chosen)
- ❌ No Electron/Tauri (overkill for MVP, browser extension is sufficient)
- ❌ No Redux/Zustand (React state sufficient for MVP)
- ❌ No GraphQL (REST-like protocol is simpler)

### Local Agent

**Recommended Stack**:
```
Local Agent (Node.js)
├── Node.js 20 LTS
├── TypeScript 5.x
├── tsx (for development)
├── simple-git (Git operations)
├── chokidar (file watching)
├── glob (file matching)
├── ignore (gitignore parsing)
└── ws (WebSocket, optional fallback)
```

**Why This Stack**:
- **Node.js 20 LTS**: Stable, widely available, good fs support
- **TypeScript**: Consistent with extension
- **simple-git**: Mature, well-tested Git wrapper
- **chokidar**: Cross-platform file watching
- **glob/ignore**: Standard tools for file matching
- **ws**: Fallback if Native Messaging has issues

**Why NOT**:
- ❌ No Rust (unnecessary complexity, Node.js sufficient)
- ❌ No Python (inconsistent with extension stack)
- ❌ No Go (unnecessary, Node.js has all needed features)
- ❌ No Electron (Local Agent is CLI/background process, not GUI)

---

## 3. Hybrid Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S COMPUTER                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    BROWSER (Chrome/Edge)                   │   │
│  │                                                            │   │
│  │  ┌────────────────────┐      ┌─────────────────────────┐ │   │
│  │  │   AI Chat Page     │      │   ULAB Extension        │ │   │
│  │  │                    │      │   (Side Panel)          │ │   │
│  │  │  ChatGPT / Gemini  │      │                         │ │   │
│  │  │  Claude / Qwen     │◄────►│  - Project Tree         │ │   │
│  │  │  DeepSeek / ...    │      │  - Context Builder      │ │   │
│  │  │                    │      │  - Permission UI        │ │   │
│  │  │  (User's choice)   │      │  - Diff Viewer          │ │   │
│  │  └────────────────────┘      │  - Task Status          │ │   │
│  │                               └──────────┬──────────────┘ │   │
│  │                                          │                 │   │
│  └──────────────────────────────────────────┼─────────────────┘   │
│                                              │                     │
│                         Chrome Native Messaging                    │
│                                              │                     │
│  ┌───────────────────────────────────────────┼──────────────────┐ │
│  │                                           ▼                   │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              LOCAL AGENT (Node.js)                       │ │ │
│  │  │                                                          │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │ │
│  │  │  │   File       │  │   Project    │  │   Security   │ │ │ │
│  │  │  │   System     │  │   Engine     │  │   Engine     │ │ │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │ │
│  │  │                                                          │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │ │
│  │  │  │   Git        │  │   Terminal   │  │   ULP        │ │ │ │
│  │  │  │   Module     │  │   Executor   │  │   Handler    │ │ │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │ │
│  │  │                                                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    LOCAL FILE SYSTEM                            │ │
│  │                                                                 │ │
│  │   D:\Projects\MyProject\                                        │ │
│  │   ├── src/                                                      │ │
│  │   ├── tests/                                                    │ │
│  │   ├── package.json                                              │ │
│  │   └── ...                                                       │ │
│  │                                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

         │ (User copies context manually OR extension injects)
         ▼

┌───────────────────────────────────────────────────────────────────────┐
│                      WEB AI (User's Choice)                            │
│                                                                       │
│   ChatGPT • Gemini • Claude • Qwen • DeepSeek • Mistral • ...       │
│                                                                       │
│   (User's existing account, no API key required from ULAB)          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Extension is the primary UI**
   - Side Panel provides persistent interface
   - Works alongside AI chat pages
   - No separate desktop app needed for MVP

2. **Local Agent is a background process**
   - No GUI (CLI/background service)
   - Communicates via Native Messaging
   - Handles filesystem, Git, terminal

3. **User controls data flow**
   - Copy-paste workflow (explicit user action)
   - OR extension injects context (with user approval)
   - No automatic data transmission

4. **Protocol is provider-independent**
   - ULP (Universal Local Protocol) abstracts AI providers
   - Adapters handle provider-specific UI
   - Core logic doesn't know about ChatGPT vs Gemini

---

## 4. Module Architecture

### Proposed Structure

```
ulab/
├── extension/              # Chrome Extension
│   ├── manifest.json
│   ├── src/
│   │   ├── background/     # Service worker
│   │   ├── sidepanel/      # Side Panel UI (React)
│   │   ├── content/        # Content scripts (minimal)
│   │   ├── adapters/       # AI provider adapters
│   │   └── utils/          # Shared utilities
│   └── public/             # Icons, assets
│
├── agent/                  # Local Agent (Node.js)
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── filesystem/     # File operations
│   │   ├── project/        # Project indexing
│   │   ├── git/            # Git operations
│   │   ├── terminal/       # Command execution
│   │   ├── security/       # Validation
│   │   └── protocol/       # ULP handler
│   └── package.json
│
├── shared/                 # Shared code
│   ├── protocol/           # ULP definitions
│   ├── types/              # TypeScript types
│   └── utils/              # Common utilities
│
├── tests/                  # Test suites
│   ├── extension/
│   ├── agent/
│   └── integration/
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md
    ├── SECURITY.md
    ├── PRIVACY.md
    └── USER_GUIDE.md
```

### Module Responsibilities

#### Extension Modules

1. **background/service-worker.ts**
   - Manages extension lifecycle
   - Handles Native Messaging with Local Agent
   - Coordinates between content scripts and side panel
   - Maintains connection state

2. **sidepanel/** (React app)
   - Main user interface
   - Project tree display
   - Context builder UI
   - Permission dialogs
   - Diff viewer
   - Settings management

3. **content/content-script.ts**
   - Minimal, only for AI page detection
   - Injects context into AI chat (when enabled)
   - Reads AI responses (when enabled)
   - Does NOT scrape or bypass security

4. **adapters/**
   - `chatgpt.ts`: ChatGPT-specific selectors and logic
   - `gemini.ts`: Gemini-specific selectors and logic
   - `deepseek.ts`: DeepSeek-specific selectors and logic
   - `generic.ts`: Fallback for unsupported providers
   - Each adapter is isolated, changes don't affect others

#### Agent Modules

1. **filesystem/**
   - Read/write files within project boundary
   - List directories
   - Search files
   - Respect .gitignore
   - Path validation

2. **project/**
   - Index project structure
   - Build file metadata
   - Incremental updates
   - Search by filename/path/content
   - Context extraction

3. **git/**
   - Git status
   - Git diff
   - Branch information
   - Commit (with approval)
   - Uses simple-git library

4. **terminal/**
   - Execute commands with allowlist
   - Block dangerous commands
   - Capture output
   - Timeout handling
   - Approval workflow

5. **security/**
   - Path validation
   - Command validation
   - Permission checking
   - Audit logging
   - Prompt injection detection

6. **protocol/**
   - Parse ULP messages
   - Route to appropriate handler
   - Validate requests
   - Send responses

#### Shared Modules

1. **protocol/**
   - ULP message definitions
   - Type definitions
   - Validation schemas
   - Used by both extension and agent

2. **types/**
   - TypeScript interfaces
   - Shared type definitions
   - Ensures consistency

3. **utils/**
   - Common utilities
   - Path manipulation
   - String helpers
   - Validation helpers

---

## 5. Local Communication Architecture

### Primary: Chrome Native Messaging

**How It Works**:
```
Extension (Service Worker)
    ↓
chrome.runtime.connectNative('com.ulab.agent')
    ↓
Native Messaging Host (Local Agent)
    ↓
stdin/stdout (JSON messages)
```

**Message Format**:
```typescript
// Request (Extension → Agent)
{
  "id": "msg-123",
  "type": "request",
  "action": "files.read",
  "params": {
    "path": "src/auth/login.ts"
  },
  "timestamp": 1234567890
}

// Response (Agent → Extension)
{
  "id": "msg-123",
  "type": "response",
  "action": "files.read",
  "result": {
    "content": "file contents..."
  },
  "timestamp": 1234567891
}
```

**Setup**:
1. Local Agent registers as native messaging host
2. Creates manifest file in Chrome's native messaging directory
3. Extension connects via `chrome.runtime.connectNative()`
4. Bidirectional JSON communication over stdin/stdout

**Security**:
- Only extension with matching ID can connect
- Messages are validated on both sides
- No network exposure
- Local-only communication

### Fallback: WebSocket (if needed)

If Native Messaging has issues on some platforms:
```
Extension
    ↓
WebSocket (ws://localhost:PORT)
    ↓
Local Agent
```

**Security**:
- Bind to localhost only (127.0.0.1)
- Random port on startup
- Token-based authentication
- No external network access

### What Requires Local Agent

| Operation | Browser Extension | Local Agent |
|-----------|-------------------|-------------|
| File System Access API | ✅ (with limitations) | ❌ |
| Read files (selected folder) | ✅ | ❌ |
| Write files (selected folder) | ✅ | ❌ |
| Git operations | ❌ | ✅ |
| Terminal execution | ❌ | ✅ |
| Project indexing (large) | ⚠️ (performance) | ✅ |
| File watching | ❌ | ✅ |
| Process management | ❌ | ✅ |

**Key Limitation**: File System Access API requires user gesture for each operation and has performance limitations for large projects. Local Agent provides unrestricted access to selected project.

---

## 6. Security Architecture

### Core Principle

**AI output is UNTRUSTED INPUT**

Every action requested by AI must pass through multiple validation layers.

### Validation Pipeline

```
AI Output (untrusted)
    ↓
[1] Schema Validation
    Is it valid JSON? Correct structure?
    ↓
[2] Origin Validation
    Where did this come from? Is it expected?
    ↓
[3] Path Validation
    Is the path within project boundary?
    No path traversal? No system directories?
    ↓
[4] Permission Check
    Is this action allowed for this project?
    Does it require approval?
    ↓
[5] Risk Classification
    Low / Medium / High / Critical
    ↓
[6] User Approval (if required)
    Show diff, explain action
    User decides: Allow / Deny
    ↓
[7] Execution
    Perform the action
    ↓
[8] Audit Log
    Record what happened
```

### Security Layers

#### Layer 1: Path Validation

**Blocked Patterns**:
```typescript
// Path traversal
../
..\
/../../etc/passwd

// System directories (Windows)
C:\Windows\
C:\Program Files\
C:\ProgramData\

// System directories (Unix)
/etc/
/proc/
/sys/
/root/

// Sensitive user directories
~/.ssh/
~/.aws/
~/.gnupg/
```

**Validation Function**:
```typescript
function validatePath(path: string, projectRoot: string): SecurityResult {
  // Normalize path
  // Check for traversal
  // Check against blocklist
  // Verify within project root
  // Return allowed/blocked with reason
}
```

#### Layer 2: Command Validation

**Allowlist (safe)**:
```
ls, dir, pwd, cd
cat, type, head, tail
git status, git diff, git log
npm test, npm run build
```

**Approval Required**:
```
npm install
git commit
git push
rm, del
```

**Blocked (never allowed)**:
```
sudo, su
format, diskpart
curl, wget, ssh
rm -rf /
```

#### Layer 3: Permission System

**Permission Levels**:
- `ALLOW`: Always allowed
- `ASK`: Requires user approval
- `DENY`: Always blocked

**Default Permissions**:
```typescript
{
  readFiles: 'ALLOW',
  writeFiles: 'ASK',
  deleteFiles: 'DENY',
  runTerminal: 'ASK',
  accessGit: 'ASK',
  accessCredentials: 'DENY',
  accessSystemDirs: 'DENY'
}
```

#### Layer 4: Sensitive File Protection

**Blocked by Default**:
```
.env, .env.local
*.pem, *.key, *.p12
id_rsa, id_dsa
secrets.json, credentials.json
*.sqlite, *.db
```

**Rationale**: These files often contain passwords, API keys, private keys. AI should not access them unless user explicitly overrides.

#### Layer 5: Prompt Injection Detection

**Patterns to Detect**:
```
ignore previous instructions
you are now
system prompt:
<|im_start|>
### instruction:
```

**Action**: Log warning, do not execute, notify user.

#### Layer 6: Audit Logging

**What Gets Logged**:
```typescript
{
  timestamp: 1234567890,
  action: 'files.read',
  resource: 'src/auth/login.ts',
  result: 'allowed',
  risk: 'low',
  origin: 'ai'
}
```

**Retention**: Last 1000 entries in localStorage.

### Security Testing Requirements

Must test:
1. Path traversal attempts (`../../../etc/passwd`)
2. System directory access (`C:\Windows\System32`)
3. Credential file access (`.env`)
4. Command injection (`rm -rf /`)
5. Prompt injection (hidden instructions)
6. Malformed JSON (invalid actions)
7. Oversized inputs (1GB file)
8. Unknown actions (`hack.system`)
9. Permission bypass attempts
10. Encoding attacks (`..%2F..%2F`)

---

## 7. Privacy Architecture

### Core Principle

**Local-First. Privacy-by-Design.**

### What Stays Local

| Data | Location | Notes |
|------|----------|-------|
| Project files | User's computer | Never uploaded |
| File metadata | Browser localStorage | Index only |
| Search queries | Browser memory | Not stored |
| AI responses | Browser memory | Not stored |
| User settings | Browser localStorage | Local only |
| Audit log | Browser localStorage | Local only |
| Project memory | Browser localStorage | Local only |

### What May Be Sent to AI Provider

**Only what user explicitly chooses to send**:
- Context prepared by ULAB (user copies it)
- User's question (user types it)
- User's follow-up questions

**ULAB does NOT automatically send**:
- ❌ Entire project
- ❌ All files
- ❌ Sensitive files
- ❌ Credentials
- ❌ Anything without user action

### No Server Required

**ULAB Core**:
- ❌ No backend server
- ❌ No database
- ❌ No user accounts
- ❌ No telemetry
- ❌ No analytics
- ❌ No data collection

**User's AI Provider**:
- ✅ User's existing ChatGPT/Gemini/Claude account
- ✅ User's existing plan (free or paid)
- ✅ Subject to that provider's privacy policy
- ⚠️ ULAB cannot control provider's policies

### Privacy Guarantees

**We Do NOT**:
- ❌ Upload your files to our servers
- ❌ Store your code anywhere
- ❌ Collect telemetry by default
- ❌ Require registration
- ❌ Read your files (we can't)
- ❌ Send data without your action

**We Do**:
- ✅ Process everything locally
- ✅ Use browser File System Access API
- ✅ Store data in localStorage (you can clear)
- ✅ Let you control what AI sees
- ✅ Provide transparency (open source)

### Technical Accuracy

**We Do NOT Claim**:
- ❌ "100% secure" (no system is)
- ❌ "100% private" (user chooses to send to AI)
- ❌ "Unhackable" (security is layered, not absolute)

**We Do Claim**:
- ✅ "Local-first" (processing happens locally)
- ✅ "Privacy-by-design" (privacy is architectural)
- ✅ "User-controlled" (you decide what to share)
- ✅ "No server required" (core works offline)

---

## 8. Smart Context Engine Design

### Problem

Large projects (3000+ files) cannot be uploaded to AI entirely. Need to send only relevant context.

### Solution: On-Demand Context Extraction

```
User Question: "Why does authentication fail?"
    ↓
[1] Keyword Extraction
    Extract: "authentication", "fail"
    ↓
[2] Keyword Expansion
    Expand: auth, login, session, token, middleware
    ↓
[3] File Search
    Search by: filename, path, content
    ↓
[4] Relevance Scoring
    Score each file based on:
    - Filename match (weight: 10)
    - Path match (weight: 5)
    - Content match (weight: 3)
    - Extension relevance (weight: 2)
    ↓
[5] File Selection
    Select top N files (e.g., 10)
    ↓
[6] Context Building
    Extract relevant sections
    Format for AI
    ↓
[7] Send to AI
    User copies context
    Pastes into ChatGPT/Gemini/etc.
```

### Implementation Strategy (MVP)

**Phase 1: Simple Search**
```typescript
// 1. Extract keywords from query
const keywords = extractKeywords("why does authentication fail");
// → ["authentication", "fail"]

// 2. Expand keywords
const expanded = expandKeywords(keywords);
// → ["auth", "login", "session", "token", ...]

// 3. Search files
const matches = projectIndex.flatFiles.filter(file => {
  return expanded.some(kw => 
    file.name.toLowerCase().includes(kw) ||
    file.path.toLowerCase().includes(kw)
  );
});

// 4. Score and rank
const scored = matches.map(file => ({
  file,
  score: calculateRelevance(file, expanded)
}));

// 5. Select top N
const selected = scored.sort((a, b) => b.score - a.score).slice(0, 10);
```

**Phase 2: Advanced Features**
- Content search (read file contents)
- Import/dependency analysis
- AST-based code understanding
- Semantic search (embeddings)

### What This Does NOT Do

**We Do NOT Claim**:
- ❌ "Bypasses AI context limits" (we don't control AI)
- ❌ "Magic AI understanding" (it's search + scoring)
- ❌ "Perfect relevance" (it's heuristic-based)

**We Do Claim**:
- ✅ "Reduces irrelevant context" (sends only related files)
- ✅ "Maximizes useful context" (prioritizes relevant files)
- ✅ "Works for large projects" (doesn't require uploading all)
- ✅ "User-controlled" (user can manually select files)

### Context Size Management

**Token Estimation**:
```typescript
// Rough estimate: 1 token ≈ 4 characters (English)
// Or: 1 token ≈ 1.3 words (English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

**Context Limits**:
- Target: < 50,000 tokens (safe for most AI)
- Configurable by user
- Warning if exceeds provider's limit

---

## 9. AI Provider Adapter Design

### Architecture

```typescript
interface AIProviderAdapter {
  // Identification
  id: string;
  name: string;
  url: string;
  
  // Detection
  detect(): boolean; // Is this the current page?
  
  // Selectors (isolated per provider)
  getSelectors(): {
    chatInput: string;
    sendButton: string;
    messageContainer: string;
    assistantMessage: string;
  };
  
  // Capabilities
  supportsSystemPrompt: boolean;
  supportsFileUpload: boolean;
  maxTokens: number;
  
  // Actions (optional, for automation)
  injectContext?(context: string): void;
  readResponse?(): string;
}
```

### Provider Isolation

**Each provider has its own file**:
```
adapters/
├── chatgpt.ts      // ChatGPT-specific selectors
├── gemini.ts       // Gemini-specific selectors
├── deepseek.ts     // DeepSeek-specific selectors
├── claude.ts       // Claude-specific selectors
└── generic.ts      // Fallback for others
```

**Why Isolation**:
- When ChatGPT changes UI, only `chatgpt.ts` needs update
- Other providers unaffected
- Easy to add new providers
- Easy to test each provider independently

### Generic Mode

**For unsupported providers**:
```typescript
const genericAdapter: AIProviderAdapter = {
  id: 'generic',
  name: 'Generic (Copy/Paste)',
  url: '*',
  detect: () => true,
  getSelectors: () => ({ /* empty */ }),
  supportsSystemPrompt: false,
  supportsFileUpload: false,
  maxTokens: 0,
  // No automation, user copies manually
};
```

**Workflow**:
1. ULAB generates context
2. User copies context
3. User opens any AI chat
4. User pastes context
5. User gets response
6. User copies response (optional)
7. User pastes back to ULAB (optional)

### What We Do NOT Do

**We Do NOT**:
- ❌ Bypass authentication
- ❌ Bypass CAPTCHA
- ❌ Bypass paywalls
- ❌ Bypass rate limits
- ❌ Use private APIs
- ❌ Impersonate official APIs
- ❌ Scrape against ToS

**We Do**:
- ✅ Use legitimate user-controlled interaction
- ✅ Work within provider's UI
- ✅ Respect provider's restrictions
- ✅ Provide fallback for unsupported providers

---

## 10. MVP Scope

### What's In MVP (Phase 1)

#### Extension
- ✅ Manifest V3 setup
- ✅ Side Panel UI (React)
- ✅ Basic modern UI (Tailwind)
- ✅ Local Agent connection status
- ✅ Project selection (folder picker)
- ✅ Project tree display
- ✅ Basic file preview
- ✅ Basic context builder (manual selection)
- ✅ Generic mode (copy/paste)

#### Local Agent
- ✅ Windows support
- ✅ Secure local connection (Native Messaging)
- ✅ Project access (selected folder)
- ✅ List files
- ✅ Read files
- ✅ Basic search (filename/path)
- ✅ Create/write files (with restrictions)
- ✅ Path validation
- ✅ Permission checking

#### Security
- ✅ Project boundary enforcement
- ✅ Path traversal prevention
- ✅ Basic permissions (allow/ask/deny)
- ✅ Approval flow for writes
- ✅ Local audit log
- ✅ Sensitive file blocking

#### Developer Features
- ✅ Project indexing (basic)
- ✅ Relevant file selection (keyword-based)
- ✅ Basic context generation
- ✅ Diff preview (before/after)

### What's NOT In MVP

**Extension**:
- ❌ ChatGPT/Gemini/DeepSeek adapters (Phase 4)
- ❌ Content script automation (Phase 4)
- ❌ Advanced UI features (Phase 2+)

**Local Agent**:
- ❌ Git operations (Phase 5)
- ❌ Terminal execution (Phase 5)
- ❌ Advanced search (Phase 2)
- ❌ File watching (Phase 2)

**Features**:
- ❌ Browser automation (Phase 7)
- ❌ Local memory (Phase 6)
- ❌ AI switching (Phase 6)
- ❌ Desktop dashboard (Phase 8)
- ❌ macOS/Linux (Phase 9)

### MVP Success Criteria

User can:
1. ✅ Install Chrome extension
2. ✅ Install Windows Local Agent
3. ✅ See agent connected
4. ✅ Select a real local project
5. ✅ See project tree
6. ✅ Search project (basic)
7. ✅ Read files
8. ✅ Build context (manual selection)
9. ✅ Copy context
10. ✅ Paste into ChatGPT (generic mode)
11. ✅ Get AI response
12. ✅ See diff for proposed changes
13. ✅ Approve/reject changes
14. ✅ Apply approved changes locally
15. ✅ Operate without our API key
16. ✅ Operate without our cloud backend
17. ✅ Keep project processing local

---

## 11. Future Roadmap

### Phase 1: Foundation (Current)
**Goal**: Extension + Local Agent + Project Explorer

**Deliverables**:
- Chrome Extension with Side Panel
- Windows Local Agent
- Native Messaging connection
- Project selection and tree
- Basic file operations
- Security foundation

**Dependencies**: None (starting point)

### Phase 2: Search & Context
**Goal**: Smart search and context extraction

**Deliverables**:
- Advanced project indexing
- Content search
- Smart context engine
- Keyword expansion
- Relevance scoring
- Context size management

**Dependencies**: Phase 1 (needs project access)

### Phase 3: File Editing
**Goal**: Safe file modifications

**Deliverables**:
- Diff viewer (unified/split)
- File write operations
- Approval workflow
- Undo/rollback
- Permission refinement

**Dependencies**: Phase 1 (needs file operations)

### Phase 4: AI Adapters
**Goal**: Direct integration with AI providers

**Deliverables**:
- ChatGPT adapter
- Gemini adapter
- DeepSeek adapter
- Content script automation
- Context injection
- Response reading

**Dependencies**: Phase 1 (needs extension UI)

### Phase 5: Git & Terminal
**Goal**: Developer workflow support

**Deliverables**:
- Git status/diff/log
- Git commit (with approval)
- Terminal execution (allowlist)
- Test running
- Build commands

**Dependencies**: Phase 1 (needs Local Agent)

### Phase 6: Memory & Switching
**Goal**: Persistent knowledge and AI flexibility

**Deliverables**:
- Local memory system
- Project instructions
- AI switching (same workspace)
- Memory context injection
- Decision history

**Dependencies**: Phase 2 (needs context engine)

### Phase 7: Automation
**Goal**: Browser and app automation

**Deliverables**:
- Browser automation (Playwright/Puppeteer)
- Application launching
- Advanced workflows
- Multi-step tasks

**Dependencies**: Phase 4 (needs adapter architecture)

### Phase 8: Desktop Dashboard
**Goal**: Optional desktop interface

**Deliverables**:
- Electron/Tauri dashboard
- Project management
- Settings UI
- Log viewer
- Memory inspector

**Dependencies**: Phase 1 (needs core architecture)

### Phase 9: Cross-Platform
**Goal**: macOS and Linux support

**Deliverables**:
- macOS Local Agent
- Linux Local Agent
- Platform-specific adjustments
- Testing on all platforms

**Dependencies**: Phase 1 (needs Local Agent architecture)

---

## 12. Initial Repository Structure

```
ulab/
│
├── extension/                    # Chrome Extension
│   ├── manifest.json             # Extension manifest
│   ├── src/
│   │   ├── background/
│   │   │   └── service-worker.ts # Background service
│   │   ├── sidepanel/
│   │   │   ├── index.html        # Side Panel HTML
│   │   │   ├── main.tsx          # React entry
│   │   │   ├── App.tsx           # Main app
│   │   │   └── components/       # UI components
│   │   ├── content/
│   │   │   └── content.ts        # Content script
│   │   ├── adapters/
│   │   │   ├── chatgpt.ts
│   │   │   ├── gemini.ts
│   │   │   ├── deepseek.ts
│   │   │   └── generic.ts
│   │   └── utils/
│   │       └── ...
│   ├── public/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── agent/                        # Local Agent (Node.js)
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── native-messaging.ts   # Native Messaging handler
│   │   ├── filesystem/
│   │   │   ├── reader.ts
│   │   │   ├── writer.ts
│   │   │   └── validator.ts
│   │   ├── project/
│   │   │   ├── indexer.ts
│   │   │   ├── searcher.ts
│   │   │   └── context.ts
│   │   ├── git/
│   │   │   └── git-operations.ts
│   │   ├── terminal/
│   │   │   └── executor.ts
│   │   ├── security/
│   │   │   ├── path-validator.ts
│   │   │   ├── command-validator.ts
│   │   │   └── audit-log.ts
│   │   └── protocol/
│   │       └── ulp-handler.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                       # Shared code
│   ├── protocol/
│   │   ├── ulp.ts                # ULP definitions
│   │   └── schemas.ts            # Validation schemas
│   ├── types/
│   │   ├── index.ts              # Shared types
│   │   └── messages.ts           # Message types
│   └── utils/
│       ├── path.ts               # Path utilities
│       └── validation.ts         # Validation helpers
│
├── tests/                        # Test suites
│   ├── extension/
│   │   └── ...
│   ├── agent/
│   │   └── ...
│   └── integration/
│       └── ...
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── PRIVACY.md
│   ├── USER_GUIDE.md
│   └── DEVELOPMENT.md
│
├── .gitignore
├── README.md
├── LICENSE
└── package.json                  # Root package (workspaces)
```

**Notes**:
- Monorepo structure with separate packages
- Shared code in `shared/` for consistency
- Tests mirror source structure
- Documentation in `docs/`

---

## 13. Main Technical Risks

### Risk 1: Native Messaging Complexity
**Severity**: Medium  
**Description**: Chrome Native Messaging can be tricky to set up correctly, especially on Windows.  
**Mitigation**:
- Start with simple ping/pong test
- Have WebSocket fallback ready
- Test on multiple Windows versions
- Document setup process clearly

### Risk 2: File System Access API Limitations
**Severity**: Medium  
**Description**: Browser API has performance limitations for large projects.  
**Mitigation**:
- Local Agent provides unrestricted access
- Use Local Agent for large projects
- Optimize indexing with Local Agent

### Risk 3: Provider UI Changes
**Severity**: High  
**Description**: AI providers frequently change their UI, breaking selectors.  
**Mitigation**:
- Isolate selectors per provider
- Generic mode as fallback
- Quick update process for selectors
- Community contributions for updates

### Risk 4: Security Bypass Attempts
**Severity**: High  
**Description**: Malicious AI output or project files could attempt to bypass security.  
**Mitigation**:
- Defense in depth (multiple validation layers)
- Default deny for dangerous operations
- Comprehensive security testing
- Audit logging for forensics

### Risk 5: Performance with Large Projects
**Severity**: Medium  
**Description**: Indexing/searching large projects (10,000+ files) could be slow.  
**Mitigation**:
- Incremental indexing
- Local Agent handles heavy lifting
- Lazy loading in UI
- Caching search results

### Risk 6: Cross-Platform Compatibility
**Severity**: Medium  
**Description**: Local Agent needs to work on Windows, macOS, Linux.  
**Mitigation**:
- Start with Windows only (MVP)
- Use cross-platform Node.js APIs
- Test on each platform before release
- Platform-specific code isolated

### Risk 7: User Experience Complexity
**Severity**: Medium  
**Description**: Product has many features, could overwhelm users.  
**Mitigation**:
- Progressive disclosure (show features gradually)
- Clear onboarding flow
- Good defaults (secure by default)
- Comprehensive documentation

---

## 14. Recommended Next Action

### Immediate Next Step: Phase 1 Implementation

**Action**: Begin Phase 1 — Project Structure & Shared Protocol

**Specific Tasks**:
1. Create monorepo structure
2. Set up shared protocol definitions
3. Create Chrome Extension skeleton
4. Create Local Agent skeleton
5. Implement basic Native Messaging
6. Test connection between extension and agent

**Estimated Time**: 2-3 days

**Success Criteria**:
- Extension loads in Chrome
- Local Agent runs on Windows
- Extension connects to Local Agent
- Can send/receive test messages

### Do NOT Do Yet:
- ❌ Do not implement full UI
- ❌ Do not implement Git operations
- ❌ Do not implement terminal
- ❌ Do not implement AI adapters
- ❌ Do not implement advanced features

### After Phase 1:
- Move to Phase 2 (Search & Context)
- Or fix issues found in Phase 1
- Or adjust architecture based on learnings

---

## Summary

### Current State
- ✅ Web Dashboard prototype exists (40+ files)
- ✅ Core concepts validated (ULP, Security, Context Engine)
- ✅ Architecture designed
- ✅ Technology stack chosen

### What's Missing
- ❌ Chrome Extension (actual extension, not web app)
- ❌ Local Agent (Node.js application)
- ❌ Native Messaging connection
- ❌ Real file system operations (beyond browser API)
- ❌ Git integration
- ❌ Terminal execution
- ❌ AI provider adapters (content scripts)

### Recommended Path Forward
1. **Phase 1**: Build Extension + Local Agent foundation
2. **Phase 2**: Add search and context engine
3. **Phase 3**: Add file editing and diff
4. **Phase 4**: Add AI provider adapters
5. **Phase 5+**: Add advanced features

### Key Decisions Made
- ✅ Use Chrome Manifest V3 (not Firefox/Safari yet)
- ✅ Use Node.js for Local Agent (not Rust/Python)
- ✅ Use Native Messaging (not WebSocket primary)
- ✅ Use React for extension UI (already chosen)
- ✅ Use TypeScript everywhere (consistency)
- ✅ Start with Windows only (MVP scope)
- ✅ Generic mode for unsupported AI (fallback)

### Final Recommendation

**Proceed to Phase 1 implementation.**

The architecture is sound, the technology stack is appropriate, and the MVP scope is realistic. The existing web dashboard prototype has validated the core concepts and UI design. Now it's time to build the actual Chrome Extension and Local Agent.

**Stop here and wait for instruction to begin Phase 1.**
