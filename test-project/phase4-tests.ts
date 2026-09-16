// Phase 4 Tests - Advanced Developer Workspace
// Tests for task management, context packages, memory, and change review

import {
  DeveloperTaskManager,
  DeveloperTask,
  ContextPackage,
} from '../utils/developerTaskManager';

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

console.log('=== Phase 4 Tests ===\n');

// Test 1: Task Manager - Basic Operations
console.log('1. Task Manager - Basic Operations');

const taskManager = new DeveloperTaskManager();

test('Create a new task', () => {
  const task = taskManager.createTask(
    'project-1',
    'Fix authentication bug',
    'The login flow is broken',
    'chatgpt'
  );
  return task !== null && task.id !== '' && task.status === 'NEW';
});

test('Get current task', () => {
  const task = taskManager.getCurrentTask();
  return task !== null && task.title === 'Fix authentication bug';
});

test('Update task status', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.updateTaskStatus(task.id, 'ANALYZING');
  return updated !== null && updated.status === 'ANALYZING';
});

test('Get all tasks', () => {
  const tasks = taskManager.getAllTasks();
  return tasks.length === 1;
});

// Test 2: Task Manager - File Selection
console.log('\n2. Task Manager - File Selection');

test('Add selected files', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const files = [
    { path: 'src/auth/login.ts', selected: true, pinned: false },
    { path: 'src/auth/session.ts', selected: true, pinned: false },
  ];
  
  const updated = taskManager.addSelectedFiles(task.id, files);
  return updated !== null && updated.selectedFiles.length === 2;
});

test('Pin a file', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.pinFile(task.id, 'src/auth/login.ts');
  return updated !== null && updated.selectedFiles[0].pinned === true;
});

test('Unpin a file', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.unpinFile(task.id, 'src/auth/login.ts');
  return updated !== null && updated.selectedFiles[0].pinned === false;
});

// Test 3: Task Manager - Context
console.log('\n3. Task Manager - Context');

test('Set context summary', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.setContextSummary(task.id, 'Authentication flow with login and session');
  return updated !== null && updated.contextSummary !== '' && updated.status === 'CONTEXT_READY';
});

// Test 4: Task Manager - Changes
console.log('\n4. Task Manager - Changes');

test('Add proposed changes', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const changes = [
    {
      path: 'src/auth/login.ts',
      action: 'modify' as const,
      before: 'old code',
      after: 'new code',
      approved: false,
      applied: false,
      verified: false,
    },
  ];
  
  const updated = taskManager.addProposedChanges(task.id, changes);
  return updated !== null && updated.proposedChanges.length === 1 && updated.status === 'CHANGES_PROPOSED';
});

test('Approve changes', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.approveChanges(task.id, ['src/auth/login.ts']);
  return updated !== null && updated.proposedChanges[0].approved === true && updated.status === 'APPROVED';
});

test('Reject changes', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.rejectChanges(task.id, ['src/auth/login.ts']);
  return updated !== null && updated.proposedChanges[0].approved === false;
});

test('Mark changes as applied', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.markChangesApplied(task.id, ['src/auth/login.ts']);
  return updated !== null && updated.proposedChanges[0].applied === true && updated.status === 'APPLIED';
});

test('Mark changes as verified', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.markChangesVerified(task.id, ['src/auth/login.ts']);
  return updated !== null && updated.proposedChanges[0].verified === true && updated.status === 'VERIFIED';
});

// Test 5: Task Manager - Rollback
console.log('\n5. Task Manager - Rollback');

test('Create rollback snapshot', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const files = new Map([['src/auth/login.ts', 'original code']]);
  const updated = taskManager.createRollbackSnapshot(task.id, files);
  return updated !== null && updated.rollbackSnapshot !== undefined;
});

test('Rollback changes', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const snapshot = taskManager.rollbackChanges(task.id);
  return snapshot !== null && snapshot.get('src/auth/login.ts') === 'original code';
});

// Test 6: Context Packages
console.log('\n6. Context Packages');

test('Save context package', () => {
  const pkg = taskManager.saveContextPackage(
    'Authentication Debugging',
    ['src/auth/login.ts', 'src/auth/session.ts'],
    'Files for debugging authentication issues'
  );
  return pkg !== null && pkg.id !== '' && pkg.files.length === 2;
});

test('Get all context packages', () => {
  const packages = taskManager.getAllContextPackages();
  return packages.length === 1;
});

test('Get context package by ID', () => {
  const packages = taskManager.getAllContextPackages();
  const pkg = taskManager.getContextPackage(packages[0].id);
  return pkg !== null && pkg.name === 'Authentication Debugging';
});

test('Update context package', () => {
  const packages = taskManager.getAllContextPackages();
  const updated = taskManager.updateContextPackage(
    packages[0].id,
    'Updated Name',
    ['src/auth/login.ts'],
    'Updated description'
  );
  return updated !== null && updated.name === 'Updated Name' && updated.files.length === 1;
});

test('Add context package to task', () => {
  const task = taskManager.getCurrentTask();
  const packages = taskManager.getAllContextPackages();
  if (!task) return false;
  
  const updated = taskManager.addContextPackageToTask(task.id, packages[0].id);
  return updated !== null && updated.contextPackages.length === 1;
});

test('Remove context package from task', () => {
  const task = taskManager.getCurrentTask();
  const packages = taskManager.getAllContextPackages();
  if (!task) return false;
  
  const updated = taskManager.removeContextPackageFromTask(task.id, packages[0].id);
  return updated !== null && updated.contextPackages.length === 0;
});

test('Delete context package', () => {
  const packages = taskManager.getAllContextPackages();
  const deleted = taskManager.deleteContextPackage(packages[0].id);
  return deleted === true && taskManager.getAllContextPackages().length === 0;
});

// Test 7: Task Manager - Memory
console.log('\n7. Task Manager - Memory');

test('Add memory to task', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.addMemoryToTask(task.id, ['Use TypeScript strict mode', 'Always write tests']);
  return updated !== null && updated.memory !== undefined && updated.memory.length === 2;
});

// Test 8: Task Manager - Task Lifecycle
console.log('\n8. Task Manager - Task Lifecycle');

test('Cancel task', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const updated = taskManager.cancelTask(task.id);
  return updated !== null && updated.status === 'CANCELLED';
});

test('Get tasks by status', () => {
  const tasks = taskManager.getTasksByStatus('CANCELLED');
  return tasks.length === 1;
});

test('Get recent tasks', () => {
  const tasks = taskManager.getRecentTasks(10);
  return tasks.length === 1;
});

test('Delete task', () => {
  const task = taskManager.getCurrentTask();
  if (!task) return false;
  
  const deleted = taskManager.deleteTask(task.id);
  return deleted === true && taskManager.getAllTasks().length === 0;
});

// Test 9: Multiple Tasks
console.log('\n9. Multiple Tasks');

test('Create multiple tasks', () => {
  taskManager.createTask('project-1', 'Task 1', 'Request 1', 'chatgpt');
  taskManager.createTask('project-1', 'Task 2', 'Request 2', 'gemini');
  taskManager.createTask('project-1', 'Task 3', 'Request 3', 'deepseek');
  
  const tasks = taskManager.getAllTasks();
  return tasks.length === 3;
});

test('Clear completed tasks', () => {
  const tasks = taskManager.getAllTasks();
  
  // Mark one as verified
  taskManager.updateTaskStatus(tasks[0].id, 'VERIFIED');
  
  // Clear completed
  taskManager.clearCompletedTasks();
  
  const remaining = taskManager.getAllTasks();
  return remaining.length === 2; // Only non-completed tasks remain
});

// Summary
console.log('\n=== Test Summary ===');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All Phase 4 tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some Phase 4 tests failed!');
  process.exit(1);
}
