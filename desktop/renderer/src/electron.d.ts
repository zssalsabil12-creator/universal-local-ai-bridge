export {};

declare global {
  interface Window {
    ulabDesktop?: {
      isDesktop: boolean;
      platform: string;
      agentHealth: () => Promise<{ ok: boolean; data?: unknown; error?: string }>;
      agentConfig: () => Promise<{ url: string; token: string }>;
      mcpConfig: () => Promise<{ endpoint: string; protocolVersion: string; bearerToken: string; scope: string; stdioCommand: string }>;
      mcpDiagnostics: () => Promise<{
        ok: boolean;
        endpoint?: string;
        protocolVersion?: string;
        server?: { name?: string; version?: string } | null;
        toolCount?: number;
        workspace?: string | null;
        stage?: string;
        status?: number;
        error?: string | unknown;
      }>;
      chooseWorkspace: () => Promise<{ canceled: boolean; path: string | null }>;
      openAI: (payload: string | { providerId: string; customUrl?: string }) => Promise<{
        ok?: boolean;
        ready?: boolean;
        error?: string;
        provider?: string;
        name?: string;
        url?: string;
        authRequired?: boolean;
        sessionState?: string;
        diagnostics?: {
          ok?: boolean;
          state?: string;
          authRequired?: boolean;
          url?: string;
          title?: string;
          inputs?: unknown[];
          sendButtons?: unknown[];
          assistantNodes?: unknown[];
          loginControls?: unknown[];
          rootCount?: number;
        } | null;
      }>;
      closeAI: () => Promise<{ ok?: boolean }>;
      aiStatus: () => Promise<{
        open?: boolean;
        provider?: string | null;
        url?: string | null;
        ready?: boolean;
        authRequired?: boolean;
        sessionState?: string;
      }>;
      aiDiagnostics: () => Promise<unknown>;
      aiApprove: (approvalId: string, remember?: boolean) => Promise<unknown>;
      aiReject: (approvalId: string) => Promise<unknown>;
      previewStart: () => Promise<any>;
      previewStop: () => Promise<any>;
      previewStatus: () => Promise<any>;
      onPreviewStatus: (callback: (data: unknown) => void) => () => void;
      onAIApprovalRequest: (callback: (data: unknown) => void) => () => void;
      sendAIText: (text: string) => Promise<unknown>;
      sendAIContext: (payload: unknown) => Promise<unknown>;
      onAIBridgeState: (callback: (data: unknown) => void) => () => void;
      onAIStatus: (callback: (data: unknown) => void) => () => void;
      onAIToolStatus: (callback: (data: unknown) => void) => () => void;
    };
  }
}
