# 🏗️ Build Instructions - Universal Local AI Bridge

This document provides step-by-step instructions for building ULAB on Windows.

---

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Chrome or Edge** - Latest version

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/ulab.git
cd ulab
```

---

## Step 2: Install Dependencies

### Web Dashboard (Optional)
```bash
npm install
```

### Local Agent
```bash
cd agent
npm install
cd ..
```

---

## Step 3: Create Extension Icons

The extension requires PNG icons. You have two options:

### Option A: Automatic (Recommended)

Install sharp and run the converter:

```bash
npm install sharp
node convert-icons.js
```

This will convert SVG icons to PNG format.

### Option B: Manual

1. Use an online converter like [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Convert `extension/icons/icon16.svg` to `icon16.png` (16x16)
3. Convert `extension/icons/icon48.svg` to `icon48.png` (48x48)
4. Convert `extension/icons/icon128.svg` to `icon128.png` (128x128)
5. Place the PNG files in `extension/icons/`

### Option C: Use Placeholders

For testing only:

```bash
node create-placeholder-icons.js
```

⚠️ **Note**: Placeholder icons are minimal and should be replaced with real designed icons before production.

---

## Step 4: Build the Extension

```bash
node build-extension.js
```

This will:
- Create `dist/extension/` directory
- Copy all extension files
- Verify required files
- Create `dist/UniversalLocalAIBridge-extension.zip`

**Expected output:**
```
✅ Build complete!

📦 Output:
  Extension: dist/extension
  ZIP: dist/UniversalLocalAIBridge-extension.zip
```

---

## Step 5: Build the Local Agent

```bash
cd agent
npm run build
```

This compiles TypeScript to JavaScript in `agent/dist/`.

### Create Windows Executable (Optional)

```bash
npm run package
```

This creates `agent/dist/ulab-agent.exe` using `pkg`.

⚠️ **Note**: The `pkg` tool creates a standalone executable that includes Node.js runtime.

---

## Step 6: Install the Local Agent

### Automatic Installation

Run the installer as Administrator:

```bash
cd agent
install.bat
```

The installer will:
1. Copy `ulab-agent.exe` to `C:\Program Files\ULAB\`
2. Create Native Messaging manifest
3. Register the agent with Chrome

### Manual Installation

1. **Copy the executable:**
   ```cmd
   mkdir "C:\Program Files\ULAB"
   copy agent\dist\ulab-agent.exe "C:\Program Files\ULAB\"
   ```

2. **Create Native Messaging manifest:**
   
   Create file: `%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json`
   
   Content:
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
   
   Replace `YOUR_EXTENSION_ID` with your actual extension ID (found in `chrome://extensions/`).

---

## Step 7: Load the Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `dist/extension` folder
6. Note the **Extension ID** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

---

## Step 8: Update Native Messaging (If Needed)

If you loaded the extension after installing the agent:

1. Copy the Extension ID from `chrome://extensions/`
2. Edit `%APPDATA%\Google\Chrome\NativeMessagingHosts\com.ulab.agent.json`
3. Update the `allowed_origins` array:
   ```json
   "allowed_origins": [
     "chrome-extension://YOUR_ACTUAL_EXTENSION_ID/"
   ]
   ```

---

## Step 9: Test the Installation

1. Click the ULAB icon in Chrome toolbar
2. The side panel should open
3. Click **Connect Agent**
4. Status should change to **Connected**
5. Click **Select Project**
6. Choose a test project folder
7. Browse the file tree
8. Test search functionality

---

## Troubleshooting

### Extension not loading

**Problem**: Chrome shows an error when loading the extension

**Solutions**:
- Check that all required files exist in `dist/extension/`
- Verify `manifest.json` is valid JSON
- Check Chrome console for errors (right-click extension → "Inspect views")

### Agent not connecting

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
3. Verify Extension ID matches in manifest
4. Check Chrome console for errors

### Icons not displaying

**Problem**: Extension shows default icon

**Solutions**:
- Verify PNG files exist in `extension/icons/`
- Check file sizes are correct (16x16, 48x48, 128x128)
- Reload extension after adding icons

### Path not allowed errors

**Problem**: Agent cannot access files

**Solutions**:
- Ensure project folder is within authorized paths
- Check that files are not in ignored patterns (node_modules, .git, etc.)
- Verify sensitive files are not being accessed (.env, .key, etc.)

---

## Build Verification

After building, verify:

### Extension
- [ ] `dist/extension/manifest.json` exists
- [ ] `dist/extension/background/service-worker.js` exists
- [ ] `dist/extension/sidepanel/index.html` exists
- [ ] `dist/extension/sidepanel/styles.css` exists
- [ ] `dist/extension/sidepanel/panel.js` exists
- [ ] `dist/extension/content/content.js` exists
- [ ] `dist/extension/icons/icon16.png` exists
- [ ] `dist/extension/icons/icon48.png` exists
- [ ] `dist/extension/icons/icon128.png` exists
- [ ] `dist/UniversalLocalAIBridge-extension.zip` exists

### Agent
- [ ] `agent/dist/index.js` exists
- [ ] `agent/dist/ulab-agent.exe` exists (if packaged)
- [ ] Native Messaging manifest exists

---

## Development Mode

For development, you can run the agent in watch mode:

```bash
cd agent
npm run dev
```

This will:
- Compile TypeScript
- Run the agent
- Watch for file changes

---

## Production Build

For production deployment:

1. Build everything:
   ```bash
   npm run build        # Web dashboard
   node build-extension.js  # Extension
   cd agent && npm run build && npm run package  # Agent
   ```

2. Test thoroughly on Windows

3. Create installer package

4. Distribute to users

---

## File Structure After Build

```
ulab/
├── dist/
│   ├── extension/              # Chrome extension
│   │   ├── manifest.json
│   │   ├── background/
│   │   │   └── service-worker.js
│   │   ├── sidepanel/
│   │   │   ├── index.html
│   │   │   ├── styles.css
│   │   │   └── panel.js
│   │   ├── content/
│   │   │   └── content.js
│   │   └── icons/
│   │       ├── icon16.png
│   │       ├── icon48.png
│   │       └── icon128.png
│   ├── UniversalLocalAIBridge-extension.zip
│   └── index.html              # Web dashboard
│
├── agent/
│   └── dist/
│       ├── index.js            # Compiled agent
│       └── ulab-agent.exe      # Windows executable
│
└── extension/                  # Source files
    ├── manifest.json
    ├── background/
    ├── sidepanel/
    ├── content/
    └── icons/
```

---

## Next Steps

After successful build:

1. ✅ Test extension in Chrome
2. ✅ Test agent on Windows
3. ✅ Test Native Messaging connection
4. ✅ Test file operations
5. ✅ Test security restrictions
6. ✅ Create user documentation
7. ✅ Prepare for release

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/ulab/issues
- Documentation: See README.md, INSTALL.md, USER_GUIDE.md

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0
