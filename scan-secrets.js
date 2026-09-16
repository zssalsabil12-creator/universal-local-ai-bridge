#!/usr/bin/env node

/** Secret Scanner for ULAB. Usage: node scan-secrets.js [directory] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/ },
  { name: 'Password Assignment', pattern: /password\s*[:=]\s*["'][^"']+["']/i },
  { name: 'API Key Assignment', pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/i },
  { name: 'Secret Assignment', pattern: /secret\s*[:=]\s*["'][^"']+["']/i },
  { name: 'Token Assignment', pattern: /token\s*[:=]\s*["'][^"']+["']/i },
];

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.cache'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml', '.env', '.md', '.txt'];
const findings = [];

function shouldScanFile(fileName) {
  return SCAN_EXTENSIONS.some(ext => fileName.endsWith(ext));
}
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach((line, index) => {
      for (const { name, pattern } of SECRET_PATTERNS) {
        if (pattern.test(line)) findings.push({ file: filePath, line: index + 1, pattern: name, content: line.trim().slice(0, 100) });
      }
    });
  } catch {
    // Ignore unreadable files.
  }
}

function scanDirectory(dirPath) {
  try {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory() && !SKIP_DIRS.includes(entry.name)) scanDirectory(fullPath);
      else if (entry.isFile() && shouldScanFile(entry.name)) scanFile(fullPath);
    }
  } catch {
    // Ignore unreadable directories.
  }
}

const target = process.argv[2] ? path.resolve(__dirname, process.argv[2]) : __dirname;
console.log(`Scanning for secrets: ${target}\n`);
scanDirectory(target);
if (findings.length === 0) {
  console.log('No potential secrets found.');
  process.exit(0);
}

console.log(`Found ${findings.length} potential secret(s):\n`);
for (const [index, finding] of findings.entries()) {
  console.log(`${index + 1}. ${finding.pattern}`);
  console.log(`   File: ${finding.file}`);
  console.log(`   Line: ${finding.line}`);
  console.log(`   Content: ${finding.content}\n`);
}
console.log('ACTION REQUIRED: review findings and remove any real secrets.');
process.exit(1);
