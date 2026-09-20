# ULAB Architecture Contract

This is the source-of-truth boundary map for ULAB. Future agents MUST read it before changing project structure or runtime ownership.

## Components

### website/
Public marketing and distribution site.
- Hosted online: presentation, documentation, legal pages, advertising and Desktop download.
- Normal web site only. MUST NOT contain Electron or Agent runtime code.

### desktop/
The installable ULAB product.
- Electron shell, Workspace renderer, embedded online AI sessions and AI-to-Agent bridge.
- Starts and supervises the Local Agent.
- Owns all Desktop-only IPC and provider web-content integration.
- The user does not run a separate Web App.

### desktop/renderer/
The Desktop Workspace UI.
- Project Explorer, Context Builder, AI Bridge UI, Agent/Tasks, Diff/Approval, Git, Terminal, Tests.
- Built locally into desktop/renderer/dist and loaded from the packaged application.
- It may use the safe preload API exposed by Electron.
- It MUST NOT access Electron Node APIs directly.

### agent/
Local execution/security authority.
- Owns filesystem, Git, terminal, tests, workspace sandbox and audit enforcement.
- Runs locally on localhost:19999.
- The AI web page NEVER receives the Agent token.

### shared/
Dependency-light contracts shared between Desktop renderer and Agent.
- Types/protocol contracts only.
- No UI, Electron or provider DOM code.

## Runtime topology

Website
  -> public presentation / documentation / downloads / ads

ULAB Desktop
  -> Workspace renderer
  -> embedded AI WebContentsView
  -> Desktop bridge
  -> authenticated Agent WebSocket
  -> selected local workspace

AI web pages NEVER receive the Agent token.

## Product invariants
1. No Chrome Extension, Side Panel or Native Messaging.
2. No manual copy/paste is required for the core AI-to-workspace loop.
3. Agent is the local authority; AI requests operations but never executes filesystem/terminal actions directly.
4. Workspace paths are relative to the selected sandbox and validated by Agent.
5. Mutating operations require the Agent approval policy.
6. Every important action is auditable.
7. Website and Desktop are separate products with separate responsibilities.
8. Provider-specific DOM behavior is treated as unverified until runtime-tested.
9. Generic fallback may support additional AI sites, but ULAB does not claim universal support without evidence.

## Runtime state machine

IDLE
-> AI_CONNECTED
-> CONTEXT_READY
-> TASK_ACTIVE
-> AI_THINKING
-> ACTION_DETECTED
-> VALIDATING
-> APPROVAL_REQUIRED
-> EXECUTING
-> RESULT_RETURNED
-> AI_CONTINUES
-> TASK_COMPLETED

Recovery states include BRIDGE_ERROR, AGENT_ERROR, AI_PAGE_CHANGED, SESSION_LOST and APPROVAL_TIMEOUT.

## Verification gates

- renderer typecheck/build
- Agent build/tests
- Desktop syntax check
- packaged artifact inspection
- Desktop runtime smoke: Workspace loaded + Agent healthy + embedded AI opened + bridge action observed

A build alone is never considered proof of AI connectivity.
