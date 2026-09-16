// ChatGPT Adapter
// Provides integration with ChatGPT web interface

import { AIProviderAdapter, LocalAction } from './types';

export class ChatGPTAdapter implements AIProviderAdapter {
  readonly id = 'chatgpt';
  readonly name = 'ChatGPT';
  readonly url = 'https://chat.openai.com';
  
  readonly supportsAutoInsert = false; // Conservative: manual mode only
  readonly supportsAutoDetect = true;
  
  // ChatGPT-specific selectors (isolated here)
  private readonly selectors = {
    chatInput: '#prompt-textarea, textarea[placeholder*="Message"]',
    sendButton: 'button[data-testid="send-button"]',
    messageContainer: '[data-testid^="conversation-turn-"]',
    assistantMessage: '[data-message-author-role="assistant"]',
    userMessage: '[data-message-author-role="user"]',
  };
  
  detectProvider(): boolean {
    try {
      const hostname = window.location.hostname;
      return hostname.includes('chat.openai.com') || 
             hostname.includes('chatgpt.com');
    } catch (error) {
      return false;
    }
  }
  
  isSupported(): boolean {
    return this.detectProvider();
  }
  
  prepareContext(context: string): string {
    return this.formatContextForChatGPT(context);
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
      console.error('[ULAB] Failed to prepare ChatGPT context:', error);
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
      console.error('[ULAB] Failed to read ChatGPT response:', error);
      return null;
    }
  }
  
  detectLocalAction(response: string): LocalAction | null {
    return this.extractLocalAction(response);
  }
  
  // Format context specifically for ChatGPT
  private formatContextForChatGPT(context: string): string {
    return `# Project Context for Analysis

${context}

---

**How to use this context:**
1. Review the files and code sections above
2. Answer my questions based on this context
3. If you suggest code changes, format them as:

\`\`\`local-action
{
  "action": "files.write",
  "path": "path/to/file.ts",
  "content": "updated file content"
}
\`\`\`

4. I will review and approve changes before they are applied

**Important:**
- Only analyze the files provided above
- Do not assume access to files not shown
- Format all file modifications as local-action blocks
- Be specific about file paths and content`;
  }
  
  // Extract local-action from ChatGPT response
  private extractLocalAction(response: string): LocalAction | null {
    try {
      // Look for ```local-action blocks
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
      console.error('[ULAB] Failed to extract ChatGPT action:', error);
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
export const chatGPTAdapter = new ChatGPTAdapter();
