# ULAB Agent Handoff Guide

Read this file and ARCHITECTURE.md before making changes.

## First rule
ULAB has four runtime boundaries. Never merge them for convenience.

- website/ = public website, ads, docs, legal, downloads
- web-app/ = browser workspace UI
- desktop/ = Electron shell + embedded AI + Desktop IPC
- agent/ = local filesystem/Git/terminal/security service
- shared/ = minimal cross-boundary contracts

## Where to edit

Website problem -> website/
Workspace UI problem -> web-app/
AI page embedding / Electron / packaging -> desktop/
Local filesystem / terminal / Git / sandbox / auth -> agent/
Shared request/response types -> shared/

## Runtime facts

The Desktop loads web-app/dist/index.html in production.
During development Desktop expects the Web App at http://localhost:3001.
The Desktop starts the Agent from agent/dist/index.js.
The Agent listens on localhost:19999.
The AI web page never receives the Agent token.

## Development order

1. Read ARCHITECTURE.md.
2. Identify the owning boundary.
3. Make the smallest change inside that boundary.
4. Run the affected typecheck/build/test.
5. Run npm run verify before declaring a cross-boundary change complete.
6. For Desktop packaging, run npm run desktop:build only after the Web App and Agent are green.

## Forbidden legacy paths

Do not reintroduce:
- Chrome Extension
- Chrome Side Panel
- Native Messaging
- extension/
- browser-extension runtime
- Electron code inside website/ or web-app/

## Important verification rule

A successful build is not proof of AI connectivity. AI connectivity requires a Desktop runtime smoke test with:
Web App loaded + Agent healthy + an embedded AI session opened + bridge action observed.

If a provider-specific DOM/API behavior is unverified, record it as unverified instead of claiming universal support.
