// Enhanced Task Manager for Developer Workflow
// Implements the full task lifecycle for AI coding tasks

export type TaskStatus = 
  | 'NEW'
  | 'ANALYZING'
  | 'CONTEXT_READY'
  | 'AI_RESPONSE'
  | 'CHANGES_PROPOSED'
  | 'REVIEW'
  | 'APPROVED'
  | 'APPLIED'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskFile {
  path: string;
  selected: boolean;
  pinned: boolean;
  relevance?: number;
  reason?: string;
}

export interface TaskChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  before?: string;
  after?: string;
  diff?: string;
  approved: boolean;
  applied: boolean;
  verified: boolean;
}

export interface ContextPackage {
  id: string;
  name: string;
  files: string[];
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeveloperTask {
  id: string;
  projectId: string;
  title: string;
  userRequest: string;
  provider: string;
  selectedFiles: TaskFile[];
  contextSummary: string;
  proposedChanges: TaskChange[];
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  contextPackages: string[]; // IDs of saved context packages
  memory?: string[]; // Relevant memory entries
  rollbackSnapshot?: {
    files: Map<string, string>;
    timestamp: number;
  };
}

export class DeveloperTaskManager {
  private tasks: Map<string, DeveloperTask> = new Map();
  private contextPackages: Map<string, ContextPackage> = new Map();
  private currentTaskId: string | null = null;

  // Create a new task
  createTask(
    projectId: string,
    title: string,
    userRequest: string,
    provider: string
  ): DeveloperTask {
    const task: DeveloperTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title,
      userRequest,
      provider,
      selectedFiles: [],
      contextSummary: '',
      proposedChanges: [],
      status: 'NEW',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      contextPackages: [],
      memory: [],
    };

    this.tasks.set(task.id, task);
    this.currentTaskId = task.id;

    return task;
  }

  // Get current task
  getCurrentTask(): DeveloperTask | null {
    if (!this.currentTaskId) return null;
    return this.tasks.get(this.currentTaskId) || null;
  }

  // Get task by ID
  getTask(id: string): DeveloperTask | null {
    return this.tasks.get(id) || null;
  }

  // Get all tasks
  getAllTasks(): DeveloperTask[] {
    return Array.from(this.tasks.values());
  }

  // Update task status
  updateTaskStatus(id: string, status: TaskStatus): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.status = status;
    task.updatedAt = Date.now();

    return task;
  }

  // Add selected files to task
  addSelectedFiles(id: string, files: TaskFile[]): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.selectedFiles = files;
    task.updatedAt = Date.now();

    return task;
  }

  // Pin a file (always include)
  pinFile(id: string, path: string): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    const file = task.selectedFiles.find(f => f.path === path);
    if (file) {
      file.pinned = true;
      task.updatedAt = Date.now();
    }

    return task;
  }

  // Unpin a file
  unpinFile(id: string, path: string): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    const file = task.selectedFiles.find(f => f.path === path);
    if (file) {
      file.pinned = false;
      task.updatedAt = Date.now();
    }

    return task;
  }

  // Set context summary
  setContextSummary(id: string, summary: string): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.contextSummary = summary;
    task.status = 'CONTEXT_READY';
    task.updatedAt = Date.now();

    return task;
  }

  // Add proposed changes
  addProposedChanges(id: string, changes: TaskChange[]): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.proposedChanges = changes;
    task.status = 'CHANGES_PROPOSED';
    task.updatedAt = Date.now();

    return task;
  }

  // Approve changes
  approveChanges(id: string, paths: string[]): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.proposedChanges.forEach(change => {
      if (paths.includes(change.path)) {
        change.approved = true;
      }
    });

    task.status = 'APPROVED';
    task.updatedAt = Date.now();

    return task;
  }

  // Reject changes
  rejectChanges(id: string, paths: string[]): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.proposedChanges.forEach(change => {
      if (paths.includes(change.path)) {
        change.approved = false;
      }
    });

    task.updatedAt = Date.now();

    return task;
  }

  // Mark changes as applied
  markChangesApplied(id: string, paths: string[]): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.proposedChanges.forEach(change => {
      if (paths.includes(change.path)) {
        change.applied = true;
      }
    });

    task.status = 'APPLIED';
    task.updatedAt = Date.now();

    return task;
  }

  // Mark changes as verified
  markChangesVerified(id: string, paths: string[]): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.proposedChanges.forEach(change => {
      if (paths.includes(change.path)) {
        change.verified = true;
      }
    });

    task.status = 'VERIFIED';
    task.updatedAt = Date.now();

    return task;
  }

  // Create rollback snapshot
  createRollbackSnapshot(id: string, files: Map<string, string>): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.rollbackSnapshot = {
      files,
      timestamp: Date.now(),
    };

    task.updatedAt = Date.now();

    return task;
  }

  // Rollback changes
  rollbackChanges(id: string): Map<string, string> | null {
    const task = this.tasks.get(id);
    if (!task || !task.rollbackSnapshot) return null;

    return task.rollbackSnapshot.files;
  }

  // Save context package
  saveContextPackage(
    name: string,
    files: string[],
    description: string
  ): ContextPackage {
    const pkg: ContextPackage = {
      id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      files,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.contextPackages.set(pkg.id, pkg);

    return pkg;
  }

  // Get context package
  getContextPackage(id: string): ContextPackage | null {
    return this.contextPackages.get(id) || null;
  }

  // Get all context packages
  getAllContextPackages(): ContextPackage[] {
    return Array.from(this.contextPackages.values());
  }

  // Update context package
  updateContextPackage(
    id: string,
    name?: string,
    files?: string[],
    description?: string
  ): ContextPackage | null {
    const pkg = this.contextPackages.get(id);
    if (!pkg) return null;

    if (name) pkg.name = name;
    if (files) pkg.files = files;
    if (description) pkg.description = description;
    pkg.updatedAt = Date.now();

    return pkg;
  }

  // Delete context package
  deleteContextPackage(id: string): boolean {
    return this.contextPackages.delete(id);
  }

  // Add context package to task
  addContextPackageToTask(taskId: string, packageId: string): DeveloperTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    if (!task.contextPackages.includes(packageId)) {
      task.contextPackages.push(packageId);
      task.updatedAt = Date.now();
    }

    return task;
  }

  // Remove context package from task
  removeContextPackageFromTask(taskId: string, packageId: string): DeveloperTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.contextPackages = task.contextPackages.filter(id => id !== packageId);
    task.updatedAt = Date.now();

    return task;
  }

  // Add memory to task
  addMemoryToTask(taskId: string, memory: string[]): DeveloperTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.memory = memory;
    task.updatedAt = Date.now();

    return task;
  }

  // Cancel task
  cancelTask(id: string): DeveloperTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

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

  // Get tasks by status
  getTasksByStatus(status: TaskStatus): DeveloperTask[] {
    return this.getAllTasks().filter(task => task.status === status);
  }

  // Get recent tasks
  getRecentTasks(limit: number = 10): DeveloperTask[] {
    return this.getAllTasks()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
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

// Global instance
export const developerTaskManager = new DeveloperTaskManager();
