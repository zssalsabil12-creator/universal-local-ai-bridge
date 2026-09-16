import React from 'react';
import { Task, TaskStatus } from '../utils/taskManager';

interface TaskPanelProps {
  task: Task | null;
  onCancel: () => void;
}

const statusColors: Record<TaskStatus, string> = {
  NEW: '#6b7280',
  CONTEXT_READY: '#3b82f6',
  AI_ANALYSIS: '#8b5cf6',
  CHANGES_PROPOSED: '#f59e0b',
  REVIEW: '#f97316',
  APPROVED: '#10b981',
  APPLIED: '#059669',
  VERIFIED: '#047857',
  FAILED: '#ef4444',
  CANCELLED: '#6b7280',
};

const statusLabels: Record<TaskStatus, string> = {
  NEW: 'New Task',
  CONTEXT_READY: 'Context Ready',
  AI_ANALYSIS: 'AI Analyzing',
  CHANGES_PROPOSED: 'Changes Proposed',
  REVIEW: 'Review Changes',
  APPROVED: 'Approved',
  APPLIED: 'Applied',
  VERIFIED: 'Verified',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const TaskPanel: React.FC<TaskPanelProps> = ({ task, onCancel }) => {
  if (!task) {
    return (
      <div className="task-panel empty">
        <p>No active task</p>
      </div>
    );
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (start: number, end: number): string => {
    const duration = end - start;
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="task-panel">
      <div className="task-header">
        <div className="task-title">
          <h3>{task.title}</h3>
          <span
            className="task-status"
            style={{ backgroundColor: statusColors[task.status] }}
          >
            {statusLabels[task.status]}
          </span>
        </div>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="task-info">
        <div className="info-row">
          <span className="label">Project:</span>
          <span className="value">{task.projectName}</span>
        </div>
        <div className="info-row">
          <span className="label">AI Provider:</span>
          <span className="value">{task.provider}</span>
        </div>
        <div className="info-row">
          <span className="label">Started:</span>
          <span className="value">{formatTime(task.createdAt)}</span>
        </div>
        <div className="info-row">
          <span className="label">Duration:</span>
          <span className="value">
            {formatDuration(task.createdAt, task.updatedAt)}
          </span>
        </div>
      </div>

      <div className="task-question">
        <strong>Question:</strong>
        <p>{task.question}</p>
      </div>

      {task.selectedFiles.length > 0 && (
        <div className="task-files">
          <strong>Selected Files ({task.selectedFiles.length}):</strong>
          <ul>
            {task.selectedFiles.slice(0, 5).map((file, index) => (
              <li key={index}>{file}</li>
            ))}
            {task.selectedFiles.length > 5 && (
              <li>... and {task.selectedFiles.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {task.proposedChanges.length > 0 && (
        <div className="task-changes">
          <strong>Proposed Changes ({task.proposedChanges.length}):</strong>
          <ul>
            {task.proposedChanges.map((change, index) => (
              <li key={index} className={`change-${change.action}`}>
                <span className="change-action">{change.action}</span>
                <span className="change-path">{change.path}</span>
                {change.approved && <span className="change-approved">✓</span>}
                {change.applied && <span className="change-applied">✓</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {task.error && (
        <div className="task-error">
          <strong>Error:</strong>
          <p>{task.error}</p>
        </div>
      )}

      {task.result && (
        <div className="task-result">
          <strong>Result:</strong>
          <p>{task.result}</p>
        </div>
      )}

      <div className="task-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${getProgressPercentage(task.status)}%`,
              backgroundColor: statusColors[task.status],
            }}
          />
        </div>
      </div>
    </div>
  );
};

function getProgressPercentage(status: TaskStatus): number {
  const progress: Record<TaskStatus, number> = {
    NEW: 10,
    CONTEXT_READY: 25,
    AI_ANALYSIS: 50,
    CHANGES_PROPOSED: 65,
    REVIEW: 75,
    APPROVED: 85,
    APPLIED: 95,
    VERIFIED: 100,
    FAILED: 100,
    CANCELLED: 100,
  };
  return progress[status];
}
