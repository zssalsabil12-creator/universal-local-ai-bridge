import assert from 'node:assert/strict';
import { parseGitStatusOutput } from '../src/GitSecurity';

const output = [
  '## feature/auth...origin/feature/auth [ahead 2]',
  'M  src/staged-modified.ts',
  'A  src/staged-added.ts',
  'D  src/staged-deleted.ts',
  ' M src/worktree-modified.ts',
  '?? src/untracked.ts',
].join('\n');

const result = parseGitStatusOutput(output);

assert.equal(result.branch, 'feature/auth');
assert.deepEqual(result.staged, [
  'src/staged-modified.ts',
  'src/staged-added.ts',
  'src/staged-deleted.ts',
]);
assert.deepEqual(result.modified, ['src/worktree-modified.ts']);
assert.deepEqual(result.untracked, ['src/untracked.ts']);
assert.equal(result.clean, false);
assert.equal(result.isRepository, true);

const clean = parseGitStatusOutput('## main\n');
assert.equal(clean.branch, 'main');
assert.deepEqual(clean.staged, []);
assert.deepEqual(clean.modified, []);
assert.deepEqual(clean.untracked, []);
assert.equal(clean.clean, true);

console.log('Git security parser tests: PASS');
