// Phase 3 Tests - AI Integration & Provider Adapters

import { providerRegistry } from '../adapters';
import { genericAdapter } from '../adapters/generic';
import { chatGPTAdapter } from '../adapters/chatgpt';
import { geminiAdapter } from '../adapters/gemini';
import { deepSeekAdapter } from '../adapters/deepseek';
import { taskManager, Task, TaskStatus } from '../utils/taskManager';

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

console.log('=== Phase 3 Tests ===\n');

// Test 1: Provider Registry
console.log('1. Provider Registry Tests');

test('Provider registry has all adapters', () => {
  const adapters = providerRegistry.getAll();
  return adapters.length === 4;
});

test('Generic adapter is always supported', () => {
  return genericAdapter.isSupported() === true;
});

test('Generic adapter detects provider', () => {
  return genericAdapter.detectProvider() === true;
});

test('ChatGPT adapter has correct ID', () => {
  return chatGPTAdapter.id === 'chatgpt';
});

test('Gemini adapter has correct ID', () => {
  return geminiAdapter.id === 'gemini';
});

test('DeepSeek adapter has correct ID', () => {
  return deepSeekAdapter.id === 'deepseek';
});

// Test 2: Generic Mode
console.log('\n2. Generic Mode Tests');

test('Generic mode prepares context', () => {
  const context = 'Test context';
  const prepared = genericAdapter.prepareContext(context);
  return prepared.includes(context);
});

test('Generic mode extracts local-action from response', () => {
  const response = '```local-action\n{"action": "files.write", "path": "test.ts"}\n```';
  const action = genericAdapter.detectLocalAction(response);
  return action !== null && action.action === 'files.write';
});

test('Generic mode rejects malformed action', () => {
  const response = '```local-action\n{invalid json}\n```';
  const action = genericAdapter.detectLocalAction(response);
  return action === null;
});

test('Generic mode rejects invalid action type', () => {
  const response = '```local-action\n{"action": "invalid.action"}\n```';
  const action = genericAdapter.detectLocalAction(response);
  return action === null;
});

// Test 3: ChatGPT Adapter
console.log('\n3. ChatGPT Adapter Tests');

test('ChatGPT adapter prepares context', () => {
  const context = 'Test context';
  const prepared = chatGPTAdapter.prepareContext(context);
  return prepared.includes(context);
});

test('ChatGPT adapter extracts local-action', () => {
  const response = '```local-action\n{"action": "files.write", "path": "test.ts"}\n```';
  const action = chatGPTAdapter.detectLocalAction(response);
  return action !== null && action.action === 'files.write';
});

test('ChatGPT adapter rejects malformed JSON', () => {
  const response = '```local-action\n{broken}\n```';
  const action = chatGPTAdapter.detectLocalAction(response);
  return action === null;
});

// Test 4: Gemini Adapter
console.log('\n4. Gemini Adapter Tests');

test('Gemini adapter prepares context', () => {
  const context = 'Test context';
  const prepared = geminiAdapter.prepareContext(context);
  return prepared.includes(context);
});

test('Gemini adapter extracts local-action', () => {
  const response = '```local-action\n{"action": "files.read", "path": "test.ts"}\n```';
  const action = geminiAdapter.detectLocalAction(response);
  return action !== null && action.action === 'files.read';
});

// Test 5: DeepSeek Adapter
console.log('\n5. DeepSeek Adapter Tests');

test('DeepSeek adapter prepares context', () => {
  const context = 'Test context';
  const prepared = deepSeekAdapter.prepareContext(context);
  return prepared.includes(context);
});

test('DeepSeek adapter extracts local-action', () => {
  const response = '```local-action\n{"action": "project.search", "path": "src"}\n```';
  const action = deepSeekAdapter.detectLocalAction(response);
  return action !== null && action.action === 'project.search';
});

// Test 6: Task Manager
console.log('\n6. Task Manager Tests');

test('Task manager creates task', () => {
  const task = taskManager.createTask(
    'Test Task',
    'project-1',
    'Test Project',
    'generic',
    'Test question?'
  );
  return task !== null && task.title === 'Test Task';
});

test('Task manager gets current task', () => {
  const task = taskManager.getCurrentTask();
  return task !== null && task.title === 'Test Task';
});

test('Task manager updates task status', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.updateTaskStatus(task.id, 'CONTEXT_READY');
  return updated !== null && updated.status === 'CONTEXT_READY';
});

test('Task manager updates task context', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.updateTaskContext(
    task.id,
    ['file1.ts', 'file2.ts'],
    1024,
    256
  );
  return updated !== null && updated.selectedFiles.length === 2;
});

test('Task manager adds proposed changes', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const changes = [
    {
      path: 'test.ts',
      action: 'modify' as const,
      before: 'old',
      after: 'new',
      approved: false,
      applied: false,
    },
  ];
  
  const updated = taskManager.addProposedChanges(task.id, changes);
  return updated !== null && updated.proposedChanges.length === 1;
});

test('Task manager approves changes', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.approveChanges(task.id, ['test.ts']);
  return updated !== null && updated.approvedChanges.length === 1;
});

test('Task manager marks changes applied', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.markChangesApplied(task.id, ['test.ts']);
  return updated !== null && updated.appliedChanges.length === 1;
});

test('Task manager sets task result', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.setTaskResult(task.id, 'Success');
  return updated !== null && updated.status === 'VERIFIED';
});

test('Task manager gets all tasks', () => {
  const tasks = taskManager.getAllTasks();
  return tasks.length > 0;
});

test('Task manager deletes task', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const deleted = taskManager.deleteTask(task.id);
  return deleted === true;
});

// Test 7: Security
console.log('\n7. Security Tests');

test('Action extraction rejects non-action text', () => {
  const response = 'This is just regular text without any actions';
  const action = genericAdapter.detectLocalAction(response);
  return action === null;
});

test('Action extraction rejects code comments', () => {
  const response = '// {"action": "files.write"}\nconst x = 1;';
  const action = genericAdapter.detectLocalAction(response);
  return action === null;
});

test('Action extraction validates action structure', () => {
  const response = '```local-action\n{"invalid": "structure"}\n```';
  const action = genericAdapter.detectLocalAction(response);
  return action === null;
});

test('Action extraction rejects dangerous actions', () => {
  const response = '```local-action\n{"action": "system.execute", "command": "rm -rf /"}\n```';
  const action = genericAdapter.detectLocalAction(response);
  return action === null;
});

// Summary
console.log('\n=== Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All Phase 3 tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some Phase 3 tests failed!');
  process.exit(1);
}
