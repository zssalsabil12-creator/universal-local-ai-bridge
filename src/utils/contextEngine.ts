// Smart Context Engine - Builds optimized context for AI

import { ProjectIndexV2, FileMetadata } from './projectIndex';
import { SearchResult, searchProject, SearchOptions } from './searchEngine';

export interface ContextPackage {
  question: string;
  files: ContextFile[];
  totalSize: number;
  estimatedTokens: number;
  metadata: ContextMetadata;
}

export interface ContextFile {
  path: string;
  content: string;
  sections?: CodeSection[];
  relevance: number;
  reasons: string[];
}

export interface CodeSection {
  startLine: number;
  endLine: number;
  content: string;
  context?: string;
}

export interface ContextMetadata {
  totalFiles: number;
  totalLines: number;
  includedFiles: string[];
  excludedFiles: string[];
  searchResults: number;
  budget: ContextBudget;
  projectType: string;
}

export type ContextBudget = 'small' | 'medium' | 'large';

export const BUDGET_LIMITS: Record<ContextBudget, number> = {
  small: 4000,   // ~4000 characters
  medium: 16000, // ~16000 characters
  large: 64000,  // ~64000 characters
};

// Estimate tokens from text (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Extract relevant sections from code
export function extractRelevantSections(
  content: string,
  query: string,
  maxSections: number = 3
): CodeSection[] {
  const lines = content.split('\n');
  const sections: CodeSection[] = [];
  const normalizedQuery = query.toLowerCase();
  
  // Find lines that match the query
  const matchingLines: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(normalizedQuery)) {
      matchingLines.push(i);
    }
  }
  
  if (matchingLines.length === 0) {
    // No matches, return first 50 lines as context
    return [{
      startLine: 1,
      endLine: Math.min(50, lines.length),
      content: lines.slice(0, 50).join('\n'),
    }];
  }
  
  // Extract sections around matching lines
  const usedLines = new Set<number>();
  
  for (const lineNum of matchingLines.slice(0, maxSections)) {
    // Get 10 lines before and after
    const startLine = Math.max(0, lineNum - 10);
    const endLine = Math.min(lines.length - 1, lineNum + 10);
    
    // Check if this section overlaps with existing sections
    let overlaps = false;
    for (let i = startLine; i <= endLine; i++) {
      if (usedLines.has(i)) {
        overlaps = true;
        break;
      }
    }
    
    if (!overlaps) {
      const sectionContent = lines.slice(startLine, endLine + 1).join('\n');
      sections.push({
        startLine: startLine + 1,
        endLine: endLine + 1,
        content: sectionContent,
      });
      
      // Mark lines as used
      for (let i = startLine; i <= endLine; i++) {
        usedLines.add(i);
      }
    }
  }
  
  return sections;
}

// Build context package from search results
export function buildContextPackage(
  question: string,
  searchResults: SearchResult[],
  fileContents: Map<string, string>,
  index: ProjectIndexV2,
  budget: ContextBudget = 'medium'
): ContextPackage {
  const budgetLimit = BUDGET_LIMITS[budget];
  const files: ContextFile[] = [];
  let totalSize = 0;
  let totalLines = 0;
  const includedFiles: string[] = [];
  const excludedFiles: string[] = [];
  
  // Sort results by relevance
  const sortedResults = [...searchResults].sort((a, b) => b.score - a.score);
  
  for (const result of sortedResults) {
    const content = fileContents.get(result.file.path);
    
    if (!content) {
      excludedFiles.push(result.file.path);
      continue;
    }
    
    // Check if adding this file would exceed budget
    const fileSize = content.length;
    if (totalSize + fileSize > budgetLimit) {
      // Try to extract only relevant sections
      const sections = extractRelevantSections(content, question);
      const sectionsSize = sections.reduce((sum, s) => sum + s.content.length, 0);
      
      if (totalSize + sectionsSize <= budgetLimit) {
        files.push({
          path: result.file.path,
          content: '',
          sections,
          relevance: result.score,
          reasons: result.reasons,
        });
        totalSize += sectionsSize;
        totalLines += sections.reduce((sum, s) => sum + (s.endLine - s.startLine + 1), 0);
        includedFiles.push(result.file.path);
      } else {
        excludedFiles.push(result.file.path);
      }
    } else {
      // Add full file
      files.push({
        path: result.file.path,
        content,
        relevance: result.score,
        reasons: result.reasons,
      });
      totalSize += fileSize;
      totalLines += content.split('\n').length;
      includedFiles.push(result.file.path);
    }
    
    // Stop if we've reached the budget
    if (totalSize >= budgetLimit) {
      break;
    }
  }
  
  return {
    question,
    files,
    totalSize,
    estimatedTokens: estimateTokens(files.map(f => f.content || f.sections?.map(s => s.content).join('\n') || '').join('\n')),
    metadata: {
      totalFiles: files.length,
      totalLines,
      includedFiles,
      excludedFiles,
      searchResults: searchResults.length,
      budget,
      projectType: index.config.projectType,
    },
  };
}

// Generate context string for AI
export function generateContextString(
  pkgOrContext: ContextPackage | any,
  fileContents?: Map<string, string> | Record<string, string>,
  query?: string
): string {
  // Backward compatibility: if called with old signature
  if (!('metadata' in pkgOrContext)) {
    // Old ContextResult format
    const context = pkgOrContext as ContextResult;
    let result = `# Project Context for: "${query || ''}"\n\n`;
    result += `## Relevant Files (${context.files.length} files, ~${context.totalLines} lines)\n\n`;
    
    for (const file of context.files) {
      const content = fileContents instanceof Map ? fileContents.get(file.path) : fileContents?.[file.path];
      result += `### ${file.path}\n`;
      result += `Relevance: ${file.relevance} | Reason: ${file.reason}\n`;
      if (content) {
        const lines = content.split('\n').slice(0, 100);
        result += `\`\`\`\n${lines.join('\n')}\n\`\`\`\n\n`;
      }
    }
    
    return result;
  }
  
  // New ContextPackage format
  const pkg = pkgOrContext as ContextPackage;
  let context = `# Project Context\n\n`;
  context += `Question: ${pkg.question}\n\n`;
  context += `## Files (${pkg.metadata.totalFiles} files, ${pkg.metadata.totalLines} lines)\n\n`;
  
  for (const file of pkg.files) {
    context += `### ${file.path}\n`;
    context += `Relevance: ${file.relevance.toFixed(1)} | Reasons: ${file.reasons.join(', ')}\n\n`;
    
    if (file.sections && file.sections.length > 0) {
      for (const section of file.sections) {
        context += `Lines ${section.startLine}-${section.endLine}:\n`;
        context += `\`\`\`\n${section.content}\n\`\`\`\n\n`;
      }
    } else if (file.content) {
      context += `\`\`\`\n${file.content}\n\`\`\`\n\n`;
    }
  }
  
  if (pkg.metadata.excludedFiles.length > 0) {
    context += `## Excluded Files (${pkg.metadata.excludedFiles.length})\n\n`;
    for (const file of pkg.metadata.excludedFiles.slice(0, 10)) {
      context += `- ${file}\n`;
    }
    if (pkg.metadata.excludedFiles.length > 10) {
      context += `- ... and ${pkg.metadata.excludedFiles.length - 10} more\n`;
    }
  }
  
  context += `\n## Metadata\n`;
  context += `- Total size: ${pkg.totalSize} characters\n`;
  context += `- Estimated tokens: ${pkg.estimatedTokens}\n`;
  context += `- Budget: ${pkg.metadata.budget}\n`;
  context += `- Project type: ${pkg.metadata.projectType}\n`;
  
  return context;
}

// Smart context builder with automatic optimization
export function buildSmartContext(
  question: string,
  index: ProjectIndexV2,
  fileContents: Map<string, string>,
  options: {
    budget?: ContextBudget;
    maxFiles?: number;
    includeContent?: boolean;
  } = {}
): ContextPackage {
  const budget = options.budget || 'medium';
  const maxFiles = options.maxFiles || 10;
  const includeContent = options.includeContent !== false;
  
  // Extract keywords from question
  const keywords = extractKeywords(question);
  
  // Search for relevant files
  const searchOptions: SearchOptions = {
    maxResults: maxFiles * 2, // Get more results to filter later
    includeContent: includeContent,
    excludeSensitive: true,
  };
  
  const searchResults = searchProject(index, keywords.join(' '), searchOptions, fileContents);
  
  // Build context package
  const contextPackage = buildContextPackage(
    question,
    searchResults,
    fileContents,
    index,
    budget
  );
  
  return contextPackage;
}

// Extract keywords from question
export function extractKeywords(question: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as',
    'until', 'while', 'about', 'between', 'through', 'during', 'before',
    'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'any', 'if',
  ]);
  
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  return [...new Set(words)];
}

// Get context statistics
export function getContextStats(pkg: ContextPackage): {
  totalFiles: number;
  totalLines: number;
  totalSize: number;
  estimatedTokens: number;
  budgetUsage: number;
  budgetLimit: number;
} {
  const budgetLimit = BUDGET_LIMITS[pkg.metadata.budget];
  
  return {
    totalFiles: pkg.metadata.totalFiles,
    totalLines: pkg.metadata.totalLines,
    totalSize: pkg.totalSize,
    estimatedTokens: pkg.estimatedTokens,
    budgetUsage: (pkg.totalSize / budgetLimit) * 100,
    budgetLimit,
  };
}

// Backward compatibility exports for existing code
export interface ContextResult {
  files: { path: string; relevance: number; reason: string }[];
  keywords: string[];
  totalLines: number;
  estimatedTokens: number;
}

export function extractContext(
  index: any,
  query: string,
  maxFiles: number = 10
): ContextResult {
  const keywords = extractKeywords(query);
  const searchResults = searchProject(index, keywords.join(' '), { maxResults: maxFiles });
  
  return {
    files: searchResults.map(r => ({
      path: r.file.path,
      relevance: r.score,
      reason: r.reasons.join(', '),
    })),
    keywords,
    totalLines: searchResults.reduce((sum, r) => sum + (r.file.lineCount || 0), 0),
    estimatedTokens: estimateTokens(searchResults.map(r => r.file.path).join(' ')),
  };
}

export function searchInContent(
  content: string,
  query: string
): { line: number; text: string; highlight: string }[] {
  const results = searchProject({ metadata: new Map() } as any, query, { includeContent: true });
  return results.flatMap(r => 
    r.matches
      .filter(m => m.type === 'content')
      .map(m => ({
        line: m.line || 0,
        text: m.text,
        highlight: query,
      }))
  );
}

export function expandKeywords(keywords: string[]): string[] {
  // Simple expansion - in a real implementation, this would use a thesaurus or AI
  return keywords;
}
