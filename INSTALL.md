# Installation Guide

This guide provides detailed installation instructions for Universal Local AI Bridge (ULAB).

---

## System Requirements

### Operating System
- **Windows 10** or later (64-bit recommended)
- **Chrome** or **Edge** browser (latest version)

### Software Requirements
- **Node.js 18+** (for Local Agent)
- **npm** (included with Node.js)

### Hardware Requirements
- **RAM**: 2 GB minimum (4 GB recommended)
- **Disk Space**: 500 MB for ULAB + project space
- **Internet**: Required for initial setup only

---

## Installation Methods

### Method 1: Automated Installer (Recommended)

#### Step 1: Download
Download the latest release from the [Releases page](https://github.com/yourusername/ulab/releases):
- `ULAB-Setup.exe` - Automated installer
- Or `windows-installer.bat` - Manual installer script

#### Step 2: Run Installer
1. Right-click `ULAB-Setup.exe` or `windows-installer.bat`
2. Select **"Run as administrator"**
3. Follow the installation wizard

#### Step 3: Installation Process
The installer will:
1. ✅ Check prerequisites (Node.js, Chrome)
2. ✅ Create installation directory
3. ✅ Copy Local Agent files
4. ✅ Copy Extension files
5. ✅ Prompt for Chrome Extension ID
6. ✅ Register Native Messaging Host
7. ✅ Create desktop shortcut
8. ✅ Create uninstaller

#### Step 4: Load Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
4. Enable **"Developer mode"** (toggle in top-right)
5. Click **"Load unpacked"**
6. Select: `C:\Program Files\ULAB\extension`
7. Copy the **Extension ID** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

#### Step 5: Complete Native Messaging Registration
The installer will ask for your Extension ID:
1. Enter the Extension ID you copied
2. Press Enter
3. Installation completes

#### Step 6: Start ULAB
1. Click the ULAB icon in Chrome toolbar
3. Click **"Connect Agent"**
4. Status should change to **"Connected"**

---

### Method 2: Manual Installation

If you prefer manual installation or the automated installer doesn't work:

#### Prerequisites
1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Install with default settings
   - Verify: `node --version` (should show v18+)

2. **Install Chrome/Edge**:
   - Download from [google.com/chrome](https://www.google.com/chrome/)
   - Or use Microsoft Edge (pre-installed on Windows 10+)

#### Step 1: Build Local Agent
```cmd
# Open Command Prompt as Administrator
cd path\to\ulab\agent

# Install dependencies
npm install

# Build TypeScript
npm run build

# Package executable
npm run package
```

This creates: `agent\dist\ulab-agent.exe`

#### Step 2: Install Local Agent
```cmd
# Create installation directory
mkdir "C:\Program Files\ULAB"

# Copy executable
copy agent\dist\ulab-agent.exe "C:\Program Files\ULAB\"

# Copy configuration
copy agent\native-messaging\com.ulab.agent.json "C:\Program Files\ULAB\"
```

#### Step 3: Load Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"**
4. Click **"Load unpacked"**
5. Select: `path\to\ulab\extension`
6. Copy the **Extension ID**

#### Step 4: Register Native Messaging Host
1. Open the manifest file:
   ```cmd
   notepad agent\native-messaging\com.ulab.agent.json
   ```

2. Update the file with your paths:
   ```json
   {
     "name": "com.ulab.agent",
     "description": "Universal Local AI Bridge - Local Agent",
     "path": "C:\\Program Files\\ULAB\\ulab-agent.exe",
     "type": "stdio",
     "allowed_origins": [
       "chrome-extension://YOUR_EXTENSION_ID/"
     ]
   }
   ```
   Replace `YOUR_EXTENSION_ID` with the ID you copied.

3. Save the file

4. Copy to Chrome's Native Messaging directory:
   ```cmd
   copy agent\native-messaging\com.ulab.agent.json "%APPDATA%\Google\Chrome\NativeMessagingHosts\"
   ```

#### Step 5: Verify Installation
1. Click the ULAB icon in Chrome
2. Click **"Connect Agent"**
3. Status should show **"Connected"**

---

## Verification

After installation, verify everything works:

### Check 1: Local Agent Running
```cmd
tasklist | findstr ulab-agent
```
Should show the process running.

### Check 2: Native Messaging Registered
```cmd
type "%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json"
```
Should show the manifest content.

### Check 3: Extension Loaded
1. Open `chrome://extensions/`
2. Find "Universal Local AI Bridge"
3. Should show no errors

### Check 4: Connection Works
1. Click ULAB icon in Chrome
2. Click "Connect Agent"
3. Should show "Connected" status

---

## Uninstallation

### Method 1: Using Uninstaller
1. Go to: `C:\Program Files\ULAB\`
2. Run: `uninstall.bat` as Administrator
3. Follow the prompts

### Method 2: Manual Uninstallation
```cmd
# Remove Native Messaging Host
del "%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json"

# Remove installation directory
rmdir /s /q "C:\Program Files\ULAB"

# Remove desktop shortcut
del "%USERPROFILE%\Desktop\ULAB.lnk"
```

### Remove Extension from Chrome
1. Open `chrome://extensions/`
2. Find "Universal Local AI Bridge"
3. Click **"Remove"**

---

## Troubleshooting

### Issue: "Node.js not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: "Chrome not found"
**Solution**: Install Chrome or use Microsoft Edge

### Issue: "Extension ID required"
**Solution**: 
1. Load the extension in Chrome first
2. Copy the Extension ID from `chrome://extensions/`
3. Enter it in the installer

### Issue: "Connection failed"
**Solution**:
1. Verify Local Agent is running: `tasklist | findstr ulab-agent`
2. Verify Native Messaging manifest exists
3. Verify Extension ID matches in manifest
4. Restart Chrome

### Issue: "Permission denied"
**Solution**: Run installer as Administrator

### Issue: "Native Messaging not working"
**Solution**:
1. Verify manifest path is correct
2. Verify Extension ID is correct
3. Restart Chrome completely
4. Check Chrome console for errors (F12)

---

## Advanced Configuration

### Custom Installation Directory
During installation, you can choose a custom directory. Recommended:
- `C:\Program Files\ULAB` (default)
- `C:\ULAB` (alternative)

### Multiple Chrome Profiles
If you use multiple Chrome profiles:
1. Install ULAB for each profile
2. Each profile needs its own Extension ID
3. Update Native Messaging manifest for each ID

### Portable Installation
For portable installation (no admin rights):
1. Copy ULAB folder to USB drive
2. Run Local Agent manually: `ulab-agent.exe`
3. Load extension in Chrome
4. Note: Native Messaging requires registration (may not work in portable mode)

---

## Post-Installation

### First Project Setup
1. Open ULAB in Chrome
2. Click "Connect Agent"
3. Click "Select Project"
4. Choose your project folder
5. Wait for indexing to complete
6. Start using ULAB!

### Update ULAB
To update to a new version:
1. Download new release
2. Run installer (will overwrite existing files)
3. Reload extension in Chrome
4. Native Messaging registration remains valid

### Backup Configuration
Backup these files before reinstalling:
- `%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json`
- Your project settings (stored in project folder)

---

## Support

If you encounter issues:
1. Check [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/yourusername/ulab/issues)
3. Create a new issue with:
   - Windows version
   - Chrome version
   - Node.js version
   - Error messages
   - Steps to reproduce

---

## Next Steps

After successful installation:
1. Read the [User Guide](USER_GUIDE.md)
2. Try your first project
3. Explore the features
4. Join the community

---

**Installation complete! You're ready to use ULAB.**
