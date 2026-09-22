const assert = require('assert');
const { isLocalProjectWorkRequest } = require('./aiBridgeIntent.cjs');

const cases = [
  ['أكمل العمل على الملف مباشرة', true],
  ['اكتب وثيقة المشروع داخل الملف', true],
  ['طوّر المشروع وحسّن الواجهة', true],
  ['Create the project document in the workspace', true],
  ['Edit the current file and run the tests', true],
  ['what is a crossword?', false],
  ['what is a project document?', false],
  ['tell me what this project does', false],
  ['اكتب وثيقة المشروع داخل الملف', true],
];

for (const [text, expected] of cases) {
  assert.equal(isLocalProjectWorkRequest(text), expected, text);
}

assert.equal(isLocalProjectWorkRequest(''), false);
assert.equal(isLocalProjectWorkRequest('   '), false);
console.log('AI bridge intent tests: PASS');
