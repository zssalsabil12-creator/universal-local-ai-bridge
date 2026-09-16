#!/usr/bin/env node

/**
 * ULAB Security Verification Script
 * 
 * This script tests the security logic of the Local Agent
 * without actually running the agent.
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
  maxFileSize: 10 * 1024 * 1024,
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

// Test cases
console.log('=== ULAB Security Verification ===\n');

// Add test project to allowed paths
const testProjectPath = path.resolve(__dirname, '../test-project');
CONFIG.allowedProjectPaths.add(testProjectPath);

console.log(`Test project: ${testProjectPath}\n`);

// Test 1: Path traversal prevention
console.log('Test 1: Path Traversal Prevention');
const traversalTests = [
  { path: '../../secret.txt', expected: false },
  { path: '../../../etc/passwd', expected: false },
  { path: '../outside.txt', expected: false },
];

traversalTests.forEach(test => {
  const result = validatePath(test.path, testProjectPath);
  const passed = result === null;
  console.log(`  ${test.path}: ${passed ? '✓ BLOCKED' : '✗ FAILED'}`);
});

// Test 2: Sensitive file protection
console.log('\nTest 2: Sensitive File Protection');
const sensitiveTests = [
  { path: '.env', expected: false },
  { path: 'id_rsa', expected: false },
  { path: 'credentials.json', expected: false },
  { path: 'private.key', expected: false },
  { path: 'src/app.ts', expected: true },
];

sensitiveTests.forEach(test => {
  const result = validatePath(test.path, testProjectPath);
  const passed = (result !== null) === test.expected;
  console.log(`  ${test.path}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
});

// Test 3: Ignored patterns
console.log('\nTest 3: Ignored Patterns');
const ignoredTests = [
  { path: 'node_modules/package.json', expected: true },
  { path: '.git/config', expected: true },
  { path: 'dist/bundle.js', expected: true },
  { path: 'src/app.ts', expected: false },
];

ignoredTests.forEach(test => {
  const result = isIgnoredFile(test.path);
  const passed = result === test.expected;
  console.log(`  ${test.path}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
});

// Test 4: Project boundary enforcement
console.log('\nTest 4: Project Boundary Enforcement');
const boundaryTests = [
  { path: 'C:\\Windows\\System32\\config', expected: false },
  { path: '/etc/passwd', expected: false },
  { path: 'src/app.ts', expected: true },
];

boundaryTests.forEach(test => {
  const result = validatePath(test.path, testProjectPath);
  const passed = (result !== null) === test.expected;
  console.log(`  ${test.path}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
});

console.log('\n=== Verification Complete ===');
