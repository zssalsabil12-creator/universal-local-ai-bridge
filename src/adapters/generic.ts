// Generic Mode Adapter
// This adapter works with any AI provider through manual copy/paste

import { AIProviderAdapter, LocalAction } from './types';

export class GenericAdapter implements AIProviderAdapter {
  readonly id = 'generic';
  readonly name = 'Generic Mode';
  readonly url = '*';
  
  readonly supportsAutoInsert = false;
  readonly supportsAutoDetect = false;
  
  detectProvider(): boolean {
    // Generic mode always works
    return true;
  }
  
  isSupported(): boolean {
    return true;
  }
  
  prepareContext(context: string): string {
    // Format context for manual copy/paste
    return this.formatContextForCopy(context);
  }
  
  // No auto-insert in generic mode
  async insertContext(context: string): Promise<boolean> {
    // Copy to clipboard for manual paste
    try {
      await navigator.clipboard.writeText(context);
      return true;
    } catch (error) {
      console.error('[ULAB] Failed to copy context:', error);
      return false;
    }
  }
  
  // No auto-detect in generic mode
  async readAssistantResponse(): Promise<string | null> {
    return null;
  }
  
  detectLocalAction(response: string): LocalAction | null {
    return this.extractLocalAction(response);
  }
  
  // Format context for manual copy/paste
  private formatContextForCopy(context: string): string {
    return `# Project Context

${context}

---

**Instructions:**
1. Copy the context above
2. Paste it into your AI chat (ChatGPT, Gemini, DeepSeek, etc.)
3. Ask your question about the project
4. The AI will analyze the provided context
5. If the AI suggests changes, review them carefully
6. Use the "Apply Changes" button in ULAB to apply approved changes

**Note:** Only the files shown above are included in the context.
The entire project was NOT uploaded to the AI.`;
  }
  
  // Extract local-action from AI response
  private extractLocalAction(response: string): LocalAction | null {
    try {
      // Look for ```local-action blocks
      const actionRegex = /```local-action\s*([\s\S]*?)```/g;
      const match = actionRegex.exec(response);
      
      if (match && match[1]) {
        const action = JSON.parse(match[1].trim());
        
        // Validate action structure
        if (this.isValidAction(action)) {
          return action;
        }
      }
      
      // Look for JSON objects with action field
      const jsonRegex = /\{[\s\S]*?"action"[\s\S]*?\}/g;
      const jsonMatch = jsonRegex.exec(response);
      
      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[0]);
          if (this.isValidAction(action)) {
            return action;
          }
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
      
      return null;
    } catch (error) {
      console.error('[ULAB] Failed to extract local action:', error);
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
    
    // Validate known actions
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
export const genericAdapter = new GenericAdapter();
