// Smart Prompt Generator for different AI providers
// Generates optimized system prompts for each AI to work as a local agent

import { ProjectIndex } from './fileSystem';
import { ULP_COMMANDS } from './ulpProtocol';

export type AIProvider = 
  | 'chatgpt' | 'gemini' | 'claude' | 'deepseek' 
  | 'qwen' | 'mistral' | 'llama' | 'grok' | 'copilot' | 'perplexity' | 'custom';

export interface PromptConfig {
  provider: AIProvider;
  projectName: string;
  projectStructure: string;
  permissionMode: 'readonly' | 'assisted' | 'agent';
  enabledTools: string[];
  customInstructions?: string;
}

// Provider-specific configurations
const PROVIDER_CONFIG: Record<AIProvider, {
  name: string;
  icon: string;
  color: string;
  maxTokens: number;
  supportsSystem: boolean;
  specialTraits: string;
}> = {
  chatgpt: {
    name: 'ChatGPT',
    icon: '🤖',
    color: 'from-green-500 to-emerald-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You excel at following structured instructions and using tool calls.',
  },
  gemini: {
    name: 'Gemini',
    icon: '✨',
    color: 'from-blue-500 to-indigo-500',
    maxTokens: 1000000,
    supportsSystem: true,
    specialTraits: 'You have a very large context window and can process extensive code.',
  },
  claude: {
    name: 'Claude',
    icon: '🧠',
    color: 'from-orange-500 to-amber-500',
    maxTokens: 200000,
    supportsSystem: true,
    specialTraits: 'You are thorough, careful, and excellent at understanding complex codebases.',
  },
  deepseek: {
    name: 'DeepSeek',
    icon: '🔮',
    color: 'from-purple-500 to-violet-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You are particularly skilled at coding tasks and debugging.',
  },
  qwen: {
    name: 'Qwen',
    icon: '🌟',
    color: 'from-pink-500 to-rose-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You are multilingual and excel at understanding code in any language.',
  },
  mistral: {
    name: 'Mistral',
    icon: '💨',
    color: 'from-sky-500 to-blue-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You are fast and efficient at code analysis.',
  },
  llama: {
    name: 'Llama',
    icon: '🦙',
    color: 'from-indigo-500 to-purple-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You are open-source and great at following instructions.',
  },
  grok: {
    name: 'Grok',
    icon: '⚡',
    color: 'from-gray-500 to-slate-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You are witty and direct in your responses.',
  },
  copilot: {
    name: 'Copilot',
    icon: '🪟',
    color: 'from-cyan-500 to-blue-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: 'You are integrated with Microsoft tools and services.',
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    color: 'from-teal-500 to-cyan-500',
    maxTokens: 128000,
    supportsSystem: false,
    specialTraits: 'You excel at research and providing cited answers.',
  },
  custom: {
    name: 'Custom',
    icon: '⚙️',
    color: 'from-gray-500 to-zinc-500',
    maxTokens: 128000,
    supportsSystem: true,
    specialTraits: '',
  },
};

export function getProviderInfo(provider: AIProvider) {
  return PROVIDER_CONFIG[provider];
}

export function getAllProviders(): { id: AIProvider; name: string; icon: string; color: string }[] {
  return Object.entries(PROVIDER_CONFIG).map(([id, config]) => ({
    id: id as AIProvider,
    name: config.name,
    icon: config.icon,
    color: config.color,
  }));
}

// Generate the main system prompt
export function generateSystemPrompt(config: PromptConfig): string {
  const providerInfo = PROVIDER_CONFIG[config.provider];
  
  let prompt = `# ULAB - Universal Local AI Bridge
You are connected to the user's local development environment through ULAB (Universal Local AI Bridge).

## Your Role
You are acting as a **local AI agent** with access to the user's project files. The user has granted you ${config.permissionMode === 'readonly' ? 'read-only' : config.permissionMode === 'assisted' ? 'assisted write' : 'full agent'} access to their project "${config.projectName}".

## Important Context
- All file operations happen LOCALLY on the user's machine
- The user's files NEVER leave their device
- You must request permission before making any changes (except in agent mode with explicit approval)
- Be concise and focus on the task at hand

## Project Structure
${config.projectStructure}

## ULP Protocol (Universal Local Protocol)
You can request local operations using the ULP protocol. Use this format:

\`\`\`ulp
{
  "command": "files.read",
  "params": { "path": "src/auth/login.ts" }
}
\`\`\`

### Available Commands:
${ULP_COMMANDS.map(cmd => `- \`${cmd.command}\`: ${cmd.description} [${cmd.permission}]`).join('\n')}

## Response Format
When you need to read files or perform operations:
1. First explain what you want to do
2. Use ULP commands to request file access
3. Wait for the system to provide the files
4. Analyze and respond

When suggesting code changes:
\`\`\`typescript:path/to/file.ts
// Your updated code here
\`\`\`

${config.permissionMode === 'readonly' ? `
## Current Mode: READ-ONLY
You can ONLY read and analyze files. You cannot suggest modifications.
Focus on explaining, analyzing, and answering questions about the code.
` : config.permissionMode === 'assisted' ? `
## Current Mode: ASSISTED WRITE
You can suggest modifications, but each change requires user approval.
Always show the diff clearly before applying changes.
` : `
## Current Mode: AGENT
You can perform operations after explaining what you'll do.
The user will approve or deny each action.
`}

${providerInfo.specialTraits ? `\n## Your Strengths\n${providerInfo.specialTraits}` : ''}

${config.customInstructions ? `\n## Custom Instructions\n${config.customInstructions}` : ''}

## Enabled Tools
${config.enabledTools.length > 0 ? config.enabledTools.join(', ') : 'None'}

Remember: You are a helpful assistant with LOCAL access. Use this power responsibly and always prioritize the user's privacy and security.`;

  return prompt;
}

// Generate a quick context prompt for pasting into chat
export function generateQuickPrompt(
  config: PromptConfig,
  contextFiles: { path: string; content: string }[],
  userQuery: string
): string {
  let prompt = `<ulab-context project="${config.projectName}">\n\n`;
  
  // Add project structure
  prompt += `## Project Structure\n\`\`\`\n${config.projectStructure}\n\`\`\`\n\n`;
  
  // Add context files
  prompt += `## Relevant Files\n\n`;
  for (const file of contextFiles) {
    const ext = file.path.split('.').pop() || '';
    prompt += `### ${file.path}\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
  }
  
  prompt += `</ulab-context>\n\n`;
  prompt += `## User Question\n${userQuery}\n\n`;
  prompt += `Please analyze the code above and help with the question. If you need to see more files, use the ULP protocol to request them.`;
  
  return prompt;
}

// Generate a "copy-paste ready" prompt for AI chatbots
export function generateChatbotPrompt(
  provider: AIProvider,
  systemPrompt: string,
  context: string
): { systemPrompt: string; userMessage: string } {
  const providerInfo = PROVIDER_CONFIG[provider];
  
  if (providerInfo.supportsSystem) {
    return {
      systemPrompt,
      userMessage: context,
    };
  } else {
    // For providers without system prompt support, combine everything
    return {
      systemPrompt: '',
      userMessage: `${systemPrompt}\n\n---\n\n${context}`,
    };
  }
}

// Generate a "bridge card" - a compact representation of the context
export function generateBridgeCard(
  projectName: string,
  query: string,
  fileCount: number,
  lineCount: number,
  tokenEstimate: number
): string {
  return `🔌 ULAB Bridge Card
━━━━━━━━━━━━━━━━━━
📁 Project: ${projectName}
❓ Query: ${query}
📄 Files: ${fileCount}
📝 Lines: ~${lineCount}
🎯 Tokens: ~${tokenEstimate}
🔒 Privacy: Local Only
━━━━━━━━━━━━━━━━━━`;
};
