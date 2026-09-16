# Troubleshooting Guide

This guide helps you resolve common issues with Universal Local AI Bridge (ULAB).

---

## Quick Diagnostics

### Run Diagnostic Tool
```cmd
# Windows
cd windows-runtime-test
diagnose.bat
```

This checks:
- ✅ Node.js installation
- ✅ Chrome/Edge installation
- ✅ ULAB components
- ✅ Native Messaging configuration
- ✅ Extension files

---

## Installation Issues

### Issue: "Node.js not found"

**Symptoms**:
- Installer shows "Node.js not found"
- Local Agent won't start

**Solutions**:

1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose LTS version (18+)
   - Install with default settings

2. **Verify Installation**:
   ```cmd
   node --version
   npm --version
   ```
   Should show version numbers.

3. **Restart Computer**:
   - Sometimes PATH needs refresh
   - Restart after installation

4. **Manual PATH**:
   If Node.js is installed but not found:
   ```cmd
   # Add to PATH
   set PATH=%PATH%;C:\Program Files\nodejs
   ```

---

### Issue: "Chrome not found"

**Symptoms**:
- Installer shows "Chrome not found"
- Can't load extension

**Solutions**:

1. **Install Chrome**:
   - Download from [google.com/chrome](https://www.google.com/chrome/)
   - Install with default settings

2. **Use Edge Instead**:
   - Microsoft Edge works too
   - Pre-installed on Windows 10+

3. **Check Installation**:
   ```cmd
   # Check common locations
   dir "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
   dir "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
   dir "%LocalAppData%\Google\Chrome\Application\chrome.exe"
   ```

---

### Issue: "Permission denied" during installation

**Symptoms**:
- Installer fails with permission error
- Can't create directories

**Solutions**:

1. **Run as Administrator**:
   - Right-click installer
   - Select "Run as administrator"

2. **Check Antivirus**:
   - Temporarily disable antivirus
   - Run installer
   - Re-enable antivirus

3. **Manual Installation**:
   - Follow manual installation steps in [INSTALL.md](INSTALL.md)

---

## Connection Issues

### Issue: "Agent not connected"

**Symptoms**:
- Extension shows "Disconnected"
- Can't select project
- Status shows red indicator

**Solutions**:

1. **Check Local Agent**:
   ```cmd
   tasklist | findstr ulab-agent
   ```
   Should show the process.

2. **Start Local Agent**:
   ```cmd
   cd "C:\Program Files\ULAB"
   .\ulab-agent.exe
   ```

3. **Check Native Messaging**:
   ```cmd
   type "%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json"
   ```
   Should show manifest content.

4. **Verify Extension ID**:
   - Open `chrome://extensions/`
   - Find ULAB extension
   - Copy Extension ID
   - Compare with manifest

5. **Restart Chrome**:
   - Close all Chrome windows
   - Reopen Chrome
   - Try connecting again

---

### Issue: "Native Messaging not working"

**Symptoms**:
- Extension loads but can't connect
- Console shows Native Messaging errors

**Solutions**:

1. **Check Manifest Path**:
   ```json
   {
     "path": "C:\\Program Files\\ULAB\\ulab-agent.exe"
   }
   ```
   Verify path is correct and file exists.

2. **Check Extension ID**:
   ```json
   {
     "allowed_origins": [
       "chrome-extension://YOUR_EXTENSION_ID/"
     ]
   }
   ```
   Verify Extension ID matches.

3. **Re-register Manifest**:
   ```cmd
   # Delete old manifest
   del "%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json"
   
   # Copy new manifest
   copy "C:\Program Files\ULAB\com.ulab.agent.json" "%APPDATA%\Google\Chrome\NativeMessagingHosts\"
   ```

4. **Restart Chrome**:
   - Close all Chrome windows
   - Reopen Chrome
   - Try connecting again

---

## Extension Issues

### Issue: "Extension won't load"

**Symptoms**:
- Chrome shows error when loading extension
- Extension doesn't appear

**Solutions**:

1. **Check Files**:
   ```cmd
   dir "C:\Program Files\ULAB\extension\manifest.json"
   ```
   Should exist.

2. **Reload Extension**:
   - Go to `chrome://extensions/`
   - Click refresh icon on ULAB
   - Check for errors

3. **Check Console**:
   - Right-click extension
   - Select "Inspect views"
   - Check console for errors

4. **Reinstall Extension**:
   ```cmd
   # Remove old extension
   # Go to chrome://extensions/ and remove ULAB
   
   # Load new extension
   # chrome://extensions/ → Developer mode → Load unpacked
   # Select: C:\Program Files\ULAB\extension
   ```

---

### Issue: "Side Panel won't open"

**Symptoms**:
- Click extension icon but nothing happens
- Side Panel doesn't appear

**Solutions**:

1. **Check Permissions**:
   - Go to `chrome://extensions/`
   - Click ULAB extension
   - Verify "Side Panel" permission is enabled

2. **Open Manually**:
   - Click Chrome menu (three dots)
   - Select "More tools" → "Extensions"
   - Find ULAB and click

3. **Restart Chrome**:
   - Close all Chrome windows
   - Reopen Chrome
   - Try again

---

## Project Issues

### Issue: "Can't select project"

**Symptoms**:
- "Select Project" button doesn't work
- Can't browse folders

**Solutions**:

1. **Check Agent Connection**:
   - Verify agent is connected
   - Check status shows "Connected"

2. **Check Permissions**:
   - Ensure you have read access to folders
   - Try selecting a different folder

3. **Restart Agent**:
   ```cmd
   # Kill agent
   taskkill /f /im ulab-agent.exe
   
   # Restart agent
   cd "C:\Program Files\ULAB"
   start ulab-agent.exe
   ```

---

### Issue: "Indexing is slow"

**Symptoms**:
- Project indexing takes too long
- UI is unresponsive

**Solutions**:

1. **Wait for Completion**:
   - Large projects take time
   - 1000+ files: 30-60 seconds
   - 10000+ files: 2-5 minutes

2. **Exclude Large Directories**:
   - Add to `.gitignore`:
     ```
     node_modules/
     dist/
     build/
     ```

3. **Use Smaller Projects**:
   - Start with smaller projects
   - Test with 100-500 files first

---

## Execution Issues

### Issue: "Command won't execute"

**Symptoms**:
- Click "Test" or "Build" but nothing happens
- Command shows as blocked

**Solutions**:

1. **Check Risk Level**:
   - High-risk commands need approval
   - Look for approval dialog

2. **Check Approval**:
   - Review approval dialog
   - Click "Approve" if safe

3. **Check Command**:
   - Verify command is in allowlist
   - Check working directory

---

### Issue: "Tests fail after changes"

**Symptoms**:
- Tests pass before changes
- Tests fail after applying AI changes

**Solutions**:

1. **Review Changes**:
   - Check what changed
   - Understand the diff
   - Verify changes are correct

2. **Use Rollback**:
   - Open Rollback section
   - Select previous snapshot
   - Click "Rollback"

3. **Manual Fix**:
   - Review test output
   - Fix issues manually
   - Re-run tests

---

## Git Issues

### Issue: "Can't create commit"

**Symptoms**:
- "Create Commit" button doesn't work
- Commit fails

**Solutions**:

1. **Check for Sensitive Files**:
   - Review staged files
   - Remove sensitive files:
     ```cmd
     git reset HEAD .env
     ```

2. **Check Git Status**:
   ```cmd
   git status
   ```
   Verify changes are staged.

3. **Manual Commit**:
   ```cmd
   git add .
   git commit -m "Your message"
   ```

---

### Issue: "Sensitive file detected"

**Symptoms**:
- ULAB blocks commit
- Shows "Sensitive file detected"

**Solutions**:

1. **Remove Sensitive Files**:
   ```cmd
   git reset HEAD .env
   git reset HEAD credentials.json
   ```

2. **Add to .gitignore**:
   ```
   .env
   credentials.json
   *.key
   *.pem
   ```

3. **Use Environment Variables**:
   - Don't commit secrets
   - Use `.env` files locally
   - Use environment variables in production

---

## Performance Issues

### Issue: "ULAB is slow"

**Symptoms**:
- UI is laggy
- Operations take too long

**Solutions**:

1. **Clear Operation Log**:
   - Open Operation Log
   - Click "Clear"
   - Reduces memory usage

2. **Close Unused Projects**:
   - Select only active project
   - Reduce indexing overhead

3. **Restart Chrome**:
   - Close all Chrome windows
   - Reopen Chrome
   - Fresh start

4. **Check System Resources**:
   ```cmd
   taskmgr
   ```
   Check CPU and memory usage.

---

## Security Issues

### Issue: "Path traversal blocked"

**Symptoms**:
- ULAB blocks file access
- Shows "Path traversal detected"

**Solutions**:

1. **Use Valid Paths**:
   - Stay within project root
   - Don't use `..` in paths
   - Use relative paths

2. **Check Project Root**:
   - Verify selected project
   - Ensure files are within project

---

### Issue: "Command blocked"

**Symptoms**:
- ULAB blocks command execution
- Shows "Command not allowed"

**Solutions**:

1. **Use Allowed Commands**:
   - Check command allowlist
   - Use approved commands only

2. **Request Approval**:
   - High-risk commands need approval
   - Review and approve if safe

---

## AI Integration Issues

### Issue: "Context not building"

**Symptoms**:
- Can't build context
- No files selected

**Solutions**:

1. **Check Project**:
   - Verify project is selected
   - Wait for indexing to complete

2. **Ask Clear Question**:
   - Be specific
   - Use keywords from your project
   - Try different phrasing

3. **Manual Selection**:
   - Browse file tree
   - Select files manually
   - Build context manually

---

### Issue: "AI response not parsed"

**Symptoms**:
- AI responds but ULAB doesn't detect changes
- No diff shown

**Solutions**:

1. **Check Response Format**:
   - AI must use proper format
   - Use code blocks for changes
   - Follow ULAB format

2. **Manual Review**:
   - Copy AI response
   - Review changes manually
   - Apply changes manually if needed

---

## Uninstallation Issues

### Issue: "Can't uninstall"

**Symptoms**:
- Uninstaller doesn't work
- Files remain after uninstall

**Solutions**:

1. **Run as Administrator**:
   - Right-click uninstaller
   - Select "Run as administrator"

2. **Manual Uninstall**:
   ```cmd
   # Remove Native Messaging
   del "%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json"
   
   # Remove installation
   rmdir /s /q "C:\Program Files\ULAB"
   
   # Remove shortcut
   del "%USERPROFILE%\Desktop\ULAB.lnk"
   ```

3. **Remove Extension**:
   - Go to `chrome://extensions/`
   - Find ULAB
   - Click "Remove"

---

## Getting Help

### Before Asking for Help

1. **Run Diagnostics**:
   ```cmd
   cd windows-runtime-test
   diagnose.bat
   ```

2. **Check Logs**:
   - Open Operation Log
   - Check for errors
   - Note timestamps

3. **Check Console**:
   - Open Chrome DevTools (F12)
   - Check console for errors
   - Note error messages

### Providing Information

When asking for help, include:

1. **System Information**:
   - Windows version
   - Chrome version
   - Node.js version

2. **Error Messages**:
   - Exact error text
   - Screenshots if possible
   - Console output

3. **Steps to Reproduce**:
   - What you were doing
   - What you expected
   - What actually happened

### Support Channels

- **Documentation**: Check docs folder
- **GitHub Issues**: [GitHub Issues](https://github.com/yourusername/ulab/issues)
- **GitHub Discussions**: [GitHub Discussions](https://github.com/yourusername/ulab/discussions)

---

## Common Error Messages

### "Path traversal detected"
**Meaning**: Trying to access files outside project  
**Solution**: Use valid paths within project

### "Command not allowed"
**Meaning**: Command not in allowlist  
**Solution**: Use allowed commands only

### "Sensitive file detected"
**Meaning**: Trying to access protected file  
**Solution**: Don't access sensitive files

### "Agent not connected"
**Meaning**: Local Agent not running  
**Solution**: Start Local Agent

### "Native Messaging failed"
**Meaning**: Native Messaging not configured  
**Solution**: Check manifest and Extension ID

---

## Prevention Tips

### Best Practices

1. **Keep ULAB Updated**
   - Install updates promptly
   - Get bug fixes
   - Get security patches

2. **Regular Maintenance**
   - Clear operation log
   - Delete unused context packages
   - Review memory entries

3. **Backup Configuration**
   - Backup Native Messaging manifest
   - Backup project settings
   - Keep installation media

4. **Monitor Operations**
   - Review operation log
   - Check for unusual activity
   - Report suspicious behavior

---

**Still having issues? Check the [GitHub Issues](https://github.com/yourusername/ulab/issues) or create a new issue with detailed information.**
