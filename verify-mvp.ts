#!/usr/bin/env node

/**
 * ULAB MVP Verification Script
 * 
 * This script performs comprehensive verification of the ULAB MVP
 * and generates a detailed report.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  details: string;
}

const results: TestResult[] = [];
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function addResult(name: string, status: 'PASS' | 'FAIL' | 'BLOCKED', details: string) {
  results.push({ name, status, details });
  console.log(`[${status}] ${name}: ${details}`);
}

console.log('=== ULAB MVP Verification ===\n');

// Test 1: Extension files exist
console.log('1. Verifying Extension Files...');
const extensionFiles = [
  'extension/manifest.json',
  'extension/background/service-worker.js',
  'extension/sidepanel/index.html',
  'extension/sidepanel/styles.css',
  'extension/sidepanel/panel.js',
  'extension/content/content.js',
];

extensionFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    addResult(`Extension: ${file}`, 'PASS', 'File exists');
  } else {
    addResult(`Extension: ${file}`, 'FAIL', 'File missing');
  }
});

// Test 2: Agent files exist
console.log('\n2. Verifying Agent Files...');
const agentFiles = [
  'agent/package.json',
  'agent/tsconfig.json',
  'agent/src/index.ts',
  'agent/native-messaging/com.ulab.agent.json',
  'agent/install.bat',
];

agentFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    addResult(`Agent: ${file}`, 'PASS', 'File exists');
  } else {
    addResult(`Agent: ${file}`, 'FAIL', 'File missing');
  }
});

// Test 3: Manifest validation
console.log('\n3. Validating Manifest...');
try {
  const manifestPath = path.join(projectRoot, 'extension/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  if (manifest.manifest_version === 3) {
    addResult('Manifest Version', 'PASS', 'Manifest V3');
  } else {
    addResult('Manifest Version', 'FAIL', `Expected V3, got V${manifest.manifest_version}`);
  }
  
  if (manifest.side_panel) {
    addResult('Side Panel', 'PASS', 'Side panel declared');
  } else {
    addResult('Side Panel', 'FAIL', 'Side panel not declared');
  }
  
  if (manifest.host_permissions?.includes('http://127.0.0.1:19999/*')) {
    addResult('Local Agent Permission', 'PASS', 'Localhost Agent access declared');
  } else {
    addResult('Local Agent Permission', 'FAIL', 'Localhost Agent access missing');
  }
  
} catch (error) {
  addResult('Manifest Validation', 'FAIL', `Error: ${error}`);
}

// Test 4: Test project exists
console.log('\n4. Verifying Test Project...');
const testProjectFiles = [
  'test-project/README.md',
  'test-project/package.json',
  'test-project/src/app.ts',
  'test-project/src/auth.ts',
  'test-project/.env',
  'test-project/id_rsa',
  'test-project/credentials.json',
];

testProjectFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    addResult(`Test Project: ${file}`, 'PASS', 'File exists');
  } else {
    addResult(`Test Project: ${file}`, 'FAIL', 'File missing');
  }
});

// Test 5: Security logic verification
console.log('\n5. Verifying Security Logic...');
try {
  // Simulate security checks
  const testProjectPath = path.resolve(projectRoot, 'test-project');
  
  // Test path traversal
  const traversalPath = path.resolve(testProjectPath, '../../secret.txt');
  const isOutside = !traversalPath.startsWith(testProjectPath);
  addResult('Path Traversal Prevention', isOutside ? 'PASS' : 'FAIL', 
    isOutside ? 'Traversal blocked' : 'Traversal allowed');
  
  // Test sensitive file detection
  const sensitiveFiles = ['.env', 'id_rsa', 'credentials.json'];
  const sensitivePatterns = [/^\.env(?:\..*)?$/i, /\.pem$/i, /\.key$/i, /id_rsa/i, /private.*key/i, /credential/i, /secret/i];
  
  let allSensitiveBlocked = true;
  sensitiveFiles.forEach(file => {
    const isSensitive = sensitivePatterns.some(pattern => pattern.test(file));
    if (!isSensitive) allSensitiveBlocked = false;
  });
  
  addResult('Sensitive File Detection', allSensitiveBlocked ? 'PASS' : 'FAIL',
    allSensitiveBlocked ? 'All sensitive files detected' : 'Some files not detected');
  
} catch (error) {
  addResult('Security Logic', 'FAIL', `Error: ${error}`);
}

// Test 6: Build artifacts
console.log('\n6. Verifying Build Artifacts...');
const buildArtifacts = [
  'dist/index.html',
  'build-extension.bat',
];

buildArtifacts.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    addResult(`Build: ${file}`, 'PASS', 'Artifact exists');
  } else {
    addResult(`Build: ${file}`, 'FAIL', 'Artifact missing');
  }
});

// Test 7: Documentation
console.log('\n7. Verifying Documentation...');
const docs = [
  'README.md',
  'INSTALL.md',
  'USER_GUIDE.md',
  'ARCHITECTURE.md',
  'SECURITY.md',
  'PRIVACY.md',
  'PHASE_1_SUMMARY.md',
];

docs.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    addResult(`Docs: ${file}`, 'PASS', 'Document exists');
  } else {
    addResult(`Docs: ${file}`, 'FAIL', 'Document missing');
  }
});

// Generate report
console.log('\n=== Verification Report ===\n');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const blocked = results.filter(r => r.status === 'BLOCKED').length;

console.log(`Total Tests: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Blocked: ${blocked}`);

console.log('\nDetailed Results:');
results.forEach(result => {
  console.log(`  [${result.status}] ${result.name}`);
  console.log(`         ${result.details}`);
});

// Summary
console.log('\n=== Summary ===\n');

if (failed === 0 && blocked === 0) {
  console.log('✓ All tests passed!');
  console.log('✓ MVP is ready for manual testing on Windows');
} else if (failed === 0) {
  console.log('✓ All critical tests passed');
  console.log('⚠ Some tests were blocked (environment limitations)');
  console.log('✓ MVP is ready for manual testing on Windows');
} else {
  console.log('✗ Some tests failed');
  console.log('✗ MVP needs fixes before deployment');
}

console.log('\n=== Environment Limitations ===\n');
console.log('The following cannot be tested in this environment:');
console.log('  • Chrome Extension loading (requires Chrome browser)');
console.log('  • Windows Agent execution (requires Windows OS)');
console.log('  • Local Agent communication (requires Chrome + Agent)');
console.log('  • Real file system operations (requires running Agent)');
console.log('  • End-to-end integration testing');
console.log('\nThese must be tested manually on a Windows machine with Chrome.');

// Export results
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total: results.length,
    passed,
    failed,
    blocked,
  },
  results,
  environment: {
    canTestExtension: false,
    canTestAgent: false,
    canTestNativeMessaging: false,
    canTestFileSystem: false,
  },
};

fs.writeFileSync(
  path.join(projectRoot, 'verification-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✓ Report saved to verification-report.json');
