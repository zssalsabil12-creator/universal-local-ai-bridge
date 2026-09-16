// Advanced Local Search Engine with relevance scoring

import { ProjectIndexV2, FileMetadata } from './projectIndex';

export interface SearchResult {
  file: FileMetadata;
  score: number;
  matches: SearchMatch[];
  reasons: string[];
}

export interface SearchMatch {
  type: 'filename' | 'path' | 'content' | 'symbol' | 'import';
  text: string;
  line?: number;
  context?: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  maxResults?: number;
  includeContent?: boolean;
  fileTypes?: string[];
  directories?: string[];
  excludeSensitive?: boolean;
}

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
  maxResults: 50,
  includeContent: true,
  excludeSensitive: true,
};

// Relevance scoring weights
const SCORE_WEIGHTS = {
  filenameExact: 100,
  filenamePartial: 50,
  pathExact: 80,
  pathPartial: 40,
  symbolMatch: 70,
  importMatch: 60,
  contentMatch: 30,
  directoryBonus: 20,
  extensionBonus: 15,
  importantFile: 50,
  sourceFile: 25,
};

// Important directories for scoring
const IMPORTANT_DIRS = ['src', 'lib', 'app', 'components', 'services', 'api'];

// Calculate relevance score for a file
export function calculateRelevanceScore(
  query: string,
  file: FileMetadata,
  options: SearchOptions,
  index: ProjectIndexV2
): { score: number; matches: SearchMatch[]; reasons: string[] } {
  var score = 0;
  const matches: SearchMatch[] = [];
  const reasons: string[] = [];
  
  const normalizedQuery = options.caseSensitive ? query : query.toLowerCase();
  const normalizedName = options.caseSensitive ? file.name : file.name.toLowerCase();
  const normalizedPath = options.caseSensitive ? file.path : file.path.toLowerCase();
  
  // 1. Filename matching
  if (normalizedName === normalizedQuery) {
    score += SCORE_WEIGHTS.filenameExact;
    matches.push({ type: 'filename', text: file.name });
    reasons.push('Exact filename match');
  } else if (normalizedName.includes(normalizedQuery)) {
    score += SCORE_WEIGHTS.filenamePartial;
    matches.push({ type: 'filename', text: file.name });
    reasons.push('Partial filename match');
  }
  
  // 2. Path matching
  if (normalizedPath === normalizedQuery) {
    score += SCORE_WEIGHTS.pathExact;
    matches.push({ type: 'path', text: file.path });
    reasons.push('Exact path match');
  } else if (normalizedPath.includes(normalizedQuery)) {
    score += SCORE_WEIGHTS.pathPartial;
    matches.push({ type: 'path', text: file.path });
    reasons.push('Partial path match');
  }
  
  // 3. Symbol matching
  for (const symbol of file.symbols) {
    const normalizedSymbol = options.caseSensitive ? symbol : symbol.toLowerCase();
    if (normalizedSymbol === normalizedQuery) {
      score += SCORE_WEIGHTS.symbolMatch;
      matches.push({ type: 'symbol', text: symbol });
      reasons.push(`Symbol match: ${symbol}`);
    } else if (normalizedSymbol.includes(normalizedQuery)) {
      score += SCORE_WEIGHTS.symbolMatch * 0.7;
      matches.push({ type: 'symbol', text: symbol });
      reasons.push(`Partial symbol match: ${symbol}`);
    }
  }
  
  // 4. Import matching
  for (const importPath of file.imports) {
    const normalizedImport = options.caseSensitive ? importPath : importPath.toLowerCase();
    if (normalizedImport.includes(normalizedQuery)) {
      score += SCORE_WEIGHTS.importMatch;
      matches.push({ type: 'import', text: importPath });
      reasons.push(`Import match: ${importPath}`);
    }
  }
  
  // 5. Directory bonus
  const pathParts = file.path.split('/');
  for (const part of pathParts) {
    if (IMPORTANT_DIRS.includes(part.toLowerCase())) {
      score += SCORE_WEIGHTS.directoryBonus;
      reasons.push(`Important directory: ${part}`);
      break;
    }
  }
  
  // 6. Extension bonus for code files
  const codeExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java'];
  if (codeExtensions.includes(file.extension)) {
    score += SCORE_WEIGHTS.extensionBonus;
    reasons.push('Code file bonus');
  }
  
  // 7. Important file bonus
  if (index.config.importantFiles.some(pattern => 
    file.path.includes(pattern) || file.name === pattern
  )) {
    score += SCORE_WEIGHTS.importantFile;
    reasons.push('Important file');
  }
  
  // 8. Source file bonus
  if (file.path.startsWith('src/') || file.path.startsWith('lib/')) {
    score += SCORE_WEIGHTS.sourceFile;
    reasons.push('Source file');
  }
  
  return { score, matches, reasons };
}

// Search in project index
export function searchProject(
  index: ProjectIndexV2,
  query: string,
  options: SearchOptions = DEFAULT_SEARCH_OPTIONS,
  fileContents?: Map<string, string>
): SearchResult[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const results: SearchResult[] = [];
  const maxResults = options.maxResults || 50;
  
  // Search through all files
  for (const file of index.metadata.values()) {
    // Skip ignored files
    if (file.isIgnored) continue;
    
    // Skip sensitive files if option is set
    if (options.excludeSensitive && file.isSensitive) continue;
    
    // Filter by file types if specified
    if (options.fileTypes && options.fileTypes.length > 0) {
      if (!options.fileTypes.includes(file.extension)) continue;
    }
    
    // Filter by directories if specified
    if (options.directories && options.directories.length > 0) {
      if (!options.directories.some(dir => file.path.startsWith(dir))) continue;
    }
    
    // Calculate relevance score
    let { score, matches, reasons } = calculateRelevanceScore(
      query,
      file,
      options,
      index
    );
    
    // Search in content if available and option is set
    if (options.includeContent && fileContents && score > 0) {
      const content = fileContents.get(file.path);
      if (content && !file.isSensitive) {
        const contentMatches = searchInContent(content, query, options);
        if (contentMatches.length > 0) {
          let contentScore = SCORE_WEIGHTS.contentMatch * contentMatches.length;
          score += contentScore;
          matches.push(...contentMatches);
          reasons.push(`Content matches: ${contentMatches.length}`);
        }
      }
    }
    
    // Only include files with matches
    if (score > 0) {
      results.push({
        file,
        score,
        matches,
        reasons,
      });
    }
  }
  
  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);
  
  // Limit results
  return results.slice(0, maxResults);
}

// Search in file content
export function searchInContent(
  content: string,
  query: string,
  options: SearchOptions
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const lines = content.split('\n');
  
  const normalizedQuery = options.caseSensitive ? query : query.toLowerCase();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const normalizedLine = options.caseSensitive ? line : line.toLowerCase();
    
    let matchIndex = -1;
    
    if (options.regex) {
      try {
        const regex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
        const match = regex.exec(line);
        if (match) {
          matchIndex = match.index;
        }
      } catch (e) {
        // Invalid regex, skip
        continue;
      }
    } else {
      matchIndex = normalizedLine.indexOf(normalizedQuery);
    }
    
    if (matchIndex !== -1) {
      // Get context (2 lines before and after)
      const startLine = Math.max(0, i - 2);
      const endLine = Math.min(lines.length - 1, i + 2);
      const context = lines.slice(startLine, endLine + 1).join('\n');
      
      matches.push({
        type: 'content',
        text: line.trim(),
        line: i + 1,
        context,
      });
    }
  }
  
  return matches;
}

// Search by file type
export function searchByFileType(
  index: ProjectIndexV2,
  extension: string,
  query?: string
): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const file of index.metadata.values()) {
    if (file.extension !== extension) continue;
    if (file.isIgnored) continue;
    
    let score = 10; // Base score for matching extension
    const matches: SearchMatch[] = [];
    const reasons: string[] = ['File type match'];
    
    if (query) {
      const { score: queryScore, matches: queryMatches, reasons: queryReasons } = 
        calculateRelevanceScore(query, file, DEFAULT_SEARCH_OPTIONS, index);
      score += queryScore;
      matches.push(...queryMatches);
      reasons.push(...queryReasons);
    }
    
    if (score > 0) {
      results.push({ file, score, matches, reasons });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results;
}

// Search by directory
export function searchByDirectory(
  index: ProjectIndexV2,
  directory: string,
  query?: string
): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const file of index.metadata.values()) {
    if (!file.path.startsWith(directory)) continue;
    if (file.isIgnored) continue;
    
    let score = 10; // Base score for matching directory
    const matches: SearchMatch[] = [];
    const reasons: string[] = ['Directory match'];
    
    if (query) {
      const { score: queryScore, matches: queryMatches, reasons: queryReasons } = 
        calculateRelevanceScore(query, file, DEFAULT_SEARCH_OPTIONS, index);
      score += queryScore;
      matches.push(...queryMatches);
      reasons.push(...queryReasons);
    }
    
    if (score > 0) {
      results.push({ file, score, matches, reasons });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results;
}

// Get related files based on imports
export function getRelatedFiles(
  index: ProjectIndexV2,
  filePath: string
): FileMetadata[] {
  const file = index.metadata.get(filePath);
  if (!file) return [];
  
  const related: FileMetadata[] = [];
  
  // Find files that import this file
  for (const otherFile of index.metadata.values()) {
    if (otherFile.path === filePath) continue;
    
    // Check if other file imports this file
    for (const importPath of otherFile.imports) {
      if (importPath.includes(file.name.replace(/\.[^/.]+$/, ''))) {
        related.push(otherFile);
        break;
      }
    }
  }
  
  // Find files that this file imports
  for (const importPath of file.imports) {
    for (const otherFile of index.metadata.values()) {
      if (otherFile.path === filePath) continue;
      
      if (importPath.includes(otherFile.name.replace(/\.[^/.]+$/, ''))) {
        if (!related.includes(otherFile)) {
          related.push(otherFile);
        }
      }
    }
  }
  
  return related;
}

// Advanced search with multiple queries
export function advancedSearch(
  index: ProjectIndexV2,
  queries: string[],
  options: SearchOptions = DEFAULT_SEARCH_OPTIONS,
  fileContents?: Map<string, string>
): SearchResult[] {
  const allResults = new Map<string, SearchResult>();
  
  for (const query of queries) {
    const results = searchProject(index, query, options, fileContents);
    
    for (const result of results) {
      const existing = allResults.get(result.file.path);
      
      if (existing) {
        // Merge results
        existing.score += result.score;
        existing.matches.push(...result.matches);
        existing.reasons.push(...result.reasons);
      } else {
        allResults.set(result.file.path, { ...result });
      }
    }
  }
  
  // Convert to array and sort
  const results = Array.from(allResults.values());
  results.sort((a, b) => b.score - a.score);
  
  return results;
}
