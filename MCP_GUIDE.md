# ULAB Local MCP

ULAB Desktop exposes a local MCP endpoint so MCP-capable AI clients can use the current ULAB workspace without copying project files or prompts manually.

## Local HTTP endpoint

`http://127.0.0.1:19999/mcp`

The endpoint is available while ULAB Desktop is running. Authentication uses the local ULAB Bearer token. The desktop UI has **MCP محلي → نسخ إعداد MCP العام** to copy a connection object containing the endpoint and Authorization header.

### Generic connection object

```json
{
  "url": "http://127.0.0.1:19999/mcp",
  "headers": {
    "Authorization": "Bearer <LOCAL_ULAB_TOKEN>"
  }
}
```

The exact configuration wrapper depends on the MCP client. Paste the `url` and Authorization header into the client's MCP/HTTP server settings.

### ULAB connection check

From the desktop MCP panel, **فحص اتصال MCP** performs a real authenticated `server/discover` → `tools/list` → `workspace_session` check. This verifies that the local endpoint is alive, the token is accepted, the MCP tool surface is reachable, and a workspace session is available.

## Exposed tools

ULAB intentionally exposes a safe subset through MCP:

- `workspace_session`
- `files_list`
- `files_read`
- `files_search`
- `files_propose`
- `git_status`
- `git_diff`
- `context_build`
- `audit_log`

The MCP surface does **not** expose direct file writes, deletes, terminal execution, Git commit/push, or test execution. A model can create a pending file proposal, but the change remains subject to the ULAB human approval flow.

## Security model

ULAB remains:

`WORKSPACE-FIRST → SANDBOX-FIRST → AI-SECOND`

The MCP endpoint is bound to localhost. Workspace boundaries, secret-file protection, stale-session checks, command security, and server-side approval enforcement remain in the Local Agent.

Do not copy the Bearer token into public repositories, screenshots, support tickets, or remote services.

## Built-in web AI sessions

The embedded ChatGPT, Claude, Gemini, DeepSeek, Qwen, Mistral, Grok, Copilot, Perplexity, Meta AI, and Custom AI sessions continue to use ULAB's existing in-app AI bridge. MCP is an additional integration path for AI clients that natively support MCP.

## Stdio mode

The packaged Local Agent also supports:

```
ulab-agent.exe --mcp --workspace "C:\path\to\your\project"
```

This exposes the same core MCP tools over stdin/stdout for MCP clients that prefer a local command transport.

The executable is generated from `agent/dist/index.js` during the release build. The desktop MCP panel also exposes a ready-to-copy stdio command with the packaged executable path and the current workspace when one is selected.

Stdio is a separate local MCP process rather than the already-running desktop Agent session; it uses the same workspace boundary and the same MCP-safe tool surface.
