// Gemini Adapter
// Provides integration with Gemini web interface

import { AIProviderAdapter, LocalAction } from './types';

export class GeminiAdapter implements AIProviderAdapter {
  readonly id = 'gemini';
  readonly name = 'Gemini';
  readonly url = 'https://gemini.google.com';
  
  readonly supportsAutoInsert = false; // Conservative: manual mode only
  readonly supportsAutoDetect = true;
  
  // Gemini-specific selectors (isolated here)
  private readonly selectors = {
    chatInput: '.ql-editor, [contenteditable="true"]',
    sendButton: 'button[aria-label*="Send"]',
    messageContainer: '.message',
    assistantMessage: '.response-container',
    userMessage: '.query-container',
  };
  
  detectProvider(): boolean {
    try {
      const hostname = window.location.hostname;
      return hostname.includes('gemini.google.com');
    } catch (error) {
      return false;
    }
  }
  
  isSupported(): boolean {
    return this.detectProvider();
  }
  
  prepareContext(context: string): string {
    return this.formatContextForGemini(context);
  }
  
  // Manual insertion mode (safe and reliable)
  async insertContext(context: string): Promise<boolean> {
    try {
      // Copy to clipboard for manual paste
      await navigator.clipboard.writeText(context);
      
      // Try to focus the input field
      const input = document.querySelector(this.selectors.chatInput) as HTMLElement;
      if (input) {
        input.focus();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[ULAB] Failed to prepare Gemini context:', error);
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
      console.error('[ULAB] Failed to read Gemini response:', error);
      return null;
    }
  }
  
  detectLocalAction(response: string): LocalAction | null {
    return this.extractLocalAction(response);
  }
  
  // Format context specifically for Gemini
  private formatContextForGemini(context: string): string {
    return `# Project Context for Analysis

${context}

---

**Instructions:**
1. Analyze the code and files provided above
2. Answer my questions based on this context
3. For code changes, use this format:

\`\`\`local-action
{
  "action": "files.write",
  "path": "path/to/file.ts",
  "content": "updated content"
}
\`\`\`

4. I will review changes before applying them

**Important:**
- Only use the files shown above
- Format modifications as local-action blocks
- Be specific about file paths`;
  }
  
  // Extract local-action from Gemini response
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
      console.error('[ULAB] Failed to extract Gemini action:', error);
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
export const geminiAdapter = new GeminiAdapter();
