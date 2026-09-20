# ULAB Agent Handoff Guide

Read this file and ARCHITECTURE.md before making changes.

## First rule
ULAB has three product boundaries plus shared contracts. Never merge them for convenience.

- website/ = public marketing site, ads, legal and downloads
- desktop/ = installable Electron product + Workspace renderer + embedded AI bridge
- agent/ = local filesystem/Git/terminal/security authority
- shared/ = minimal cross-boundary contracts

## Where to edit

Website problem -> website/
Desktop Workspace UI / AI bridge / Electron / packaging -> desktop/
Local filesystem / terminal / Git / sandbox / auth -> agent/
Shared request/response types -> shared/

## Runtime facts

The public website is an independent Vite marketing/download site built to website/dist.
The Desktop loads desktop/renderer/dist/index.html in production.
During development Desktop expects its renderer at http://localhost:3001.
The Desktop starts the Agent from agent/dist/index.js.
The Agent listens on localhost:19999.
The AI web page never receives the Agent token.

## Development order

1. Read ARCHITECTURE.md.
2. Identify the owning boundary.
3. Make the smallest change inside that boundary.
4. Run the affected typecheck/build/test.
5. Run npm run verify before declaring a cross-boundary change complete.
6. For Desktop packaging, run npm run desktop:build only after the Desktop renderer and Agent are green.

## Forbidden legacy paths

Do not reintroduce:
- Chrome Extension
- Chrome Side Panel
- Native Messaging
- extension/
- browser-extension runtime
- Electron code inside website/

## Important verification rule

A successful build is not proof of AI connectivity. AI connectivity requires a Desktop runtime smoke test with:
Desktop Workspace renderer loaded + Agent healthy + an embedded AI session opened + bridge action observed.

If a provider-specific DOM/API behavior is unverified, record it as unverified instead of claiming universal support.
