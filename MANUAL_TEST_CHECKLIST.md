# 🧪 Manual Test Checklist - Windows + Chrome Runtime Testing

**Purpose**: Verify ULAB functionality in real Windows + Chrome environment  
**Status**: ⏳ PENDING - Requires Windows + Chrome

---

## 📋 Pre-Testing Setup

### Prerequisites
- [ ] Windows 10 or later
- [ ] Chrome browser (latest version)
- [ ] Node.js 18+ installed
- [ ] Project files transferred to Windows machine

### Build Steps
```cmd
# 1. Install dependencies
npm install

# 2. Build web dashboard
npm run build

# 3. Build extension
node build-extension.js

# 4. Build agent (if needed)
cd agent
npm install
npm run build
cd ..
```

---

## 🧪 Test Suite 1: Extension Loading

### Test 1.1: Load Extension
- [ ] Open Chrome
- [ ] Navigate to `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select `dist/extension/` folder
- [ ] **Expected**: Extension loads without errors
- [ ] **Verify**: No error messages in Chrome console

### Test 1.2: Extension Icon
- [ ] **Expected**: ULAB icon appears in Chrome toolbar
- [ ] **Verify**: Icon is visible and clickable

### Test 1.3: Side Panel
- [ ] Click ULAB icon
- [ ] **Expected**: Side panel opens on the right
- [ ] **Verify**: Panel displays correctly
- [ ] **Verify**: No console errors

---

## 🧪 Test Suite 2: Project Selection

### Test 2.1: Select Project
- [ ] Click "Select Project" button
- [ ] Navigate to `test-project/` folder
- [ ] Select the folder
- [ ] **Expected**: Project loads successfully
- [ ] **Verify**: File tree appears
- [ ] **Verify**: File count is correct

### Test 2.2: File Tree Display
- [ ] Expand directories
- [ ] **Expected**: Files and folders display correctly
- [ ] **Verify**: File sizes shown
- [ ] **Verify**: File icons correct

### Test 2.3: File Reading
- [ ] Click on `src/app.ts`
- [ ] **Expected**: File content displays
- [ ] **Verify**: Content is correct
- [ ] **Verify**: Line numbers shown

---

## 🧪 Test Suite 3: Search Functionality

### Test 3.1: Filename Search
- [ ] Type "auth" in search box
- [ ] **Expected**: Results appear
- [ ] **Verify**: `src/auth/login.ts` in results
- [ ] **Verify**: `src/auth/session.ts` in results

### Test 3.2: Path Search
- [ ] Type "src/api" in search box
- [ ] **Expected**: Results appear
- [ ] **Verify**: `src/api/routes.ts` in results

### Test 3.3: Content Search
- [ ] Type "loginUser" in search box
- [ ] **Expected**: Results appear
- [ ] **Verify**: Files containing "loginUser" in results

---

## 🧪 Test Suite 4: Context Building

### Test 4.1: Select Files for Context
- [ ] Select multiple files (e.g., `src/auth/login.ts`, `src/auth/session.ts`)
- [ ] **Expected**: Files highlighted
- [ ] **Verify**: File count updates

### Test 4.2: Build Context
- [ ] Click "Build Context" button
- [ ] **Expected**: Context preview appears
- [ ] **Verify**: Selected files shown
- [ ] **Verify**: Context size shown
- [ ] **Verify**: Token estimate shown

### Test 4.3: Context Preview
- [ ] Review context preview
- [ ] **Expected**: All selected files shown
- [ ] **Verify**: Code sections displayed
- [ ] **Verify**: Excluded files listed

---

## 🧪 Test Suite 5: Security Testing

### Test 5.1: Sensitive File Blocking
- [ ] Try to read `.env`
- [ ] **Expected**: Access denied
- [ ] **Verify**: Error message shown
- [ ] **Verify**: File not loaded

### Test 5.2: Path Traversal Prevention
- [ ] Try to access `../../secret.txt`
- [ ] **Expected**: Access denied
- [ ] **Verify**: Error message shown
- [ ] **Verify**: No file loaded

### Test 5.3: Outside Project Access
- [ ] Try to access `C:\Windows\System32\config`
- [ ] **Expected**: Access denied
- [ ] **Verify**: Error message shown
- [ ] **Verify**: No file loaded

---

## 🧪 Test Suite 6: Provider Detection

### Test 6.1: Generic Mode
- [ ] Open any webpage
- [ ] **Expected**: Generic mode available
- [ ] **Verify**: Can prepare context
- [ ] **Verify**: Can copy context

### Test 6.2: ChatGPT Detection
- [ ] Navigate to `https://chat.openai.com`
- [ ] **Expected**: ChatGPT detected
- [ ] **Verify**: Provider shows "ChatGPT"
- [ ] **Verify**: Context preparation works

### Test 6.3: Gemini Detection
- [ ] Navigate to `https://gemini.google.com`
- [ ] **Expected**: Gemini detected
- [ ] **Verify**: Provider shows "Gemini"
- [ ] **Verify**: Context preparation works

### Test 6.4: DeepSeek Detection
- [ ] Navigate to `https://chat.deepseek.com`
- [ ] **Expected**: DeepSeek detected
- [ ] **Verify**: Provider shows "DeepSeek"
- [ ] **Verify**: Context preparation works

---

## 🧪 Test Suite 7: Context Insertion

### Test 7.1: Manual Insertion (Generic)
- [ ] Build context
- [ ] Click "Copy Context"
- [ ] **Expected**: Context copied to clipboard
- [ ] **Verify**: Can paste into any text field

### Test 7.2: Manual Insertion (ChatGPT)
- [ ] Navigate to ChatGPT
- [ ] Build context
- [ ] Click "Prepare for ChatGPT"
- [ ] **Expected**: Context formatted for ChatGPT
- [ ] **Verify**: Can paste into ChatGPT input

### Test 7.3: Manual Insertion (Gemini)
- [ ] Navigate to Gemini
- [ ] Build context
- [ ] Click "Prepare for Gemini"
- [ ] **Expected**: Context formatted for Gemini
- [ ] **Verify**: Can paste into Gemini input

### Test 7.4: Manual Insertion (DeepSeek)
- [ ] Navigate to DeepSeek
- [ ] Build context
- [ ] Click "Prepare for DeepSeek"
- [ ] **Expected**: Context formatted for DeepSeek
- [ ] **Verify**: Can paste into DeepSeek input

---

## 🧪 Test Suite 8: AI Response Handling

### Test 8.1: Send Context to AI
- [ ] Paste context into AI chat
- [ ] Ask question about the project
- [ ] **Expected**: AI responds based on context
- [ ] **Verify**: Response is relevant

### Test 8.2: Action Extraction
- [ ] Ask AI to suggest code changes
- [ ] **Expected**: AI provides local-action blocks
- [ ] **Verify**: Actions are valid JSON
- [ ] **Verify**: Actions have correct structure

### Test 8.3: Action Validation
- [ ] Copy AI response with local-action
- [ ] Paste into ULAB
- [ ] **Expected**: Action detected
- [ ] **Verify**: Action validated
- [ ] **Verify**: Permission check occurs

---

## 🧪 Test Suite 9: File Modification Workflow

### Test 9.1: Review Proposed Changes
- [ ] AI proposes file changes
- [ ] **Expected**: Changes displayed
- [ ] **Verify**: Before/after shown
- [ ] **Verify**: Diff displayed

### Test 9.2: Approve Changes
- [ ] Click "Approve" on changes
- [ ] **Expected**: Changes marked as approved
- [ ] **Verify**: Status updates

### Test 9.3: Apply Changes
- [ ] Click "Apply" on approved changes
- [ ] **Expected**: Files modified
- [ ] **Verify**: File content updated
- [ ] **Verify**: Changes saved

### Test 9.4: Reject Changes
- [ ] Click "Reject" on changes
- [ ] **Expected**: Changes not applied
- [ ] **Verify**: File unchanged
- [ ] **Verify**: Status updated

---

## 🧪 Test Suite 10: Task Management

### Test 10.1: Create Task
- [ ] Start new task
- [ ] **Expected**: Task created
- [ ] **Verify**: Task panel shows task
- [ ] **Verify**: Status is "NEW"

### Test 10.2: Task Progress
- [ ] Build context
- [ ] **Expected**: Status updates to "CONTEXT_READY"
- [ ] **Verify**: Progress bar updates

### Test 10.3: Task Completion
- [ ] Apply changes
- [ ] **Expected**: Status updates to "APPLIED"
- [ ] **Verify**: Task marked complete
- [ ] **Verify**: Result shown

### Test 10.4: Task Cancellation
- [ ] Click "Cancel" on task
- [ ] **Expected**: Task cancelled
- [ ] **Verify**: Status is "CANCELLED"
- [ ] **Verify**: No changes applied

---

## 🧪 Test Suite 11: Error Handling

### Test 11.1: Invalid Action
- [ ] Provide malformed JSON action
- [ ] **Expected**: Action rejected
- [ ] **Verify**: Error message shown
- [ ] **Verify**: No file modified

### Test 11.2: Unauthorized Action
- [ ] Try to modify file outside project
- [ ] **Expected**: Action rejected
- [ ] **Verify**: Permission error shown
- [ ] **Verify**: No file modified

### Test 11.3: Sensitive File Action
- [ ] Try to read `.env` via action
- [ ] **Expected**: Action rejected
- [ ] **Verify**: Security error shown
- [ ] **Verify**: No file read

---

## 🧪 Test Suite 12: Performance

### Test 12.1: Large Project Indexing
- [ ] Select large project (1000+ files)
- [ ] **Expected**: Indexing completes
- [ ] **Verify**: No UI freeze
- [ ] **Verify**: Progress shown

### Test 12.2: Search Performance
- [ ] Search in large project
- [ ] **Expected**: Results appear quickly
- [ ] **Verify**: < 1 second response time
- [ ] **Verify**: UI remains responsive

### Test 12.3: Context Building Performance
- [ ] Build context for large selection
- [ ] **Expected**: Context builds quickly
- [ ] **Verify**: < 2 seconds build time
- [ ] **Verify**: No memory issues

---

## 📊 Test Results Summary

### Test Execution
```
Total Tests: [ ]
Passed: [ ]
Failed: [ ]
Blocked: [ ]
```

### Issues Found
```
1. [Issue description]
2. [Issue description]
3. [Issue description]
```

### Fixes Applied
```
1. [Fix description]
2. [Fix description]
3. [Fix description]
```

---

## ✅ Final Verification

### Critical Tests (Must Pass)
- [ ] Extension loads without errors
- [ ] Project selection works
- [ ] File reading works
- [ ] Search works
- [ ] Context building works
- [ ] Security restrictions enforced
- [ ] Provider detection works
- [ ] Manual context insertion works
- [ ] Action extraction works
- [ ] File modification workflow works

### Important Tests (Should Pass)
- [ ] Task management works
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] UI is responsive
- [ ] No console errors

### Nice-to-Have Tests
- [ ] All providers detected correctly
- [ ] All actions validated correctly
- [ ] All edge cases handled
- [ ] All error messages clear

---

## 🎯 Final Status

**Overall Result**: [ ] PASS / [ ] FAIL / [ ] PARTIAL

**Ready for Production**: [ ] YES / [ ] NO

**Next Steps**:
1. [ ] Fix any failed tests
2. [ ] Re-test fixed issues
3. [ ] Update documentation
4. [ ] Prepare for release

---

**Test Date**: _______________  
**Tester**: _______________  
**Environment**: Windows ___ / Chrome ___  
**Project Version**: _______________

**This checklist must be completed on Windows + Chrome before claiming runtime success.**
