// AI provider metadata for the ULAB Desktop bridge.
// Provider interaction is owned by the desktop application; this module
// contains provider-neutral metadata only and must not depend on browser APIs.

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
}

export const PROVIDERS: Record<string, ProviderAdapter> = {
  chatgpt: { id:'chatgpt', name:'ChatGPT', icon:'GPT', url:'https://chatgpt.com', color:'green', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:true, maxTokens:128000 },
  claude: { id:'claude', name:'Claude', icon:'CL', url:'https://claude.ai', color:'orange', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:200000 },
  gemini: { id:'gemini', name:'Gemini', icon:'GE', url:'https://gemini.google.com', color:'blue', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:true, maxTokens:1000000 },
  deepseek: { id:'deepseek', name:'DeepSeek', icon:'DS', url:'https://chat.deepseek.com', color:'violet', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
  qwen: { id:'qwen', name:'QW', icon:'QW', url:'https://chat.qwen.ai', color:'pink', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000 },
  mistral: { id:'mistral', name:'Mistral', icon:'MI', url:'https://chat.mistral.ai', color:'sky', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
  grok: { id:'grok', name:'Grok', icon:'GR', url:'https://grok.com', color:'slate', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
  copilot: { id:'copilot', name:'Copilot', icon:'CO', url:'https://copilot.microsoft.com', color:'cyan', supportsSystemPrompt:false, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000 },
  perplexity: { id:'perplexity', name:'Perplexity', icon:'PE', url:'https://perplexity.ai', color:'teal', supportsSystemPrompt:false, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000 },
  llama: { id:'llama', name:'Llama', icon:'LL', url:'https://www.meta.ai', color:'indigo', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
};

export const GENERIC_MODE = {
  id: 'generic',
  name: 'Universal AI',
  icon: 'UN',
  description: 'Provider-independent AI workflow controlled by ULAB Desktop',
  workflow: {
    step1: 'Select a local workspace',
    step2: 'Connect the desktop AI bridge',
    step3: 'Send task context through the active AI conversation',
    step4: 'Validate structured local actions',
    step5: 'Execute only approved actions in the workspace',
    step6: 'Return results to the AI workflow',
  },
  capabilities: { worksWithAnyAI: true, requiresManualCopy: false, supportsAllFeatures: true },
};

export function getProviderById(id: string): ProviderAdapter | null {
  return PROVIDERS[id] || null;
}

export function getAllProviders(): ProviderAdapter[] {
  return Object.values(PROVIDERS);
}
