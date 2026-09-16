# Universal Local AI Bridge (ULAB) - Windows Runtime Checklist

**Version**: 1.0.0-rc1  
**Date**: 2026-09-13  
**Purpose**: Exact manual test sequence for Windows runtime validation

---

## Instructions

This checklist contains the **exact sequence** of manual tests to perform on Windows. Execute each step in order and document results.

**Legend**:
- [ ] = Not tested
- [x] = Passed
- [!] = Failed (document issue)
- [~] = Skipped (document reason)

---

## Phase 1: Installation

### 1.1 Prerequisites
- [ ] Install Node.js 18+ on Windows
  - Version: _____________
  - Installation path: _____________
  - Verified: `node --version` shows v18+
  
- [ ] Install Chrome on Windows
  - Version: _____________
  - Installation path: _____________
  - Verified: Chrome launches successfully

- [ ] Copy project to Windows machine
  - Source: _____________
  - Destination: _____________
  - Verified: All files present

### 1.2 Run Installer
- [ ] Open Command Prompt as Administrator
  - Right-click Command Prompt
  - Select "Run as administrator"
  - Verified: UAC prompt appeared

- [ ] Navigate to project directory
  - Command: `cd <project-path>`
  - Verified: Directory changed

- [ ] Run windows-installer.bat
  - Command: `windows-installer.bat`
  - Verified: Installer started
  - Output: _____________

- [ ] Follow installer prompts
  - Accepted license: [ ]
  - Chose installation directory: _____________
  - Entered Chrome Extension ID: _____________
  - Verified: Installation completed
  - Output: _____________

### 1.3 Verify Installation
- [ ] Verify Local Agent installed
  - Path: `C:\Program Files\ULAB\ulab-agent.exe`
  - Verified: File exists
  - File size: _____________

- [ ] Verify Native Messaging registered
  - Path: `%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json`
  - Verified: File exists
  - Content verified: [ ]

- [ ] Verify desktop shortcut created
  - Path: `%USERPROFILE%\Desktop\ULAB.lnk`
  - Verified: Shortcut exists

---

## Phase 2: Extension Setup

### 2.1 Load Extension
- [ ] Open Chrome
  - Verified: Chrome launched

- [ ] Navigate to extensions page
  - URL: `chrome://extensions/`
  - Verified: Extensions page loaded

- [ ] Enable Developer mode
  - Toggled switch in top-right
  - Verified: Developer mode enabled

- [ ] Load unpacked extension
  - Clicked "Load unpacked"
  - Selected: `C:\Program Files\ULAB\extension`
  - Verified: Extension loaded
  - Extension ID: _____________

- [ ] Verify extension details
  - Name: "Universal Local AI Bridge"
  - Version: "1.0.0"
  - Status: Enabled
  - No errors: [ ]

### 2.2 Update Native Messaging (if needed)
- [ ] Copy Extension ID from Chrome
  - Extension ID: _____________

- [ ] Update Native Messaging manifest
  - File: `C:\Program Files\ULAB\com.ulab.agent.json`
  - Updated Extension ID: [ ]
  - Saved file: [ ]

- [ ] Restart Chrome
  - Closed all Chrome windows
  - Reopened Chrome
  - Verified: Chrome restarted

---

## Phase 3: Connection

### 3.1 Open Side Panel
- [ ] Click ULAB icon in Chrome toolbar
  - Verified: Icon visible
  - Clicked: [ ]

- [ ] Verify Side Panel opened
  - Panel appeared on right side: [ ]
  - Panel shows ULAB interface: [ ]
  - No errors in console: [ ]

### 3.2 Connect to Agent
- [ ] Click "Connect Agent" button
  - Verified: Button clicked
  - Status changed: [ ]

- [ ] Verify connection status
  - Status shows "Connected": [ ]
  - Green indicator visible: [ ]
  - No error messages: [ ]

---

## Phase 4: Project Selection

### 4.1 Select Project
- [ ] Click "Select Project" button
  - Verified: Button clicked
  - File dialog opened: [ ]

- [ ] Select test-project folder
  - Navigated to: _____________
  - Selected: `test-project` folder
  - Clicked "Select Folder": [ ]

- [ ] Verify project indexed
  - Indexing started: [ ]
  - Indexing completed: [ ]
  - Project name displayed: _____________
  - File count displayed: _____________

### 4.2 Verify Project Data
- [ ] Verify project overview
  - Project name: _____________
  - File count: _____________
  - Languages detected: _____________
  - Config files: _____________

- [ ] Verify file tree
  - File tree visible: [ ]
  - Folders expandable: [ ]
  - Files listed: [ ]
  - File sizes shown: [ ]

---

## Phase 5: Core Functionality

### 5.1 Search Files
- [ ] Enter search query
  - Query: "auth"
  - Verified: Search executed
  - Results displayed: [ ]

- [ ] Verify search results
  - Results contain "auth" files: [ ]
  - Results are relevant: [ ]
  - Result count: _____________

### 5.2 Build Context
- [ ] Ask a question
  - Question: "Why is authentication failing?"
  - Verified: Question submitted
  - Context building started: [ ]

- [ ] Verify context built
  - Context completed: [ ]
  - Files selected: [ ]
  - File count: _____________
  - Context size: _____________

### 5.3 Test Generic Mode
- [ ] Copy context to clipboard
  - Clicked "Copy Context": [ ]
  - Verified: Context copied

- [ ] Open AI chatbot
  - Opened: ChatGPT / Gemini / DeepSeek
  - Verified: Chatbot opened

- [ ] Paste context
  - Pasted context: [ ]
  - Verified: Context pasted

- [ ] Ask question in AI
  - Question: "Why is authentication failing?"
  - Verified: Question sent
  - AI response received: [ ]

---

## Phase 6: Change Workflow

### 6.1 Propose Changes
- [ ] Request changes from AI
  - Request: "Fix the authentication issue"
  - Verified: Request sent
  - AI response received: [ ]

- [ ] Verify changes proposed
  - Changes displayed: [ ]
  - Diff shown: [ ]
  - Files to change: _____________

### 6.2 Review Diff
- [ ] Review each file change
  - File 1: _____________
    - Diff visible: [ ]
    - Changes understood: [ ]
  - File 2: _____________
    - Diff visible: [ ]
    - Changes understood: [ ]

- [ ] Verify diff accuracy
  - Diffs show old/new code: [ ]
  - Changes are correct: [ ]

### 6.3 Approve Changes
- [ ] Approve changes
  - Clicked "Approve": [ ]
  - Approval confirmed: [ ]
  - Status changed to "Approved": [ ]

### 6.4 Apply Changes
- [ ] Apply changes
  - Clicked "Apply": [ ]
  - Changes applied: [ ]
  - Files modified: [ ]

- [ ] Verify changes applied
  - Files updated: [ ]
  - Content correct: [ ]
  - No errors: [ ]

---

## Phase 7: Execution

### 7.1 Run Tests
- [ ] Click "Test" button
  - Verified: Button clicked
  - Command executed: `npm test`
  - Execution started: [ ]

- [ ] Verify test results
  - Tests completed: [ ]
  - Result: PASS / FAIL
  - Output: _____________

### 7.2 Run Build
- [ ] Click "Build" button
  - Verified: Button clicked
  - Command executed: `npm run build`
  - Execution started: [ ]

- [ ] Verify build results
  - Build completed: [ ]
  - Result: SUCCESS / FAIL
  - Output: _____________

### 7.3 Run Typecheck
- [ ] Click "Typecheck" button
  - Verified: Button clicked
  - Command executed: `npm run typecheck`
  - Execution started: [ ]

- [ ] Verify typecheck results
  - Typecheck completed: [ ]
  - Result: PASS / FAIL
  - Output: _____________

### 7.4 Run Lint
- [ ] Click "Lint" button
  - Verified: Button clicked
  - Command executed: `npm run lint`
  - Execution started: [ ]

- [ ] Verify lint results
  - Lint completed: [ ]
  - Result: PASS / FAIL
  - Output: _____________

---

## Phase 8: Git Integration

### 8.1 Check Git Status
- [ ] Click "Git Status" button
  - Verified: Button clicked
  - Command executed: `git status`
  - Status displayed: [ ]

- [ ] Verify git status
  - Branch shown: _____________
  - Modified files: _____________
  - Staged files: _____________
  - Untracked files: _____________

### 8.2 Check Git Diff
- [ ] Click "Git Diff" button
  - Verified: Button clicked
  - Command executed: `git diff`
  - Diff displayed: [ ]

- [ ] Verify git diff
  - Changes shown: [ ]
  - Diff accurate: [ ]

### 8.3 Create Commit
- [ ] Request commit
  - Request: "Commit the authentication fix"
  - Verified: Request sent
  - Commit dialog shown: [ ]

- [ ] Review commit
  - Files to commit: _____________
  - Commit message: _____________
  - No sensitive files: [ ]

- [ ] Approve commit
  - Clicked "Approve": [ ]
  - Commit created: [ ]
  - Commit hash: _____________

- [ ] Verify commit
  - Commit exists: [ ]
  - Commit message correct: [ ]
  - Files committed: [ ]

---

## Phase 9: Rollback

### 9.1 Create Snapshot
- [ ] Create rollback snapshot
  - Verified: Snapshot created
  - Snapshot ID: _____________
  - Files included: _____________

### 9.2 Make Changes
- [ ] Make test changes
  - Modified file: _____________
  - Changes made: [ ]

### 9.3 Rollback Changes
- [ ] Request rollback
  - Request: "Rollback the changes"
  - Verified: Request sent
  - Rollback executed: [ ]

- [ ] Verify rollback
  - Files restored: [ ]
  - Content correct: [ ]
  - No data loss: [ ]

---

## Phase 10: Security Testing

### 10.1 Test Path Traversal
- [ ] Attempt path traversal
  - Attempted: `../../secret.txt`
  - Result: BLOCKED
  - Error message: _____________

### 10.2 Test Sensitive File Access
- [ ] Attempt sensitive file access
  - Attempted: `.env`
  - Result: BLOCKED
  - Error message: _____________

### 10.3 Test Command Injection
- [ ] Attempt command injection
  - Attempted: `echo test && rm -rf /`
  - Result: BLOCKED
  - Error message: _____________

### 10.4 Test Outside Project Access
- [ ] Attempt outside project access
  - Attempted: `C:\Windows\System32`
  - Result: BLOCKED
  - Error message: _____________

---

## Phase 11: Uninstall

### 11.1 Run Uninstaller
- [ ] Open Command Prompt as Administrator
  - Verified: Administrator mode

- [ ] Run uninstaller
  - Path: `C:\Program Files\ULAB\uninstall.bat`
  - Command: `uninstall.bat`
  - Verified: Uninstaller started

- [ ] Follow uninstall prompts
  - Confirmed uninstall: [ ]
  - Uninstall completed: [ ]

### 11.2 Verify Uninstall
- [ ] Verify Local Agent removed
  - Path: `C:\Program Files\ULAB\ulab-agent.exe`
  - Verified: File removed

- [ ] Verify Native Messaging removed
  - Path: `%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json`
  - Verified: File removed

- [ ] Verify installation directory removed
  - Path: `C:\Program Files\ULAB`
  - Verified: Directory removed

- [ ] Verify desktop shortcut removed
  - Path: `%USERPROFILE%\Desktop\ULAB.lnk`
  - Verified: Shortcut removed

---

## Phase 12: Reinstall

### 12.1 Reinstall ULAB
- [ ] Run installer again
  - Command: `windows-installer.bat`
  - Followed prompts: [ ]
  - Installation completed: [ ]

### 12.2 Verify Reinstall
- [ ] Verify all components installed
  - Local Agent: [ ]
  - Native Messaging: [ ]
  - Extension loaded: [ ]
  - Connection working: [ ]

- [ ] Verify all features working
  - Project selection: [ ]
  - Search: [ ]
  - Context building: [ ]
  - Change workflow: [ ]
  - Execution: [ ]
  - Git integration: [ ]
  - Rollback: [ ]

---

## Phase 13: Final Validation

### 13.1 End-to-End Test
- [ ] Complete full workflow
  - Select project: [ ]
  - Build context: [ ]
  - Send to AI: [ ]
  - Review changes: [ ]
  - Apply changes: [ ]
  - Verify changes: [ ]
  - Run tests: [ ]
  - Commit changes: [ ]

### 13.2 Verify All Features
- [ ] All core features working: [ ]
- [ ] All security controls working: [ ]
- [ ] All execution features working: [ ]
- [ ] All Git features working: [ ]
- [ ] All rollback features working: [ ]

### 13.3 Document Issues
- [ ] Document any issues found
  - Issue 1: _____________
  - Issue 2: _____________
  - Issue 3: _____________

---

## Phase 14: Final Report

### 14.1 Test Summary
- Total tests: 56
- Passed: _____
- Failed: _____
- Skipped: _____

### 14.2 Issues Found
- Critical issues: _____
- Major issues: _____
- Minor issues: _____

### 14.3 Final Status
- [ ] READY FOR PUBLIC RELEASE
- [ ] NEEDS FIXES BEFORE RELEASE
- [ ] NOT READY FOR RELEASE

### 14.4 Notes
_____________________________________________
_____________________________________________
_____________________________________________

---

## Sign-off

**Tester**: _____________  
**Date**: _____________  
**Windows Version**: _____________  
**Chrome Version**: _____________  
**Node.js Version**: _____________  

**Signature**: _____________

---

**Checklist Completed**: 2026-09-13  
**Status**: READY FOR WINDOWS RUNTIME VALIDATION
