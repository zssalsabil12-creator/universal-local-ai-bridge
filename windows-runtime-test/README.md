# ULAB Windows Runtime Test Package

**Version**: 1.0.0  
**Date**: 2026-09-13  
**Status**: Ready for Testing

---

## 📦 What's Included

This package contains everything needed to test Universal Local AI Bridge on Windows:

### Scripts
- `diagnose.bat` - Check system requirements
- `run-tests.bat` - Run automated tests
- `install-agent.bat` - Install Local Agent
- `uninstall-agent.bat` - Uninstall Local Agent
- `generate-test-report.bat` - Generate test report

### Documentation
- `WINDOWS_RUNTIME_GUIDE.md` - Complete testing guide
- `TEST_REPORT.md` - Test report template
- `CHROME_TEST_ASSISTANT.html` - Interactive test checklist

### Test Project
- `test-project/` - Sample project for testing

---

## 🚀 Quick Start

### Step 1: Run Diagnostics

Double-click `diagnose.bat` to check your system:

```
✅ Windows version
✅ Node.js and npm
✅ Chrome/Edge
✅ ULAB components
```

### Step 2: Run Automated Tests

Double-click `run-tests.bat` to run automated tests:

```
✅ 13/15 tests pass
⚠️ 2 tests blocked (require Chrome)
```

### Step 3: Install Agent

Run `install-agent.bat` as Administrator:

1. Builds the agent
2. Installs to `C:\Program Files\ULAB\`
3. Configures Native Messaging
4. Requires Chrome Extension ID

### Step 4: Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension/` folder
6. Copy the Extension ID

### Step 5: Complete Manual Tests

Open `CHROME_TEST_ASSISTANT.html` in Chrome and follow the checklist.

---

## 📋 Test Coverage

### Automated Tests (15 total)

#### Prerequisites Check (6 tests)
- Windows version
- System architecture
- Node.js presence
- npm presence
- Chrome presence
- Edge presence

#### Build Tests (2 tests)
- Extension manifest
- Agent source

#### Security Tests (5 tests)
- Path traversal prevention
- Sensitive file protection
- Project boundary enforcement
- Permission system
- Action validation

#### Context Engine Tests (3 tests)
- Project indexing
- Search functionality
- Context building

#### Integration Tests (3 tests)
- Extension package integrity
- Native Messaging configuration
- Installation scripts

#### Runtime Tests (2 tests - Blocked)
- Agent runtime (requires Chrome)
- Chrome extension loading (requires Chrome)

### Manual Chrome Tests (16 total)

#### Basic Functionality (3 tests)
- Extension loaded
- Side Panel opens
- Agent connected

#### Project Operations (4 tests)
- Project selected
- Project tree works
- Search works
- Safe file opens

#### Security Tests (2 tests)
- .env blocked
- Outside-project path blocked

#### File Operations (3 tests)
- Safe file created
- Safe modification approved
- Diff shown

#### Provider Tests (4 tests)
- Generic Mode
- ChatGPT
- Gemini
- DeepSeek

---

## 🔧 Requirements

### System Requirements
- Windows 10 or later
- 64-bit recommended
- Administrator privileges (for installation)

### Software Requirements
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (included with Node.js)
- Chrome or Edge browser

### Hardware Requirements
- 2 GB RAM minimum
- 500 MB disk space
- Internet connection (for initial setup only)

---

## 📖 Documentation

- **[WINDOWS_RUNTIME_GUIDE.md](WINDOWS_RUNTIME_GUIDE.md)** - Complete testing guide
- **[TEST_REPORT.md](TEST_REPORT.md)** - Test report template
- **[CHROME_TEST_ASSISTANT.html](CHROME_TEST_ASSISTANT.html)** - Interactive test checklist

Additional documentation:
- `../README.md` - Project overview
- `../INSTALL.md` - Installation guide
- `../USER_GUIDE.md` - User manual
- `../ARCHITECTURE.md` - Technical architecture
- `../SECURITY.md` - Security model
- `../PRIVACY.md` - Privacy policy

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

### Tests Failing

**Problem**: Automated tests fail

**Solutions**:
1. Run `diagnose.bat` to check prerequisites
2. Install missing dependencies
3. Run tests again
4. Check test output for details

---

## 📊 Expected Results

### After Automated Tests
```
Total Tests:    15
Passed:         13
Failed:         0
Blocked:        2
Pass Rate:      100%
```

### After Manual Tests
- ✅ All basic functionality tests pass
- ✅ All project operations tests pass
- ✅ All security tests pass
- ✅ All file operations tests pass
- ✅ Generic Mode works
- ✅ At least one provider works

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

## 🎉 Next Steps

After successful testing:

1. ✅ Complete all manual tests
2. ✅ Generate test report
3. ✅ Fix any issues found
4. ✅ Re-test until all pass
5. ✅ Prepare for deployment

---

## 📞 Support

- **Documentation**: See WINDOWS_RUNTIME_GUIDE.md
- **Issues**: Create issue on GitHub
- **Questions**: Check documentation first

---

**Last Updated**: 2026-09-13  
**Version**: 1.0.0  
**Status**: Ready for Testing
