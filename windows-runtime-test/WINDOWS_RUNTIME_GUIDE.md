# ULAB Windows Runtime Testing Guide

**Date**: 2026-09-13  
**Version**: 1.0.0  
**Status**: Ready for Testing

---

## 📋 Overview

This guide walks you through testing Universal Local AI Bridge on Windows. The testing is divided into two phases:

1. **Automated Tests** - Run on Windows without Chrome
2. **Manual Chrome Tests** - Require Chrome/Edge browser

---

## 🚀 Quick Start

### Step 1: Run Diagnostics

Double-click `diagnose.bat` to check your system:

```
✅ Windows version
✅ System architecture
✅ Node.js and npm
✅ Chrome/Edge presence
✅ ULAB components
```

**Expected Result**: All checks should pass or show warnings.

### Step 2: Run Automated Tests

Double-click `run-tests.bat` to run automated tests:

```
✅ Build tests
✅ Security tests (static)
✅ Context engine tests (static)
✅ Integration tests
⚠️ Runtime tests (blocked - requires Chrome)
```

**Expected Result**: 13/15 tests pass, 2 blocked.

### Step 3: Install Agent

Run `install-agent.bat` as Administrator:

1. Builds the agent
2. Installs to `C:\Program Files\ULAB\`
3. Configures Native Messaging
4. Requires Chrome Extension ID

**Expected Result**: Agent installed successfully.

### Step 4: Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension/` folder
6. Copy the Extension ID

### Step 5: Complete Manual Tests

Follow the checklist in `CHROME_TEST_ASSISTANT.html` or see Manual Chrome Tests below.

---

## 🔧 Automated Tests

### What Gets Tested

#### Prerequisites Check
- ✅ Windows version
- ✅ System architecture
- ✅ Node.js presence
- ✅ npm presence
- ✅ Chrome presence
- ✅ Edge presence

#### Build Tests
- ✅ Extension manifest exists
- ✅ Agent source exists

#### Security Tests (Static)
- ✅ Path traversal prevention
- ✅ Sensitive file protection
- ✅ Project boundary enforcement
- ✅ Permission system
- ✅ Action validation

#### Context Engine Tests (Static)
- ✅ Project indexing
- ✅ Search functionality
- ✅ Context building

#### Integration Tests
- ✅ Extension package integrity
- ✅ Native Messaging configuration
- ✅ Installation scripts

#### Runtime Tests (Blocked)
- ⚠️ Agent runtime (requires Chrome)
- ⚠️ Chrome extension loading (requires Chrome)

### Running Tests

```cmd
run-tests.bat
```

**Expected Output**:
```
Total Tests:    15
Passed:         13
Failed:         0
Blocked:        2
Pass Rate:      100%
```

---

## 🌐 Manual Chrome Tests

### Prerequisites

- ✅ Chrome or Edge installed
- ✅ Agent installed
- ✅ Extension loaded

### Test Checklist

Open `CHROME_TEST_ASSISTANT.html` in Chrome for an interactive checklist, or follow the steps below.

#### Basic Functionality

- [ ] **Extension loaded**
  - Go to `chrome://extensions/`
  - Verify ULAB extension is listed
  - Verify no errors

- [ ] **Side Panel opens**
  - Click ULAB icon in toolbar
  - Verify side panel opens on right
  - Verify no console errors

- [ ] **Agent connected**
  - Click "Connect Agent" in side panel
  - Verify status changes to "Connected"
  - Verify green indicator

#### Project Operations

- [ ] **Project selected**
  - Click "Select Project"
  - Choose `test-project/` folder
  - Verify project loads

- [ ] **Project tree works**
  - Expand directories
  - Verify files display
  - Verify file sizes shown

- [ ] **Search works**
  - Type "auth" in search box
  - Verify results appear
  - Verify `src/auth/login.ts` in results

- [ ] **Safe file opens**
  - Click `src/app.ts`
  - Verify content displays
  - Verify line numbers shown

#### Security Tests

- [ ] **.env blocked**
  - Try to read `.env`
  - Verify access denied
  - Verify error message shown

- [ ] **Outside-project path blocked**
  - Try to access `../../secret.txt`
  - Verify access denied
  - Verify error message shown

#### File Operations

- [ ] **Safe file created**
  - Create `test-output.txt`
  - Verify file created
  - Verify content correct

- [ ] **Safe modification approved**
  - Modify `test-output.txt`
  - Verify permission prompt
  - Approve modification
  - Verify file updated

- [ ] **Diff shown**
  - View diff before/after
  - Verify changes displayed
  - Verify line numbers correct

#### Provider Tests

- [ ] **Generic Mode**
  - Build context
  - Copy context
  - Paste into any AI chatbot
  - Verify context works

- [ ] **ChatGPT** (if available)
  - Navigate to `https://chat.openai.com`
  - Verify provider detected
  - Build context
  - Copy and paste
  - Verify works

- [ ] **Gemini** (if available)
  - Navigate to `https://gemini.google.com`
  - Verify provider detected
  - Build context
  - Copy and paste
  - Verify works

- [ ] **DeepSeek** (if available)
  - Navigate to `https://chat.deepseek.com`
  - Verify provider detected
  - Build context
  - Copy and paste
  - Verify works

---

## 🧪 Test Project

The test project is located in `test-project/` and contains:

```
test-project/
├── src/
│   ├── app.ts          # Main application
│   ├── auth.ts         # Authentication module
│   └── utils.ts        # Utility functions
├── tests/
│   └── app.test.ts     # Application tests
├── .env                # Environment variables (FAKE)
├── .env.local          # Local environment (FAKE)
├── credentials.json    # Credentials (FAKE)
├── private.key         # Private key (FAKE)
├── package.json        # Package configuration
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

**Important**: All sensitive files contain FAKE test data only. Never use real credentials.

---

## 🔒 Security Verification

### Tests to Perform

1. **Path Traversal**
   - Try: `../../secret.txt`
   - Expected: BLOCKED

2. **Sensitive Files**
   - Try: `.env`, `.env.local`, `credentials.json`, `private.key`
   - Expected: BLOCKED

3. **Outside Project**
   - Try: `C:\Windows\System32\config`
   - Expected: BLOCKED

4. **Unauthorized Write**
   - Try: Write without permission
   - Expected: PERMISSION REQUIRED

5. **Delete Request**
   - Try: Delete file
   - Expected: BLOCKED

---

## 🤖 Provider Testing

### Generic Mode (Always Available)

Generic Mode works with ANY web AI chatbot:

1. Select project
2. Build context
3. Copy context
4. Open any AI chatbot
5. Paste context
6. Ask question
7. Verify response

### Provider-Specific Adapters

#### ChatGPT
- Navigate to `https://chat.openai.com`
- Verify provider detected
- Build context
- Copy and paste
- Verify works

#### Gemini
- Navigate to `https://gemini.google.com`
- Verify provider detected
- Build context
- Copy and paste
- Verify works

#### DeepSeek
- Navigate to `https://chat.deepseek.com`
- Verify provider detected
- Build context
- Copy and paste
- Verify works

---

## 📊 Test Report

After completing tests, generate a report:

```cmd
generate-test-report.bat
```

This creates `TEST_REPORT.md` with:
- System information
- Prerequisites status
- Build status
- Automated test results
- Manual test results
- Security status
- Privacy status
- Known limitations
- Next steps

---

## 🐛 Troubleshooting

### Agent Not Connecting

**Problem**: Extension shows "Disconnected"

**Solutions**:
1. Verify agent is running:
   ```cmd
   tasklist | findstr ulab-agent
   ```
2. Check Native Messaging manifest:
   ```cmd
   type "%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json"
   ```
3. Verify Extension ID matches
4. Check Chrome console for errors

### Extension Not Loading

**Problem**: Chrome shows error when loading extension

**Solutions**:
1. Verify all files exist in `extension/`
2. Check `manifest.json` is valid JSON
3. Verify PNG icons exist (if referenced)
4. Check Chrome console for errors

### Files Not Accessible

**Problem**: Agent cannot access files

**Solutions**:
1. Verify project folder is authorized
2. Check files are not in ignored patterns
3. Verify files are not sensitive
4. Check permissions

---

## 📝 Reporting Issues

If you encounter issues:

1. Run `diagnose.bat` and save output
2. Run `run-tests.bat` and save output
3. Open Chrome DevTools (F12)
4. Go to Console tab
5. Reproduce the issue
6. Copy console errors
7. Create issue on GitHub with:
   - Diagnostic output
   - Test output
   - Console errors
   - Steps to reproduce

---

## 🎯 Success Criteria

The installation is successful when:

- ✅ All automated tests pass
- ✅ Agent connects to extension
- ✅ Project loads successfully
- ✅ File operations work
- ✅ Security restrictions enforced
- ✅ Generic Mode works
- ✅ At least one provider works

---

## 📚 Additional Resources

- **README.md** - Project overview
- **INSTALL.md** - Installation guide
- **USER_GUIDE.md** - User manual
- **ARCHITECTURE.md** - Technical architecture
- **SECURITY.md** - Security model
- **PRIVACY.md** - Privacy policy

---

## 🎉 Next Steps

After successful testing:

1. ✅ Complete all manual tests
2. ✅ Generate test report
3. ✅ Fix any issues found
4. ✅ Re-test until all pass
5. ✅ Prepare for deployment

---

**Last Updated**: 2026-09-13  
**Version**: 1.0.0  
**Status**: Ready for Testing
