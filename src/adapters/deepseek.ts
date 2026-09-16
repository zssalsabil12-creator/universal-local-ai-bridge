// DeepSeek Adapter
// Provides integration with DeepSeek web interface

import { AIProviderAdapter, LocalAction } from './types';

export class DeepSeekAdapter implements AIProviderAdapter {
  readonly id = 'deepseek';
  readonly name = 'DeepSeek';
  readonly url = 'https://chat.deepseek.com';
  
  readonly supportsAutoInsert = false; // Conservative: manual mode only
  readonly supportsAutoDetect = true;
  
  // DeepSeek-specific selectors (isolated here)
  private readonly selectors = {
    chatInput: 'textarea, [contenteditable="true"]',
    sendButton: 'button[class*="send"]',
    messageContainer: '.message-item',
    assistantMessage: '.message-item.assistant',
    userMessage: '.message-item.user',
  };
  
  detectProvider(): boolean {
    try {
      const hostname = window.location.hostname;
      return hostname.includes('chat.deepseek.com');
    } catch (error) {
      return false;
    }
  }
  
  isSupported(): boolean {
    return this.detectProvider();
  }
  
  prepareContext(context: string): string {
    return this.formatContextForDeepSeek(context);
  }
  
  // Manual insertion mode (safe and reliable)
  async insertContext(context: string): Promise<boolean> {
    try {
      // Copy to clipboard for manual paste
      await navigator.clipboard.writeText(context);
      
      // Try to focus the input field
      const input = document.querySelector(this.selectors.chatInput) as HTMLTextAreaElement;
      if (input) {
        input.focus();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[ULAB] Failed to prepare DeepSeek context:', error);
      return false;
    }
  }
  
  // Read the latest assistant response
  async readAssistantResponse(): Promise<string | null> {
    try {
      const messages = document.querySelectorAll(this.selectors.assistantMessage);
      if (messages.length === 0) {
        return null;
      }
      
      const lastMessage = messages[messages.length - 1];
      return lastMessage.textContent?.trim() || null;
    } catch (error) {
      console.error('[ULAB] Failed to read DeepSeek response:', error);
      return null;
    }
  }
  
  detectLocalAction(response: string): LocalAction | null {
    return this.extractLocalAction(response);
  }
  
  // Format context specifically for DeepSeek
  private formatContextForDeepSeek(context: string): string {
    return `# Project Context

${context}

---

**Instructions:**
1. Analyze the provided code and files
2. Answer questions based on this context
3. For code modifications, use:

\`\`\`local-action
{
  "action": "files.write",
  "path": "path/to/file.ts",
  "content": "updated content"
}
\`\`\`

4. Changes will be reviewed before application

**Important:**
- Only use files shown above
- Format changes as local-action blocks
- Specify exact file paths`;
  }
  
  // Extract local-action from DeepSeek response
  private extractLocalAction(response: string): LocalAction | null {
    try {
      const actionRegex = /```local-action\s*([\s\S]*?)```/g;
      const match = actionRegex.exec(response);
      
      if (match && match[1]) {
        const action = JSON.parse(match[1].trim());
        
        if (this.isValidAction(action)) {
          return action;
        }
      }
      
      return null;
    } catch (error) {
      console.error('[ULAB] Failed to extract DeepSeek action:', error);
      return null;
    }
  }
  
  // Validate action structure
  private isValidAction(action: any): boolean {
    if (!action || typeof action !== 'object') {
      return false;
    }
    
    if (!action.action || typeof action.action !== 'string') {
      return false;
    }
    
    const validActions = [
      'files.read',
      'files.write',
      'files.create',
      'files.delete',
      'project.search',
      'project.context',
    ];
    
    return validActions.includes(action.action);
  }
}

// Export singleton instance
export const deepSeekAdapter = new DeepSeekAdapter();
