/**
 * Security Tests for ULAB Local Agent
 * 
 * These tests verify that the security logic correctly:
 * - Blocks path traversal attempts
 * - Blocks access to sensitive files
 * - Enforces project boundaries
 * - Rejects malformed requests
 */

import * as path from 'path';

// Simulate the security logic from agent/src/index.ts
const CONFIG = {
  allowedProjectPaths: new Set<string>(),
  sensitivePatterns: [
    /\.env$/,
    /\.pem$/,
    /\.key$/,
    /private.*key/i,
    /credential/i,
    /secret/i,
  ],
  ignoredPatterns: [
    /node_modules/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /\.cache/,
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

function isPathAllowed(requestedPath: string): boolean {
  const normalizedPath = path.normalize(requestedPath);
  
  for (const allowedPath of CONFIG.allowedProjectPaths) {
    if (normalizedPath.startsWith(allowedPath)) {
      return true;
    }
  }
  
  return false;
}

function isSensitiveFile(filePath: string): boolean {
  return CONFIG.sensitivePatterns.some(pattern => pattern.test(filePath));
}

function isIgnoredFile(filePath: string): boolean {
  return CONFIG.ignoredPatterns.some(pattern => pattern.test(filePath));
}

function validatePath(requestedPath: string, projectRoot: string): string | null {
  const normalizedPath = path.normalize(requestedPath);
  const resolvedPath = path.resolve(projectRoot, normalizedPath);
  
  if (!resolvedPath.startsWith(projectRoot)) {
    return null;
  }
  
  if (isSensitiveFile(resolvedPath)) {
    return null;
  }
  
  return resolvedPath;
}

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

console.log('=== ULAB Security Tests ===\n');

// Setup
const testProjectPath = path.resolve(__dirname, 'test-project');
CONFIG.allowedProjectPaths.add(testProjectPath);

// Test 1: Path Traversal Prevention
console.log('1. Path Traversal Prevention');
test('Block ../../secret.txt', () => {
  const result = validatePath('../../secret.txt', testProjectPath);
  return result === null;
}, 'Should return null');

test('Block ../../../etc/passwd', () => {
  const result = validatePath('../../../etc/passwd', testProjectPath);
  return result === null;
}, 'Should return null');

test('Block ../outside.txt', () => {
  const result = validatePath('../outside.txt', testProjectPath);
  return result === null;
}, 'Should return null');

test('Allow src/app.ts', () => {
  const result = validatePath('src/app.ts', testProjectPath);
  return result !== null;
}, 'Should return valid path');

// Test 2: Sensitive File Protection
console.log('\n2. Sensitive File Protection');
test('Block .env', () => {
  const result = validatePath('.env', testProjectPath);
  return result === null;
}, 'Should return null');

test('Block .env.local', () => {
  const result = validatePath('.env.local', testProjectPath);
  return result === null;
}, 'Should return null');

test('Block credentials.json', () => {
  const result = validatePath('credentials.json', testProjectPath);
  return result === null;
}, 'Should return null');

test('Block private.key', () => {
  const result = validatePath('private.key', testProjectPath);
  return result === null;
}, 'Should return null');

test('Allow src/app.ts', () => {
  const result = validatePath('src/app.ts', testProjectPath);
  return result !== null;
}, 'Should return valid path');

// Test 3: Ignored Patterns
console.log('\n3. Ignored Patterns');
test('Ignore node_modules/package.json', () => {
  return isIgnoredFile('node_modules/package.json');
}, 'Should return true');

test('Ignore .git/config', () => {
  return isIgnoredFile('.git/config');
}, 'Should return true');

test('Ignore dist/bundle.js', () => {
  return isIgnoredFile('dist/bundle.js');
}, 'Should return true');

test('Don\'t ignore src/app.ts', () => {
  return !isIgnoredFile('src/app.ts');
}, 'Should return false');

// Test 4: Project Boundary Enforcement
console.log('\n4. Project Boundary Enforcement');
test('Block C:\\Windows\\System32', () => {
  const result = validatePath('C:\\Windows\\System32', testProjectPath);
  return result === null;
}, 'Should return null');

test('Block /etc/passwd', () => {
  const result = validatePath('/etc/passwd', testProjectPath);
  return result === null;
}, 'Should return null');

test('Allow src/app.ts', () => {
  const result = validatePath('src/app.ts', testProjectPath);
  return result !== null;
}, 'Should return valid path');

// Test 5: Sensitive File Detection
console.log('\n5. Sensitive File Detection');
test('Detect .env', () => {
  return isSensitiveFile('.env');
}, 'Should return true');

test('Detect id_rsa', () => {
  return isSensitiveFile('id_rsa');
}, 'Should return true');

test('Detect credentials.json', () => {
  return isSensitiveFile('credentials.json');
}, 'Should return true');

test('Detect private.key', () => {
  return isSensitiveFile('private.key');
}, 'Should return true');

test('Don\'t detect src/app.ts', () => {
  return !isSensitiveFile('src/app.ts');
}, 'Should return false');

// Summary
console.log('\n=== Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All security tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some security tests failed!');
  process.exit(1);
}
