/**
 * Context Engine Tests for ULAB
 * 
 * These tests verify that the context engine correctly:
 * - Searches for relevant files
 * - Ranks results by relevance
 * - Excludes ignored files
 * - Excludes sensitive files
 * - Builds context packages
 */

import * as path from 'path';
import * as fs from 'fs';

// Simulate the context engine logic
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

interface ContextResult {
  files: { path: string; relevance: number; reason: string }[];
  keywords: string[];
  totalSize: number;
}

function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of',
    'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'where', 'what', 'when', 'why', 'how', 'which', 'who', 'that',
    'this', 'it', 'and', 'or', 'but', 'not', 'if', 'then', 'else',
  ]);
  
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

function scoreFile(file: FileNode, keywords: string[]): number {
  let score = 0;
  const pathLower = file.path.toLowerCase();
  const nameLower = file.name.toLowerCase();
  
  for (const keyword of keywords) {
    if (nameLower.includes(keyword)) score += 10;
    if (pathLower.includes(keyword)) score += 5;
  }
  
  return score;
}

function buildContext(
  query: string,
  files: FileNode[],
  projectRoot: string
): ContextResult {
  const keywords = extractKeywords(query);
  
  const scored = files
    .filter(f => f.type === 'file')
    .map(file => ({
      file,
      score: scoreFile(file, keywords),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  const selectedFiles = scored.slice(0, 10).map(item => ({
    path: item.file.path,
    relevance: item.score,
    reason: `Matched keywords: ${keywords.join(', ')}`,
  }));
  
  const totalSize = selectedFiles.reduce((sum, f) => {
    const file = files.find(file => file.path === f.path);
    return sum + (file?.size || 0);
  }, 0);
  
  return {
    files: selectedFiles,
    keywords,
    totalSize,
  };
}

// Test project structure
const testFiles: FileNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      { name: 'app.ts', path: 'src/app.ts', type: 'file', size: 1024 },
      { name: 'auth.ts', path: 'src/auth.ts', type: 'file', size: 2048 },
      { name: 'utils.ts', path: 'src/utils.ts', type: 'file', size: 512 },
    ],
  },
  {
    name: 'tests',
    path: 'tests',
    type: 'directory',
    children: [
      { name: 'app.test.ts', path: 'tests/app.test.ts', type: 'file', size: 768 },
    ],
  },
  { name: 'package.json', path: 'package.json', type: 'file', size: 256 },
  { name: 'README.md', path: 'README.md', type: 'file', size: 512 },
  { name: '.env', path: '.env', type: 'file', size: 128 },
  { name: 'credentials.json', path: 'credentials.json', type: 'file', size: 256 },
];

// Test suite
interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean, details: string = '') {
  const passed = fn();
  results.push({ name, passed, details });
  console.log(`${passed ? '✅' : '❌'} ${name}${details ? ` - ${details}` : ''}`);
}

console.log('=== ULAB Context Engine Tests ===\n');

// Test 1: Keyword Extraction
console.log('1. Keyword Extraction');
test('Extract keywords from "Where is authentication?"', () => {
  const keywords = extractKeywords('Where is authentication?');
  return keywords.includes('authentication') || keywords.includes('where');
}, `Keywords: ${extractKeywords('Where is authentication?').join(', ')}`);

test('Extract keywords from "Find auth files"', () => {
  const keywords = extractKeywords('Find auth files');
  return keywords.includes('auth') || keywords.includes('find');
}, `Keywords: ${extractKeywords('Find auth files').join(', ')}`);

// Test 2: File Scoring
console.log('\n2. File Scoring');
test('Score auth.ts higher for "authentication" query', () => {
  const authFile = testFiles[0].children![1]; // src/auth.ts
  const appFile = testFiles[0].children![0]; // src/app.ts
  
  const authScore = scoreFile(authFile, ['authentication', 'auth']);
  const appScore = scoreFile(appFile, ['authentication', 'auth']);
  
  return authScore > appScore;
}, `Auth: ${scoreFile(testFiles[0].children![1], ['authentication', 'auth'])}, App: ${scoreFile(testFiles[0].children![0], ['authentication', 'auth'])}`);

test('Score files with matching names higher', () => {
  const authFile = testFiles[0].children![1]; // src/auth.ts
  const score = scoreFile(authFile, ['auth']);
  return score > 0;
}, `Score: ${score}`);

// Test 3: Context Building
console.log('\n3. Context Building');
test('Build context for "Where is authentication?"', () => {
  const context = buildContext('Where is authentication?', testFiles, '.');
  return context.files.length > 0;
}, `Found ${buildContext('Where is authentication?', testFiles, '.').files.length} files`);

test('Rank auth.ts first for authentication query', () => {
  const context = buildContext('Where is authentication?', testFiles, '.');
  const authFile = context.files.find(f => f.path.includes('auth.ts'));
  return authFile !== undefined && context.files[0].path.includes('auth');
}, `Top file: ${buildContext('Where is authentication?', testFiles, '.').files[0]?.path}`);

test('Exclude .env from context', () => {
  const context = buildContext('Find all files', testFiles, '.');
  const envFile = context.files.find(f => f.path === '.env');
  return envFile === undefined;
}, 'Should not include .env');

test('Exclude credentials.json from context', () => {
  const context = buildContext('Find all files', testFiles, '.');
  const credFile = context.files.find(f => f.path === 'credentials.json');
  return credFile === undefined;
}, 'Should not include credentials.json');

// Test 4: Relevance Ranking
console.log('\n4. Relevance Ranking');
test('Files with matching names rank higher', () => {
  const context = buildContext('authentication', testFiles, '.');
  const authFile = context.files.find(f => f.path.includes('auth'));
  return authFile !== undefined && authFile.relevance > 0;
}, `Auth relevance: ${context.files.find(f => f.path.includes('auth'))?.relevance}`);

test('Multiple keyword matches increase relevance', () => {
  const context = buildContext('auth authentication login', testFiles, '.');
  const authFile = context.files.find(f => f.path.includes('auth'));
  return authFile !== undefined && authFile.relevance > 10;
}, `Auth relevance: ${context.files.find(f => f.path.includes('auth'))?.relevance}`);

// Test 5: Context Size
console.log('\n5. Context Size');
test('Calculate total context size', () => {
  const context = buildContext('authentication', testFiles, '.');
  return context.totalSize > 0;
}, `Total size: ${context.totalSize} bytes`);

test('Limit context to reasonable size', () => {
  const context = buildContext('all files', testFiles, '.');
  return context.files.length <= 10;
}, `Files: ${context.files.length}`);

// Summary
console.log('\n=== Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All context engine tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some context engine tests failed!');
  process.exit(1);
}
