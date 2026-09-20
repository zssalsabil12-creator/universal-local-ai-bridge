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
  chatgpt: { id:'chatgpt', name:'ChatGPT', icon:'🤖', url:'https://chatgpt.com', color:'from-green-500 to-emerald-500', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:true, maxTokens:128000 },
  claude: { id:'claude', name:'Claude', icon:'🧠', url:'https://claude.ai', color:'from-orange-500 to-amber-500', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:200000 },
  gemini: { id:'gemini', name:'Gemini', icon:'✨', url:'https://gemini.google.com', color:'from-blue-500 to-indigo-500', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:true, maxTokens:1000000 },
  deepseek: { id:'deepseek', name:'DeepSeek', icon:'🔮', url:'https://chat.deepseek.com', color:'from-purple-500 to-violet-500', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
  qwen: { id:'qwen', name:'Qwen', icon:'🌟', url:'https://chat.qwen.ai', color:'from-pink-500 to-rose-500', supportsSystemPrompt:true, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000 },
  mistral: { id:'mistral', name:'Mistral', icon:'💨', url:'https://chat.mistral.ai', color:'from-sky-500 to-blue-500', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
  grok: { id:'grok', name:'Grok', icon:'⚡', url:'https://grok.com', color:'from-gray-500 to-slate-500', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
  copilot: { id:'copilot', name:'Copilot', icon:'🪟', url:'https://copilot.microsoft.com', color:'from-cyan-500 to-blue-500', supportsSystemPrompt:false, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000 },
  perplexity: { id:'perplexity', name:'Perplexity', icon:'🔍', url:'https://perplexity.ai', color:'from-teal-500 to-cyan-500', supportsSystemPrompt:false, supportsFileUpload:true, supportsCodeExecution:false, maxTokens:128000 },
  llama: { id:'llama', name:'Llama', icon:'🦙', url:'https://www.meta.ai', color:'from-indigo-500 to-purple-500', supportsSystemPrompt:true, supportsFileUpload:false, supportsCodeExecution:false, maxTokens:128000 },
};

export const GENERIC_MODE = {
  id: 'generic',
  name: 'Universal AI',
  icon: '🌐',
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
