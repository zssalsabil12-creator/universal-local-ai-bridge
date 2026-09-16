// Task Management System
// Manages the lifecycle of AI coding tasks

export type TaskStatus = 
  | 'NEW'
  | 'CONTEXT_READY'
  | 'AI_ANALYSIS'
  | 'CHANGES_PROPOSED'
  | 'REVIEW'
  | 'APPROVED'
  | 'APPLIED'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  provider: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  
  // Context
  question: string;
  selectedFiles: string[];
  contextSize: number;
  estimatedTokens: number;
  
  // Changes
  proposedChanges: FileChange[];
  approvedChanges: FileChange[];
  appliedChanges: FileChange[];
  
  // Result
  result?: string;
  error?: string;
}

export interface FileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  before?: string;
  after?: string;
  diff?: string;
  approved: boolean;
  applied: boolean;
}

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private currentTaskId: string | null = null;
  
  // Create a new task
  createTask(
    title: string,
    projectId: string,
    projectName: string,
    provider: string,
    question: string
  ): Task {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      projectId,
      projectName,
      provider,
      status: 'NEW',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      question,
      selectedFiles: [],
      contextSize: 0,
      estimatedTokens: 0,
      proposedChanges: [],
      approvedChanges: [],
      appliedChanges: [],
    };
    
    this.tasks.set(task.id, task);
    this.currentTaskId = task.id;
    
    return task;
  }
  
  // Get current task
  getCurrentTask(): Task | null {
    if (!this.currentTaskId) {
      return null;
    }
    return this.tasks.get(this.currentTaskId) || null;
  }
  
  // Get task by ID
  getTask(id: string): Task | null {
    return this.tasks.get(id) || null;
  }
  
  // Get all tasks
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  // Update task status
  updateTaskStatus(id: string, status: TaskStatus): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.status = status;
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Update task context
  updateTaskContext(
    id: string,
    selectedFiles: string[],
    contextSize: number,
    estimatedTokens: number
  ): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.selectedFiles = selectedFiles;
    task.contextSize = contextSize;
    task.estimatedTokens = estimatedTokens;
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Add proposed changes
  addProposedChanges(id: string, changes: FileChange[]): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.proposedChanges = changes;
    task.status = 'CHANGES_PROPOSED';
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Approve changes
  approveChanges(id: string, changePaths: string[]): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.approvedChanges = task.proposedChanges.filter(change => 
      changePaths.includes(change.path)
    );
    
    task.approvedChanges.forEach(change => {
      change.approved = true;
    });
    
    task.status = 'APPROVED';
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Mark changes as applied
  markChangesApplied(id: string, changePaths: string[]): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.appliedChanges = task.approvedChanges.filter(change => 
      changePaths.includes(change.path)
    );
    
    task.appliedChanges.forEach(change => {
      change.applied = true;
    });
    
    task.status = 'APPLIED';
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Set task result
  setTaskResult(id: string, result: string): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.result = result;
    task.status = 'VERIFIED';
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Set task error
  setTaskError(id: string, error: string): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.error = error;
    task.status = 'FAILED';
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Cancel task
  cancelTask(id: string): Task | null {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }
    
    task.status = 'CANCELLED';
    task.updatedAt = Date.now();
    
    return task;
  }
  
  // Delete task
  deleteTask(id: string): boolean {
    if (this.currentTaskId === id) {
      this.currentTaskId = null;
    }
    return this.tasks.delete(id);
  }
  
  // Get task history (for persistence)
  getTaskHistory(): Task[] {
    return this.getAllTasks().sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  // Clear completed tasks
  clearCompletedTasks(): void {
    const completedStatuses: TaskStatus[] = ['VERIFIED', 'FAILED', 'CANCELLED'];
    
    for (const [id, task] of this.tasks.entries()) {
      if (completedStatuses.includes(task.status)) {
        this.tasks.delete(id);
      }
    }
  }
}

// Global task manager instance
export const taskManager = new TaskManager();
