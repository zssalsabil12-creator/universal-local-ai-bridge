// AI Provider Adapter Interface
// This interface defines the contract for all AI provider adapters

export interface AIProviderAdapter {
  // Provider identification
  readonly id: string;
  readonly name: string;
  readonly url: string;
  
  // Detection
  detectProvider(): boolean;
  isSupported(): boolean;
  
  // Context handling
  prepareContext(context: string): string;
  insertContext?(context: string): Promise<boolean>;
  
  // Response handling
  readAssistantResponse?(): Promise<string | null>;
  detectLocalAction(response: string): LocalAction | null;
  
  // Capabilities
  supportsAutoInsert: boolean;
  supportsAutoDetect: boolean;
}

export interface LocalAction {
  action: string;
  path?: string;
  content?: string;
  [key: string]: any;
}

export interface ProviderStatus {
  id: string;
  name: string;
  detected: boolean;
  supported: boolean;
  autoInsert: boolean;
  autoDetect: boolean;
  error?: string;
}

// Provider registry
export class ProviderRegistry {
  private adapters: Map<string, AIProviderAdapter> = new Map();
  
  register(adapter: AIProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }
  
  get(id: string): AIProviderAdapter | undefined {
    return this.adapters.get(id);
  }
  
  getAll(): AIProviderAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  detectCurrent(): AIProviderAdapter | null {
    for (const adapter of this.adapters.values()) {
      if (adapter.detectProvider()) {
        return adapter;
      }
    }
    return null;
  }
  
  getStatus(): ProviderStatus[] {
    return this.getAll().map(adapter => ({
      id: adapter.id,
      name: adapter.name,
      detected: adapter.detectProvider(),
      supported: adapter.isSupported(),
      autoInsert: adapter.supportsAutoInsert,
      autoDetect: adapter.supportsAutoDetect,
    }));
  }
}

// Global registry instance
export const providerRegistry = new ProviderRegistry();
