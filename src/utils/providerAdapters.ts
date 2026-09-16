// Provider Adapters - Architecture for connecting to different AI providers
// This is a framework for future Chrome Extension integration

export interface ProviderAdapter {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  
  // Detection
  detect(): boolean;
  
  // Interaction
  getSelectors(): ProviderSelectors;
  injectInstructions?(instructions: string): void;
  readAssistantOutput?(): string;
  sendContext?(context: string): void;
  
  // Capabilities
  supportsSystemPrompt: boolean;
  supportsFileUpload: boolean;
  supportsCodeExecution: boolean;
  maxTokens: number;
}

export interface ProviderSelectors {
  chatInput: string;
  sendButton: string;
  messageContainer: string;
  assistantMessage: string;
  userMessage: string;
  modelSelector?: string;
}

// ============ PROVIDER DEFINITIONS ============

export const PROVIDERS: Record<string, ProviderAdapter> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    url: 'https://chat.openai.com',
    color: 'from-green-500 to-emerald-500',
    detect: () => window.location.hostname.includes('chat.openai.com'),
    getSelectors: () => ({
      chatInput: '#prompt-textarea, textarea[placeholder*="Message"]',
      sendButton: 'button[data-testid="send-button"]',
      messageContainer: '[data-testid^="conversation-turn-"]',
      assistantMessage: '[data-message-author-role="assistant"]',
      userMessage: '[data-message-author-role="user"]',
      modelSelector: '[data-testid="model-picker"]',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: true,
    supportsCodeExecution: true,
    maxTokens: 128000,
  },
  
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    url: 'https://gemini.google.com',
    color: 'from-blue-500 to-indigo-500',
    detect: () => window.location.hostname.includes('gemini.google.com'),
    getSelectors: () => ({
      chatInput: '.ql-editor, [contenteditable="true"]',
      sendButton: 'button[aria-label*="Send"]',
      messageContainer: '.message',
      assistantMessage: '.response-container',
      userMessage: '.query-container',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: true,
    supportsCodeExecution: true,
    maxTokens: 1000000,
  },
  
  claude: {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    url: 'https://claude.ai',
    color: 'from-orange-500 to-amber-500',
    detect: () => window.location.hostname.includes('claude.ai'),
    getSelectors: () => ({
      chatInput: '.ProseMirror, [contenteditable="true"]',
      sendButton: 'button[aria-label*="Send"]',
      messageContainer: '.font-claude-message',
      assistantMessage: '.font-claude-message',
      userMessage: '.font-user-message',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: true,
    supportsCodeExecution: false,
    maxTokens: 200000,
  },
  
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔮',
    url: 'https://chat.deepseek.com',
    color: 'from-purple-500 to-violet-500',
    detect: () => window.location.hostname.includes('chat.deepseek.com'),
    getSelectors: () => ({
      chatInput: 'textarea, [contenteditable="true"]',
      sendButton: 'button[class*="send"]',
      messageContainer: '.message-item',
      assistantMessage: '.message-item.assistant',
      userMessage: '.message-item.user',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: false,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
  
  qwen: {
    id: 'qwen',
    name: 'Qwen',
    icon: '🌟',
    url: 'https://chat.qwen.ai',
    color: 'from-pink-500 to-rose-500',
    detect: () => window.location.hostname.includes('chat.qwen.ai'),
    getSelectors: () => ({
      chatInput: 'textarea',
      sendButton: 'button[class*="send"]',
      messageContainer: '.message',
      assistantMessage: '.message.assistant',
      userMessage: '.message.user',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: true,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
  
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    icon: '💨',
    url: 'https://chat.mistral.ai',
    color: 'from-sky-500 to-blue-500',
    detect: () => window.location.hostname.includes('chat.mistral.ai'),
    getSelectors: () => ({
      chatInput: 'textarea',
      sendButton: 'button[type="submit"]',
      messageContainer: '.message',
      assistantMessage: '.message.assistant',
      userMessage: '.message.user',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: false,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
  
  grok: {
    id: 'grok',
    name: 'Grok',
    icon: '⚡',
    url: 'https://grok.com',
    color: 'from-gray-500 to-slate-500',
    detect: () => window.location.hostname.includes('grok.com'),
    getSelectors: () => ({
      chatInput: 'textarea',
      sendButton: 'button[aria-label*="Send"]',
      messageContainer: '.message',
      assistantMessage: '.message.assistant',
      userMessage: '.message.user',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: false,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
  
  copilot: {
    id: 'copilot',
    name: 'Copilot',
    icon: '🪟',
    url: 'https://copilot.microsoft.com',
    color: 'from-cyan-500 to-blue-500',
    detect: () => window.location.hostname.includes('copilot.microsoft.com'),
    getSelectors: () => ({
      chatInput: '#searchbox, textarea',
      sendButton: 'button[aria-label*="Submit"]',
      messageContainer: '.ac-container',
      assistantMessage: '.ac-container[data-turn="bot"]',
      userMessage: '.ac-container[data-turn="user"]',
    }),
    supportsSystemPrompt: false,
    supportsFileUpload: true,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
  
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🔍',
    url: 'https://perplexity.ai',
    color: 'from-teal-500 to-cyan-500',
    detect: () => window.location.hostname.includes('perplexity.ai'),
    getSelectors: () => ({
      chatInput: 'textarea',
      sendButton: 'button[aria-label*="Submit"]',
      messageContainer: '.shadow-sm',
      assistantMessage: '.prose',
      userMessage: '.text-primary',
    }),
    supportsSystemPrompt: false,
    supportsFileUpload: true,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
  
  llama: {
    id: 'llama',
    name: 'Llama',
    icon: '🦙',
    url: 'https://llama.meta.com',
    color: 'from-indigo-500 to-purple-500',
    detect: () => window.location.hostname.includes('llama.meta.com'),
    getSelectors: () => ({
      chatInput: 'textarea',
      sendButton: 'button[type="submit"]',
      messageContainer: '.message',
      assistantMessage: '.message.assistant',
      userMessage: '.message.user',
    }),
    supportsSystemPrompt: true,
    supportsFileUpload: false,
    supportsCodeExecution: false,
    maxTokens: 128000,
  },
};

// ============ ADAPTER UTILITIES ============

export function detectCurrentProvider(): ProviderAdapter | null {
  for (const provider of Object.values(PROVIDERS)) {
    if (provider.detect()) {
      return provider;
    }
  }
  return null;
}

export function getProviderById(id: string): ProviderAdapter | null {
  return PROVIDERS[id] || null;
}

export function getAllProviders(): ProviderAdapter[] {
  return Object.values(PROVIDERS);
}

// ============ GENERIC MODE ============

export const GENERIC_MODE = {
  id: 'generic',
  name: 'Generic (Copy/Paste)',
  icon: '📋',
  description: 'Works with any AI - copy context and paste manually',
  
  workflow: {
    step1: 'Extract context using ULAB',
    step2: 'Copy the generated prompt',
    step3: 'Open your preferred AI chatbot',
    step4: 'Paste the prompt',
    step5: 'Get AI response',
    step6: 'Copy response back to ULAB (optional)',
  },
  
  capabilities: {
    worksWithAnyAI: true,
    requiresManualCopy: true,
    supportsAllFeatures: true,
  },
};

// ============ FUTURE: EXTENSION INTEGRATION ============

/*
 * Phase 2: Chrome Extension Integration
 * 
 * When running as a Chrome Extension, these adapters will:
 * 
 * 1. Use content scripts to interact with AI pages
 * 2. Use the selectors defined above to find UI elements
 * 3. Inject context directly into the chat input
 * 4. Read AI responses from the page
 * 5. Detect structured actions in AI output
 * 
 * Example extension integration:
 * 
 * ```typescript
 * // In content script
 * const provider = detectCurrentProvider();
 * if (provider) {
 *   const selectors = provider.getSelectors();
 *   const input = document.querySelector(selectors.chatInput);
 *   if (input) {
 *     input.value = context;
 *     const sendBtn = document.querySelector(selectors.sendButton);
 *     sendBtn?.click();
 *   }
 * }
 * ```
 * 
 * The selectors are isolated per provider so when a provider
 * changes their UI, only their selector file needs updating.
 */

export interface ExtensionContext {
  provider: ProviderAdapter | null;
  isConnected: boolean;
  canInject: boolean;
  canRead: boolean;
}

// This will be implemented in Phase 2 (Chrome Extension)
export function getExtensionContext(): ExtensionContext {
  // For now, we're in web dashboard mode
  return {
    provider: null,
    isConnected: false,
    canInject: false,
    canRead: false,
  };
}
