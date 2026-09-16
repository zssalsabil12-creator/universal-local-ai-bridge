import React from 'react';
import { ContextPackage } from '../utils/contextEngine';

interface ContextPreviewProps {
  context: ContextPackage;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ContextPreview: React.FC<ContextPreviewProps> = ({
  context,
  onConfirm,
  onCancel,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="context-preview">
      <div className="context-preview-header">
        <h3>Context Preview</h3>
        <div className="context-stats">
          <span className="stat">
            <strong>{context.files.length}</strong> files
          </span>
          <span className="stat">
            <strong>{formatFileSize(context.totalSize)}</strong>
          </span>
          <span className="stat">
            <strong>~{context.estimatedTokens}</strong> tokens
          </span>
        </div>
      </div>

      <div className="context-preview-content">
        <div className="context-question">
          <strong>Question:</strong> {context.question}
        </div>

        <div className="context-files">
          <h4>Selected Files ({context.files.length})</h4>
          <ul>
            {context.files.map((file, index) => (
              <li key={index} className="context-file">
                <div className="file-header">
                  <span className="file-path">{file.path}</span>
                  <span className="file-relevance">
                    Relevance: {file.relevance.toFixed(2)}
                  </span>
                </div>
                <div className="file-reasons">
                  {file.reasons.map((reason, idx) => (
                    <span key={idx} className="reason-tag">
                      {reason}
                    </span>
                  ))}
                </div>
                {file.sections && file.sections.length > 0 && (
                  <div className="file-sections">
                    {file.sections.map((section, sIdx) => (
                      <div key={sIdx} className="code-section">
                        <div className="section-header">
                          Lines {section.startLine}-{section.endLine}
                        </div>
                        <pre className="section-content">
                          <code>{section.content}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {context.metadata.excludedFiles.length > 0 && (
          <div className="context-excluded">
            <h4>Excluded Files ({context.metadata.excludedFiles.length})</h4>
            <ul>
              {context.metadata.excludedFiles.slice(0, 10).map((file: string, index: number) => (
                <li key={index} className="excluded-file">
                  {file}
                </li>
              ))}
              {context.metadata.excludedFiles.length > 10 && (
                <li className="excluded-more">
                  ... and {context.metadata.excludedFiles.length - 10} more
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="context-metadata">
          <h4>Metadata</h4>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="label">Budget:</span>
              <span className="value">{context.metadata.budget}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Project Type:</span>
              <span className="value">{context.metadata.projectType}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Total Lines:</span>
              <span className="value">{context.metadata.totalLines}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="context-preview-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onConfirm}>
          Send to AI
        </button>
      </div>
    </div>
  );
};
