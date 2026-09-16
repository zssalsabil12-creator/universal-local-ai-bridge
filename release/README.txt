ULAB — WINDOWS RELEASE V1.0.0
==============================

PRIMARY INSTALLER
-----------------
Use ULAB-Setup.exe for the normal user experience. It is a self-contained
Windows installer that carries the ULAB release payload and installs it into:
%LOCALAPPDATA%\ULAB

INSTALL
-------
1. Download ULAB-Setup.exe from the ULAB website.
2. Run the installer.
3. ULAB creates a desktop launcher and opens Chrome extension management.
4. In Chrome, enable Developer mode and choose Load unpacked.
5. Select: %LOCALAPPDATA%\ULAB\extension
6. Launch ULAB from the desktop shortcut.

WHY THE CHROME STEP EXISTS
--------------------------
Chrome does not allow a normal Windows installer to silently install an
unpacked extension. Until ULAB is published in the Chrome Web Store or an
enterprise policy is used, the one-time Load unpacked step is required.
The installer performs everything else automatically.

NORMAL USE
----------
Launch ULAB from the desktop shortcut. The launcher starts the local Agent
on 127.0.0.1:19999 with a sandbox workspace under the current Windows profile,
then opens Chrome extension management when needed.

SECURITY MODEL
--------------
- Agent listens on localhost only.
- WebSocket RPC requires the local security token.
- Extension connections are restricted to localhost:19999.
- Workspace paths are sandboxed by the Agent.
- Sensitive files are excluded by policy.
- File writes/deletes and risky terminal operations require approval.
- Sessions are invalidated when the active workspace changes.
- Audit records track important operations and redact secrets.

PRIVACY
-------
ULAB is local-first. Project files are accessed by the local Agent only
inside the selected workspace. The website does not need to host project
files for the local bridge to operate.

ADVANCED / PORTABLE
-------------------
ULAB-Windows.zip is retained for developers and advanced users. Ordinary
users should prefer ULAB-Setup.exe and should not need to manipulate release
files manually.

DEVELOPMENT
-----------
Source: C:\Users\PC\ulab
Web build: npm run build
Agent build: cd agent && npm run build
Agent package: cd agent && npm run package
Windows installer source: scripts\ulab-installer.js
