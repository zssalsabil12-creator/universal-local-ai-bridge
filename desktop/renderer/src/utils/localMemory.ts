// Local Memory - Stores project-specific knowledge and decisions
import { useState, useEffect } from 'react';

export interface MemoryEntry {
  id: string;
  type: 'decision' | 'rule' | 'fact' | 'preference' | 'file-note';
  title: string;
  content: string;
  projectId: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  pinned?: boolean;
}

export interface ProjectMemory {
  projectId: string;
  projectName: string;
  entries: MemoryEntry[];
  projectInstructions: string;
  importantFiles: string[];
  excludedPaths: string[];
  lastAccessed: number;
}

const STORAGE_KEY = 'ulab-local-memory';

// Load memory from localStorage
export function loadMemory(): Record<string, ProjectMemory> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save memory to localStorage
export function saveMemory(memory: Record<string, ProjectMemory>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (e) {
    console.error('Failed to save memory:', e);
  }
}

// Create a new memory entry
export function createMemoryEntry(
  projectId: string,
  type: MemoryEntry['type'],
  title: string,
  content: string,
  tags: string[] = []
): MemoryEntry {
  return {
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    content,
    projectId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags,
    pinned: false,
  };
}

// Get or create project memory
export function getProjectMemory(
  memory: Record<string, ProjectMemory>,
  projectId: string,
  projectName: string
): ProjectMemory {
  if (!memory[projectId]) {
    memory[projectId] = {
      projectId,
      projectName,
      entries: [],
      projectInstructions: '',
      importantFiles: [],
      excludedPaths: [],
      lastAccessed: Date.now(),
    };
  }
  return memory[projectId];
}

// Extract memories from AI conversation
export function extractMemoriesFromAI(aiResponse: string): Partial<MemoryEntry>[] {
  const memories: Partial<MemoryEntry>[] = [];
  
  // Pattern: [MEMORY: type | title | content]
  const memoryRegex = /\[MEMORY:\s*(\w+)\s*\|\s*([^\|]+)\s*\|\s*([^\]]+)\]/g;
  let match;
  while ((match = memoryRegex.exec(aiResponse)) !== null) {
    memories.push({
      type: match[1] as MemoryEntry['type'],
      title: match[2].trim(),
      content: match[3].trim(),
    });
  }
  
  // Pattern: Remember: ...
  const rememberRegex = /(?:Remember|Note|Important)[\s:]+([^\n.]+\.?)/gi;
  while ((match = rememberRegex.exec(aiResponse)) !== null) {
    memories.push({
      type: 'fact',
      title: 'AI Note',
      content: match[1].trim(),
    });
  }
  
  return memories;
}

// Generate context string including memories
export function generateMemoryContext(projectMemory: ProjectMemory): string {
  if (projectMemory.entries.length === 0 && !projectMemory.projectInstructions) {
    return '';
  }
  
  let context = '\n## Project Memory\n\n';
  
  if (projectMemory.projectInstructions) {
    context += `### Instructions\n${projectMemory.projectInstructions}\n\n`;
  }
  
  if (projectMemory.importantFiles.length > 0) {
    context += `### Important Files\n${projectMemory.importantFiles.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (projectMemory.entries.length > 0) {
    context += `### Memories (${projectMemory.entries.length})\n`;
    const pinned = projectMemory.entries.filter(e => e.pinned);
    const recent = projectMemory.entries
      .filter(e => !e.pinned)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);
    
    if (pinned.length > 0) {
      context += '**Pinned:**\n';
      pinned.forEach(e => {
        context += `- [${e.type}] ${e.title}: ${e.content}\n`;
      });
      context += '\n';
    }
    
    if (recent.length > 0) {
      context += '**Recent:**\n';
      recent.forEach(e => {
        context += `- [${e.type}] ${e.title}: ${e.content}\n`;
      });
    }
  }
  
  return context;
}
