import React, { useState, useEffect } from 'react';
import { 
  Play, Square, CheckCircle, XCircle, Clock, 
  AlertTriangle, GitBranch, Terminal, ListChecks,
  RefreshCw, Settings, FileCode
} from 'lucide-react';
import { CommandExecutor, ExecutionResult, ProjectCommand } from '../utils/commandExecutor';
import { VerifyRunner, VerificationResult, VerificationType } from '../utils/verifyRunner';
import { GitManager, GitStatus } from '../utils/gitManager';

interface ExecutionPanelProps {
  projectRoot: string;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  projectRoot,
  onApprove,
  onCancel,
}) => {
  const [commandExecutor] = useState(() => new CommandExecutor(projectRoot));
  const [verifyRunner] = useState(() => new VerifyRunner(projectRoot, commandExecutor));
  const [gitManager] = useState(() => new GitManager(projectRoot));

  const [availableCommands, setAvailableCommands] = useState<ProjectCommand[]>([]);
  const [executionLog, setExecutionLog] = useState<ExecutionResult[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadProjectCommands();
    loadGitStatus();
  }, [projectRoot]);

  const loadProjectCommands = async () => {
    const commands = await commandExecutor.detectProjectCommands();
    setAvailableCommands(commands);
  };

  const loadGitStatus = async () => {
    const status = await gitManager.getStatus();
    setGitStatus(status);
  };

  const handleExecuteCommand = async (command: ProjectCommand) => {
    const requiresApproval = commandExecutor.requiresApproval(command.command, command.args);
    
    if (requiresApproval) {
      // Show approval dialog (in real implementation)
      console.log('Approval required for:', command);
      return;
    }

    const result = await commandExecutor.executeCommand(command.command, command.args, {
      approved: true,
    });

    setExecutionLog(prev => [result, ...prev]);
  };

  const handleRunVerification = async (type: VerificationType) => {
    const result = await verifyRunner.runVerification(type, { approved: true });
    
    setExecutionLog(prev => [{
      id: `verify-${Date.now()}`,
      command: result.command || type,
      args: [],
      workingDirectory: projectRoot,
      status: result.status === 'pass' ? 'completed' : 'failed',
      stdout: result.output || '',
      stderr: result.error || '',
      startTime: Date.now(),
      endTime: Date.now(),
      duration: result.duration,
      riskLevel: 'medium',
      approved: true,
      exitCode: result.exitCode,
    }, ...prev]);
  };

  const handleCancelExecution = (id: string) => {
    commandExecutor.cancelProcess(id);
    setRunningId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[riskLevel as keyof typeof colors]}`}>
        {riskLevel}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Execution
          </h2>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleRunVerification('test')}
            disabled={!verifyRunner.isConfigured('test')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm">Test</span>
          </button>
          <button
            onClick={() => handleRunVerification('build')}
            disabled={!verifyRunner.isConfigured('build')}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm">Build</span>
          </button>
          <button
            onClick={() => handleRunVerification('typecheck')}
            disabled={!verifyRunner.isConfigured('typecheck')}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm">Typecheck</span>
          </button>
          <button
            onClick={() => handleRunVerification('lint')}
            disabled={!verifyRunner.isConfigured('lint')}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm">Lint</span>
          </button>
        </div>
      </div>

      {/* Git Status */}
      {gitStatus && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Git Status
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-white">
                  {gitStatus.branch}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Modified:</span>
                <span className="ml-2 font-mono text-orange-600 dark:text-orange-400">
                  {gitStatus.modified.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Staged:</span>
                <span className="ml-2 font-mono text-green-600 dark:text-green-400">
                  {gitStatus.staged.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Untracked:</span>
                <span className="ml-2 font-mono text-blue-600 dark:text-blue-400">
                  {gitStatus.untracked.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Commands */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          Available Commands
        </h3>
        <div className="space-y-2">
          {availableCommands.map((cmd, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {cmd.command} {cmd.args.join(' ')}
                  </span>
                  {getRiskBadge(cmd.riskLevel)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {cmd.description}
                </p>
              </div>
              <button
                onClick={() => handleExecuteCommand(cmd)}
                className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Play className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Log */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Execution Log
        </h3>
        {executionLog.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Terminal className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No executions yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {executionLog.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {log.command} {log.args.join(' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(log.riskLevel)}
                    {log.duration && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {log.duration}ms
                      </span>
                    )}
                  </div>
                </div>
                {log.stdout && (
                  <pre className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto text-gray-900 dark:text-white">
                    {log.stdout}
                  </pre>
                )}
                {log.stderr && (
                  <pre className="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-x-auto text-red-900 dark:text-red-300 mt-2">
                    {log.stderr}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
