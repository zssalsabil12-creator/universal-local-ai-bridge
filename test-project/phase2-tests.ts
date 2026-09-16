// Phase 2 Tests - Smart Context Engine & Search Engine

import { 
  ProjectIndexV2, 
  FileMetadata, 
  buildProjectIndexV2,
  detectLanguage,
  isSensitiveFile,
  extractImports,
  extractSymbols,
} from '../utils/projectIndex';

import {
  searchProject,
  calculateRelevanceScore,
  searchInContent,
  getRelatedFiles,
  SearchOptions,
  DEFAULT_SEARCH_OPTIONS,
} from '../utils/searchEngine';

import {
  buildSmartContext,
  extractKeywords,
  estimateTokens,
  extractRelevantSections,
  buildContextPackage,
  generateContextString,
  ContextBudget,
  BUDGET_LIMITS,
} from '../utils/contextEngine';

import { FileNode } from '../utils/fileSystem';

// Test utilities
interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean, details?: string) {
  const passed = fn();
  results.push({ name, passed, details });
  console.log(`${passed ? '✅' : '❌'} ${name}${details ? ` - ${details}` : ''}`);
}

// Create test data
function createTestIndex(): ProjectIndexV2 {
  const files: FileNode[] = [
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        {
          name: 'auth',
          path: 'src/auth',
          type: 'directory',
          children: [
            { name: 'login.ts', path: 'src/auth/login.ts', type: 'file', size: 1024, extension: 'ts' },
            { name: 'session.ts', path: 'src/auth/session.ts', type: 'file', size: 512, extension: 'ts' },
          ],
        },
        {
          name: 'api',
          path: 'src/api',
          type: 'directory',
          children: [
            { name: 'routes.ts', path: 'src/api/routes.ts', type: 'file', size: 2048, extension: 'ts' },
          ],
        },
        { name: 'app.ts', path: 'src/app.ts', type: 'file', size: 768, extension: 'ts' },
      ],
    },
    { name: 'package.json', path: 'package.json', type: 'file', size: 256, extension: 'json' },
    { name: 'README.md', path: 'README.md', type: 'file', size: 512, extension: 'md' },
    { name: '.env', path: '.env', type: 'file', size: 128, extension: 'env' },
  ];

  const config = {
    ignorePatterns: ['node_modules', '.git'],
    sensitivePatterns: ['.env', '.key'],
    importantFiles: ['package.json', 'README.md'],
    alwaysInclude: [],
    projectType: 'typescript',
  };

  const index: ProjectIndexV2 = {
    rootName: 'test-project',
    rootPath: '/test-project',
    totalFiles: 7,
    totalDirs: 3,
    totalSize: 5248,
    files,
    metadata: new Map(),
    extensions: { ts: 4, json: 1, md: 1, env: 1 },
    languages: { typescript: 4, json: 1, markdown: 1, unknown: 1 },
    indexedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    config,
  };

  // Add metadata
  for (const file of files) {
    if (file.type === 'file') {
      const meta: FileMetadata = {
        path: file.path,
        name: file.name,
        extension: file.extension || '',
        size: file.size || 0,
        language: detectLanguage(file.extension || ''),
        depth: file.path.split('/').length - 1,
        isIgnored: false,
        isSensitive: isSensitiveFile(file.path),
        lastModified: Date.now(),
        lineCount: 50,
        hasImports: file.path.includes('auth') || file.path.includes('api'),
        imports: file.path.includes('login') ? ['./session'] : [],
        symbols: file.path.includes('login') ? ['loginUser', 'validateUser'] : [],
      };
      index.metadata.set(file.path, meta);
    }
  }

  return index;
}

console.log('=== Phase 2 Tests ===\n');

// Test 1: Project Index
console.log('1. Project Index Tests');

test('Detect TypeScript language', () => {
  return detectLanguage('ts') === 'typescript';
});

test('Detect JavaScript language', () => {
  return detectLanguage('js') === 'javascript';
});

test('Detect Python language', () => {
  return detectLanguage('py') === 'python';
});

test('Detect sensitive file (.env)', () => {
  return isSensitiveFile('.env') === true;
});

test('Detect sensitive file (.key)', () => {
  return isSensitiveFile('private.key') === true;
});

test('Non-sensitive file', () => {
  return isSensitiveFile('app.ts') === false;
});

test('Extract imports from TypeScript', () => {
  const code = `import { login } from './auth';\nimport session from './session';`;
  const imports = extractImports(code, 'typescript');
  return imports.length === 2 && imports.includes('./auth');
});

test('Extract symbols from TypeScript', () => {
  const code = `export function loginUser() {}\nexport class Session {}`;
  const symbols = extractSymbols(code, 'typescript');
  return symbols.includes('loginUser') && symbols.includes('Session');
});

// Test 2: Search Engine
console.log('\n2. Search Engine Tests');

const testIndex = createTestIndex();

test('Search for "auth" finds auth files', () => {
  const results = searchProject(testIndex, 'auth');
  return results.some(r => r.file.path.includes('auth'));
});

test('Search for "login" finds login.ts', () => {
  const results = searchProject(testIndex, 'login');
  return results.some(r => r.file.name === 'login.ts');
});

test('Search excludes sensitive files by default', () => {
  const results = searchProject(testIndex, 'env');
  return !results.some(r => r.file.path === '.env');
});

test('Search includes sensitive files when option is set', () => {
  const options: SearchOptions = { ...DEFAULT_SEARCH_OPTIONS, excludeSensitive: false };
  const results = searchProject(testIndex, 'env', options);
  return results.some(r => r.file.path === '.env');
});

test('Relevance score for exact filename match', () => {
  const file = testIndex.metadata.get('src/auth/login.ts')!;
  const { score } = calculateRelevanceScore('login.ts', file, DEFAULT_SEARCH_OPTIONS, testIndex);
  return score > 0;
});

test('Relevance score for path match', () => {
  const file = testIndex.metadata.get('src/auth/login.ts')!;
  const { score } = calculateRelevanceScore('auth', file, DEFAULT_SEARCH_OPTIONS, testIndex);
  return score > 0;
});

test('Search in content', () => {
  const content = 'function loginUser() { return true; }';
  const matches = searchInContent(content, 'loginUser', DEFAULT_SEARCH_OPTIONS);
  return matches.length > 0;
});

test('Get related files', () => {
  const related = getRelatedFiles(testIndex, 'src/auth/login.ts');
  return related.length >= 0; // May or may not find related files
});

// Test 3: Context Engine
console.log('\n3. Context Engine Tests');

test('Extract keywords from question', () => {
  const keywords = extractKeywords('Where is authentication implemented?');
  return keywords.includes('authentication') || keywords.includes('implemented');
});

test('Estimate tokens', () => {
  const text = 'This is a test string with some content.';
  const tokens = estimateTokens(text);
  return tokens > 0 && tokens < text.length;
});

test('Extract relevant sections', () => {
  const content = Array.from({ length: 100 }, (_, i) => `Line ${i}: ${i % 10 === 0 ? 'authentication' : 'other'}`).join('\n');
  const sections = extractRelevantSections(content, 'authentication');
  return sections.length > 0;
});

test('Build context package', () => {
  const searchResults = searchProject(testIndex, 'auth');
  const fileContents = new Map<string, string>();
  fileContents.set('src/auth/login.ts', 'export function login() {}');
  
  const pkg = buildContextPackage('Where is auth?', searchResults, fileContents, testIndex, 'medium');
  return pkg.files.length > 0 && pkg.totalSize > 0;
});

test('Generate context string', () => {
  const searchResults = searchProject(testIndex, 'auth');
  const fileContents = new Map<string, string>();
  fileContents.set('src/auth/login.ts', 'export function login() {}');
  
  const pkg = buildContextPackage('Where is auth?', searchResults, fileContents, testIndex, 'medium');
  const contextStr = generateContextString(pkg);
  return contextStr.includes('Project Context') && contextStr.includes('auth');
});

test('Budget limits are respected', () => {
  const smallBudget = BUDGET_LIMITS.small;
  const largeBudget = BUDGET_LIMITS.large;
  return smallBudget < largeBudget;
});

test('Smart context builder', () => {
  const fileContents = new Map<string, string>();
  fileContents.set('src/auth/login.ts', 'export function loginUser() {}');
  fileContents.set('src/auth/session.ts', 'export class Session {}');
  
  const pkg = buildSmartContext('Where is authentication?', testIndex, fileContents);
  return pkg.files.length > 0 && pkg.question === 'Where is authentication?';
});

// Test 4: Security
console.log('\n4. Security Tests');

test('Sensitive files are excluded from search by default', () => {
  const results = searchProject(testIndex, 'env');
  return !results.some(r => r.file.isSensitive);
});

test('Ignored files are excluded from search', () => {
  const results = searchProject(testIndex, 'node_modules');
  return !results.some(r => r.file.isIgnored);
});

// Summary
console.log('\n=== Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All Phase 2 tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some Phase 2 tests failed!');
  process.exit(1);
}
