# ULAB — Universal Local AI Bridge

ULAB is a privacy-first system that connects online AI conversations with a user-selected local workspace. The repository is intentionally split into independent product boundaries.

## Repository map

website/
Public website: product pages, documentation, legal pages, advertising and downloads.

web-app/
Browser application: workspace explorer, context, AI bridge UI, tasks, diffs, approvals, Git, terminal and tests.

desktop/
Windows Desktop shell: Electron, embedded online AI sessions, automatic AI-to-local bridge, desktop IPC and packaging.

agent/
Local execution service: workspace sandbox, files, Git, terminal, tests, permissions and audit logging.

shared/
Minimal contracts shared by components.

## The important distinction

The Website is not the Web App.
The Web App is not the Desktop shell.
The Desktop shell is not the Agent.

Desktop may load the Web App UI, but that does not change ownership: Electron code stays in desktop/, while the Web App remains independently buildable and deployable.

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
npm run web-app:typecheck
npm run web-app:build
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

The separated Web App production build and Desktop syntax checks must be treated independently from the final Desktop runtime/installer test. Do not mark the full product complete until the Desktop runtime path and packaged artifact have been tested.
