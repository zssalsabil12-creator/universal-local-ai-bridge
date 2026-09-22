// Provider-neutral capability metadata. ULAB never assumes that browser automation
// is an approved integration path; official MCP/API routes are preferred.

export type ProviderIntegrationMode = 'official-local-mcp' | 'official-remote-mcp' | 'browser-compatibility';

export interface ProviderAdapter {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  supportsSystemPrompt: boolean;
  supportsFileUpload: boolean;
  supportsCodeExecution: boolean;
  maxTokens: number;
  integrationMode: ProviderIntegrationMode;
  integrationNote: string;
  officialDocsUrl?: string;
}

const browserFallback = 'Browser bridge is compatibility-only; use it only where the provider permits automated browser interaction.';

export const PROVIDERS: Record<string, ProviderAdapter> = {
  chatgpt: { id:'chatgpt', name:'ChatGPT', icon:'GPT', url:'https://chatgpt.com', color:'green', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:true, maxTokens:128000, integrationMode:'official-remote-mcp', integrationNote:'Custom MCP apps with write/modify actions are supported for eligible ChatGPT workspace plans; local servers require a supported remote tunnel.', officialDocsUrl:'https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt' },
  claude: { id:'claude', name:'Claude', icon:'CL', url:'https://claude.ai', color:'orange', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:200000, integrationMode:'official-local-mcp', integrationNote:'Claude Desktop supports local MCP servers and desktop extensions.', officialDocsUrl:'https://support.anthropic.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop' },
  gemini: { id:'gemini', name:'Gemini', icon:'GE', url:'https://gemini.google.com', color:'blue', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:true, maxTokens:1000000, integrationMode:'official-remote-mcp', integrationNote:'Gemini API supports remote MCP servers over Streamable HTTP.', officialDocsUrl:'https://ai.google.dev/gemini-api/docs/function-calling' },
  deepseek: { id:'deepseek', name:'DeepSeek', icon:'DS', url:'https://chat.deepseek.com', color:'violet', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
  qwen: { id:'qwen', name:'QW', icon:'QW', url:'https://chat.qwen.ai', color:'pink', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
  mistral: { id:'mistral', name:'Mistral', icon:'MI', url:'https://chat.mistral.ai', color:'sky', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
  grok: { id:'grok', name:'Grok', icon:'GR', url:'https://grok.com', color:'slate', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
  copilot: { id:'copilot', name:'Copilot', icon:'CO', url:'https://copilot.microsoft.com', color:'cyan', supportsSystemPrompt:false, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
  perplexity: { id:'perplexity', name:'Perplexity', icon:'PE', url:'https://perplexity.ai', color:'teal', supportsSystemPrompt:false, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
  llama: { id:'llama', name:'Llama', icon:'LL', url:'https://www.meta.ai', color:'indigo', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000, integrationMode:'browser-compatibility', integrationNote:browserFallback },
};

export const GENERIC_MODE = {
  id: 'generic',
  name: 'Universal AI',
  icon: 'UN',
  description: 'Provider-independent AI workflow controlled by ULAB Desktop',
  workflow: {
    step1: 'Select a local workspace',
    step2: 'Connect the AI through a provider-supported MCP or API path',
    step3: 'Let the AI call workspace-scoped ULAB tools',
    step4: 'Validate every requested local action',
    step5: 'Execute sensitive actions only after ULAB approval',
    step6: 'Return verified tool results to the same AI session',
  },
  capabilities: { worksWithAnyAI: true, requiresManualCopy: false, supportsAllFeatures: false },
};

export function getProviderById(id: string): ProviderAdapter | null { return PROVIDERS[id] || null; }
export function getAllProviders(): ProviderAdapter[] { return Object.values(PROVIDERS); }
