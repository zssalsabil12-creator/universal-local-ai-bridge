// AI Provider Adapters Registry
// Registers all available AI provider adapters

import { providerRegistry } from './types';
import { genericAdapter } from './generic';
import { chatGPTAdapter } from './chatgpt';
import { geminiAdapter } from './gemini';
import { deepSeekAdapter } from './deepseek';

// Register all adapters
providerRegistry.register(genericAdapter);
providerRegistry.register(chatGPTAdapter);
providerRegistry.register(geminiAdapter);
providerRegistry.register(deepSeekAdapter);

// Export for use in other modules
export { providerRegistry };
export * from './types';
export { genericAdapter } from './generic';
export { chatGPTAdapter } from './chatgpt';
export { geminiAdapter } from './gemini';
export { deepSeekAdapter } from './deepseek';

// Helper function to get current provider
export function getCurrentProvider() {
  return providerRegistry.detectCurrent() || genericAdapter;
}

// Helper function to get provider status
export function getProviderStatus() {
  return providerRegistry.getStatus();
}
