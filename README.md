# ULAB — Universal Local AI Bridge

ULAB is a privacy-first system that connects online AI conversations with a user-selected local workspace. The repository is intentionally split into independent product boundaries.

## Repository map

website/
Public Vite website: product presentation, documentation, legal pages, advertising and the Windows Desktop download.

web-app/
Legacy browser workspace archived under _archive/legacy-web-app; it is not part of the product runtime.

desktop/
Windows Desktop shell: Electron, embedded online AI sessions, automatic AI-to-local bridge, desktop IPC and packaging.

agent/
Local execution service: workspace sandbox, files, Git, terminal, tests, permissions and audit logging.

shared/
Minimal contracts shared by components.

## The important distinction

The Website is the public distribution layer. The Desktop application is the product runtime, and the Agent is its local authority.

The Desktop does not depend on the legacy Web App. Its renderer lives in desktop/renderer/ and is packaged inside the Windows application.

## Intended Desktop flow

Online AI session
        |
        v
ULAB Desktop
  | embedded AI page
  | automatic bridge
        |
        v
ULAB Agent
        |
        v
Selected local workspace

No Chrome extension, Side Panel, Native Messaging, or manual copy/paste is part of the intended architecture.

## Commands

npm run website:check
npm --prefix website run typecheck
npm --prefix website run build
npm run agent:build
npm run agent:test
npm run desktop:check
npm run verify
npm run desktop:build

## Security

The Agent is localhost-only and authenticated.
Workspace access is sandboxed to the selected root.
The AI page does not receive the Agent token.
Protected writes, deletes and execution remain subject to ULAB approval/security rules.

## Current verification status

The public website build and the Desktop product build are separate gates. Full release readiness requires the Desktop runtime, bundled Agent, embedded AI session path, installer and website download artifact to be verified.
